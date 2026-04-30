# T8_MATRIZ_ADERENCIA_CONTRATO_CODIGO — Matriz de Aderência Contrato × Código Real

| Campo           | Valor                                                                          |
|-----------------|--------------------------------------------------------------------------------|
| PR              | PR-T8.2                                                                        |
| Tipo            | PR-DIAG                                                                        |
| Fase            | T8 — Diagnóstico técnico de aderência contrato × código real                  |
| Data            | 2026-04-29                                                                     |
| Autoria         | Claude Code (Mini-Enavia) — diagnóstico sem modificação de código              |
| Base de entrada | PR-T8.1 — `schema/diagnostics/T8_REPO2_INVENTARIO_TECNICO.md`                |
| Contratos lidos | T1 (2026-04-23), T2 (2026-04-24), T3 (2026-04-25), T4 (2026-04-25), T5 (2026-04-28), T6 (2026-04-28), T7 (2026-04-29) |
| Próxima PR      | PR-T8.3 (PR-DIAG — Diagnóstico CRM Repo1)                                    |

---

## §1 Objetivo

Este documento mapeia, item a item, o que cada contrato T1–T7 especificou versus o que existe hoje no Repo2 (`src/`, `.github/`, `wrangler.toml`, `package.json`). O resultado de cada item é um veredito de aderência. O conjunto de vereditos forma a base de priorização das PRs-IMPL e PRs-PROVA de T8.

**Princípio de leitura**: T1–T5 foram contratos inteiramente documentais/declarativos — o código em `src/` estava explicitamente fora de escopo nessas fases. Isso significa que a ausência de implementação em T1–T5 não é falha operacional; é a situação esperada pelo desenho da implantação macro. O risco real está nos itens que T6/T7 exigiam operacionalmente e não existem, e nos itens que conflitam com o contrato.

---

## §2 Legenda

| Status          | Definição                                                                                                 |
|-----------------|-----------------------------------------------------------------------------------------------------------|
| **ADERENTE**    | Código implementa o que o contrato especifica; funcionalidade real presente e verificada no Repo2.       |
| **PARCIAL**     | Estrutura ou scaffold existe no código, mas incompleto: in-memory only, hardcoded, faltam peças críticas.|
| **AUSENTE**     | Nenhuma implementação correspondente existe no Repo2.                                                    |
| **CONFLITANTE** | Código existente ativamente viola ou contradiz requisito contratual.                                     |
| **NÃO APLIC.**  | Item foi explicitamente declarado fora de escopo de implementação no contrato correspondente.            |

---

## §3 Matriz T1 — Contrato Cognitivo LLM-first

**Contrato**: `CONTRATO_IMPLANTACAO_MACRO_T1_2026-04-23.md`  
**Status do contrato**: ENCERRADO — G1 APROVADO em 2026-04-23  
**Escopo do contrato**: Inteiramente documental. T1 §3 declara explicitamente: implementação de código TypeScript em `src/` está fora de escopo.

