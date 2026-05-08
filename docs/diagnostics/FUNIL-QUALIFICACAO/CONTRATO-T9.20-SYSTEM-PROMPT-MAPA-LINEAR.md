---
# CONTRATO T9.20 — SYSTEM_PROMPT: Separação de responsabilidades + contexto dinâmico estruturado

**Data:** 2026-05-08
**Tipo:** PR-IMPL contratual
**Arquivo alvo:** src/llm/client.ts
**Risco:** baixo — apenas strings, zero schema, zero migration, rollback em 1 linha

---

## Problema

O SYSTEM_PROMPT atual contém o mapa do funil por stage (F1: discovery → colete nome/nacionalidade).
O LLM vê `stage_current=discovery` no contexto dinâmico e age baseado no mapa interno,
ignorando o `next_objective` emitido pelo Core. Resultado: loop — o LLM repete perguntas
já respondidas porque o stage ainda é `discovery` mesmo após o Core ter avançado internamente.

## Causa raiz

Conflito entre duas fontes de instrução:
- SYSTEM_PROMPT diz: "em discovery, colete nome e nacionalidade"
- next_objective diz: "pergunte processo (solo/conjunto)"
- LLM prioriza o SYSTEM_PROMPT por estar no início do contexto

## Solução

### Princípio
Separar responsabilidades de forma que o LLM nunca precise inferir onde está:

- SYSTEM_PROMPT_BASE → quem é a Enova, tom, postura, regras de negócio MCMV
- buildDynamicSystemPrompt → onde está AGORA, o que fazer NESTE TURNO

O mapa de funil por stage é REMOVIDO do SYSTEM_PROMPT_BASE.
O contexto dinâmico passa a incluir um bloco "SITUAÇÃO ATUAL" estruturado.

### SYSTEM_PROMPT_BASE — o que FICA

Manter integralmente:
- MISSÃO e descrição do papel da Enova
- EM CADA TURNO — regras de comportamento
- REGRAS INVIOLÁVEIS
- TOM E POSTURA
- Todas as REGRAS DE NEGÓCIO (RNM, estado civil, composição, renda, dependentes, documentos, restrição, visita, etc.)
- DÚVIDAS FORA DE HORA
- FECHAMENTO DE CONVERSA

### SYSTEM_PROMPT_BASE — o que SAI

Remover completamente a seção:
"FUNIL MCMV — SEQUÊNCIA MACRO: F1 Topo... F2 Perfil civil... F3... F4... F5... F10..."

Essa seção é a causa do conflito. O LLM não precisa saber a sequência de stages —
o Core já cuida disso. O LLM só precisa executar o objetivo atual.

### buildDynamicSystemPrompt — novo bloco "SITUAÇÃO ATUAL"

Substituir o bloco de contexto atual por estrutura mais clara:

```typescript
// BLOCO 1: Objetivo atual — PRIMEIRO, logo após SYSTEM_PROMPT_BASE
lines.push('');
lines.push('=== SUA TAREFA NESTE TURNO ===');
lines.push(context.next_objective);
lines.push('REGRA ABSOLUTA: execute apenas esta tarefa. Uma pergunta só. Não antecipe.');
lines.push('');

// BLOCO 2: Estado atual do atendimento
lines.push('=== SITUAÇÃO ATUAL DO ATENDIMENTO ===');

// Facts já coletados — o LLM sabe o que JÁ TEM
const factEntries = Object.entries(context.facts_summary)
  .filter(([k]) => !k.startsWith('_'));

if (factEntries.length > 0) {
  lines.push('Já coletado:');
  for (const [k, v] of factEntries.slice(0, 12)) {
    lines.push(`  ✓ ${k}: ${v}`);
  }
} else {
  lines.push('Ainda não coletado nenhum dado do cliente.');
}

// Histórico recente — para continuidade natural
if (context.recent_turns && context.recent_turns.length > 0) {
  lines.push('');
  lines.push('Últimas mensagens:');
  for (const turn of context.recent_turns.slice(0, 3)) {
    const label = turn.role === 'user' ? 'Cliente' : 'Enova';
    lines.push(`  ${label}: ${turn.content.slice(0, 150)}`);
  }
}

lines.push('');
lines.push('=== FIM DO CONTEXTO ===');
```

### Ordem final do prompt dinâmico
[SYSTEM_PROMPT_BASE — regras de negócio, tom, postura]
=== SUA TAREFA NESTE TURNO ===
{next_objective}
REGRA ABSOLUTA: execute apenas esta tarefa. Uma pergunta só. Não antecipe.
=== SITUAÇÃO ATUAL DO ATENDIMENTO ===
Já coletado:
✓ nome_completo: Bruno Vasques
✓ nacionalidade: brasileiro
✓ customer_goal: comprar_imovel
Últimas mensagens:
Cliente: solteiro
Enova: Entendido! Você pretende comprar sozinho ou com alguém?
=== FIM DO CONTEXTO ===

## Invariantes

- LLM continua soberano da fala — SYSTEM_PROMPT_BASE instrui, não roteiriza
- Core continua soberano de stage, facts e gates — zero alteração no Core
- Facts internos (_*) filtrados do prompt
- Nenhum dado sensível (CPF, renda bruta) exposto
- Limite de 8000 chars preservado
- callLlm, LlmContext, LLM_MODEL, LLM_MAX_TOKENS — sem alteração

## Escopo da PR

Arquivo: src/llm/client.ts
Mudanças:
1. SYSTEM_PROMPT_BASE — remover seção "FUNIL MCMV — SEQUÊNCIA MACRO"
2. buildDynamicSystemPrompt — substituir bloco de contexto pelo novo estruturado acima

FORA DE ESCOPO — NÃO tocar:
- src/core/ (qualquer arquivo)
- src/supabase/
- src/meta/canary-pipeline.ts
- panel-nextjs/
- wrangler.toml
- schema/

## Critério de sucesso

Após deploy, teste:
1. "Oi" → Enova se apresenta e pergunta se conhece MCMV
2. "Sim" → pergunta nome completo
3. "Bruno Vasques" → pergunta nacionalidade
4. "Brasileiro" → pergunta estado civil
5. "Solteiro" → pergunta processo (sozinho ou com alguém)
6. "Sozinho" → pergunta regime de trabalho
7. "CLT" → pergunta renda

Se todos os 7 turnos avançarem sem loop → T9.20 aprovado.

## Rollback

```bash
git revert {commit}
```

Seguro: 1 arquivo, strings, zero schema, zero migration, zero flags.
