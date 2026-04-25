# IMPLANTACAO_MACRO_LLM_FIRST_STATUS

## Estado atual

Fase macro ativa: T4 — Orquestrador de turno LLM-first (contrato aberto; PR-T4.1 desbloqueada).

Gate anterior: G3 — APROVADO em 2026-04-25 via PR-T3.R.

Gate aberto: G4 — orquestrador funcional (bloqueado até PR-T4.R).

Contrato ativo: `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` (aberto — PR-T4.0 executada em 2026-04-25).

Contrato T3 encerrado: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T3_2026-04-25.md`.

Contrato T2 encerrado: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T2_2026-04-24.md`.

Contrato T1 encerrado: `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T1_2026-04-23.md`.

Base soberana: `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

## Ultima tarefa relevante

`PR-T4.0` — Abertura formal do contrato T4 (Orquestrador de turno LLM-first):
`schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` preenchido com corpo completo
(§1–§17 + Bloco E): objetivo do orquestrador de turno; shapes TurnoEntrada e TurnoSaida;
pipeline 8 etapas; 10 critérios de aceite CA-01..CA-10; quebra de PRs T4.0–T4.R;
gate G4 definido; fallbacks documentados; Bloco E aplicado. PR-T4.1 desbloqueada.

`PR-T3.R` — Readiness/Closeout de G3 (anteriormente):
`schema/implantation/READINESS_G3.md` criado: smoke documental S1–S5 (5/5 PASS);
coerência verificada em 11 dimensões; cenários sintéticos V1/V2/V3 (3/3 PASS);
critérios CA-01..CA-10 (10/10 CUMPRIDOS); zero lacunas bloqueantes; 5 lacunas
não bloqueantes (LNB-01..05) declaradas e justificadas. G3 APROVADO.
Contrato T3 ENCERRADO e arquivado. Skeleton T4 criado. PR-T4.0 desbloqueada.

## O que a PR-T3.R fechou

- Criou `schema/implantation/READINESS_G3.md` com:
  - §1 Smoke documental S1–S5 — 5/5 PASS (T3_CLASSES, T3_REGRAS_CRITICAS, T3_ORDEM,
    T3_VETO_SUAVE, T3_SUITE_TESTES);
  - §2 Coerência verificada em 11 dimensões (classes↔regras, fact_keys↔dicionário,
    política_confiança↔disparo, pipeline↔prioridade, colisões↔regras, PolicyDecisionSet,
    ValidationContext↔lead_state, cobertura_cruzada, LLM-first, soberania_LLM, MCMV);
  - §3 Cenários sintéticos V1/V2/V3 (4 regras simultâneas, validador VC-09, RC-INV-03) — 3/3 PASS;
  - §4 Critérios de aceite CA-01..CA-10 — 10/10 CUMPRIDOS;
  - §5 Lacunas: zero bloqueantes; 5 não bloqueantes (LNB-01..05) declaradas e justificadas;
  - §6 Decisão formal G3 APROVADO;
  - §7 Encerramento de contrato T3 (checklist CONTRACT_CLOSEOUT_PROTOCOL);
  - §8 Skeleton T4; §9 Conformidade com adendos; Bloco E.
- Arquivou contrato T3 em `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T3_2026-04-25.md`.
- Criou skeleton T4 em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md`.
- Atualizou `schema/contracts/_INDEX.md`: T3 encerrado/arquivado; T4 skeleton ativo; PR-T4.0 próximo passo.

## O que a PR-T3.R nao fechou

- Não abriu T4 com corpo (skeleton criado — PR-T4.0 preencherá).
- Não implementou orquestrador de turno.
- Não alterou `src/`, `package.json`, `wrangler.toml`.
- G4 não aberto.

## O que a PR-T2.R fechou

- Criou `schema/implantation/READINESS_G2.md` com:
  - §1 Smoke documental PR-T2.0 a PR-T2.5 — 6/6 PASS;
  - §2 Verificação de coerência em 8 dimensões (dict↔lead_state↔política↔reconciliação↔resumo;
    nomes canônicos; separação tipos; LLM-first; snapshot≠lead_state; sobrescrita silenciosa;
    inferência≠confirmed; E1≠arquitetura);
  - §3 Cenários sintéticos V1/V2/V3 (conflito origem, áudio ruim, snapshot vs. fact) — 3/3 PASS;
  - §4 Verificação dos 8 critérios de aceite do contrato T2 — 8/8 CUMPRIDOS;
  - §5 Lacunas identificadas: 5 não bloqueantes declaradas com justificativa; zero bloqueantes;
  - §6 Decisão formal G2 APROVADO;
  - §7 Encerramento de contrato T2 (checklist CONTRACT_CLOSEOUT_PROTOCOL);
  - §8 Bloco E: fechamento permitido; PR-T3.0 desbloqueada.
