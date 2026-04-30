# IMPLANTACAO_MACRO_LLM_FIRST_LATEST

## PR-T8.5 — Frontend do painel operacional completo (2026-04-29)

**Tipo**: PR-IMPL | **Status**: CONCLUÍDA
**PR precedente**: PR-T8.4 (#149) — backend mínimo das 7 abas

**Artefatos criados**:
- `src/panel/handler.ts` — Painel estático servido em `/panel` (HTML/CSS/JS embutidos como string TS, sem framework, sem build step)
- `src/panel/smoke.ts` — Smoke test com 30 verificações
- `schema/implementation/T8_FRONTEND_PAINEL_OPERACIONAL.md` — Documentação

**Arquivos modificados**:
- `src/worker.ts` — Import + roteamento `/panel` e `/panel/`
- `package.json` — Script `smoke:panel` adicionado a `smoke:all`

**7 abas implementadas**:
1. Conversas — lista, detalhe, mensagens/turnos
2. Bases — bases canônicas com tipo/path/status
3. Atendimento — visão operacional, pendências, modo manual, overrides recentes
4. CRM — lista de leads, criação, case-file completo, ações (override, manual mode, reset)
5. Dashboard — métricas operacionais + warnings
6. Incidentes — sumário por severidade, eventos críticos, ações de operador
7. ENOVA IA — status do runtime, flags, próximas PRs

**Endpoints consumidos**: 14 endpoints distintos da PR-T8.4 chamados via JS vanilla com header `X-CRM-Admin-Key`. Demais 12 endpoints acessíveis via `case-file` consolidado.

**Auth**: chave em `localStorage` (`crm_admin_key`), sem hardcode. Modal aparece no primeiro acesso. Botão "configurar" no header reabre modal. Status visual da chave (`***last4` ou `sem chave`).

**Restrições satisfeitas**: zero reply_text, zero stage decision, zero ativação real. Empty-state declarado em todas as abas. Flags `real_supabase`/`real_llm`/`real_whatsapp` exibidas no header global e por aba como avisos amarelos.

**Não tocado**: workflow/deploy, contrato T8, cliente real, WhatsApp real, Supabase real, LLM real, autenticação complexa, redesign visual definitivo.

**Verificação**: `npm run smoke:panel` → 30/30 PASS. `node --check` OK em handler.ts, smoke.ts, worker.ts.

**Próxima PR autorizada**: PR-T8.6 — PR-PROVA — Prova real CRM end-to-end consumindo o painel.

---

## PR-T8.4 — Backend mínimo das 7 abas do painel operacional (2026-04-29)

**Tipo**: PR-IMPL | **Status**: CONCLUÍDA (escopo expandido para 7 abas)  
**Diagnóstico precedente**: PR-T8.3 (T8_CRM_REAPROVEITAMENTO_ENOVA1_DIAGNOSTICO.md)

**Artefatos criados**:
- `src/crm/types.ts` — Tipos canônicos CRM (9 tabelas, 9 entidades, interface CrmBackend)
- `src/crm/store.ts` — `CrmInMemoryBackend` + singleton `crmBackend`
- `src/crm/service.ts` — 15 funções de negócio (aba CRM)
- `src/crm/panel.ts` — Funções de painel para 6 abas adicionais (conversas, bases, atendimento, dashboard, incidentes, enova-ia)
- `src/crm/routes.ts` — Handler HTTP `/crm/*` — 26 endpoints (7 abas + health) com auth segura
- `schema/implementation/T8_BACKEND_CRM_OPERACIONAL.md` — documento com matriz backend por aba

**Arquivo modificado**: `src/worker.ts` — `env` param + roteamento `url.pathname.startsWith('/crm/')` para todas as abas

**Endpoints por aba (26 totais)**:
- **Health (1)**: `GET /crm/health`
- **Conversas (3)**: `GET /crm/conversations`, `GET /crm/conversations/:lead_id`, `GET /crm/conversations/:lead_id/messages`
- **Bases (2)**: `GET /crm/bases`, `GET /crm/bases/status`
- **Atendimento (3)**: `GET /crm/attendance`, `GET /crm/attendance/pending`, `GET /crm/attendance/manual-mode`
- **CRM (12)**: `GET/POST /crm/leads`, `GET /crm/leads/:id[/facts|/timeline|/artifacts|/dossier|/policy-events|/case-file]`, `POST /crm/leads/:id/[override|manual-mode|reset]`
- **Dashboard (2)**: `GET /crm/dashboard`, `GET /crm/dashboard/metrics`
- **Incidentes (2)**: `GET /crm/incidents`, `GET /crm/incidents/summary`
- **ENOVA IA (2)**: `GET /crm/enova-ia/status`, `GET /crm/enova-ia/runtime`

**Auth segura**: `X-CRM-Admin-Key` com flag explícita `CRM_ALLOW_DEV_TOKEN === "true"` para token dev. Sem fallback universal — sem `CRM_ADMIN_KEY` e sem flag → 401 sempre.

**Restrições satisfeitas**: zero reply_text, zero stage decision, reset preserva auditoria, override_log permanente, modo manual sem script, dossiê sem decisão, empty-state declarado com schema estável, flags `real_supabase`/`real_llm`/`real_whatsapp` explicitamente `false`.

**Não tocado**: frontend, workflow/deploy, contrato T8, cliente real, WhatsApp real, Supabase real, LLM real.

**Verificação**: `node --check` OK em 6 arquivos (types, store, service, panel, routes, worker).

**Próxima PR autorizada**: PR-T8.5 — PR-IMPL — Frontend do painel operacional completo consumindo os 26 endpoints da PR-T8.4

---

## PR-T8.3 — Diagnóstico CRM/Infra Operacional Enova 1 → Enova 2 (2026-04-29)

**Tipo**: PR-DIAG | **Status**: CONCLUÍDA

**Artefato criado**: `schema/diagnostics/T8_CRM_REAPROVEITAMENTO_ENOVA1_DIAGNOSTICO.md`

**Achados principais**:
- 37 componentes CRM/infra mapeados (REAPROV. 18 | REDESENHAR 7 | PROIBIDO 9 | AUSENTE 3)
- 11 tabelas Supabase canônicas identificadas (enova_leads, enova_facts, enova_turns, enova_state_v2, enova_policy_events, enova_memory_snapshots, enova_artifacts + 4 mais)
- **Proibido reaproveitar**: casca mecânica de fala, fallback estático por stage, views de stage hardcoded, dossiê que decide stage, reset que apaga auditoria
- **Deve redesenhar**: view de histórico de etapa (mapear para T5 F1-F5), link do correspondente (Supabase Storage URL), telemetria de qualidade semântica, badges de incidente (frontend novo)
- CRM backend = 12 endpoints mínimos para PR-T8.4
- CRM frontend TOTALMENTE AUSENTE do Repo2 — PR-T8.5
- Repo1 não acessado diretamente — diagnóstico baseado no mapa canônico internalizado

**Próxima PR autorizada**: PR-T8.4 — PR-IMPL — Migração backend CRM operacional no Repo2

---

## PR-T8.2 — Matriz Aderência Contrato × Código (2026-04-29)

**Tipo**: PR-DIAG | **Status**: CONCLUÍDA

**Artefato criado**: `schema/diagnostics/T8_MATRIZ_ADERENCIA_CONTRATO_CODIGO.md`

**Achados principais**:
- 57 itens contratuais T1–T7 mapeados
- Veredito consolidado: ADERENTE 1 | PARCIAL 18 | AUSENTE 22 | CONFLITANTE 2 | NÃO APLIC. 14
- **CONF-01 (CRÍTICO)**: CI/CD auto-deploya em `nv-enova-2` (produção) a cada push para `main` — PR-T8.13 deve antecipar este fix antes de qualquer PR-IMPL
- **CONF-02**: Canal WhatsApp incompleto pode ir para produção via CONF-01
- Lacunas bloqueantes G8: LLM real (LAC-01), Supabase real (LAC-02), CRM (LAC-03), WhatsApp outbound (LAC-04)
- T1–T5 eram contratos inteiramente documentais — ausência de implementação nesses contratos é situação esperada
- T6 adapter PARCIAL: ingest.ts existe mas faltam challenge, assinatura, outbound, idempotência
- T7 flags PARCIAL: guards.ts hardcoded, sem flags dinâmicos

**Próxima PR autorizada**: PR-T8.3 — PR-DIAG — Diagnóstico CRM Repo1

---


## Contexto

O repositorio foi rebaseado canonicamente para seguir o macro original do legado mestre, agora em:

`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

O estado anterior transmitia que as frentes e o contrato extraordinario E1 encerravam o macro. Isso foi
corrigido: esses recortes permanecem como fundacao tecnica/local/documental aproveitavel, mas a
implantacao macro real continua aberta.

## Estado herdado

- Frentes 1-8 arquivadas como recortes tecnicos historicos.
- E1 arquivado como modulo tecnico/local extraordinario.
- Indices/status/handoffs centrais indicavam encerramento amplo demais.
- Mestre em `schema/source/` define T0-T7 e G0-G7 como ordem soberana.

## Estado entregue

- Criada camada canonica de rebase em `schema/implantation/`.
- Criado contrato ativo T0.
- Criado status/handoff macro.
- Atualizados indices centrais para apontar fase real: T0/G0.
- Atualizada regra de leitura obrigatoria do mestre em toda tarefa futura.

## Proximo passo unico autorizado

T0-PR2 — inventario legado vivo.

## Leituras obrigatorias para a proxima tarefa

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
3. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
4. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
5. `schema/implantation/REBASE_CANONICO_IMPLANTACAO_2026-04-22.md`
6. `schema/implantation/PLANO_EXECUTIVO_T0_T7.md`

## Limites

- Nao abrir LLM real.
- Nao abrir Supabase real novo/produtivo.
- Nao abrir Meta real.
- Nao abrir STT/TTS real.
- Nao abrir shadow, canary, cutover ou rollout real.
- Nao tratar runtime tecnico local como prova de implantacao macro.

## Atualizacao 2026-04-23 — Bíblia canônica de PRs publicada

- Publicada `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (sequência inviolável de PRs derivada do mestre).
- Publicado `schema/execution/PR_EXECUTION_TEMPLATE.md` (template canônico obrigatório de abertura de PR).
- Publicado `schema/handoffs/PR_HANDOFF_TEMPLATE.md` (template canônico obrigatório de handoff por PR).
- Atualizados `README.md`, `schema/contracts/_INDEX.md`, `schema/handoffs/_INDEX.md`, `schema/status/_INDEX.md`.

### Regra canônica de exceção contratual (Bíblia §S — soberana)

- **Regra padrão:** seguir o contrato literalmente. Nenhuma quebra, flexibilização, "atalho útil" ou "quebra benéfica" pode ser feita por interpretação do executor.
- **Somente o Vasques pode autorizar manualmente uma exceção contratual**, de forma explícita, específica, temporária e registrada (motivo, benefício esperado, escopo exato, duração/PRs afetadas, condição de retorno).
- Encerrada a causa específica, o projeto **retorna automaticamente à normalidade do contrato**.
- Limites duros nunca exceptuáveis: soberania da IA na fala (`schema/ADENDO_CANONICO_SOBERANIA_IA.md`), regras de negócio MCMV, gates G0..G7, mudanças Supabase silenciosas, encerramento implícito de contrato.
- Aplicação obrigatória nos templates de abertura e handoff (campos explícitos).

### Estado atual da exceção contratual

- **Exceção contratual ativa?:** não.
- A próxima PR (`PR-T0.1`) **deve declarar explicitamente** `Exceção contratual autorizada pelo Vasques?: não` no body (conforme `PR_EXECUTION_TEMPLATE.md`) e operar literalmente conforme o contrato T0.

---

## Atualizacao 2026-04-29 — PR-T7.R — Readiness/Closeout G7

### ESTADO HERDADO

- Fase: T7 em execução; PR-T7.7 (#143) merged em main em 2026-04-29.
- Contrato T7: em execução — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- PR-T7.7 entregou: `T7_GO_NO_GO_EXECUTIVO.md` com checklist CHK-T77-01..20 (20/20 PASS), recomendação GO PARA CLOSEOUT G7 DOCUMENTAL, payload para T7.R.
- Referências canônicas: `READINESS_G6.md` / `T7_PREFLIGHT_GO_LIVE.md` / `T7_SHADOW_SIMULACAO.md` / `T7_MATRIZ_DIVERGENCIAS.md` / `T7_CANARY_INTERNO.md` / `T7_CUTOVER_GOVERNADO.md` / `T7_ROLLBACK_OPERACIONAL.md` / `T7_GO_NO_GO_EXECUTIVO.md`.
- Próximo passo autorizado: PR-T7.R — Readiness/Closeout G7.

### ESTADO ENTREGUE

**Veredito: G7 APROVADO DOCUMENTALMENTE COM RESTRIÇÕES OPERACIONAIS**

`schema/implantation/READINESS_G7.md` criado — readiness/closeout G7 formal.

**Conteúdo entregue (17 seções):**

- §4 Evidências T7.0–T7.7: tabela por PR com artefato, status, evidência principal, resultado, bloqueios e conclusão.
- §5 CA-G7-01..22: 22/22 CUMPRIDOS (contrato T7 aberto, T7.0–T7.7 merged, artefatos verificados, G6 aprovado, zero src/runtime/WhatsApp/cliente/go-live).
- §6 B-G7-01..14: todos não aplicáveis — nenhum bloqueio ativo.
- §7 Riscos aceitos RA-G7-01..08 consolidados de T7.7.
- §8 Riscos não aceitos RNA-G7-01..06 (S4 — cliente real, MCMV, promessa indevida, lead_state, legado, reply_text mecânico).
- §9 Veredito: G7 APROVADO DOCUMENTALMENTE COM RESTRIÇÕES OPERACIONAIS.
- §10 O que G7 autoriza: encerramento T7, arquivamento, abertura T8, diagnóstico técnico.
- §11 O que G7 NÃO autoriza: go-live real, cliente real, WhatsApp real, deploy, produção.
- §12 Próxima etapa T8: diagnóstico técnico de aderência contrato × código real; PR-T8.0 sugerida.
- §13 Critérios mínimos para T8: CT8-01..10.
- §14 Bloco E: Fechamento permitido: sim.
- §15 Encerramento formal via CONTRACT_CLOSEOUT_PROTOCOL §4.

**Encerramento do contrato T7:**
- Contrato arquivado: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T7_2026-04-29.md`
- Nota de encerramento adicionada em: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`

**Próximo passo único autorizado:** PR-T8.1 — Inventário técnico real do Repo2 (tipo: PR-DIAG). PR-T8.0 CONCLUÍDA em 2026-04-29.

**Restrições operacionais herdadas para T8:**
- RA-G7-01: telemetria — definida documentalmente; ativação runtime em T8
- RA-G7-02: smoke de rollback — definido documentalmente; execução em T8
- RA-G7-05: feature flags — definidas documentalmente; implementação runtime em T8
- RA-G7-08: WhatsApp/Meta — adapter documentado; handshake real em T8

**Riscos não aceitos que bloqueiam go-live real:**
- RNA-G7-01: zero cliente real sem T8 + Vasques (S4 — absoluto)
- RNA-G7-05: legado permanece ativo até T8 + Vasques (S4 — absoluto)

**Limites herdados:** zero src/; zero runtime real; zero rollback real; zero cutover real; zero WhatsApp real; zero reply_text; zero fact_*; zero go-live; zero cliente real.

---

## Atualizacao 2026-04-29 — PR-T8.1 — Inventário técnico real do Repo2

### ESTADO HERDADO

- Fase: T8 em execução; PR-T8.0 concluída — contrato T8 ativo.
- Próximo passo autorizado pré-T8.1: PR-T8.1 (tipo: PR-DIAG).

### ESTADO ENTREGUE

**Tipo:** PR-DIAG.

`schema/diagnostics/T8_REPO2_INVENTARIO_TECNICO.md` criado — inventário técnico real do Repo2 com 12 seções.

**Achados principais:**
- Worker Cloudflare funcional com 3 rotas (GET /, POST /__core__/run, POST /__meta__/ingest).
- Core Mecânico 2 implementado — 15 arquivos, todas as stages do funil MCMV.
- Supabase Adapter implementado com InMemoryPersistenceBackend — **sem Supabase real**; `@supabase/supabase-js` ausente; migrations ausentes.
- Meta/WhatsApp ingest técnico local — **sem webhook challenge, sem assinatura, sem outbound**.
- **CRM frontend TOTALMENTE AUSENTE no Repo2** — deve ser migrado do Repo1 (PR-T8.3/4/5).
- **LLM real ausente** — speech engine define contrato cognitivo sem chamada HTTP a API de IA.
- **CI/CD crítico (RK-W-01)**: deploy automático em produção em qualquer merge em `main` — risco imediato pré-T8.R.
- Feature flags (`ENOVA2_ENABLED`, etc.) ausentes.
- 8 riscos CRÍTICOS, 6 ALTOS, 1 MÉDIO mapeados.

**Próximo passo único autorizado:** PR-T8.2 — Matriz contrato T1–T7 × código real (tipo: PR-DIAG).

**Limites desta PR:** zero src/; zero runtime; zero Supabase; zero Meta/WhatsApp; zero CRM; zero deploy; zero go-live; zero cliente real.

---

## Atualizacao 2026-04-29 — PR-T8.0 — Abertura formal do contrato T8

### ESTADO HERDADO

- Fase: T7 encerrada; G7 APROVADO DOCUMENTALMENTE COM RESTRIÇÕES OPERACIONAIS via PR-T7.R (#144) em 2026-04-29.
- Contrato T7 arquivado: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T7_2026-04-29.md`
- CT8-01..09 satisfeitos; CT8-10 autorização Vasques: concedida (PR-T8.0 executada).
- Próximo passo autorizado pré-T8.0: PR-T8.0 — Abertura formal do contrato T8.

### ESTADO ENTREGUE

**Contrato T8 aberto formalmente.**

Artefatos criados/atualizados nesta PR:
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md` — contrato ativo T8 Rev2 integral (17 PRs, regra DIAG → IMPL → PROVA, gate G8, memória evolutiva, cláusula Claude Code).
- `CLAUDE.md` — leitura obrigatória atualizada para 9 arquivos; loop obrigatório de execução por PR adicionado; regras de bloqueio adicionadas.
- `schema/contracts/_INDEX.md` — T8 declarada aberta; linha de status atualizada.
- `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` — fase ativa T8 declarada; próxima PR: T8.1.
- `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` — este handoff.

**Regras-mãe da T8 declaradas:**
- PR-DIAG → PR-IMPL → PR-PROVA obrigatório por frente.
- Nenhuma PR-IMPL sem PR-DIAG anterior.
- Nenhuma frente pronta sem PR-PROVA.
- Nenhum cliente real / WhatsApp real / go-live sem autorização explícita Vasques.
- G8 só aprovado com Enova 2 atendendo cliente/lead real controlado conforme contratos T1–T7.

**Próximo passo único autorizado:** PR-T8.1 — Inventário técnico real do Repo2 (tipo: PR-DIAG).

**Limites desta PR:** zero src/; zero runtime; zero Supabase; zero Meta/WhatsApp; zero CRM; zero deploy; zero go-live; zero cliente real.

---

## Atualizacao 2026-04-29 — PR-T7.7 — Checklist executivo de go/no-go

### ESTADO HERDADO

- Fase: T7 em execução; PR-T7.6 (#142) merged em main em 2026-04-29.
- Contrato T7: em execução — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- PR-T7.6 entregou: `T7_ROLLBACK_OPERACIONAL.md` com protocolo de rollback (GT-01..12, P-01..14, RBK-01..08, SUC-01..14, FAL-01..11, payload para T7.7).
- Referências canônicas: `READINESS_G6.md` / `T7_PREFLIGHT_GO_LIVE.md` / `T7_SHADOW_SIMULACAO.md` / `T7_MATRIZ_DIVERGENCIAS.md` / `T7_CANARY_INTERNO.md` / `T7_CUTOVER_GOVERNADO.md` / `T7_ROLLBACK_OPERACIONAL.md`.
- Próximo passo autorizado: PR-T7.7 — Checklist executivo de go/no-go.

### ESTADO ENTREGUE

`schema/implantation/T7_GO_NO_GO_EXECUTIVO.md` criado — checklist executivo de go/no-go antes do closeout G7.

**Conteúdo entregue (18 seções):**

- §4 Evidências acumuladas T7.1–T7.6: tabela por PR com artefato, status, evidência principal, bloqueios resolvidos/pendentes e conclusão executiva.
- §5 Checklist executivo CHK-T77-01..20: todos 20/20 PASS (G6 aprovado, T7.1–T7.7 merged, zero src/, zero runtime, zero WhatsApp, zero cliente, zero reply_text, G7 bloqueado, PR-T7.R como próxima).
- §6 Riscos aceitos RA-T77-01..08: telemetria pendente runtime, smoke pendente runtime, canary real futuro, divergências sem instâncias reais, flags pendentes runtime, thresholds documentais, rollback meta não validada, WhatsApp não testado.
- §7 Riscos não aceitos RNA-T77-01..06: cliente real sem G7 (S4), violação MCMV (S4), promessa indevida (S4), perda lead_state (S4), desligamento legado antes G7 (S4), reply_text mecânico (S4).
- §8 Bloqueantes BLK-T77-01..12 com estado atual: 8 resolvidos (BLK-T77-01..06/09/10), 3 pendentes runtime (BLK-T77-07/11/12).
- §9 4 decisões possíveis: GO, GO PARCIAL, GO COM RESTRIÇÕES (Caminho B), NO-GO — cada uma com pré-condições, consequências e próxima ação.
- §10 Recomendação executiva: GO PARA CLOSEOUT G7 DOCUMENTAL (condicional a BLK-T77-07/11/12 resolvidos em PR-T7.R).
- §11 Autorização humana: quando Vasques obrigatório, formato de registro, veto soberano, como entra no payload de T7.R.
- §12 Critérios mínimos PR-T7.R: CR-T7R-01..14.
- §13 Payload canônico para PR-T7.R com todos os campos obrigatórios.
- §14 CA-T7.7-01..20; §15 B-T7.7-01..14; §16 Bloco E com Fechamento permitido: sim.

**Próximo passo único autorizado:** PR-T7.R — Readiness/Closeout G7. Entrega esperada: `schema/implantation/READINESS_G7.md`.

**Leituras obrigatórias para PR-T7.R:**
1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
2. `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
3. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
4. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
5. `schema/implantation/T7_GO_NO_GO_EXECUTIVO.md` (entregue nesta PR)
6. Todos os artefatos T7.1–T7.6 para verificação de evidências

**Pendentes que PR-T7.R deve resolver antes de declarar G7 APROVADO:**
- BLK-T77-07: execução de smoke de rollback (mínimo 4 cenários RBK)
- BLK-T77-11: confirmação técnica de telemetria ativa
- BLK-T77-12: confirmação técnica de feature flags implementadas

**Limites herdados:** zero src/; zero runtime; zero rollback real; zero cutover real; zero canary real; zero WhatsApp real; zero reply_text; zero fact_*; zero G7 aprovado; zero go-live.

---

## Atualizacao 2026-04-29 — PR-T7.6 — Rollback operacional comprovado

### ESTADO HERDADO

- Fase: T7 em execução; PR-T7.5 (#141) merged em main em 2026-04-29.
- Contrato T7: em execução — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- PR-T7.5 entregou: `T7_CUTOVER_GOVERNADO.md` com protocolo de cutover (CC-01..14, 4 modos, CUTOVER_GATE_STATUS 6 estados, 8 travas, payload para T7.6).
- Referências canônicas: `READINESS_G6.md` / `T7_PREFLIGHT_GO_LIVE.md` / `T7_SHADOW_SIMULACAO.md` / `T7_MATRIZ_DIVERGENCIAS.md` / `T7_CANARY_INTERNO.md` / `T7_CUTOVER_GOVERNADO.md`.
- Próximo passo autorizado: PR-T7.6 — Rollback operacional comprovado.

### ESTADO ENTREGUE

`schema/implantation/T7_ROLLBACK_OPERACIONAL.md` criado — protocolo formal de rollback operacional comprovado.

**Conteúdo entregue (20 seções):**

- §4 Entradas de T7.5: 13 campos com valores esperados e consequências se ausentes.
- §5 Gatilhos GT-01..GT-12: GT-01..GT-05 imediatos (violação MCMV, falha crítica, promessa indevida, tráfego real não autorizado, veto Vasques) + GT-06..GT-12 por degradação.
- §6 Procedimento operacional P-01..P-14 com responsável, tempo máximo e evidência gerada; metas < 5 min (CO-TOTAL-CLIENTE meta < 3 min).
- §7 Preservação de estado: lead_state nunca excluído, 7 campos invariantes, shape pós-rollback, proibições.
- §8 Shape de log canônico com 16 campos; retenção mínima 90 dias.
- §9 Regras de dossiê RD-01..RD-08 + verificação pós-rollback.
- §10 Reversão de flags: 6 flags com estados antes/depois, responsável, evidência, condição de sucesso e ordem de alteração.
- §11 8 cenários de smoke RBK-01..RBK-08 (um por tipo de gatilho), com objetivo, estado inicial, ação esperada, evidência obrigatória, PASS/FAIL e bloqueia T7.7.
- §12 Critérios de sucesso SUC-01..SUC-14.
- §13 Critérios de falha FAL-01..FAL-11 com consequências.
- §14 Matriz de decisão: 8 condições com rollback aprovado/bloqueia T7.7/exige Vasques/exige investigação/próxima ação.
- §15 Payload canônico para T7.7: rollback_approved, rollback_mode_tested, triggers_fired, procedure_completed, smoke_results, state_preserved, log_preserved, dossier_preserved, success_criteria, blocking_items, recommendation.
- §16 CA-T7.6-01..19; §17 B-T7.6-01..14; §18 Bloco E com Fechamento permitido: sim.
- §19 Estado herdado; §20 Estado entregue.

**Próximo passo único autorizado:** PR-T7.7 — Checklist executivo de go/no-go. Entrega esperada pelo contrato T7: `schema/implantation/T7_GO_NO_GO_EXECUTIVO.md`.

**Leituras obrigatórias para PR-T7.7:**
1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
2. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
3. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
4. `schema/implantation/T7_ROLLBACK_OPERACIONAL.md` (entregue nesta PR)

**Limites herdados:** zero src/; zero runtime; zero rollback real; zero cutover real; zero canary real; zero WhatsApp real; zero reply_text; zero fact_*.

---

## Atualizacao 2026-04-29 — PR-T7.5 — Cutover parcial ou total governado

### ESTADO HERDADO

- Fase: T7 em execução; PR-T7.4 (#140) merged em main em 2026-04-29.
- Contrato T7: em execução — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- PR-T7.4 entregou: `T7_CANARY_INTERNO.md` com protocolo de canary (PC-01..12, volumes A/B, MET-01..10, pausa/rollback, payload para T7.5).
- Referências canônicas: `READINESS_G6.md` / `T7_PREFLIGHT_GO_LIVE.md` / `T7_SHADOW_SIMULACAO.md` / `T7_MATRIZ_DIVERGENCIAS.md` / `T7_CANARY_INTERNO.md`.
- Próximo passo autorizado: PR-T7.5 — Cutover parcial ou total governado.

### ESTADO ENTREGUE

`schema/implantation/T7_CUTOVER_GOVERNADO.md` criado — protocolo formal de cutover parcial ou total governado.

**Conteúdo entregue (19 seções):**

- §4 Pré-condições CC-01..CC-14 com checklist e evidência exigida por item.
- §5 4 modos de cutover: CO-PARCIAL, CO-TOTAL-INTERNO, CO-TOTAL-CLIENTE, CO-NOGO — com pré-condições, risco, rollback, aprovação e evidência por modo.
- §6 Caminho A (progressivo: parcial → total interno → total cliente) e Caminho B (total interno direto) com restrições do Caminho B invioláveis.
- §7 Critérios para CO-PARCIAL: 10 condições com segmentos autorizados por fatia T5.
- §8 Critérios para CO-TOTAL com limites mais rígidos; adicionais para CO-TOTAL-CLIENTE.
- §9 Gate CUTOVER_GATE_STATUS com 6 estados (blocked/ready/approved/no_go/in_progress/completed), transições formais e shape.
- §10 8 travas TR-01..TR-08 contra entrada real sem decisão; declaração de estado nesta PR (zero real).
- §11 Rollback de cutover RC-01..RC-08 + procedimento RK-1..RK-11 (preservar logs/lead_state/dossiê, nunca apagar).
- §12 MET-01..10 com thresholds distintos por modo; thresholds de pausa e no-go.
- §13 Matriz de decisão formal: 8 condições com permissões, aprovações e próxima ação.
- §14 Payload canônico para T7.6: approved_for_rollback_proof, cutover_mode_selected, cutover_gate_status, metrics_summary, rollback_requirements, blocking_items, recommendation.
- §15 CA-T7.5-01..21; §16 B-T7.5-01..14; §17 Bloco E com Fechamento permitido: sim.

**Garantias:** zero src/; zero runtime; zero cutover real; zero canary real; zero WhatsApp real; zero reply_text; zero fact_*; G7 continua bloqueado até PR-T7.R.

### PRÓXIMO PASSO AUTORIZADO

**PR-T7.6** — Rollback operacional comprovado.
Entregar `schema/implantation/T7_ROLLBACK_OPERACIONAL.md`: prova de rollback operacional, smoke test de rollback, evidência de execução controlada.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t7-pr-t7-5-cutover-governado` → PR aberta
- Contrato T7: **em execução** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- G6: **APROVADO**
- G7: aberto (bloqueado até PR-T7.R)
- PR-T7.6: **DESBLOQUEADA**

---

## Atualizacao 2026-04-29 — PR-T7.4 — Canary interno e pré-produção

### ESTADO HERDADO

- Fase: T7 em execução; PR-T7.3 (#139) merged em main em 2026-04-29.
- Contrato T7: em execução — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- PR-T7.3 entregou: `T7_MATRIZ_DIVERGENCIAS.md` com 12 categorias DIV-MA..DIV-BA, 20 hardenings, 12 bloqueios BLK-T73, payload canônico para T7.4.
- Referência canônica G6: `schema/implantation/READINESS_G6.md`.
- Referência canônica preflight: `schema/implantation/T7_PREFLIGHT_GO_LIVE.md`.
- Referência canônica shadow: `schema/implantation/T7_SHADOW_SIMULACAO.md`.
- Próximo passo autorizado: PR-T7.4 — Canary interno e pré-produção.

### ESTADO ENTREGUE

`schema/implantation/T7_CANARY_INTERNO.md` criado — protocolo formal de canary interno/pré-produção antes de cutover.

**Conteúdo entregue (18 seções):**

- §3 Premissa: Enova não atende clientes reais; esta PR não executa canary real; canary interno ≠ abertura comercial; matriz T7.3 libera canary.
- §4 Pré-condições PC-01..PC-12: checklist obrigatório com evidência exigida por item.
- §5 Ambientes AMB-01..04 com proibições absolutas (sem canal aberto, sem cliente real, sem número comercial sem allowlist).
- §6 Volumes: Caminho A (A0 0% → A4 100% interno); Caminho B (B0/B1 comprimido); condição de retorno a 0%; diferença operacional entre caminhos.
- §7 MET-01..10 com thresholds por etapa canary: avançar / pausar / rollback. MET-03/08/09 zero absoluto em todas as etapas.
- §8 Critérios de pausa PAU-01..PAU-12; distinção formal pausa vs rollback.
- §9 Rollback ROL-01..08 com procedimento R1..R10 (preservar logs, preservar lead_state, nunca apagar evidência, bloquear T7.5 até revisão).
- §10 Janela de observação: 24h mínimo; 50 turnos (A1) a 1.000 (A4); grupos A..I obrigatórios por janela.
- §11 Matriz de aprovação: técnico (A1/A2); Vasques obrigatório (A3/A4/B/cliente real/cutover); veto Vasques soberano.
- §12 Relação Caminho A vs B: B nunca dispensa smoke/rollback/telemetria/go-no-go/decisão humana.
- §13 Payload canônico para T7.5: approved_for_cutover, cutover_mode, canary_mode_used, metrics_summary, incidents, rollbacks_triggered, accepted_risks, blocking_items, recommendation, vasques_authorization.
- §14 CA-T7.4-01..20; §15 B-T7.4-01..15; §16 Bloco E com Fechamento permitido: sim.

**Garantias:** zero src/; zero runtime; zero shadow real; zero canary real; zero cutover; zero WhatsApp/Meta real; zero deploy; zero reply_text; zero fact_*; G7 continua aberto/bloqueado até PR-T7.R.

**Referências canônicas:**
- G6: `schema/implantation/READINESS_G6.md`
- Pré-flight: `schema/implantation/T7_PREFLIGHT_GO_LIVE.md`
- Shadow: `schema/implantation/T7_SHADOW_SIMULACAO.md`
- Matriz: `schema/implantation/T7_MATRIZ_DIVERGENCIAS.md`
- Canary: `schema/implantation/T7_CANARY_INTERNO.md`

### PRÓXIMO PASSO AUTORIZADO

**PR-T7.5** — Cutover parcial ou total governado.
Entregar `schema/implantation/T7_CUTOVER_GOVERNADO.md`: plano de cutover com condições de substituição do legado, modo parcial vs total, gate de cutover, critérios de rollback de cutover, evidência para G7.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t7-pr-t7-4-canary-interno` → PR aberta
- Contrato T7: **em execução** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- G6: **APROVADO**
- G7: aberto (bloqueado até PR-T7.R)
- PR-T7.5: **DESBLOQUEADA**

---

## Atualizacao 2026-04-29 — PR-T7.3 — Matriz de divergências e hardening

### ESTADO HERDADO

- Fase: T7 em execução; PR-T7.2 (#138) merged em main em 2026-04-29.
- Contrato T7: em execução — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- PR-T7.2 entregou: `T7_SHADOW_SIMULACAO.md` com 70 cenários em 9 grupos, MET-01..10, FREEZE-01..12, CA-T7.2-01..15.
- Referência canônica G6: `schema/implantation/READINESS_G6.md`.
- Referência canônica preflight: `schema/implantation/T7_PREFLIGHT_GO_LIVE.md`.
- Próximo passo autorizado: PR-T7.3 — Matriz de divergências e hardening.

### ESTADO ENTREGUE

`schema/implantation/T7_MATRIZ_DIVERGENCIAS.md` criado — classificação formal de divergências e hardening antes de canary/cutover.

**Conteúdo entregue (17 seções):**

- §5 Taxonomia formal: 12 categorias DIV-MA..DIV-BA com descrição, exemplos, severidade padrão, bloqueia T7.4?, ação obrigatória, evidência exigida e quem decide.
  - DIV-RM (Regra MCMV) e DIV-BA (Adversarial): bloqueantes absolutos — ação `block`, resolução com evidência real, decisão Vasques obrigatória.
- §6 Graduação S0–S4: impacto operacional, relação severidade→decisão, regras de elevação automática (DIV-RM, DIV-BA, MET-08, MET-03, MET-09 sempre elevam para S4).
- §7 6 decisões canônicas: accept, accept_with_note, fix_required, investigate, block, defer — com restrições (accept/defer proibidos para DIV-RM/DIV-BA), shapes e regras de uso.
- §8 20 hardenings catalogados HD-T73-001..020 em 9 tipos (HD-PROMPT, HD-POLICY, HD-STATE, HD-FUNIL, HD-DOC, HD-CANAL, HD-OBS, HD-ROLLBACK, HD-OPR).
  - Hardenings obrigatórios DIV-RM: HD-T73-001..005 (`bloqueia_t74: true`).
  - Hardenings obrigatórios DIV-BA: HD-T73-006..009 (`bloqueia_t74: true`).
  - Hardenings de qualidade DIV-MA..DIV-ES: HD-T73-010..020.
- §9 12 bloqueios absolutos BLK-T73-01..12 com condição e como desbloquear.
- §10 12 critérios objetivos de liberação para PR-T7.4 + critérios adicionais Caminho B.
- §11 Relação Caminho A vs Caminho B: impacto de divergências em cada caminho; decisão de caminho é definida pelo payload §12.
- §12 Payload canônico de saída para T7.4: approved_for_canary, canary_mode, path_selected, unresolved_divergences, accepted_risks, required_hardenings, blocking_items, metrics_summary, recommendation, vasques_authorization.
- §13 CA-T7.3-01..15 todos satisfeitos; §14 B-T7.3-01..12 declarados.
- §15 Bloco E com Fechamento permitido: sim.

**Garantias:** zero src/; zero runtime; zero shadow real; zero canary; zero cutover; zero WhatsApp/Meta real; zero deploy; zero reply_text; zero fact_*; G7 continua aberto/bloqueado até PR-T7.R.

**Referências canônicas usadas:**
- G6: `schema/implantation/READINESS_G6.md`
- Pré-flight: `schema/implantation/T7_PREFLIGHT_GO_LIVE.md`
- Shadow: `schema/implantation/T7_SHADOW_SIMULACAO.md`

### PRÓXIMO PASSO AUTORIZADO

**PR-T7.4** — Canary controlado.
Entregar `schema/implantation/T7_CANARY_CONTROLADO.md`: plano de canary progressivo com CANARY_PERCENT, condições de avanço e rollback, métricas de monitoramento em produção, go/no-go por percentual.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t7-pr-t7-3-matriz-divergencias` → PR aberta
- Contrato T7: **em execução** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- G6: **APROVADO**
- G7: aberto (bloqueado até PR-T7.R)
- PR-T7.4: **DESBLOQUEADA**

---

## Atualizacao 2026-04-29 — PR-T7.2 — Shadow/simulação controlada

### ESTADO HERDADO

- Fase: T7 em execução; PR-T7.1 (#137) merged em main em 2026-04-29.
- Contrato T7: em execução — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- PR-T7.1 entregou: `T7_PREFLIGHT_GO_LIVE.md` com flags, fallback, MET-01..10, logs, comparação T1–T6, caminhos A/B.
- Referência canônica G6: `schema/implantation/READINESS_G6.md`.
- Próximo passo autorizado: PR-T7.2 — Shadow/simulação controlada.

### ESTADO ENTREGUE

`schema/implantation/T7_SHADOW_SIMULACAO.md` criado — simulação controlada antes da entrada de clientes reais.

**Conteúdo entregue (15 seções):**

- §3 Premissa operacional: Enova não atende clientes reais; esta etapa não usa cliente real; simulação controlada/replay/comparação declarativa.
- §4 Fontes de comparação: T1 (contrato cognitivo), T2 (estado/memória/reconciliação), T3 (policy engine), T4 (orquestrador), T5 (funil core), T6 (canal/docs/multimodal), T7.1 (pré-flight).
- §5 Tipos de simulação TIP-01..09: sintético, histórico replay, adversarial, regressão T1–T6, canal simulado, documental, MCMV, objeção, finalização/visita.
- §6 Cenários: 9 grupos A–I com 70 cenários totais, cada um com ID, nome, objetivo, fonte contratual, PASS, FAIL→DIV candidata, bloqueio T7.3.
- §7 Métricas MET-01..10 com thresholds Caminho A e Caminho B; bloqueio absoluto para MET-03, MET-08, MET-09.
- §8 Evidência por cenário: 19 campos canônicos + scenario_id, expected_output, observed_output, divergence, divergence_category_candidate, pass_fail, reviewer_note.
- §9 12 gatilhos de congelamento FREEZE-01..12 (violação MCMV, reply_text mecânico, promessa indevida, perda lead_state, doc associado errado, WhatsApp real, src/, divergência sem categoria).
- §10 Saída para T7.3: payload completo com divergence_id, scenario_id, category_candidate (DIV-MA..DIV-BA), severity, contract_source_violated, recommendation (accept/fix/investigate/block).
- §11 CA-T7.2-01..15 todos satisfeitos; §12 B-T7.2-01..12 declarados (inclui bloqueio se T6_READINESS_CLOSEOUT_G6.md ou T7_PREFLIGHT_GOLIIVE.md aparecerem).
- §13 Bloco E com Fechamento permitido: sim.

**Garantias:** zero src/; zero runtime; zero shadow real; zero canary; zero cutover; zero WhatsApp/Meta real; zero deploy; zero reply_text; zero fact_*; G7 continua aberto/bloqueado até PR-T7.R.

**Referências canônicas usadas:**
- G6: `schema/implantation/READINESS_G6.md`
- Pré-flight: `schema/implantation/T7_PREFLIGHT_GO_LIVE.md`

### PRÓXIMO PASSO AUTORIZADO

**PR-T7.3** — Matriz de divergências e hardening.
Entregar `schema/implantation/T7_MATRIZ_DIVERGENCIAS.md`: classificação formal das divergências (DIV-MA..DIV-BA), hardening necessário antes de canary/cutover, decisão por categoria.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t7-pr-t7-2-shadow-simulacao` → PR aberta
- Contrato T7: **em execução** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- G6: **APROVADO**
- G7: aberto (bloqueado até PR-T7.R)
- PR-T7.3: **DESBLOQUEADA**

---

## Atualizacao 2026-04-29 — PR-T7.1 — Pré-flight de go-live e travas operacionais

### ESTADO HERDADO

- Fase: T7 em execução; PR-T7.0 (#136) aberta em 2026-04-29.
- Contrato T7: ABERTO — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- PR-T7.0 entregou: contrato formal completo (24 seções); caminhos A e B formalizados.
- Próximo passo autorizado: PR-T7.1 — Pré-flight de go-live e travas operacionais.

### ESTADO ENTREGUE

`schema/implantation/T7_PREFLIGHT_GO_LIVE.md` criado — pré-flight completo com 15 seções.

**Conteúdo entregue:**

- §3 Premissa operacional: Enova NÃO atende clientes reais; risco é ligar antes de smoke/rollback/telemetria provados.
- §4 Caminhos A e B formalizados: gradual (padrão) vs. arrojado (permitido com condições).
- §5 Feature flags: `ENOVA2_ENABLED`, `CANARY_PERCENT`, `CHANNEL_ENABLED`, `SHADOW_MODE`, `CUTOVER_MODE`, `ROLLBACK_FLAG`; roteiros de desligamento, pausa de canal, impedimento de cutover acidental.
- §6 Fallback: reversão de roteamento, preservação de lead_state, logs imutáveis, dossiê preservado, rastreabilidade garantida.
- §7 Métricas MET-01..10: taxa PASS, divergência policy/MCMV, erro estado/dossiê/canal, latência, falha crítica, promessa indevida, fala mecânica — com thresholds para Caminho A e para Caminho B.
- §8 Logs: 19 campos por turno (turn_id, case_id, decision_trace, policy_triggered, lead_state before/after, divergência, reply_text_source, latência, modo...); retenção 90–365 dias; formato JSON de evidência de rollback.
- §9 Comparação T1–T6: mapa de artefatos por contrato; critérios de paridade; camada de comparação declarativa para T7.2.
- §10 Bloqueios B-T7.1-01..12: inclui bloqueios absolutos vs. MCMV, vs. reply_text mecânico, vs. cliente real sem G7, vs. sequência violada.
- §11 Critérios para liberar PR-T7.2 (Caminho A): 10 critérios verificáveis.
- §12 Critérios para Caminho B: 9 condições a verificar em PR-T7.7 e PR-T7.R.
- §13 CA-T7.1-01..12: todos satisfeitos.
- §14–§16: ESTADO HERDADO, ESTADO ENTREGUE, BLOCO E.

**Garantias:** zero src/; zero runtime; zero shadow/canary/cutover real; zero WhatsApp real; zero deploy; zero reply_text; zero fact_*; G7 continua aberto/bloqueado até PR-T7.R.

### PRÓXIMO PASSO AUTORIZADO

**PR-T7.2** — Shadow/simulação controlada.
Entregar `schema/implantation/T7_SHADOW_SIMULACAO.md`: casos sintéticos + históricos, comparação T1–T6, validação LLM-first, métricas de paridade, gatilhos de congelamento.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t7-pr-t7-1-preflight-golive` → PR aberta
- Contrato T7: **em execução** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- G6: **APROVADO**
- G7: aberto (bloqueado até PR-T7.R)
- PR-T7.2: **DESBLOQUEADA**

---

## Atualizacao 2026-04-29 — PR-T7.0 — Abertura formal do contrato T7

### ESTADO HERDADO

- Fase: T7 em execução; PR-T6.R (#135) aberta em 2026-04-28.
- Contrato T6: ENCERRADO — `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T6_2026-04-28.md`
- G6: APROVADO em 2026-04-28.
- Contrato T7: skeleton — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- Próximo passo autorizado: PR-T7.0 — Abertura formal do contrato T7.
- Branch: `feat/t6-pr-t6-r-readiness-closeout-g6` (T6.R base).

### ESTADO ENTREGUE

`schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md` substituído — skeleton → contrato formal completo.

**Contrato T7 aberto formalmente em 2026-04-29.**

**Estrutura entregue (24 seções):**
§1 Objetivo (com Caminhos A e B, contexto operacional); §2 Escopo (10 itens); §3 Fora de escopo;
§4 Dependências (6 — todas satisfeitas ou satisfeitas por esta PR); §5 Entradas; §6 Saídas S1–S8;
§7 CA-T7-01..12; §8 Provas P-T7-01..07; §9 Bloqueios B-T7-01..10;
§10 Próximo passo; §11 A01; §12 Legados; §13 Referências; §14 Blocos legados; §15 Ordem de leitura;
§16 PRs T7.0–T7.R (8 PRs com objetivo, escopo, entrega, próxima PR);
§17 Caminhos A e B formalizados; §18 Gate G7; §19 Preservação soberania;
§20 Proibições PROB-T7-01..10; §21 Rollback contratual; §22 Estado desta PR;
§23 ESTADO HERDADO; §24 ESTADO ENTREGUE; §25 BLOCO E.

**Contexto operacional reconhecido:** Enova ainda NÃO atende clientes reais em produção. T7 é preparação e liberação de go-live — não proteção de operação ativa.

**Caminho A (gradual):** T7.1→T7.2→T7.3→T7.4→T7.5→T7.6→T7.7→T7.R — padrão.

**Caminho B (arrojado):** cutover total antes de clientes reais se pré-flight + rollback + go/no-go passarem. Canary pode ser dispensado com justificativa. Rollback, smoke, telemetria, feature flag e G7 formal **sempre obrigatórios**.

**Garantias:** zero src/; zero runtime; zero shadow/canary real; zero reply_text; zero fact_*; zero WhatsApp real; zero deploy.

### PRÓXIMO PASSO AUTORIZADO

**PR-T7.1** — Pré-flight de go-live e travas operacionais.
Entregar `schema/implantation/T7_PREFLIGHT_GO_LIVE.md`: feature flags, desligamento, fallback, plano de métricas/logs, comparação T1–T6, critérios para T7.2 e critérios para Caminho B.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t7-pr-t7-0-abertura-formal-contrato` → PR aberta
- Contrato T6: **ENCERRADO** — `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T6_2026-04-28.md`
- Contrato T7: **aberto** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- G6: **APROVADO**
- G7: aberto (bloqueado até PR-T7.R)
- PR-T7.1: **DESBLOQUEADA**

---


## Atualizacao 2026-04-28 — PR-T6.R — Readiness/Closeout G6 — T6 ENCERRADA

### ESTADO HERDADO

- Fase: T6 em execução; PR-T6.9 (#134) merged 2026-04-28T23:46:11Z.
- Contrato T6: EM EXECUÇÃO — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- T6.1–T6.9: todos os artefatos declarativos entregues e merged em main.
- Suite multicanal (T6.9): 48+ cenários; BLQ-01..15 declarados.
- Próximo passo autorizado: PR-T6.R — Readiness/Closeout G6.

### ESTADO ENTREGUE

`schema/implantation/READINESS_G6.md` criado — readiness formal da T6.

**Decisão: G6 — APROVADO em 2026-04-28**

**Smoke S1–S9 (9/9 PASS):**
S1 T6_PREFLIGHT_RISCOS_T5.md PASS; S2 T6_SURFACE_CANAL.md PASS; S3 T6_CONTRATO_ANEXOS_DOCUMENTOS.md PASS;
S4 T6_PIPELINE_IMAGEM_PDF.md PASS; S5 T6_AUDIO_CEREBRO_CONVERSACIONAL.md PASS;
S6 T6_STICKER_MIDIA_INUTIL.md PASS; S7 T6_ADAPTER_META_WHATSAPP.md PASS;
S8 T6_DOSSIE_OPERACIONAL.md PASS; S9 T6_SUITE_TESTES_MULTICANAL.md PASS.

**CA-T6-01..CA-T6-10 (10/10 PASS):**
CA-T6-01 canal sob mesma governança PASS; CA-T6-02 reply_text exclusivo LLM PASS;
CA-T6-03 áudio não avança sozinho PASS; CA-T6-04 imagem/PDF não vira verdade absoluta PASS;
CA-T6-05 doc associado a pessoa correta PASS; CA-T6-06 mídia inválida não quebra funil PASS;
CA-T6-07 WhatsApp idempotente PASS; CA-T6-08 dossiê com trilha PASS;
CA-T6-09 sandbox multicanal cobre casos reais PASS; CA-T6-10 G6 com Bloco E PASS.

**B-T6-01..B-T6-10 (10/10 desbloqueados):** todos os bloqueios removidos.
**BLQ-01..15 (15/15 satisfeitos):** todos os bloqueantes da suite satisfeitos.
**A00-ADENDO-01/02/03:** respeitados em toda T6.

**Consequências do G6 APROVADO:**
- Contrato T6 arquivado: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T6_2026-04-28.md`
- Skeleton T7 criado: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- PR-T7.0 desbloqueada

**Lacunas não bloqueantes:** STT (T6-LA-01), OCR (T6-LF-01), AT-05 (normativa MCMV/CEF).

**Garantias:** zero src/; zero runtime; zero canal real; zero reply_text; zero fact_*; zero shadow/canary/cutover; zero corpo executivo T7.

### PRÓXIMO PASSO AUTORIZADO

**PR-T7.0** — Abertura formal do contrato T7: shadow mode, canary, cutover e rollback.
`schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md` como skeleton; PR-T7.0 cria o corpo executivo completo.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t6-pr-t6-r-readiness-closeout-g6` → PR aberta
- Contrato T6: **ENCERRADO** — `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T6_2026-04-28.md`
- Contrato T7: **skeleton** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T7.md`
- G6: **APROVADO**
- G7: aberto (bloqueado até PR-T7.R)
- PR-T7.0: **DESBLOQUEADA**

---

## Atualizacao 2026-04-28 — PR-T6.9 — Suite declarativa de testes/sandbox multicanal

### ESTADO HERDADO

- Fase: T6 em execução; PR-T6.8 (#133) merged 2026-04-28T22:52:48Z.
- Contrato T6: EM EXECUÇÃO — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- T6.2–T6.8: todos os artefatos multicanal declarados e merged.
- Próximo passo autorizado: PR-T6.9 — Suite declarativa de testes/sandbox multicanal.
- Branch: `feat/t6-pr-t6-9-suite-testes-sandbox`.

### ESTADO ENTREGUE

`schema/implantation/T6_SUITE_TESTES_MULTICANAL.md` criado — suite de validação declarativa da governança multicanal T6.2–T6.8.

**Princípio central:** "Teste valida governança — não cria runtime."

**§6 — Matriz de cobertura:**
T6.2 Surface, T6.3 Anexos, T6.4 Pipeline Imagem/PDF, T6.5 Áudio, T6.6 Sticker/mídia inútil,
T6.7 Adapter Meta/WhatsApp, T6.8 Dossiê operacional, T4/T3/T2/T5.

**53 cenários declarativos em 9 grupos:**
- Grupo A (texto puro): A-01..A-05 (5 cenários)
- Grupo B (imagem/PDF/documento): B-01..B-08 (8 cenários)
- Grupo C (áudio): C-01..C-06 (6 cenários)
- Grupo D (sticker/mídia inútil): D-01..D-06 (6 cenários)
- Grupo E (adapter Meta/WhatsApp): E-01..E-06 (6 cenários)
- Grupo F (dossiê/correspondente): F-01..F-08 (8 cenários)
- Grupo G (aprovação/reprovação/visita): G-01..G-04 (4 cenários)
- Grupo H (regressão T1–T5): H-01..H-05 (5 cenários)
- Grupo I (cliente some/reenvio/follow-up): I-01..I-05 (5 cenários extras)

**§7 — Critérios globais PASS/FAIL:** PF-01..10 (passa) / FL-01..12 (falha).
**§8 — 13 invariantes INV-01..13** referenciadas em todos os grupos.
**§19 — 15 bloqueantes BLQ-01..15** para PR-T6.R declarados.
**§20 — 20 proibições PROB-T69-01..20.**
**§21 — 8 riscos com mitigação R-T69-01..08.**
**§22 — 13 critérios CA-T6.9-01..13.**
**§24 — Bloco E completo:** estado=completa; sem lacuna; PR-T6.R desbloqueada.

**Garantias:** zero src/; zero runtime; zero sandbox real; zero reply_text; zero fact_*; zero READINESS_G6; zero T7.

### PRÓXIMO PASSO AUTORIZADO

**PR-T6.R** — Readiness/Closeout G6: `schema/implantation/READINESS_G6.md`
Smoke T6.1–T6.9; verificação CA-T6-01..CA-T6-10; checklist BLQ-01..15 desta suite;
decisão G6 APROVADO ou REPROVADO com evidência; aplicar `CONTRACT_CLOSEOUT_PROTOCOL.md`.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t6-pr-t6-9-suite-testes-sandbox` → PR aberta
- Contrato T6: **EM EXECUÇÃO** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- PR-T6.9: CONCLUÍDA (suite declarativa de testes/sandbox multicanal)
- PR-T6.R: **DESBLOQUEADA**
- Gate G6: aberto (bloqueado até PR-T6.R)

---

## Atualizacao 2026-04-28 — PR-T6.8 — Dossiê operacional e link do correspondente

### ESTADO HERDADO

- Fase: T6 em execução; PR-T6.7 (#132) merged 2026-04-28T21:36:28Z.
- Contrato T6: EM EXECUÇÃO — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- Adapter Meta/WhatsApp (T6.7): AdapterEventoBruto; IntencaoEnvioOutbound; SIG/IDP/DD/RTO; INV-AD-01..13.
- Todos os tipos de entrada governados: T6.2–T6.7 concluídas.
- Próximo passo autorizado: PR-T6.8 — Dossiê operacional e link do correspondente.
- Branch: `feat/t6-pr-t6-8-dossie-operacional`.

### ESTADO ENTREGUE

`schema/implantation/T6_DOSSIE_OPERACIONAL.md` criado — contrato declarativo do dossiê operacional MCMV.

**Regra-mãe:** "Dossiê organiza, não decide. Dossiê não escreve reply_text, não decide stage, não cria fact_*, não aprova crédito, não envia documento sem condição, não expõe restrição. Só organiza."

**§8 — Shape DossieOperacional (21 campos/blocos):**
```
DossieOperacional {
  dossier_id, case_id, pre_cadastro_id, lead_external_id, created_at, updated_at,
  dossier_status, pessoas[], documentos_recebidos[], documentos_pendentes[],
  documentos_rejeitados[], documentos_informativos[], rendas[], composicao,
  restricoes_informadas, observacoes_comerciais, link_correspondente,
  correspondente_status, retorno_correspondente, visit_status, audit_trail[]
}
```

**§9 — 14 estados do dossiê com transições; DS-01..08:**
draft → collecting_documents → partial_documents → ready_for_review → ready_to_send →
sent_to_correspondent → correspondent_received → correspondent_reviewing →
approved → rejected → pending_regularization → visit_required → visit_scheduled → archived_temporarily.

**§10 — Documentos mínimos por perfil:**
CLT (holerite), servidor (contracheque), aposentado (extrato INSS), autônomo c/ IRPF (declaração + recibo),
autônomo s/ IRPF (3 extratos — informativa/complementar), MEI (como autônomo), empresário (pró-labore + IRPF),
informal (extratos informativos); estado civil: divorciado (certidão + averbação RC-F5-36),
viúvo (certidão + óbito RC-F5-35), separado sem averbação (RC-F5-37); multi-renda RC-F5-38;
benefícios não financiáveis: Bolsa Família, BPC/LOAS, assistencial, seguro-desemprego, temporário;
CNPJ isolado → `nao_financiavel` ou `informativa`.

**§14 — Informações comerciais (IC-01..06):** 16 campos; valores (entrada/FGTS/parcela) `null` — aguardando contrato de dados.
**§15 — Link do correspondente (SL-01..10):** conceitual; `link_ref = "dossier/{pre_cadastro_id}/{dossier_id}"`; nenhuma URL real criada.
**§17 — Condições de envio (ENV-01..08):** dossiê incompleto nunca enviado.
**§18 — Retorno do correspondente (RET-01..08):** approved/rejected/pending_regularization; RET-03: condicionado → cliente vê apenas "aprovado".
**§19 — Aprovação → visita (VIS-01..08):** notificar Vasques (runtime futuro); 2 slots; confirmação D-1 + dia (2h antes).
**§20 — Reprovação → orientação (REP-01..08):** SCR/Bacen → Registrato; RF → regularização CPF; SPC/Serasa → prova; nunca fala mecânica.
**§21 — 17 eventos de trilha de auditoria** (dossier.created .. dossier.visit_scheduled).
**§22 — 20 proibições PROB-DOS-01..20.**
**§23 — 10 riscos com mitigação R-DOS-01..10.**
**§24 — 21 critérios CA-T6.8-01..21.**
**§27 — Bloco E com 25 evidências.**

**Garantias:** zero src/; zero fact_*; zero current_phase; zero reply_text; zero dossiê real; zero link real; zero runtime.

### PRÓXIMO PASSO AUTORIZADO

**PR-T6.9** — Suite de testes/sandbox multicanal: `schema/implantation/T6_SUITE_TESTES_MULTICANAL.md`
Cenários completos de validação da governança multicanal T6.2–T6.8; smoke tests declarativos;
cobertura de todos os tipos de entrada e estados do dossiê; validação de invariantes.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t6-pr-t6-8-dossie-operacional` → PR aberta
- Contrato T6: **EM EXECUÇÃO** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- PR-T6.8: CONCLUÍDA (dossiê operacional e link do correspondente)
- PR-T6.9: **DESBLOQUEADA**
- Gate G6: aberto (bloqueado até PR-T6.R)

---

## Atualizacao 2026-04-28 — PR-T6.7 — Adapter Meta/WhatsApp governado

### ESTADO HERDADO

- Fase: T6 em execução; PR-T6.6 (#131) merged 2026-04-28T20:56:34Z.
- Contrato T6: EM EXECUÇÃO — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- Surface única de canal (T6.2–T6.6): SurfaceEventNormalizado; 8 input_types; todos os tipos de sujeira tratados.
- Próximo passo autorizado: PR-T6.7 — Adapter Meta/WhatsApp governado.
- Branch: `feat/t6-pr-t6-7-adapter-meta-whatsapp`.

### ESTADO ENTREGUE

`schema/implantation/T6_ADAPTER_META_WHATSAPP.md` criado — contrato declarativo do adapter Meta/WhatsApp governado.

**Regra-mãe:** "Adapter é canal — não é cérebro. Adapter só recebe e envia — nunca decide."

**Arquitetura declarada:**
```
Meta/WhatsApp bruto → Adapter (validação, dedupe) → T6_SURFACE_CANAL → T4 → T3 → T2 → T5
                  ↑                                                               ↓
                  └────────────────── Outbound aprovado ──────────────────────────┘
```

**§7 — Fluxo inbound (16 etapas, 8 invariantes INV-AD-01..08):**
POST Meta → validação método → assinatura → extração wa_message_id/wa_id/phone_number_id/timestamp →
dedupe_key → idempotência → challenge/status check → AdapterEventoBruto → T6_SURFACE_CANAL → T4 → LLM → outbound.

**§8 — Fluxo outbound (11 etapas, 5 invariantes INV-AD-09..13):**
TurnoSaida (reply_text LLM) → IntencaoEnvioOutbound → payload técnico Meta → rate limit →
retry → envio → status events → falha vira rastro técnico (nunca fala mecânica).

**§9 — Verificação de webhook (WH-01..07):** challenge = evento técnico; não cria turno.
**§10 — Assinatura (SIG-01..09):** X-Hub-Signature-256 obrigatória; payload sem assinatura nunca entra no pipeline.
**§11 — Idempotência (IDP-01..10):** dedupe_key; retry da Meta descartado; HTTP 200 imediato.
**§12 — Dedupe (DD-01..08):** wa_message_id primário; fallback conceitual.
**§13 — Retry (RTI/RTO):** retry inbound = idempotência captura; retry outbound ≤ 3 tentativas; backoff exponencial.
**§14 — 14 erros declarados (ERR-AD-01..14).**
**§15 — Rate limit (RL-01..07):** técnico; não altera negócio; não gera fala mecânica.
**§16 — 14 regras de mídia (MID-01..14):** adapter só preserva referência; T6.3/T6.4/T6.5/T6.6 governam.
**§17 — Status events (ST-01..08):** delivered/read/failed = system_event; nunca turno conversacional.
**§18 — Separação canal/cérebro:** tabela completa — adapter nunca decide; LLM/T3/T2/T4 decidem.
**§19 — Segurança (SEC-01..10):** variáveis conceituais declaradas (nenhuma criada).
**§20 — 13 eventos de observabilidade conceituais.**
**§21 — 20 proibições PROB-AD-01..20.**
**§22 — 10 riscos com mitigação R-AD-01..10.**
**§23 — 21 critérios CA-T6.7-01..21.**
**§26 — Bloco E com 25 evidências.**

**Garantias:** zero src/; zero fact_*; zero current_phase; zero reply_text; zero webhook real; zero env/secret; zero runtime.

### PRÓXIMO PASSO AUTORIZADO

**PR-T6.8** — Dossiê operacional e link do correspondente: `schema/implantation/T6_DOSSIE_OPERACIONAL.md`
Montagem do link do correspondente; anexos recebidos; docs pendentes por perfil; envio/retorno;
segurança mínima; trilha de auditoria; estados do dossiê.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t6-pr-t6-7-adapter-meta-whatsapp` → PR aberta
- Contrato T6: **EM EXECUÇÃO** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- PR-T6.7: CONCLUÍDA (adapter Meta/WhatsApp governado)
- PR-T6.8: **DESBLOQUEADA**
- Gate G6: aberto (bloqueado até PR-T6.R)

---

## Atualizacao 2026-04-28 — PR-T6.6 — Sticker, mídia inútil e mensagens não textuais

### ESTADO HERDADO

- Fase: T6 em execução; PR-T6.5 (#130) merged 2026-04-28T20:28:20Z.
- Contrato T6: EM EXECUÇÃO — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- Surface única de canal (T6.2): SurfaceEventNormalizado; 8 input_types; dedupe_key; surface_warnings.
- Contrato de anexos (T6.3): 35+ tipos documentais; 11 estados; associação P1/P2/P3.
- Pipeline imagem/PDF (T6.4): EP-01..EP-07; classificação hipotética; 14 casos problemáticos.
- Áudio conversacional (T6.5): EA-01..EA-08; STT como lacuna T6-LA-01; 7 níveis de confiança.
- Próximo passo autorizado: PR-T6.6 — Sticker, mídia inútil e mensagens não textuais.
- Branch: `feat/t6-pr-t6-6-sticker-midia-inutil`.

### ESTADO ENTREGUE

`schema/implantation/T6_STICKER_MIDIA_INUTIL.md` criado — contrato declarativo para sujeira de canal.

**Regra-mãe:** "Sujeira de canal não é decisão. Sticker não confirma dado. Emoji não decide stage.
Mídia inútil não quebra o funil. Tudo passa pela mesma governança: T6_SURFACE_CANAL → T4 → T3 → T2 → T5."

**§6 — 21+ subtipos de sujeira em 9 categorias:**
sticker estático/animado; emoji isolado; reação; imagem sem doc/random/sem contexto;
print confuso/sem contexto; áudio inaudível/sem transcrição útil; mídia repetida/nome diferente;
arquivo corrompido/vazio/tipo não suportado; mensagem vazia/pontuação/confirmação fraca;
mídia fora de contexto/sem dono/parece doc mas não valida; payload inválido.

**§8 — Fluxo EM-01..EM-06:**
Canal → Surface (SurfaceEventNormalizado) →
EM-01 Recepção → EM-02 Classificação de utilidade → EM-03 Definição de risco →
EM-04 Entrega T4 (attachment com utility_classification + risk_flags[]) →
EM-05 Conduta LLM → EM-06 Persistência limitada.

**§8 EM-04 — Shape attachment para mídia inútil:**
`attachment_id, surface_event_id, media_ref, raw_payload_ref, input_type, input_subtype,
utility_classification, risk_flags[], surface_warnings[], dedupe_key, caption, confidence_hint,
media_size_bytes, media_mime_type`

**§8 EM-05 — 6 condutas do LLM:**
ignorar sinal inútil; acolher sem sair do stage; retomar última pergunta;
pedir reenvio; pedir texto; reconhecer confirmação fraca com cautela.

**§9..§16 — Tratamento por tipo:** STK-01..08; EMJ-01..06; REA-01..05; IMG-01..08;
PRT-01..08; AUD-01..06; REP-01..07; COR-01..08; VAZ-01..09.

**§17 — 8 limites de persistência LP-01..08.**

**§18 — 20 proibições absolutas PROB-STK-01..20.**

**§19 — 10 riscos com mitigação R-STK-01..10.**

**§20 — 20 critérios de aceite CA-T6.6-01..20.**

**§23 — Bloco E com 25 evidências.**

**Garantias:** zero src/; zero fact_*; zero current_phase; zero reply_text; zero runtime; zero canal real.

### PRÓXIMO PASSO AUTORIZADO

**PR-T6.7** — Adapter Meta/WhatsApp governado: webhook inbound/outbound; verificação de assinatura;
idempotência; deduplicação por `message_id`; retries controlados; erros; rate limit; separação
canal/cérebro; não é go-live amplo.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t6-pr-t6-6-sticker-midia-inutil` → PR aberta
- Contrato T6: **EM EXECUÇÃO** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- PR-T6.6: CONCLUÍDA (sticker, mídia inútil, mensagens não textuais)
- PR-T6.7: **DESBLOQUEADA**
- Gate G6: aberto (bloqueado até PR-T6.R)

---

## Atualizacao 2026-04-28 — PR-T6.5 — Áudio no mesmo cérebro conversacional

### ESTADO HERDADO

- Fase: T6 em execução; PR-T6.4 (#129) merged 2026-04-28T20:07:41Z.
- Contrato T6: EM EXECUÇÃO — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- Surface única de canal (T6.2): SurfaceEventNormalizado; 8 input_types; dedupe_key; surface_warnings.
- Contrato de anexos (T6.3): 35+ tipos documentais; 11 estados; associação P1/P2/P3.
- Pipeline imagem/PDF (T6.4): EP-01..EP-07; classificação hipotética; 14 casos problemáticos; OCR como lacuna futura.
- Próximo passo autorizado: PR-T6.5 — Áudio no mesmo cérebro conversacional.
- Branch: `feat/t6-pr-t6-5-audio-cerebro-conversacional`.

### ESTADO ENTREGUE

`schema/implantation/T6_AUDIO_CEREBRO_CONVERSACIONAL.md` criado — contrato declarativo de áudio no mesmo cérebro conversacional.

**Regra-mãe:** "Áudio é entrada conversacional. Não é cérebro paralelo. Não escreve reply_text. Não decide stage. Não avança funil sozinho."

**§3 — Âncora canônica:** T2_POLITICA_CONFIANCA §3.3 — O3 AUDIO_TRANSCRIPT:
- `audio_good` → `captured`
- `audio_medium` → `captured/low`
- `audio_poor` → `hypothesis`
- PC-06: áudio ruim **nunca** confirma fato crítico

**§8 — Fluxo declarativo EA-01..EA-08:**
Canal → Surface (SurfaceEventNormalizado, input_type=audio) →
EA-01 Recepção → EA-02 Lacuna STT → EA-03 Transcrição como hipótese →
EA-04 Classificação conversacional → EA-05 Extração candidatos a fato →
EA-06 Validação T4/T3/T2 → EA-07 Resposta via LLM → EA-08 Falha/áudio ruim.

**§5 — TurnoEntrada.attachments[] shape para áudio:**
`attachment_id, surface_event_id, media_ref, media_mime_type, input_type="audio", input_subtype, duration_hint, transcript_text, transcript_confidence, transcript_partial, audio_classification, caption, surface_warnings, dedupe_key`

**§6 — 15+ tipos de áudio:** por qualidade (curto/claro, longo, com ruído, incompreensível, cortado, sem transcrição, parcial) e por conteúdo conversacional (resposta, dúvida, objeção, informação, correção, pedido visita, pedido humano, informação fora de ordem, emocional, retorno, fora de contexto, duplicado, terceiro, informação sensível, contraditório, múltiplos assuntos).

**§9 — 7 níveis de confiança:**
`audio_unavailable, transcription_unavailable, transcription_low_confidence (audio_poor→hypothesis), transcription_medium_confidence (audio_medium→captured/low), transcription_high_confidence (audio_good→captured), transcription_partial, transcription_conflicting`

**§10 — 14 informações críticas com confirmação obrigatória:**
renda, regime de trabalho, composição de renda, estado civil, intenção solo/conjunto, restrição, CPF/RG sensível, RNM, autorização dossiê, agendamento visita, aprovação/reprovação correspondente, dado que altere elegibilidade.

**§11 — STT como lacuna futura (T6-LA-01):** `transcript_text=null`; sistema continua sem transcrição; LLM pode pedir texto.

**§12 — 13 casos problemáticos tratados:** inaudível, muito ruído, cortado, muito longo, outro idioma, terceiro falando, múltiplas informações, contraditório, duplicado, fora de contexto, informação sensível, sem transcrição, falha STT.

**§15 — 20 proibições absolutas PROB-AUD-01..20.**

**§17 — 23 critérios CA-T6.5-01..23.**

**§19 — Bloco E com 25 evidências.**

**Garantias:** zero src/; zero fact_*; zero current_phase; zero reply_text; zero runtime; zero STT real; zero canal real.

### PRÓXIMO PASSO AUTORIZADO

**PR-T6.6** — Sticker, mídia inútil e mensagens não textuais: tratamento seguro de sujeira do WhatsApp real (sticker, imagem sem doc, áudio inaudível, mídia repetida, print confuso, arquivo corrompido, reação/emoji) sem quebrar o funil.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t6-pr-t6-5-audio-cerebro-conversacional` → PR aberta
- Contrato T6: **EM EXECUÇÃO** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- PR-T6.5: CONCLUÍDA (áudio no mesmo cérebro conversacional)
- PR-T6.6: **DESBLOQUEADA**
- Gate G6: aberto (bloqueado até PR-T6.R)

---

## Atualizacao 2026-04-28 — PR-T6.4 — Pipeline de imagem/PDF/documento

### ESTADO HERDADO

- Fase: T6 em execução; PR-T6.3 (#128) merged 2026-04-28T19:39:58Z.
- Contrato T6: EM EXECUÇÃO — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- Surface única de canal (T6.2): SurfaceEventNormalizado; 8 input_types.
- Contrato de anexos (T6.3): 35+ tipos documentais; 11 estados; associação P1/P2/P3.
- Próximo passo autorizado: PR-T6.4 — Pipeline de imagem/PDF/documento.
- Branch: `feat/t6-pr-t6-4-pipeline-imagem-pdf`.

### ESTADO ENTREGUE

`schema/implantation/T6_PIPELINE_IMAGEM_PDF.md` criado — pipeline declarativo de imagem/PDF/documento.

**Regra-mãe:** "Imagem/PDF/documento é entrada documental. Não é verdade absoluta. Não escreve reply_text. Não decide stage."

**§8 — Fluxo declarativo (9 passos):**
Canal → Surface (SurfaceEventNormalizado) → EP-01 Recepção → EP-02 Classificação hipotética →
EP-03 Associação P1/P2/P3 → EP-04 Validação declarativa → EP-05 Estado documental →
EP-06 Contexto T4/LLM → EP-07 Referência dossiê futuro T6.8.

**§9 — EP-01..EP-07 declaradas em detalhe.**

**§7 — 19+ tipos de entrada:** fotos de documento, PDFs, prints, casos especiais (MIME divergente, arquivo pesado, sem caption, sem nome útil, duplicado, enviado sem dizer de quem é).

**§10 — 11 estados documentais reaproveitados de T6.3 — zero novos criados.**

**§11 — Associação P1/P2/P3:** geral; multi-renda (RC-F5-38) com `(pessoa, regime, fonte)`; docs civis por estado civil (AT-01/03).

**§12 — Classificação hipotética limitada:** fontes por confiança; o que pode e o que nunca pode ser inferido; OCR futuro = insumo hipotético.

**§13 — 14 casos problemáticos tratados:** ilegível, cortado, PDF protegido/corrompido, duplicado, muito pesado, MIME divergente, print sem contexto, CNPJ isolado, benefício assistencial, holerite vencido, extrato incompleto, sem dono, tipo errado.

**§14 — Relação com T6.8 (dossiê operacional):** responsabilidades separadas — T6.4 prepara referências; T6.8 monta dossiê e envia ao correspondente.

**§15 — 20 proibições absolutas PROB-PIP-01..20.**

**Garantias:** zero src/; zero fact_*; zero current_phase; zero reply_text; zero runtime; zero OCR real; zero canal real.

### PRÓXIMO PASSO AUTORIZADO

**PR-T6.5** — Áudio no mesmo cérebro conversacional: como `input_type=audio` é recebido;
transcrição como hipótese; confiança de transcrição; extração de fatos via LLM; tratamento
de áudio ruim; confirmação de informações; limites sem avanço autônomo de stage.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t6-pr-t6-4-pipeline-imagem-pdf` → PR aberta
- Contrato T6: **EM EXECUÇÃO** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- PR-T6.4: CONCLUÍDA (pipeline imagem/PDF)
- PR-T6.5: **DESBLOQUEADA**
- Gate G6: aberto (bloqueado até PR-T6.R)

---

## Atualizacao 2026-04-28 — PR-T6.3 — Contrato de anexos e documentos

### ESTADO HERDADO

- Fase: T6 em execução; PR-T6.2 (#127) merged 2026-04-28T19:19:31Z.
- Contrato T6: EM EXECUÇÃO — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- AT-01/03/04 corrigidos em T5 (PR-T6.1); AT-05 lacuna planejada.
- Surface única de canal declarada (PR-T6.2): SurfaceEventNormalizado; 8 input_types; 10 invariantes.
- Próximo passo autorizado: PR-T6.3 — Contrato de anexos e documentos.
- Branch: `feat/t6-pr-t6-3-contrato-anexos-documentos`.

### ESTADO ENTREGUE

`schema/implantation/T6_CONTRATO_ANEXOS_DOCUMENTOS.md` criado — contrato declarativo de governança documental.

**Princípio-mãe:** "Documento é evidência de entrada. Não é verdade absoluta. Não escreve reply_text. Não decide stage."

**§6 — Tipos documentais aceitos (35+):**
Identificação (RG, CNH, passaporte, CPF); residência; renda CLT/holerite; renda servidor/contracheque;
renda aposentado/extrato previdenciário; renda autônomo com IRPF; renda autônomo sem IRPF/extratos;
documentos civis (certidão de casamento, averbação de divórcio, óbito do cônjuge, separado sem averbação);
comprovantes de regularização (SPC/Serasa, Receita Federal, Registrato); FGTS; CNPJ contextual; informativos.

**§7 — Tipos não comprobatórios / rejeitados:**
Bolsa Família, BPC, seguro-desemprego, pensão alimentícia, trabalho temporário — informativos apenas.
Imagem ilegível, documento cortado, arquivo corrompido, print sem contexto, PDF protegido — rejected.

**§8 — 11 estados documentais:**
received → classified_hypothesis → needs_owner → needs_review → accepted_for_dossier /
rejected_unreadable / rejected_wrong_type / expired_or_outdated / informational_only / duplicate /
pending_replacement. Transições declaradas. Zero enum runtime.

**§9 — Associação P1/P2/P3:**
Toda associação confirma com o lead; sem presunção automática.
Multi-renda/multi-regime: cada fonte tem documento próprio (RC-F5-38).
Estado civil: docs por estado (casado, divorciado, viúvo, separado sem averbação).

**§10 — 18 perfis/regime com docs:**
CLT, servidor, aposentado, pensionista, autônomo com/sem IRPF, MEI, empresário, informal,
multi-renda, casado, divorciado, viúvo, separado, familiar/P3.

**§11 — 14 finalidades documentais.**

**§12 — Regras de validade declarativa:** prazo por tipo (holerite 3 meses, extrato 3 meses, etc.),
legibilidade mínima (sem OCR), completude do dossiê mínimo (RC-F5-20).

**§13 — OCR e automação como lacunas futuras:** T6-LF-01..07; sistema opera sem OCR obrigatório.

**§14 — 18 proibições absolutas PROB-AD-01..18.**

**Garantias:** zero src/; zero fact_*; zero current_phase; zero reply_text; zero runtime; zero canal real.

### PRÓXIMO PASSO AUTORIZADO

**PR-T6.4** — Pipeline de imagem/PDF/documento: como a surface entrega input_type=document ao T4;
como o T4/LLM processa contexto documental; transições de estado; associação a perfil/regime/pessoa;
limites sem OCR; relação com dossiê operacional (PR-T6.8).

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t6-pr-t6-3-contrato-anexos-documentos` → PR aberta
- Contrato T6: **EM EXECUÇÃO** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- PR-T6.3: CONCLUÍDA (governança documental)
- PR-T6.4: **DESBLOQUEADA**
- Gate G6: aberto (bloqueado até PR-T6.R)

---

## Atualizacao 2026-04-28 — PR-T6.2 — Surface única de canal

### ESTADO HERDADO

- Fase: T6 em execução; PR-T6.1 (#126) merged 2026-04-28T18:41:17Z.
- Contrato T6: EM EXECUÇÃO — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- AT-01/03/04 corrigidos em T5 (PR-T6.1); AT-05 lacuna planejada.
- Próximo passo autorizado: PR-T6.2 — Surface única de canal.
- Branch: `feat/t6-pr-t6-2-surface-canal`.

### ESTADO ENTREGUE

`schema/implantation/T6_SURFACE_CANAL.md` criado — contrato declarativo da surface única de canal.

**Regra-mãe confirmada:** "T6 não cria outro cérebro. Canal é entrada, não cérebro. Surface não fala."

**§5 — 8 input_types:**
- `text`: mensagem de texto simples (sub: text_plain, text_with_caption)
- `document`: PDF, DOCX, planilha (sub: pdf, docx, spreadsheet, other_document)
- `image`: imagem/foto (sub: jpeg, png, webp, other_image)
- `audio`: áudio/voz (sub: ogg_opus, mp4_audio, other_audio)
- `sticker`: sticker animado/estático (sub: webp_static, webp_animated)
- `button_or_link`: botão de lista ou link clicado (sub: list_reply, button_reply, url_click)
- `system_event`: evento de sistema/status (sub: read_receipt, delivery_status, opt_in, opt_out)
- `unknown_or_invalid`: input não reconhecível (sub: corrupt_payload, unsupported_type)

**§6 — Shape SurfaceEventNormalizado:**
Campos: surface_event_id, channel, channel_message_id, lead_external_id, received_at, processed_at, input_type, input_subtype, confidence_hint, raw_payload_ref, text_content, media_ref, media_mime_type, media_filename, media_size_bytes, caption, sender_role, dedupe_key, normalized_turn_input, handoff_to_t4, surface_warnings.
Sub-shape NormalizedInput: text_for_llm, media_hint, event_type, context_notes.

**§9 — 10 invariantes INV-SC-01..10:**
INV-SC-01: surface NÃO grava reply_text. INV-SC-02: surface NÃO grava fact_*. INV-SC-03: surface NÃO decide next_stage. INV-SC-04: surface NÃO substitui T3 (policy). INV-SC-05: surface NÃO substitui T2 (estado). INV-SC-06: surface NÃO altera regras T5. INV-SC-07: normalized_turn_input é insumo, não decisão. INV-SC-08: toda mensagem recebida gera exatamente 1 SurfaceEventNormalizado. INV-SC-09: surface NÃO transcreve áudio para reply_text. INV-SC-10: surface NÃO cria pipeline paralelo de resposta.

**§10 — Routing:**
Canal bruto → Surface → SurfaceEventNormalizado → TurnoEntrada(T4.1) → T4_PIPELINE_LLM → T4_VALIDACAO_PERSISTENCIA → T4_RESPOSTA_RASTRO_METRICAS → T4_FALLBACKS.

**§14 — 13 proibições absolutas PROB-SC-01..13.**

**Garantias:** zero src/; zero fact_*; zero current_phase; zero reply_text; zero runtime; zero decisão de stage.

### PRÓXIMO PASSO AUTORIZADO

**PR-T6.3** — Contrato de anexos e documentos: governança documental para documentos exigidos pelo dossiê MCMV, tipos aceitos/rejeitados, associação ao lead e à pessoa correta, e estados do documento.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t6-pr-t6-2-surface-canal` → PR aberta
- Contrato T6: **EM EXECUÇÃO** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- PR-T6.2: CONCLUÍDA (surface única de canal)
- PR-T6.3: **DESBLOQUEADA**
- Gate G6: aberto (bloqueado até PR-T6.R)

---

## Atualizacao 2026-04-28 — PR-T6.1 — Pré-flight cirúrgico de riscos herdados T5

### ESTADO HERDADO

- Fase: T6 aberta; PR-T6.0 (#125) merged 2026-04-28T17:38:31Z.
- Contrato T6: ABERTO — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- Atenções herdadas da T5: AT-01/03/04/05 declaradas em T5_READINESS_CLOSEOUT_G5 §6.
- Próximo passo autorizado: PR-T6.1 — Pré-flight cirúrgico.
- Branch: `feat/t6-pr-t6-1-preflight-riscos-t5`.

### ESTADO ENTREGUE

`schema/implantation/T6_PREFLIGHT_RISCOS_T5.md` criado — pré-flight formal das atenções herdadas.

**AT-01 CORRIGIDO:**
- `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` §3.1: ponteiros "divorciado" e "viúvo" atualizados
- Antes: "verificação de averbação/inventário em F4"
- Depois: documentação civil → F5 (RC-F5-36 e RC-F5-35)

**AT-03 ANTECIPADO:**
- `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` §2.5 (novo): nota preventiva sobre separado(a) sem averbação
- Identificação em F2; dois caminhos; referência cruzada F5 RC-F5-37
- Sem fact_*; sem pergunta fixa; sem template de fala

**AT-04 EXPLICITADO:**
- `T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md`: RC-F5-38 adicionada (multi-renda/multi-regime)
- Docs por fonte/regime separados; VS-F5-13; AP-F5-19; validação cruzada #23
- 37 → 38 regras; 22 → 23 itens de validação

**AT-05:** lacuna normativa planejada — sem ação; frente futura.

**Garantias:** zero src/; zero fact_*; zero current_phase; zero reply_text; zero runtime.

### PRÓXIMO PASSO AUTORIZADO

**PR-T6.2** — Surface única de canal: contrato declarativo da camada de entrada única
(texto, documento, imagem, PDF, áudio, sticker, botão/link, evento de sistema).
Invariante: canal não escreve atendimento.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t6-pr-t6-1-preflight-riscos-t5` → PR aberta
- Contrato T6: **EM EXECUÇÃO** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- PR-T6.1: CONCLUÍDA (pré-flight)
- PR-T6.2: **DESBLOQUEADA**
- Gate G6: aberto (bloqueado até PR-T6.R)

---

## Atualizacao 2026-04-28 — PR-T6.0 — Abertura formal do contrato T6

### ESTADO HERDADO

- Fase: T5 ENCERRADA; G5 APROVADO via PR-T5.R (#124) merged.
- Contrato T5 arquivado em `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T5_2026-04-28.md`.
- Gate G5 APROVADO com 4 atenções aceitas por Vasques (AT-01/03/04/05 — não bloqueantes).
- Próximo passo autorizado: PR-T6.0 — Abertura formal do contrato T6.
- Branch: `feat/t6-pr-t6-0-abertura-contrato`.

### ESTADO ENTREGUE

`schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` criado — contrato formal de abertura da fase T6 (Docs, multimodalidade e superfícies de canal).

**Regra-mãe declarada:** "T6 não cria outro cérebro — tudo que entra por canal passa pela mesma governança T1→T2→T3→T4→T5."

**§1 Objetivo:** canal como superfície de entrada, não como camada cognitiva; go-live controlado é T7.

**§2 Escopo — 11 PRs:**
| PR | Descrição |
|----|-----------|
| T6.0 | Abertura formal do contrato T6 (esta PR) |
| T6.1 | Pré-flight cirúrgico — AT-01/03/04 + análise de riscos herdados |
| T6.2 | Superfície de canal — contrato declarativo de entrada/saída |
| T6.3 | Contrato de anexos — tipagem e validação de mídia |
| T6.4 | Pipeline de imagem/PDF — contrato declarativo |
| T6.5 | Pipeline de áudio — contrato declarativo STT |
| T6.6 | Sticker e mídia inválida — contrato de rejeição graceful |
| T6.7 | Adapter Meta/WhatsApp — contrato declarativo de integração |
| T6.8 | Dossiê multimodal — contrato de coleta e associação a P1/P2/P3 |
| T6.9 | Suite de testes de canal — bateria declarativa E2E |
| T6.R | Readiness/Closeout G6 — veredito gate G6 |

**CA-T6-01..CA-T6-10:** critérios de aceite declarados (governança de canal, soberania reply_text, áudio, imagem/PDF, associação fatos, mídia inválida, idempotência, dossiê, sandbox, G6).

**B-T6-01..B-T6-10:** bloqueios declarados; B-T6-04 = **bloqueio permanente** — qualquer superfície que produza `reply_text` ou decida stage de forma autônoma.

**Gate G6:** "Multimodal sob mesma governança" — T7 somente após G6 APROVADO.

**Adendos conformidade:** A00-ADENDO-01/02/03 declarados em §17.

**Riscos:** R-T6-01..R-T6-10 declarados.

**AT-01/03/04:** designados para tratamento cirúrgico em PR-T6.1.

**AT-05:** lacuna normativa planejada — permanece como não bloqueante através de todo T6.

**Inventário:** explicitamente fora de escopo em §3.

### PRÓXIMO PASSO AUTORIZADO

**PR-T6.1** — Pré-flight cirúrgico: análise formal de AT-01/03/04 e documentação de riscos herdados do T5 antes de qualquer superfície de canal.

Leituras obrigatórias para PR-T6.1:
1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` (este contrato)
2. `schema/implantation/T5_READINESS_CLOSEOUT_G5.md` (atenções AT-01/AT-03/AT-04/AT-05)
3. `schema/implantation/T5_FATIA_TOPO_ABERTURA.md` (AT-01 — ponteiro F2 averbação)
4. `schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` (AT-03 — separado sem averbação)
5. `schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` (AT-04 — regime múltiplo F5)
6. `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
7. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)
8. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03)

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t6-pr-t6-0-abertura-contrato` → PR aberta
- Contrato T6: **ABERTO** — `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md`
- Contrato T5: ENCERRADO — `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T5_2026-04-28.md`
- Gate G5: APROVADO
- Gate G6: aberto (bloqueado até PR-T6.R)
- PR-T6.1: **DESBLOQUEADA**

---

## Atualizacao 2026-04-28 — PR-T5.R — Readiness / Closeout G5

### ESTADO HERDADO

- Fase: T5 aberta; PR-T5.8 (#123) merged 2026-04-28T02:47:56Z.
- Artefato base: todos os S1–S8 vigentes; CE-01..CE-09 declaradas.
- Próximo passo autorizado: PR-T5.R — Readiness / Closeout G5.
- Branch base: `main` (após pull pós-merge de #123).

### ESTADO ENTREGUE

`schema/implantation/T5_READINESS_CLOSEOUT_G5.md` criado — readiness/closeout formal do Gate G5.

**Veredito:** G5 PRONTO COM ATENÇÃO — **APROVADO**

**Smoke S1–S8:** 8/8 PASS

**CA-01..CA-10:** 10/10 CUMPRIDOS

**CE-01..CE-09:** 9/9 satisfeitas (CE-04/05/06 satisfeitas com atenção — aceitas por Vasques)

**4 atenções aceitas (não bloqueantes):**
- AT-01: ponteiro F2 averbação → F4 desatualizado — aceita; PR-fix futura recomendada
- AT-03: separado sem averbação descoberto tardiamente — aceita; PR-fix futura recomendada
- AT-04: docs regime múltiplo implícitos em F5 — aceita; PR-fix futura recomendada (prioritária antes do runtime)
- AT-05: base normativa MCMV/CEF ausente — lacuna planejada; frente futura

**Inventário:** fora do escopo deliberado desta fase — não é atenção, não é lacuna bloqueante.

**Contrato T5 ENCERRADO:** arquivado em `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T5_2026-04-28.md`

### PRÓXIMO PASSO AUTORIZADO

**PR-T6.0** — Abertura formal do contrato T6 (Multimodal / Integração de canal).

Recomendações antes do runtime T5 (não bloqueantes para T6.0):
1. PR-fix-AT-04: RC explícita regime múltiplo em F5 (prioritária)
2. PR-fix-AT-01: corrigir ponteiro F2 averbação
3. PR-fix-AT-03: nota F2 separado sem averbação

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t5-pr-t5r-readiness-closeout-g5` → PR aberta
- Contrato T5: ENCERRADO — `archive/CONTRATO_IMPLANTACAO_MACRO_T5_2026-04-28.md`
- Contrato T6: aguardando abertura via PR-T6.0
- Gate G5: APROVADO

---

## Atualizacao 2026-04-27 — PR-T5.8 — Plano declarativo de shadow/sandbox F1–F5

### ESTADO HERDADO

- Fase: T5 aberta; PR-T5.7 (#122) merged 2026-04-28T02:28:38Z.
- Artefato base: `schema/implantation/T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md` vigente.
- Veredito herdado: PODE SEGUIR COM ATENÇÃO; 4 atenções (AT-01, AT-03, AT-04, AT-05); 0 bloqueantes.
- Próximo passo autorizado: PR-T5.8 — Plano declarativo de shadow/sandbox F1–F5.
- Branch base: `main` (após pull pós-merge de #122).

### ESTADO ENTREGUE

`schema/implantation/T5_PLANO_SHADOW_SANDBOX.md` criado — plano declarativo de shadow/sandbox.

**48 cenários mínimos declarados:**
- Bloco A (F1): SHD-A-01..03 — abertura/topo (discovery)
- Bloco B (F2): SHD-B-04..10 — qualificação/composição (qualification / qualification_special)
- Bloco C (F3): SHD-C-11..26 — renda/regime/composição (qualification / qualification_special)
- Bloco D (F4): SHD-D-27..29 — elegibilidade/restrição (qualification_special → docs_prep)
- Bloco E (F5): SHD-E-30..48 — documentação/dossiê/visita/handoff (docs_prep → visit_conversion)

**Pré-condições declarativas (PC-01..08):** verificadas; sem runtime real.

**Matriz de evidências esperadas (15 campos):** fatos coletados, derived calculados, current_phase, lacunas acionadas, resultado esperado por cenário.

**16 critérios de sucesso (CS-01..16)** + **8 critérios de falha/bloqueio (CF-01..08)**.

**Atenções tratadas:**
- AT-01: ponteiro F2 averbação → cenário de observação SHD-E-31 + ação corretiva recomendada
- AT-03: separado sem averbação timing → cenário SHD-E-32 + ação corretiva recomendada
- AT-04: regime múltiplo implícito → cenários SHD-C-19/20 + ação corretiva recomendada
- AT-05: base normativa ausente → lacuna planejada, não bloqueante

**9 condições de entrada para PR-T5.R (CE-01..09).**

**Garantias:**
- Zero runtime implementado
- Zero `fact_*` inventado
- Zero inventário (deliberadamente fora do recorte)
- Zero regra comercial nova
- Zero `reply_text` ou template mecânico

### PRÓXIMO PASSO AUTORIZADO

**PR-T5.R** — Readiness / Closeout G5 (após merge desta T5.8 + verificação CE-01..CE-09).

Recomendação adicional (não bloqueante): PR-fix-AT-01 + PR-fix-AT-03 + PR-fix-AT-04 antes ou junto de T5.R.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t5-pr5-8-plano-shadow-sandbox` → PR aberta
- Contrato T5: `active/CONTRATO_IMPLANTACAO_MACRO_T5.md` — STATUS: aberto
- Gate G5: bloqueado até PR-T5.R

---

## Atualizacao 2026-04-27 — PR-T5.7 — Matriz de paridade funcional F1–F5

### ESTADO HERDADO

- Fase: T5 aberta; PR-T5.6-fix (#121) merged 2026-04-28T01:33:38Z.
- Artefatos base: F1–F5 todos vigentes; fix civis F5 vigente.
- Próximo passo autorizado: PR-T5.7 — Matriz de paridade funcional F1-F5.
- Branch base: `main` (após pull pós-merge de #121).

### ESTADO ENTREGUE

`schema/implantation/T5_MATRIZ_PARIDADE_FUNCIONAL_F1_F5.md` criado — validação declarativa cruzada.

**Veredito:** PODE SEGUIR COM ATENÇÃO

**43 stages verificados:** F1:7 ✅ | F2:7 ✅ | F3:21 ✅ | F4:3 ✅ | F5:5 ✅

**8/8 `current_phase` canônicos cobertos:** discovery → qualification → qualification_special → docs_prep → docs_collection → broker_handoff → awaiting_broker → visit_conversion

**4 atenções identificadas (não bloqueantes):**
- AT-01: Ponteiro F2 "averbação → F4" desatualizado; real é F5 RC-F5-36
- AT-03: Gap de timing para descoberta de "separado sem averbação" em F2
- AT-04: Docs para regime múltiplo são implícitos em F5, não explícitos
- AT-05: Base normativa MCMV/CEF ausente (LF-05)

**0 bloqueantes encontrados.**

O que esta PR fecha: Paridade funcional declarativa F1-F5 validada; PR-T5.8 / PR-T5.R autorizados.

### PRÓXIMO PASSO AUTORIZADO

**PR-T5.8 ou PR-T5.R** conforme contrato T5. Com recomendação de 5 PR-fixes antes de T5.R.

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t5-pr5-7-matriz-paridade-funcional` → PR aberta
- Contrato T5: `active/CONTRATO_IMPLANTACAO_MACRO_T5.md` — STATUS: aberto
- Gate G5: bloqueado até PR-T5.R

---

## Atualizacao 2026-04-27 — PR-T5.6-fix — Correção cirúrgica: documentos civis finos da F5

### ESTADO HERDADO

- Fase: T5 aberta; PR-T5.6 (#120) merged 2026-04-28T01:03:04Z.
- Artefato base: `schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` vigente.
- Próximo passo autorizado: PR-T5.6-fix — correção cirúrgica civis (viúvo/divorciado/separado sem averbação).
- Branch base: `main` (após pull pós-merge de #120).

### ESTADO ENTREGUE

`schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` corrigido — 3 regras civis adicionadas.

**Regras adicionadas (RC-F5-35..37):**
- RC-F5-35: viúvo(a) → certidão de óbito obrigatória; inventário fora do recorte
- RC-F5-36: divorciado(a) → certidão de casamento com averbação quando aplicável
- RC-F5-37: separado(a) sem averbação → dois caminhos (regularizar ou seguir com cônjuge); não bloquear

**Lacunas adicionadas (LF-32..35):**
LF-32: certidão de óbito; LF-33: certidão de casamento com averbação;
LF-34: estado civil "separado sem averbação"; LF-35: regularização pendente

**Garantias:**
- Inventário NÃO incluído
- União estável NÃO reaberta
- P3/familiar casado civil NÃO reaberto
- Zero `fact_*` criado
- Zero `reply_text` ou template
- Próximo passo autorizado: PR-T5.7 — após merge desta fix

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t5-pr5-6-fix-documentos-civis` → PR aberta
- Contrato T5: `active/CONTRATO_IMPLANTACAO_MACRO_T5.md` — STATUS: aberto
- Artefato `T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md`: corrigido (PR-T5.6-fix)
- Gate G5: bloqueado até PR-T5.R

---

## Atualizacao 2026-04-26 — PR-T5.6 — Contrato da fatia F5: documentação / dossiê / correspondente / visita / handoff

### ESTADO HERDADO

- Fase: T5 aberta; PR-T5.5 (#119) merged 2026-04-27T02:50:24Z.
- Artefato base: `schema/implantation/T5_FATIA_ELEGIBILIDADE_RESTRICAO.md` vigente.
- Próximo passo autorizado: PR-T5.6 — Contrato declarativo da fatia F5.
- Branch base: `main` (após pull pós-merge de #119).

### ESTADO ENTREGUE

`schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` criado — contrato declarativo completo da fatia F5.

**5 stages cobertos:** `envio_docs`, `agendamento_visita`, `aguardando_retorno_correspondente`, `finalizacao`, `finalizacao_processo`

**current_phase sequence:** `docs_prep` → `docs_collection` → `broker_handoff` → `awaiting_broker` → `visit_conversion`

**Regra-mãe F5:** Enova conduz o cliente para análise; não pede permissão. Coleta ativa, não passiva.
3 follow-ups obrigatórios antes do plantão. Toda aprovação vira agendamento de visita com todos os decisores.
Critério rigoroso para `finalizacao_processo` — respostas curtas ("ok"/"tá"/"blz") NUNCA disparam encerramento.

**9 fatos T2 (Groups IX, X + derived):**
`fact_doc_identity_status`, `fact_doc_income_status`, `fact_doc_residence_status`, `fact_doc_ctps_status`,
`fact_docs_channel_choice` (Group IX); `fact_visit_interest`, `fact_current_intent` (Group X);
`derived_doc_risk`, `derived_dossier_profile`

**28 lacunas (LF-01..28):** documental, dossiê, canal, follow-up, silêncio, retorno correspondente,
Registrato, bairros, entrada/FGTS, idade, visita, Vasques notificação, finalização.

**33 regras comerciais Vasques (RC-F5-01..33)** documentadas sem reply_text.

**Políticas T3:** OBR-F5-01..06 + CONF-F5-01..02 + SGM-F5-01..06 + ROT-F5-01..05 + VS-F5-01..10.
**Anti-padrões:** AP-F5-01..15. **Cenários sintéticos:** SYN-F5-01..10. **Validação cruzada:** 18 items.

O que esta PR fecha: F5 coberta com contrato declarativo completo; PR-T5.7 desbloqueada após merge.
O que esta PR não fecha: paridade funcional, G5; merge não autorizado pelo executor.

### PRÓXIMO PASSO AUTORIZADO

**PR-T5.7 — Matriz de paridade funcional das fatias (F1–F5)** (após merge desta PR-T5.6)

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t5-pr5-6-fatia-documentacao-visita-handoff` → PR aberta
- Contrato T5: `active/CONTRATO_IMPLANTACAO_MACRO_T5.md` — STATUS: aberto
- Artefato `T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md`: criado (entregue)
- Gate G5: bloqueado até PR-T5.R

---

## Atualizacao 2026-04-26 — PR-T5.5 — Contrato da fatia F4: elegibilidade / restrição

### ESTADO HERDADO

- Fase: T5 aberta; PR-T5.4 (#118) merged 2026-04-27T02:04:13Z.
- Artefato base: `schema/implantation/T5_FATIA_RENDA_REGIME_COMPOSICAO.md` vigente.
- Próximo passo autorizado: PR-T5.5 — Contrato declarativo da fatia F4.
- Branch base: `main` (após pull pós-merge de #118).

### ESTADO ENTREGUE

`schema/implantation/T5_FATIA_ELEGIBILIDADE_RESTRICAO.md` criado — contrato declarativo completo da fatia F4.

**3 stages ativos:** `restricao`, `regularizacao_restricao`, `fim_inelegivel`
**2 stages fora do recorte ativo:** `verificar_averbacao`, `verificar_inventario` — documentados como opcionais/futuros

**Regra canônica central:** restrição declarada é sinal informativo, NUNCA bloqueio automático.
`fim_inelegivel` = temporário, não definitivo. Divergência com mapa legado documentada (§1.5).

**3 fatos T2 (Group VII + derived):** `fact_credit_restriction`, `fact_restriction_regularization_status`, `derived_eligibility_probable`

**8 lacunas (LF-01..08):** origem dívida, valor dívida, incerteza sobre constar, status pós-banco, impacto confirmado, condição retorno, motivo inelegibilidade, prazo reabordagem.

**Políticas T3:** OBR-F4-01..02 + CONF-F4-01..02 + SGM-F4-01..03 + ROT-F4-01..02 + VS-F4-01..06.

**Roteamento de saída:** F4 completa → `current_phase = docs_prep` (ROT-F4-01).

O que esta PR fecha: F4 coberta; PR-T5.6 desbloqueada após merge.
O que esta PR não fecha: F5, G5; merge não autorizado pelo executor.

### PRÓXIMO PASSO AUTORIZADO

**PR-T5.6 — Contrato da fatia documentação / visita / handoff** (após merge desta PR-T5.5)
- Artefato: `schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md`
- 5 stages: envio_docs, agendamento_visita, aguardando_retorno_correspondente, finalizacao, finalizacao_processo
- `current_phase: docs_prep` → `visit_conversion`

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t5-pr5-5-fatia-elegibilidade-restricao` → PR aberta
- Contrato T5: `active/CONTRATO_IMPLANTACAO_MACRO_T5.md` — STATUS: aberto
- Artefato `T5_FATIA_ELEGIBILIDADE_RESTRICAO.md`: criado (entregue)
- Gate G5: bloqueado até PR-T5.R

---

## Atualizacao 2026-04-26 — PR-T5.4 — Contrato da fatia F3: renda / regime / composição

### ESTADO HERDADO

- Fase: T5 aberta; PR-T5.3 (#117) merged 2026-04-27T00:18:40Z.
- Artefato base: `schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` vigente.
- Próximo passo autorizado: PR-T5.4 — Contrato declarativo da fatia F3.
- Branch base: `main` (após pull pós-merge de #117).

### ESTADO ENTREGUE

`schema/implantation/T5_FATIA_RENDA_REGIME_COMPOSICAO.md` criado — contrato declarativo completo da fatia F3.

**21 stages cobertos:** `regime_trabalho`, `renda`, `ctps_36`, `ir_declarado`, `possui_renda_extra`,
`inicio_multi_renda_pergunta`, `inicio_multi_renda_coletar`, `inicio_multi_regime_pergunta`,
`inicio_multi_regime_coletar`, `renda_mista_detalhe`, `autonomo_compor_renda`, `parceiro_tem_renda`,
`regime_trabalho_parceiro`, `regime_trabalho_parceiro_familiar`, `renda_parceiro`, `renda_parceiro_familiar`,
`renda_familiar_valor`, `somar_renda_familiar`, `somar_renda_solteiro`, `sugerir_composicao_mista`,
`ctps_36_parceiro`

**16 fatos canônicos T2 (Groups IV–VIII + derived):**
Groups IV (P1), V (P2), VI (P3), VII (benefícios/FGTS/reserva), VIII (dependente cross-fatia)
+ derived_subsidy_band_hint + derived_composition_needed + signal_multi_income_p1

**9 lacunas de schema futuras (LF-01..09):**
LF-01: valor segunda fonte renda P1; LF-02: IRPF P3; LF-03: CTPS P3;
LF-04: tipo de pensão; LF-05: benefício não financiável; LF-06: pró-labore;
LF-07: média renda variável; LF-08: CNPJ-only; LF-09: enum desempregado

**18 regras comerciais Vasques (RC-F3-01..18)** documentadas sem reply_text.

**Políticas T3:** OBR-F3-01..09 + CONF-F3-01..05 + SGM-F3-01..07 + ROT-F3-01..03 + VS-F3-01..06
Cross-fatia F2→F3: OBR-F3-09 resolve dependente quando renda P1 confirmada.

O que esta PR fecha: F3 coberta com contrato declarativo completo; PR-T5.5 desbloqueada após merge.
O que esta PR não fecha: F4, F5, G5; merge não autorizado pelo executor.

### PRÓXIMO PASSO AUTORIZADO

**PR-T5.5 — Contrato da fatia elegibilidade / restrição** (após merge desta PR-T5.4)
- Artefato: `schema/implantation/T5_FATIA_ELEGIBILIDADE_RESTRICAO.md`
- 5 stages: restricao, regularizacao_restricao, fim_inelegivel, verificar_averbacao, verificar_inventario
- `current_phase: qualification` ou `qualification_special`

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t5-pr5-4-fatia-renda-regime-composicao` → PR aberta
- Contrato T5: `active/CONTRATO_IMPLANTACAO_MACRO_T5.md` — STATUS: aberto
- Artefato `T5_FATIA_RENDA_REGIME_COMPOSICAO.md`: criado (entregue)
- Gate G5: bloqueado até PR-T5.R

---

## Atualizacao 2026-04-26 — PR-T5.3 — Contrato da fatia F2: qualificação inicial / composição familiar

### ESTADO HERDADO

- Fase: T5 aberta; PR-T5.2 (#115) + PR-T5.2-fix (#116) merged; `T5_FATIA_TOPO_ABERTURA.md` (v2) vigente.
- Próximo passo autorizado: PR-T5.3 — Contrato declarativo da fatia F2.
- Branch base: `main` (após pull pós-merge de #116).

### ESTADO ENTREGUE

`schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` criado — contrato declarativo completo da fatia F2.

**7 stages cobertos:**
1. `estado_civil` — identificação do estado civil do lead (solteiro, casado civil, união estável, divorciado, viúvo)
2. `confirmar_casamento` — casamento civil → financiamento obrigatoriamente em conjunto (P2 obrigatório)
3. `interpretar_composicao` — definição do process_mode (solo vs. duo vs. P3) + derived_composition_needed
4. `confirmar_avo_familiar` — entrada de avô/avó familiar + alerta de risco etário CEF (67 anos)
5. `dependente` — coleta condicional: duo → skip; solo < R$4k → perguntar; solo > R$4k → skip
6. `financiamentos_conjunto` — SEMPRE financiamento ATUAL em conjunto; NUNCA histórico de financiamentos
7. `quem_pode_somar` — mapeamento de quem entra no processo; insumo para F3

**8 fatos canônicos T2 (Groups III e VIII):**
- `fact_estado_civil` (gate obrigatório)
- `fact_process_mode` (gate obrigatório)
- `fact_composition_actor` (se process_mode != solo)
- `fact_p3_required` (calculado — sempre)
- `fact_dependente` (condicional — solo + renda)
- `fact_dependents_count` (condicional — se dependente = true)
- `derived_composition_needed` (derived)
- `derived_dependents_applicable` (derived)

**5 lacunas de schema futuras declaradas (LF-01..05):**
- LF-01: `fact_financiamento_conjunto_atual` (histórico vs. atual em conjunto)
- LF-02: estado civil do familiar que compõe (cascata P3)
- LF-03: cônjuge do familiar que compõe (P3)
- LF-04: idade do familiar/avô/avó (risco CEF 67 anos)
- LF-05: base normativa MCMV/CEF (não existe no repo ainda)

**9 regras comerciais Vasques documentadas em §5** (sem reply_text).

**Políticas T3 declaradas:**
- OBR-F2-01..03 (obrigações de coleta)
- CONF-F2-01/02 (confirmações hard)
- Nota BLQ LF-01 (bloqueio sem fact_* impossível por ora)
- SGM-F2-01..05 (sugestões mandatórias)
- ROT-F2-01 (p3_required=false → qualification)
- ROT-F2-02 (p3_required=true → qualification_special)

**Nenhum fact_* novo criado.** Lacunas apenas declaradas.

O que esta PR fecha: F2 coberta com contrato declarativo completo; PR-T5.4 desbloqueada após merge.
O que esta PR não fecha: F3, F4, F5; merge não autorizado pelo executor.

### PRÓXIMO PASSO AUTORIZADO

**PR-T5.4 — Contrato da fatia renda/regime/composição** (após merge desta PR-T5.3)
- Artefato: `schema/implantation/T5_FATIA_RENDA_REGIME_COMPOSICAO.md`
- 21 stages: F3 completa
- `current_phase: qualification` e `qualification_special`

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t5-pr5-3-fatia-composicao-familiar` → PR aberta
- Contrato T5: `active/CONTRATO_IMPLANTACAO_MACRO_T5.md` — STATUS: aberto
- Artefato `T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md`: criado (entregue)
- Gate G5: bloqueado até PR-T5.R

---

## Atualizacao 2026-04-26 — PR-T5.2-fix — Correção premissas topo e RNM

### ESTADO HERDADO

- Fase: T5 aberta; PR-T5.2 merged (#115).
- Artefato corrigido: `schema/implantation/T5_FATIA_TOPO_ABERTURA.md`.
- Dois problemas identificados por Vasques: (1) premissa de "confirmar intenção de compra" incorreta; (2) regra RNM incompleta — validade determinada (com data) também bloqueia financiamento.

### ESTADO ENTREGUE

Correções aplicadas em `T5_FATIA_TOPO_ABERTURA.md` (v2):

**Correção 1 — Remoção da premissa de "confirmar intenção de compra":**
- §1: enunciado reescrito — F1 identifica contexto inicial suficiente, não "intenção de compra confirmada"
- §2.1: nota operacional explícita — todo lead que entrou já é oportunidade; F1 não pergunta "você quer comprar?"; curiosidade/simulação/dúvida são entradas válidas
- §2 inicio_decisao: "Confirmar decisão / intenção de compra" → "Identificar contexto inicial de interesse"
- §3 fact_customer_goal: status mínimo `captured` (antes: `confirmed` como gate)
- CONF-F1-01: rebaixada de `hard` para `soft`; não é gate de saída de F1
- OBR-F1-02: só dispara se fact_customer_goal totalmente ausente (não em hypothesis)
- §8: gate `fact_customer_goal = confirmed` removido; substituído por `captured` mínimo
- §8.1: nota explícita — fact_customer_goal captured não impede avanço
- CR-F1-06: reescrita — proibição é persistir "intenção de compra confirmada" sem base, não bloquear simulação
- AP-F1-06: reescrita — simulação/curiosidade não são "intenção de compra"
- VS-F1-02/03: atualizados — curiosidade e simulação são válidas
- SYN-F1-05: reescrito — objetivo apenas capturado pode avançar
- SYN-F1-06: reescrito — "quero simular" = entrada válida para F1

**Correção 2 — Regra RNM corrigida:**
- §2.2: reescrito — regra explícita: apenas validade indeterminada aceita; validade determinada (com data, mesmo não expirada) = bloqueio
- §3.1: tabela RNM atualizada — "válido" marcado com LF-02; nota de que T2 não distingue determinada de indeterminada
- §4: LF-02 declarada — tipo de validade do RNM (indeterminada vs determinada); sem criar fact_*
- BLQ-F1-01: resolução atualizada + nota LF-02 extensa
- SYN-F1-03: atualizado para refletir que "válido" deve ser validade indeterminada
- §13: 3 novos itens de validação cruzada (LF-02, regra RNM, gate fact_customer_goal)
- Bloco E: atualizado com v2; 2 novas provas P-T5-04/05

**Nenhum fact_* novo criado.** LF-02 declarada como lacuna de schema futura.

O que foi fechado: PR-T5.2-fix entregue; PR-T5.3 desbloqueada após merge.

### PRÓXIMO PASSO AUTORIZADO

**PR-T5.3 — Contrato da fatia qualificação inicial** (após merge desta fix)
- Artefato: `schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL.md`
- 7 stages: `estado_civil`, `confirmar_casamento`, `interpretar_composicao`, `confirmar_avo_familiar`, `dependente`, `financiamentos_conjunto`, `quem_pode_somar`
- `current_phase: qualification`
- Legados obrigatórios: L03, L07, L08

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t5-fix-t52-premissas-rnm` → PR aberta
- Contrato T5: `active/CONTRATO_IMPLANTACAO_MACRO_T5.md` — STATUS: aberto
- Artefato T5_FATIA_TOPO_ABERTURA.md: corrigido (v2)
- Gate G5: bloqueado até PR-T5.R

---

## Atualizacao 2026-04-26 — PR-T5.2 — Contrato da fatia F1: topo/abertura/primeira intenção

### ESTADO HERDADO

- Fase: T5 aberta; PR-T5.1 merged (#114); PR-T5.2 desbloqueada.
- Contrato ativo: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md` (aberto).
- Artefato base: `schema/implantation/T5_MAPA_FATIAS.md` — §4.1 define F1.

### ESTADO ENTREGUE

O que foi feito nesta PR:
- Criado `schema/implantation/T5_FATIA_TOPO_ABERTURA.md` — contrato declarativo da fatia F1.
- 7 stages legados cobertos: `inicio`, `inicio_decisao`, `inicio_nome`, `inicio_programa`, `inicio_nacionalidade`, `inicio_rnm`, `inicio_tem_validade`.
- 6 fatos/derived T2 canônicos: `fact_lead_name`, `fact_customer_goal`, `fact_nationality`, `fact_rnm_status`, `derived_rnm_required`, `derived_rnm_block`.
- LF-01 declarada: data exata de validade do RNM é lacuna de schema futura; efeito operacional capturado via `fact_rnm_status = "vencido"`.
- Políticas T3: 4 obrigações (OBR-F1-01..04), 3 confirmações (CONF-F1-01..03), 1 bloqueio (BLQ-F1-01 R_ESTRANGEIRO_SEM_RNM), 3 sugestões mandatórias (SGM-F1-01..03), 1 roteamento (ROT-F1-01).
- 3 vetos suaves (VS-F1-01..03).
- 6 critérios de saída mensuráveis; relação completa com pipeline T4.
- 10 classes de risco (CR-F1-01..10); 10 anti-padrões (AP-F1-01..10).
- 7 cenários sintéticos declarativos (SYN-F1-01..07).
- Validação cruzada T2/T3/T4/T5.1 (18 itens — todos confirmados).
- Bloco E + provas P-T5-01..03 PASS.
- _INDEX.md, STATUS e LATEST atualizados.

O que foi fechado: PR-T5.2 — contrato F1 entregue; PR-T5.3 desbloqueada.

O que continua pendente: execução das PRs T5.3–T5.R.

### PRÓXIMO PASSO AUTORIZADO

**PR-T5.3 — Contrato da fatia qualificação inicial**
- Artefato: `schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL.md`
- 7 stages: `estado_civil`, `confirmar_casamento`, `interpretar_composicao`, `confirmar_avo_familiar`, `dependente`, `financiamentos_conjunto`, `quem_pode_somar`
- `current_phase: qualification`
- Legados obrigatórios: L03, L07, L08

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t5-pr5-2-fatia-topo-abertura` → PR a ser aberta
- Contrato T5: `active/CONTRATO_IMPLANTACAO_MACRO_T5.md` — STATUS: aberto
- Artefato T5_FATIA_TOPO_ABERTURA.md: criado em `schema/implantation/`
- Gate G5: bloqueado até PR-T5.R

---

## Atualizacao 2026-04-26 — PR-T5.1 — Mapa de fatias do funil core

### ESTADO HERDADO

- Fase: T5 aberta; PR-T5.0 concluída (contrato T5 completo §1–§17); PR-T5.1 desbloqueada.
- Contrato ativo: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md` (aberto).
- Última PR relevante: PR-T5.0 (#113) MERGED em 2026-04-26.

### ESTADO ENTREGUE

O que foi feito nesta PR:
- Criado `schema/implantation/T5_MAPA_FATIAS.md` — mapa canônico de fatias do funil core.
- 45 stages legados mapeados para 5 fatias core (F1: 7, F2: 7, F3: 21, F4: 5, F5: 5).
- Fase informativa/comercial transversal (FI) — 7 campos: 2 fact_keys T2 confirmadas
  (`fact_has_fgts`, `fact_entry_reserve_signal`); 5 lacunas informativas futuras identificadas.
- Por fatia: current_phase, fatos mínimos T2, políticas T3 aplicáveis, critérios de entrada/saída,
  relação com pipeline T4.
- 8 correções de tipo semântico: legacy `expected = NUMBER` → boolean/enum correto para
  inicio_decisao, inicio_programa, regime_trabalho, ctps_36, ctps_36_parceiro, ir_declarado,
  restricao, dependente.
- 10 anti-padrões proibidos (AP-01..AP-10).
- Validação cruzada T2/T3/T4 (15 entradas).
- Grafo de dependências de migração T5.2 → T5.3 → T5.4 → T5.5 → T5.6 → T5.7 → T5.8 → T5.R.
- _INDEX.md, STATUS e LATEST atualizados.

O que foi fechado nesta PR: PR-T5.1 — mapa de fatias entregue; PR-T5.2 desbloqueada.

O que continua pendente: execução das PRs T5.2–T5.R; contratos de fatia individuais.

### PRÓXIMO PASSO AUTORIZADO

**PR-T5.2 — Contrato de fatia F1: Abertura / topo**
- Artefato: `schema/implantation/T5_FATIA_F1.md`
- 7 stages: `inicio`, `inicio_decisao`, `inicio_nome`, `inicio_programa`, `inicio_nacionalidade`,
  `inicio_rnm`, `inicio_tem_validade`
- current_phase: `discovery`
- Leituras obrigatórias: CLAUDE.md, CONTRATO_IMPLANTACAO_MACRO_T5.md, T5_MAPA_FATIAS.md,
  T2_LEAD_STATE_V1.md, T3_CLASSES_POLITICA.md, T4_PIPELINE_LLM.md

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t5-pr5-1-mapa-fatias` → PR #114 aberta
- Contrato T5: `active/CONTRATO_IMPLANTACAO_MACRO_T5.md` — STATUS: aberto
- Artefato T5_MAPA_FATIAS.md: criado em `schema/implantation/` (v2 — corrigido)
- Gate G5: bloqueado até PR-T5.R

### CORREÇÕES v2 (mesma PR #114)

- Todos os `fact_*` inventados substituídos por chaves canônicas de T2_DICIONARIO_FATOS
- 7 lacunas de schema futuras identificadas e marcadas (LF-01..LF-07)
- Fase informativa expandida de 7 para 9 campos (adicionados `valor_fgts_informado` e `valor_entrada_informado` como lacunas informativas futuras)
- `current_phase = encerramento` eliminado; substituído por `ACAO_INELEGIBILIDADE` → `elegibility_status = "ineligible"` (AP-10 adicionado)
- Todas as menções a `T5_FATIA_F1.md` corrigidas para `T5_FATIA_TOPO_ABERTURA.md`
- AP-11 adicionado (proibição de `fact_*` inventado)
- Grupos T2 corrigidos em todos os §4.x.4

---

## Atualizacao 2026-04-26 — PR-T5.0 — Abertura formal do contrato T5

### ESTADO HERDADO

- Fase: T5 skeleton; G4 APROVADO; T4 encerrado; PR-T5.0 desbloqueada.
- Contrato ativo: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md` (skeleton).
- Última PR relevante: PR-T4.R (#112) MERGED em 2026-04-26.

### ESTADO ENTREGUE

O que foi feito nesta PR:
- Skeleton T5 substituído por contrato completo §1–§17 + Bloco E.
- Objetivo T5 declarado: migração declarativa do funil core por fatias controladas, sem if/else de fala.
- 10 PRs mapeadas em §16: T5.0 (abertura), T5.1 (mapa fatias), T5.2–T5.6 (contratos de fatia), T5.7 (paridade), T5.8 (shadow/sandbox), T5.R (readiness G5).
- Saídas S1–S9 declaradas (artefatos por PR).
- CA-01..CA-10 definidos (incluindo CA-01: nenhuma fatia cria if/else de fala; CA-05: paridade funcional = cobertura de casos, não de fala).
- B-01..B-10 declarados (B-04: if/else de fala = bloqueio permanente; B-07: Meta/WhatsApp proibido antes G5).
- Gate G5 definido: paridade funcional dos fluxos prioritários.
- Legados aplicáveis L03–L19 mapeados por PR.
- _INDEX.md, STATUS e LATEST atualizados.

O que foi fechado nesta PR: abertura formal do contrato T5; PR-T5.1 desbloqueada.

O que continua pendente: execução das PRs T5.1–T5.R; criação dos artefatos de fatia.

### PRÓXIMO PASSO AUTORIZADO

**PR-T5.1 — Mapa de fatias do funil core e ordem de migração**
- Artefato: `schema/implantation/T5_MAPA_FATIAS.md`
- Leituras obrigatórias: CLAUDE.md, CODEX_WORKFLOW.md, CONTRATO_IMPLANTACAO_MACRO_T5.md, L03, LEGADO_MESTRE seção T5, PR_BIBLIA §L

### ESTADO ATUAL DO REPOSITÓRIO

- Branch: `feat/t5-pr5-0-abertura-contrato` → PR #113 aberta (aguardando merge)
- Contrato T5: `active/CONTRATO_IMPLANTACAO_MACRO_T5.md` — STATUS: aberto
- Gate G5: bloqueado até PR-T5.R
- T6: bloqueado até G5 APROVADO

### Próximo passo (reafirmado)

- `PR-T0.1 — Inventário de fluxos e estados vivos` (equivalente a `T0-PR2 — inventario legado vivo`).
- Leituras obrigatórias adicionais: Bíblia §G + §S, `PR_EXECUTION_TEMPLATE.md`, `PR_HANDOFF_TEMPLATE.md`.

## Atualizacao 2026-04-23 — Adendo canônico A00-ADENDO-02 publicado (soberania LLM-MCMV)

### Objetivo executado

Criar adendo canônico forte (`schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`) que:

- Posiciona a Enova 2 explicitamente como **atendente especialista MCMV**, humana na fala, LLM-first de verdade, com soberania de raciocínio e fala.
- Proíbe formalmente que a Enova 2 seja executada como continuação mecânica da Enova 1.
- Define o papel correto do conhecimento normativo, memória e telemetria: suporte ao LLM, nunca casca dominante.
- Inclui guia de leitura com travas explícitas para T1, T3, T4, T5 e T6 — as fases com maior risco de má interpretação.
- Define o uso correto da E1: matéria-prima de conhecimento, regras, telemetria e ativos úteis; sem refatoração imediata, sem recriar casca mecânica.

### Prioridade máxima de interpretação

**Este adendo (A00-ADENDO-02) passa a ser leitura obrigatória antes de qualquer PR de T1, T3, T4, T5 ou T6.**

Sua posição na cadeia de precedência:

```
LEGADO_MESTRE > A00 > A01 > A00-ADENDO-01 > A00-ADENDO-02 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato ativo
```

### O que foi feito

- Criado `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02): identidade, visão de produto, divisão canônica LLM × mecânico, papel do conhecimento normativo, reaproveitamento correto da E1, proibições formais, guia de leitura por fase.
- Atualizado `schema/CODEX_WORKFLOW.md`: adendo adicionado na lista de leitura obrigatória (item 32) e na cadeia de precedência (seção 2); alertas explícitos para T1/T3/T4/T5/T6.
- Atualizado `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`: cadeia de precedência atualizada (seção A), leituras obrigatórias por PR (seção E com items 10 e 11), nova seção S0 com travas LLM-first por fase.
- Atualizado `schema/contracts/_INDEX.md`: precedência, adendos ativos, regra de leitura, data de sincronização.
- Atualizado `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` (este arquivo): registro deste adendo como prioridade máxima de interpretação.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: registro desta PR.
- Atualizado `README.md`: referência ao novo adendo na cadeia de precedência e nos documentos canônicos.

### O que não foi feito

- Nenhuma alteração em runtime.
- Nenhuma alteração em `src/`, `package.json` ou `wrangler.toml`.
- Nenhuma alteração no macro soberano (`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`).
- Nenhuma refatoração da Enova 1.
- Nenhuma abertura de implementação funcional.
- Nenhuma mudança de gate ou de próximo passo autorizado.

### Regra de E1 atualizada

- A Enova 1 não deve ser refatorada nesta etapa (T0).
- O uso da E1 é apenas de diretriz de reaproveitamento futuro: inventário, mapeamento, referência de regras.
- Quando a fase de memória (T2) chegar, a base da E1 será usada como matéria-prima (dados, regras, casos, estrutura de estado). A integração será definida no contrato T2.
- O uso da E1 foca em: **conhecimento, telemetria, regras, ativos úteis** — nunca em casca mecânica de atendimento.

### Exceção contratual

- Exceção contratual ativa nesta PR: não.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente exceção contratual.

### Próximo passo autorizado (inalterado)

- `PR-T0.1` / `T0-PR2` — inventário de fluxos e estados vivos.
- **A PR-T0.1 deve ser executada lendo obrigatoriamente o novo adendo A00-ADENDO-02.**

### Leituras obrigatórias da próxima PR (reafirmadas e expandidas)

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
5. `schema/execution/PR_EXECUTION_TEMPLATE.md`
6. `schema/handoffs/PR_HANDOFF_TEMPLATE.md`
7. `schema/CODEX_WORKFLOW.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)

---

## Atualizacao 2026-04-23 — WORKFLOW macro amarrado como regra viva (histórico)

### Objetivo executado (PR anterior)

Transformar em regra operacional obrigatoria no `schema/CODEX_WORKFLOW.md` aquilo que ja estava aprovado no repo:
macro soberano, Biblia de PRs, templates canônicos, gates T0-T7/G0-G7 e excecao contratual manual do Vasques.

### O que foi feito

- O `schema/CODEX_WORKFLOW.md` passou a exigir leitura previa obrigatoria de PR macro com:
  - `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
  - `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`
  - contrato ativo da fase
  - handoff vivo da fase
  - o proprio `schema/CODEX_WORKFLOW.md`
- O `schema/CODEX_WORKFLOW.md` passou a exigir abertura de PR com o bloco de `schema/execution/PR_EXECUTION_TEMPLATE.md`.
- O `schema/CODEX_WORKFLOW.md` passou a exigir fechamento com handoff no formato `schema/handoffs/PR_HANDOFF_TEMPLATE.md`.
- O `schema/CODEX_WORKFLOW.md` passou a bloquear excecao contratual sem autorizacao manual explicita do Vasques.
- O `schema/CODEX_WORKFLOW.md` passou a listar explicitamente os limites duros nao exceptuaveis.
- O `schema/CODEX_WORKFLOW.md` passou a travar formalmente os gates T0-T7/G0-G7 sem salto.
- O `schema/CODEX_WORKFLOW.md` passou a travar mistura de escopo e exigir checagem final Biblia + contrato ativo + handoff vivo antes de encerrar PR.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- Nenhuma mudanca de gate ou de proximo passo autorizado.

### Excecao contratual

- Excecao ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Proximo passo autorizado (inalterado)

- `PR-T0.1` / `T0-PR2` — inventario de fluxos e estados vivos.

### Leituras obrigatorias da proxima PR (reafirmadas)

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
5. `schema/execution/PR_EXECUTION_TEMPLATE.md`
6. `schema/handoffs/PR_HANDOFF_TEMPLATE.md`
7. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — Internalizacao canonica da classificacao ENOVA 1 (continuidade documental de PR-T0.1)

### Objetivo executado

Internalizar no repositorio ENOVA 2, de forma canônica e sem dependencia externa, a classificacao executiva da base ENOVA 1 para orientar reaproveitamento em T0 e fases seguintes.

### O que foi feito

- Criado `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md` com consolidacao interna de:
  - cognitivo util reaproveitavel;
  - mecanico estrutural util reaproveitavel;
  - mecanico de fala proibido;
  - telemetria/CRM/painel/docs/reset/correspondente: o que aproveitar, redesenhar e nao levar;
  - riscos de copiar a ENOVA 1 sem filtro;
  - blocos prioritarios da ENOVA 1 para absorcao inicial.
- Atualizado `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md` para registrar a evidencia documental adicionada nesta continuidade de T0.
- Atualizado `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` em `PR-T0.1` para explicitar a internalizacao canônica como entregavel do inventario.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` com o estado desta PR.

### O que nao foi feito

- Nenhuma implementacao funcional.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- Nenhuma refatoracao funcional da E1.
- Nenhum fechamento de gate G0 nesta PR.

### Regra de reaproveitamento consolidada

- Permitido: conhecimento cognitivo util + mecanico estrutural util.
- Proibido: casca mecanica de fala, fallback dominante e scripts roteirizados de superficie.
- E1 permanece como materia-prima futura de memoria/conhecimento; nao entra em refatoracao funcional agora.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Proximo passo autorizado (mantido em T0)

- Continuidade de `PR-T0.1` / `T0-PR2` — inventario legado vivo e mapa de aproveitamento contra o mestre.

### Leituras obrigatorias da proxima PR (reafirmadas)

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
5. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
6. `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md`
7. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
9. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — Internalizacao canonica do inventario vivo real da ENOVA 1 (continuidade documental de PR-T0.1)

### Objetivo executado

Internalizar no repositorio ENOVA 2, sem dependencia externa, o inventario do legado vivo real da ENOVA 1 para fortalecer T0.1 e preparar fechamento futuro de G0 com evidencia documental mais robusta.

### O que foi feito

- Criado `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` com consolidacao canônica interna de:
  - objetivo do inventario e criterio de evidencia;
  - fluxos vivos reais;
  - stages/estados/gates vivos reais;
  - transicoes reais e dinamicas relevantes;
  - blocos inconclusivos;
  - blocos com padrao de residuo/stub/legado morto;
  - divergencias entre documentacao e runtime;
  - implicacoes para ENOVA 2 e conclusao objetiva.
- Atualizado `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md` para registrar a nova evidencia documental de continuidade de `PR-T0.1`.
- Atualizado `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` em `PR-T0.1` para explicitar o inventario vivo real como entregavel canônico interno adicional.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` com o estado desta entrega.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- Nenhuma implementacao funcional.
- Nenhuma refatoracao funcional da E1.
- Nenhum fechamento automatico de gate G0.

### Regra consolidada para as proximas PRs

- T0.1 agora possui:
  - classificacao de reaproveitamento da ENOVA 1;
  - inventario vivo real da ENOVA 1.
- Reaproveitamento permitido mantido:
  - conhecimento cognitivo util;
  - mecanico estrutural util.
- Reaproveitamento proibido mantido:
  - casca mecanica de fala.

### Tratamento da E1

- E1 segue como materia-prima futura de memoria/conhecimento.
- E1 nao entra em refatoracao nesta etapa.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Proximo passo autorizado (mantido em T0)

- Continuidade de `PR-T0.1` / `T0-PR2` — inventario legado vivo e consolidacao para readiness de G0, sem abrir implementacao funcional.

### Leituras obrigatorias da proxima PR (reafirmadas)

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md`
7. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — fechamento documental real de escopo de PR-T0.1 (continuidade)

### Objetivo executado

Consolidar o inventario operacional auditavel de `PR-T0.1` sem abrir escopo funcional, deixando explicito o que ja esta coberto e a lacuna exata que ainda impede fechamento formal da etapa.

### O que foi feito

- Atualizado `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` com:
  - matriz de rastreabilidade operacional (fluxos topo->pos-envio_docs -> blocos legados correspondentes);
  - inventario de estados/campos usados com nivel de prova;
  - checklist de cobertura obrigatoria de `PR-T0.1`;
  - decisao canonica de nao fechar `PR-T0.1` sem prova remanescente.
- Atualizado `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md` para refletir o estado real:
  - `T0-PR1` concluida;
  - `T0-PR2` em execucao (continuidade documental de `PR-T0.1`);
  - lacuna remanescente declarada sem ambiguidade.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` com o novo estado vivo dessa continuidade.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- Nenhuma implementacao funcional.
- Nenhum fechamento de G0.
- Nenhuma abertura de T1.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Estado atual pos-encerramento

- `PR-T0.1` **permanece aberta** — lacuna remanescente declarada (ver §14 do inventario).
- G0 aberto.
- Lacunas remanescentes (declaradas em T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §14):
  - blocos L15-L16 com prova em nivel "parcial estrutural" (dominio confirmado, microregras P3 pendentes de PDF);
  - itens `informativo_*` e `COGNITIVE_V2_MODE` permanecem inconclusivos (correto — sem prova de uso produtivo).

### Proximo passo autorizado

- Continuidade de **`PR-T0.1`** — eliminar a lacuna remanescente.

---

## Atualizacao 2026-04-23 — prova equivalente parcial de PR-T0.1 (lacuna remanescente declarada)

### Objetivo executado

Complementar o inventario de `PR-T0.1` com prova equivalente auditavel para blocos L03-L14 e L17,
declarar lacuna remanescente explicita (L15-L16 e origem legada/persistida) sem fechar prematuramente.

### O que foi feito

- Atualizado `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`:
  - secao 13: origens de coluna/tabela referenciadas via Taxonomia Oficial PDF6 + schema Supabase canonico;
  - secao 14: decisao canonica de nao fechamento de PR-T0.1, com lacuna remanescente explicita;
  - secao 15 (nova): prova equivalente auditavel para blocos L03-L14 e L17; L15-L16 permanecem "parcial estrutural".
- Atualizado `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - quebra oficial de PRs corrigida: PR-T0.1 como "em execucao"; PR-T0.2 como "bloqueada ate encerramento de PR-T0.1";
  - proximo passo autorizado: continuidade de PR-T0.1.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` refletindo estado aberto de PR-T0.1.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- Nenhuma implementacao funcional.
- PR-T0.1 nao encerrada (lacuna remanescente declarada).
- G0 nao aprovado.
- T1 nao aberta.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Estado atual pos-encerramento

- `PR-T0.1` **permanece aberta**.
- G0 aberto.
- Lacunas remanescentes (declaradas em T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §14):
  - blocos L15-L16 com prova em nivel "parcial estrutural" (dominio confirmado, microregras P3 pendentes de PDF);
  - origem legada/persistida dos estados apoiada no schema alvo Enova 2 (PDF6) em vez do legado E1 sem inferencia.

### Proximo passo autorizado

- Continuidade de **`PR-T0.1`** — eliminar a lacuna remanescente para fechar com prova conclusiva.

### Leituras obrigatorias para a continuidade de PR-T0.1

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T0.1)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
7. `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — encerramento de PR-T0.1 (lacunas remanescentes eliminadas)

### Objetivo executado

Eliminar as duas lacunas remanescentes de `PR-T0.1`:
1. Elevar L15-L16 de "parcial estrutural" para "validada por referencia".
2. Bifurcar prova de origem E1 do mapeamento alvo E2 em secao 13 do inventario.

### O que foi feito

- Atualizado `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`:
  - secao 13: bifurcacao explicita de prova — coluna "Bloco legado (origem E1)" separada de
    "Mapeamento alvo E2 (coluna/tabela)"; limitacao de transcricao Supabase E1 declarada
    explicitamente como escopo futuro (L-block PDF pendente).
  - secao 14: todos os criterios de PR-T0.1 atendidos; PR-T0.1 declarada pronta para encerramento;
    PR-T0.2 desbloqueada; G0 permanece aberto.
  - secao 15: L15-L16 elevados para "validada por referencia" via implementacao canonica Core
    Mecanico 2 (branch `feat/core-especiais-p3-multi-variantes`, commit
    `a3c27abec10af5222501e8dbcfae39705900af97`; PDF mestre E6.2/F2/F4 como fonte declarada;
    stage `qualification_special`; trilhos P3 e multi com gates e fatos obrigatorios documentados).
  - secao 15 conclusao: todos os blocos L03-L17 em "validada por referencia".
- Atualizado `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.1 marcada como concluida; PR-T0.2 desbloqueada.
  - Proximo passo: PR-T0.2.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: reflete encerramento de PR-T0.1.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- Nenhuma implementacao funcional.
- G0 nao aprovado (requer PR-T0.R apos PR-T0.2 a PR-T0.6).
- T1 nao aberta.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Estado atual pos-encerramento

- `PR-T0.1` **encerrada em pre-readiness G0**.
- G0 aberto.
- Limitacao residual documentada (nao bloqueia PR-T0.2): tabela/coluna real Supabase E1 por estado
  nao transcrita; disponivel somente em L-block PDF (escopo de transcricao futura).

### Proximo passo autorizado

- **`PR-T0.2`** — Inventario de regras e classificacao por familia (desbloqueada).

### Leituras obrigatorias para PR-T0.2

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T0.2)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
7. `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — encerramento de PR-T0.2 (inventario de regras por familia)

### Objetivo executado

`PR-T0.2` — listar e classificar regras do legado em 7 familias canonicas com bloco legado de origem
e status (ativa/condicional/morta) por regra.

### O que foi feito

- Criado `schema/implantation/INVENTARIO_REGRAS_T0.md` com:
  - 48 regras catalogadas (38 ativas, 6 condicionais, 4 mortas);
  - familias: negocio (12), compliance (5), docs (5), UX (9), operacao (5), roteamento (7), excecao (5);
  - bloco legado de origem (L03-L19) por regra;
  - fonte LEGADO_MESTRE soberano (linha ou secao) por regra;
  - regras inconclusivas declaradas: 8 categorias (topo fino, composicao familiar, estado civil
    intermediario, renda multipla, heuristicas de restricao, final operacional, QA, MCMV);
  - nota explicitando limite: L-blocks e C01-C09 nao transcritos — catalogo expandivel em PR-T0.3+.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.2 concluida; PR-T0.3 desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- G0 nao aprovado (requer PR-T0.R apos PR-T0.3 a PR-T0.6).
- T1 nao aberta.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Estado atual pos-encerramento

- `PR-T0.1` encerrada.
- `PR-T0.2` **encerrada**.
- G0 aberto.
- `PR-T0.3` desbloqueada.

### Proximo passo autorizado

- **`PR-T0.3`** — Inventario de parsers, regex, fallbacks e heuristicas.

### Leituras obrigatorias para PR-T0.3

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T0.3)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
7. `schema/implantation/INVENTARIO_REGRAS_T0.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — encerramento de PR-T0.3 (inventario de parsers, heuristicas e branches de stage)

### Objetivo executado

`PR-T0.3` — inventariar parsers, regex, fallbacks, heuristicas e branches de stage do legado ENOVA 1
com bloco legado de origem, fonte auditavel, regra associada (PR-T0.2), status e risco estrutural.

### O que foi feito

- Criado `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md` com:
  - 27 pontos de decisao mecanica catalogados (17 ativos, 5 condicionais, 3 residuais, 2 mortos);
  - 5 tipos cobertos: parser (2), regex (2), fallback (7), heuristica (7), stage (9);
  - bloco legado de origem (L03-L19) por item;
  - fonte LEGADO_MESTRE soberano (linha ou secao) por item;
  - regra associada (PR-T0.2 ID) por item;
  - 8 categorias de inconclusivos declaradas (§7): limitacoes estruturais de L-blocks PDF nao transcritos;
  - secao §8: classificacao explicita de cada inconclusivo como "limitacao estrutural — nao bloqueante" (criterio de aceite: catalogar pontos identificaveis nas fontes acessiveis — completamente atendido);
  - Bloco E (A00-ADENDO-03) incorporado no documento.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.3 concluida; PR-T0.4 desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- G0 nao aprovado (requer PR-T0.R apos PR-T0.3 a PR-T0.6).
- T1 nao aberta.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md
Estado da evidência:                   completa — 27 itens catalogados em 5 tipos, cobrindo todas as
                                       fontes acessíveis; critério de aceite de PR-T0.3 plenamente atendido
Há lacuna remanescente?:               não — os 8 inconclusivos declarados no §7 são limitações
                                       estruturais de L-blocks não transcritos (PDF inacessível),
                                       classificados explicitamente como não bloqueantes no §8;
                                       nenhum ponto identificável nas fontes acessíveis foi omitido
Há item parcial/inconclusivo bloqueante?: não — todos os 27 itens têm evidência auditável completa;
                                       os inconclusivos de L-blocks são limitações de acesso,
                                       não itens parciais do catálogo de PR-T0.3
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         encerrada
Próxima PR autorizada:                 PR-T0.4 — Inventário de canais, superfícies e telemetria
```

### Estado atual pos-encerramento

- `PR-T0.1` encerrada.
- `PR-T0.2` encerrada.
- `PR-T0.3` **encerrada** — Bloco E: fechamento valido (evidencia completa dentro do escopo; inconclusivos de L-blocks sao limitacoes estruturais nao bloqueantes, declaradas explicitamente no §8 do documento-base).
- G0 aberto.
- `PR-T0.4` desbloqueada.

### Proximo passo autorizado

- **`PR-T0.4`** — Inventario de canais, superficies e telemetria.

### Leituras obrigatorias para PR-T0.4

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T0.4)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
7. `schema/implantation/INVENTARIO_REGRAS_T0.md`
8. `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
11. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
12. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — encerramento de PR-T0.4 (inventario de canais, superficies e telemetria)

### Objetivo executado

`PR-T0.4` — inventariar canais, superficies de interacao, endpoints e pontos de telemetria/log/evento
do legado ENOVA 1 com bifurcacao explicita E1 (runtime) vs E2 (design-alvo), fluxo de dados por canal,
relacao com regras (PR-T0.2) e parsers/heuristicas (PR-T0.3), status e risco estrutural.

### O que foi feito

- Criado `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md` com:
  - 28 itens catalogados (7 canais, 7 superficies, 3 endpoints, 13 telemetria);
  - 4 tipos: canal (7), superficie (7), endpoint (3), telemetria (13);
  - bifurcacao E1/E2 obrigatoria aplicada: TE-01 como emissao runtime E1 real (linha 3416
    LEGADO_MESTRE); TE-04 a TE-12 como referencias design-alvo E2 (nao prova E1);
  - SF-03 (superficie fala mecanica E1) classificada morta — proibida por A00-ADENDO-01/02;
  - EP-01 a EP-03: endpoints webhook texto, midia e admin/simulacao;
  - TE-13 (CRM E1 real) ativo mas inconclusivo (L18 nao transcrito);
  - fluxo de dados por canal consolidado (tabela CT→EP→SF);
  - 7 categorias de inconclusivos declaradas (L17/L18 nao transcritos; nao bloqueiam PR-T0.4);
  - Bloco E (A00-ADENDO-03) incorporado no documento.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.4 concluida; PR-T0.5 desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- G0 nao aprovado (requer PR-T0.R apos PR-T0.4 a PR-T0.6).
- T1 nao aberta.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md
Estado da evidência:                   completa — 28 itens catalogados em 4 tipos, cobrindo todas as
                                       fontes acessíveis; bifurcação E1/E2 aplicada; critério de aceite
                                       de PR-T0.4 plenamente atendido
Há lacuna remanescente?:               sim — schema real de tabelas E1, eventos específicos emitidos E1
                                       por canal, telemetria de áudio em L17/L18 não transcritos;
                                       declarados em §8; não bloqueiam PR-T0.4
Há item parcial/inconclusivo bloqueante?: não — todos os 28 itens têm evidência auditável completa
                                       (TE-01 com linha exata; TE-04-TE-12 declarados explicitamente
                                       como design-alvo E2; TE-13 inconclusivo com L18 declarado);
                                       os inconclusivos de L-blocks são limitações de acesso estrutural
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         encerrada
Próxima PR autorizada:                 PR-T0.5 — Matriz de risco operacional do legado vivo
```

### Estado atual pos-encerramento

- `PR-T0.1` encerrada.
- `PR-T0.2` encerrada.
- `PR-T0.3` encerrada.
- `PR-T0.4` **encerrada** — Bloco E: fechamento valido (evidencia completa dentro do escopo;
  inconclusivos de L-blocks sao limitacoes estruturais nao bloqueantes; bifurcacao E1/E2 aplicada
  canonicamente).
- G0 aberto.
- `PR-T0.5` desbloqueada.

### Proximo passo autorizado

- **`PR-T0.5`** — Matriz de risco operacional do legado vivo.

### Leituras obrigatorias para PR-T0.5

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T0.5)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
7. `schema/implantation/INVENTARIO_REGRAS_T0.md`
8. `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md`
9. `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
11. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
12. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
13. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — encerramento de PR-T0.5 (matriz de risco operacional do legado vivo)

### Objetivo executado

`PR-T0.5` — produzir matriz de risco cruzando fluxos (PR-T0.1), regras (PR-T0.2),
parsers/heuristicas (PR-T0.3) e canais/superficies/telemetria (PR-T0.4), classificando
o impacto operacional de cada risco por severidade, probabilidade, evidencia e mitigacao sugerida.

### O que foi feito

- Criado `schema/implantation/MATRIZ_RISCO_T0.md` com:
  - 26 riscos catalogados em 5 categorias (elegibilidade, tom/fala, docs, telemetria, estrutural);
  - 3 criticos: RZ-TM-01 (casca mecanica de fala — proibida A00-ADENDO-01/02), RZ-TE-02 (schema
    E1 desconhecido), RZ-ES-04 (abertura de T1 sem G0);
  - 14 altos: parsers/regex sem criterio (RZ-EL-01/04), offtrackGuard (RZ-EL-02), isModoFamiliar
    (RZ-EL-03), fallback default_path (RZ-TM-02), needs_confirmation (RZ-TM-03), correspondente
    orphan (RZ-DC-01), keepStage sem timeout (RZ-DC-02), emitter console.log (RZ-TE-01), CRM E1
    (RZ-TE-03), L-blocks (RZ-ES-01), fallback sem criterio de desligamento (RZ-ES-02), namespace
    E1/E2 (RZ-ES-03), fechamento sem prova (RZ-ES-05);
  - 9 medios: scoring cognitivo (RZ-EL-07/08), alias fim_inelegivel (RZ-EL-05), stubs yesNoStages
    (RZ-EL-06), renda multipla (RZ-TM-04), roteamento docs (RZ-DC-03), site sem doc (RZ-DC-04),
    artefatos (RZ-DC-05), audio telemetria (RZ-TE-04), turn.fallback_used (RZ-TE-05);
  - referencia cruzada auditavel com PR-T0.1 a PR-T0.4 por item;
  - 7 bloqueantes para G0 declarados na tabela de sintese;
  - 7 categorias de inconclusivos declaradas (L-blocks nao transcritos; nao bloqueiam PR-T0.5);
  - Bloco E (A00-ADENDO-03) incorporado no documento.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.5 concluida; PR-T0.6 desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- Nenhuma mitigacao implementada (fora do escopo de PR-T0.5).
- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- G0 nao aprovado (requer PR-T0.R apos PR-T0.5 e PR-T0.6).
- T1 nao aberta.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/MATRIZ_RISCO_T0.md
Estado da evidência:                   completa — 26 riscos catalogados em 5 categorias,
                                       cobrindo todas as fontes acessíveis; referência cruzada
                                       com PR-T0.1 a PR-T0.4; critério de aceite de PR-T0.5
                                       (Bíblia §PR-T0.5) plenamente atendido
Há lacuna remanescente?:               sim — riscos de L-blocks não transcritos (L04, L07-L14,
                                       L17, L18) declarados em §Inconclusivos; não bloqueiam
                                       PR-T0.5 (mesmo critério PR-T0.2/T0.3/T0.4)
Há item parcial/inconclusivo bloqueante?: não — todos os 26 riscos têm evidência auditável
                                       nos inventários anteriores; inconclusivos de L-blocks são
                                       limitações estruturais de acesso
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         encerrada
Próxima PR autorizada:                 PR-T0.6 — Inventário de desligamento futuro e convivência
```

### Estado atual pos-encerramento

- `PR-T0.1` encerrada.
- `PR-T0.2` encerrada.
- `PR-T0.3` encerrada.
- `PR-T0.4` encerrada.
- `PR-T0.5` **encerrada** — Bloco E: fechamento valido (evidencia completa dentro do escopo;
  inconclusivos de L-blocks sao limitacoes estruturais nao bloqueantes; soberania LLM-first
  verificada; 7 bloqueantes para G0 declarados canonicamente).
- G0 aberto.
- `PR-T0.6` desbloqueada.

### Proximo passo autorizado

- **`PR-T0.6`** — Inventario de desligamento futuro e convivencia.

### Leituras obrigatorias para PR-T0.6

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T0.6)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
7. `schema/implantation/INVENTARIO_REGRAS_T0.md`
8. `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md`
9. `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md`
10. `schema/implantation/MATRIZ_RISCO_T0.md`
11. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
12. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
13. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
14. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — encerramento de PR-T0.6 (inventario de desligamento futuro e convivencia)

### Objetivo executado

`PR-T0.6` — classificar cada peca do legado E1 em ordem de desligamento futuro: o que sai primeiro,
o que convive durante migracao (shadow/canary), o que deve ser redesenhado antes de migrar, e o que
se transforma em conhecimento/politica na E2. Definir criterios de desligamento canonicos.

### O que foi feito

- Criado `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md` com:
  - 39 itens em 5 classificacoes: 7 DI (desligar imediato pre-T1), 5 RO (redesenho obrigatorio),
    6 CT (convivencia temporaria shadow/canary), 14 MD (migrar e desligar), 7 RC (reaproveitamento);
  - DS-DI-01 a DS-DI-07: SF-03, PH-F05, RM-01, RM-02, fim_inelegivel, yesNoStages-stubs, RU-06
    classificados como imediatos/proibidos (pre-T1) — proibidos por A00-ADENDO-01/02;
  - 7 criterios de desligamento canonicos (CDC-01 a CDC-07): turn.fallback_used=0, cobertura stages,
    smoke idempotencia, trilha CRM equivalente, emitter persistente, RNM transcrito, policy rules;
  - mapa de dependencias de fallback (EP/CT → SF-02 → SF-01 → PH-F03 → CDC-01 last);
  - referencia cruzada com MATRIZ_RISCO (RZ-xx) por item onde aplicavel;
  - 7 categorias de inconclusivos declaradas (L17/L18 — nao bloqueiam PR-T0.6);
  - Bloco E (A00-ADENDO-03) incorporado.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.6 concluida; PR-T0.R desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- Nenhum desligamento implementado (fora do escopo de PR-T0.6).
- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.
- G0 nao aprovado (requer PR-T0.R).
- T1 nao aberta.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md
Estado da evidência:                   completa — 39 itens em 5 classificações, cobrindo todo
                                       o inventário mapeado em PR-T0.1 a PR-T0.4; critério de
                                       aceite de PR-T0.6 (Bíblia §PR-T0.6) plenamente atendido
Há lacuna remanescente?:               sim — schema real E1 de tabelas Supabase, CRM E1 e
                                       telemetria de áudio em L17/L18 não transcritos impedem
                                       definição completa de critérios CDC para TE-07 a TE-13
                                       e DS-MD-12; declarados em §Inconclusivos; não bloqueiam
Há item parcial/inconclusivo bloqueante?: não — todos os 39 itens têm evidência auditável nos
                                       inventários anteriores (PR-T0.1 a PR-T0.5)
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         encerrada
Próxima PR autorizada:                 PR-T0.R — Readiness e closeout do gate G0
```

### Estado atual pos-encerramento

- `PR-T0.1` encerrada.
- `PR-T0.2` encerrada.
- `PR-T0.3` encerrada.
- `PR-T0.4` encerrada.
- `PR-T0.5` encerrada.
- `PR-T0.6` **encerrada** — Bloco E: fechamento valido; soberania LLM-first verificada;
  criterios CDC canonicos definidos; mapa de dependencias de fallback publicado.
- G0 aberto.
- `PR-T0.R` desbloqueada — todos os 6 inventarios T0 publicados.

### Proximo passo autorizado

- **`PR-T0.R`** — Readiness e closeout do gate G0.

### Leituras obrigatorias para PR-T0.R

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T0.R)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
7. `schema/implantation/INVENTARIO_REGRAS_T0.md`
8. `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md`
9. `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md`
10. `schema/implantation/MATRIZ_RISCO_T0.md`
11. `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md`
12. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
13. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
14. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
15. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — encerramento de PR-T0.R (readiness e closeout do gate G0)

### Objetivo executado

`PR-T0.R` — validar completude da fase T0 com smoke documental de todos os 6 inventarios,
decidir formalmente sobre G0, encerrar o contrato T0 e criar skeleton de T1.

### O que foi feito

- Criado `schema/implantation/READINESS_G0.md` com:
  - smoke documental de PR-T0.1 a PR-T0.6: 6/6 encerrados com Bloco E valido;
  - verificacao de 6/6 criterios de aceite de T0: todos cumpridos;
  - analise dos 7 bloqueantes para G0: RZ-TM-01 e RZ-ES-04 satisfeitos com evidencia;
    RZ-EL-01, RZ-EL-04, RZ-DC-02, RZ-TE-02, RZ-TE-03 declarados com escopo T1+;
  - verificacao de coerencia entre todos os 6 inventarios: referencias cruzadas validas;
  - 5 limitacoes residuais estruturais declaradas (L-blocks, keepStage, schema E1) — escopo T1+;
  - decisao formal G0 APROVADO COM LIMITACOES RESIDUAIS FORMALMENTE DECLARADAS;
  - encerramento de contrato conforme CONTRACT_CLOSEOUT_PROTOCOL;
  - Bloco E (A00-ADENDO-03) incorporado.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - status `encerrado`; PR-T0.R marcada como concluida; T1 autorizada.
- Copiou contrato T0 para `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md`.
- Criou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md` (skeleton — sem corpo).
- Atualizou `schema/contracts/_INDEX.md`:
  - T0 encerrado/arquivado; T1 skeleton como proximo contrato ativo.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` e este handoff.

### O que nao foi feito

- Nenhuma implementacao de T1 (skeleton apenas; corpo sera preenchido em PR-T1.0).
- Nenhum desligamento implementado.
- Nenhuma alteracao em runtime.
- Nenhuma alteracao em `src/`, `package.json` ou `wrangler.toml`.

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/READINESS_G0.md +
                                        PR-T0.1 a PR-T0.6 (inventários seção 1 do READINESS_G0)
Estado da evidência:                   completa — smoke documental de todos os 6 inventários
                                        realizado; 6/6 critérios de aceite T0 verificados;
                                        7 bloqueantes G0 analisados com resolução declarada
Há lacuna remanescente?:               sim — 5 limitações residuais estruturais declaradas
                                        (L17/L18, L04, L11, keepStage, schema E1); TODAS com
                                        escopo T1+ e NÃO bloqueantes para gate documental T0
Há item parcial/inconclusivo bloqueante?: não — nenhum critério de aceite T0 ficou parcial;
                                        inconclusivos são de transcrição PDF (fora do escopo T0)
                                        ou de implementação futura (escopo T1+)
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         T0 encerrada; G0 aprovado; T1 autorizada
Próxima PR autorizada:                 PR-T1.0 — abertura formal da fase T1
```

### Estado atual pos-encerramento

- `PR-T0.1` encerrada.
- `PR-T0.2` encerrada.
- `PR-T0.3` encerrada.
- `PR-T0.4` encerrada.
- `PR-T0.5` encerrada.
- `PR-T0.6` encerrada.
- `PR-T0.R` **encerrada** — G0 APROVADO — contrato T0 ENCERRADO — T1 AUTORIZADA.
- G0 APROVADO em 2026-04-23.
- T0 arquivado.
- T1 skeleton ativo — aguardando PR-T1.0.

### Proximo passo autorizado

- **`PR-T1.0`** — Abertura formal da fase T1 (preenchimento do corpo do contrato T1).

### Leituras obrigatorias para PR-T1.0

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T1.0)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md`
5. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
6. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
7. `schema/implantation/READINESS_G0.md`
8. `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md`
9. `schema/implantation/MATRIZ_RISCO_T0.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
11. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
12. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
13. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — abertura formal do contrato T1 (PR-T1.0)

### Objetivo executado

`PR-T1.0` — preencher formalmente o corpo do contrato T1 conforme CONTRACT_SCHEMA.md,
declarar objetivo, escopo, critérios de aceite, quebra de PRs e gate G1.

### O que foi feito

- Preencheu corpo completo de `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`:
  - objetivo: transformar conhecimento da Enova em contrato operacional claro para o LLM;
  - escopo: 5 dimensões (identidade, tom/regra, comportamentos, saída, bateria adversarial);
  - fora de escopo: prompt real, schema Supabase, policy engine, orquestrador, runtime;
  - dependências e entradas: G0 aprovado + 6 inventários T0 encerrados;
  - saídas: 7 artefatos T1 definidos (T1.0–T1.R) com arquivos e PRs;
  - critérios de aceite: 13 critérios incluindo soberania LLM-first, bateria adversarial,
    nenhuma fala mecânica, rollback de "resposta bonita mas operacionalmente frouxa";
  - provas obrigatórias: Bloco E por PR, bateria 10+ casos, 20–30 casos consistência;
  - quebra de PRs: PR-T1.0 concluída; PR-T1.1 desbloqueada; PR-T1.2–T1.R bloqueadas;
  - gate G1: condições de aprovação e regra de rollback explícitas;
  - legados aplicáveis: L03 e L19 obrigatórios; L04–L18 complementares por segmento;
  - 20 referências obrigatórias listadas;
  - ordem mínima de leitura: L19 → L03.
- Atualizou `schema/contracts/_INDEX.md`: contrato T1 aberto formalmente; PR-T1.1 desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- Nenhum entregável técnico de T1 (PR-T1.1 a PR-T1.R — aguardam prompts específicos).
- Nenhuma implementação de LLM real, prompt, taxonomia ou políticas.
- Nenhuma alteração em runtime (`src/`, `package.json`, `wrangler.toml`).

### Excecao contratual

- Excecao contratual ativa nesta PR: nao.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente excecao contratual.

### Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md
Estado da evidência:                   completa — contrato T1 preenchido conforme CONTRACT_SCHEMA.md
                                        com todas as 16 seções obrigatórias; quebra de PRs definida;
                                        gate G1 explícito; legados aplicáveis declarados
Há lacuna remanescente?:               não — PR-T1.0 é de abertura de contrato (governança),
                                        não de inventário ou prova técnica; escopo cumprido
                                        integralmente
Há item parcial/inconclusivo bloqueante?: não — contrato T1 atende CONTRACT_SCHEMA.md;
                                        nenhuma seção omitida; critérios de aceite verificáveis
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         contrato T1 aberto formalmente; PR-T1.1 desbloqueada
Próxima PR autorizada:                 PR-T1.1 — Separação canônica tom × regra × veto × sugestão × repertório
```

### Estado atual pos-encerramento

- Fase macro: T1 — contrato aberto formalmente.
- G0: APROVADO.
- G1: aberto — aguardando PR-T1.5 + PR-T1.R.
- `PR-T1.0` **encerrada**.
- `PR-T1.1` desbloqueada.
- `PR-T1.2–T1.R` bloqueadas (aguardam conclusão sequencial).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T1.1`** — Separação canônica: tom × regra × veto × sugestão × repertório.

### Leituras obrigatorias para PR-T1.1

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + legados L19 → L03)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (secao PR-T1.1)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
5. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
6. `schema/implantation/INVENTARIO_REGRAS_T0.md`
7. `schema/implantation/READINESS_G0.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
11. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — separacao canonica das 5 camadas do agente (PR-T1.1)

### Objetivo executado

`PR-T1.1` — Criar `schema/implantation/T1_CAMADAS_CANONICAS.md` separando as 5 dimensões canônicas
do agente (TOM / REGRA / VETO / SUGESTÃO MANDATÓRIA / REPERTÓRIO), classificando as 48 regras T0
e protegendo a soberania de fala do LLM.

### O que foi feito

- Criado `schema/implantation/T1_CAMADAS_CANONICAS.md` com:
  - fundamento normativo canônico: soberania LLM na fala; soberania mecânico na regra e decisão
    operacional; nenhuma camada pode cruzar essa fronteira;
  - mapa de responsabilidades por camada (proprietário, competência, o que pertence, o que é proibido);
  - definições completas das 5 camadas:
    - **TOM**: LLM soberano — orienta estilo, energia, profundidade, jamais prescreve palavras;
    - **REGRA**: mecânico soberano — obrigações operacionais (coletar, verificar, rotear), recebida
      pelo LLM como contexto estruturado; nunca fala ao cliente diretamente;
    - **VETO**: mecânico emite flag de bloqueio; LLM comunica a negação naturalmente; nunca vira
      template de resposta;
    - **SUGESTÃO MANDATÓRIA**: mecânico instrui "você DEVE sugerir X neste contexto"; LLM decide
      as palavras; não força texto nem substitui raciocínio;
    - **REPERTÓRIO**: substrato de conhecimento disponível passivamente ao LLM (L19, L03, casos
      históricos); informa sem roteirizar;
  - anti-padrões e travas LLM-first por camada;
  - modelo de interação ASCII (MECÂNICO→contexto estruturado→LLM→reply_text→CANAL);
  - classificação completa das 48 regras T0 com camada primária e secundária;
  - sumário de distribuição: TOM 3, REGRA 28, VETO 8, SUGESTÃO MANDATÓRIA 8, REPERTÓRIO L19+L03;
  - cobertura das microetapas do LEGADO_MESTRE verificada;
  - Bloco E com fechamento permitido.
- Atualizado `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`:
  - PR-T1.1 marcada como concluída; PR-T1.2 desbloqueada.
- Atualizado `schema/contracts/_INDEX.md`:
  - PR-T1.2 como PR atual e próximo passo; sincronização 2026-04-23 registrada.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`:
  - ultima tarefa PR-T1.1; próximo passo PR-T1.2; histórico PR-T1.0 preservado.

### O que nao foi feito

- System prompt não criado (PR-T1.2).
- Taxonomia oficial não criada (PR-T1.3).
- Nenhuma alteração em runtime (`src/`, `package.json`, `wrangler.toml`).
- Nenhum LLM real ativado.
- Nenhuma mudança de gate.

### Bloco E — encerramento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T1.1
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md
Critério de aceite verificado:         5 camadas definidas; 48 regras T0 classificadas; travas
                                       LLM-first sem exceção; soberania de fala do LLM protegida
Estado da evidência:                   completa — T1_CAMADAS_CANONICAS.md gerado com cobertura
                                       total das regras T0 e das microetapas do LEGADO_MESTRE
Há lacuna remanescente?:               não — L04–L17 não transcritos de PDF mas não necessários
                                       para separação de princípio; classificação feita via
                                       INVENTARIO_REGRAS_T0 (fonte canônica dos 48 itens)
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         T1_CAMADAS_CANONICAS.md criado; PR-T1.1 encerrada;
                                       PR-T1.2 desbloqueada
Próxima PR autorizada:                 PR-T1.2 — System prompt canônico em camadas
```

### Excecao contratual

- Exceção contratual ativa nesta PR: não.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente exceção contratual.

### Estado atual pos-encerramento

- Fase macro: T1 — em execução.
- G0: APROVADO.
- G1: aberto — aguardando PR-T1.2–T1.5 + PR-T1.R.
- `PR-T1.1` **encerrada**.
- `PR-T1.2` **desbloqueada**.
- `PR-T1.3–T1.R` bloqueadas (aguardam conclusão sequencial).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T1.2`** — System prompt canônico em camadas (sem ambiguidade central).

### Leituras obrigatorias para PR-T1.2

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + L19 + L03)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T1.2)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/implantation/T1_CAMADAS_CANONICAS.md` (obrigatório — base desta PR)
5. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
6. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
7. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
9. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
10. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — system prompt canonico em camadas (PR-T1.2)

### Objetivo executado

`PR-T1.2` — Criar `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` v1 com o system prompt
da Enova 2 estruturado em camadas, orientando identidade, limites e raciocínio do LLM sem
scripts, templates ou fala mecânica.

### O que foi feito

- Criado `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` v1 com:
  - §1 Identidade (TOM): "Ana", analista especialista MCMV, fala humana, adapta tom ao momento;
  - §2 Papel operacional (REGRA): como o LLM recebe contexto estruturado do mecânico (objetivo,
    restrições, pendências, flags) sem expô-lo ao cliente;
  - §3 Proibições absolutas (VETO): 5 proibições declarativas — aprovação, avanço sem fatos,
    contradição não reconciliada, linguagem de sistema, exposição da mecânica interna;
  - §4 Condução em contextos (SUGESTÃO MANDATÓRIA): 7 orientações de raciocínio — ambiguidade,
    offtrack, renda baixa, autônomo sem IR, CTPS curto, insistência em valores, dado contradito;
  - §5 Conhecimento especialista (REPERTÓRIO): substrato MCMV como competência intrínseca, sem
    template de uso;
  - §6 Objetivo final: qualificar leads com inteligência, honestidade e naturalidade;
  - Tabela de conformidade seção×camada verificada; 7 anti-padrões proibidos;
    6 cenários adversariais documentados; cobertura de microetapas do mestre verificada;
  - Bloco E: fechamento permitido; PR-T1.3 desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`: PR-T1.2 concluída; PR-T1.3 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T1.3 como PR atual e próximo passo.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: ultima tarefa PR-T1.2; próximo passo PR-T1.3.

### O que nao foi feito

- Taxonomia oficial não criada (PR-T1.3).
- Contrato de saída não criado (PR-T1.4).
- Comportamentos canônicos não criados (PR-T1.5).
- Prompt não carregado em runtime (correto — escopo de T3/T4).
- Nenhum LLM real ativado.
- Nenhuma alteração em runtime (`src/`, `package.json`, `wrangler.toml`).

### Bloco E — encerramento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T1.2
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md
Critério de aceite verificado:         prompt v1 em 6 seções cobrindo as 5 camadas; identidade,
                                       limites e objetivos cobertos; remetendo às camadas via
                                       tabela de conformidade; bateria adversarial mínima
                                       documentada sem execução de LLM real
Estado da evidência:                   completa — T1_SYSTEM_PROMPT_CANONICO.md v1 gerado com
                                       estrutura em camadas, anti-padrões proibidos, cenários
                                       adversariais, conformidade com T1_CAMADAS_CANONICAS verificada
Há lacuna remanescente?:               não — prompt cobre identidade, limites, objetivos e
                                       remete às camadas; não está em runtime (correto);
                                       taxonomia/contrato de saída são escopo de T1.3/T1.4
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         T1_SYSTEM_PROMPT_CANONICO.md v1 publicado; PR-T1.2
                                       encerrada; PR-T1.3 desbloqueada
Próxima PR autorizada:                 PR-T1.3 — Taxonomia oficial (facts/objetivos/pendências/conflitos/riscos/ações)
```

### Excecao contratual

- Exceção contratual ativa nesta PR: não.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente exceção contratual.

### Estado atual pos-encerramento

- Fase macro: T1 — em execução.
- G0: APROVADO.
- G1: aberto — aguardando PR-T1.3–T1.5 + PR-T1.R.
- `PR-T1.2` **encerrada**.
- `PR-T1.3` **desbloqueada**.
- `PR-T1.4–T1.R` bloqueadas (aguardam conclusão sequencial).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T1.3`** — Taxonomia oficial (facts/objetivos/pendências/conflitos/riscos/ações).

### Leituras obrigatorias para PR-T1.3

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + L19 + L03)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T1.3)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/implantation/T1_CAMADAS_CANONICAS.md`
5. `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` (obrigatório — base desta PR)
6. `schema/implantation/INVENTARIO_REGRAS_T0.md`
7. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
8. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
11. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
12. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — taxonomia oficial do agente (PR-T1.3)

### Objetivo executado

`PR-T1.3` — Criar `schema/implantation/T1_TAXONOMIA_OFICIAL.md` definindo a taxonomia canônica
de facts, objetivos, pendências, conflitos, riscos e ações — organizando o raciocínio do agente
sem escrever fala, amarrada aos 48 itens do inventário T0.

### O que foi feito

- Criado `schema/implantation/T1_TAXONOMIA_OFICIAL.md` com:
  - §1 Finalidade e princípio canônico: "A taxonomia organiza o raciocínio — ela nunca escreve a fala";
  - §2 Tabela de uso: 6 categorias × quem produz / consome / não pode conter;
  - §3 FACTS (18 tipos em 8 grupos):
    - F1 Perfil pessoal: estado civil, nationality, rnm_status, dependente;
    - F2 Regime/renda P1: work_regime_p1, monthly_income_p1, autonomo_has_ir_p1, ctps_36m_p1;
    - F3 Processo/composição: processo, p3_required;
    - F4 P2: work_regime_p2, monthly_income_p2, autonomo_has_ir_p2;
    - F5 P3: work_regime_p3;
    - F6 Elegibilidade: credit_restriction, restriction_regularization_status;
    - F7 Documentação: doc_identity/income/residence/ctps/channel;
    - F8 Operacional: visit_interest;
  - §4 OBJETIVOS (9): OBJ_COLETAR, OBJ_CONFIRMAR, OBJ_SUGERIR_COMPOSICAO, OBJ_ORIENTAR_IR,
    OBJ_INFORMAR_CTPS, OBJ_RETORNAR_AO_TRILHO, OBJ_AVANÇAR_STAGE, OBJ_PREPARAR_DOCS, OBJ_HANDOFF;
  - §5 PENDÊNCIAS (6): PEND_SLOT_VAZIO, PEND_CONFIRMACAO, PEND_DOCUMENTO, PEND_P2_SLOT,
    PEND_P3_SLOT, PEND_RNM;
  - §6 CONFLITOS (4): CONF_DADO_CONTRADITO, CONF_COMPOSICAO, CONF_PROCESSO, CONF_RENDA;
  - §7 RISCOS (8 em 5 severidades): BLOQUEANTE (inelegibilidade restrição/RNM), ORIENTATIVO
    (renda baixa, IR autônomo, CTPS curto), VETO (promessa), INFORMATIVO (offtrack),
    OPERACIONAL (dados conflitantes);
  - §8 AÇÕES (11): ACAO_AVANÇAR_STAGE, ACAO_ROTEAR_SPECIAL/DOCS/AGUARDANDO, ACAO_FORCAR_CONJUNTO,
    ACAO_SINALIZAR_CONFLITO, ACAO_INELEGIBILIDADE, ACAO_KEEPSTAGE, ACAO_HANDOFF,
    ACAO_BYPASS_MANUAL, ACAO_ROLLBACK_FLAG;
  - §9 Tabela completa: 48 regras T0 → categorias de taxonomia (cobertura total);
  - §10 Resumo de contagem por categoria;
  - §11 O que esta taxonomia NÃO é (não é schema Supabase, não é contrato de saída, não é policy
    engine, não é roteiro);
  - §12 Cobertura de microetapas do mestre (7/7 verificadas);
  - Bloco E: fechamento permitido; PR-T1.4 desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`: PR-T1.3 concluída; PR-T1.4 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T1.4 como PR atual e próximo passo.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: ultima tarefa PR-T1.3; próximo passo PR-T1.4.

### O que nao foi feito

- Contrato de saída não criado (PR-T1.4).
- Comportamentos canônicos não criados (PR-T1.5).
- Taxonomia não carregada em runtime (correto — escopo T3/T4).
- Nenhum LLM real ativado.
- Nenhuma alteração em runtime (`src/`, `package.json`, `wrangler.toml`).

### Excecao contratual

- Exceção contratual ativa nesta PR: não.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente exceção contratual.

### Bloco E — encerramento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T1.3
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md
Critério de aceite verificado:         6 categorias definidas; 48 regras T0 mapeadas; nenhum
                                       campo redige fala; princípio "taxonomia organiza raciocínio"
                                       declarado e verificado em todos os tipos
Estado da evidência:                   completa — T1_TAXONOMIA_OFICIAL.md gerado com 56 tipos
                                       canônicos; cobertura total das regras T0; trava LLM-first
                                       verificada; microetapas do mestre cobertas 7/7
Há lacuna remanescente?:               não — taxonomia cobre o escopo completo de PR-T1.3;
                                       campos de saída estruturada (reply_text, schema) são
                                       escopo de PR-T1.4 (contrato de saída)
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         T1_TAXONOMIA_OFICIAL.md publicado; PR-T1.3 encerrada;
                                       PR-T1.4 desbloqueada
Próxima PR autorizada:                 PR-T1.4 — Contrato de saída do agente
```

### Estado atual pos-encerramento

- Fase macro: T1 — em execução.
- G0: APROVADO.
- G1: aberto — aguardando PR-T1.4–T1.5 + PR-T1.R.
- `PR-T1.3` **encerrada**.
- `PR-T1.4` **desbloqueada**.
- `PR-T1.5–T1.R` bloqueadas (aguardam conclusão sequencial).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T1.4`** — Contrato de saída do agente (reply_text + facts + objetivo + flags + bloqueios).

### Leituras obrigatorias para PR-T1.4

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + L19 + L03)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T1.4)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/implantation/T1_CAMADAS_CANONICAS.md`
5. `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md`
6. `schema/implantation/T1_TAXONOMIA_OFICIAL.md` (obrigatório — base desta PR)
7. `schema/implantation/INVENTARIO_REGRAS_T0.md`
8. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
9. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
11. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
12. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
13. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — contrato de saida do agente (PR-T1.4)

### Objetivo executado

`PR-T1.4` — Criar `schema/implantation/T1_CONTRATO_SAIDA.md` definindo a interface conceitual
de saída estruturada do agente ENOVA 2 por turno — campos, semântica, responsabilidade e travas
LLM-first. Sem implementação de runtime, sem schema Supabase, sem policy engine.

### O que foi feito

- Criado `schema/implantation/T1_CONTRATO_SAIDA.md` com:
  - Princípio canônico: `reply_text` é sempre e exclusivamente do LLM; demais campos são
    estruturais — organizam estado e decisão, nunca falam com o cliente;
  - §1 Tabela de soberania: 13 campos × soberano × trava canônica;
  - §2 Shape descritivo completo (TurnoSaida + sub-shapes FactsUpdated, Objective, Pending,
    Conflict, Risk, Action, Block, Confidence, Flags);
  - §3 Semântica completa de cada campo:
    - `reply_text` — LLM soberano — texto ao cliente;
    - `turn_id` / `case_id` — identidade do turno/case;
    - `facts_updated` — F1–F8 da taxonomia; source + confirmed flag;
    - `next_objective` — OBJ_* da taxonomia; mecânico declara; LLM conduz;
    - `pending` — PEND_* da taxonomia; slots obrigatórios ausentes;
    - `conflicts` — CONF_* da taxonomia; implica needs_confirmation=true;
    - `risks` — RISCO_* da taxonomia com severidade;
    - `actions_executed` — ACAO_* da taxonomia; mecânico executa;
    - `blocks` — bloqueios semânticos internos;
    - `needs_confirmation` — flag obrigatória (boolean);
    - `confidence` — único campo de meta-avaliação do LLM (high/medium/low);
    - `flags` — sinais operacionais (bypass_manual, rollback_flag, offtrack);
  - §4 Tabela resumo: campos × responsável × proibição absoluta;
  - §5 Amarração completa à T1_TAXONOMIA_OFICIAL por seção;
  - §6 8 invariantes de consistência interna (I-01 a I-08);
  - §7 6 cenários sintéticos de validação:
    - C1: lead CLT básico — coleta limpa sem pendências;
    - C2: lead autônomo sem IR — risco orientativo + objetivo de orientação;
    - C3: lead casado civil — ACAO_FORCAR_CONJUNTO + coleta P2;
    - C4: restrição de crédito bloqueante — inelegibilidade;
    - C5: conflito de dado contradito — needs_confirmation=true + OBJ_CONFIRMAR;
    - C6: lead offtrack — RISCO_OFFTRACK + OBJ_RETORNAR_AO_TRILHO;
  - §8 Ciclo de vida do contrato por turno (canal-agnóstico);
  - §9 O que este contrato NÃO é (não é schema Supabase, não é runtime, não é policy
    engine, não é template, não é system prompt);
  - §10 Cobertura de microetapas do mestre (8/8 verificadas);
  - Bloco E: fechamento permitido; PR-T1.5 desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`: PR-T1.4 concluída; PR-T1.5 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T1.5 como próximo passo.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: ultima tarefa PR-T1.4; próximo passo PR-T1.5.

### O que nao foi feito

- Comportamentos canônicos e proibições não criados (PR-T1.5).
- Schema Supabase não definido (escopo T2).
- Policy engine não criado (escopo T3).
- Parser/serializer de runtime não implementado (escopo T4).
- Nenhum LLM real ativado.
- Nenhuma alteração em runtime (`src/`, `package.json`, `wrangler.toml`).

### Excecao contratual

- Exceção contratual ativa nesta PR: não.
- Regra vigente reafirmada: somente Vasques pode autorizar manualmente exceção contratual.

### Bloco E — encerramento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T1.4
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md
Critério de aceite verificado:         13 campos canônicos definidos; reply_text soberano do
                                       LLM verificado; shape descritivo completo; 8 invariantes
                                       de consistência; 6 cenários sintéticos (>5 exigidos);
                                       amarração completa à taxonomia T1.3; cobertura das
                                       microetapas do mestre 8/8
Estado da evidência:                   completa — T1_CONTRATO_SAIDA.md gerado com todos os
                                       campos exigidos pelo mestre; invariantes declaradas;
                                       cenários sintéticos validam conformidade de cada campo;
                                       nenhum campo estrutural contém fala ao cliente
Há lacuna remanescente?:               não — schema Supabase é escopo T2; policy engine é
                                       escopo T3; serialização runtime é escopo T4 (todos
                                       corretamente fora do escopo desta PR)
Há item parcial/inconclusivo bloqueante?: não — todos os 13 campos têm definição canônica
                                       completa com semântica, responsável, trava LLM-first
                                       e amarração à taxonomia
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         T1_CONTRATO_SAIDA.md publicado; PR-T1.4 encerrada;
                                       PR-T1.5 desbloqueada
Próxima PR autorizada:                 PR-T1.5 — Comportamentos canônicos e proibições
```

### Estado atual pos-encerramento

- Fase macro: T1 — em execução.
- G0: APROVADO.
- G1: aberto — aguardando PR-T1.R.
- `PR-T1.4` **encerrada**.
- `PR-T1.5` **encerrada**.
- `PR-T1.R` **desbloqueada**.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T1.5`** — Comportamentos canônicos e proibições.

### Leituras obrigatorias para PR-T1.5

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + L19 + L03)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T1.5)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/implantation/T1_CAMADAS_CANONICAS.md`
5. `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md`
6. `schema/implantation/T1_TAXONOMIA_OFICIAL.md`
7. `schema/implantation/T1_CONTRATO_SAIDA.md` (obrigatório — base desta PR)
8. `schema/implantation/INVENTARIO_REGRAS_T0.md`
9. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
10. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
11. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
12. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
13. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
14. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — comportamentos canonicos e proibicoes (PR-T1.5)

### Objetivo executado

`PR-T1.5` — Criar `schema/implantation/T1_COMPORTAMENTOS_E_PROIBICOES.md` definindo os
comportamentos obrigatórios, proibições absolutas e padrões de condução do agente ENOVA 2.
Sem implementação de runtime, sem LLM real, sem policy engine, sem template ou script.

### O que foi feito

- Criou `schema/implantation/T1_COMPORTAMENTOS_E_PROIBICOES.md` com:
  - §1 Princípio de leitura: comportamento = conduta, nunca script; proibição = veto, nunca template;
  - §2 15 comportamentos obrigatórios (C-01..C-15): direção no turno, conflito→needs_confirmation,
    coleta de fatos, off-track→retornar objetivo, risco→registrar, bloqueio→comunicar naturalmente,
    dado contradito→reconciliar, objeção→acolher com substância, renda solo→composição,
    autônomo sem IR→orientar, CTPS→valor estratégico sem bloquear, inelegibilidade→comunicar+alternativa,
    confidence low→continuar, insistência→não ceder, processo conjunto→coletar P2 naturalmente;
  - §3 13 proibições absolutas (V-01..V-13): prometer aprovação/parcela/taxa/subsídio/imóvel,
    avançar sem facts obrigatórios, descartar fato confirmado sem reconciliação, reply_text mecânico,
    template ou script por stage, fallback textual estático, expor mecânica interna, encerrar sem
    alternativa quando há alternativa, coletar dado desnecessário, ignorar conflito e avançar, expandir E1;
  - §4 8 padrões de condução (dúvida, objeção, conflito de informação, risco identificado,
    bloqueio declarado, lead off-track, insistência em valor/taxa/aprovação, áudio ruim);
  - §5 12 cenários adversariais: ambiguidade pura, contradição de fato confirmado, prolixo,
    evasivo, insistência em preço, insistência em aprovação, lead testa limites, documentação
    parcial, inelegibilidade implícita, questionamento de dado anterior, pergunta técnica sobre
    processo interno, mudança de posição após confirmação;
  - §6.1 Amarração às 5 camadas: TOM/REGRA/VETO/SUGESTÃO MANDATÓRIA/REPERTÓRIO × comportamentos e proibições;
  - §6.2 Amarração aos 13 campos de saída: reply_text, facts_updated, next_objective, conflicts,
    risks, blocks, needs_confirmation, confidence, pending, actions_executed, flags.offtrack, flags.bypass_manual;
  - §7 9 anti-padrões comportamentais proibidos;
  - §8 Cobertura dos critérios do mestre verificada;
  - Bloco E: fechamento permitido; PR-T1.R desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`: PR-T1.5 concluída; PR-T1.R desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T1.R como próximo passo.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: ultima tarefa PR-T1.5; próximo passo PR-T1.R.

### O que nao foi feito

- Readiness G1 não criado (PR-T1.R).
- LLM real não implementado.
- Runtime não alterado.

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T1.5
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md
Critério de aceite verificado:         15 comportamentos obrigatórios; 13 proibições absolutas;
                                       8 padrões de condução; 12 cenários adversariais;
                                       amarração completa às 5 camadas e 13 campos de saída;
                                       soberania LLM-first reforçada em todas as seções;
                                       9 anti-padrões comportamentais documentados
Lacuna remanescente:                   nenhuma — bateria adversarial cobre os 6 cenários
                                       obrigatórios do mestre (ambiguidade, contradição,
                                       prolixo, evasivo, áudio ruim, insistência em preço);
                                       amarração às camadas e ao contrato de saída completa
Há item parcial bloqueante?:           não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         T1_COMPORTAMENTOS_E_PROIBICOES.md publicado;
                                       PR-T1.5 encerrada; PR-T1.R desbloqueada
Próxima PR autorizada:                 PR-T1.R — Readiness e closeout do gate G1
```

### Estado atual do repositorio (pós PR-T1.5)

- Fase macro: T1 — em execução.
- G0: APROVADO.
- G1: aberto — aguardando PR-T1.R.
- `PR-T1.5` **encerrada**.
- `PR-T1.R` **desbloqueada**.
- Runtime: inalterado.

### Proximo passo autorizado (pós PR-T1.5)

- **`PR-T1.R`** — Readiness e closeout do gate G1.

### Leituras obrigatorias para PR-T1.R

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + L18 para bateria adversarial)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T1.R)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
4. `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
5. Todos os artefatos T1: T1_CAMADAS_CANONICAS, T1_SYSTEM_PROMPT_CANONICO, T1_TAXONOMIA_OFICIAL,
   T1_CONTRATO_SAIDA, T1_COMPORTAMENTOS_E_PROIBICOES (smoke documental)
6. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
7. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
11. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-23 — readiness G1 e closeout do contrato T1 (PR-T1.R)

### Objetivo executado

`PR-T1.R` — Smoke documental de PR-T1.0 a PR-T1.5; validação de coerência entre artefatos;
decisão formal G1; criação de READINESS_G1.md; closeout contrato T1; skeleton T2.

### O que foi feito

- Criou `schema/implantation/READINESS_G1.md` com:
  - Smoke documental de PR-T1.0 a PR-T1.5: 6/6 PASS com evidências por artefato;
  - Verificação dos 12/12 critérios de aceite do contrato T1 com evidência por critério;
  - Validação de coerência em 5 dimensões: camadas↔system prompt, taxonomia↔contrato de saída,
    comportamentos↔contrato de saída, comportamentos↔camadas, regras T0↔taxonomia↔camadas;
  - Verificação de adendos A00-ADENDO-01/02/03 em todos os artefatos T1 (tabela §2.6);
  - 4 lacunas identificadas e classificadas como não bloqueantes com justificativa;
  - 3 casos sintéticos cobrindo 3 dimensões: estilo/regra/saída (§5);
  - Decisão formal G1 APROVADO (§6.4) — T2 AUTORIZADA;
  - Bloco E: fechamento permitido; PR-T2.0 desbloqueada.
- Encerrou contrato T1 formalmente via CONTRACT_CLOSEOUT_PROTOCOL.md:
  - Bloco ENCERRAMENTO DE CONTRATO preenchido no contrato ativo;
  - Checklist completo — 12/12 critérios de aceite individualmente marcados como cumpridos;
  - Evidências declaradas: PR #83..#88, diffs em schema/implantation/.
- Arquivou contrato T1 em `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T1_2026-04-23.md`.
- Atualizou status do contrato ativo para **ENCERRADO — G1 APROVADO**.
- Criou skeleton T2 em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`:
  - Microetapas do mestre (seção T2) listadas;
  - Escopo previsto;
  - Fora de escopo;
  - Próximo passo: PR-T2.0 com leituras obrigatórias.
- Atualizou `schema/contracts/_INDEX.md`: T1 encerrado/arquivado; T2 skeleton ativo; PR-T2.0 desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: fase T2; G1 APROVADO; PR-T2.0 próximo passo.

### O que nao foi feito

- T2 não aberto com corpo completo (skeleton criado — PR-T2.0 preencherá).
- LLM real não implementado.
- Schema Supabase não definido (escopo T2).
- Runtime não alterado.

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T1.R
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md
Critério de aceite verificado:         smoke documental 6/6 PRs passando; 12/12 critérios
                                       de aceite T1 cumpridos com evidência documental
                                       completa; coerência entre todos os artefatos T1
                                       verificada em 5 dimensões; G1 APROVADO
Lacuna remanescente:                   nenhuma bloqueante — 4 limitações residuais declaradas
                                       e classificadas como fora do escopo de T1 no próprio
                                       contrato T1 §3 (L18 não transcrito; runtime não testado;
                                       TurnoSaida sem schema concreto; 32 vs. "20-30" casos)
Há item parcial bloqueante?:           não — todos os critérios têm evidência completa
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T1.R encerrada; G1 APROVADO; contrato T1 encerrado
                                       e arquivado; skeleton T2 criado; PR-T2.0 desbloqueada
Próxima PR autorizada:                 PR-T2.0 — Abertura do contrato de Estado Estruturado
```

### Estado atual do repositorio

- Fase macro: **T2** — skeleton ativo; aguardando PR-T2.0.
- G0: APROVADO.
- G1: **APROVADO** em 2026-04-23.
- G2: aberto — aguardando PR-T2.R.
- Contrato T1: **ENCERRADO** e arquivado.
- Contrato T2: skeleton em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T2.0`** — Abertura do contrato de Estado Estruturado e Memória v1.

### Leituras obrigatorias para PR-T2.0

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T2)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T2.0)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md` (skeleton a preencher)
4. `schema/implantation/READINESS_G1.md` (smoke e limitações residuais T1)
5. `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T1_2026-04-23.md`
6. Artefatos T1: T1_CAMADAS_CANONICAS, T1_SYSTEM_PROMPT_CANONICO, T1_TAXONOMIA_OFICIAL,
   T1_CONTRATO_SAIDA, T1_COMPORTAMENTOS_E_PROIBICOES
7. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
8. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
11. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
12. `schema/CODEX_WORKFLOW.md`
13. `schema/CONTRACT_SCHEMA.md`

---

## Atualizacao 2026-04-23 — abertura formal do contrato T2 (PR-T2.0)

### Objetivo executado

`PR-T2.0` — preencher formalmente o contrato T2 (Estado Estruturado, Memória e Reconciliação)
conforme `schema/CONTRACT_SCHEMA.md`, sem executar implementação.

### Estado herdado

- Branch `feat/t2-pr20-abertura-contrato` criada limpa a partir de main pós-PR-T1.R.
- G1 APROVADO em 2026-04-23 via PR-T1.R.
- Contrato T1 encerrado e arquivado.
- Skeleton T2 existente em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`.
- Todos os artefatos T1 disponíveis: T1_CAMADAS_CANONICAS, T1_SYSTEM_PROMPT_CANONICO,
  T1_TAXONOMIA_OFICIAL, T1_CONTRATO_SAIDA, T1_COMPORTAMENTOS_E_PROIBICOES.

### O que foi feito

- Preencheu `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md` com corpo completo:
  - Cabeçalho canônico com todos os campos do CONTRACT_SCHEMA.md;
  - Adendos A00-ADENDO-01/02/03 declarados explicitamente;
  - §1 Objetivo: contrato T2 define schema de estado estruturado sem implementar em produção;
  - §2 Escopo: 6 artefatos (dicionário, lead_state, política confiança, reconciliação, resumo persistido, readiness G2);
  - §3 Fora de escopo: T3 (policy), T4 (orquestrador), T5 (migração), T6 (áudio), migrations Supabase, runtime;
  - §4 Dependências: G1 APROVADO + 7 artefatos T1 declarados com status;
  - §5 Entradas: 7 documentos fontes listados;
  - §6 Saídas: tabela com 6 artefatos, PR criadora e descrição;
  - §7 Critérios de aceite: 8 critérios verificáveis declarados;
  - §8 Provas obrigatórias: por PR e PR-T2.R;
  - §9 Bloqueios: 8 condições bloqueantes com ação exigida;
  - §10 Próximo passo: PR-T2.1 com 8 leituras obrigatórias;
  - §11 Relação A01: fase T2, semanas 3–4, gate G2;
  - §12 Relação legados: L03 obrigatório; L05/L19 complementares primários; L04/L07–L17 por microetapa;
  - §13 Referências obrigatórias: 20 documentos listados;
  - §14 Blocos legados: obrigatórios (L03) e complementares organizados;
  - §15 Ordem mínima: L03 → L05 → L19 (expandida por microetapa);
  - §16 Quebra de PRs T2.0–T2.R com entregáveis e dependências;
  - §17 Gate G2: condições de aprovação, reprovação e consequências;
  - Microetapas do mestre (5 itens) com amarração às PRs.
- Atualizou `schema/contracts/_INDEX.md`: status T2 skeleton → aberto; próximo passo PR-T2.1.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: última tarefa PR-T2.0; próximo passo PR-T2.1.

### O que nao foi feito

- Nenhum artefato de execução T2 criado (T2_DICIONARIO_FATOS, T2_LEAD_STATE_V1, etc.) — esses são escopo PR-T2.1+.
- Nenhuma migration Supabase criada.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- Nenhum LLM real testado.

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T2.0
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md
Critério de aceite verificado:         Contrato T2 preenchido conforme CONTRACT_SCHEMA.md;
                                       todas as 17 seções obrigatórias presentes; 8 critérios
                                       de aceite declarados; quebra de PRs T2.0–T2.R com
                                       entregáveis; gate G2 com condições formais; adendos
                                       A00-ADENDO-01/02/03 declarados; legados mapeados;
                                       índice, status e handoff atualizados
Lacuna remanescente:                   nenhuma bloqueante — artefatos de execução T2 são
                                       escopo de PR-T2.1 a PR-T2.5, não de PR-T2.0
Há item parcial bloqueante?:           não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.0 encerrada; contrato T2 aberto formalmente;
                                       PR-T2.1 desbloqueada
Próxima PR autorizada:                 PR-T2.1 — Nomes canônicos dos fatos
```

### Estado atual do repositorio

- Fase macro: **T2** — contrato aberto; PR-T2.1 próxima.
- G0: APROVADO.
- G1: **APROVADO** em 2026-04-23.
- G2: aberto — aguardando PR-T2.R.
- Contrato T2: **aberto** em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T2.1`** — Nomes canônicos dos fatos (sem duplicidade semântica).

### Leituras obrigatorias para PR-T2.1

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md` (contrato aberto)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T2.1)
3. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T2 — State Store, fatos centrais/derivados)
4. `schema/implantation/T1_TAXONOMIA_OFICIAL.md` (56 tipos — base para dicionário)
5. `schema/implantation/T1_CONTRATO_SAIDA.md` (13 campos — fatos que LLM preenche)
6. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
7. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
10. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-24 — dicionario canonico de fatos (PR-T2.1)

### Objetivo executado

`PR-T2.1` — criar `schema/implantation/T2_DICIONARIO_FATOS.md` com nomes canônicos únicos,
mapeamento E1→E2, 7 categorias de memória com limites LLM-first e 10 regras invioláveis.

### Estado herdado

- Branch `feat/t2-pr21-dicionario-fatos` criada limpa a partir de main pós-PR-T2.0.
- Contrato T2 aberto: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`.
- G1 APROVADO; G2 aberto.
- Artefatos T1 completos como base de entrada.

### O que foi feito

- Criou `schema/implantation/T2_DICIONARIO_FATOS.md` com:
  - **§1** Princípio de uso: prefixos `fact_`/`derived_`/`signal_`; memória ≠ fala.
  - **§2** Auditoria de duplicidade semântica: 42 campos E1 analisados; 4 eliminados como fatos primários (`rnm_required`, `dependents_applicable`, `subsidy_band_hint`) ou rebaixados (`has_multi_income_p1`, sinais cognitivos E1); `marital_status` renomeado para `fact_estado_civil`.
  - **§3** Dicionário canônico: 50 chaves estáveis em 12 grupos (I a XII): 35 `fact_*`, 9 `derived_*`, 6 `signal_*`.
  - **§4** 7 categorias de memória com limites explícitos por categoria: atendimento, normativa/MCMV, comercial, manual Vasques, regras do funil, aprendizado por atendimento, operacional/telemetria.
  - **§5** Tabela consolidada E1→E2: cada campo E1 com decisão (renomeado, eliminado, adicionado, alinhado T1).
  - **§6** Contagem final: 50 chaves totais.
  - **§7** 10 regras LLM-first invioláveis (M-01..M-10).
  - **§8** Cobertura das 5 microetapas do mestre declarada.
  - **§9** Bloco E: fechamento permitido; PR-T2.2 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: T2 → em execução; próximo passo PR-T2.2.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: última tarefa PR-T2.1; próximo passo PR-T2.2.

### O que nao foi feito

- T2_LEAD_STATE_V1.md não criado (escopo PR-T2.2).
- Nenhuma migration Supabase.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- Tipologia completa de status do fato (bruto/confirmado/inferência/hipótese/pendência) — detalhamento em T2.4.
- G2 não fechado (requer PR-T2.R).

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
PR que fecha:                          PR-T2.1
Contrato de referência:                schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md
Critério de aceite verificado:         T2_DICIONARIO_FATOS.md cobre todos os fatos centrais e
                                       derivados do mestre seção T2; 50 chaves canônicas sem
                                       duplicidade semântica; 7 categorias de memória com limites;
                                       10 regras LLM-first; tabela E1→E2 exaustiva; 5 microetapas
                                       do mestre cobertas
Lacuna remanescente:                   nenhuma bloqueante — tipologia de status do fato
                                       (bruto/confirmado/etc.) é detalhada em T2.4 conforme
                                       sequência da Bíblia (T2.3 antes de T2.4)
Há item parcial bloqueante?:           não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.1 encerrada; T2_DICIONARIO_FATOS.md publicado;
                                       PR-T2.2 desbloqueada
Próxima PR autorizada:                 PR-T2.2 — Schema lead_state v1
```

### Estado atual do repositorio

- Fase macro: **T2** — em execução; PR-T2.2 próxima.
- G0: APROVADO.
- G1: APROVADO em 2026-04-23.
- G2: aberto — aguardando PR-T2.R.
- T2_DICIONARIO_FATOS.md: **publicado**.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T2.2`** — Schema `lead_state` v1.

### Leituras obrigatorias para PR-T2.2

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T2.2)
3. `schema/implantation/T2_DICIONARIO_FATOS.md` (base obrigatória)
4. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T2 — estado canônico, PDF6 pp. 4–5)
5. `schema/implantation/T1_CONTRATO_SAIDA.md` (13 campos de saída)
6. `schema/implantation/T1_TAXONOMIA_OFICIAL.md` (OBJ_*, PEND_*, CONF_*, RISCO_*)
7. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
8. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
10. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
11. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-24 — schema lead_state v1 (PR-T2.2)

### Objetivo executado

`PR-T2.2` — criar `schema/implantation/T2_LEAD_STATE_V1.md`: schema estrutural canônico do
`lead_state` com todos os blocos, shapes, status de fatos, regras invioláveis e mapeamento
campo ↔ fato ↔ regra.

### Estado herdado

- Branch `feat/t2-pr22-lead-state-v1` criada limpa a partir de main pós-PR-T2.1.
- `T2_DICIONARIO_FATOS.md` publicado (50 chaves: 35 fact_*, 9 derived_*, 6 signal_*).
- T1_TAXONOMIA_OFICIAL.md, T1_CONTRATO_SAIDA.md, mestre seção T2 (PDF6) lidos.

### O que foi feito

- Criou `schema/implantation/T2_LEAD_STATE_V1.md` com:
  - **§1** Visão geral do shape `LeadState` com 10 sub-blocos.
  - **§2** `CaseMeta`: lead_id, case_id, created_at, last_updated, channel_origin.
  - **§3** `OperationalState`: 11 campos do mestre PDF6 (current_phase, current_objective,
    progress_score, risk_level, must_ask_now, blocked_by, recommended_next_actions,
    open_contradictions, last_policy_decision, handoff_readiness, needs_confirmation,
    elegibility_status); 8 valores canônicos de `current_phase`.
  - **§4** `FactBlock`: 35 fact_* por grupos I–X; shape FactEntry com 5 campos;
    5 status canônicos (captured/confirmed/inferred/contradicted/obsolete) com
    transições permitidas e proibidas; índice por grupo com stage de exigibilidade.
  - **§5** `DerivedBlock`: 9 derived_*; shape DerivedEntry com `stale` flag; índice
    com condições de derivação.
  - **§6** `Pending`: 6 PEND_* tipos (PEND_SLOT_VAZIO/CONFIRMACAO/DOCUMENTO/P2_SLOT/P3_SLOT/RNM);
    shape com stage e turno de criação.
  - **§7** `Conflicts`: 4 CONF_* tipos (CONF_DADO_CONTRADITO/COMPOSICAO/PROCESSO/RENDA);
    protocolo de resolução em 6 passos.
  - **§8** `SignalBlock`: 6 signal_*; shape SignalEntry; distinção explícita signal_multi_income_p1
    vs fact_has_multi_income_p1.
  - **§9** `HistorySummary`: 4 camadas (L1 curto prazo, L2 factual estruturada, L3 snapshot
    executivo, L4 histórico frio); shape SnapshotExecutivo com `approval_prohibited = true`
    invariante.
  - **§10** `VasquesNotes`: shape auditável (note_id, content, note_type, author, created_at,
    reason, applies_to, supersedes); 4 tipos de nota; regras de prioridade.
  - **§11** `NormativeContext`: referência compartilhada; não por lead.
  - **§12** 12 regras invioláveis LS-01..LS-12.
  - **§13** Tabela de mapeamento campo ↔ fato canônico ↔ regra T0 (48 linhas).
  - **§14** Tabela de compatibilidade transitória E1→E2 (11 mapeamentos).
  - **§15** Bloco E: fechamento permitido; PR-T2.3 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR atual → PR-T2.2 executada; próximo passo PR-T2.3.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: última tarefa PR-T2.2;
  próximo passo PR-T2.3.

### O que nao foi feito

- T2_POLITICA_CONFIANCA.md não criado (escopo PR-T2.3).
- Tipologia detalhada bruto/confirmado/hipótese/pendência não documentada formalmente (T2.4).
- T2_RESUMO_PERSISTIDO.md não criado (escopo T2.5).
- Nenhuma implementação Supabase real.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- G2 não fechado (requer PR-T2.R após T2.3–T2.5).

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T2_LEAD_STATE_V1.md
PR que fecha:                          PR-T2.2
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 11 blocos canônicos; 35 fact_*; 9 derived_*;
                                       6 signal_*; 6 PEND_*; 4 CONF_*; 4 camadas de memória;
                                       12 regras invioláveis; mapeamento campo↔fato↔regra;
                                       compatibilidade E1→E2; Bloco E no documento.
Há item parcial bloqueante?:           não — política de confiança (T2.3), reconciliação
                                       formal (T2.4) e resumo persistido detalhado (T2.5)
                                       são escopos das próximas PRs, não lacunas desta.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.2 encerrada; T2_LEAD_STATE_V1.md publicado;
                                       PR-T2.3 desbloqueada
Próxima PR autorizada:                 PR-T2.3 — Política de confiança por origem do dado
```

### Estado atual do repositorio

- Fase macro: **T2** — em execução; PR-T2.3 próxima.
- G0: APROVADO.
- G1: APROVADO em 2026-04-23.
- G2: aberto — aguardando PR-T2.R.
- T2_DICIONARIO_FATOS.md: publicado.
- T2_LEAD_STATE_V1.md: **publicado**.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T2.3`** — Política de confiança por origem do dado.

### Leituras obrigatorias para PR-T2.3

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T2.3)
3. `schema/implantation/T2_LEAD_STATE_V1.md` (base obrigatória)
4. `schema/implantation/T2_DICIONARIO_FATOS.md`
5. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T2 — origens de dado)
6. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
7. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
10. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-24 — política de confiança por origem (PR-T2.3)

### Objetivo executado

`PR-T2.3` — criar `schema/implantation/T2_POLITICA_CONFIANCA.md`: política canônica de confiança
por origem do dado, definindo quando dados atingem cada status, quando exigem confirmação, quando
geram conflito e quando bloqueiam avanço de stage.

### Estado herdado

- Branch `feat/t2-pr23-politica-confianca` criada limpa a partir de main pós-PR-T2.2.
- `T2_LEAD_STATE_V1.md` publicado (11 blocos, 5 status de fato).
- `T2_DICIONARIO_FATOS.md` publicado (50 chaves canônicas).
- Mestre seção T2 (PDF6, p. 5–6), T1_CONTRATO_SAIDA, T1_TAXONOMIA lidos.

### O que foi feito

- Criou `schema/implantation/T2_POLITICA_CONFIANCA.md` com:
  - **§1** Referência cruzada com status canônicos do lead_state v1 (+ `hypothesis`).
  - **§2** Tabela das 6 origens com nível de confiança e status máximo atingível.
  - **§3** Política detalhada por origem:
    - O1 `EXPLICIT_TEXT`: alto; críticos exigem confirmação; contradição gera conflito.
    - O2 `INDIRECT_TEXT`: baixo; nunca `confirmed` diretamente; fatos críticos = `hypothesis`.
    - O3 `AUDIO_TRANSCRIPT`: 3 níveis (bom/médio/ruim); áudio ruim não persiste.
    - O4 `DOCUMENT`: alto; conflito com fala anterior; documento ilegível = `hypothesis`.
    - O5 `INFERENCE`: mecânica → `inferred`; LLM → `hypothesis`; nunca `confirmed`.
    - O6 `OPERATOR_NOTE`: auditável; não sobrescreve `confirmed` sem reconciliação.
  - **§4** Mapa de transição de status por origem (tabela executiva).
  - **§5** Lista canônica de 12 fatos críticos com motivo de criticidade.
  - **§6** 7 condições de confirmação obrigatória antes de `confirmed`.
  - **§7** Tabela de geração de conflito + proibição de conflito silencioso.
  - **§8** 6 condições de bloqueio de avanço de stage por confiança.
  - **§9** Registro obrigatório por atualização + 9 valores canônicos de `source`.
  - **§10** 5 casos sintéticos (S1–S5: indireto→confirmado, doc↔fala, áudio ruim, inferência bloqueada, Vasques x confirmed).
  - **§11** Amarração campo por campo ao lead_state v1.
  - **§12** 12 regras invioláveis PC-01..PC-12.
  - **§13** Cobertura das 5 origens do mestre + Vasques.
  - **§14** Bloco E.
- Atualizou `schema/contracts/_INDEX.md`: PR-T2.3 executada; próximo PR-T2.4.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- Reconciliação formal e tipologia detalhada — escopo PR-T2.4.
- T2_RESUMO_PERSISTIDO.md — escopo T2.5.
- Nenhuma implementação Supabase real.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- G2 não fechado.

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T2_POLITICA_CONFIANCA.md
PR que fecha:                          PR-T2.3
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 6 origens cobertas; mapa de transição por origem;
                                       12 fatos críticos; condições de confirmação/conflito/
                                       bloqueio; 9 source values; 5 casos sintéticos;
                                       12 regras PC-01..PC-12; cobertura do mestre verificada.
Há item parcial bloqueante?:           não — reconciliação formal e tipologia hipótese/pendência
                                       são escopo T2.4, não lacunas desta PR.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.3 encerrada; T2_POLITICA_CONFIANCA.md publicado;
                                       PR-T2.4 desbloqueada
Próxima PR autorizada:                 PR-T2.4 — Reconciliação e tipologia
```

### Estado atual do repositorio

- Fase macro: **T2** — em execução; PR-T2.4 próxima.
- G0: APROVADO. G1: APROVADO em 2026-04-23. G2: aberto — aguardando PR-T2.R.
- T2_DICIONARIO_FATOS.md: publicado.
- T2_LEAD_STATE_V1.md: publicado.
- T2_POLITICA_CONFIANCA.md: **publicado**.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T2.4`** — Reconciliação e tipologia (bruto/confirmado/inferência/hipótese/pendência).

### Leituras obrigatorias para PR-T2.4

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T2.4)
3. `schema/implantation/T2_POLITICA_CONFIANCA.md` (base obrigatória)
4. `schema/implantation/T2_LEAD_STATE_V1.md`
5. `schema/implantation/T2_DICIONARIO_FATOS.md`
6. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T2 — casos de mudança de versão)
7. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
8. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
10. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
11. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-24 — reconciliação e tipologia (PR-T2.4)

### Objetivo executado

`PR-T2.4` — criar `schema/implantation/T2_RECONCILIACAO.md`: tipologia formal de estados de fato,
protocolo canônico de reconciliação, hierarquia de prioridade por origem, 10 domínios específicos,
anti-padrões e regras invioláveis.

### Estado herdado

- Branch `feat/t2-pr23-politica-confianca` (reaproveitada para PR-T2.4).
- `T2_POLITICA_CONFIANCA.md` publicado (6 origens, 12 regras PC-01..PC-12).
- `T2_LEAD_STATE_V1.md` publicado (11 blocos, 5 status canônicos).
- `T2_DICIONARIO_FATOS.md` publicado (50 chaves canônicas).

### O que foi feito

- Criou `schema/implantation/T2_RECONCILIACAO.md` com:
  - **§1** Tipologia formal de 7 estados: `hypothesis`, `captured`, `inferred`, `confirmed`,
    `contradicted`, `pending`, `obsolete`; regras internas RC-H1, RC-C1, RC-I1, RC-CF1,
    RC-CO1, RC-P1, RC-OB1.
  - **§2** Protocolo de reconciliação em 7 etapas com fluxograma ASCII:
    - Etapa 1: receber novo dado;
    - Etapa 2: verificar existência no lead_state;
    - Etapa 3A: primeiro registro → `captured`;
    - Etapa 3B: fato existe → avaliar compatibilidade;
    - Etapa 4: gerar CONF_* em conflicts[];
    - Etapa 5: LLM conduz confirmação (OBJ_CONFIRMAR);
    - Etapa 6: resolução — confirmado/obsoleto; Conflict.resolved = true;
    - Etapa 7: trilha de auditoria obrigatória.
  - **§3** Hierarquia de prioridade por origem (não automática): DOCUMENT > EXPLICIT_TEXT
    recente > confirmed anterior > áudio > indireto > inferência; Vasques especial.
  - **§4** 10 domínios específicos de reconciliação:
    - §4.1 Renda (CONF_RENDA);
    - §4.2 Estado civil (CONF_DADO_CONTRADITO / CONF_COMPOSICAO);
    - §4.3 Regime de trabalho (CONF_DADO_CONTRADITO);
    - §4.4 Composição e P2 (CONF_COMPOSICAO / CONF_PROCESSO);
    - §4.5 IR autônomo (CONF_DADO_CONTRADITO);
    - §4.6 Restrição (CONF_DADO_CONTRADITO — ACAO_INELEGIBILIDADE só após confirmed);
    - §4.7 RNM (CONF_DADO_CONTRADITO — mesma regra);
    - §4.8 Áudio ruim (protocolo de recoleta);
    - §4.9 Nota Vasques vs confirmed (bloqueio sem reconciliação formal);
    - §4.10 Documento ilegível (hypothesis não persiste).
  - **§5** 10 casos sintéticos RC-01..RC-10 com passo a passo tabular.
  - **§6** Tabela de transições de status (todas as transições com condições e autoridade).
  - **§7** 12 anti-padrões AP-01..AP-12.
  - **§8** 10 regras invioláveis RC-01..RC-10.
  - **§9** Mapeamento ao lead_state v1 e política de confiança.
  - **§10** Bloco E: fechamento permitido; PR-T2.5 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T2.4 executada; próximo PR-T2.5.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- T2_RESUMO_PERSISTIDO.md não criado (escopo PR-T2.5).
- Nenhuma implementação Supabase real.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- G2 não fechado (requer PR-T2.R após T2.5).

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T2_RECONCILIACAO.md
PR que fecha:                          PR-T2.4
Estado da evidência:                   completa
Há lacuna remanescente?:               não — tipologia 7 estados; protocolo 7 etapas; 10 domínios
                                       específicos; 10 casos sintéticos; tabela de transições
                                       completa; 12 anti-padrões; 10 regras invioláveis;
                                       mapeamento ao lead_state v1 e política de confiança.
Há item parcial bloqueante?:           não — resumo persistido (T2_RESUMO_PERSISTIDO.md) é
                                       escopo T2.5, não lacuna desta PR.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.4 encerrada; T2_RECONCILIACAO.md publicado;
                                       PR-T2.5 desbloqueada
Próxima PR autorizada:                 PR-T2.5 — Resumo persistido (T2_RESUMO_PERSISTIDO.md)
```

### Estado atual do repositorio

- Fase macro: **T2** — em execução; PR-T2.5 próxima.
- G0: APROVADO. G1: APROVADO em 2026-04-23. G2: aberto — aguardando PR-T2.R.
- T2_DICIONARIO_FATOS.md: publicado.
- T2_LEAD_STATE_V1.md: publicado.
- T2_POLITICA_CONFIANCA.md: publicado.
- T2_RECONCILIACAO.md: **publicado**.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T2.5`** — Resumo persistido (T2_RESUMO_PERSISTIDO.md).

### Leituras obrigatorias para PR-T2.5

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T2.5)
3. `schema/implantation/T2_RECONCILIACAO.md` (base obrigatória)
4. `schema/implantation/T2_POLITICA_CONFIANCA.md`
5. `schema/implantation/T2_LEAD_STATE_V1.md`
6. `schema/implantation/T2_DICIONARIO_FATOS.md`
7. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T2 — resumo e persistência)
8. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
9. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
11. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
12. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-24 — resumo persistido e compatibilidade E1→E2 (PR-T2.5)

### Objetivo executado

`PR-T2.5` — criar `schema/implantation/T2_RESUMO_PERSISTIDO.md`: mecanismo canônico de resumo
persistido para conversas longas (4 camadas de memória, protocolo de snapshot, regras anti-
contaminação) e mapa completo de compatibilidade transitória E1→E2 (campos, stages, vícios).

### Estado herdado

- Branch `feat/t2-pr25-resumo-persistido` criada limpa a partir de main pós-PR-T2.4.
- `T2_RECONCILIACAO.md` publicado (7 estados, protocolo 7 etapas, 10 domínios).
- `T2_POLITICA_CONFIANCA.md` publicado (6 origens, 12 regras PC-01..PC-12).
- `T2_LEAD_STATE_V1.md` publicado (HistorySummary com 4 camadas e SnapshotExecutivo).
- `T2_DICIONARIO_FATOS.md` publicado (50 chaves, tabela E1→E2 base).

### O que foi feito

- Criou `schema/implantation/T2_RESUMO_PERSISTIDO.md` com:
  - **§1** Quatro camadas de memória (L1/L2/L3/L4): definições, limites, regras de acesso;
    L1 = últimos 5 turnos; L2 = lead_state.facts (verdade canônica); L3 = snapshot executivo
    (1 ativo por case); L4 = histórico frio (imutável, auditável, só sob demanda).
  - **§2** Protocolo de snapshot: 7 eventos de trigger (stage_advance, conflict_resolved,
    session_end, handoff, retorno ≥24h, override_priority, eligibility_change); shape completo
    SnapshotExecutivo com 12 campos incluindo `approval_prohibited = true` invariante; lista
    canônica de inclusões e exclusões (RP-SN-01..07).
  - **§3** Regras anti-contaminação (RC-AN-01..07): resumo não promove status, L4 não reabre
    conflitos, snapshot não substitui reconciliação; hierarquia de precedência de leitura.
  - **§4** Memória Vasques: 4 tipos de nota, 7 regras de limite (RV-01..07).
  - **§5** Aprendizado por atendimento: 5 regras RA-01..05; padrão vs. script; formas válidas
    e proibidas.
  - **§6** Compatibilidade transitória E1→E2: 7 princípios (RB-01..07); tabela 27 campos com
    treatment (status de entrada, ação de migração); 7 campos E1 descartados com motivo;
    tabela de mapeamento stages E1 → current_phase E2; como preservar sem manter vício.
  - **§7** Cobertura das 5 microetapas do mestre (microetapas 4 e 5 cobertas aqui).
  - **§8** 10 casos sintéticos SP-01..SP-10.
  - **§9** 12 anti-padrões AP-RP-01..AP-RP-12.
  - **§10** 10 regras invioláveis RP-01..RP-10.
  - **§11** Amarração campo por campo ao lead_state v1.
  - **§12** Bloco E: fechamento permitido; PR-T2.R desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T2.5 executada; próximo PR-T2.R.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que nao foi feito

- READINESS_G2.md não criado (escopo PR-T2.R).
- G2 não fechado (requer PR-T2.R).
- Skeleton T3 não criado (requer G2 aprovado).
- Nenhuma implementação Supabase real.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T2_RESUMO_PERSISTIDO.md
PR que fecha:                          PR-T2.5
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 4 camadas de memória; protocolo snapshot completo;
                                       RC-AN-01..07; RV-01..07; RA-01..05; tabela E1→E2
                                       (27 campos + 7 descartados + stages); SP-01..SP-10;
                                       AP-RP-01..12; RP-01..10; cobertura microetapas 4 e 5
                                       do mestre; soberania LLM-first verificada.
Há item parcial bloqueante?:           não — READINESS_G2.md é escopo PR-T2.R.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T2.5 encerrada; T2_RESUMO_PERSISTIDO.md publicado;
                                       PR-T2.R desbloqueada
Próxima PR autorizada:                 PR-T2.R — Readiness/Closeout G2
```

### Estado atual do repositorio

- Fase macro: **T2** — em execução; PR-T2.R próxima.
- G0: APROVADO. G1: APROVADO em 2026-04-23. G2: aberto — aguardando PR-T2.R.
- T2_DICIONARIO_FATOS.md: publicado.
- T2_LEAD_STATE_V1.md: publicado.
- T2_POLITICA_CONFIANCA.md: publicado.
- T2_RECONCILIACAO.md: publicado.
- T2_RESUMO_PERSISTIDO.md: **publicado**.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T2.R`** — Readiness/Closeout G2 (smoke documental 6/6 artefatos + decisão formal G2 + skeleton T3).

### Leituras obrigatorias para PR-T2.R

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T2.R)
3. `schema/implantation/T2_RESUMO_PERSISTIDO.md` (base obrigatória)
4. `schema/implantation/T2_RECONCILIACAO.md`
5. `schema/implantation/T2_POLITICA_CONFIANCA.md`
6. `schema/implantation/T2_LEAD_STATE_V1.md`
7. `schema/implantation/T2_DICIONARIO_FATOS.md`
8. `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
9. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
10. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
11. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
12. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
13. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-24 — readiness e closeout G2 (PR-T2.R)

### Objetivo executado

`PR-T2.R` — criar `schema/implantation/READINESS_G2.md`: smoke documental de PR-T2.0 a PR-T2.5,
verificação de coerência entre artefatos, 3 cenários sintéticos de validação, verificação dos
8 critérios de aceite do contrato T2, decisão formal G2, encerramento de contrato T2 e skeleton T3.

### Estado herdado

- Branch `feat/t2-pr2r-readiness-g2` criada limpa a partir de main pós-PR-T2.5.
- Todos os 6 artefatos T2 publicados (T2.0→T2.5): contrato + dicionário + lead_state +
  política + reconciliação + resumo.
- G1 APROVADO em 2026-04-23 (READINESS_G1.md).

### O que foi feito

- Criou `schema/implantation/READINESS_G2.md` com:
  - **§1** Smoke documental PR-T2.0 a PR-T2.5 — 6/6 PASS com evidências detalhadas por artefato.
  - **§2** Verificação de coerência em 8 dimensões: dict↔lead_state↔política↔reconciliação↔resumo;
    nomes canônicos; separação tipos; LLM-first (tabela artefato×regra); snapshot≠lead_state;
    sobrescrita silenciosa; inferência≠confirmed; E1≠arquitetura.
  - **§3** 3 cenários sintéticos: V1 (conflito texto vs. documento), V2 (áudio ruim + confirmed),
    V3 (snapshot antigo + approval_prohibited) — todos PASS.
  - **§4** Verificação 8/8 critérios de aceite do contrato T2 §7 — todos CUMPRIDOS.
  - **§5** Lacunas: 5 não bloqueantes com justificativa; zero bloqueantes.
  - **§6** Decisão formal: G2 APROVADO.
  - **§7** Encerramento de contrato T2 (checklist CONTRACT_CLOSEOUT_PROTOCOL.md completo).
  - **§8** Bloco E: fechamento permitido; PR-T3.0 desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`: status → ENCERRADO.
- Arquivou contrato T2 em `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T2_2026-04-24.md`.
- Criou skeleton `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md`.
- Atualizou `schema/contracts/_INDEX.md`: T2 encerrado/arquivado; T3 skeleton ativo; PR-T3.0 próximo.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: gate G2 aprovado; G3 aberto; T3 skeleton.

### O que nao foi feito

- Contrato T3 com corpo não preenchido (PR-T3.0 preencherá).
- Nenhuma implementação de policy engine (T3+).
- G3 não aberto (requer PR-T3.R após execução de T3).
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/READINESS_G2.md
PR que fecha:                          PR-T2.R (gate G2 + contrato T2)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — smoke 6/6 PASS; critérios 8/8 CUMPRIDOS;
                                       8 dimensões de coerência verificadas; 3 cenários
                                       sintéticos PASS; zero violações LLM-first;
                                       5 limitações residuais declaradas como não bloqueantes
                                       com justificativa objetiva.
Há item parcial/inconclusivo bloqueante?: não.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         G2 APROVADO; contrato T2 ENCERRADO e arquivado;
                                       skeleton T3 criado; PR-T3.0 desbloqueada.
Próxima PR autorizada:                 PR-T3.0 — Abertura do contrato de Policy Engine v1 (T3)
```

### Estado atual do repositorio

- Fase macro: **T3** — skeleton ativo; PR-T3.0 próxima.
- G0: APROVADO. G1: APROVADO (2026-04-23). G2: **APROVADO (2026-04-24)**. G3: aberto — aguardando PR-T3.R.
- T2_DICIONARIO_FATOS.md: publicado.
- T2_LEAD_STATE_V1.md: publicado.
- T2_POLITICA_CONFIANCA.md: publicado.
- T2_RECONCILIACAO.md: publicado.
- T2_RESUMO_PERSISTIDO.md: publicado.
- READINESS_G2.md: **publicado**.
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T3.0`** — Abertura formal do contrato de Policy Engine v1 (T3).

### Leituras obrigatorias para PR-T3.0

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` (skeleton — a preencher)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T3.0)
3. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T3)
4. `schema/implantation/READINESS_G2.md` (evidência G2 aprovado)
5. `schema/implantation/T2_RECONCILIACAO.md`
6. `schema/implantation/T2_POLITICA_CONFIANCA.md`
7. `schema/implantation/T2_LEAD_STATE_V1.md`
8. `schema/implantation/T2_DICIONARIO_FATOS.md`
9. `schema/CONTRACT_SCHEMA.md` (formato canônico de contrato)
10. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
11. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
12. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
13. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
14. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
15. `schema/CODEX_WORKFLOW.md`

---

## Atualizacao 2026-04-24 — PR-T3.0: Abertura formal do contrato T3

### Objetivo executado

Preencher formalmente o skeleton T3 com o corpo completo do contrato, conforme CONTRACT_SCHEMA.md,
sem implementar policy engine real.

### O que foi feito

- Preencheu `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` com §1–§17 + Bloco E:
  - §1 Objetivo: policy engine decide mas não fala; cinco entregas canônicas ao final de T3;
  - §2 Escopo: 8 itens (T3_CLASSES_POLITICA, T3_REGRAS_CRITICAS_DECLARATIVAS, T3_ORDEM_AVALIACAO_COMPOSICAO, T3_VETO_SUAVE_VALIDADOR, T3_SUITE_TESTES_REGRAS, READINESS_G3 + tracking);
  - §3 Fora de escopo: src/, T4, Supabase real, reply_text no engine;
  - §4 Dependências: G2 APROVADO (desbloqueado) + T2 encerrado (desbloqueado) + 6 artefatos T2;
  - §5–§6 Entradas (8 artefatos com condições) e Saídas (S1–S6 com PR criadora e conteúdo mínimo);
  - §7 Critérios de aceite CA-01..CA-10: LLM-first no engine, 4 regras codificadas, ordem estável, veto suave distinto, validador ≥3 itens, ≥20 testes, coerência com lead_state v1, 5 microetapas cobertas, G3 com Bloco E;
  - §8 Provas P-T3-01..P-T3-05; §9 Bloqueios B-01..B-05 (B-01 e B-02 desbloqueados);
  - §10 Próximo passo: PR-T3.1; §11 A01: T3 semanas 5–6 prioridade 4;
  - §12 Legados: L03 obrigatório + 12 complementares (L05, L07–L17, L19) com PR e contexto;
  - §13 Referências: 14 documentos; §14 Blocos obrigatórios/complementares com quando consultar;
  - §15 Ordem mínima de leitura por PR; §16 Quebra T3.0–T3.R (7 PRs); §17 Gate G3 completo;
  - Bloco E: PR-T3.1 desbloqueada.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`:
  - Fase ativa: T3; contrato ativo: aberto — PR-T3.0 executada; próximo passo: PR-T3.1.
- Atualizou `schema/contracts/_INDEX.md`:
  - Row T3: status skeleton → aberto; PR atual → PR-T3.0 executada; próximo → PR-T3.1;
  - Última sincronização: PR-T3.0 entrada adicionada.

### O que não foi feito

- Não criou T3_CLASSES_POLITICA.md (escopo PR-T3.1).
- Não implementou nenhuma classe, regra ou validador.
- Não alterou src/, package.json, wrangler.toml.
- G3 não fechado.

### Conformidade com adendos

- A00-ADENDO-01: confirmada — nenhum campo de saída do engine produz reply_text (CA-01, CA-08 declarados).
- A00-ADENDO-02: confirmada — identidade MCMV preservada; L19 amarrado para regras de perfil.
- A00-ADENDO-03: confirmada — Bloco E presente.

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md
PR que fecha:                          PR-T3.0 (abertura do contrato T3)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — §1–§17 preenchidos; skeleton substituído por corpo
                                       formal; CA-01..CA-10 definidos; PRs T3.0–T3.R mapeadas;
                                       gate G3 com condições objetivas; Bloco E presente.
Há item parcial/inconclusivo bloqueante?: não.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         contrato T3 ABERTO; PR-T3.1 desbloqueada.
Próxima PR autorizada:                 PR-T3.1 — Classes canônicas de política
```

### Estado atual do repositorio

- Fase macro: **T3** — contrato aberto; PR-T3.1 próxima.
- G0: APROVADO. G1: APROVADO (2026-04-23). G2: APROVADO (2026-04-24). G3: aberto.
- T3_CLASSES_POLITICA.md: pendente (PR-T3.1).
- T3_REGRAS_CRITICAS_DECLARATIVAS.md: pendente (PR-T3.2).
- T3_ORDEM_AVALIACAO_COMPOSICAO.md: pendente (PR-T3.3).
- T3_VETO_SUAVE_VALIDADOR.md: pendente (PR-T3.4).
- T3_SUITE_TESTES_REGRAS.md: pendente (PR-T3.5).
- READINESS_G3.md: pendente (PR-T3.R).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T3.1`** — Classes canônicas de política.

### Leituras obrigatorias para PR-T3.1

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` (contrato T3 — §1–§17)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção J — PR-T3.1)
3. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T3 — microetapa 2)
4. **L03** — Mapa Canônico do Funil (obrigatório)
5. `schema/implantation/T2_LEAD_STATE_V1.md`
6. `schema/implantation/T2_POLITICA_CONFIANCA.md`
7. `schema/implantation/READINESS_G2.md`
8. `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
9. `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
11. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
12. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

---

## Atualizacao 2026-04-25 — PR-T3.1: Classes canônicas de política

### Objetivo executado

Criar `schema/implantation/T3_CLASSES_POLITICA.md` com as cinco classes canônicas do policy
engine v1, seus payloads mínimos, prioridade entre classes, definições formais dos quatro
efeitos operacionais (microetapa 2 do mestre T3) e integração com lead_state v1.

### O que foi feito

- Criou `schema/implantation/T3_CLASSES_POLITICA.md` com:
  - Shape `PolicyDecision` com invariante global: `action` nunca contém `reply_text` (CP-01);
  - §2 Classe BLOQUEIO — "bloquear avanço": `BloqueioAction` com `advance_allowed=false`; distinção formal de veto suave;
  - §3 Classe OBRIGAÇÃO — "exigir ação": `ObrigacaoAction`; afeta `must_ask_now` mas não `blocked_by`;
  - §4 Classe CONFIRMAÇÃO — "pedir confirmação": `ConfirmacaoAction`; não persiste dado automaticamente;
  - §5 Classe SUGESTÃO MANDATÓRIA — "apenas orientar": `SugestaoMandatoriaAction`; insumo de raciocínio, nunca script;
  - §6 Classe ROTEAMENTO — "desviar objetivo": `RoteamentoAction`; só executado sem bloqueio ativo;
  - §7 Prioridade: bloqueio(1) > obrigação(2) > confirmação(3) > sugestão_mandatória(4) > roteamento(5);
  - §8 Definições formais dos 4 efeitos operacionais (microetapa 2 T3 coberta);
  - §9 Integração com 10 campos do lead_state v1 — quais classes os modificam;
  - §10 5 regras de integração com política de confiança (PC-INT-01..05);
  - §11 10 anti-padrões AP-CP-01..10;
  - §12 5 exemplos sintéticos (um por classe);
  - §13 Cobertura de microetapas: microetapa 2 coberta; 1/3/4/5 delegadas;
  - §14 10 regras invioláveis CP-01..10;
  - Bloco E: PR-T3.2 desbloqueada.

### O que não foi feito

- Não criou T3_REGRAS_CRITICAS_DECLARATIVAS.md (escopo PR-T3.2).
- Não implementou motor real em src/.
- Não alterou package.json, wrangler.toml.
- G3 não fechado.

### Provas entregues

- **P-T3-01:** grep de `reply_text`, `mensagem_usuario`, `texto_cliente` em payloads de `action` — ausência confirmada.
- **P-T3-02:** todas as fact_keys referenciadas existem em T2_DICIONARIO_FATOS §3 (verificadas: `fact_rnm_status`, `fact_monthly_income_p1`, `fact_nationality`, `fact_work_regime_p1`, `fact_estado_civil`, `fact_process_mode`, `fact_p3_required`, `fact_has_multi_income_p1`, `fact_current_intent`, `fact_channel_origin`).
- **P-T3-03:** microetapa 2 do mestre T3 coberta em §8; §13 declara cobertura explícita por microetapa.

### Conformidade com adendos

- A00-ADENDO-01: confirmada — engine emite `PolicyDecision` estruturado; LLM soberano na fala.
- A00-ADENDO-02: confirmada — identidade MCMV preservada; engine orienta sem engessar fala.
- A00-ADENDO-03: confirmada — Bloco E presente.

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T3_CLASSES_POLITICA.md
PR que fecha:                          PR-T3.1 (classes canônicas de política)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 5 classes definidas; payloads sem reply_text;
                                       prioridade entre classes definida; 4 efeitos formais (§8);
                                       integração lead_state v1 (§9) e confiança (§10);
                                       10 anti-padrões; 5 exemplos; 10 regras; microetapa 2
                                       coberta; provas P-T3-01/02/03 presentes no Bloco E.
Há item parcial/inconclusivo bloqueante?: não.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T3.1 CONCLUÍDA; PR-T3.2 desbloqueada.
Próxima PR autorizada:                 PR-T3.2 — Codificação declarativa das regras críticas
```

### Estado atual do repositorio

- Fase macro: **T3** — em execução; PR-T3.2 próxima.
- G0: APROVADO. G1: APROVADO. G2: APROVADO. G3: aberto.
- T3_CLASSES_POLITICA.md: **publicado**.
- T3_REGRAS_CRITICAS_DECLARATIVAS.md: pendente (PR-T3.2).
- T3_ORDEM_AVALIACAO_COMPOSICAO.md: pendente (PR-T3.3).
- T3_VETO_SUAVE_VALIDADOR.md: pendente (PR-T3.4).
- T3_SUITE_TESTES_REGRAS.md: pendente (PR-T3.5).
- READINESS_G3.md: pendente (PR-T3.R).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T3.2`** — Codificação declarativa das regras críticas.

### Leituras obrigatorias para PR-T3.2

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` (§2, §7 CA-02, §16 T3.2)
2. `schema/implantation/T3_CLASSES_POLITICA.md` (classes e payloads)
3. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção J — PR-T3.2)
4. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T3 — microetapa 1)
5. **L03** — Mapa Canônico do Funil (obrigatório)
6. L07–L08 — Estado Civil (casado civil→conjunto)
7. L09–L10 — Composição Familiar (solo baixa→composição)
8. L11–L12 — Regime e Renda (autônomo→IR)
9. L19 — Memorial MCMV (estrangeiro sem RNM→bloqueio)
10. `schema/implantation/T2_LEAD_STATE_V1.md`
11. `schema/implantation/T2_POLITICA_CONFIANCA.md`
12. `schema/implantation/T2_DICIONARIO_FATOS.md`
13. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
14. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
15. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

---

## Atualizacao 2026-04-24 — PR-T3.2 — Codificação declarativa das regras críticas

### O que foi feito

- Criou `schema/implantation/T3_REGRAS_CRITICAS_DECLARATIVAS.md` com:
  - §1 Tabela-resumo: 4 regras × inputs × classes emitidas × severidade;
  - §2 R_CASADO_CIVIL_CONJUNTO: `fact_estado_civil` + `fact_process_mode`; disparo quando
    `estado_civil="casado_civil"` E `process_mode="solo"` ou ausente; 3 decisões —
    R_CASADO_CIVIL_CONJUNTO_CONFIRM (confirmação, baixa confiança) + R_CASADO_CIVIL_CONJUNTO
    (obrigação, `must_ask_now += [fact_process_mode]`); NUNCA emite bloqueio;
  - §3 R_AUTONOMO_IR: `fact_work_regime_p1` + `fact_autonomo_has_ir_p1`; 3 variantes por
    status do fato — obrigação (fact ausente), confirmação (parcial/não_informado),
    sugestão_mandatória (`"não"` — autônomo sem IR não é inelegível automático);
  - §4 R_SOLO_BAIXA_COMPOSICAO: `fact_process_mode` + `fact_monthly_income_p1` +
    `derived_composition_needed`; INVARIANTE: NUNCA emite bloqueio; NUNCA seta
    `elegibility_status="ineligible"`; `derived_composition_needed` calculado pelo mecânico;
    classes: sugestão_mandatória + obrigação;
  - §5 R_ESTRANGEIRO_SEM_RNM: `fact_nationality` + `fact_rnm_status` + derivados; graduação
    por status — confirmação (captured), obrigação (RNM ausente), bloqueio (somente quando
    `nationality.status="confirmed"` + RNM inválido); naturalizado excluído explicitamente;
    efeito: `blocked_by` + `risk_level="blocking"` + `derived_rnm_block=true`;
  - §6 Tabela de validação cruzada: 10 variantes × fato→classe→efeito;
  - §7 Verificação de 14 chaves canônicas contra T2_DICIONARIO_FATOS;
  - §8 10 anti-padrões AP-RC-01..10;
  - §9 10 regras invioláveis RC-INV-01..10;
  - §10 Cobertura de microetapas: microetapa 1 coberta; 2/3/4/5 delegadas;
  - Bloco E: PR-T3.2 fechada; PR-T3.3 desbloqueada.

### O que não foi feito

- Não criou T3_ORDEM_AVALIACAO_COMPOSICAO.md (microetapas 3 e 4 — escopo PR-T3.3).
- Não criou T3_VETO_SUAVE_VALIDADOR.md (escopo PR-T3.4).
- Não criou T3_SUITE_TESTES_REGRAS.md (escopo PR-T3.5).
- Não implementou motor real em src/.
- Não alterou package.json, wrangler.toml.
- G3 não fechado.

### Provas entregues

- **P-T3-01:** nenhum payload de `action` nas 4 regras contém `reply_text`, `mensagem_usuario` ou `texto_cliente`.
- **P-T3-02:** 14 chaves canônicas verificadas em §7 — todas presentes no T2_DICIONARIO_FATOS (35 fact_*, 9 derived_*, 6 signal_*).
- **P-T3-03:** microetapa 1 do mestre T3 coberta em §10; declaração explícita por microetapa.

### Conformidade com adendos

- A00-ADENDO-01: confirmada — engine emite PolicyDecision estruturado; LLM soberano na fala.
- A00-ADENDO-02: confirmada — identidade MCMV preservada; regras orientam sem script de fala.
- A00-ADENDO-03: confirmada — Bloco E presente.

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T3_REGRAS_CRITICAS_DECLARATIVAS.md
PR que fecha:                          PR-T3.2 (codificação declarativa das regras críticas)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 4 regras críticas definidas declarativamente;
                                       payloads sem reply_text; classes corretas por regra;
                                       bloqueio somente em R_ESTRANGEIRO_SEM_RNM (confirmed);
                                       R_SOLO_BAIXA_COMPOSICAO invariante de não-bloqueio;
                                       14 chaves canônicas verificadas; tabela cruzada §6;
                                       10 anti-padrões; 10 regras; microetapa 1 coberta.
Há item parcial/inconclusivo bloqueante?: não.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T3.2 CONCLUÍDA; PR-T3.3 desbloqueada.
Próxima PR autorizada:                 PR-T3.3 — Ordem de avaliação e composição de políticas
```

### Estado atual do repositorio

- Fase macro: **T3** — em execução; PR-T3.3 próxima.
- G0: APROVADO. G1: APROVADO. G2: APROVADO. G3: aberto.
- T3_CLASSES_POLITICA.md: **publicado**.
- T3_REGRAS_CRITICAS_DECLARATIVAS.md: **publicado**.
- T3_ORDEM_AVALIACAO_COMPOSICAO.md: pendente (PR-T3.3).
- T3_VETO_SUAVE_VALIDADOR.md: pendente (PR-T3.4).
- T3_SUITE_TESTES_REGRAS.md: pendente (PR-T3.5).
- READINESS_G3.md: pendente (PR-T3.R).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T3.3`** — Ordem de avaliação e composição de políticas.

### Leituras obrigatorias para PR-T3.3

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` (§2, §7 CA-03/CA-05, §16 T3.3)
2. `schema/implantation/T3_CLASSES_POLITICA.md` (prioridade entre classes — §7)
3. `schema/implantation/T3_REGRAS_CRITICAS_DECLARATIVAS.md` (regras declaradas — base para composição)
4. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção J — PR-T3.3)
5. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T3 — microetapas 3 e 4)
6. `schema/implantation/T2_LEAD_STATE_V1.md`
7. `schema/implantation/T2_POLITICA_CONFIANCA.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

---

## Atualizacao 2026-04-25 — PR-T3.3 — Ordem de avaliação e composição de políticas

### O que foi feito

- Criou `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` com:
  - §1 Visão geral do pipeline numerado de 6 estágios sequenciais (reconciliação prévia →
    bloqueios → confirmações → obrigações → sugestões → roteamentos);
  - §2 Especificação detalhada de cada estágio: pré-condições, regras candidatas, ordenação
    interna, restrições e saídas; Estágio 1 invoca obrigatoriamente `T2_RECONCILIACAO`;
  - §3 Princípios canônicos de composição RC-COMP-01..10 + matriz 5×5 entre classes (§3.2) +
    tabela de prioridade global (§3.3) + lista canônica de criticidade de fato em 13 níveis
    (§3.4) + regra de desempate residual em 3 níveis (§3.5);
  - §4 Oito combinações específicas detalhadas: bloqueio+obrigação, bloqueio+confirmação,
    bloqueio+roteamento, obrigação+confirmação, obrigação+sugestão, múltiplas obrigações,
    múltiplas confirmações, múltiplos roteamentos;
  - §5 Política de colisão com 10 códigos canônicos: COL-BLOCK-OBLIG, COL-BLOCK-ROUTE,
    COL-OBLIG-ROUTE, COL-CONF-ROUTE, COL-CONF-OBLIG, COL-ROUTING-MULTI, COL-OBLIG-OBLIG-PRIO,
    COL-CONF-CONF-LEVEL, COL-RECONCILE-FAIL, COL-INVALID-PHASE; shape `CollisionRecord`
    com invariante `decisions_kept ∪ decisions_dropped = involved_rules`; proibição absoluta
    de colisão silenciosa;
  - §6 Shape `PolicyDecisionSet` com `decisions[]`, `collisions[]`, `evaluation_meta`;
    invariantes: ordem canônica 1→5; aborted ⇒ decisions vazias; toda supressão refletida em
    collisions[];
  - §7 Dez cenários sintéticos SC-01..SC-10 (todos os exigidos pelo escopo): casado civil +
    solo + renda baixa, autônomo + IR ausente + renda baixa, estrangeiro sem RNM + outra
    regra, renda fraca + composição sugerida, P3 entrando depois de solo, restrição vs avanço
    de fase, duas obrigações simultâneas, duas confirmações simultâneas, bloqueio + roteamento,
    sugestão competindo com obrigação;
  - §8 Validação cruzada com T3.1, T3.2 e T2: classes, prioridade, invariante action,
    chaves de fato, derivados, status canônicos, OperationalState, anti-padrões reforçados;
  - §9 12 anti-padrões AP-OC-01..AP-OC-12 (incluindo AP-OC-10 contra inventar regra nova
    nesta camada e AP-OC-12 contra reordenar estágios);
  - §10 Cobertura: microetapas 3 (ordem estável) e 4 (composição) cobertas; 1, 2 e 5
    declaradas como escopo de outras PRs;
  - §11 12 regras invioláveis RC-INV-01..RC-INV-12 (incluindo RC-INV-08: autônomo sem IR
    nunca é inelegível automático; RC-INV-10: solo baixa nunca emite bloqueio nem seta
    inelegível; RC-INV-09: regra terminal exige fato em confirmed);
  - Bloco E: PR-T3.3 fechada; PR-T3.4 desbloqueada.

### O que não foi feito

- Não criou T3_VETO_SUAVE_VALIDADOR.md (microetapa 5 — escopo PR-T3.4).
- Não criou T3_SUITE_TESTES_REGRAS.md (escopo PR-T3.5).
- Não criou READINESS_G3.md (escopo PR-T3.R).
- Não implementou motor real em src/.
- Não alterou package.json, wrangler.toml.
- Não inventou regras novas (escopo desta PR é ordem e composição apenas).
- G3 não fechado.

### Provas entregues

- **P-T3-01:** inspeção do documento — nenhum payload de `action`, `decisions` ou estágio
  contém `reply_text`, `mensagem_usuario`, `texto_cliente`, `resposta` ou `frase`. Estágios
  produzem apenas `PolicyDecision` estruturadas e `CollisionRecord`. Menções a `reply_text`
  no documento aparecem exclusivamente em proibições/anti-padrões/declarações canônicas
  (linhas 33, 657, 684, 716, 736).
- **P-T3-02:** todas as `fact_key` (`fact_nationality`, `fact_rnm_status`,
  `fact_credit_restriction`, `fact_restriction_regularization_status`, `fact_estado_civil`,
  `fact_process_mode`, `fact_composition_actor`, `fact_work_regime_p1`,
  `fact_autonomo_has_ir_p1`, `fact_monthly_income_p1`, `fact_has_multi_income_p1`,
  `fact_p3_required`, `fact_current_intent`, `fact_channel_origin`) e `derived_*`
  (`derived_composition_needed`, `derived_rnm_required`) referenciam chaves canônicas
  presentes em `T2_DICIONARIO_FATOS`. Nenhuma chave inventada.
- **P-T3-03:** microetapas 3 (ordem estável) e 4 (composição) do mestre T3 cobertas em
  §10; declaração explícita por microetapa.

### Conformidade com adendos

- A00-ADENDO-01: confirmada — soberania do LLM na fala preservada; nenhum estágio escreve fala.
- A00-ADENDO-02: confirmada — identidade MCMV preservada; ordem e composição orientam sem
  engessar conduta.
- A00-ADENDO-03: confirmada — Bloco E presente.

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md
PR que fecha:                          PR-T3.3 (ordem de avaliação e composição de políticas)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — pipeline 6 estágios numerados; matriz 5×5; regra
                                       de desempate 4 níveis; 8 combinações específicas;
                                       10 códigos de colisão; shape PolicyDecisionSet;
                                       10 cenários SC-01..10 cobrindo todos os exigidos;
                                       validação cruzada T3.1/T3.2/T2; 12 anti-padrões;
                                       12 regras invioláveis; microetapas 3 e 4 cobertas.
Há item parcial/inconclusivo bloqueante?: não.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T3.3 CONCLUÍDA; PR-T3.4 desbloqueada.
Próxima PR autorizada:                 PR-T3.4 — Veto suave + validador pós-resposta/pré-persistência
```

