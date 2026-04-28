# CONTRATO — T5 Migração do Funil Core e Integração de Canal — ENOVA 2

| Campo                             | Valor                                                                                         |
|-----------------------------------|-----------------------------------------------------------------------------------------------|
| Frente                            | T5 — Migração do funil core e integração de canal                                            |
| Fase do A01                       | T5 (semanas 10–12 da implantação macro)                                                      |
| Prioridade do A01                 | 6                                                                                             |
| Dependências                      | G4 APROVADO (`schema/implantation/READINESS_G4.md`), T4 encerrado, T3 encerrado, T2 encerrado, T1 encerrado |
| Legados aplicáveis                | L03 (obrigatório); L04, L05, L06, L07, L08, L17 (obrigatórios por fatia); L15, L16, L18, L19 (complementares) |
| Referências obrigatórias          | `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`, `schema/ADENDO_CANONICO_SOBERANIA_IA.md`, `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`, `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`, `schema/CONTRACT_SCHEMA.md`, `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`, `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`, `schema/legacy/INDEX_LEGADO_MESTRE.md`, `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` seção L |
| Blocos legados obrigatórios       | L03 (todas as PRs); L04, L05, L06 (PR-T5.2); L07, L08 (PR-T5.3, T5.4); L17 (PR-T5.6)      |
| Blocos legados complementares     | L15, L16 (PR-T5.5); L18 (PR-T5.7, T5.8, T5.R); L19 (todas — contexto substantivo MCMV)    |
| Ordem mínima de leitura da frente | L03 → L04 → L05 → L06 (topo) → L07 → L08 (Meio A) → L17 (Final) → L18 (QA/paridade) → L19 (MCMV) |
| Status                            | **aberto** — PR-T5.0 executada em 2026-04-26                                                 |
| Última atualização                | 2026-04-26                                                                                    |

---

## Adendos canônicos obrigatórios

Este contrato e todas as suas PRs devem declarar conformidade com:

- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01) — IA soberana na fala; mecânico jamais com prioridade de fala. Nenhuma fatia T5 pode criar template rígido, script mecânico ou if/else que escreva `reply_text` ao cliente.
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02) — identidade MCMV; trava explícita T5: "Paridade funcional NÃO é reproduzir a fala da Enova 1. É reproduzir a cobertura de casos de negócio com pelo menos a mesma qualidade." Shadow mode compara resultados de negócio — não texto de resposta.
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03) — "Evidência manda no estado." Bloco E obrigatório em toda PR que feche fatia, gate ou contrato.

---

## §1 Objetivo

T5 entrega a **migração declarativa do funil core da ENOVA 2**: o conjunto de contratos de fatia que formaliza, para cada segmento prioritário do fluxo de qualificação, os fatos mínimos que devem ser coletados, as políticas do policy engine que se aplicam, os critérios de pronto, as respostas proibidas e a ponte para o orquestrador T4 já aprovado.

T5 não reimplementa o atendimento da Enova 1. T5 define, em linguagem declarativa e contratual, **o que cobre cada fatia do novo funil** — preservando integralmente o pipeline T4 (entrada → LLM → validação → persistência → resposta/rastro/fallback) e garantindo que o LLM permaneça soberano na fala em cada fatia.

O objetivo de negócio: ao final de T5, o funil core da ENOVA 2 tem contratos formais declarados para as fatias prioritárias (topo, qualificação, renda/regime/composição, elegibilidade/restrição, docs/handoff), com paridade funcional demonstrada contra os fluxos da Enova 1 e com plano de shadow controlado aprovado — sem integração Meta/WhatsApp real antes de G5.

**T5 é migração de cobertura de casos — não migração de estilo de resposta.** A forma da conversa será melhor na ENOVA 2: mais natural, mais contextual, mais inteligente.

---

## §2 Escopo