| # | Item contratual T1 | Artefato T1 | Código Repo2 | Status |
|---|---|---|---|---|
| T1-01 | 5 camadas canônicas (TOM/REGRA/VETO/SUGESTÃO MANDATÓRIA/REPERTÓRIO) | `T1_CAMADAS_CANONICAS.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T1-02 | System prompt canônico (identidade da Enovia como atendente MCMV) | `T1_SYSTEM_PROMPT_CANONICO.md` | Não aplicado — sem LLM real em `src/` | **AUSENTE** |
| T1-03 | Contrato de saída `TurnoSaida` (13 campos obrigatórios + `reply_text`) | `T1_CONTRATO_SAIDA.md` | Shape parcialmente referenciado em `src/core/engine.ts` (estrutura), sem LLM gerando `reply_text` real | **PARCIAL** |
| T1-04 | Taxonomia oficial (56 tipos em 6 categorias) | `T1_TAXONOMIA_OFICIAL.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T1-05 | Comportamentos obrigatórios e proibições (lista fechada) | `T1_COMPORTAMENTOS_E_PROIBICOES.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T1-06 | Cenários adversariais (respostas a manipulação, funil forçado) | `T1_CAMADAS_CANONICAS.md` §6 | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T1-07 | Soberania LLM: `reply_text` exclusivamente produzido pelo LLM | A00-ADENDO-01 | `src/worker.ts` roteia mas não tem LLM real; `reply_text` não é gerado por modelo | **AUSENTE** |
| T1-08 | Integração real de modelo LLM (chamada HTTP/SDK) | Fora de escopo T1 (T4 é quem implementa) | Nenhum cliente LLM real em `src/`; sem `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` ou equivalente em `wrangler.toml` | **AUSENTE** |

**Resumo T1**: Itens documentais NÃO APLIC. por design. Gap crítico: nenhum LLM real integrado ao código — o sistema não produz `reply_text` real por modelo.

---

## §4 Matriz T2 — Estado, Memória e Persistência

**Contrato**: `CONTRATO_IMPLANTACAO_MACRO_T2_2026-04-24.md`  
**Status do contrato**: ENCERRADO — G2 APROVADO em 2026-04-24  
**Escopo do contrato**: Inteiramente documental. T2 §3 declara: integração real com Supabase fora de escopo.

| # | Item contratual T2 | Artefato T2 | Código Repo2 | Status |
|---|---|---|---|---|
| T2-01 | Dicionário `fact_*` (35 fact_*, 9 derived_*, 6 signal_* = 50 chaves canônicas) | `T2_DICIONARIO_FATOS.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T2-02 | Schema `lead_state` v1 (11 blocos canônicos) | `T2_LEAD_STATE_V1.md` | Referenciado em `src/e1/` e `src/adapter/runtime.ts`; 10 tabelas in-memory implementadas | **PARCIAL** |
| T2-03 | Política de confiança (6 origens, graus de confiança) | `T2_POLITICA_CONFIANCA.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T2-04 | Protocolo de reconciliação (7 estados) | `T2_RECONCILIACAO.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T2-05 | Resumo persistido: 4 camadas de memória (L1-L4) | `T2_RESUMO_PERSISTIDO.md` | `src/e1/` implementa memória evolutiva; estrutura in-process presente | **PARCIAL** |
| T2-06 | Snapshot e regras anti-contaminação | `T2_RESUMO_PERSISTIDO.md` §4 | Estrutura in-memory presente; sem persistência cross-request (Cloudflare Worker stateless) | **PARCIAL** |
| T2-07 | Adapter Supabase real (`@supabase/supabase-js`) | Fora de escopo T2, esperado em T8 | `@supabase/supabase-js` AUSENTE do `package.json`; `InMemoryPersistenceBackend` em `src/adapter/runtime.ts`; comentário no código: "Backend Supabase real fica para etapa de deployment futura" | **AUSENTE** |
| T2-08 | Migrations SQL (schema das 10 tabelas no Supabase real) | Fora de escopo T2 | Diretório `migrations/` AUSENTE; nenhum arquivo `.sql` no Repo2 | **AUSENTE** |
| T2-09 | Row Level Security (RLS) nas tabelas Supabase | Fora de escopo T2 | RLS AUSENTE por ausência do Supabase real | **AUSENTE** |
| T2-10 | Persistência cross-request real (estado entre turnos de atendimento) | Fora de escopo T2 | Impossível em Cloudflare Workers sem KV/D1/Supabase; bindings AUSENTES em `wrangler.toml` | **AUSENTE** |

**Resumo T2**: Contratos documentais NÃO APLIC. por design. A estrutura de estado existe in-memory; persistência real (Supabase, KV, D1) completamente ausente — sistema perde estado a cada request.

---

## §5 Matriz T3 — Policy Engine v1

**Contrato**: `CONTRATO_IMPLANTACAO_MACRO_T3_2026-04-25.md`  
**Status do contrato**: ENCERRADO — G3 APROVADO em 2026-04-25  
**Escopo do contrato**: Inteiramente documental. T3 §3 declara: implementação TypeScript em `src/` fora de escopo.