- Arquivou contrato T2 em `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T2_2026-04-24.md`.
- Atualizou status do contrato T2 ativo para ENCERRADO.
- Criou skeleton T3 em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md`.
- Atualizou `schema/contracts/_INDEX.md`: T2 encerrado/arquivado; T3 skeleton ativo; PR-T3.0 próximo passo.

## O que a PR-T2.R nao fechou

- Contrato T3 com corpo (PR-T3.0 preencherá).
- Nenhuma implementação T3 (policy engine real, regras, guardrails).
- G3 não aberto.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.

## O que a PR-T2.5 fechou

`PR-T2.5` — resumo persistido + compatibilidade E1→E2: `schema/implantation/T2_RESUMO_PERSISTIDO.md`
criado com 4 camadas de memória (L1 curto prazo / L2 factual estruturada / L3 snapshot executivo /
L4 histórico frio); protocolo de snapshot com 7 eventos de trigger, shape completo SnapshotExecutivo,
o que entra/não entra; 7 regras anti-contaminação (RC-AN-01..07); memória Vasques (RV-01..07);
aprendizado sem script (RA-01..05); tabela E1→E2 (27 campos + 7 descartados + stages);
10 casos sintéticos SP-01..SP-10; 12 anti-padrões AP-RP-01..12; 10 regras RP-01..10.
PR-T2.R desbloqueada.

## O que a PR-T2.5 fechou

- Criou `schema/implantation/T2_RESUMO_PERSISTIDO.md` com:
  - §1 Quatro camadas de memória (L1/L2/L3/L4) com definições, limites e regras;
  - §2 Protocolo de snapshot: 7 eventos de trigger, o que entra/não entra, shape completo
    SnapshotExecutivo com `approval_prohibited = true` invariante;
  - §3 Regras anti-contaminação de facts (RC-AN-01..07) + hierarquia de precedência de leitura;
  - §4 Memória Vasques — 4 tipos, 7 regras de limite e auditabilidade (RV-01..07);
  - §5 Aprendizado por atendimento — 5 regras RA-01..05, como existe sem virar script;
  - §6 Compatibilidade transitória E1→E2: 7 princípios (RB-01..07), tabela 27 campos,
    7 campos descartados, tabela de stages E1→current_phase E2, como preservar sem manter vício;
  - §7 Cobertura das 5 microetapas do mestre (§4 e §5 cobertas aqui);
  - §8 10 casos sintéticos SP-01..SP-10 (conversa longa, retorno tardio, snapshot conflitante,
    campo sem equivalente E2, campo derivável, L4 auditoria, Vasques prioridade, aprendizado,
    resumo com aprovação bloqueada, migração sem vício);
  - §9 12 anti-padrões AP-RP-01..AP-RP-12;
  - §10 10 regras invioláveis RP-01..RP-10;
  - §11 Amarração ao lead_state v1 e artefatos T2;
  - §12 Bloco E: fechamento permitido; PR-T2.R desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR atual → PR-T2.5 executada; próximo passo PR-T2.R.

## O que a PR-T2.5 nao fechou

- READINESS_G2.md — smoke documental de todos os 6 artefatos T2 e decisão formal G2 — escopo PR-T2.R.
- Nenhuma implementação Supabase real.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- G2 não fechado (requer PR-T2.R).

## O que a PR-T2.4 fechou

- Criou `schema/implantation/T2_RECONCILIACAO.md` com:
  - §1 Tipologia formal de 7 estados com definições e regras internas;
  - §2 Protocolo de reconciliação em 7 etapas com fluxograma ASCII;
  - §3 Hierarquia de prioridade por origem (não automática);
  - §4 10 domínios específicos de reconciliação (renda, estado civil, regime de trabalho,
    composição/P2, IR autônomo, restrição, RNM, áudio ruim, nota Vasques vs confirmed,
    documento ilegível);
  - §5 10 casos sintéticos RC-01..RC-10 com passo a passo;
  - §6 Tabela completa de transições de status com condições e autoridade;
  - §7 12 anti-padrões AP-01..AP-12;
  - §8 10 regras invioláveis RC-01..RC-10;
  - §9 Mapeamento ao lead_state v1 e política de confiança;
  - §10 Bloco E: fechamento permitido; PR-T2.5 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR atual → PR-T2.4 executada; próximo passo PR-T2.5.

## O que a PR-T2.4 nao fechou

- T2_RESUMO_PERSISTIDO.md — escopo T2.5.
- Nenhuma implementação Supabase real.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- G2 não fechado.

## O que a PR-T2.3 fechou

- Criou `schema/implantation/T2_POLITICA_CONFIANCA.md` com:
  - 6 origens canônicas cobertas: texto explícito, texto indireto, áudio (3 níveis), documento,
    inferência (mecânica + LLM), nota manual Vasques;
  - Mapa de transição de status por origem (§4 — tabela);
  - Lista canônica de 12 fatos críticos (§5);
  - Condições de confirmação obrigatória (§6 — 7 situações);
  - Condições de geração de conflito (§7 — com proibição de conflito silencioso);
  - Condições de bloqueio de avanço de stage (§8 — 6 condições);
  - 9 valores canônicos de `FactEntry.source` (§9.1);
  - 5 casos sintéticos de validação (§10: S1–S5);
  - Amarração ao lead_state v1 (§11);
  - 12 regras invioláveis PC-01..PC-12;
  - Cobertura das 5 origens do mestre + Vasques (§13);
  - Bloco E: fechamento permitido; PR-T2.4 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR atual → PR-T2.3 executada; próximo passo PR-T2.4.

## O que a PR-T2.3 nao fechou

- Reconciliação formal e mecanismo de resolução de conflito — escopo T2.4.
- Tipologia detalhada bruto/confirmado/hipótese/pendência no lead_state — escopo T2.4.
- T2_RESUMO_PERSISTIDO.md — escopo T2.5.
- Nenhuma implementação Supabase real.
- Nenhuma alteração em `src/`, `package.json`, `wrangler.toml`.
- G2 não fechado.

## O que a PR-T2.2 fechou

- Criou `schema/implantation/T2_LEAD_STATE_V1.md` com:
  - 11 blocos canônicos: CaseMeta, OperationalState (11 campos do mestre PDF6), FactBlock (35 fact_*
    por grupo I–X com status canônicos), DerivedBlock (9 derived_* com condições de derivação),
    Pending (6 PEND_* tipos), Conflicts (4 CONF_* tipos + protocolo de resolução), SignalBlock (6
    signal_*), HistorySummary (4 camadas + shape snapshot executivo), VasquesNotes (shape auditável),
    NormativeContext (referência compartilhada);
  - 12 regras invioláveis LS-01..LS-12;
  - Tabela de mapeamento campo ↔ fato canônico ↔ regra T0;
  - Tabela de compatibilidade transitória E1→E2;
  - Bloco E: fechamento permitido; PR-T2.3 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR atual → PR-T2.2; próximo passo PR-T2.3.

## O que a PR-T2.2 nao fechou

- Não criou T2_POLITICA_CONFIANCA.md (política de confiança por origem — escopo T2.3).
- Não detalhando tipologia completa bruto/confirmado/hipótese/pendência (escopo T2.4).
- Não criou T2_RESUMO_PERSISTIDO.md (escopo T2.5).
- Não implementou Supabase real.
- Não alterou `src/`, `package.json`, `wrangler.toml`.

## O que a PR-T2.1 fechou

- Criou `schema/implantation/T2_DICIONARIO_FATOS.md` com:
  - 50 chaves canônicas: 35 `fact_*`, 9 `derived_*`, 6 `signal_*`;
  - Auditoria E1→E2 completa (42 campos): renomeados, eliminados como primários, rebaixados a derived/signal;
  - 7 categorias de memória (atendimento, normativa/MCMV, comercial, manual Vasques, regras funil, aprendizado, telemetria);
  - Limites LLM-first por categoria + 10 regras invioláveis (M-01..M-10);
  - Tabela E1→E2 consolidada (§5);
  - Cobertura das 5 microetapas do mestre declarada;
  - Bloco E: fechamento permitido; PR-T2.2 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: T2 → em execução; próximo passo PR-T2.2.

## O que a PR-T2.1 nao fechou

- Não criou T2_LEAD_STATE_V1.md (schema estrutural — escopo T2.2).
- Não implementou Supabase real.
- Não alterou `src/`, `package.json`, `wrangler.toml`.
- Tipologia completa de status do fato (bruto/confirmado/inferência/hipótese/pendência) em T2.4.

## O que a PR-T2.0 fechou

- Preencheu `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md` com corpo completo (CONTRACT_SCHEMA.md):
  - §1 Objetivo; §2 Escopo; §3 Fora de escopo; §4 Dependências; §5 Entradas; §6 Saídas;
  - §7 Critérios de aceite (8 verificáveis); §8 Provas obrigatórias; §9 Bloqueios (8 condições);
  - §10 Próximo passo; §11 Relação A01; §12 Relação legados; §13 Referências; §14 Blocos legados;
  - §15 Ordem mínima de leitura; §16 Quebra de PRs T2.0–T2.R; §17 Gate G2.
  - Adendos A00-ADENDO-01/02/03 declarados.
- Atualizou `schema/contracts/_INDEX.md`: T2 aberto; PR-T2.1 próximo passo.
- Bloco E: fechamento permitido; PR-T2.1 desbloqueada.

## O que a PR-T2.0 nao fechou

- Não criou artefatos de execução T2 (T2_DICIONARIO_FATOS, T2_LEAD_STATE_V1, etc.) — esses são escopo T2.1+.
- Não implementou Supabase real.
- Não alterou `src/`, `package.json`, `wrangler.toml`.

## O que a PR-T1.R fechou

- Criou `schema/implantation/READINESS_G1.md` com:
  - Smoke documental de PR-T1.0 a PR-T1.5 — 6/6 PASS;
  - Verificação dos 12/12 critérios de aceite do contrato T1 com evidência por critério;
  - Validação de coerência entre artefatos em 5 dimensões: camadas↔system prompt, taxonomia↔contrato
    de saída, comportamentos↔contrato de saída, comportamentos↔camadas, regras T0↔taxonomia↔camadas;
  - Verificação dos adendos A00-ADENDO-01/02/03 em todos os artefatos T1;
  - 4 lacunas identificadas e classificadas como não bloqueantes (L18 não transcrito; runtime
    não testado; TurnoSaida sem schema concreto; 32 casos vs. "20-30" — supera o mínimo);
  - 3 casos sintéticos cobrindo 3 dimensões: estilo (aprovação), regra (casado civil), saída (conflito IR);
  - Decisão formal G1 APROVADO com justificativa;
  - Bloco E: fechamento permitido; PR-T2.0 desbloqueada.
- Encerrou contrato T1 via CONTRACT_CLOSEOUT_PROTOCOL.md: checklist completo; critérios cumpridos; evidências declaradas.
- Arquivou contrato T1 em `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T1_2026-04-23.md`.
- Criou skeleton T2 em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md`.
- Atualizou `schema/contracts/_INDEX.md`: T1 encerrado/arquivado; T2 skeleton ativo; PR-T2.0 próximo passo.