1. Definição do mapa canônico de fatias do funil core e da ordem de migração — artefato `T5_MAPA_FATIAS.md` (PR-T5.1).
2. Contrato declarativo da fatia topo/abertura/primeira intenção: fatos mínimos, políticas, respostas proibidas, critérios de pronto — artefato `T5_FATIA_TOPO_ABERTURA.md` (PR-T5.2).
3. Contrato declarativo da fatia qualificação inicial: nome, objetivo, perfil inicial, sinais básicos — artefato `T5_FATIA_QUALIFICACAO_INICIAL.md` (PR-T5.3).
4. Contrato declarativo da fatia renda/regime/composição: renda, regime de trabalho, composição do processo, múltiplas fontes — artefato `T5_FATIA_RENDA_REGIME_COMPOSICAO.md` (PR-T5.4).
5. Contrato declarativo da fatia elegibilidade/restrição/objeções críticas: restrição, entrada, aprovação, impedimentos, objeções — artefato `T5_FATIA_ELEGIBILIDADE_RESTRICAO.md` (PR-T5.5).
6. Contrato declarativo da fatia docs/visita/handoff: documentação, envio, visita e handoff humano — artefato `T5_FATIA_DOCS_VISITA_HANDOFF.md` (PR-T5.6).
7. Matriz de paridade com legado e divergências permitidas — artefato `T5_MATRIZ_PARIDADE_LEGADO.md` (PR-T5.7).
8. Plano de shadow controlado/sandbox sem Meta real — artefato `T5_PLANO_SHADOW_SANDBOX.md` (PR-T5.8).
9. Readiness/Closeout G5: smoke das fatias S1–S8, CA-01..CA-10 verificados, decisão G5 APROVADO ou REPROVADO — artefato `READINESS_G5.md` (PR-T5.R).
10. Atualização de `schema/status/`, `schema/handoffs/` e `schema/contracts/_INDEX.md` a cada PR.

---

## §3 Fora de escopo

- Implementação de código TypeScript/JavaScript em `src/` — T5 é integralmente declarativa/documental.
- Alterações em `package.json`, `wrangler.toml` ou qualquer arquivo de infraestrutura.
- Integração real com canal Meta/WhatsApp — proibido antes de G5; T6 é a fase de canais.
- Migration ou alteração de schema Supabase real (requer escopo contratual próprio).
- Shadow mode com tráfego real de leads — proibido em T5; T5.8 define apenas o plano.
- Canary, cutover ou rollout — escopo exclusivo de T7.
- Alteração de artefatos T1, T2, T3 ou T4 já aprovados — qualquer necessidade de ajuste deve ser tratada como revisão contratual formal.
- Replicação de padrão conversacional da Enova 1 — proibido por A00-ADENDO-02 (P10, P18).
- Criação de if/else que escreva texto ao cliente — proibido por A00-ADENDO-01 (P1, P2).
- Criação de template rígido de resposta dominante — proibido.
- Criação de fallback dominante que substitua a soberania do LLM — proibido.
- Paridade de texto de resposta com Enova 1 — proibido; paridade é de cobertura de casos de negócio, não de fala.
- Execução técnica de fatias antes de PR-T5.1 estar merged (contrato de fatia precede implementação).

---

## §4 Dependências

### Dependências de gate

- **G4 APROVADO** — `schema/implantation/READINESS_G4.md` — smoke S1–S6 PASS, CA-01..CA-10 CUMPRIDOS, decisão G4 APROVADO — **SATISFEITA em 2026-04-25**.
- **Contrato T4 encerrado** — `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T4_2026-04-25.md` — **SATISFEITA em 2026-04-25**.

### Dependências de artefato (T4 — orquestrador)

- `schema/implantation/T4_ENTRADA_TURNO.md` — shape `TurnoEntrada` — **pipeline que T5 alimenta; intocável**.
- `schema/implantation/T4_PIPELINE_LLM.md` — contrato único de chamada LLM; `reply_text` imutável — **trava LLM-first que T5 preserva**.
- `schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` — VC-01..VC-09; `PersistDecision` — **validador que T5 usa para aprovar fatos de cada fatia**.
- `schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md` — `TurnoRastro`; entrega `reply_text` ao canal — **saída do turno que T5 não altera**.
- `schema/implantation/T4_FALLBACKS.md` — 4 cenários de falha — **fallbacks que T5 herda**.
- `schema/implantation/T4_BATERIA_E2E.md` — 10 cenários declarativos — **base de regressão que T5 preserva**.

### Dependências de artefato (T3 — policy engine)

- `schema/implantation/T3_CLASSES_POLITICA.md` — 5 classes canônicas — **políticas que cada fatia T5 aplica**.
- `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` — pipeline 6 estágios — **ordem de avaliação herdada**.
- `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` — VC-01..VC-09 — **validador que bloqueia persistência incorreta em qualquer fatia**.

### Dependências de artefato (T2 — estado)

- `schema/implantation/T2_LEAD_STATE_V1.md` — 11 blocos canônicos, 35 `fact_*` — **todos os fatos mínimos de T5 devem existir neste schema**.
- `schema/implantation/T2_RECONCILIACAO.md` — 7 etapas, protocolo de resolução — **reconciliador que valida fatos de cada fatia antes de persistir**.
- `schema/implantation/T2_RESUMO_PERSISTIDO.md` — camadas L1/L2/L3/L4 — **memória que persiste estado entre fatias**.

### Dependências de artefato (T1 — contrato cognitivo)

- `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` — identidade do LLM — **base do prompt usado em cada fatia**.
- `schema/implantation/T1_CONTRATO_SAIDA.md` — `TurnoSaida` shape; `reply_text` exclusivo do LLM — **trava canônica que T5 preserva sem exceção**.