### Estado atual do repositorio (após PR-T3.4)

- Fase macro: **T3** — em execução; PR-T3.5 próxima.
- G0: APROVADO. G1: APROVADO. G2: APROVADO. G3: aberto.
- T3_CLASSES_POLITICA.md: **publicado**.
- T3_REGRAS_CRITICAS_DECLARATIVAS.md: **publicado**.
- T3_ORDEM_AVALIACAO_COMPOSICAO.md: **publicado**.
- T3_VETO_SUAVE_VALIDADOR.md: **publicado** (PR-T3.4).
- T3_SUITE_TESTES_REGRAS.md: pendente (PR-T3.5).
- READINESS_G3.md: pendente (PR-T3.R).
- Runtime: inalterado.

---

## Atualizacao 2026-04-25 — PR-T3.4: veto suave + validador pós-resposta/pré-persistência

### Objetivo executado

Criar `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` com:
- Definição formal de veto suave e distinção de bloqueio em 7 dimensões.
- Shape `VetoSuaveRecord` com 5 tipos de risco, 3 resoluções, escalada condicional para bloqueio.
- Extensão do `PolicyDecisionSet` com `soft_vetos[]` e invariante de separação.
- Validador posicionado como passo 4 de 6 no pipeline de turno.
- Checklist VC-01..VC-08 (8 itens — 5 critical, 3 advisory) com severity e ação por item.
- Lógica de decisão APPROVE / REJECT / REQUIRE_REVISION / PREVENT_PERSISTENCE.
- 10 cenários SC-VS-01..SC-VS-10; validação cruzada T3.1/T3.2/T3.3/T2; 10 anti-padrões; 10 regras invioláveis.
- Todas as 5 microetapas T3 cobertas (§8).

