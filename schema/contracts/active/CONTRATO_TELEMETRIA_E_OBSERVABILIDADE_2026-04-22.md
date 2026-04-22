# CONTRATO — TELEMETRIA E OBSERVABILIDADE — ENOVA 2

| Campo                             | Valor |
|-----------------------------------|-------|
| Frente                            | Telemetria e Observabilidade |
| Fase do A01                       | Prioridade 7 (consolidar telemetria, admin, shadow mode, canary e cutover) |
| Prioridade do A01                 | Prioridade 7 |
| Dependencias                      | Frentes 1 a 6 encerradas; Frente 6 arquivada em `schema/contracts/archive/CONTRATO_META_WHATSAPP_2026-04-22.md` |
| Legados aplicaveis                | L18 (obrigatorio), L03 e C* (complementares quando confirmados por leitura direta) |
| Referencias obrigatorias          | A00, A01, A02, CODEX_WORKFLOW, CONTRACT_EXECUTION_PROTOCOL, CONTRACT_CLOSEOUT_PROTOCOL, CONTRACT_SCHEMA, STATUS_SCHEMA, HANDOFF_SCHEMA, CLOUDFLARE_PERMISSION_PROTOCOL, REQUEST_ECONOMY_PROTOCOL, CLOUDFLARE_RUNTIME_AUDIT_2026-04-22, DATA_CHANGE_PROTOCOL |
| Blocos legados obrigatorios       | L18 |
| Blocos legados complementares     | L03, C* |
| Ordem minima de leitura da frente | A00 -> A01 -> A02 -> contracts/_INDEX -> este contrato -> status/handoff da Frente 7 -> L18 (PDF, enquanto nao transcrito) |
| Status                            | Aberto |
| Ultima atualizacao                | 2026-04-22 |

---

## 1. Objetivo

Abrir e executar a Frente 7 — Telemetria e Observabilidade em quatro PRs curtas, com escopo fechado, para tornar a ENOVA 2 diagnosticavel antes de rollout:

- registrar o contrato e a governanca da frente;
- definir a taxonomia tecnica de eventos, sintomas, logs, health, evidencias e correlacao;
- implementar somente o runtime minimo de observabilidade no repo/Worker quando a PR3 chegar;
- provar o recorte contratado com smoke integrado e closeout formal na PR4.

Esta frente existe para impedir diagnostico por adivinhacao. Ao final dela, o sistema deve ter observabilidade minima comprovada no repo e regras claras sobre o que ainda depende de ativacao externa, rollout ou contrato extraordinario.

## 2. Escopo

1. Abrir contrato ativo, status vivo, handoff vivo e indices da Frente 7.
2. Persistir a ordem oficial PR1/PR2/PR3/PR4.
3. Persistir o loop obrigatorio de consulta antes de qualquer tarefa da Frente 7.
4. Registrar o mapa executivo de ativacao real das integracoes externas.
5. Na PR2, criar o contrato tecnico de observabilidade/telemetria sem runtime.
6. Na PR3, criar apenas hooks/emissao minima e smoke minimo no repo/Worker, sem telemetria profunda externa.
7. Na PR4, executar smoke integrado, provar limites e encerrar formalmente a frente se os criterios forem cumpridos.

## 3. Fora de escopo

- Meta real.
- Supabase real remoto, alteracao de schema, migracao ou nova persistencia externa.
- Rollout real, shadow mode operacional, canary operacional ou cutover.
- Dashboard externo obrigatorio.
- Ferramenta externa de observabilidade obrigatoria.
- Secrets, bindings, vars, rotas Cloudflare publicadas ou deploy manual.
- Telemetria profunda externa.
- Painel administrativo final.
- Refatoracao ampla de Worker, Core, Speech, Adapter ou canal.
- Codigo funcional novo nesta PR1.
- Qualquer inferencia de integracao real sem prova externa e sem contrato autorizador.

## 4. Dependencias