### Dependências de frente

- T1 concluída (G1 APROVADO em 2026-04-23).
- T2 concluída (G2 APROVADO em 2026-04-24).
- T3 concluída (G3 APROVADO em 2026-04-25).
- T4 concluída (G4 APROVADO em 2026-04-25).

---

## §5 Entradas

Antes de iniciar qualquer PR de T5, devem existir e estar acessíveis:

| # | Artefato | Caminho | Condição de entrada |
|---|----------|---------|---------------------|
| E1 | Readiness G4 | `schema/implantation/READINESS_G4.md` | G4 APROVADO, Bloco E presente |
| E2 | Contrato T4 arquivado | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T4_2026-04-25.md` | ENCERRADO |
| E3 | Contrato T5 aberto | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md` | ABERTO (este documento) |
| E4 | Entrada do turno T4 | `schema/implantation/T4_ENTRADA_TURNO.md` | `TurnoEntrada` shape definido; reply_text proibido na entrada |
| E5 | Pipeline LLM T4 | `schema/implantation/T4_PIPELINE_LLM.md` | Contrato único LLM; reply_text imutável após captura |
| E6 | Validação/Persistência T4 | `schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` | VC-01..VC-09; PersistDecision com 4 resultados |
| E7 | Resposta/Rastro T4 | `schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md` | TurnoRastro; entrega reply_text ao canal |
| E8 | Fallbacks T4 | `schema/implantation/T4_FALLBACKS.md` | 4 cenários; nenhum produz reply_text mecânico dominante |
| E9 | Bateria E2E T4 | `schema/implantation/T4_BATERIA_E2E.md` | 10 cenários declarativos; base de regressão |
| E10 | Lead state v1 | `schema/implantation/T2_LEAD_STATE_V1.md` | 11 blocos; 35 fact_*; fatos de T5 devem existir aqui |
| E11 | Classes de política T3 | `schema/implantation/T3_CLASSES_POLITICA.md` | 5 classes; nenhuma produz reply_text |
| E12 | Bíblia Canônica §L | `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` seção L | PRs T5.0–T5.R mapeadas |
| E13 | Legado mestre T5 | `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T5 | Microetapas do mestre acessíveis |
| E14 | Mapa canônico do funil | `schema/legacy/INDEX_LEGADO_MESTRE.md` bloco L03 | Stages, gates e transições do funil |

---

## §6 Saídas

Ao final de T5, os seguintes artefatos devem existir, ser coerentes entre si e com T1/T2/T3/T4:

| # | Artefato | Caminho | PR que o cria | Conteúdo mínimo |
|---|----------|---------|---------------|-----------------|
| S1 | Mapa de fatias | `schema/implantation/T5_MAPA_FATIAS.md` | PR-T5.1 | Todas as fatias do funil core mapeadas; ordem de migração; dependências entre fatias; critérios de entrada/saída por fatia; invariante: nenhuma fatia cria reply_text mecânico |
| S2 | Fatia topo/abertura | `schema/implantation/T5_FATIA_TOPO_ABERTURA.md` | PR-T5.2 | Fatos mínimos da fatia (amarrados a T2_LEAD_STATE_V1); políticas T3 aplicáveis; respostas proibidas (sem texto pré-montado); critérios de pronto; trava LLM-first |
| S3 | Fatia qualificação inicial | `schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL.md` | PR-T5.3 | Fatos mínimos (nome, objetivo, perfil inicial, sinais básicos); políticas T3; respostas proibidas; critérios de pronto; trava LLM-first |
| S4 | Fatia renda/regime/composição | `schema/implantation/T5_FATIA_RENDA_REGIME_COMPOSICAO.md` | PR-T5.4 | Fatos mínimos (renda, regime, composição, múltiplas fontes); políticas T3 (R_CASADO_CIVIL_CONJUNTO, R_AUTONOMO_IR); respostas proibidas; critérios de pronto; trava LLM-first |
| S5 | Fatia elegibilidade/restrição | `schema/implantation/T5_FATIA_ELEGIBILIDADE_RESTRICAO.md` | PR-T5.5 | Fatos mínimos (restrição, entrada, aprovação, impedimentos, objeções críticas); políticas T3 (R_ESTRANGEIRO_SEM_RNM, R_SOLO_BAIXA_COMPOSICAO); respostas proibidas; critérios de pronto; trava LLM-first |
| S6 | Fatia docs/visita/handoff | `schema/implantation/T5_FATIA_DOCS_VISITA_HANDOFF.md` | PR-T5.6 | Fatos mínimos (documentação, envio, visita, handoff humano); políticas T3; respostas proibidas; critérios de pronto; protocolo de handoff sem reply_text mecânico |
| S7 | Matriz de paridade | `schema/implantation/T5_MATRIZ_PARIDADE_LEGADO.md` | PR-T5.7 | Comparativo caso a caso: legado × novo motor; divergências classificadas (melhoria/regressão/aceitável/bug); zero paridade de texto de resposta (paridade é de cobertura de casos) |
| S8 | Plano shadow/sandbox | `schema/implantation/T5_PLANO_SHADOW_SANDBOX.md` | PR-T5.8 | Plano de shadow controlado; sandbox sem Meta real; critérios de aprovação da sombra; plano de rollback; nenhuma integração real de canal |
| S9 | Readiness G5 | `schema/implantation/READINESS_G5.md` | PR-T5.R | Smoke S1–S8; CA-01..CA-10 verificados; paridade declarada; decisão G5 APROVADO ou REPROVADO; Bloco E |

---

## §7 Critérios de aceite

| # | Critério | Verificação |
|---|----------|-------------|
| CA-01 | **Funil migrado sem if/else de fala** — nenhuma fatia T5 pode criar template rígido, script mecânico, if/else, parser ou qualquer mecanismo que escreva `reply_text` ao cliente | Inspeção de S1–S8: ausência de qualquer campo `reply_text`, `mensagem_usuario`, `texto_cliente`, template de resposta ou equivalent em qualquer saída de fatia, stage, policy, validador, reconciliador ou integração de canal |
| CA-02 | **Fatos mínimos por fatia declarados e amarrados a T2** — cada fatia (S2–S6) define fatos mínimos canônicos que a fatia cobre, todos existentes em `T2_LEAD_STATE_V1.md` | Cada `T5_FATIA_*.md` referencia campos de `fact_*`, `derived_*` ou `signal_*` de `T2_LEAD_STATE_V1.md`; nenhum fato inventado fora do schema T2 |
| CA-03 | **Políticas mínimas por fatia declaradas sem reply_text** — cada fatia (S2–S6) declara políticas do policy engine T3 que se aplicam; nenhuma política produz texto ao cliente | Cada `T5_FATIA_*.md` referencia classes de política de `T3_CLASSES_POLITICA.md`; políticas declaradas como flags/bloqueios/insumos ao LLM — nunca como templates de fala |
| CA-04 | **Critérios de pronto por fatia mensuráveis** — cada fatia (S2–S6) define critérios objetivos de "fatia pronta" verificáveis por inspeção de fatos e políticas, sem dependência de texto de resposta | Cada `T5_FATIA_*.md` declara: fatos que devem estar em estado `confirmed`, políticas que devem ter sido avaliadas, condições de avanço de stage |
| CA-05 | **Paridade funcional declarada — cobertura de casos, não de fala** — S7 mapeia todos os fluxos prioritários do legado; divergências classificadas; nenhuma divergência de texto de resposta é registrada como regressão | `T5_MATRIZ_PARIDADE_LEGADO.md` cobre fluxos do mestre T5; divergências classificadas em: melhoria / regressão / aceitável / bug; zero registros de "resposta diferente da E1" como bug — isso é melhoria |
| CA-06 | **Shadow/sandbox declarado sem integração real** — S8 define plano de shadow controlado; sandbox sem Meta/WhatsApp real; nenhuma chamada LLM real ou tráfego de lead real em T5 | `T5_PLANO_SHADOW_SANDBOX.md` declara: método de shadow sem canal real, critérios de aprovação da sombra, plano de rollback; nenhuma integração Meta/WhatsApp presente em qualquer artefato T5 |
| CA-07 | **Orquestrador T4 preservado intacto** — nenhuma PR T5 altera os artefatos `T4_*.md` já aprovados; o pipeline T4 permanece inalterado | Diff de PR-T5.1 a PR-T5.R: zero alterações em `T4_*.md`, `T3_*.md`, `T2_*.md`, `T1_*.md` |
| CA-08 | **Soberania LLM verificada em todos os contratos de fatia** — nenhum contrato S1–S8 define `reply_text`, mensagem pré-montada, frases prontas ou template como output da fatia | Inspeção de S1–S8: ausência de campos de texto de resposta pré-montado; cada fatia declara explicitamente que `reply_text` é exclusivo do LLM conforme T4/T1 |
| CA-09 | **Mapa de fatias formalmente declarado** — S1 produz mapa com todas as fatias, ordem de migração, dependências entre fatias e critérios de entrada/saída | `T5_MAPA_FATIAS.md` cobre todas as 5 fatias do funil core + docs + handoff; ordem canônica declarada; cada fatia tem critério de entrada/saída |
| CA-10 | **G5 decidido com Bloco E e evidência formal** — READINESS_G5.md contém smoke S1–S8, CA-01..CA-09 verificados, paridade declarada, decisão G5 APROVADO ou REPROVADO, Bloco E presente | `READINESS_G5.md` criado por PR-T5.R com smoke de cada artefato, verificação dos 10 critérios, decisão formal e Bloco E completo |

---

## §8 Provas obrigatórias

Cada PR de T5 deve apresentar:

| Prova | Descrição |
|-------|-----------|
| P-T5-01 | Diff do artefato criado — inspeção linha a linha confirmando ausência de `reply_text`, templates de resposta, if/else de fala ou qualquer mecanismo de fala mecânica em outputs da fatia |
| P-T5-02 | Referências cruzadas T2 — cada fato mínimo declarado na fatia aponta para campo canônico existente em `T2_LEAD_STATE_V1.md`; nenhum fato inventado |
| P-T5-03 | Referências cruzadas T3 — cada política declarada na fatia aponta para classe canônica existente em `T3_CLASSES_POLITICA.md`; nenhuma política produz texto |
| P-T5-04 | Conformidade A00-ADENDO-02 — declaração explícita de que paridade funcional = cobertura de casos de negócio, não paridade de texto de resposta (para PR-T5.7) |
| P-T5-05 | Smoke coerência (PR-T5.R) — checklist de 8 artefatos S1–S8 com status PASS/FAIL + justificativa por dimensão; verificação cruzada T1/T2/T3/T4 × T5 |

---

## §9 Bloqueios

| # | Bloqueio | Condição de desbloqueio |
|---|----------|------------------------|
| B-01 | **G4 não aprovado** — T5 não pode ser aberta sem G4 APROVADO | `READINESS_G4.md` com decisão G4 APROVADO — **DESBLOQUEADO em 2026-04-25** |
| B-02 | **Contrato T4 não encerrado** — T5 não pode migrar funil sem orquestrador T4 formal | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T4_2026-04-25.md` presente — **DESBLOQUEADO em 2026-04-25** |
| B-03 | **PR fora de sequência** — nenhuma PR-T5.N pode iniciar sem a PR-T5.(N-1) concluída e merged | Branch principal atualizado; PR anterior com status `merged` |
| B-04 | **if/else de fala detectado** — qualquer artefato T5 que crie mecanismo de texto pré-montado ao cliente viola A00-ADENDO-01 | Bloqueio permanente — condição de não-conformidade imediata; PR não pode ser mergeada |
| B-05 | **Paridade de fala da Enova 1** — qualquer artefato T5 que tente reproduzir o padrão conversacional da Enova 1 viola A00-ADENDO-02 (P10, P18) | Bloqueio permanente — condição de não-conformidade imediata |
| B-06 | **Alteração de artefatos T1/T2/T3/T4** — nenhuma PR T5 pode alterar artefatos de frentes anteriores | Bloqueio ativo; requer revisão contratual formal se necessidade real for identificada |
| B-07 | **Integração Meta/WhatsApp real** — proibida antes de G5; T5.8 define apenas plano de shadow | Bloqueio ativo até PR-T5.R e G5 APROVADO; desbloqueio exclusivo via contrato T6 |
| B-08 | **Implementação em `src/`** — T5 é inteiramente declarativa; qualquer código funcional viola o escopo | Bloqueio ativo; requer autorização contratual explícita para qualquer exceção |
| B-09 | **Abertura de T6** — T6 não pode ser iniciado antes de G5 APROVADO | `READINESS_G5.md` com decisão G5 APROVADO — bloqueio ativo até PR-T5.R |
| B-10 | **Fato de fatia não presente em T2_LEAD_STATE_V1** — nenhum fato pode ser inventado; apenas fatos do schema T2 existente | Bloqueio por PR — qualquer fato não mapeado em T2 é lacuna bloqueante |