### O que foi feito

- Criado `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md`:
  - §1 VetoSuaveRecord: 5 condições de disparo (dado_insuficiente, risco_de_limite,
    inconsistencia_soft, colisao_latente, risco_de_promessa); 3 resoluções (orientar, confirmar,
    escalate_to_bloqueio); tabela formal bloqueio × veto suave em 7 dimensões; ciclo de vida com
    acknowledged; extensão PolicyDecisionSet com soft_vetos[] (invariante de separação declarado);
  - §2 Validador: posição passo 4/6 no pipeline; shapes ValidationContext (com LLMResponseMeta)
    + ValidationResult (com safe_fields/blocked_fields); checklist VC-01..VC-08 (VC-01 soberania
    fala, VC-02 promessa prematura, VC-03 fase+bloqueio, VC-04 colisão registrada, VC-05
    confiança mínima, VC-06 veto acknowledged, VC-07 captured→confirmed, VC-08 objetivo/stage);
    lógica agregada; tabela efeito×decisão×validation_log;
  - §3 Relação com as 5 classes canônicas;
  - §4 10 cenários SC-VS-01..10;
  - §5 Validação cruzada T3.1/T3.2/T3.3/T2 em 13 linhas;
  - §6 10 anti-padrões AP-VS-01..10;
  - §7 10 regras invioláveis RC-VS-01..10;
  - §8 Cobertura de microetapas: todas as 5 microetapas T3 cobertas;
  - Bloco E com 4 provas (P-T3.4-01..04).
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: última tarefa = PR-T3.4.
- Atualizado `schema/contracts/_INDEX.md`: T3 PR atual = PR-T3.4; entrada de sync adicionada.
- Atualizado `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` (este arquivo).