- Frente 6 encerrada formalmente e contrato arquivado.
- Runtime tecnico minimo de canal da Frente 6 preservado como recorte tecnico, nao como Meta real.
- Gate 5 do A01: sem observabilidade minima, nao existe shadow, canary nem cutover.
- Auditoria Cloudflare vigente: o repo nao prova runtime publicado sem evidencia externa.
- L18 como fonte obrigatoria de QA, runner, telemetria, evidencias, rollback e hardening.

## 5. Entradas

- `schema/contracts/_INDEX.md` com Frente 7 aguardando abertura.
- `schema/contracts/archive/CONTRATO_META_WHATSAPP_2026-04-22.md`.
- `schema/contracts/closeout/META_WHATSAPP_CLOSEOUT_READINESS.md`.
- `schema/status/META_WHATSAPP_STATUS.md`.
- `schema/handoffs/META_WHATSAPP_LATEST.md`.
- A00, A01, A02, schemas e protocolos de contrato/status/handoff.
- L18 no PDF mestre, pois o bloco ainda nao esta transcrito integralmente no markdown legado.

## 6. Saidas

- contrato ativo da Frente 7 aberto em `schema/contracts/active/`;
- status vivo da Frente 7 criado;
- handoff vivo da Frente 7 criado;
- indices vivos atualizados;
- ordem oficial PR1/PR2/PR3/PR4 registrada;
- loop obrigatorio da Frente 7 registrado;
- mapa executivo de ativacao real das integracoes registrado;
- proximo passo autorizado: PR2 da Frente 7.

## 7. Mapa executivo de ativacao real das integracoes

Este mapa passa a ser regra executiva daqui para frente. O macro atual organiza a ordem das frentes, mas nao explicita cedo o suficiente onde cada ativacao real externa entra. A Frente 7 corrige essa lacuna sem abrir ativacao real nesta PR.

| Item | Regra executiva |
|---|---|
| Estado tecnico atual | Core, Speech, Contexto, Adapter, Audio e Meta/WhatsApp possuem recortes tecnicos locais/versionados; a rota `/__meta__/ingest` e apenas runtime minimo tecnico da Frente 6. |
| Meta real | Nao entra na Frente 7. Nao foi entregue pela Frente 6. Exige contrato extraordinario de ativacao real de Meta/WhatsApp antes de qualquer trafego real, webhook real, assinatura real ou outbound real. A Frente 8 so pode usar Meta real se essa ativacao ja tiver sido aprovada e provada. |
| Supabase real | A Frente 4 entregou adapter/persistencia no recorte contratado, mas ativacao remota nova, schema real, migracao, credenciais ou mudanca de dados produtivos nao entram na Frente 7. Qualquer nova ativacao Supabase real exige DATA_CHANGE_PROTOCOL e contrato extraordinario ou contrato especifico de ativacao. |
| Observabilidade minima | Entra na Frente 7. PR2 define contrato tecnico; PR3 implementa o minimo no repo/Worker; PR4 prova com smoke integrado. Deve funcionar sem ferramenta externa obrigatoria. |
| Observabilidade profunda | A Frente 7 define limites, taxonomia, sintomas e criterios. Observabilidade profunda externa, dashboard operacional, alertas reais e pipeline externo nao entram automaticamente; exigem PR/contrato proprio se dependerem de ambiente externo. |
| Rollout real | Nao entra na Frente 7. Pertence a Frente 8 somente depois do closeout da Frente 7 e depois de qualquer ativacao real externa necessaria estar formalmente aprovada. |
| Shadow/canary/cutover | Nao entram na Frente 7 como operacao real. A Frente 7 deve fornecer sinais minimos para permitir decisao futura; execucao real pertence a Frente 8. |
| Secrets/bindings/vars/routes publicadas | Nao entram na Frente 7 sem necessidade comprovada e protocolo Cloudflare. Nesta PR1: proibidos. |
| Contrato extraordinario obrigatorio | Meta real, nova ativacao Supabase remota/produtiva, ferramenta externa obrigatoria, dashboard externo, deploy/callback produtivo, trafego real fora do recorte da Frente 8, ou qualquer integracao nao explicitada no contrato ativo. |
| Continua tecnico ate segunda ordem | Canal Meta, sinais de telemetria, health, logs, correlacao e evidencias continuam tecnicos/local-repo ate que uma PR/contrato autorize ativacao externa real. |