## O que a PR-T1.R nao fechou

- Nao abriu T2 com corpo completo (skeleton criado — PR-T2.0 preencherá).
- Nao implementou LLM real.
- Nao criou schema Supabase (escopo T2).
- Nao criou policy engine (escopo T3).
- Nao alterou `src/`, `package.json`, `wrangler.toml`.

## O que a PR-T4.0 fechou

- Preencheu `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` com corpo completo (CONTRACT_SCHEMA.md):
  - §1 Objetivo: orquestrador coordena, nunca fala; reply_text exclusivamente do LLM;
  - §2 Escopo: 6 saídas verificáveis (T4_ENTRADA, T4_PIPELINE_LLM, T4_VALIDACAO, T4_RESPOSTA,
    T4_FALLBACKS, READINESS_G4);
  - §3 Fora de escopo: src/, regras de política (T3), schema de estado (T2), speech, canais;
  - §4 Dependências: G3 APROVADO (desbloqueado) + 5 artefatos T3 + TurnoSaida T1;
  - §5 Entradas: TurnoEntrada shape + 5 artefatos de contexto;
  - §6 Saídas S1–S6 com caminho, PR criadora e conteúdo mínimo;
  - §7 Critérios de aceite CA-01..CA-10 (orquestrador mudo, entrada padronizada, LLM único,
    policy integrado, validador pós-LLM, reconciliação antes de persistir, rastro, fallbacks,
    ≥10 E2E, Bloco E em G4);
  - §8 Provas P-T4-01..P-T4-05;
  - §9 Bloqueios B-01..B-05 (B-01/B-02 desbloqueados);
  - §10 Próximo passo: PR-T4.1;
  - §11 A01: T4 semanas 7–8, prioridade 5, G3→G4;
  - §12 Legados aplicáveis com PRs criadoras;
  - §13 Referências: 12 documentos;
  - §14 Blocos legados obrigatórios/complementares;
  - §15 Ordem mínima de leitura por PR;
  - §16 Quebra PRs T4.0–T4.R: 8 PRs com artefato/dependência/microetapa;
  - §17 Gate G4: condições aprovação/reprovação, consequências, artefato READINESS_G4.
  - Bloco E: PR-T4.1 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: T4 aberto; PR-T4.0 executada; PR-T4.1 próximo passo.

