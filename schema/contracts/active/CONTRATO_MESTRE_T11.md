# CONTRATO T11 — REFUNDAÇÃO DO CORE PARA FUNIL COMPLETO

**Status:** ATIVO
**Aberto em:** 2026-05-09
**Predecessor:** T9 (LLM+Funil Runtime, em estabilização final)
**Sucessor:** T12 (operação canary real com leads reais — só após T11 fechado)

---

## 0. Como usar este contrato (instruções para qualquer aba do Claude)

Este documento é a **única fonte de verdade** do projeto Enova-2. Qualquer Claude que abrir uma nova aba, ler este contrato, e poderá retomar de onde parou sem perder contexto.

**Regra de ouro:**
1. Ler este documento INTEIRO antes de qualquer ação.
2. Olhar a seção "Estado atual do trabalho" — diz exatamente em que PR estamos.
3. Olhar a seção "Plano executivo" — diz a sequência de PRs e dependências.
4. **Nunca pular PR.** A ordem é estrita.
5. Cada PR tem selo: 🤖 LOOP (Code executa sozinho, agente mergeia) ou 👤 REVIEW (Bruno aprova antes do merge).
6. Telemetria estrutural antes de qualquer fix mecânico (ver §6).

---

## 1. Objetivo macro de T11

Levar a Enova-2 ao **funil completo de qualificação MCMV** capaz de:

1. **F1 (Topo)** — apresentar Enova, coletar nome, nacionalidade, RNM/validade
2. **F2 (Civil)** — estado civil, composição (solo/conjunto/familiar), P3 cascading, dependentes
3. **F3 (Renda)** — regime trabalho, renda, CTPS 36m, IR autônomo, multi-renda, P2 (cônjuge), P3 (familiar) com renda própria
4. **F4 (Elegibilidade)** — restrição, regularização, averbação (divórcio), inventário (viúvo), inviabilidade
5. **F5 (Docs+Visita+Handoff)** — coleta documental, montagem de dossiê, envio ao correspondente, retorno, agendamento de visita pós-aprovação, follow-up por silêncio com convite presencial

Ao final de T11, o sistema atende lead real ponta-a-ponta. **Sem T11 fechado, não vai pra prod.**

---

## 2. Princípios canônicos (não negociáveis)

1. **Core soberano da estrutura, LLM soberano da fala.** Core decide stage, gate, fact, next_objective. LLM decide como falar. Nunca cruzar.
2. **`next_objective` é SEMPRE código curto opaco.** Strings PT só existem em `SEMANTIC_MAP` (camada de tradução para LLM). Violação dessa regra = bug arquitetural.
3. **Telemetria estrutural antes de fix.** Toda mudança de comportamento exige telemetria que mostre o ramo executado. Sem isso, não se mexe.
4. **Diagnóstico canônico antes de qualquer alteração.** Quem ler runtime vê exatamente o que aconteceu. Adivinhação proibida.
5. **Códigos opacos em todos os extractors.** Comparações com strings PT literais são proibidas. Se o guard precisa comparar com string PT, o pipeline está errado.
6. **Cada PR tem critério objetivo de pronto.** Smokes + E2E + telemetria. Sem critério, PR não fecha.
7. **Sem reply_text mecânico.** Em nenhum arquivo do Core pode existir texto que vai virar fala ao cliente.
8. **Fact P3 é separado do fact do lead.** `estado_civil_p3`, `renda_p3`, etc. Nunca sobrescrever campo do lead com dado de familiar.

---

## 3. Estado atual do trabalho

**Última PR mergeada:** T9.29 — diagnóstico runtime do `pendingObjective` (campo adicionado em log)

**Score E2E atual:** 29/45 PASS (16 FAILs)

**Diagnóstico canônico fechado:** sim, ver `MAPA_FUNIL_E_DIAGNOSTICO_RAIZ.md`. Causa raiz dos 16 FAILs identificada: anomalia em `TOPO_NEXT_OBJECTIVES.AVANCAR_PARA_CIVIL` (única string PT num sistema de códigos curtos) + guards literais T9.21–T9.28 que não disparam para códigos curtos.

**Próxima PR autorizada:** T11.1 (telemetria estrutural — ver §5)

**Branches abertos:** nenhum (mergeada a T9.29 e fechada).

---

## 4. Visão geral das PRs (29 PRs no total)

> Cada PR tem sub-contrato detalhado em `schema/contracts/active/T11/T11.X-NOME.md` (a serem criados pelo Code junto com cada execução).

### Fase A — Estabilização do Core atual (3 PRs, ~2 dias)