## 8. Definicoes obrigatorias

### Telemetria minima

Conjunto minimo de sinais locais/versionados para responder: o que aconteceu, onde aconteceu, com qual correlacao, qual sintoma foi emitido e qual evidencia prova o comportamento.

### Telemetria profunda

Conjunto ampliado de sinais, sintomas, divergencias, alertas, trilhas e visoes que permite diagnostico causal entre camadas. Quando depender de ferramenta externa, dashboard real, alertas operacionais ou ambiente publicado, nao esta automaticamente autorizada pela Frente 7.

### Observabilidade de arquitetura

Prova tecnica de integridade entre camadas: Worker, Core, Speech, Contexto, Adapter, canal, smokes, contratos e handoffs.

### Observabilidade de produto

Leitura de comportamento de uso, jornada, funil, qualidade percebida e operacao real. Nao entra na Frente 7 salvo se for representada por sinais tecnicos minimos no repo.

### O que pode ser provado so no repo

Contratos, taxonomia, validadores, hooks minimos, smokes, respostas tecnicas, logs locais controlados, health tecnico, ausencia de dispatch externo e integridade de rotas.

### O que exige ambiente externo

Webhook real, Meta real, Supabase remoto/produtivo novo, dashboard externo, alertas reais, rota publicada, secrets/bindings/vars, canary, cutover, trafego real e qualquer prova de runtime publicado.

## 9. Criterios de aceite

C1. Contrato ativo da Frente 7 aberto em `schema/contracts/active/`.  
C2. `schema/contracts/_INDEX.md` atualizado com Frente 7 aberta.  
C3. Status vivo da Frente 7 criado e sincronizado.  
C4. Handoff vivo da Frente 7 criado e sincronizado.  
C5. `schema/status/_INDEX.md` e `schema/handoffs/_INDEX.md` atualizados.  
C6. Ordem PR1/PR2/PR3/PR4 persistida no repo.  
C7. Loop obrigatorio de consulta persistido no repo.  
C8. Mapa executivo de ativacao real das integracoes presente, objetivo e sem ambiguidade.  
C9. Nenhum codigo funcional novo nesta PR1.  
C10. Nenhuma integracao externa, secret, binding, var, dashboard, deploy ou rollout aberto nesta PR1.  
C11. Proximo passo autorizado declarado: PR2 — contrato tecnico de observabilidade/telemetria.

## 10. Provas obrigatorias

- diff dos arquivos criados/alterados;
- prova de ausencia de alteracao funcional em `src/`, `package.json`, `wrangler.toml` ou runtime;
- validacao documental (`git diff --check`);
- smoke geral somente se executado sem exigir ambiente externo;
- branch, SHA, commit, push no mesmo branch;
- `git remote -v`;
- link do commit remoto nao-404.

## 11. Bloqueios

- ausencia de leitura do contrato/status/handoff antes de qualquer tarefa da Frente 7;
- tentativa de executar PR2, PR3 ou PR4 fora da ordem oficial;
- tentativa de abrir Meta real, Supabase real, rollout real ou dashboard externo dentro da Frente 7 sem contrato extraordinario;
- tentativa de usar "observabilidade" como pretexto para secrets, bindings, vars ou deploy nao autorizados;
- ausencia de prova local para smoke minimo da PR3/PR4;
- contradicao com A00, A01, A02 ou soberania do Core/IA.

## 12. Proximo passo autorizado

**PR2 — contrato tecnico de observabilidade/telemetria da Frente 7.**

PR2 deve definir, sem implementacao:

- taxonomia de eventos;
- sinais obrigatorios;
- camadas de observabilidade;
- correlacao/trace;
- contrato de logs;
- contrato de sintomas, alertas, health e evidencias;
- minimo vs profundo;
- provas esperadas para PR3 e PR4.

## 13. Relacao com o A01

- Frente atendida: **Frente 7 — Telemetria e Observabilidade**.
- Prioridade do A01: **7**.
- Gate relacionado: **sem observabilidade minima, nao existe shadow, canary nem cutover**.
- Entrega esperada pelo A01: eventos, sintomas, divergencias e inspecao admin suficientes para diagnostico por lead/decisao e aptidao futura a rollout.