## O que a PR-T4.0 nao fechou

- Não criou T4_ENTRADA_TURNO.md (escopo T4.1).
- Não implementou orquestrador real em src/.
- Não alterou package.json, wrangler.toml.
- G4 não fechado.

## Proximo passo autorizado

PR-T4.1 — Padronização da entrada do turno (`T4_ENTRADA_TURNO.md`).

Leituras obrigatórias para PR-T4.1:
1. `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T4.md` (§5 entradas, §7 CA-01/CA-02)
2. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção K — PR-T4.1)
3. `schema/implantation/T1_CONTRATO_SAIDA.md` (TurnoSaida — shape canônico de saída)
4. `schema/implantation/T2_LEAD_STATE_V1.md` (lead_state que entra no turno)
5. `schema/implantation/T3_CLASSES_POLITICA.md` (classes que o pipeline usa)
6. `schema/implantation/READINESS_G3.md` (evidência de G3)
7. `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
8. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`
9. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`

## O que a PR-T3.3 fechou

- Criou `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` com:
  - §1 Visão geral do pipeline com 6 estágios numerados (reconciliação → bloqueios →
    confirmações → obrigações → sugestões → roteamentos);
  - §2 Especificação detalhada de cada estágio com pré-condições, regras candidatas,
    ordenação interna e saídas;
  - §3 Princípios canônicos de composição (RC-COMP-01..10) + matriz 5×5 entre classes +
    tabela de prioridade global + lista canônica de criticidade de fato (13 níveis) +
    regra de desempate residual;
  - §4 Oito combinações específicas detalhadas (bloqueio+obrigação, bloqueio+confirmação,
    bloqueio+roteamento, obrigação+confirmação, obrigação+sugestão, múltiplas obrigações,
    múltiplas confirmações, múltiplos roteamentos);
  - §5 Política de colisão com 10 códigos canônicos (COL-BLOCK-OBLIG, COL-BLOCK-ROUTE,
    COL-OBLIG-ROUTE, COL-CONF-ROUTE, COL-CONF-OBLIG, COL-ROUTING-MULTI, COL-OBLIG-OBLIG-PRIO,
    COL-CONF-CONF-LEVEL, COL-RECONCILE-FAIL, COL-INVALID-PHASE) + shape `CollisionRecord` +
    proibição absoluta de colisão silenciosa;
  - §6 Shape `PolicyDecisionSet` com `decisions[]`, `collisions[]`, `evaluation_meta` e
    invariantes;
  - §7 10 cenários sintéticos SC-01..10 (todos os exigidos pelo escopo: casado civil + solo +
    renda baixa, autônomo + IR ausente + renda baixa, estrangeiro sem RNM + outra regra,
    renda fraca + composição sugerida, P3 entrando depois de solo, restrição vs avanço,
    duas obrigações simultâneas, duas confirmações simultâneas, bloqueio + roteamento,
    sugestão competindo com obrigação);
  - §8 Validação cruzada com T3.1, T3.2 e T2 (classes, prioridade, regras críticas, chaves
    canônicas, status, OperationalState);
  - §9 12 anti-padrões AP-OC-01..12 (incluindo AP-OC-10: proibição de inventar regra nova
    nesta camada);
  - §10 Cobertura: microetapas 3 e 4 do mestre T3 cobertas; 1, 2 e 5 declaradas como escopo
    de outras PRs;
  - §11 12 regras invioláveis RC-INV-01..12 (incluindo RC-INV-08: autônomo sem IR não é
    inelegível automático; RC-INV-10: solo baixa nunca emite bloqueio nem seta inelegível);
  - Bloco E: PR-T3.3 fechada; PR-T3.4 desbloqueada.

## O que a PR-T3.3 nao fechou

- T3_VETO_SUAVE_VALIDADOR.md (microetapa 5 — escopo PR-T3.4).
- T3_SUITE_TESTES_REGRAS.md (escopo PR-T3.5).
- READINESS_G3.md (escopo PR-T3.R).
- Nenhuma implementação real em src/. Nenhuma alteração em package.json, wrangler.toml.
- G3 não fechado.

## O que a PR-T3.2 fechou

- Criou `schema/implantation/T3_REGRAS_CRITICAS_DECLARATIVAS.md` com:
  - §1 Tabela-resumo dos 4 regras com rule_id, fatos de entrada, classes emitidas e severidade;
  - §2 R_CASADO_CIVIL_CONJUNTO: fatos `fact_estado_civil` + `fact_process_mode`; 3 decisões
    (confirmação baixa confiança + obrigação); NUNCA emite bloqueio; efeito: `must_ask_now`;
  - §3 R_AUTONOMO_IR: fato `fact_work_regime_p1` + `fact_autonomo_has_ir_p1`; 3 variantes:
    obrigação (ausente), confirmação (parcial/não_informado), sugestão_mandatória ("não" — não
    automático inelegível); NUNCA declara inelegibilidade automática;
  - §4 R_SOLO_BAIXA_COMPOSICAO: fatos `fact_process_mode` + `fact_monthly_income_p1` +
    `derived_composition_needed`; INVARIANTE: NUNCA emite bloqueio; NUNCA seta
    `elegibility_status="ineligible"`; classes: sugestão_mandatória + obrigação;
  - §5 R_ESTRANGEIRO_SEM_RNM: fatos `fact_nationality` + `fact_rnm_status` + derivados;
    3 decisões graduais — confirmação (captured), obrigação (RNM ausente), bloqueio
    (somente quando `nationality.status="confirmed"` e RNM inválido); naturalizado excluído;
  - §6 Tabela de validação cruzada: 10 variantes × fato→classe→efeito;
  - §7 14 chaves canônicas verificadas contra T2_DICIONARIO_FATOS;
  - §8 10 anti-padrões AP-RC-01..10;
  - §9 10 regras invioláveis RC-INV-01..10;
  - §10 Cobertura de microetapas: microetapa 1 coberta; 2/3/4/5 delegadas;
  - Bloco E: PR-T3.2 fechada; PR-T3.3 desbloqueada.

## O que a PR-T3.2 nao fechou

- T3_ORDEM_AVALIACAO_COMPOSICAO.md (microetapas 3 e 4 — escopo PR-T3.3).
- T3_VETO_SUAVE_VALIDADOR.md (microetapa 5 — escopo PR-T3.4).
- T3_SUITE_TESTES_REGRAS.md (escopo PR-T3.5).
- Nenhuma implementação real em src/. Nenhuma alteração em package.json, wrangler.toml.
- G3 não fechado.

## O que a PR-T3.1 fechou

- Criou `schema/implantation/T3_CLASSES_POLITICA.md` com:
  - Shape `PolicyDecision` com invariante global (sem `reply_text` em nenhum payload de `action`);
  - §2 Classe BLOQUEIO: "bloquear avanço" formal; payload `BloqueioAction`; distinção de veto suave;
  - §3 Classe OBRIGAÇÃO: "exigir ação"; payload `ObrigacaoAction`; diferença de `blocked_by`;
  - §4 Classe CONFIRMAÇÃO: "pedir confirmação"; payload `ConfirmacaoAction`; distinção de obrigação;
  - §5 Classe SUGESTÃO MANDATÓRIA: "apenas orientar"; payload `SugestaoMandatoriaAction`;
  - §6 Classe ROTEAMENTO: "desviar objetivo"; payload `RoteamentoAction`; efeito no lead_state;
  - §7 Prioridade entre classes: bloqueio (1) > obrigação (2) > confirmação (3) > sugestão (4) > roteamento (5);
  - §8 Definições formais dos 4 efeitos operacionais (microetapa 2 do mestre T3 coberta);
  - §9 Integração com lead_state v1: 10 campos e quais classes os modificam;
  - §10 Integração com política de confiança: regras PC-INT-01..05;
  - §11 10 anti-padrões AP-CP-01..10;
  - §12 5 exemplos sintéticos (bloqueio/obrigação/confirmação/sugestão/roteamento);
  - §13 Cobertura de microetapas: microetapa 2 coberta; 1/3/4/5 delegadas;
  - §14 10 regras invioláveis CP-01..10;
  - Bloco E: fechamento PR-T3.1 permitido; PR-T3.2 desbloqueada.

## O que a PR-T3.1 nao fechou

- T3_REGRAS_CRITICAS_DECLARATIVAS.md (microetapa 1 — escopo PR-T3.2).
- T3_ORDEM_AVALIACAO_COMPOSICAO.md (microetapas 3 e 4 — escopo PR-T3.3).
- T3_VETO_SUAVE_VALIDADOR.md (microetapa 5 — escopo PR-T3.4).
- T3_SUITE_TESTES_REGRAS.md (escopo PR-T3.5).
- Nenhuma implementação real em src/. Nenhuma alteração em package.json, wrangler.toml.
- G3 não fechado.

## O que a PR-T3.0 fechou

- Preencheu `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T3.md` com corpo completo (CONTRACT_SCHEMA.md):
  - §1 Objetivo: policy engine decide mas não fala; 5 entregas ao final de T3;
  - §2 Escopo: 8 itens verificáveis (T3_CLASSES → T3_REGRAS → T3_ORDEM → T3_VETO → T3_SUITE → READINESS_G3);
  - §3 Fora de escopo: src/, orquestrador T4, Supabase real, reply_text no engine;
  - §4 Dependências: G2 APROVADO (desbloqueado) + T2 encerrado (desbloqueado) + 6 artefatos T2;
  - §5 Entradas: 8 artefatos de entrada com condições;
  - §6 Saídas: S1–S6 com caminho, PR criadora e conteúdo mínimo;
  - §7 Critérios de aceite: CA-01..CA-10 (LLM-first, 4 regras, ordem estável, veto suave, validador, ≥20 testes, coerência lead_state, microetapas);
  - §8 Provas: P-T3-01..P-T3-05;
  - §9 Bloqueios: B-01..B-05 (B-01 e B-02 desbloqueados);
  - §10 Próximo passo: PR-T3.1;
  - §11 A01: T3 semanas 5–6, prioridade 4, G2→G3;
  - §12 Legados: L03 obrigatório + 12 complementares com PR e contexto;
  - §13 Referências: 14 documentos;
  - §14 Blocos legados obrigatórios/complementares com quando consultar;
  - §15 Ordem mínima de leitura por PR;
  - §16 Quebra PRs T3.0–T3.R: 7 PRs com artefato/dependência/microetapa;
  - §17 Gate G3: condições aprovação/reprovação, consequências, artefato READINESS_G3.
  - Bloco E: PR-T3.1 desbloqueada.

## O que a PR-T3.0 nao fechou

- Não criou T3_CLASSES_POLITICA.md (escopo T3.1).
- Não implementou nenhuma regra ou classe de política.
- Não alterou src/, package.json, wrangler.toml.
- G3 não fechado.

## Mudancas em dados persistidos

Nenhuma.

## Permissoes Cloudflare

Nenhuma adicional.

## Bloqueios

- G1 APROVADO. G2 APROVADO. T3 aberta formalmente.
- G3 aberto — bloqueado até PR-T3.R (readiness de T3).
- PR-T3.1 desbloqueada. PRs T3.2–T3.R ainda bloqueadas.
- Qualquer ativacao real externa permanece bloqueada ate fase e contrato correspondentes.

## O que a PR-T1.3 fechou (historico)

- Criou `schema/implantation/T1_TAXONOMIA_OFICIAL.md` com 6 categorias canônicas (FACTS 18 tipos,
  OBJETIVOS 9, PENDÊNCIAS 6, CONFLITOS 4, RISCOS 8, AÇÕES 11); 48 regras T0 mapeadas; trava
  LLM-first verificada; PR-T1.4 desbloqueada.

## O que a PR-T1.2 fechou (historico)

- Criou `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` v1 com:
  - §1 Identidade (TOM): Enova — analista especialista Minha Casa Minha Vida, fala humana, nunca sistema;
  - §2 Papel operacional (REGRA): como o LLM recebe e usa contexto do mecânico sem expô-lo ao cliente;
  - §3 Proibições absolutas (VETO): 5 proibições declarativas sem templates de recusa;
  - §4 Condução em contextos específicos (SUGESTÃO MANDATÓRIA): 7 orientações de conduta sem scripts;
  - §5 Conhecimento especialista (REPERTÓRIO): substrato Minha Casa Minha Vida sem template de uso;
  - §6 Objetivo final: qualificar com inteligência, honestidade e naturalidade;
  - Tabela de conformidade seção × camada;
  - 7 anti-padrões explicitamente proibidos;
  - 6 cenários adversariais documentados sem execução de LLM real;
  - Cobertura de microetapas do mestre verificada;
  - Bloco E com fechamento permitido e PR-T1.3 desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`: PR-T1.2 concluída; PR-T1.3 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T1.3 como próximo passo.