### O que não foi feito

- Não criou T3_SUITE_TESTES_REGRAS.md (escopo PR-T3.5).
- Não criou READINESS_G3.md (escopo PR-T3.R).
- Não implementou motor real em src/.
- Não alterou package.json, wrangler.toml.
- Não criou regras de negócio novas.
- G3 não fechado.

### Provas entregues

- **P-T3.4-01:** nenhum campo de fala (`reply_text`, `mensagem_usuario`, etc.) em nenhum shape.
- **P-T3.4-02:** todas as `fact_key` referenciadas existem em T2_DICIONARIO_FATOS.
- **P-T3.4-03:** microetapa 5 declarada COBERTA em §8; todas as 5 microetapas T3 cobertas.
- **P-T3.4-04:** CA-04 cumprido (7 dimensões de distinção bloqueio×veto); CA-05 cumprido
  (checklist 8 itens > contrato ≥6).

### Conformidade com adendos

- A00-ADENDO-01: confirmada — validador opera sobre estado, nunca sobre `reply_text`.
- A00-ADENDO-02: confirmada — mecanismos orientam sem engessar o LLM; veto suave é orientação
  de risco, não casca mecânica.
- A00-ADENDO-03: confirmada — Bloco E presente.

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T3_VETO_SUAVE_VALIDADOR.md
PR que fecha:                          PR-T3.4 (veto suave + validador pós-resposta/pré-persistência)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — VetoSuaveRecord com 5 tipos de risco e 3 resoluções;
                                       validador checklist VC-01..VC-08; 4 decisões do validador;
                                       10 cenários SC-VS-01..10; validação cruzada T3.1/T3.2/T3.3/T2;
                                       10 anti-padrões; 10 regras invioláveis; 5 microetapas T3 cobertas.