| PR | Nome | Selo | Critério de pronto |
|---|---|---|---|
| **T11.1** | Telemetria estrutural completa nos logs | 🤖 LOOP | Smokes 124/124, todos os campos da §6 presentes nos logs |
| **T11.2** | Unificação `AVANCAR_PARA_CIVIL` para código curto | 🤖 LOOP | Smokes + E2E mantém score atual ou melhora |
| **T11.3** | Limpeza de guards literais nos extractors | 👤 REVIEW | E2E ≥ 41/45 nos 8 cenários atuais |

### Fase B — Refundação arquitetural (4 PRs, ~1 semana)

| PR | Nome | Selo | Critério |
|---|---|---|---|
| **T11.4** | Nomenclatura única `next_objective` (códigos opacos canonizados) | 🤖 LOOP | Catálogo completo em `next-objective-catalog.ts`; smokes valida cobertura |
| **T11.5** | Schema Supabase para 45 stages + facts P2/P3/multi-renda | 👤 REVIEW | Migration aplicada em branch dev; validação de tipos |
| **T11.6** | Tipos canônicos (StageId expandido para 45 stages legados) | 🤖 LOOP | TypeScript compila; cobertura em types.ts |
| **T11.7** | Engine v2 — orquestração baseada em fatos, não em stage rígido | 👤 REVIEW | Smokes + cenários sintéticos passam |

### Fase C — F1 completo (2 PRs, ~3 dias)

| PR | Nome | Selo | Critério |
|---|---|---|---|
| **T11.8** | F1: parser+gates+extractor unificados (7 stages) | 🤖 LOOP | E2E F1 cenários 1, 5, 6 PASS 100% |
| **T11.9** | F1: smoke completo + diagnóstico cobertura | 🤖 LOOP | Cobertura 100% dos 7 stages F1 |

### Fase D — F2 completo (3 PRs, ~5 dias)

| PR | Nome | Selo | Critério |
|---|---|---|---|
| **T11.10** | F2: estado civil + processo + composition_actor | 🤖 LOOP | E2E cenários 2, 3 PASS |
| **T11.11** | F2: P3 cascading + estado civil P3 + dependentes | 👤 REVIEW | E2E cenário 4 PASS; regras de cônjuge obrigatório |
| **T11.12** | F2: financiamentos_conjunto + confirmar_avo_familiar | 👤 REVIEW | Cenários sintéticos novos cobrem casos do T5 |

### Fase E — F3 completo (5 PRs, ~2 semanas)

| PR | Nome | Selo | Critério |
|---|---|---|---|
| **T11.13** | F3: regime + renda + CTPS 36m | 🤖 LOOP | E2E cenários 1, 8 PASS |
| **T11.14** | F3: autônomo IR + multi-renda P1 | 🤖 LOOP | E2E cenário 7 PASS + sintéticos |
| **T11.15** | F3: P2 (cônjuge) com regime + renda + CTPS | 👤 REVIEW | Sintéticos casado_civil → conjunto |
| **T11.16** | F3: P3 (familiar) com regime + renda | 👤 REVIEW | Sintéticos composição com renda P3 |
| **T11.17** | F3: composição renda mista + faixas subsídio | 👤 REVIEW | `derived_subsidy_band_hint` calculado corretamente |

### Fase F — F4 completo (3 PRs, ~1 semana)

| PR | Nome | Selo | Critério |
|---|---|---|---|
| **T11.18** | F4: restrição crédito + regularização | 🤖 LOOP | Sintéticos restrição hard + soft |
| **T11.19** | F4: averbação (divorciado) + inventário (viúvo) | 👤 REVIEW | LSF do T5 fechado com facts novos |
| **T11.20** | F4: fim_inelegivel + porta aberta | 🤖 LOOP | Encerramento elegante por inviabilidade |

### Fase G — F5 completo (5 PRs, ~2 semanas)

| PR | Nome | Selo | Critério |
|---|---|---|---|
| **T11.21** | F5: coleta documental por categoria | 👤 REVIEW | Identidade, renda, residência, CTPS |
| **T11.22** | F5: montagem de dossiê + perfil cliente | 👤 REVIEW | Estrutura JSON canônica; envio simulado |
| **T11.23** | F5: handoff ao correspondente (envio + retorno) | 👤 REVIEW | Integração simulada com retorno aprovado/recusado |
| **T11.24** | F5: agendamento de visita pós-aprovação | 🤖 LOOP | Stage `visit` + `fact_visit_interest` |
| **T11.25** | F5: follow-up por silêncio + convite presencial | 👤 REVIEW | Trigger temporal + escalonamento |

### Fase H — Integração e prod (4 PRs, ~1 semana)

