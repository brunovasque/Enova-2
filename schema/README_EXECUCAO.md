# README_EXECUCAO — Ordem de execução documental

## Protocolo de execução
Antes de executar qualquer tarefa, leia e siga o `CODEX_WORKFLOW.md`.
O `CODEX_WORKFLOW.md` define o fluxo obrigatório de 16 etapas: leitura canônica → leitura de contratos → estado herdado → classificação → vínculo contratual → checagem de desvio → execução → estado entregue → atualização viva → closeout (se aplicável) → resposta final.

**O CODEX_WORKFLOW é a lei operacional única entre PRs. Nenhuma etapa pode ser pulada.**

## Ordem de leitura obrigatória
1. `A00_PLANO_CANONICO_MACRO.md`
2. `A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
3. `A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
4. `CODEX_WORKFLOW.md` — protocolo de execução (16 etapas)
5. `contracts/_INDEX.md` — **índice canônico de contratos ativos por frente**
6. Contrato ativo da frente (em `contracts/active/`, formato em `CONTRACT_SCHEMA.md`)
7. `contracts/CONTRACT_EXECUTION_PROTOCOL.md` — **protocolo de execução contratual**
8. `contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — **protocolo de encerramento de contrato**
9. Status vivo da frente ativa (`status/<FRENTE>_STATUS.md`)
10. Último handoff da frente ativa (`handoffs/<FRENTE>_LATEST.md`)
11. `legacy/INDEX_LEGADO_MESTRE.md` — índice operacional do legado mestre unificado
12. `legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos aplicáveis à frente ativa
## Precedência documental
**A00 > A01 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato ativo da frente > documentos legados aplicáveis**

Em caso de conflito, prevalece o nível mais alto da cadeia acima.

## Classificação de tarefa (obrigatória em toda tarefa)
Toda tarefa deve ser classificada em uma das classes canônicas definidas em `TASK_CLASSIFICATION.md`:
- `contratual` — dentro do contrato ativo
- `governança` — cria/atualiza governança e documentação operacional
- `fora_de_contrato` — necessária mas fora do contrato ativo (declarar justificativa)
- `correcao_incidental` — correção cirúrgica acoplada à tarefa em andamento
- `hotfix` — correção urgente e crítica
- `diagnostico` — somente leitura e análise

Tarefa não classificada = tarefa não conforme.

## Estado herdado e estado entregue (obrigatórios)
Toda tarefa deve declarar explicitamente:
- **ESTADO HERDADO** (antes de executar): última PR relevante, o que ela fechou, o que não fechou, contrato ativo, item do A01, justificativa desta tarefa.
- **ESTADO ENTREGUE** (ao final): o que foi feito, o que foi fechado, o que continua pendente, se o próximo passo foi alterado, arquivos vivos atualizados.

Ver formato completo em `CODEX_WORKFLOW.md` seções 4 e 5.

## Contrato ativo (obrigatório em toda nova frente)
Toda nova frente deve declarar explicitamente:
- `WORKFLOW_ACK: ok`
- qual contrato está ativo (caminho em `schema/contracts/active/`);
- qual item do A01 está sendo executado;
- qual vínculo com A02 e com os legados aplicáveis.

Todo contrato segue o formato definido em `CONTRACT_SCHEMA.md`.

## Governança contratual

O repositório opera por contrato ativo:
- `schema/contracts/_INDEX.md` — índice canônico: qual contrato está ativo em cada frente
- `schema/contracts/active/` — contratos ativos (1 por frente, máximo)
- `schema/contracts/archive/` — contratos encerrados e arquivados
- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — como uma PR executa um recorte do contrato ativo
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` — como um contrato encerra formalmente

**Regras fundamentais:**
- Cada frente tem no máximo 1 contrato ativo por vez
- PR de execução não altera contrato silenciosamente
- Desvio de contrato é condição de parada
- Contrato só encerra via protocolo formal
- Macro não pode ser traído por micro execução

## Contexto vivo do repositório

O repo mantém memória operacional persistida em:
- `schema/status/` — status vivo por frente (formato em `STATUS_SCHEMA.md`)
- `schema/handoffs/` — handoff persistido por frente (formato em `HANDOFF_SCHEMA.md`)
- `schema/contracts/` — contratos ativos e arquivados (índice em `contracts/_INDEX.md`, protocolos em `contracts/CONTRACT_EXECUTION_PROTOCOL.md` e `contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`)
- `schema/legacy/` — legado mestre unificado (índice em `legacy/INDEX_LEGADO_MESTRE.md`, conteúdo em `legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`)
- `schema/source/` — PDF mestre original (`LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`)

Para saber o estado de qualquer frente: consultar `schema/status/_INDEX.md`.
Para retomar qualquer frente: consultar `schema/handoffs/_INDEX.md`.
Para saber qual contrato está ativo: consultar `schema/contracts/_INDEX.md`.
Para saber quais legados ler: consultar `schema/legacy/INDEX_LEGADO_MESTRE.md`.

## Pacote mínimo para abertura de nova aba/frente
Nenhuma nova aba/frente inicia sem o pacote mínimo:
- Handoff da frente (com estado herdado preenchido)
- A00
- A01
- A02
- CODEX_WORKFLOW.md
- TASK_CLASSIFICATION.md
- Status vivo da frente
- Legados aplicáveis

## Regra de atualização viva (obrigatória ao final de qualquer tarefa)
Ao final de QUALQUER tarefa, independente de ser contratual ou fora de contrato:
1. Atualizar o status vivo da frente (`schema/status/<FRENTE>_STATUS.md`) — incluindo classe da última tarefa e pendência remanescente herdada.
2. Atualizar o handoff da frente (`schema/handoffs/<FRENTE>_LATEST.md`) — com o que a PR anterior fechou/não fechou, o que esta PR fechou/não fechou.
3. Confirmar o item do A01 atendido.
4. Declarar o próximo passo autorizado (preservado ou alterado).
5. Se `fora_de_contrato`: registrar justificativa e impacto no próximo passo.

## Regra de continuidade entre PRs
Toda PR deve descrever:
- De qual PR ela continua.
- O que herdou.
- O que resolveu do herdado.
- O que permanece aberto.

O repositório é a única fonte de verdade sobre o estado da frente — não a conversa.

---

## Protocolo de dados persistidos (Supabase) — obrigatório em toda tarefa

Toda tarefa deve declarar explicitamente no ESTADO HERDADO e no ESTADO ENTREGUE:

```
Mudanças em dados persistidos (Supabase): nenhuma
```
ou
```
Mudanças em dados persistidos (Supabase): sim
  [campos obrigatórios conforme DATA_CHANGE_PROTOCOL.md seção 4.2]