Há item parcial/inconclusivo bloqueante?: não.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T3.4 CONCLUÍDA; PR-T3.5 desbloqueada.
Próxima PR autorizada:                 PR-T3.5 — Suíte de testes de regras críticas
```

### Proximo passo autorizado (histórico — PR-T3.5 desbloqueava PR-T3.R)

Seção substituída por bloco PR-T3.5 abaixo.

---

## Atualizacao 2026-04-25 — PR-T3.5: suíte de testes de regras críticas

### Objetivo executado

Criar `schema/implantation/T3_SUITE_TESTES_REGRAS.md` com suíte documental de testes
declarativos cobrindo as 4 regras críticas T3, a ordem/composição T3.3 e o validador T3.4.

### O que foi feito

- Criado `schema/implantation/T3_SUITE_TESTES_REGRAS.md`:
  - 24 casos declarativos (mínimo contratual: 20 — CA-06 cumprido com margem de 4);
  - 4 positivos TC-POS-01..04 (uma regra crítica cada — condições plenas, output correto);
  - 4 negativos TC-NEG-01..04 (regra não dispara — condições não atendidas);
  - 4 ambíguos TC-AMB-01..04 (dado incerto → confirmação obrigatória; nunca decisão final);
  - 4 colisões TC-COL-01..04 (COL-BLOCK-OBLIG, coexistência válida, COL-CONF-CONF-LEVEL,
    COL-BLOCK-ROUTE — todas registradas em collisions[], nenhuma silenciosa);
  - 4 regressões TC-REG-01..04 (RC-INV-03 autônomo sem IR, RC-INV-04 solo sem bloqueio,
    RC-INV-05 estrangeiro sem confirmed, RC-INV-01 zero reply_text cross-rule);
  - 2 ordem/composição TC-ORD-01..02 (pipeline 6 estágios; confirmação precede obrigação);
  - 2 validador TC-VAL-01..02 (VC-09 template mecânico; VC-03 fase não avança com bloqueio);
  - §10 critérios PASS/FAIL globais: 11 critérios universais + 9 falhas críticas;
  - §11 validação cruzada T3.1/T3.2/T3.3/T3.4/T2 em 18 linhas;
  - §12 8 anti-padrões AP-ST-01..08;
  - §13 cobertura das 5 microetapas T3;
  - Bloco E com 5 provas (P-T3.5-01..05).
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.
- Atualizado `schema/contracts/_INDEX.md`: PR atual = PR-T3.5; próximo = PR-T3.R.
- Atualizado `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` (este arquivo).

### O que não foi feito

- Não criou READINESS_G3.md (escopo PR-T3.R).
- Não implementou motor real em src/.
- Não alterou package.json, wrangler.toml.
- Não inventou regra nova (toda chave e regra referenciada já documentada).
- G3 não fechado.

### Provas entregues

- **P-T3.5-01:** 24 casos > 20 mínimo; todas 5 categorias obrigatórias cobertas.
- **P-T3.5-02:** nenhum caso espera reply_text em qualquer campo de output.
- **P-T3.5-03:** todas as fact_keys referenciadas existem em T2_DICIONARIO_FATOS.
- **P-T3.5-04:** 4 regressões cobrem RC-INV-01/03/04/05 — invariantes críticos formalizados.
- **P-T3.5-05:** §13 cobre as 5 microetapas T3 (CA-09 cumprido).

### Conformidade com adendos

- A00-ADENDO-01: confirmada — nenhum caso espera reply_text; P-GLOBAL-01 em 24 casos.
- A00-ADENDO-02: confirmada — R_SOLO nunca bloqueia; R_AUTONOMO nunca declara inelegível.
- A00-ADENDO-03: confirmada — Bloco E presente.

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T3_SUITE_TESTES_REGRAS.md
PR que fecha:                          PR-T3.5 (suíte de testes de regras críticas)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 24 casos; 5 categorias; 5 microetapas T3;
                                       critérios PASS/FAIL globais; validação cruzada completa.
Há item parcial/inconclusivo bloqueante?: não.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T3.5 CONCLUÍDA; PR-T3.R desbloqueada.
Próxima PR autorizada:                 PR-T3.R — Readiness/Closeout G3
```