## O que a PR-T1.1 fechou (historico)

- Criou `schema/implantation/T1_CAMADAS_CANONICAS.md` com:
  - fundamento normativo canônico (soberania LLM na fala; soberania mecânico na regra);
  - mapa de responsabilidades por camada (proprietário, competência, proibição);
  - definição completa de cada camada: TOM (LLM soberano), REGRA (mecânico soberano),
    VETO (mecânico emite flag, LLM comunica), SUGESTÃO MANDATÓRIA (mecânico instrui→LLM executa),
    REPERTÓRIO (substrato de contexto passivo do LLM);
  - anti-padrões e travas LLM-first por camada;
  - modelo de interação ASCII (mecânico→contexto→LLM→reply_text→canal);
  - classificação completa das 48 regras T0 com camada primária e secundária;
  - sumário: TOM 3, REGRA 28, VETO 8, SUGESTÃO MANDATÓRIA 8, REPERTÓRIO L19+L03;
  - cobertura das microetapas do LEGADO_MESTRE verificada;
  - Bloco E com fechamento permitido e PR-T1.2 desbloqueada.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`: PR-T1.1 concluída; PR-T1.2 desbloqueada.
- Atualizou `schema/contracts/_INDEX.md`: PR-T1.2 como próximo passo.

## Mudancas em dados persistidos

Nenhuma.

## Permissoes Cloudflare

Nenhuma adicional.

## Bloqueios

- PR-T1.2 desbloqueada. Demais PRs T1.3–T1.R ainda bloqueadas.
- Qualquer ativacao real externa permanece bloqueada ate fase e contrato correspondentes.

## O que a PR-T1.0 fechou (historico)

- Preencheu corpo formal de `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`:
  - objetivo, escopo, fora de escopo, dependências, entradas, saídas;
  - critérios de aceite (sistema LLM-first, bateria adversarial, soberania de fala);
  - provas obrigatórias;
  - bloqueios;
  - quebra de PRs T1.0–T1.R com artefatos definidos;
  - gate G1 com condições de aprovação e regra de rollback;
  - legados aplicáveis (L03/L19 obrigatórios; L04–L18 complementares);
  - referências obrigatórias (20 documentos);
  - ordem mínima de leitura: L19 → L03.
- Atualizou `schema/contracts/_INDEX.md`: contrato T1 aberto formalmente; PR-T1.1 desbloqueada.

## O que a PR-T0.R fechou (historico)

- Criou `schema/implantation/READINESS_G0.md` com:
  - smoke documental de PR-T0.1 a PR-T0.6: todos encerrados com Bloco E;
  - 6/6 criterios de aceite T0 cumpridos;
  - analise dos 7 bloqueantes G0: RZ-TM-01 e RZ-ES-04 satisfeitos; RZ-EL-01, RZ-EL-04,
    RZ-DC-02, RZ-TE-02, RZ-TE-03 declarados com escopo T1+;
  - verificacao de coerencia entre todos os inventarios;
  - 5 limitacoes residuais estruturais declaradas;
  - decisao formal G0 APROVADO COM LIMITACOES RESIDUAIS FORMALMENTE DECLARADAS;
  - encerramento de contrato conforme CONTRACT_CLOSEOUT_PROTOCOL.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - status `encerrado`; PR-T0.R marcada como concluida; T1 autorizada.
- Copiou contrato T0 para `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md`.
- Criou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md` (skeleton — sem corpo).
- Atualizou `schema/contracts/_INDEX.md`:
  - T0 encerrado/arquivado; T1 skeleton como proximo contrato ativo.