## 14. Relacao com legados aplicaveis

- **L18** e obrigatorio por tratar de runner, QA, telemetria, evidencias, shadow mode, rollback e hardening.
- **L03** e complementar quando a tarefa tocar principios do Core e soberania.
- **C*** e complementar apenas quando confirmado por leitura direta do PDF mestre.

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
- `schema/legacy/INDEX_LEGADO_MESTRE.md`
- `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`

## 16. Blocos legados aplicaveis

- Obrigatorio: L18.
- Complementares: L03, C* quando a tarefa demonstrar necessidade e a leitura direta confirmar aplicabilidade.

## 17. Ordem minima de leitura da frente

Antes de qualquer tarefa da Frente 7:

1. `schema/contracts/_INDEX.md`
2. `schema/contracts/active/CONTRATO_TELEMETRIA_E_OBSERVABILIDADE_2026-04-22.md`
3. `schema/status/TELEMETRIA_E_OBSERVABILIDADE_STATUS.md`
4. `schema/handoffs/TELEMETRIA_E_OBSERVABILIDADE_LATEST.md`
5. Ordem oficial PR1/PR2/PR3/PR4 deste contrato
6. Mapa executivo de ativacao real das integracoes deste contrato
7. L18 no PDF mestre, enquanto nao houver transcricao integral no markdown legado

## 18. PRs oficiais da Frente 7

### PR1 — abertura contratual forte da Frente 7

- contrato ativo;
- status e handoff vivos;
- indices;
- ordem oficial PR1/PR2/PR3/PR4;
- loop obrigatorio;
- mapa executivo de ativacao real das integracoes;
- criterios de aceite;
- fora de escopo.

### PR2 — contrato tecnico de observabilidade/telemetria

- taxonomia de eventos;
- sinais obrigatorios;
- camadas de observabilidade;
- correlacao/trace;
- contrato de logs;
- contrato de sintomas, alertas, health e evidencias;
- minimo vs profundo;
- sem implementacao.

### PR3 — runtime minimo de observabilidade no Worker/repo

- hooks minimos;
- emissao minima;
- smoke minimo;
- sem telemetria profunda externa;
- sem ferramenta externa obrigatoria se o repo puder provar o recorte.

### PR4 — smoke integrado + closeout da Frente 7

- provar recorte contratado da Frente 7;
- provar integridade das frentes anteriores;
- provar que nao houve drift para integracao real;
- closeout formal se os criterios forem cumpridos.

## 19. Loop obrigatorio antes de cada tarefa da Frente 7

Nenhuma tarefa da Frente 7 pode iniciar sem cumprir este loop:

1. Ler `schema/contracts/_INDEX.md`.
2. Ler o contrato ativo da Frente 7.
3. Ler o status vivo da Frente 7.
4. Ler o handoff vivo da Frente 7.
5. Confirmar a ordem oficial PR1/PR2/PR3/PR4.
6. Ler o mapa executivo de ativacao real das integracoes.
7. Confirmar que a tarefa nao abre integracao externa real.
8. Se a tarefa nao encaixar, parar e abrir revisao contratual ou contrato extraordinario.

## 20. Relacao com a Frente 8

A Frente 7 torna o sistema apto a decidir rollout, mas nao executa rollout.

A Frente 8 devera tratar rollout, shadow mode, canary e cutover, respeitando os sinais e limites da Frente 7. Se a Frente 8 precisar de Meta real, Supabase real novo, dashboard externo ou rota publicada que ainda nao tenham sido ativados por contrato proprio, ela nao pode presumir essa ativacao: deve exigir contrato extraordinario ou revisao formal antes de trafego real.

## 21. Estado inicial do contrato

- Estado da frente ao abrir: **contrato aberto**.
- Mudancas em dados persistidos (Supabase): **nenhuma**.
- Permissoes Cloudflare necessarias: **nenhuma adicional**.
- Codigo funcional novo nesta PR1: **nenhum**.
- Proximo passo autorizado: **PR2 — contrato tecnico de observabilidade/telemetria**.