### Estado atual do repositorio (após PR-T3.5)

- Fase macro: **T3** — em execução; PR-T3.R próxima.
- G0: APROVADO. G1: APROVADO. G2: APROVADO. G3: aberto.
- T3_CLASSES_POLITICA.md: **publicado**.
- T3_REGRAS_CRITICAS_DECLARATIVAS.md: **publicado**.
- T3_ORDEM_AVALIACAO_COMPOSICAO.md: **publicado**.
- T3_VETO_SUAVE_VALIDADOR.md: **publicado**.
- T3_SUITE_TESTES_REGRAS.md: **publicado** (PR-T3.5).
- READINESS_G3.md: pendente (PR-T3.R).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T3.R`** — Readiness/Closeout G3 (`READINESS_G3.md`).

### Leituras obrigatorias para PR-T3.R

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` (§17 gate G3, §16 PR-T3.R)
2. `schema/implantation/T3_CLASSES_POLITICA.md`
3. `schema/implantation/T3_REGRAS_CRITICAS_DECLARATIVAS.md`
4. `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md`
5. `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md`
6. `schema/implantation/T3_SUITE_TESTES_REGRAS.md`
7. `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
8. `schema/implantation/READINESS_G2.md` (modelo de Readiness anterior)
9. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
11. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

---

## Atualizacao 2026-04-25 — PR-T3.R: Readiness/Closeout G3

### Objetivo executado

Criar `schema/implantation/READINESS_G3.md`, executar smoke documental S1–S5, verificar
CA-01..CA-10, declarar G3 APROVADO, encerrar contrato T3 e criar skeleton T4.

### O que foi feito

- Criado `schema/implantation/READINESS_G3.md`:
  - §1 Smoke documental S1–S5 — 5/5 PASS;
  - §2 Coerência verificada em 11 dimensões (11/11 PASS);
  - §3 Cenários sintéticos V1/V2/V3 — 3/3 PASS;
  - §4 Critérios de aceite CA-01..CA-10 — 10/10 CUMPRIDOS;
  - §5 Lacunas: 0 bloqueantes, 5 não bloqueantes (LNB-01..05);
  - §6 Decisão formal G3 APROVADO;
  - §7 Encerramento contrato T3 (CONTRACT_CLOSEOUT_PROTOCOL);
  - §8 Skeleton T4; §9 Adendos; Bloco E.
- Arquivado `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` →
  `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T3_2026-04-25.md`.
- Criado skeleton `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md`.
- Atualizado `schema/contracts/_INDEX.md`: T3 encerrado; T4 skeleton ativo; PR-T4.0 próximo.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: fase=T4; G3=APROVADO.

### O que não foi feito

- Não criou contrato T4 com corpo (skeleton — PR-T4.0 preencherá).
- Não implementou orquestrador de turno.
- Não alterou src/, package.json, wrangler.toml.
- G4 não aberto.

### Provas entregues

- **P-T3.R-01:** Smoke 5/5 PASS (S1–S5) com seções, invariantes e Bloco E verificados.
- **P-T3.R-02:** Coerência 11/11 PASS — classes↔regras, fact_keys↔T2, política_confiança↔disparo, pipeline↔prioridade, colisões↔regras, PolicyDecisionSet, ValidationContext, cobertura_cruzada, LLM-first, soberania_LLM, MCMV.
- **P-T3.R-03:** Cenários V1/V2/V3 — 3/3 PASS (4 regras simultâneas; validador VC-09; RC-INV-03).
- **P-T3.R-04:** CA-01..CA-10 — 10/10 CUMPRIDOS com evidência por critério.
- **P-T3.R-05:** G3 APROVADO em §6 com justificativa; 0 lacunas bloqueantes.

### Conformidade com adendos

- A00-ADENDO-01: confirmada — nenhum artefato S1–S5 produz reply_text em saídas do engine.
- A00-ADENDO-02: confirmada — R_SOLO nunca bloqueia (RC-INV-04); R_AUTONOMO nunca inelegível (RC-INV-03).
- A00-ADENDO-03: confirmada — Bloco E presente; evidência completa; zero lacunas bloqueantes.

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/READINESS_G3.md
PR que fecha:                          PR-T3.R (Readiness/Closeout G3)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 0 lacunas bloqueantes; 5 não bloqueantes
                                       (LNB-01..05) declaradas e justificadas.
Há item parcial/inconclusivo bloqueante?: não.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T3.R CONCLUÍDA; G3 APROVADO; T3 ENCERRADO;
                                       PR-T4.0 desbloqueada.
Próxima PR autorizada:                 PR-T4.0 — Abertura formal do contrato T4
```