## O que a PR-T0.6 fechou (historico)

- Criou `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md` com:
  - 39 itens em 5 classificacoes: 7 DI (desligar imediato pre-T1), 5 RO (redesenho obrigatorio),
    6 CT (convivencia temporaria shadow/canary), 14 MD (migrar e desligar), 7 RC (reaproveitamento);
  - 7 criterios de desligamento canonicos (CDC-01 a CDC-07);
  - mapa de dependencias de fallback (EP/CT-01 → SF-02 → SF-01 → PH-F03);
  - referencia cruzada com MATRIZ_RISCO (PR-T0.5) por item onde aplicavel;
  - soberania LLM-first verificada: DS-DI-01 a DS-DI-07 classificados como imediatos/proibidos;
  - 7 categorias de inconclusivos declaradas (L17/L18 nao transcritos; nao bloqueiam PR-T0.6).
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`:
  - PR-T0.6 marcada como concluida; PR-T0.R desbloqueada.

## O que a PR-T1.0 nao fechou

- Nao escreveu prompt, taxonomia, comportamentos ou politicas (T1.1+).
- Nao implementou LLM real.
- Nao alterou runtime (`src/`, `package.json`, `wrangler.toml`).

## Proximo passo autorizado

PR-T1.1 — Separação canônica: tom × regra × veto × sugestão × repertório.

Leituras obrigatorias para PR-T1.1:
1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` (seção T1 + L19 + L03)
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