```

Esta declaração é obrigatória **em toda tarefa**, qualquer que seja a classe.  
Ausência = tarefa não conforme.

**Nenhuma mudança em tabela, coluna, índice, constraint ou relacionamento do Supabase pode acontecer sem declaração prévia, aprovação e rastreabilidade total.**

Ver `schema/DATA_CHANGE_PROTOCOL.md` para o protocolo completo:
- Tipos canônicos de mudança
- Campos obrigatórios quando `sim`
- Regra de parada
- Regra de rollback e compatibilidade retroativa
- O que é proibido
- Exemplos

---

## Protocolo de permissões Cloudflare — obrigatório em tarefas de infra/deploy/bindings

Toda tarefa que passe a usar, configurar, alterar ou depender de qualquer recurso Cloudflare deve declarar explicitamente no ESTADO HERDADO e no ESTADO ENTREGUE:

```
Permissões Cloudflare necessárias: nenhuma adicional
```
ou
```
Permissões Cloudflare necessárias: sim
  [campos obrigatórios conforme CLOUDFLARE_PERMISSION_PROTOCOL.md seção 4.2]
```

Esta declaração é obrigatória **em toda tarefa**, qualquer que seja a classe.
Ausência = tarefa não conforme.

**Recursos cobertos:** Workers Scripts, Workers Routes, KV, R2, D1, Queues, Service Bindings, Secrets, Vars de deploy, Observability e qualquer outro recurso Cloudflare que a PR passe a usar.

**Falha futura de deploy, binding ou recurso pode ser causada por permissão insuficiente do token Cloudflare.** O agente deve avisar preventivamente — nunca deixar esse risco implícito.

Ver `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` para o protocolo completo:
- Escopo completo de recursos cobertos
- Campos obrigatórios quando `sim`
- Regra de parada
- Regra de escopo mínimo do token
- Regra de aviso preventivo
- O que é proibido
- Exemplos

---

## Protocolo de economia de request — obrigatório em toda tarefa

Toda tarefa, PR e automação deve seguir `schema/REQUEST_ECONOMY_PROTOCOL.md`.

Princípios:
- **Escopo fechado antes de executar.** Nenhuma investigação livre sem objetivo declarado.
- **Resolver o máximo dentro do escopo comprovado.** Evitar múltiplas PRs desnecessárias.
- **Preferência por modelo barato.** Sonnet para tarefas baixa/média complexidade. Modelo mais caro somente com justificativa.
- **Preferir automação determinística.** Onde regex/script resolve, não usar LLM.
- **Gate automatizado:** `.github/workflows/pr-governance-check.yml` valida PR sem custo de modelo.
- **Auto-fix controlado:** `.github/workflows/pr-governance-autofix.yml` — max 3 tentativas, apenas erros triviais, sem LLM.

Ver `schema/REQUEST_ECONOMY_PROTOCOL.md` para o protocolo completo.

---

## Regra de menção obrigatória ao agente/modelo

Toda instrução operacional (comentário de PR, issue, prompt) deve mencionar explicitamente o agente no início:

```
@copilot+claude-sonnet-4.6
<instrução aqui>
```

- Instrução **sem `@copilot+modelo`** = **não operacional / não executável**.
- Modelo mais caro: declarar com justificativa explícita.
- Esta regra evita comentários que parecem tarefas mas não disparam execução confiável.

Ver `.github/AGENT_CONTRACT.md` regra 26 e `schema/CODEX_WORKFLOW.md` seção 18.