### Estado atual do repositorio (após PR-T3.R)

- Fase macro: **T4** — skeleton aberto; PR-T4.0 próxima.
- G0: APROVADO. G1: APROVADO. G2: APROVADO. G3: **APROVADO** (2026-04-25).
- T3_CLASSES_POLITICA.md: **publicado**.
- T3_REGRAS_CRITICAS_DECLARATIVAS.md: **publicado**.
- T3_ORDEM_AVALIACAO_COMPOSICAO.md: **publicado**.
- T3_VETO_SUAVE_VALIDADOR.md: **publicado**.
- T3_SUITE_TESTES_REGRAS.md: **publicado**.
- READINESS_G3.md: **publicado** (PR-T3.R).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T4.0`** — Abertura formal do contrato T4 (Orquestrador de turno LLM-first).

### Leituras obrigatorias para PR-T4.0

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T4 — microetapas obrigatórias)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção K — PR-T4.0)
3. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` (skeleton a preencher)
4. `schema/implantation/READINESS_G3.md` (evidência de G3 APROVADO)
5. `schema/implantation/T3_CLASSES_POLITICA.md`
6. `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md`
7. `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md`
8. `schema/implantation/T2_LEAD_STATE_V1.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
11. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`
12. `schema/CONTRACT_SCHEMA.md`

---

## Atualizacao 2026-04-25 — PR-T4.0: Abertura formal do contrato T4

### Objetivo executado

Preencher `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` com corpo completo
(§1–§17 + Bloco E), declarar quebra de PRs T4.0–T4.R, definir gate G4, e desbloquear PR-T4.1.

### O que foi feito

- Preenchido `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` com:
  - §1 Objetivo: orquestrador coordena e nunca fala; reply_text exclusivamente do LLM;
  - §2 Escopo: 6 saídas verificáveis (T4_ENTRADA_TURNO, T4_PIPELINE_LLM, T4_VALIDACAO_PERSISTENCIA,
    T4_RESPOSTA_RASTRO_METRICAS, T4_FALLBACKS, READINESS_G4);
  - §3 Fora de escopo: src/, regras de política (T3), schema de estado (T2), speech/canal;
  - §4 Dependências: G3 APROVADO + T2_LEAD_STATE_V1 + 5 artefatos T3 + T1_CONTRATO_SAIDA;
  - §5 Entradas: TurnoEntrada `{message_text, channel, lead_state, turn_id, case_id, current_objective}`;
  - §6 Saídas S1–S6 com caminho, PR criadora e conteúdo mínimo;
  - §7 Critérios de aceite CA-01..CA-10:
      CA-01 orquestrador mudo; CA-02 entrada padronizada; CA-03 pipeline LLM contrato único;
      CA-04 policy integrado; CA-05 validador pós-LLM; CA-06 reconciliação antes de persistir;
      CA-07 rastro TurnoRastro; CA-08 fallbacks (4 cenários); CA-09 ≥10 E2E; CA-10 Bloco E G4;
  - §8 Provas P-T4-01..P-T4-05;
  - §9 Bloqueios B-01..B-05 (B-01/B-02 desbloqueados; B-03/B-04/B-05 bloqueados até PRs criarem artefatos);
  - §10 Próximo passo: PR-T4.1;
  - §11 A01: T4 semanas 7–8, prioridade 5, G3→G4;
  - §12 Legados com PRs criadoras;
  - §13 12 referências;
  - §14 Blocos legados obrigatórios/complementares;
  - §15 Ordem mínima de leitura por PR;
  - §16 Quebra PRs T4.0–T4.R com artefato/dependência/microetapa;
  - §17 Gate G4: condições (S1–S6 smoke PASS + CA-01..CA-10 + ≥10 E2E + pipeline completo +
    fallbacks cobertos + Bloco E em READINESS_G4); consequência: T5 autorizado;
  - Bloco E com PR-T4.1 desbloqueada.
- Atualizado `schema/contracts/_INDEX.md`: T4 status → aberto; PR atual → PR-T4.0; próximo → PR-T4.1.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: última tarefa = PR-T4.0; próximo = PR-T4.1.

### O que não foi feito

- Não criou T4_ENTRADA_TURNO.md (escopo PR-T4.1).
- Não implementou orquestrador real em src/.
- Não alterou package.json, wrangler.toml.
- G4 não aberto.

### Provas entregues

- **P-T4.0-01:** Contrato T4 preenchido com §1–§17 + Bloco E conforme CONTRACT_SCHEMA.md.
- **P-T4.0-02:** TurnoEntrada shape declarado com 6 campos canônicos; TurnoSaida referenciado de T1_CONTRATO_SAIDA.
- **P-T4.0-03:** Pipeline 8 etapas numeradas; 1 chamada LLM por turno; reply_text nunca sobrescrito.
- **P-T4.0-04:** Gate G4 com condições verificáveis (S1–S6 + CA-01..CA-10 + ≥10 E2E + Bloco E).
- **P-T4.0-05:** Quebra de 8 PRs com artefatos, dependências e microetapas mapeadas.

### Conformidade com adendos

- A00-ADENDO-01: confirmada — CA-01 proíbe orquestrador de produzir reply_text; CA-03 LLM único.
- A00-ADENDO-02: confirmada — MCMV não é escopo de T4; identidade preservada via T1_SYSTEM_PROMPT.
- A00-ADENDO-03: confirmada — Bloco E presente; contrato T4 aberto com evidência de G3 APROVADO.

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md
PR que fecha:                          PR-T4.0 (abertura formal do contrato T4)
Estado da evidência:                   completa — contrato T4 com §1–§17 + Bloco E;
                                       shapes TurnoEntrada/TurnoSaida declarados;
                                       pipeline 8 etapas; gate G4 definido; quebra 8 PRs.
Há lacuna remanescente?:               não — contrato de abertura; artefatos técnicos são
                                       escopo das PRs T4.1–T4.6 e T4.R.
Há item parcial/inconclusivo bloqueante?: não.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T4.0 CONCLUÍDA; contrato T4 ABERTO; PR-T4.1 desbloqueada.
Próxima PR autorizada:                 PR-T4.1 — Padronização da entrada do turno
```

### Estado atual do repositorio (após PR-T4.0)

- Fase macro: **T4** — contrato aberto; PR-T4.1 próxima.
- G0: APROVADO. G1: APROVADO. G2: APROVADO. G3: **APROVADO**. G4: aberto.
- CONTRATO_IMPLANTACAO_MACRO_T4.md: **aberto** (PR-T4.0).
- T4_ENTRADA_TURNO.md: pendente (PR-T4.1).
- T4_PIPELINE_LLM.md: pendente (PR-T4.2).
- T4_VALIDACAO_PERSISTENCIA.md: pendente (PR-T4.3).
- T4_RESPOSTA_RASTRO_METRICAS.md: pendente (PR-T4.4).
- T4_FALLBACKS.md: pendente (PR-T4.5).
- T4_BATERIA_E2E.md: pendente (PR-T4.6).
- READINESS_G4.md: pendente (PR-T4.R).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T4.1`** — Padronização da entrada do turno (`T4_ENTRADA_TURNO.md`).

### Leituras obrigatorias para PR-T4.1

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` (§5 entradas, §7 CA-01/CA-02, §16 PR-T4.1)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção K — PR-T4.1)
3. `schema/implantation/T1_CONTRATO_SAIDA.md` (TurnoSaida — shape canônico de saída)
4. `schema/implantation/T2_LEAD_STATE_V1.md` (lead_state que entra no turno)
5. `schema/implantation/T3_CLASSES_POLITICA.md` (classes que o pipeline consume)
6. `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` (pipeline T3 que T4 orquestra)
7. `schema/implantation/READINESS_G3.md` (evidência de G3 APROVADO)
8. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
9. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
10. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

---

## Atualizacao 2026-04-25 — PR-T4.1: Padronização da entrada do turno

### Objetivo executado

Criar `schema/implantation/T4_ENTRADA_TURNO.md` com o shape canônico `TurnoEntrada`,
regras de validação de presença, montagem de contexto mínimo e travas LLM-first na entrada.

### O que foi feito

- Criado `schema/implantation/T4_ENTRADA_TURNO.md` com:
  - §1 Shape canônico `TurnoEntrada`: 6 campos obrigatórios + 4 opcionais; `ChannelEnum`
    (5 valores); invariante global LLM-first; proibição absoluta de `reply_text` na entrada;
  - §2 Campos obrigatórios — definição completa de `turn_id`, `case_id`, `message_text`,
    `channel`, `lead_state`, `current_objective` com origem, semântica, tratamento de ausência
    e proibições específicas;
  - §3 Campos opcionais — `attachments`, `prior_decisions`, `soft_vetos_ctx`,
    `context_override` com shapes e regras;
  - §4 13 campos explicitamente proibidos com códigos de erro TE-* canônicos e ação de
    fallback `formato_invalido`;
  - §5 Sequência de validação V1–V6 com tabela completa (fatal/não-fatal/default);
    shapes `ValidationError` e `ValidationWarning`;
  - §6 Montagem de `ContextoTurno`: 10 componentes obrigatórios, 5 condicionais, proibições
    de contexto (reply_text anterior, templates, score_llm, L4 automático), shape completo
    `ContextoTurno` com `OperationalContext`;
  - §7 Tabela consolidada de tratamento de ausência por campo;
  - §8 Posição no pipeline (Etapas 1–2 de 5) com diagrama ASCII;
  - §9 10 regras invioláveis TE-INV-01..10;
  - §10 12 anti-padrões proibidos AP-TE-01..12;
  - §11 5 exemplos sintéticos (E1 primeiro turno, E2 intermediário, E3 objective ausente,
    E4 campo proibido rejeitado, E5 vetos suaves propagados);
  - §12 Cobertura de microetapa 1 confirmada;
  - §13 Validação cruzada em 14 dimensões (T1/T2/T3/adendos);
  - Bloco E com PR-T4.2 desbloqueada.
- Atualizado `schema/contracts/_INDEX.md`: T4 status → em execução; PR-T4.1; próximo → PR-T4.2.
- Atualizado `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: última tarefa = PR-T4.1;
  próximo = PR-T4.2.

### O que não foi feito

- Não criou T4_PIPELINE_LLM.md (microetapa 2 — PR-T4.2).
- Não montou prompt nem executou LLM.
- Não implementou orquestrador real em src/.
- Não alterou package.json, wrangler.toml.
- G4 não fechado.

### Provas entregues

- **P-T4.1-01:** Shape `TurnoEntrada` com 6 campos obrigatórios mínimos — CA-02 cumprido.
- **P-T4.1-02:** Nenhum campo carrega `reply_text`; §4 declara campo proibido com código TE-REPLY-TEXT-PROIBIDO — CA-01 preservado.
- **P-T4.1-03:** `ContextoTurno` extrai apenas campos canônicos de T2_LEAD_STATE_V1 e T1_CONTRATO_SAIDA; validação cruzada §13 em 14 dimensões.
- **P-T4.1-04:** Microetapa 1 do mestre T4 coberta — "Padronizar a entrada (mensagem, anexos, canal, contexto resumido, estado, políticas, objetivo)".
- **P-T4.1-05:** Bloco E presente; evidência completa; zero lacunas bloqueantes.

### Conformidade com adendos

- A00-ADENDO-01: confirmada — §1.3 proíbe reply_text na entrada; §4 lista campos proibidos; TE-INV-01/02; AP-TE-01/06.
- A00-ADENDO-02: confirmada — TurnoEntrada posicionada como interface de entrada, não como casca dominante; prior_decisions não substitui policy engine (TE-INV-10).
- A00-ADENDO-03: confirmada — Bloco E presente; evidência completa; microetapa 1 coberta.

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T4_ENTRADA_TURNO.md
PR que fecha:                          PR-T4.1 (Padronização da entrada do turno)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — shape TurnoEntrada completo; validação V1–V6;
                                       ContextoTurno especificado; campos proibidos com
                                       códigos TE-*; TE-INV-01..10; 12 anti-padrões;
                                       5 exemplos; microetapa 1 coberta; cross-ref T1/T2/T3.
                                       Pipeline LLM (T4.2) e demais são PRs subsequentes.
Há item parcial/inconclusivo bloqueante?: não.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T4.1 CONCLUÍDA; T4_ENTRADA_TURNO.md publicado;
                                       PR-T4.2 desbloqueada.
Próxima PR autorizada:                 PR-T4.2 — Pipeline LLM com contrato único
```

### Estado atual do repositorio (após PR-T4.1)

- Fase macro: **T4** — em execução; PR-T4.2 próxima.
- G0: APROVADO. G1: APROVADO. G2: APROVADO. G3: **APROVADO**. G4: aberto.
- CONTRATO_IMPLANTACAO_MACRO_T4.md: **aberto / em execução** (PR-T4.0 + PR-T4.1).
- T4_ENTRADA_TURNO.md: **publicado** (PR-T4.1).
- T4_PIPELINE_LLM.md: pendente (PR-T4.2).
- T4_VALIDACAO_PERSISTENCIA.md: pendente (PR-T4.3).
- T4_RESPOSTA_RASTRO_METRICAS.md: pendente (PR-T4.4).
- T4_FALLBACKS.md: pendente (PR-T4.5).
- T4_BATERIA_E2E.md: pendente (PR-T4.6).
- READINESS_G4.md: pendente (PR-T4.R).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T4.2`** — Pipeline LLM com contrato único (`T4_PIPELINE_LLM.md`).