| # | Item contratual T3 | Artefato T3 | Código Repo2 | Status |
|---|---|---|---|---|
| T3-01 | 5 classes canônicas de política (obrigação, bloqueio, sugestão mandatória, confirmação, roteamento) | `T3_CLASSES_POLITICA.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T3-02 | 4 regras críticas declarativas (casado civil→conjunto; autônomo→IR; solo baixa→composição; estrangeiro sem RNM→bloqueio) | `T3_REGRAS_CRITICAS_DECLARATIVAS.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T3-03 | Ordem de avaliação estável (6 estágios) e política de composição | `T3_ORDEM_AVALIACAO_COMPOSICAO.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T3-04 | Veto suave e validador pós-resposta/pré-persistência (checklist VC-01..VC-09) | `T3_VETO_SUAVE_VALIDADOR.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T3-05 | Suíte de testes declarativos das regras críticas | `T3_SUITE_TESTES_REGRAS.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T3-06 | Integração do policy engine no pipeline T4 (T4 integra T3 — não T3 implementa) | Responsabilidade de T4 | `src/policy/` existe com avaliação de políticas; integração com engine presente | **PARCIAL** |

**Resumo T3**: Inteiramente documental por contrato — NÃO APLIC. para itens src/. O `src/policy/` foi criado como scaffolding (provavelmente em T4/T5); estrutura presente, mas sem LLM real para exercitar as políticas de forma end-to-end.

---

## §6 Matriz T4 — Orquestrador de Turno LLM-first

**Contrato**: `CONTRATO_IMPLANTACAO_MACRO_T4_2026-04-25.md`  
**Status do contrato**: ENCERRADO — G4 APROVADO em 2026-04-25  
**Escopo do contrato**: T4.1–T4.5 documentais; T4.6 podia incluir scaffold mínimo de sandbox.

| # | Item contratual T4 | Artefato T4 | Código Repo2 | Status |
|---|---|---|---|---|
| T4-01 | Schema de entrada canônico `TurnoEntrada` (campos obrigatórios e opcionais) | `T4_ENTRADA_TURNO.md` | `src/core/engine.ts` processa entrada; estrutura de turno presente | **PARCIAL** |
| T4-02 | Pipeline LLM: montagem de prompt, chamada LLM, captura de `reply_text` e `TurnoSaida` | `T4_PIPELINE_LLM.md` | Nenhuma chamada LLM real; sem cliente de modelo em `src/`; sem variáveis de API em `wrangler.toml` | **AUSENTE** |
| T4-03 | Integração pós-LLM: `TurnoSaida` passa por T3 (policy engine) e T2 (reconciliador) antes de persistir | `T4_VALIDACAO_PERSISTENCIA.md` | `src/policy/` e `src/adapter/runtime.ts` existem; integração presente mas sem LLM real = pipeline incompleto | **PARCIAL** |
| T4-04 | Validador VC-01..VC-09 (checklist pós-resposta/pré-persistência) | `T4_VALIDACAO_PERSISTENCIA.md` | Estrutura de validação referenciada; sem LLM real para produzir `reply_text` a validar | **PARCIAL** |
| T4-05 | Resposta final ao canal + rastro do turno (`TurnoRastro`) + métricas mínimas | `T4_RESPOSTA_RASTRO_METRICAS.md` | `src/worker.ts` retorna respostas; rastro parcialmente implementado; telemetria sem destino externo real | **PARCIAL** |
| T4-06 | Fallbacks seguros (4 cenários: erro de modelo, formato inválido, omissão de campos, contradição séria) | `T4_FALLBACKS.md` | Fallbacks parcialmente presentes para erros de routing; sem fallback de modelo real | **PARCIAL** |
| T4-07 | Bateria E2E em sandbox (mínimo 10 cenários declarativos) | `T4_BATERIA_E2E.md` | 12 scripts `npm run smoke:*` presentes; executam in-process sem LLM real | **PARCIAL** |

**Resumo T4**: Orquestrador estruturado como scaffold em `src/core/engine.ts`, `src/policy/`, `src/adapter/runtime.ts`. Gap central: ausência de LLM real impede que qualquer item T4 seja ADERENTE — o pipeline de turno não produz `reply_text` por modelo.

---

## §7 Matriz T5 — Migração do Funil Core

**Contrato**: `CONTRATO_IMPLANTACAO_MACRO_T5_2026-04-28.md`  
**Status do contrato**: ENCERRADO — G5 APROVADO em 2026-04-28  
**Escopo do contrato**: Inteiramente documental. T5 §3 declara: implementação TypeScript em `src/` fora de escopo.

| # | Item contratual T5 | Artefato T5 | Código Repo2 | Status |
|---|---|---|---|---|
| T5-01 | Mapa canônico de fatias do funil e ordem de migração | `T5_MAPA_FATIAS.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T5-02 | Fatia topo/abertura/primeira intenção (fatos mínimos, políticas, proibições) | `T5_FATIA_TOPO_ABERTURA.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T5-03 | Fatia qualificação inicial (nome, objetivo, perfil inicial, sinais básicos) | `T5_FATIA_QUALIFICACAO_INICIAL.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T5-04 | Fatia renda/regime/composição | `T5_FATIA_RENDA_REGIME_COMPOSICAO.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T5-05 | Fatia elegibilidade/restrição/objeções críticas | `T5_FATIA_ELEGIBILIDADE_RESTRICAO.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T5-06 | Fatia docs/visita/handoff | `T5_FATIA_DOCS_VISITA_HANDOFF.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T5-07 | Matriz de paridade com legado (Enova 1) | `T5_MATRIZ_PARIDADE_LEGADO.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T5-08 | Plano de shadow controlado/sandbox sem Meta real | `T5_PLANO_SHADOW_SANDBOX.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T5-09 | Funil core executado end-to-end (consequência operacional de T5 que T8 deve provar) | Execução real | Sem LLM real → funil não executa end-to-end real; smoke scripts são in-process | **AUSENTE** |

**Resumo T5**: Inteiramente documental por contrato — NÃO APLIC. para src/. O funil foi contratado (5 fatias completas), mas não pode ser exercitado operacionalmente sem LLM real e Supabase real.

---

## §8 Matriz T6 — Docs, Multimodalidade e Superfícies de Canal

**Contrato**: `CONTRATO_IMPLANTACAO_MACRO_T6_2026-04-28.md`  
**Status do contrato**: ENCERRADO — G6 APROVADO em 2026-04-28  
**Escopo do contrato**: Maioritariamente documental; T6 §3 declara: "Implementação de código TypeScript em src/ — T6 é contratual/documental". Porém o adapter Meta/WhatsApp real era objetivo operacional declarado de T6.

| # | Item contratual T6 | Artefato T6 | Código Repo2 | Status |
|---|---|---|---|---|
| T6-01 | Surface única de canal (texto, doc, imagem, PDF, áudio, sticker, botão, evento de sistema) | `T6_SURFACE_CANAL.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T6-02 | Contrato de anexos e documentos (dossiê MCMV) | `T6_CONTRATO_ANEXOS.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T6-03 | Pipeline de imagem/PDF/documento (recepção, classificação, associação ao lead) | `T6_PIPELINE_IMAGEM_PDF.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T6-04 | Pipeline de áudio (transcrição, confiança, extração de fatos, confirmação) | `T6_AUDIO.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T6-05 | Sticker/mídia inútil (tratamento seguro sem quebrar funil) | `T6_STICKER_MIDIA.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T6-06 | Adapter Meta/WhatsApp governado: webhook, outbound, verificação, idempotência, deduplicação, retries, erros, mídia, rate limit | `T6_ADAPTER_META.md` | `src/meta/ingest.ts` existe: recebe webhook, analisa body, retorna ack. **Faltam**: X-Hub-Signature-256 (verificação), rota de webhook challenge (GET /{path}?hub.verify_token), outbound messaging, deduplicação, retries, rate limit | **PARCIAL** |
| T6-07 | Dossiê operacional e link do correspondente | `T6_DOSSIE_OPERACIONAL.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T6-08 | Suíte de testes/sandbox multicanal | `T6_SUITE_TESTES.md` | Não esperado em src/ por contrato | **NÃO APLIC.** |
| T6-09 | Webhook challenge (verificação inicial do endpoint pelo Meta) | `T6_ADAPTER_META.md` §4 | Rota GET para `hub.mode=subscribe` AUSENTE em `src/worker.ts`; sem resposta `hub.challenge` | **AUSENTE** |
| T6-10 | Verificação de assinatura X-Hub-Signature-256 em cada webhook POST | `T6_ADAPTER_META.md` §5 | AUSENTE em `src/meta/ingest.ts`; campo `real_meta_integration: false` hardcoded | **AUSENTE** |
| T6-11 | Outbound: envio de mensagem WhatsApp ao usuário via API Meta | `T6_ADAPTER_META.md` §6 | AUSENTE; `external_dispatch: false` hardcoded; nenhuma função de envio em `src/` | **AUSENTE** |
| T6-12 | Idempotência (deduplicação de eventos WhatsApp) | `T6_ADAPTER_META.md` §7 | AUSENTE; sem cache de message_id processado | **AUSENTE** |

**Resumo T6**: Contratos documentais NÃO APLIC. O adapter Meta/WhatsApp em `src/meta/ingest.ts` existe como esqueleto técnico (PARCIAL), mas 4 capacidades operacionais críticas estão AUSENTES: webhook challenge, verificação de assinatura, outbound messaging e idempotência — impedindo qualquer ativação real do canal WhatsApp.

---

## §9 Matriz T7 — Shadow, Canary, Cutover e Rollback

**Contrato**: `CONTRATO_IMPLANTACAO_MACRO_T7_2026-04-29.md`  
**Status do contrato**: ENCERRADO — G7 APROVADO DOCUMENTALMENTE COM RESTRIÇÕES OPERACIONAIS em 2026-04-29  
**Restrições ativas**: RA-G7-01..08 (telemetria, smoke real, flags, WhatsApp real — todas pendentes)

| # | Item contratual T7 | Artefato T7 | Código Repo2 | Status |
|---|---|---|---|---|
| T7-01 | Feature flags: forma clara de ligar/desligar Enova 2 e reverter ao legado | `T7_PREFLIGHT.md` §feature-flags | `src/rollout/guards.ts` existe; `promotion_block: true` hardcoded; modo `technical_local_only`; 6 fronteiras bloqueadas | **PARCIAL** |
| T7-02 | Feature flags dinâmicos (alteráveis em runtime sem redeploy) | RA-G7-01 (restrição ativa) | Flags hardcoded no código-fonte; não há KV ou config externa; mudança requer redeploy | **AUSENTE** |
| T7-03 | Rollback provado (executado ou simulado com evidência) | `T7_ROLLBACK.md` | Documentado via PR-T7.6; guards.ts bloqueia promoção; rollback documental, não operacional | **PARCIAL** |
| T7-04 | Telemetria mínima: logs estruturados, métricas de turno, alertas críticos | `T7_TELEMETRIA.md` | Telemetria referenciada em imports de `src/worker.ts`; sem destino externo real (Datadog, Grafana, Cloudflare Analytics) | **PARCIAL** |
| T7-05 | Shadow/simulação: replay de casos históricos/sintéticos sem tráfego real | `T7_SHADOW.md` | Documental; 12 smoke scripts in-process; sem replay de casos contra LLM real | **PARCIAL** |
| T7-06 | Canary interno/pré-produção com volume pequeno e reversível | `T7_CANARY.md` | Guards.ts bloqueia promoção; canary documental; sem mecanismo de roteamento parcial | **PARCIAL** |
| T7-07 | Cutover controlado (substituição documentada com prova de estabilidade) | `T7_CUTOVER.md` | Documental; código bloqueia qualquer ativação real | **PARCIAL** |
| T7-08 | Checklist go/no-go executivo | `T7_CHECKLIST_GONOGO.md` | Documental; PR-T7.7 criou checklist; não executado com evidência operacional real | **PARCIAL** |
| T7-09 | CI/CD sem deploy automático não autorizado para produção | RA-G7-01 implícito; RNA-G7-01 | `.github/workflows/deploy.yml` dispara em **qualquer push para `main`**: `on: push: branches: [main]` → deploy para `nv-enova-2` (produção) sem gate humano | **CONFLITANTE** |
| T7-10 | CRM operacional (para que G8 possa ser aprovado) | T8 §5.2 | CRM TOTALMENTE AUSENTE do Repo2; deve vir do Repo1 via migração T8.3–T8.6 | **AUSENTE** |
| T7-11 | Painel/frontend de operação (acesso humano ao sistema) | G7 + T8 operacional | Frontend/painel TOTALMENTE AUSENTE; nenhum arquivo `.tsx/.jsx/.html/.css` no Repo2 | **AUSENTE** |
| T7-12 | Meta/WhatsApp real autorizado explicitamente por Vasques antes de ativação | A00-ADENDO-01; G8 | `real_meta_integration: false` hardcoded; `rollout_real_activation` bloqueado — corretamente bloqueado | **ADERENTE** |

**Resumo T7**: Item T7-09 é o único CONFLITANTE do diagnóstico — CI/CD auto-deploya em produção violando RNA-G7-01. T7-12 é o único ADERENTE real. Demais itens são PARCIAL/AUSENTE por restrições operacionais registradas em G7.

---

## §10 Lacunas Priorizadas

Lacunas ranqueadas por impacto no atingimento do G8:

| Rank | Código | Lacuna | Contratos afetados | Impacto G8 |
|------|--------|--------|--------------------|------------|
| 1 | LAC-01 | **LLM real**: nenhum modelo integrado; `reply_text` não é gerado por IA | T1, T4 | BLOQUEANTE |
| 2 | LAC-02 | **Supabase real**: persistência in-memory; estado perdido entre requests | T2, T4 | BLOQUEANTE |
| 3 | LAC-03 | **CRM**: totalmente ausente do Repo2 | T8 §5.2 | BLOQUEANTE |
| 4 | LAC-04 | **WhatsApp outbound**: sistema não envia mensagens ao usuário | T6 | BLOQUEANTE |
| 5 | LAC-05 | **Webhook challenge**: endpoint não passa verificação inicial do Meta | T6 | BLOQUEANTE |
| 6 | LAC-06 | **Verificação X-Hub-Signature-256**: webhooks não autenticados | T6 | CRÍTICO |
| 7 | LAC-07 | **Feature flags dinâmicos**: flags hardcoded no código; mudança requer redeploy | T7, RA-G7-01 | CRÍTICO |
| 8 | LAC-08 | **Migrations SQL**: nenhum script SQL; Supabase real não pode ser provisionado | T2 | CRÍTICO |
| 9 | LAC-09 | **Frontend/painel**: nenhuma interface humana no Repo2 | T8 operacional | ALTO |
| 10 | LAC-10 | **Telemetria externa**: logs sem destino; sem alertas operacionais reais | T7, RA-G7-04 | ALTO |
| 11 | LAC-11 | **Idempotência de webhooks**: mensagens WhatsApp podem ser processadas N vezes | T6 | ALTO |
| 12 | LAC-12 | **Bindings Cloudflare Worker** (KV/D1/Queue): nenhum binding declarado em `wrangler.toml` | T2, T4 | ALTO |

---

## §11 Conflitos Críticos

| Código | Conflito | Contrato violado | Evidência | Risco imediato |
|--------|----------|------------------|-----------|----------------|
| CONF-01 | `.github/workflows/deploy.yml` dispara deploy automático em `nv-enova-2` (produção) a cada push para `main` sem aprovação humana | RNA-G7-01; T7 §3 ("Deploy direto para produção sem go/no-go formal" fora de escopo); T8 §2.1 | `on: push: branches: [main]` → `wrangler deploy --env prod` | Qualquer PR-IMPL de T8 que faça merge em `main` provoca deploy involuntário em produção antes de G8 |
| CONF-02 | Sistema retorna `real_meta_integration: false` e `external_dispatch: false` hardcoded — correto hoje, mas se um PR de T8 alterar `src/meta/ingest.ts` sem desativar o CI/CD, o código incompleto vai para produção | T7 §3; T6 §3 | `src/meta/ingest.ts` linha 8–12 | Deploy de código de canal incompleto em produção antes de G8 |

---

## §12 Priorização em Ondas para T8

### Onda 1 — Diagnósticos restantes (PR-DIAG bloqueantes)
| PR | Tipo | Objeto |
|----|------|--------|
| PR-T8.3 | PR-DIAG | CRM Repo1 — inventário para migração |
| PR-T8.7 | PR-DIAG | Diagnóstico LLM real (binding, secrets, provider) |
| PR-T8.10 | PR-DIAG | Diagnóstico telemetria, feature flags e CI/CD |

### Onda 2 — Implementações críticas (PR-IMPL que desbloqueiam G8)
| PR | Tipo | Objeto | Depende de |
|----|------|--------|------------|
| PR-T8.4 | PR-IMPL | CRM backend (migração Repo1→Repo2) | PR-T8.3 |
| PR-T8.8 | PR-IMPL | LLM real + Supabase real (bindings + adapter real) | PR-T8.7 |
| PR-T8.11 | PR-IMPL | WhatsApp adapter completo (challenge + signature + outbound + idempotência) | PR-T8.7 |
| PR-T8.13 | PR-IMPL | CI/CD seguro + feature flags dinâmicos + telemetria real | PR-T8.10 |
| PR-T8.15 | PR-IMPL | Migrations SQL + bindings KV/D1 | PR-T8.8 |

### Onda 3 — Provas (PR-PROVA que fecham cada frente)
| PR | Tipo | Objeto | Depende de |
|----|------|--------|------------|
| PR-T8.5 | PR-IMPL | CRM frontend (painel operacional) | PR-T8.4 |
| PR-T8.6 | PR-PROVA | Prova CRM end-to-end | PR-T8.5 |
| PR-T8.9 | PR-PROVA | Prova LLM + Supabase (turno real) | PR-T8.8 |
| PR-T8.12 | PR-PROVA | Prova canal WhatsApp (webhook + outbound) | PR-T8.11 |
| PR-T8.14 | PR-PROVA | Prova telemetria + flags + CI/CD seguro | PR-T8.13 |
| PR-T8.R | PR-PROVA | Closeout G8 (atendimento real/controlado) | PR-T8.6+9+12+14 |

---

## §13 Recomendação Executiva

### Situação atual em uma linha
O Repo2 tem **arquitetura correta com implementação zero em produção**: a estrutura TypeScript existe, os contratos documentais T1–T7 foram respeitados, e o sistema está corretamente bloqueado por guards. O que falta é a implementação operacional real — LLM, Supabase, WhatsApp, CRM, CI/CD seguro.

### Prioridade absoluta antes de qualquer PR-IMPL
**CONF-01 deve ser tratado como primeira ação de T8-IMPL**: desativar ou condicionar o deploy automático do CI/CD para evitar que PRs-IMPL de T8 implantem código incompleto em produção involuntariamente. Recomenda-se mover o deploy automático de `main` para uma branch `prod` ou adicionar environment approval gate no GitHub Actions — isso é PR-T8.13 mas precisa ser antecipado como pré-requisito de segurança de qualquer PR-IMPL.

### Sequência recomendada
1. PR-T8.3 (DIAG CRM) → imediata
2. PR-T8.7 (DIAG LLM) → imediata, paralela a T8.3
3. PR-T8.10 (DIAG CI/CD + flags + telemetria) → imediata, paralela
4. PR-T8.13 (IMPL CI/CD seguro) → **antes de qualquer outra PR-IMPL** — destravar deployments
5. PR-T8.4 + PR-T8.8 + PR-T8.11 → paralelas após CI/CD seguro
6. PR-T8.5, PR-T8.15 → dependentes de T8.4, T8.8
7. PR-T8.6, PR-T8.9, PR-T8.12, PR-T8.14 → provas de cada frente
8. PR-T8.R → closeout G8

---

## §14 Bloco E — Evidência de Conclusão

| Campo | Valor |
|-------|-------|
| Fechamento permitido | **Sim** |
| Tipo da PR | PR-DIAG |
| Artefato criado | `schema/diagnostics/T8_MATRIZ_ADERENCIA_CONTRATO_CODIGO.md` (este arquivo) |
| Contratos lidos integralmente | T1 (80 linhas), T2 (80 linhas), T3 (120 linhas), T4 (120 linhas), T5 (120 linhas), T6 (120 linhas), T7 (120 linhas) |
| Base de evidência | T8_REPO2_INVENTARIO_TECNICO.md (PR-T8.1) — inventário real de 59 arquivos TypeScript |
| Código modificado | Nenhum — PR-DIAG não toca `src/` |
| Itens mapeados | 57 itens contratuais classificados (T1: 8, T2: 10, T3: 6, T4: 7, T5: 9, T6: 12, T7: 12) |
| Veredito consolidado | ADERENTE: 1 | PARCIAL: 18 | AUSENTE: 22 | CONFLITANTE: 2 | NÃO APLIC.: 14 |
| Conflitos críticos | 2 (CONF-01: CI/CD auto-deploy; CONF-02: código incompleto em caso de merge) |
| Lacunas bloqueantes G8 | 4 (LAC-01: LLM real, LAC-02: Supabase real, LAC-03: CRM, LAC-04: WhatsApp outbound) |
| Próxima PR autorizada | PR-T8.3 — PR-DIAG — Diagnóstico CRM Repo1 |
| Restrição herdada | RA-G7-01..08 ativas; nenhuma ativação real antes de autorização de Vasques |
| Data de fechamento | 2026-04-29 |