## Mudancas em dados persistidos

Nenhuma.

## Permissoes Cloudflare

Nenhuma adicional.

## Bloqueios

- T1 skeleton aberto. Execucao de T1 bloqueada ate PR-T1.0 preencher o corpo do contrato.
- Qualquer ativacao real externa permanece bloqueada ate fase e contrato correspondentes.

## Atualizacao 2026-04-23 — Abertura formal do contrato T1 (PR-T1.0)

Ultima tarefa relevante:
- `PR-T1.0` — contrato T1 preenchido conforme CONTRACT_SCHEMA.md; PR-T1.1 desbloqueada.

O que esta PR fechou:
- Preencheu corpo de `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`.
- Atualizou `schema/contracts/_INDEX.md`: contrato T1 aberto.

O que esta PR nao fechou:
- Nenhum entregavel tecnico de T1 (T1.1+). Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T1.1 — Separação canônica tom × regra × veto × sugestão × repertório.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.R (readiness e closeout do gate G0)

Ultima tarefa relevante:
- `PR-T0.R` — smoke documental de PR-T0.1 a PR-T0.6; G0 APROVADO; contrato T0 encerrado; T1 skeleton criado.

O que esta PR fechou:
- Criou `schema/implantation/READINESS_G0.md`.
- Encerrou contrato T0; arquivou em `archive/CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md`.
- Criou skeleton `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`.
- Atualizou `schema/contracts/_INDEX.md`: T0 encerrado, T1 skeleton ativo.

O que esta PR nao fechou:
- Nao abriu T1 com corpo. Nao implementou desligamento. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T1.0 — Abertura formal da fase T1.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.2 (inventario de regras por familia)

Ultima tarefa relevante:
- `PR-T0.2` — inventario de regras do legado em 7 familias canonicas; 48 regras com bloco legado e status.

O que esta PR fechou:
- Criou `schema/implantation/INVENTARIO_REGRAS_T0.md`.
- Atualizou contrato: PR-T0.2 concluida; PR-T0.3 desbloqueada.

O que esta PR nao fechou:
- Nao aprovou G0. Nao abriu T1. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T0.4 — Inventario de canais, superficies e telemetria.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.6 (inventario de desligamento futuro e convivencia)

Ultima tarefa relevante:
- `PR-T0.6` — 39 itens em 5 classificacoes; mapa de dependencias de fallback; 7 CDC canonicos.

O que esta PR fechou:
- Criou `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md`.
- Atualizou contrato: PR-T0.6 concluida; PR-T0.R desbloqueada.

O que esta PR nao fechou:
- Nao aprovou G0. Nao abriu T1. Nao implementou desligamento. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T0.R — Readiness e closeout do gate G0.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.5 (matriz de risco operacional do legado vivo)

Ultima tarefa relevante:
- `PR-T0.5` — 26 riscos em 5 categorias; 7 bloqueantes para G0; referencia cruzada PR-T0.1 a PR-T0.4.

O que esta PR fechou:
- Criou `schema/implantation/MATRIZ_RISCO_T0.md`.
- Atualizou contrato: PR-T0.5 concluida; PR-T0.6 desbloqueada.

O que esta PR nao fechou:
- Nao aprovou G0. Nao abriu T1. Nao implementou mitigacao. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T0.6 — Inventario de desligamento futuro e convivencia.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.4 (inventario de canais, superficies e telemetria)

Ultima tarefa relevante:
- `PR-T0.4` — 28 itens catalogados em 4 tipos (canal, superficie, endpoint, telemetria); bifurcacao
  E1/E2 aplicada; SF-03 fala mecanica classificada morta; fluxo de dados por canal consolidado.

O que esta PR fechou:
- Criou `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md`.
- Atualizou contrato: PR-T0.4 concluida; PR-T0.5 desbloqueada.

O que esta PR nao fechou:
- Nao aprovou G0. Nao abriu T1. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T0.5 — Matriz de risco operacional do legado vivo.

---

## Atualizacao 2026-04-23 — Encerramento de PR-T0.3 (inventario de parsers, heuristicas e branches de stage)

Ultima tarefa relevante:
- `PR-T0.3` — 27 pontos de decisao mecanica catalogados em 5 tipos; bloco legado e regra associada por item.

O que esta PR fechou:
- Criou `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md`.
- Atualizou contrato: PR-T0.3 concluida; PR-T0.4 desbloqueada.

O que esta PR nao fechou:
- Nao aprovou G0. Nao abriu T1. Nao alterou runtime.

Proximo passo autorizado (atualizado):
- PR-T0.4 — Inventario de canais, superficies e telemetria.

---

## Atualizacao 2026-04-23 — Adendo canônico A00-ADENDO-02 publicado

Ultima tarefa relevante:
- Governança macro — criar adendo canônico forte de soberania LLM-MCMV, amarrar à Bíblia, ao workflow e aos documentos vivos.