---

## §10 Próximo passo autorizado

**PR-T5.1 — Mapa de fatias do funil core e ordem de migração**

- Artefato: `schema/implantation/T5_MAPA_FATIAS.md`
- Escopo: definir todas as fatias do funil core; ordem canônica de migração; dependências entre fatias; critérios de entrada e de pronto por fatia; invariante: nenhuma fatia cria reply_text mecânico; amarração com legado mestre T5 (L03 obrigatório)
- Referência: `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` §L, PR-T5.1

---

## §11 Relação com o A01

| Campo A01 | Valor |
|-----------|-------|
| Fase      | T5 — Semanas 10–12 |
| Prioridade | 6 |
| Gate de entrada | G4 APROVADO |
| Gate de saída | G5 — fluxos prioritários com paridade funcional suficiente e divergências classificadas |
| Épico do mestre | "Migração dos trilhos prioritários: topo, identificação, composição, renda; paridade funcional contra casos históricos; tom conversacional sem violar policy; ponte para docs" |
| Posição na cadeia | T1 (cognitivo) → T2 (estado) → T3 (políticas) → T4 (orquestrador) → **T5 (migração funil)** → T6 (multimodal) |

---

## §12 Relação com legados aplicáveis

| Legado | Relevância para T5 | Uso por PR |
|--------|-------------------|------------|
| L03 — Mapa Canônico do Funil | **Obrigatório** — stages, gates e transições do funil; base canônica para definir as fatias de T5 e a ordem de migração | Todas as PRs T5.1–T5.R |
| L04 — Topo do Funil — Contrato | Obrigatório para fatia topo — contrato e regras operacionais do topo; define o que o início do atendimento cobre | PR-T5.2 |
| L05 — Topo do Funil — Parser | Obrigatório para fatia topo — critérios de extração; base para definir fatos mínimos extraíveis no topo | PR-T5.2 |
| L06 — Topo do Funil — Critérios | Obrigatório para fatia topo — critérios de aceite e gate do topo | PR-T5.2 |
| L07 — Meio A — Estado Civil (Parte 1) | Obrigatório para composição/qualificação — regras de estado civil e impacto na composição | PR-T5.3, PR-T5.4 |
| L08 — Meio A — Estado Civil (Parte 2) | Obrigatório para composição — continuação das regras de composição por estado civil | PR-T5.3, PR-T5.4 |
| L15 — Especiais — Trilhos P3 / Multi | Complementar para elegibilidade — trilhos especiais e variantes P3 e multi-proponente | PR-T5.5 |
| L16 — Especiais — Familiar e Variantes | Complementar para elegibilidade — composição familiar especial e variantes | PR-T5.5 |
| L17 — Final Operacional / Docs / Visita | Obrigatório para fatia docs/handoff — transição final, documentos, visita e handoff | PR-T5.6 |
| L18 — Runner / QA / Telemetria | Obrigatório para paridade e shadow — matriz de teste, critérios de aceite, observabilidade | PR-T5.7, PR-T5.8, PR-T5.R |
| L19 — Memorial do Programa / Analista MCMV | Complementar — regras substantivas do programa MCMV por perfil; base para elegibilidade e objeções críticas | PR-T5.5, complementar em todas |

