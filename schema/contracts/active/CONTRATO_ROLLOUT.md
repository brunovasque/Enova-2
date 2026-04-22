# CONTRATO — ROLLOUT — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Rollout |
| Fase do A01 | Prioridade 7 (shadow mode, canary e cutover com rollback) |
| Prioridade do A01 | Prioridade 7 |
| Dependencias | Frentes 1 a 7 encerradas; Frente 7 arquivada em `schema/contracts/archive/CONTRATO_TELEMETRIA_E_OBSERVABILIDADE_2026-04-22.md` |
| Legados aplicaveis | L18 (obrigatorio), L03 e C* (complementares quando confirmados) |
| Referencias obrigatorias | A00, A01, A02, CODEX_WORKFLOW, CONTRACT_EXECUTION_PROTOCOL, CONTRACT_CLOSEOUT_PROTOCOL, CONTRACT_SCHEMA, STATUS_SCHEMA, HANDOFF_SCHEMA, CLOUDFLARE_PERMISSION_PROTOCOL, REQUEST_ECONOMY_PROTOCOL, DATA_CHANGE_PROTOCOL, CLOUDFLARE_RUNTIME_AUDIT_2026-04-22 |
| Ordem minima de leitura da frente | A00 -> A01 -> A02 -> contracts/_INDEX -> este contrato -> status/handoff da Frente 8 -> L18 (PDF, enquanto nao transcrito) |
| Status | em execucao |
| Ultima atualizacao | 2026-04-22 |

---

## 1. Objetivo

Abrir e executar a Frente 8 — Rollout em quatro PRs curtas, com escopo fechado e gates operacionais fortes, para viabilizar shadow mode, canary, cutover e rollback sem rollout no escuro.

Esta frente existe para transformar "pronto para operar" em "pronto para ativar com seguranca", com criterios go/no-go verificaveis, bloqueios claros e anti-retrabalho.

## 2. Escopo

Incluido nesta frente:

1. Abrir contrato ativo, status vivo, handoff vivo e indices da Frente 8.
2. Persistir ordem oficial PR1/PR2/PR3/PR4.
3. Persistir loop obrigatorio antes de qualquer tarefa da frente.
4. Definir gates operacionais e mapa executivo de ativacao real.
5. Definir criterios go/no-go para promocao e bloqueio.
6. Definir contrato de rollback/cutover sem ambiguidades.
7. Definir recorte tecnico minimo da PR3 (sem rollout real completo).
8. Executar smoke integrado final e closeout formal na PR4, se criterios forem cumpridos.

## 3. Fora de escopo

- rollout real completo nesta PR1;
- implementacao de runtime em `src/` nesta PR1;
- deploy manual/externo;
- dashboard externo;
- ferramenta externa obrigatoria;
- Meta real automatica;
- Supabase real novo/produtivo automatico;
- abertura de secrets, bindings ou vars sem protocolo e necessidade comprovada;
- telemetria profunda externa fora de contrato proprio;
- refatoracao ampla.

## 4. Definicoes executivas da frente

### Shadow mode

Execucao paralela controlada do novo trilho de operacao, com comparacao de comportamento, sem assumir substituicao total imediata.

### Canary

Ativacao progressiva e limitada por fatia, com observacao ativa e criterio de abort/rollback previamente definido.

### Cutover

Transicao operacional controlada para o novo modo, com criterio formal de entrada, monitoracao intensiva e rollback pronto.

### Go/No-go

Decisao formal de avancar ou bloquear promocao com base em evidencias minimas objetivas.

### Rollback

Retorno controlado para estado seguro previamente definido, sem perda de rastreabilidade e sem improviso operacional.

## 5. GATES OPERACIONAIS E ATIVACAO REAL

### 5.1 Gate executivo da frente

1. Sem contrato tecnico de rollout (PR2), nao inicia runtime de rollout (PR3).
2. Sem runtime minimo provado (PR3), nao inicia closeout (PR4).
3. Sem smoke integrado aprovado (PR4), contrato nao encerra.

### 5.2 Mapa executivo de ativacao real (sem ambiguidade)

| Item | Regra executiva |
|---|---|
| Shadow mode entra onde? | Frente 8, a partir de PR2 (contrato tecnico) e PR3 (runtime minimo), sempre com gates e evidencias. |
| Canary entra onde? | Frente 8, somente apos criterios go/no-go definidos em PR2 e comprovados em PR3/PR4. |
| Cutover entra onde? | Frente 8, somente com criterios formais de cutover/abort/rollback e evidencias minimas. |
| Rollback entra onde? | Frente 8, como mecanismo obrigatorio definido em PR2, testado minimamente em PR3 e validado em PR4. |
| Meta real pode ser usada automaticamente? | Nao. Exige contrato extraordinario ou contrato especifico de ativacao real ja aprovado. |
| Supabase real novo pode ser usado automaticamente? | Nao. Exige DATA_CHANGE_PROTOCOL e contrato autorizador especifico. |
| Dashboard externo/ferramenta externa podem ser usados automaticamente? | Nao. Exigem autorizacao contratual propria quando dependerem de ambiente externo. |
| O que exige contrato extraordinario? | Meta real, Supabase real novo/produtivo, dashboard externo, ferramenta externa obrigatoria, deploy operacional fora do recorte contratado. |
| O que continua bloqueado ate segunda ordem? | Ativacoes externas reais, rollout total sem gates, corte sem rollback pronto, qualquer promocao sem evidencias minimas. |