| PR | Nome | Selo | Critério |
|---|---|---|---|
| **T11.26** | E2E expandido para 45+ cenários (cobre todos os 45 stages) | 🤖 LOOP | Script PowerShell atualizado |
| **T11.27** | Matriz de paridade T5 (legado vs novo) | 👤 REVIEW | T5_MATRIZ_PARIDADE preenchida |
| **T11.28** | Shadow mode + sandbox controlado | 👤 REVIEW | Plano de cutover documentado |
| **T11.29** | Readiness G5 + cutover prod | 👤 REVIEW | Bloco E completo; decisão final |

**Total: 29 PRs, estimativa realista 2–3 meses focados (média 1 PR/dia útil em loop, 2–3 dias/PR para review).**

---

## 5. Sequência das primeiras 3 PRs (detalhe imediato)

### T11.1 — Telemetria estrutural completa
**Selo:** 🤖 LOOP
**Branch:** `feat/t11.1-telemetria-estrutural`
**Arquivos a alterar:** `src/meta/canary-pipeline.ts` (logs), `src/core/text-extractor.ts` (campos diagnósticos)
**Diff alvo:** ~30 linhas, adições puras, zero alteração comportamental

**Campos a adicionar:**

No log `text_extractor.result`:
- `pending_objective_format`: `'code' | 'pt_string' | 'null'`
- `extractor_branch_taken`: string identificando o ramo que disparou
- `extractor_branch_skipped`: array de ramos pulados com motivo
- `input_text_normalized`: texto após normalização
- `keyword_matches`: array de keywords detectadas

No log `core.decision`:
- `next_objective_emitted`: valor bruto pré-persistência
- `next_objective_format`: `'code' | 'pt_string'`
- `gate_id_active`: gate que decidiu
- `gate_decision_reason`: motivo legível

Novo log `pipeline.invariant_check`:
- Valida que `next_objective_emitted` está em formato `code`. Qualquer `pt_string` gera `invariant_violation: true` no log.

**Critério de pronto:**
- TypeScript compila
- 124/124 smokes passam
- Em 1 turno real, todos os campos novos presentes no log
- Doc `PR-T11.1-review.md` criada

### T11.2 — Unificação `AVANCAR_PARA_CIVIL` para código curto
**Selo:** 🤖 LOOP
**Branch:** `feat/t11.2-avancar-civil-codigo`
**Arquivos:** `src/core/topo-rules.ts` (1 linha), `src/core/semantic-next-objective.ts` (mapeamento), `src/core/text-extractor.ts` (atualizar guards), smokes

**Mudanças:**
1. Em `topo-rules.ts`: `AVANCAR_PARA_CIVIL: 'avancar_para_civil'` (era string PT 70 chars)
2. Em `semantic-next-objective.ts`: adicionar entrada `'avancar_para_civil': 'Perguntar APENAS o estado civil...'`
3. Em `text-extractor.ts`: substituir comparações com a string PT antiga pela nova chave de código.

**Critério de pronto:**
- 124/124 smokes
- E2E ≥ 29/45 (não regredir)
- Telemetria T11.1 mostra `pending_objective_format: 'code'` em 100% dos turnos

### T11.3 — Limpeza dos guards literais
**Selo:** 👤 REVIEW (porque mexe em comportamento de extractor)
**Branch:** `feat/t11.3-limpeza-guards-literais`
**Arquivos:** `src/core/text-extractor.ts`

**Mudanças:**
- Identificar todas as comparações `pendingObjective === 'string PT...'` adicionadas em T9.21–T9.28
- Remover, mantendo apenas comparações com códigos curtos
- Para cada remoção, validar com smoke novo que o ramo correto continua disparando

**Critério de pronto:**
- 124/124 smokes
- E2E ≥ 41/45 (volta para o nível pré-regressão)
- Doc `PR-T11.3-review.md` lista cada guard removido com justificativa

---

## 6. Telemetria estrutural canônica (referência permanente)

Todo PR a partir de T11.1 deve preservar e estender estes campos. Remover qualquer um deles é violação contratual.

### Logs obrigatórios em todo turno:

```
meta.prod.webhook.received        — entrada da requisição
facts_persistence.read            — leitura do Supabase
text_extractor.result             — extração de facts
short_memory.built                — memória curta para LLM
core.facts_received               — entrada do Core
facts_persistence.write           — gravação Supabase
core.decision                     — decisão estrutural
pipeline.invariant_check          — validação de formato (NOVO T11.1)
meta.prod.llm.gate                — autorização LLM
llm.context.built                 — contexto enviado ao LLM
meta.prod.llm.result              — resposta LLM
meta.prod.outbound.gate           — autorização envio
meta.prod.webhook.final           — fim da requisição
```

### Princípio: cada FAIL no E2E aponta direto pelo log. Zero adivinhação.

---

## 7. Sobre o Agente PowerShell de Bruno

Funções essenciais do agente para trabalhar comigo (Claude) em loop:

1. **`run-e2e`** → executa `scripts/enova-e2e-test.ps1` e me devolve resultado bruto
2. **`tail-and-test`** → roda `wrangler tail` em paralelo com E2E, captura logs, me devolve consolidado
3. **`read-file <path>`** → lê arquivo do repo e me mostra
4. **`run-smokes [target]`** → roda smokes específicos ou todos
5. **`show-diff <branch>`** → diff da PR pendente
6. **`deploy`** → executa `npx wrangler deploy` (só após autorização explícita)
7. **`query-supabase <sql>`** → executa SQL read-only
8. **`approve-merge <pr>`** → mergeia PR após Bruno autorizar (não toma decisão sozinho)

**Workflow esperado:**
1. Claude monta sub-contrato T11.X + prompt para Code
2. Bruno cola prompt no Code do terminal → Code abre PR
3. Code chama o agente para validar (smokes + E2E)
4. Agente me leva o review da PR
5. Eu reviso, devolvo aprovação ou ajuste
6. Se 🤖 LOOP: agente mergeia direto e segue para próxima PR
7. Se 👤 REVIEW: agente espera Bruno autorizar antes de mergear

**Decisões sempre humanas (agente nunca decide):**
- Mergear PR com 👤 REVIEW
- Aprovar mudança de schema Supabase
- Definir regra de negócio nova
- Autorizar deploy em prod
- Fechar fase (B, C, D, E, F, G, H)

---

## 8. Critérios de retomada (qualquer aba do Claude)

Quando uma nova aba abrir e o usuário disser "continue de onde paramos":

1. Ler este contrato inteiro
2. Olhar §3 "Estado atual do trabalho"
3. Olhar a próxima PR autorizada
4. Pedir ao agente PowerShell: status do branch atual (existe? mergeado?)
5. Se PR pendente: revisar e seguir
6. Se PR mergeada: avançar para próxima
7. Confirmar com Bruno antes de iniciar PR de selo 👤 REVIEW

---

## 9. Anti-padrões proibidos em T11 (lições de T9)

1. **Adicionar guard sem ver runtime primeiro.** Telemetria mostra o ramo que disparou, depois fix.
2. **Comparar string PT literal em extractor.** Sempre código curto.
3. **Promessa de "1 linha resolve" sem ver código antes.** Code investiga, depois propõe.
4. **PR que mexe em mais de 1 conceito.** Cada PR uma ideia. Mistura = retrabalho.
5. **Smoke verde com E2E vermelho ignorado.** E2E real é juiz; se diverge do smoke, o smoke está errado.
6. **Ignorar telemetria nova.** Se T11.X adiciona log, T11.X+1 deve usar.

---

## 10. Bloco E (evidências) — preencher ao fechar cada PR

```
PR: T11.X
Status: MERGEADO
Score E2E antes: XX/45
Score E2E depois: YY/45
Smokes: ZZ/ZZ PASS
Telemetria nova adicionada: [lista]
Telemetria nova consumida: [lista]
Próxima PR autorizada: T11.(X+1)
```

---

## 11. Glossário rápido (para retomada de contexto)

- **Core mecânico:** decide stage/gate/fact/next_objective. Sem fala.
- **LLM:** soberano da fala, recebe `next_objective` semântico.
- **Stage:** fase do funil (`discovery`, `qualification_civil`, etc — 45 ao final de T11)
- **Gate:** condição que avalia avanço/bloqueio do stage
- **Fact:** dado coletado do lead (ex: `estado_civil`, `nacionalidade`, `renda_principal`)
- **Pendingobjective:** próximo objetivo persistido entre turnos (sempre código curto)
- **P1/P2/P3:** lead principal / cônjuge / familiar de composição
- **F1–F5:** fatias funcionais do T5 (topo / civil / renda / elegibilidade / docs)
- **LSF:** lacuna de schema futura (T5 declara, falta implementar)
- **Selo 🤖 LOOP:** Code+agente executam sem intervenção
- **Selo 👤 REVIEW:** Bruno revisa antes de merge

---

## 12. O que falta confirmar antes de iniciar T11.1

(Não são perguntas técnicas — são decisões de negócio que preciso de Bruno.)

**Pergunta 1 (negócio):** No follow-up por silêncio (T11.25), depois de quantos dias sem resposta a Enova convida pro presencial? E quantos dias entre tentativas?

**Pergunta 2 (escopo):** Quando o correspondente recusar (T11.23), a Enova encerra ou tenta caminho alternativo (composição diferente, regularização)?

Ambas podem ficar em aberto agora — só preciso da resposta antes de chegar nessas PRs específicas.

---

**FIM DO CONTRATO MESTRE T11.**

Sub-contratos detalhados em `schema/contracts/active/T11/T11.X-NOME.md` serão criados pelo Code junto a cada PR.