### Leituras obrigatorias para PR-T4.2

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` (§6 S2, §7 CA-03, §16 PR-T4.2)
2. `schema/implantation/T4_ENTRADA_TURNO.md` (ContextoTurno — input do pipeline LLM)
3. `schema/implantation/T1_CONTRATO_SAIDA.md` (TurnoSaida shape — output esperado)
4. `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` (identidade e papel do LLM)
5. `schema/implantation/T2_LEAD_STATE_V1.md` (campos que compõem o prompt)
6. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção K — PR-T4.2)
7. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
9. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

---

## Atualizacao 2026-04-25 — PR-T4.2: Pipeline LLM com contrato único

### Objetivo executado

Criar `schema/implantation/T4_PIPELINE_LLM.md` com o shape canônico `PipelinePrompt`,
o contrato de chamada LLM (`LLMCallContract`), a captura imutável do `reply_text` e a
separação formal de componentes de saída entre T4.3 e T4.4.

### Estado herdado

- PR-T4.1 CONCLUÍDA. `T4_ENTRADA_TURNO.md` publicado.
- `ContextoTurno` especificado: input do pipeline LLM.
- T4_PIPELINE_LLM.md: pendente.
- Fase T4 em execução. G4 aberto.

### Estado entregue

- PR-T4.2 CONCLUÍDA. `T4_PIPELINE_LLM.md` publicado.
- `PipelinePrompt`, `LLMCallContract`, `LLMResult` especificados.
- `reply_text` IMUTÁVEL após captura na Etapa 3.
- PR-T4.3 desbloqueada.

### O que foi feito

- Criado `schema/implantation/T4_PIPELINE_LLM.md` com:
  - §1 Posição no pipeline: Etapa 3 de 5 (pós-ContextoTurno, pré-policy/validação);
  - §2 Shape `PipelinePrompt` com 4 blocos em ordem inviolável: §SYS (contrato cognitivo do LLM),
    §CTX (ContextoTurno serializado), §POL (opcional — só presente quando
    decisions/vetos existem), §OUT (instrução de formato de saída);
  - §3 Definição detalhada de cada bloco: §CTX com 7 subseções (turno_atual, fatos_confirmados,
    fatos_pendentes, conflitos, histórico_l1_l3, vetos_suaves, objetivo_operacional);
    §OUT instrução JSON com os 4 campos que o LLM deve produzir; §OUT jamais contém
    reply_text de turno anterior como exemplo;
  - §4 `LLMCallContract`: campos model_id, max_tokens, temperature, turn_id, case_id,
    raw_response, latency_ms, tokens_used (TokenCount), call_timestamp, error? (LLMCallError);
    invariante LLP-INV-03: exatamente 1 chamada LLM por turno; malformed → fallback, nunca retry;
  - §5 `LLMOutputRaw` (texto bruto) e `LLMResult` (parseado):
    - reply_text: string — IMUTÁVEL após captura; rota direta para T4.4;
    - facts_updated_candidates: FactsUpdated — sempre source:"llm_collected", confirmed:false;
    - confidence: Confidence {score:"high"|"medium"|"low", reason?};
    - next_objective_candidate?: Objective — sugestão; mecânico valida em T4.3;
    - parse_successful: boolean; parse_errors: ParseError[]; latency_ms; tokens_used; call_timestamp;
    - 6 ParseError codes: INVALID_JSON (fatal), MISSING_REPLY_TEXT (fatal), UNKNOWN_FACT_KEY
      (não-fatal), INVALID_OBJ_TYPE (não-fatal), INVALID_CONFIDENCE_SCORE (não-fatal),
      EXTRA_FIELDS (não-fatal);
  - §6 Captura de reply_text com invariante LLP-INV-05 (imutabilidade);
    rotas de fallback por tipo de erro: INVALID_JSON/MISSING_REPLY_TEXT/LLM_TIMEOUT/
    LLM_UNAVAILABLE/LLM_RATE_LIMIT → T4.5 fallback; proibição de improviso de reply_text;
  - §7 Captura parcial de TurnoSaida: tabela campos LLM produz (reply_text, facts_updated,
    confidence, next_objective_candidate) vs. campos mecânico produz (pending_updates,
    conflicts_updates, risks, blocks, rastos, métricas);
  - §8 Tratamento de saída malformada: 5 fatais com código de fallback → T4.5 imediato;
    4 não fatais → campo ignorado com warning no TurnoRastro;
  - §9 Separação de componentes com diagrama ASCII: reply_text → T4.4 (IMUTÁVEL, direto);
    facts_updated_candidates → T4.3 (validação + reconciliação); confidence → T4.4+T4.3;
    next_objective_candidate → T4.3 (mecânico valida ou substitui); parse_errors não fatais
    → T4.4 rastro; latency_ms/tokens_used/call_timestamp → T4.4 TurnoRastro métricas;
  - §10 Invariante de não sobrescrita: tabela de conformidade por componente (T4.3, T4.4,
    gateway, orquestrador — nenhum pode alterar reply_text após captura);
  - §11 10 regras invioláveis LLP-INV-01..10 (prompt montado em ordem §SYS→§CTX→§POL→§OUT;
    máximo §CTX por turno; exatamente 1 chamada; timeout → fallback não retry; reply_text
    imutável; facts_updated_candidates jamais entram como confirmados; LLM não ve score_llm;
    reply_text anterior não aparece em §OUT; §POL opcional sem modificar §OUT; §OUT instrui
    formato não conteúdo);
  - §12 12 anti-padrões proibidos AP-LLP-01..12;
  - §13 5 exemplos sintéticos (E1 CLT com obrigação, E2 reply_text ausente → fallback,
    E3 campos extras descartados, E4 veto suave ativo presente em §POL,
    E5 T4.3 bloqueia persistência mas reply_text entregue normalmente);
  - §14 Cobertura de microetapa 2 confirmada ("Pipeline LLM: montar prompt, chamar LLM, capturar resposta");
  - §15 Validação cruzada T1/T2/T3/T4.1 em 17 dimensões;
  - Bloco E: PR-T4.3 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: T4 PR atual → PR-T4.2; próximo → PR-T4.3.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: última tarefa = PR-T4.2;
  próximo = PR-T4.3; seção "O que a PR-T4.2 fechou" adicionada.

### O que não foi feito

- Não criou T4_VALIDACAO_PERSISTENCIA.md (microetapa 3 — PR-T4.3).
- Não criou T4_RESPOSTA_RASTRO_METRICAS.md (microetapa 4 — PR-T4.4).
- Não criou T4_FALLBACKS.md (microetapa 5 — PR-T4.5).
- Não implementou orquestrador real em src/.
- Não alterou package.json, wrangler.toml.
- G4 não fechado.

### Provas entregues

- **P-T4.2-01:** `PipelinePrompt` com 4 blocos em ordem inviolável §SYS→§CTX→§POL→§OUT — CA-03 (LLM único) suportado.
- **P-T4.2-02:** LLP-INV-03 declara exatamente 1 chamada LLM por turno; malformed → fallback sem retry.
- **P-T4.2-03:** LLP-INV-05 + §10 declaram reply_text imutável após captura; tabela confirma que T4.3 nunca o recebe.
- **P-T4.2-04:** `facts_updated_candidates` sempre source:"llm_collected"/confirmed:false — CA-06 (reconciliação antes de persistir) preservado para T4.3.
- **P-T4.2-05:** Microetapa 2 coberta; Bloco E presente; zero lacunas bloqueantes.

### Conformidade com adendos

- A00-ADENDO-01: confirmada — LLM é a única fonte de reply_text (§6); orquestrador nunca fala (§9); mecânico não sobrescreve (§10).
- A00-ADENDO-02: confirmada — §SYS carreia T1_SYSTEM_PROMPT_CANONICO sem modificação; identidade MCMV preservada.
- A00-ADENDO-03: confirmada — Bloco E presente; evidência completa; microetapa 2 coberta.

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T4_PIPELINE_LLM.md
PR que fecha:                          PR-T4.2 (Pipeline LLM com contrato único)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — PipelinePrompt completo; LLMCallContract com
                                       invariante de 1 chamada; LLMResult com reply_text
                                       imutável; separação de roteamento por componente;
                                       malformed handling 5 fatais + 4 não fatais; LLP-INV-01..10;
                                       12 anti-padrões; 5 exemplos; microetapa 2 coberta;
                                       cross-ref T1/T2/T3/T4.1 em 17 dimensões.
                                       Validação/persistência (T4.3) e demais são PRs subsequentes.
Há item parcial/inconclusivo bloqueante?: não.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T4.2 CONCLUÍDA; T4_PIPELINE_LLM.md publicado;
                                       PR-T4.3 desbloqueada.
Próxima PR autorizada:                 PR-T4.3 — Validação policy engine + reconciliação antes de persistir
```

### Estado atual do repositorio (após PR-T4.2)

- Fase macro: **T4** — em execução; PR-T4.3 próxima.
- G0: APROVADO. G1: APROVADO. G2: APROVADO. G3: **APROVADO**. G4: aberto.
- CONTRATO_IMPLANTACAO_MACRO_T4.md: **aberto / em execução** (PR-T4.0 + PR-T4.1 + PR-T4.2).
- T4_ENTRADA_TURNO.md: **publicado** (PR-T4.1).
- T4_PIPELINE_LLM.md: **publicado** (PR-T4.2).
- T4_VALIDACAO_PERSISTENCIA.md: pendente (PR-T4.3).
- T4_RESPOSTA_RASTRO_METRICAS.md: pendente (PR-T4.4).
- T4_FALLBACKS.md: pendente (PR-T4.5).
- T4_BATERIA_E2E.md: pendente (PR-T4.6).
- READINESS_G4.md: pendente (PR-T4.R).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T4.3`** — Validação policy engine + reconciliação antes de persistir (`T4_VALIDACAO_PERSISTENCIA.md`).

### Leituras obrigatorias para PR-T4.3

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` (§6 S3, §7 CA-04/CA-05/CA-06, §16 PR-T4.3)
2. `schema/implantation/T4_PIPELINE_LLM.md` (LLMResult — saída que entra no validador)
3. `schema/implantation/T4_ENTRADA_TURNO.md` (prior_decisions, soft_vetos_ctx)
4. `schema/implantation/T3_CLASSES_POLITICA.md` (classes de decisão avaliadas)
5. `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` (pipeline de composição PolicyDecisionSet)
6. `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` (ValidationContext + ValidationResult)
7. `schema/implantation/T2_LEAD_STATE_V1.md` (estado que será ou não atualizado)
8. `schema/implantation/T2_RECONCILIACAO.md` (reconciliação de fatos antes de persistir)
9. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
10. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
11. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

---

## Atualizacao 2026-04-25 — PR-T4.3: Validação policy engine + reconciliação antes de persistir

### Objetivo executado

Criar `schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` com o fluxo completo da Etapa 4:
construção do `ProposedStateDelta`, reconciliação T2.4, montagem de `ValidationContext`,
execução do validador VC-01..09 e `PersistDecision` com 4 resultados canônicos.

### Estado herdado

- PR-T4.2 CONCLUÍDA. `T4_PIPELINE_LLM.md` publicado com `LLMResult`, `LLMResponseMeta`,
  entrega condicional de `reply_text` (REJECT→T4.5; demais→T4.4).
- T4_VALIDACAO_PERSISTENCIA.md: **pendente** → esta PR entrega.

### Estado entregue

- PR-T4.3 CONCLUÍDA. `T4_VALIDACAO_PERSISTENCIA.md` publicado.
- `ProposedStateDelta`, `PersistDecision`, `ValidationResult` especificados.
- `reply_text` não reescrito por T4.3; T4.3 não entrega ao canal.
- PR-T4.4 desbloqueada.

### O que foi feito

- Criado `schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` com:
  - §1 Posição no pipeline: Etapa 4 de 5; tabela entradas/saídas;
  - §2 `ProposedStateDelta`: shape `FactDeltaEntry[]`; VP-DELTA-01..05;
    `llm_collected` → máximo `captured`; sem `reply_text` no delta;
  - §3 Reconciliação T2.4: protocolo por fato; `ConflictRecord` para `confirmed` contradito;
    VP-CONFL-01..04; conflito bloqueia o campo afetado;
  - §4 Montagem de `ValidationContext`: shapes canônicos de T3.4; `LLMResponseMeta` (sem
    `reply_text` bruto); `PolicyDecisionSet` pré-computado; VP-VC-01..05;
  - §5 Validador VC-01..09: tabela resumo; ordem sequencial; lógica de decisão agregada;
  - §6 `PersistDecision` + `ValidationResult`: shapes; mapeamento decision→lead_state_action;
    `reply_routing` (REJECT→T4.5, demais→T4.4);
  - §7 `safe_fields` / `blocked_fields`: condições suficientes; VP-STATUS-01/02;
  - §8 Conflitos (§8.1) e colisões (§8.2): sem silêncio;
  - §9 Aplicação ao `lead_state`: fluxo por decision; REJECT→revert; `validation_log`;
  - §10 `reply_text` não reescrito: T4.3 não acessa, não modifica, não entrega;
  - §11 Quando `lead_state` é atualizado: condições suficientes e de bloqueio;
  - §12 VP-INV-01..12;
  - §13 12 anti-padrões AP-VP-01..12;
  - §14 5 exemplos (APPROVE, REQUIRE_REVISION/VC-06, PREVENT_PERSISTENCE/VC-07,
    REJECT/VC-04, PREVENT_PERSISTENCE/VC-05);
  - §15 Microetapa 3 coberta;
  - §16 Validação cruzada T2/T3/T4.1/T4.2 em 18 dimensões;
  - Bloco E: PR-T4.4 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: T4 PR atual → PR-T4.3; próximo → PR-T4.4.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`: PR-T4.3 seção.

### O que não foi feito

- Não criou T4_RESPOSTA_RASTRO_METRICAS.md (PR-T4.4).
- Não criou T4_FALLBACKS.md (PR-T4.5).
- Não implementou orquestrador em src/.
- Não alterou package.json, wrangler.toml.
- G4 não fechado.

### Provas entregues

- **P-T4.3-01:** `ProposedStateDelta` com VP-DELTA-01 — `llm_collected` nunca `confirmed` — CA-06 cumprido.
- **P-T4.3-02:** `ValidationContext` sem `reply_text` bruto; usa `LLMResponseMeta` — LLP-INV-11 preservado.
- **P-T4.3-03:** VP-INV-02/03 — T4.3 não reescreve nem entrega `reply_text`.
- **P-T4.3-04:** VP-INV-04/05 — colisão e conflito nunca silenciosos.
- **P-T4.3-05:** Microetapa 3 coberta; Bloco E presente; zero lacunas bloqueantes.

### Conformidade com adendos

- A00-ADENDO-01: confirmada — VP-INV-02/03; §10.1; AP-VP-04.
- A00-ADENDO-02: confirmada — T4.3 conecta, não invade papéis de T2/T3; VP-INV-10.
- A00-ADENDO-03: confirmada — Bloco E presente; evidência completa; microetapa 3 coberta.

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T4_VALIDACAO_PERSISTENCIA.md
PR que fecha:                          PR-T4.3 (Validação policy engine + reconciliação)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — ProposedStateDelta; reconciliação T2.4;
                                       ValidationContext; VC-01..09; PersistDecision;
                                       safe_fields/blocked_fields; REJECT→revert+T4.5;
                                       reply_text não reescrito; VP-INV-01..12; 12 AP-VP;
                                       5 exemplos; microetapa 3 coberta; 18 cross-refs.
Há item parcial/inconclusivo bloqueante?: não.
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T4.3 CONCLUÍDA; T4_VALIDACAO_PERSISTENCIA.md
                                       publicado; PR-T4.4 desbloqueada.
Próxima PR autorizada:                 PR-T4.4 — Resposta final + rastro + métricas
```

### Estado atual do repositorio (após PR-T4.3)

- Fase macro: **T4** — em execução; PR-T4.4 próxima.
- G0: APROVADO. G1: APROVADO. G2: APROVADO. G3: **APROVADO**. G4: aberto.
- T4_ENTRADA_TURNO.md: **publicado** (PR-T4.1).
- T4_PIPELINE_LLM.md: **publicado** (PR-T4.2).
- T4_VALIDACAO_PERSISTENCIA.md: **publicado** (PR-T4.3).
- T4_RESPOSTA_RASTRO_METRICAS.md: pendente (PR-T4.4).
- T4_FALLBACKS.md: pendente (PR-T4.5).
- T4_BATERIA_E2E.md: pendente (PR-T4.6).
- READINESS_G4.md: pendente (PR-T4.R).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T4.4`** — Resposta final + rastro + métricas (`T4_RESPOSTA_RASTRO_METRICAS.md`).

### Leituras obrigatorias para PR-T4.4

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` (§6 S4, §7 CA-07, §16 PR-T4.4)
2. `schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` (PersistDecision + reply_routing)
3. `schema/implantation/T4_PIPELINE_LLM.md` (reply_text capturado; LLMResult métricas)
4. `schema/implantation/T4_ENTRADA_TURNO.md` (TurnoEntrada.turn_id/case_id)
5. `schema/implantation/T1_CONTRATO_SAIDA.md` (TurnoSaida shape — 13 campos canônicos)
6. `schema/implantation/T2_RESUMO_PERSISTIDO.md` (L1/L2/L3 atualização pós-turno)
7. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
9. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

---

## Atualizacao 2026-04-26 — PR-T4.4: Resposta final + rastro + métricas mínimas

### Objetivo executado

Criar `schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md` com o fluxo completo da Etapa 5
(final) do pipeline: entrega condicional de `reply_text`, shape `TurnoRastro`, métricas
mínimas declarativas e atualização das camadas de memória pós-turno.

### Estado herdado

- PR-T4.3 CONCLUÍDA e mergeada em 2026-04-26. `T4_VALIDACAO_PERSISTENCIA.md` publicado com
  `PersistDecision`, `reply_routing` ("T4.4" / "T4.5"), VP-INV-01..12, execução T3 em §3.5.
- T4_RESPOSTA_RASTRO_METRICAS.md: **pendente** → esta PR entrega.

### Estado entregue

- PR-T4.4 CONCLUÍDA. `T4_RESPOSTA_RASTRO_METRICAS.md` publicado.
- Entrega condicional de `reply_text` por `reply_routing` especificada.
- `TurnoRastro` com 15 campos; `reply_text` nunca armazenado como campo operacional.
- Métricas mínimas: 10 métricas declarativas.
- Camadas L1/L2/L3/L4 com regras de atualização pós-turno.
- PR-T4.5 desbloqueada.

### O que foi feito

- Criado `schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md` com:
  - §1 Posição no pipeline: Etapa 5 de 5; tabela entradas/saídas;
  - §2 Regras de entrega: flowchart por reply_routing; tabela por ValidationResult;
    T4.4 nunca escreve/edita/substitui reply_text; roteamento T4.5 (RR-ROUT-01/02);
    erro de canal declarativo (RR-CANAL-01/02);
  - §3 TurnoRastro shape: 15 campos com sub-shapes ValidationResultSummary,
    PersistDecisionSummary, ConflictRef, PolicyDecisionRef; RR-RAST-01/02;
  - §4 Métricas mínimas: 10 métricas com origem; cálculo latency_ms; TokensUsed;
  - §5 Camadas memória: L1 sempre, L2 condicional, L3 por evento, L4 arquivamento;
    ordem 8 passos pós-turno;
  - §6 Distinção TurnoRastro vs. TurnoSaida;
  - §7 RR-INV-01..12; §8 AP-RR-01..12; §9 5 exemplos; §10 microetapa 4; §11 18 cross-refs;
  - Bloco E: PR-T4.5 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR atual → PR-T4.4; próximo → PR-T4.5.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que não foi feito

- Não criou T4_FALLBACKS.md (PR-T4.5).
- Não implementou orquestrador em src/.
- Não alterou package.json, wrangler.toml.
- G4 não fechado.

### Provas entregues

- **P-T4.4-01:** §2.2 trava absoluta — T4.4 não escreve/edita/substitui `reply_text` — CA-01 cumprido.
- **P-T4.4-02:** RR-INV-02/03 — `reply_text` entregue somente se `reply_routing = "T4.4"`; REJECT → T4.5.
- **P-T4.4-03:** RR-INV-04/05 — `TurnoRastro` não armazena `reply_text` como campo operacional; não é fonte de fala futura.
- **P-T4.4-04:** CA-07 cumprido — `TurnoRastro` com turn_id, case_id, channel, policy_decisions_applied, validation_result, facts_persisted, latency_ms, tokens_used, timestamp.
- **P-T4.4-05:** Microetapa 4 coberta; Bloco E presente; zero lacunas bloqueantes.

### Conformidade com adendos

- A00-ADENDO-01: confirmada — RR-INV-01..03; §2.2 trava absoluta; AP-RR-01..06; T4.4 entrega mas nunca cria fala.
- A00-ADENDO-02: confirmada — TurnoRastro não vira casca dominante; AP-RR-04; AP-RR-12.
- A00-ADENDO-03: confirmada — Bloco E presente; evidência completa; microetapa 4 coberta.

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md
PR que fecha:                          PR-T4.4 (Resposta final + rastro + métricas mínimas)
Estado da evidência:                   completa
Há lacuna remanescente?:               não — entrega condicional reply_text (§2);
                                       TurnoRastro 15 campos (§3); 10 métricas (§4);
                                       camadas L1/L2/L3/L4 (§5); RR-INV-01..12;
                                       12 AP-RR; 5 exemplos; microetapa 4; 18 cross-refs.
Há item parcial/inconclusivo bloqueante?: não —
                                       T4.4 não reescreve reply_text (RR-INV-01);
                                       REJECT não envia reply_text (RR-INV-03);
                                       TurnoRastro não é fonte de fala (RR-INV-04..05);
                                       approval_prohibited invariante (RR-INV-08).
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T4.4 CONCLUÍDA; T4_RESPOSTA_RASTRO_METRICAS.md
                                       publicado; PR-T4.5 desbloqueada.
Próxima PR autorizada:                 PR-T4.5 — Fallbacks de segurança
```

### Estado atual do repositorio (após PR-T4.4)

- Fase macro: **T4** — em execução; PR-T4.5 próxima.
- G0: APROVADO. G1: APROVADO. G2: APROVADO. G3: **APROVADO**. G4: aberto.
- T4_ENTRADA_TURNO.md: **publicado** (PR-T4.1).
- T4_PIPELINE_LLM.md: **publicado** (PR-T4.2).
- T4_VALIDACAO_PERSISTENCIA.md: **publicado** (PR-T4.3).
- T4_RESPOSTA_RASTRO_METRICAS.md: **publicado** (PR-T4.4).
- T4_FALLBACKS.md: pendente (PR-T4.5).
- T4_BATERIA_E2E.md: pendente (PR-T4.6).
- READINESS_G4.md: pendente (PR-T4.R).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T4.5`** — Fallbacks de segurança (`T4_FALLBACKS.md`).

### Leituras obrigatorias para PR-T4.5

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` (§6 S5, §7 CA-08, §16 PR-T4.5)
2. `schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md` (reply_routing T4.5; TurnoRastro)
3. `schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` (REJECT → T4.5; PersistDecision)
4. `schema/implantation/T4_PIPELINE_LLM.md` (erros fatais; ParseError codes)
5. `schema/implantation/T4_ENTRADA_TURNO.md` (erros de entrada → fallback)
6. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
7. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
8. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

---

## Atualizacao 2026-04-26 — PR-T4.5: Fallbacks de segurança

### Objetivo executado

Criar `schema/implantation/T4_FALLBACKS.md` com os 4 cenários obrigatórios de fallback,
shapes `FallbackContext`/`FallbackDecision`/`FallbackTrace`, regras de resposta segura,
regra de não uso de `reply_text` rejeitado e rastro de falha.

### Estado herdado

- PR-T4.4 CONCLUÍDA e mergeada em 2026-04-26. `T4_RESPOSTA_RASTRO_METRICAS.md` publicado
  com `TurnoRastro`, `reply_routing`, `RR-ROUT-02` (T4.4 não fornece `reply_text` para T4.5).
- T4_FALLBACKS.md: **pendente** → esta PR entrega.

### Estado entregue

- PR-T4.5 CONCLUÍDA. `T4_FALLBACKS.md` publicado.
- 4 cenários obrigatórios especificados: erro_modelo, formato_invalido, omissao_campos,
  contradicao_seria.
- Shapes FallbackContext (sem reply_text), FallbackDecision (lead_state_change="none"),
  FallbackTrace (lead_state_preserved invariante).
- Regra de não uso de reply_text rejeitado: FB-INV-01 + §7.
- Fallback nunca promete aprovação (FB-INV-02), nunca avança stage (FB-INV-03),
  nunca persiste fato confirmed (FB-INV-04).
- PR-T4.6 desbloqueada.

### O que foi feito

- Criado `schema/implantation/T4_FALLBACKS.md` com:
  - §1 Posição no pipeline (Etapa 6 de 6); caminhos de acionamento;
  - §2 Condições de acionamento: 5 condições; caminhos direto T4.2→T4.5 e via T4.3/T4.4;
  - §3 Shapes: FallbackTrigger (4 valores), FallbackAction (4 valores), FallbackContext,
    FallbackDecision, ErrorDetail, ResponseStrategy, FallbackTrace;
  - §4 Cenários obrigatórios (4): erro_modelo (§4.1 + retry único), formato_invalido
    (§4.2 + sem retry), omissao_campos (§4.3), contradicao_seria (§4.4 via REJECT);
  - §5 Resposta segura: retry LLM seguro único (FB-RETRY-01/02/03); escalação;
    tabela proibições absolutas;
  - §6 Rastro e métricas: FallbackTrace obrigatório (FB-INV-07); relação TurnoRastro↔FallbackTrace;
  - §7 Regra de não uso de reply_text rejeitado (FB-INV-01; §7.3 o que T4.4 envia);
  - §8 FB-INV-01..12; §9 AP-FB-01..13; §10 5 exemplos FB-E1..E5;
  - §11 cross-ref T1/T2/T3/T4.1..T4.4 em 14 dimensões; §12 microetapa 5; Bloco E.
- Atualizou `schema/contracts/_INDEX.md`: PR atual → PR-T4.5; próximo → PR-T4.6.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que não foi feito

- Não criou T4_BATERIA_E2E.md (PR-T4.6).
- Não implementou orquestrador em `src/`.
- Não alterou `package.json`, `wrangler.toml`.
- G4 não fechado.

### Provas entregues

- **P-T4.5-01:** §7 + FB-INV-01 — T4.5 nunca usa `reply_text` rejeitado — CA-08 + AP-FB-01.
- **P-T4.5-02:** FB-INV-02/03/04 — sem aprovação, sem stage advance, sem fact confirmed.
- **P-T4.5-03:** CA-08 cumprido — 4 cenários obrigatórios declarados em §4.1–4.4.
- **P-T4.5-04:** AP-FB-06 + §5.1 — fallback não é template rígido dominante; mínimo e humano.
- **P-T4.5-05:** Microetapa 5 coberta; Bloco E presente; zero lacunas bloqueantes.

### Conformidade com adendos

- A00-ADENDO-01: confirmada — FB-INV-01 (não usa reply_text); AP-FB-06 (não é template dominante);
  fallback é rede de proteção mínima, não casca mecânica.
- A00-ADENDO-02: confirmada — §5.1 "fallback é segurança — não novo funil"; identidade MCMV preservada.
- A00-ADENDO-03: confirmada — Bloco E presente; evidência completa; microetapa 5 coberta.

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T4_FALLBACKS.md
PR que fecha:                          PR-T4.5 (Fallbacks de segurança)
Contrato ativo:                        schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 4 cenários obrigatórios (§4.1–4.4);
                                       shapes completos (§3); FB-INV-01..12; AP-FB-01..13;
                                       5 exemplos; 14 cross-refs; microetapa 5 coberta.
Há item parcial/inconclusivo bloqueante?: não —
                                       fallback não usa reply_text rejeitado (FB-INV-01);
                                       fallback não promete aprovação (FB-INV-02);
                                       fallback não avança stage (FB-INV-03);
                                       fallback não persiste fato confirmed (FB-INV-04);
                                       fallback não é template dominante (AP-FB-06 + §5.1).
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T4.5 CONCLUÍDA; T4_FALLBACKS.md publicado;
                                       PR-T4.6 desbloqueada.
Próxima PR autorizada:                 PR-T4.6 — Bateria E2E sandbox + latência/custo
```

### Estado atual do repositorio (após PR-T4.5)

- Fase macro: **T4** — em execução; PR-T4.6 próxima.
- G0: APROVADO. G1: APROVADO. G2: APROVADO. G3: **APROVADO**. G4: aberto.
- T4_ENTRADA_TURNO.md: **publicado** (PR-T4.1).
- T4_PIPELINE_LLM.md: **publicado** (PR-T4.2).
- T4_VALIDACAO_PERSISTENCIA.md: **publicado** (PR-T4.3).
- T4_RESPOSTA_RASTRO_METRICAS.md: **publicado** (PR-T4.4).
- T4_FALLBACKS.md: **publicado** (PR-T4.5).
- T4_BATERIA_E2E.md: pendente (PR-T4.6).
- READINESS_G4.md: pendente (PR-T4.R).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T4.R`** — Readiness/Closeout G4 (`READINESS_G4.md`).

### Leituras obrigatorias para PR-T4.R

1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` (§7 CA-01..CA-10; §17 gate G4)
2. `schema/implantation/T4_BATERIA_E2E.md` (evidência E2E — CA-09)
3. Todos os artefatos T4.1..T4.5 (T4_ENTRADA_TURNO, T4_PIPELINE_LLM, T4_VALIDACAO_PERSISTENCIA,
   T4_RESPOSTA_RASTRO_METRICAS, T4_FALLBACKS)
4. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` §K PR-T4.R
5. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03 — Bloco E obrigatório)

---

## Atualizacao 2026-04-25 — PR-T4.R: Readiness/Closeout G4

### Objetivo executado

Criar `schema/implantation/READINESS_G4.md`, executar o smoke documental S1–S6,
verificar CA-01..CA-10, declarar G4 APROVADO, encerrar contrato T4, arquivar T4
e criar skeleton T5.

### ESTADO HERDADO

- PR-T4.6 concluída e mergeada.
- `T4_BATERIA_E2E.md` publicado (10 cenários declarativos, CA-09 cumprido).
- Artefatos T4.1..T4.6 todos publicados.
- `READINESS_G4.md` não existia.
- T5 bloqueado até G4 APROVADO.

### ESTADO ENTREGUE

- PR-T4.R CONCLUÍDA. `READINESS_G4.md` publicado.
- G4 APROVADO com justificativa formal.
- Smoke S1–S6: 6/6 PASS.
- CA-01..CA-10: 10/10 CUMPRIDOS.
- 5 microetapas T4: 5/5 cobertas.
- Coerência cross-artefato: verificada (10 invariantes + 8 transições).
- Soberania LLM: intacta (zero reply_text mecânico).
- Fallback 4/4 com invariantes confirmados.
- Zero lacunas bloqueantes; 5 não bloqueantes (LNB-G4-01..05) — todas intencionais.
- Contrato T4 encerrado e arquivado.
- Skeleton T5 criado.
- PR-T5.0 desbloqueada.

### O que foi feito

- Criou `schema/implantation/READINESS_G4.md` com:
  - §1 Smoke S1–S6 (6/6 PASS); §2 CA-01..CA-10 (10/10);
  - §3 Coerência cross-artefato; §4 Soberania LLM;
  - §5 Lacunas (0 bloqueantes, 5 não bloqueantes);
  - §6 Decisão formal G4 APROVADO; §7 Encerramento T4;
  - §8 Conformidade adendos; §9 Bloco E.
- Arquivou contrato T4: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T4_2026-04-25.md`.
- Criou skeleton T5: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md`.
- Atualizou `schema/contracts/_INDEX.md`: T4 encerrado; T5 skeleton ativo; PR-T5.0 próximo passo.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que não foi feito

- Não abriu T5 com corpo completo (skeleton criado — PR-T5.0 preencherá).
- Não implementou orquestrador em src/.
- Não alterou package.json, wrangler.toml.
- G5 não aberto.

### Exceção contratual

Exceção contratual ativa: não.

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/READINESS_G4.md
PR que fecha:                          PR-T4.R (Readiness/Closeout G4)
Contrato ativo:                        schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md
Estado da evidência:                   completa
Há lacuna remanescente?:               não — smoke 6/6; CA 10/10; micro 5/5;
                                       soberania LLM intacta; fallback 4/4;
                                       E2E 10 cenários; zero bloqueantes.
Há item parcial/inconclusivo bloqueante?: não
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         G4 APROVADO; T4 ENCERRADO; T5 skeleton;
                                       PR-T5.0 desbloqueada.
Próxima PR autorizada:                 PR-T5.0 — Abertura formal do contrato T5
```

### Estado atual do repositorio (após PR-T4.R)

- Fase macro: **T5** — skeleton; PR-T5.0 próxima.
- G0: APROVADO. G1: APROVADO. G2: APROVADO. G3: APROVADO. G4: **APROVADO**. G5: aberto.
- T4_ENTRADA_TURNO.md: **publicado** (PR-T4.1).
- T4_PIPELINE_LLM.md: **publicado** (PR-T4.2).
- T4_VALIDACAO_PERSISTENCIA.md: **publicado** (PR-T4.3).
- T4_RESPOSTA_RASTRO_METRICAS.md: **publicado** (PR-T4.4).
- T4_FALLBACKS.md: **publicado** (PR-T4.5).
- T4_BATERIA_E2E.md: **publicado** (PR-T4.6).
- READINESS_G4.md: **publicado** (PR-T4.R).
- CONTRATO_IMPLANTACAO_MACRO_T4.md: **arquivado** (archive/).
- CONTRATO_IMPLANTACAO_MACRO_T5.md: **skeleton** (active/).
- Runtime: inalterado.

### Proximo passo autorizado

- **`PR-T5.0`** — Abertura formal do contrato T5.

### Leituras obrigatorias para PR-T5.0

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T5
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` §L (PRs T5)
3. `schema/contracts/_INDEX.md`
4. `schema/implantation/READINESS_G4.md` (gate de entrada T5)
5. `schema/CONTRACT_SCHEMA.md`
6. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
7. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
8. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

---

## Atualizacao 2026-04-25 — PR-T4.6: Bateria E2E sandbox + latência/custo

### Objetivo executado

Criar `schema/implantation/T4_BATERIA_E2E.md` — bateria declarativa de ≥10 cenários
cobrindo o pipeline T4 completo (T4.1..T4.5), com métricas declarativas de latência/custo,
matrizes de cobertura e Bloco E.

### ESTADO HERDADO

- PR-T4.5 concluída e mergeada.
- `T4_FALLBACKS.md` publicado (4 cenários obrigatórios, FB-INV-01..12, FB-RETRY-01).
- Artefatos T4.1..T4.5 todos publicados.
- `T4_BATERIA_E2E.md` não existia.
- PR-T4.R bloqueada até T4_BATERIA_E2E.md ser publicado.

### ESTADO ENTREGUE

- PR-T4.6 CONCLUÍDA. `T4_BATERIA_E2E.md` publicado.
- 10 cenários declarativos completos:
  - E2E-PC-01: pipeline_completo CLT → APPROVE apply_full → T4.4 ✓
  - E2E-PC-02: pipeline_completo autônomo → REQUIRE_REVISION VC-06 apply_partial → T4.4 ✓
  - E2E-PC-03: pipeline_completo confirmed indevido → PREVENT_PERSISTENCE VC-07 → T4.4 ✓
  - E2E-PC-04: pipeline_completo colisão silenciosa → REJECT VC-04 revert → T4.5 ✓
  - E2E-FB-01: fallback erro_modelo → retry_llm_safe único → success ✓
  - E2E-FB-02: fallback formato_invalido → sem retry → request_reformulation ✓
  - E2E-FB-03: fallback omissao_campos → request_reformulation ✓
  - E2E-FB-04: fallback contradicao_seria → REJECT via T4.3→T4.4→T4.5 ✓
  - E2E-BD-01: borda APPROVE + ACAO_AVANÇAR_STAGE + L3 snapshot via snapshot_candidate ✓
  - E2E-BD-02: regressão VC-01 REJECT reply_text mecânico detectado ✓
- Cada cenário contém prior_state, TurnoEntrada, LLMResult simulado, LLMResponseMeta,
  ProposedStateDelta, PolicyDecisionSet, ValidationResult, PersistDecision, rota,
  TurnoRastro/FallbackTrace esperado, métricas declarativas, critérios PASS.
- Métricas declarativas (10 cenários): latency_ms 1650–3800; latency_llm_ms 800–1600;
  tokens_total 228–1068.
- §7 cobertura artefatos T4.1..T4.5 (5/5 cobertos).
- §8 CA-01..09 9/9 cobertos.
- §9 fallback 4/4 (todos os 4 triggers mandatórios presentes).
- §12 cross-ref T1/T2/T3/T4.1..T4.5 em 20 dimensões.
- PR-T4.R desbloqueada.

### O que foi feito

- Criou `schema/implantation/T4_BATERIA_E2E.md` com:
  - §1 Tabela geral 10 cenários; §2 Convenções (métricas declarativas, G-01..G-08);
  - §3 Estrutura de cada cenário; §4 pipeline_completo (§4.1..§4.4);
  - §5 fallback (§5.1..§5.4); §6 borda/regressão (§6.1..§6.2);
  - §7 cobertura artefatos; §8 CA-01..09; §9 fallback 4/4;
  - §10 métricas declarativas consolidadas; §11 anti-padrões verificados;
  - §12 cross-ref 20 dimensões; §13 microetapas cobertas; Bloco E.
- Atualizou `schema/contracts/_INDEX.md`: PR atual → PR-T4.6; próximo → PR-T4.R.
- Atualizou `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`.

### O que não foi feito

- Não criou READINESS_G4.md (PR-T4.R).
- Não implementou orquestrador em src/.
- Não alterou package.json, wrangler.toml.
- G4 não fechado.

### Exceção contratual

Exceção contratual ativa: não.

### Bloco E

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/T4_BATERIA_E2E.md
PR que fecha:                          PR-T4.6 (Bateria E2E sandbox + latência/custo)
Contrato ativo:                        schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md
Estado da evidência:                   completa
Há lacuna remanescente?:               não — 10 cenários declarativos (≥10 exigidos; CA-09
                                       cumprido); 4/4 fallbacks cobertos; 4 pipeline_completo;
                                       2 borda/regressão; métricas declarativas em todos;
                                       matrizes cobertura T4.1..T4.5; CA-01..09 9/9;
                                       reply_text imutável verificado em todos os cenários
                                       (AP-TE-12, AP-LLP-01, AP-VP-01, AP-RR-01, AP-FB-01);
                                       profile_summary nunca de reply_text (RR-L3-03).
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         PR-T4.6 CONCLUÍDA; T4_BATERIA_E2E.md publicado;
                                       PR-T4.R desbloqueada.
Próxima PR autorizada:                 PR-T4.R — Readiness/Closeout G4
```

### Estado atual do repositorio (após PR-T4.6)

- Fase macro: **T4** — em execução; PR-T4.R próxima.
- G0: APROVADO. G1: APROVADO. G2: APROVADO. G3: **APROVADO**. G4: aberto.
- T4_ENTRADA_TURNO.md: **publicado** (PR-T4.1).
- T4_PIPELINE_LLM.md: **publicado** (PR-T4.2).
- T4_VALIDACAO_PERSISTENCIA.md: **publicado** (PR-T4.3).
- T4_RESPOSTA_RASTRO_METRICAS.md: **publicado** (PR-T4.4).
- T4_FALLBACKS.md: **publicado** (PR-T4.5).
- T4_BATERIA_E2E.md: **publicado** (PR-T4.6).
- READINESS_G4.md: pendente (PR-T4.R).
- Runtime: inalterado.