---

## §13 Referências

| Documento | Finalidade |
|-----------|-----------|
| `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T5 | Fonte canônica das microetapas obrigatórias de T5 |
| `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` §L | Definição e sequência de PRs T5.0–T5.R |
| `schema/CONTRACT_SCHEMA.md` | Formato canônico — estrutura seguida neste contrato |
| `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` | Regras de execução contratual — imutabilidade de escopo |
| `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md` | Protocolo formal de encerramento — obrigatório em PR-T5.R |
| `schema/implantation/READINESS_G4.md` | Gate de entrada T5 — G4 APROVADO com Bloco E |
| `schema/implantation/T4_ENTRADA_TURNO.md` | Shape `TurnoEntrada` que T5 alimenta sem alterar |
| `schema/implantation/T4_PIPELINE_LLM.md` | Contrato único LLM; `reply_text` imutável — base de T5 |
| `schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` | Validador VC-01..VC-09 que persiste fatos de cada fatia |
| `schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md` | Rastro do turno; entrega `reply_text` ao canal |
| `schema/implantation/T4_FALLBACKS.md` | Fallbacks T4 herdados por T5 sem modificação |
| `schema/implantation/T3_CLASSES_POLITICA.md` | Políticas que cada fatia T5 aplica |
| `schema/implantation/T3_ORDEM_AVALIACAO_COMPOSICAO.md` | Pipeline de avaliação de políticas por fatia |
| `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` | Validador VC-01..VC-09; vetos aplicáveis por fatia |
| `schema/implantation/T2_LEAD_STATE_V1.md` | Schema canônico de fatos — todos os fatos de T5 devem existir aqui |
| `schema/implantation/T2_RECONCILIACAO.md` | Reconciliador que valida fatos confirmados por fatia |
| `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` | Base do prompt do LLM em cada fatia |
| `schema/implantation/T1_CONTRATO_SAIDA.md` | `TurnoSaida` shape; `reply_text` exclusivo do LLM |
| `schema/ADENDO_CANONICO_SOBERANIA_IA.md` | A00-ADENDO-01 — LLM soberano; nenhuma fatia fala mecanicamente |
| `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` | A00-ADENDO-02 — paridade funcional ≠ paridade de fala; trava T5 |
| `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` | A00-ADENDO-03 — Bloco E obrigatório em toda PR que feche fatia |

---

## §14 Blocos legados aplicáveis

### Obrigatórios (devem ser lidos antes de qualquer execução T5)

| Código | Nome | Razão de obrigatoriedade |
|--------|------|--------------------------|
| L03 | Mapa Canônico do Funil | Define stages, gates e transições — sem L03 não há base para definir as fatias de T5 nem a ordem de migração |

### Obrigatórios por fatia específica (ler ao executar a PR correspondente)

| Código | Nome | Quando ler |
|--------|------|-----------|
| L04 | Topo do Funil — Contrato | PR-T5.2: contrato e regras do topo |
| L05 | Topo do Funil — Parser | PR-T5.2: critérios de extração e fatos extraíveis do topo |
| L06 | Topo do Funil — Critérios | PR-T5.2: critérios de aceite e gate do topo |
| L07 | Meio A — Estado Civil (Parte 1) | PR-T5.3, PR-T5.4: regras de estado civil e composição |
| L08 | Meio A — Estado Civil (Parte 2) | PR-T5.3, PR-T5.4: continuação das regras de composição |
| L17 | Final Operacional / Docs / Visita | PR-T5.6: transição final do funil, documentação, handoff |
| L18 | Runner / QA / Telemetria | PR-T5.7, PR-T5.8, PR-T5.R: matriz de paridade, shadow e readiness |

### Complementares (consultar conforme microetapa ativa)

| Código | Nome | Quando consultar |
|--------|------|-----------------|
| L15 | Especiais — Trilhos P3 / Multi | PR-T5.5: variantes P3 e multi-proponente na elegibilidade |
| L16 | Especiais — Familiar e Variantes | PR-T5.5: composição familiar especial |
| L19 | Memorial do Programa / Analista MCMV | Todas as PRs: regras substantivas MCMV por perfil, especialmente T5.5 (objeções e impedimentos) |

---

## §15 Ordem mínima de leitura da frente

Antes de executar qualquer PR de T5, ler nesta ordem:

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T5 — microetapas canônicas
2. **L03** — Mapa Canônico do Funil (obrigatório, leitura completa)
3. `schema/implantation/READINESS_G4.md` — gate de entrada e estado aprovado de T4
4. `schema/implantation/T4_PIPELINE_LLM.md` + `T4_VALIDACAO_PERSISTENCIA.md` + `T4_ENTRADA_TURNO.md` — pipeline T4 que T5 alimenta
5. `schema/implantation/T2_LEAD_STATE_V1.md` — schema de fatos; todos os fatos de T5 devem existir aqui
6. `schema/implantation/T3_CLASSES_POLITICA.md` + `T3_ORDEM_AVALIACAO_COMPOSICAO.md` — políticas que cada fatia aplica
7. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` §L — sequência de PRs