## 6. CRITERIOS GO/NO-GO (obrigatorios)

### 6.1 Para avancar de PR2 -> PR3

1. Contrato tecnico de rollout publicado e consistente.
2. Definicao formal de shadow/canary/cutover/rollback concluida.
3. Definicao formal de evidencias minimas concluida.
4. Fronteiras de ativacao real explicitas e sem ambiguidades.

### 6.2 Para avancar de PR3 -> PR4

1. Hooks/guards minimos implementados no recorte autorizado.
2. Smoke minimo de rollout disponivel e passando.
3. Integridade das frentes anteriores preservada.
4. Sem drift para ativacao externa nao autorizada.

### 6.3 Para qualquer ativacao real

1. Evidencia de gate de seguranca cumprido.
2. Evidencia de observabilidade minima adequada.
3. Evidencia de rollback operacional viavel.
4. Autorizacao contratual explicita para o tipo de ativacao.

### 6.4 Sintomas de no-go / bloqueio

- regressao funcional em frentes 1-7;
- perda de rastreabilidade de decisao/evento;
- quebra de integridade em `/`, `/__core__/run` ou `/__meta__/ingest`;
- abertura de escopo externo nao autorizado;
- ausencia de evidencias minimas definidas;
- ausencia de rollback executavel.

### 6.5 Fail-safe e rollback imediato

Fail-safe da frente: ao detectar sintoma critico de no-go, bloquear promocao e retornar para estado seguro (rollback), preservando evidencias e abrindo diagnostico formal antes de nova tentativa.

## 7. ROLLBACK E CUTOVER (obrigatorios)

### 7.1 Rollback manual vs rollback tecnico

- rollback manual: decisao operacional controlada por gate humano, com checklist formal.
- rollback tecnico: retorno por guard/controle tecnico definido em contrato de rollout.

Ambos devem preservar evidencias, continuidade e integridade de dados.

### 7.2 Criterios de cutover

1. Evidencias minimas completas.
2. Criterios go aprovados.
3. Plano de rollback pronto e verificavel.
4. Sem sintomas criticos ativos.

### 7.3 Criterios de abort

1. Violacao de gate de seguranca.
2. Regressao critica em frentes anteriores.
3. Ausencia de rastreabilidade minima.
4. Qualquer ativacao externa fora de autorizacao.

### 7.4 Preservacao obrigatoria das Frentes 1-7

Durante qualquer recorte de rollout:

- manter soberania do Core/IA;
- manter integridade de rotas tecnicas existentes;
- manter limites de canal da Frente 6;
- manter limites de observabilidade da Frente 7;
- nao quebrar comportamento de `not_found`.

## 8. Criticos anti-retrabalho da frente

1. Nenhum passo assume ativacao externa automatica.
2. Nenhum passo presume cutover sem rollback testavel.
3. Nenhum passo promove sem evidencia minima definida.
4. Nenhum passo mistura PR2/PR3/PR4 no mesmo recorte.
5. Se houver ambiguidade de gate, parar e revisar contrato antes de implementar.

## 9. Criterios de aceite da PR1 desta frente

C1. Contrato ativo da Frente 8 criado em `schema/contracts/active/`.  
C2. `schema/contracts/_INDEX.md` atualizado com Frente 8 aberta.  
C3. Status vivo da Frente 8 criado.  
C4. Handoff vivo da Frente 8 criado.  
C5. `schema/status/_INDEX.md` e `schema/handoffs/_INDEX.md` atualizados.  
C6. Ordem oficial PR1/PR2/PR3/PR4 persistida.  
C7. Loop obrigatorio de consulta persistido.  
C8. Secao de gates operacionais e ativacao real persistida.  
C9. Secao de go/no-go persistida.  
C10. Secao de rollback/cutover persistida.  
C11. Nenhum codigo funcional novo nesta PR1.  
C12. Proximo passo autorizado explicito: **PR2 da Frente 8**.

## 10. Provas obrigatorias

- diff dos arquivos criados/alterados;
- prova de ausencia de alteracao funcional em `src/`, `package.json`, `wrangler.toml`;
- validacao documental (`git diff --check`);
- branch, SHA, commit e push no mesmo branch;
- `git remote -v`;
- link do commit remoto nao-404.

## 11. Bloqueios

- tentar executar runtime/rollout real na PR1;
- tentar abrir dashboard/ferramenta externa sem contrato autorizador;
- tentar usar Meta real ou Supabase real novo automaticamente;
- pular ordem oficial das PRs;
- iniciar tarefa da frente sem cumprir loop obrigatorio.

## 12. Proximo passo autorizado

**PR3 — runtime minimo/controladores de rollout (escopo tecnico local).**

PR3 podera executar, sem abrir rollout real:

- hooks/guards minimos;
- flags/controles minimos se estritamente necessarios;
- smoke minimo de rollout;
- evidencia tecnica local de gates e rollback.

## 13. Relacao com o A01

- Frente atendida: **Frente 8 — Rollout**.
- Prioridade do A01: **7**.
- Gate relacionado: sem observabilidade minima e sem evidencias de seguranca, nao ha rollout.

## 14. Relacao com legados aplicaveis

- **L18** obrigatorio para runner, QA, telemetria, shadow mode, rollback, canary e cutover.
- **L03** complementar para coerencia com funil e trilho operacional.
- **C*** complementar quando confirmado por leitura direta do PDF mestre.

## 15. Referencias obrigatorias do contrato

- `schema/A00_PLANO_CANONICO_MACRO.md`
- `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
- `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
- `schema/README_EXECUCAO.md`
- `schema/CODEX_WORKFLOW.md`
- `schema/contracts/_INDEX.md`
- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
- `schema/CONTRACT_SCHEMA.md`
- `schema/STATUS_SCHEMA.md`
- `schema/HANDOFF_SCHEMA.md`
- `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`
- `schema/REQUEST_ECONOMY_PROTOCOL.md`
- `schema/DATA_CHANGE_PROTOCOL.md`
- `schema/CLOUDFLARE_RUNTIME_AUDIT_2026-04-22.md`
- `schema/rollout/FRENTE8_ROLLOUT_TECHNICAL_CONTRACT.md`
- `schema/legacy/INDEX_LEGADO_MESTRE.md`
- `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`

## 16. Blocos legados aplicaveis

- Obrigatorio: L18.
- Complementares: L03 e C* quando confirmados por leitura direta do PDF mestre.

## 17. Ordem minima de leitura da frente

Antes de qualquer tarefa da Frente 8:

1. `schema/contracts/_INDEX.md`
2. `schema/contracts/active/CONTRATO_ROLLOUT.md`
3. `schema/status/ROLLOUT_STATUS.md`
4. `schema/handoffs/ROLLOUT_LATEST.md`
5. Ordem oficial PR1/PR2/PR3/PR4
6. Gates operacionais e ativacao real
7. Criterios go/no-go
8. Rollback e cutover

## 18. PRs oficiais da Frente 8

### PR1 — abertura contratual forte da Frente 8

- contrato ativo;
- status/handoff;
- indices;
- ordem oficial PR1/PR2/PR3/PR4;
- loop obrigatorio;
- gates operacionais;
- mapa executivo de ativacao real;
- criterios go/no-go;
- criterios de aceite;
- fora de escopo.

### PR2 — contrato tecnico de rollout

- definicao tecnica de shadow/canary/cutover/rollback;
- criterios de promocao e bloqueio;
- janelas de observacao;
- evidencias minimas;
- fronteiras de ativacao real;
- sem implementacao.

### PR3 — runtime minimo/controladores de rollout

- hooks minimos;
- flags/guards minimos se necessarios;
- smoke minimo;
- sem rollout real completo;
- sem abrir ativacao externa alem do estritamente autorizado.

### PR4 — smoke integrado + closeout formal da Frente 8

- prova do recorte contratado;
- prova de integridade das frentes anteriores;
- prova de gates e rollback;
- closeout formal se criterios forem cumpridos.

## 19. Loop obrigatorio antes de cada tarefa da Frente 8

Nenhuma tarefa da Frente 8 pode iniciar sem cumprir este loop:

1. Ler `schema/contracts/_INDEX.md`.
2. Ler o contrato ativo da Frente 8.
3. Ler o status vivo da Frente 8.
4. Ler o handoff vivo da Frente 8.
5. Confirmar a ordem oficial PR1/PR2/PR3/PR4.
6. Ler gates operacionais e ativacao real.
7. Ler criterios go/no-go.
8. Ler rollback/cutover.
9. Confirmar que a tarefa nao abre ativacao externa real fora de autorizacao.
10. Se a tarefa nao encaixar, parar e abrir revisao contratual ou contrato extraordinario.

## 20. Estado inicial do contrato (PR1)

- Estado da frente ao abrir: **contrato aberto**.
- Mudancas em dados persistidos (Supabase): **nenhuma**.
- Permissoes Cloudflare necessarias: **nenhuma adicional**.
- Codigo funcional novo nesta PR1: **nenhum**.
- Proximo passo autorizado: **PR2 — contrato tecnico de rollout**.

## 21. Estado apos PR2 (contrato tecnico concluido)

- Artefato tecnico criado: `schema/rollout/FRENTE8_ROLLOUT_TECHNICAL_CONTRACT.md`.
- PR2 fechou: definicoes tecnicas de shadow/canary/cutover/rollback, criterios de promocao/bloqueio, janelas de observacao, evidencias minimas, fronteiras de ativacao real e limites da PR3.
- Nenhuma implementacao de runtime foi feita nesta PR2.
- Mudancas em dados persistidos (Supabase): **nenhuma**.
- Permissoes Cloudflare necessarias: **nenhuma adicional**.
- Proximo passo autorizado: **PR3 — runtime minimo/controladores de rollout**.