O que esta PR fechou:
- Criou `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02): identidade da Enova 2 como atendente especialista MCMV, visão LLM-first, divisão canônica LLM × mecânico, guia de leitura T1/T3/T4/T5/T6, proibições formais, reaproveitamento correto da E1.
- Inseriu o A00-ADENDO-02 na cadeia de precedência documental do `schema/CODEX_WORKFLOW.md`.
- Inseriu leituras obrigatórias A00-ADENDO-01 e A00-ADENDO-02 no `schema/CODEX_WORKFLOW.md` e na Bíblia.
- Criou seção S0 na Bíblia com travas LLM-first explícitas para T1, T3, T4, T5 e T6.
- Atualizou `schema/contracts/_INDEX.md`, `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` e `README.md`.

O que esta PR nao fechou:
- Nao executou o inventario legado vivo (T0-PR2 / PR-T0.1).
- Nao aprovou G0.
- Nao abriu T1.

Proximo passo autorizado (inalterado):
- `PR-T0.1` — inventario legado vivo e mapa de aproveitamento do repo contra o mestre.
- **A PR-T0.1 deve ler obrigatoriamente o A00-ADENDO-02 antes de executar.**

---

## Historico — Atualizacao 2026-04-23 — Workflow macro amarrado operacionalmente (PR anterior)

Ultima tarefa relevante (PR anterior):
- Governanca macro — amarrar operacionalmente no `schema/CODEX_WORKFLOW.md` a Biblia de PRs, templates obrigatorios, gates T0-T7/G0-G7 e regra de excecao contratual.

O que esta PR fechou:
- Inseriu no `schema/CODEX_WORKFLOW.md` a secao obrigatoria de leitura previa da PR macro.
- Inseriu no `schema/CODEX_WORKFLOW.md` a secao obrigatoria de abertura de PR via `schema/execution/PR_EXECUTION_TEMPLATE.md`.
- Inseriu no `schema/CODEX_WORKFLOW.md` a secao obrigatoria de fechamento com handoff via `schema/handoffs/PR_HANDOFF_TEMPLATE.md`.
- Inseriu no `schema/CODEX_WORKFLOW.md` a trava formal de excecao contratual com autorizacao manual exclusiva do Vasques.
- Inseriu no `schema/CODEX_WORKFLOW.md` a trava explicita de nao pular gates T0-T7/G0-G7.
- Inseriu no `schema/CODEX_WORKFLOW.md` a trava de nao misturar escopos e a checagem final obrigatoria de coerencia Biblia + contrato ativo + handoff vivo.

O que esta PR nao fechou:
- Nao executou o inventario legado vivo (T0-PR2).
- Nao aprovou G0.
- Nao abriu T1.

Proximo passo autorizado (inalterado):
- T0-PR2 — inventario legado vivo e mapa de aproveitamento do repo contra o mestre `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.

---

## Atualizacao 2026-04-23 — Internalizacao canonica do reaproveitamento ENOVA 1 (continuidade documental de PR-T0.1)

Ultima tarefa relevante:
- T0 (continuacao documental de `PR-T0.1`) — internalizar no proprio repo a classificacao executiva da base da ENOVA 1 para orientar reaproveitamento sem dependencia externa.

O que esta PR fechou:
- Criou `schema/implantation/T0_PR1_ENOVA1_REAPROVEITAMENTO_CANONICO.md` com consolidacao canônica interna de:
  - cognitivo util reaproveitavel;
  - mecanico estrutural util reaproveitavel;
  - mecanico de fala explicitamente proibido;
  - riscos de copia sem filtro;
  - blocos prioritarios da ENOVA 1 para absorcao futura.
- Atualizou referencia de evidencia em:
  - `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`;
  - `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (PR-T0.1).
- Reforcou diretriz de uso da E1 como materia-prima futura, sem refatoracao funcional agora.

O que esta PR nao fechou:
- Nao implementou memoria real, telemetria nova funcional nem migracao funcional da E1.
- Nao alterou runtime (`src/`, `package.json`, `wrangler.toml`).
- Nao fechou G0.

Proximo passo autorizado:
- Permanece em T0: continuidade de `PR-T0.1` / `T0-PR2` (inventario legado vivo).

---

## Atualizacao 2026-04-23 — Internalizacao canonica do inventario do legado vivo real da ENOVA 1 (continuidade documental de PR-T0.1)

Ultima tarefa relevante:
- T0 (continuacao documental de `PR-T0.1`) — internalizar no repositorio ENOVA 2 o inventario do legado vivo real da ENOVA 1, sem dependencia externa.

O que esta PR fechou:
- Criou `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` com:
  - objetivo e criterio de evidencia do inventario;
  - fluxos vivos reais;
  - stages/estados vivos reais;
  - gates vivos reais;
  - transicoes reais e ativas;
  - blocos inconclusivos;
  - blocos com padrao de residuo/stub/legado morto;
  - divergencias entre documentacao e runtime;
  - implicacoes para T0.1 e conclusao objetiva.
- Reforcou no recorte T0.1 que a internalizacao anterior de reaproveitamento e o novo inventario vivo real sao complementares.
- Atualizou referencias minimas em contrato ativo e Biblia para consolidacao de evidencia T0.1.

O que esta PR nao fechou:
- Nao implementou memoria real, telemetria nova funcional ou migracao funcional da E1.
- Nao alterou runtime (`src/`, `package.json`, `wrangler.toml`).
- Nao fechou G0 automaticamente.

Proximo passo autorizado:
- Permanece em T0: continuidade de `PR-T0.1` / `T0-PR2` (inventario legado vivo), com foco na preparacao de readiness de G0 sem abrir escopo funcional.

---

## Atualizacao 2026-04-23 — Inventario operacional auditavel de T0.1 (continuidade documental)

Ultima tarefa relevante:
- T0 (continuidade documental de `PR-T0.1`) — consolidar matriz de rastreabilidade de fluxos/estados e declarar lacuna remanescente sem fechamento indevido de gate.

O que esta PR fechou:
- Atualizou `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` com:
  - matriz de rastreabilidade operacional (fluxos topo->pos-envio_docs -> bloco legado correspondente);
  - inventario de estados/campos usados com classificacao de prova;
  - checklist de cobertura de `PR-T0.1` e decisao explicita de nao fechamento automatico.
- Atualizou `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md` para refletir:
  - `T0-PR1` concluida;
  - `T0-PR2` em execucao (continuidade de `PR-T0.1`);
  - lacuna remanescente documentada para readiness de G0.

O que esta PR nao fechou:
- Nao encerrou `PR-T0.1`.
- Nao fechou G0.
- Nao abriu T1.
- Nao implementou alteracao funcional em runtime.

Proximo passo autorizado:
- Permanece em T0: continuidade de `PR-T0.1` / `T0-PR2` ate eliminar a lacuna remanescente de prova para fechamento formal da etapa.