Para PR-T5.2 (fatia topo), adicionar:
- L04, L05, L06 (Topo do Funil — Contrato, Parser, Critérios)

Para PR-T5.3 e PR-T5.4 (qualificação e renda/regime/composição), adicionar:
- L07, L08 (Meio A — Estado Civil)

Para PR-T5.5 (elegibilidade/restrição), adicionar:
- L15, L16 (Especiais), L19 (Memorial MCMV)

Para PR-T5.6 (docs/handoff), adicionar:
- L17 (Final Operacional / Docs / Visita)

Para PR-T5.7, PR-T5.8, PR-T5.R (paridade, shadow, readiness), adicionar:
- L18 (Runner / QA / Telemetria)

---

## §16 Quebra de PRs T5.0–T5.R

| PR | Título | Artefato principal | Dependência | Microetapa(s) do mestre |
|----|--------|--------------------|-------------|------------------------|
| PR-T5.0 | Abertura formal do contrato T5 | `CONTRATO_IMPLANTACAO_MACRO_T5.md` (este) | G4 APROVADO | — (contrato) |
| PR-T5.1 | Mapa de fatias do funil core e ordem de migração | `T5_MAPA_FATIAS.md` | PR-T5.0 | "Quebrar a migração em fatias: topo+abertura; identificação base; composição/estado civil; renda+regime; elegibilidade+inviabilidade; envio_docs" |
| PR-T5.2 | Contrato da fatia topo/abertura/primeira intenção | `T5_FATIA_TOPO_ABERTURA.md` | PR-T5.1 | "Migrar topo de funil — fatos mínimos, políticas mínimas, respostas proibidas e critérios de pronto" |
| PR-T5.3 | Contrato da fatia qualificação inicial | `T5_FATIA_QUALIFICACAO_INICIAL.md` | PR-T5.2 | "Migrar identificação — nome, objetivo, perfil inicial, sinais básicos; fatos mínimos e políticas" |
| PR-T5.4 | Contrato da fatia renda/regime/composição | `T5_FATIA_RENDA_REGIME_COMPOSICAO.md` | PR-T5.3 | "Migrar composição e renda — autônomo, IR, dependente; composição do processo e múltiplas fontes de renda" |
| PR-T5.5 | Contrato da fatia elegibilidade/restrição/objeções críticas | `T5_FATIA_ELEGIBILIDADE_RESTRICAO.md` | PR-T5.4 | "Migrar regras de nacionalidade, restrição e elegibilidade — impedimentos, objeções críticas, sinais de inviabilidade" |
| PR-T5.6 | Contrato da fatia docs/visita/handoff | `T5_FATIA_DOCS_VISITA_HANDOFF.md` | PR-T5.5 | "Preparar ponte para docs e pós-aprovação — documentação, envio, visita e handoff humano" |
| PR-T5.7 | Matriz de paridade com legado e divergências permitidas | `T5_MATRIZ_PARIDADE_LEGADO.md` | PR-T5.6 | "Provar paridade funcional contra os casos históricos da Enova — divergências classificadas (melhoria/regressão/aceitável/bug)" |
| PR-T5.8 | Plano de shadow controlado/sandbox sem Meta real | `T5_PLANO_SHADOW_SANDBOX.md` | PR-T5.7 | "Definir plano de shadow/sombra e sandbox sem integração real com canal" |
| PR-T5.R | Readiness/Closeout G5 | `READINESS_G5.md` | PR-T5.8 | — (validação e gate) |

**Regra de sequência:** cada PR só pode iniciar após a PR anterior estar merged em `main`.

**Proibido em qualquer PR T5:**
- Criar `reply_text` em qualquer output de fatia, stage, policy, validador, reconciliador, canal ou integração
- Criar if/else que escreva texto ao cliente
- Criar template rígido ou frases prontas como saída operacional
- Criar parser com prioridade sobre a fala do LLM
- Criar fallback dominante que substitua a soberania do LLM
- Abrir T6 antes de G5 APROVADO
- Integrar Meta/WhatsApp real antes de G5
- Alterar artefatos T1/T2/T3/T4 já aprovados
- Implementar código em `src/`
- Criar Supabase/migration

---

## §17 Gate G5

| Campo | Valor |
|-------|-------|
| Código | G5 |
| Nome | Fluxos prioritários com paridade funcional |
| Condição de aprovação | S1–S8 todos com smoke PASS; CA-01..CA-10 todos CUMPRIDOS; paridade funcional declarada com divergências classificadas; zero if/else de fala em qualquer artefato; zero template de resposta dominante; Bloco E presente em READINESS_G5.md |
| Condição de reprovação | Qualquer artefato S1–S8 ausente ou com seção faltante; qualquer CA marcado como NÃO CUMPRIDO; qualquer fatia com if/else de fala, template de resposta ou mecanismo mecânico de texto ao cliente; fato de fatia não mapeado em T2; paridade de texto com E1 registrada como critério |
| Consequência de aprovação | T6 autorizado — PR-T6.0 pode iniciar |
| Consequência de reprovação | T6 bloqueado; lista de lacunas bloqueantes publicada em READINESS_G5.md; não-bloqueantes documentadas |
| Artefato de gate | `schema/implantation/READINESS_G5.md` criado por PR-T5.R |
| PR que executa o gate | PR-T5.R — Readiness/Closeout de G5 |

---

## Bloco E — PR-T5.0

| Campo | Valor |
|-------|-------|
| PR | PR-T5.0 — Abertura formal do contrato T5 |
| Data | 2026-04-26 |
| Executor | Claude Code (claude-sonnet-4-6) |
| Artefatos produzidos | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md` (este documento) |
| Status | CONCLUÍDA |
| Evidência | Contrato T5 preenchido com §1–§17 + Bloco E; skeleton substituído por corpo completo; §16 mapeia PRs T5.0–T5.R (10 PRs conforme instrução); §17 define G5 com condições de aprovação/reprovação; todas as dependências T1/T2/T3/T4 declaradas; sequência obrigatória cumprida |
| Cobertura de microetapas | N/A (PR de contrato — não executa microetapa; autoriza sequência PR-T5.1–T5.R) |
| Conformidade A00-ADENDO-01 | Confirmada — CA-01 e CA-08 garantem que nenhum output de fatia, stage, policy, validador, reconciliador ou canal produz `reply_text`; LLM soberano na fala em todas as fatias |
| Conformidade A00-ADENDO-02 | Confirmada — paridade funcional explicitamente definida como cobertura de casos de negócio (não de fala); trava P10/P18 declarada; B-05 bloqueia qualquer reprodução da Enova 1 |
| Conformidade A00-ADENDO-03 | Confirmada — Bloco E presente |
| Próxima PR autorizada | **PR-T5.1 — Mapa de fatias do funil core e ordem de migração** |
