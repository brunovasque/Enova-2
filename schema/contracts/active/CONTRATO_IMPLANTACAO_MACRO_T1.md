# CONTRATO — T1 Constituição do Agente e Contrato Cognitivo Canônico — ENOVA 2

| Campo                             | Valor                                                                             |
|-----------------------------------|-----------------------------------------------------------------------------------|
| Frente                            | T1 — Constituição do agente e contrato cognitivo canônico                         |
| Fase do A01                       | T1 (Semanas 2–3 da implantação macro)                                             |
| Prioridade do A01                 | 2                                                                                 |
| Dependências                      | PR-T0.R (G0 aprovado), todos os inventários T0.1–T0.6, READINESS_G0              |
| Legados aplicáveis                | L03 (obrigatório), L19 (obrigatório); L04–L17, L18, C01–C09 (complementares)    |
| Referências obrigatórias          | schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md, A00, A01, A00-ADENDO-01, A00-ADENDO-02, A00-ADENDO-03, A02, CONTRACT_EXECUTION_PROTOCOL, CONTRACT_CLOSEOUT_PROTOCOL, CONTRACT_SCHEMA, INDEX_LEGADO_MESTRE, READINESS_G0, inventários T0.1–T0.6 |
| Blocos legados obrigatórios       | L03 (Mapa Canônico do Funil), L19 (Memorial do Programa / Analista MCMV)        |
| Blocos legados complementares     | L04–L17 (regras de negócio por segmento), L18 (QA/telemetria), C01–C09          |
| Ordem mínima de leitura da frente | L19 → L03                                                                         |
| Status                            | Aberto                                                                            |
| Última atualização                | 2026-04-23                                                                        |

---

## Adendos canônicos obrigatórios

Este contrato e todas as suas PRs devem declarar conformidade com:

- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01): IA soberana na fala — mecânico jamais com prioridade de fala.
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02): Enova 2 é atendente especialista MCMV. T1 define o que o LLM é e o que não pode fazer — não o que ele diz.
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03): evidência manda no estado. Bloco E obrigatório em toda PR que feche etapa.

---

## 1. Objetivo

Transformar o conhecimento da Enova em um contrato operacional claro para o LLM, com identidade,
limites, objetivos, taxonomia e saída estruturada.

O contrato T1 fecha quando o LLM tiver: identidade definida, limites explícitos, taxonomia canônica
de fatos e objetivos, formato de saída fixo, comportamentos canônicos declarados e bateria adversarial
aprovada.

**Trava LLM-first inviolável:** o contrato T1 define o que o LLM é e o que não pode fazer. Ele nunca
define o que o LLM diz. A fala é sempre do LLM, dentro dos limites do contrato.

---

## 2. Escopo

- Definir a identidade canônica do agente (quem é, para que serve, o que não é).
- Separar as 5 dimensões canônicas: tom, regra de negócio, veto, sugestão mandatória e repertório.
- Definir comportamento canônico em cenários adversariais: ambiguidade, contradição, cliente prolixo,
  evasivo, áudio ruim, insistência em preço/aprovação.
- Definir como o agente age em perguntas fora do trilho sem perder o objetivo operacional do turno.
- Fechar o contrato de saída do agente: campos obrigatórios, semântica de cada campo.
- Publicar taxonomia oficial de facts, objetivos, pendências, conflitos, riscos e ações.
- Documentar explicitamente o que o agente nunca pode fazer.
- Realizar bateria adversarial de validação (papel, sem execução de LLM real).
- Abrir e fechar G1 com smoke documental.

---

## 3. Fora de escopo

- Implementação de LLM real (chamada real à API, código de runtime).
- Schema Supabase concreto — definido em T2.
- Policy engine e guardrails declarativos — definidos em T3.
- Orquestrador de turno — definido em T4.
- Migração do funil da Enova 1 — executada em T5.
- Docs, áudio, imagem, multimodalidade — definidos em T6.
- Qualquer alteração em `src/`, `package.json` ou `wrangler.toml`.
- Qualquer ativação de LLM real, Supabase produtivo, Meta/WhatsApp real ou STT/TTS real.
- Refatoração funcional do legado E1.

---

## 4. Dependências

- G0 aprovado: `schema/implantation/READINESS_G0.md` — satisfeito em 2026-04-23.
- Inventários T0 completos:
  - `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` — fluxos/estados E1
  - `schema/implantation/INVENTARIO_REGRAS_T0.md` — 48 regras em 7 famílias
  - `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md` — 27 pontos mecânicos
  - `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md` — 28 canais/superfícies/telemetria
  - `schema/implantation/MATRIZ_RISCO_T0.md` — 26 riscos, 7 bloqueantes G0
  - `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md` — 39 itens, 7 CDC, mapa fallback

---

## 5. Entradas

Antes da execução de qualquer PR T1.1+, devem existir:

- Este contrato T1 em `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md` (ativo).
- `schema/implantation/READINESS_G0.md` (G0 aprovado com limitações residuais declaradas).
- Todos os 6 inventários T0 encerrados com Bloco E válido.
- Adendos A00-ADENDO-01, A00-ADENDO-02, A00-ADENDO-03 lidos e confirmados.

---

## 6. Saídas

Ao final da execução de T1 (PR-T1.5 + PR-T1.R), devem existir:

| Artefato | Arquivo | PR |
|----------|---------|-----|
| Contrato T1 preenchido e ativo | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md` | PR-T1.0 |
| Camadas canônicas (tom/regra/veto/sugestão/repertório) | `schema/implantation/T1_CAMADAS_CANONICAS.md` | PR-T1.1 |
| System prompt canônico v1 | `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` | PR-T1.2 |
| Taxonomia oficial (facts/objetivos/pendências/conflitos/riscos/ações) | `schema/implantation/T1_TAXONOMIA_OFICIAL.md` | PR-T1.3 |
| Contrato de saída do agente | `schema/implantation/T1_CONTRATO_SAIDA.md` | PR-T1.4 |
| Comportamentos canônicos e proibições | `schema/implantation/T1_COMPORTAMENTOS_E_PROIBICOES.md` | PR-T1.5 |
| Readiness G1 | `schema/implantation/READINESS_G1.md` | PR-T1.R |
| Contrato T1 encerrado/arquivado | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T1_<data>.md` | PR-T1.R |
| Skeleton contrato T2 | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md` | PR-T1.R |

---

## 7. Critérios de aceite

- System prompt canônico em camadas sem ambiguidades centrais — publicado e referenciado.
- Manual declarativo das regras do funil separado de estilo de fala — publicado.
- Taxonomia oficial de facts, objetivos, pendências, conflitos, riscos e ações — publicada com cada tipo amarrado a regra/origem de PR-T0.2.
- Formato de saída padrão do agente para qualquer canal — schema descritivo com pelo menos 5 cenários cobertos.
- Comportamentos canônicos documentados para cada cenário do mestre: ambiguidade, contradição, prolixo, evasivo, áudio ruim, insistência em preço/aprovação.
- Lista explícita do que o agente nunca pode fazer.
- Bateria adversarial (papel): cobertura de desvio, manipulação e pedido fora de política.
- Teste de consistência entre 20–30 casos documentados.
- Revisão manual de aderência entre contrato e regras históricas da Enova (inventários T0).
- **Trava de rollback:** o contrato não pode permitir "resposta bonita mas operacionalmente frouxa". G1 não fecha se esta condição não for verificada.
- Soberania LLM-first: nenhum campo de saída pode ser redigido pelo mecânico; `reply_text` sempre pelo LLM.
- Nenhuma fala mecânica pode nascer em T1 (A00-ADENDO-01/02 verificados em todos os artefatos).
- G1 aprovado antes de qualquer abertura de T2.

---

## 8. Provas obrigatórias

- Bloco E preenchido em cada PR T1.0 a T1.R.
- Cada entregável documentado com referência cruzada ao inventário T0 correspondente.
- Bateria adversarial documentada em papel (sem execução LLM real) com pelo menos 10 casos cobertos por PR-T1.5.
- Teste de consistência: 20–30 casos documentados com saída estruturada esperada.
- READINESS_G1.md com smoke documental de PR-T1.0 a PR-T1.5.

---

## 9. Bloqueios

- T2 permanece bloqueada até G1 aprovado via PR-T1.R.
- PR-T1.1 bloqueada até PR-T1.0 concluída (este contrato ativo).
- Cada PR T1.x bloqueada até a anterior estar encerrada com Bloco E.
- Qualquer execução de LLM real, Supabase produtivo ou runtime bloqueada durante T1.

---

## 10. Próximo passo autorizado

PR-T1.1 — Separação canônica tom × regra × veto × sugestão × repertório.

---

## 11. Relação com o A01

Fase T1 do A01 — "Constituição do agente e contrato cognitivo canônico" — Semanas 2–3 — prioridade 2.
Entregável da frente: system prompt canônico + manual de fatos e objetivos.
Gate de saída: G1 — contrato assinado.

---

## 12. Relação com legados aplicáveis

- **L19 (Memorial do Programa / Analista MCMV)** — obrigatório: fonte das regras substantivas do
  MCMV, exigências por perfil e identidade do analista virtual que fundamentam a constituição do agente.
- **L03 (Mapa Canônico do Funil)** — obrigatório: stages, gates e transições do funil que o LLM precisa
  conhecer para conduzir a conversa sem perder o objetivo operacional do turno.
- **L04–L17** — complementares: regras de negócio por segmento (topo, Meio A, Meio B, Especiais,
  Final) — consultados na PR-T1.1 para separação de regras vs. estilo.
- **L18** — complementar: critérios de aceite e QA — consultado em PR-T1.R para bateria adversarial.
- **C01–C09** — estrutura reservada; títulos não confirmados via PDF; não bloqueiam T1.

---

## 13. Referências obrigatórias do contrato

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — seção T1 (pp. 5–6 do PDF)
2. `schema/A00_PLANO_CANONICO_MACRO.md`
3. `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
4. `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
5. `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02) — leitura obrigatória em toda PR T1
6. `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03)
7. `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
8. `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`
9. `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
10. `schema/CONTRACT_SCHEMA.md`
11. `schema/legacy/INDEX_LEGADO_MESTRE.md`
12. `schema/implantation/READINESS_G0.md`
13. `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md`
14. `schema/implantation/INVENTARIO_REGRAS_T0.md`
15. `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md`
16. `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md`
17. `schema/implantation/MATRIZ_RISCO_T0.md`
18. `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md`
19. `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` — seções PR-T1.0 a PR-T1.R
20. `schema/CODEX_WORKFLOW.md`

---

## 14. Blocos legados aplicáveis

### Obrigatórios (ler antes de qualquer execução T1)

| Bloco | Nome | Motivo de obrigatoriedade |
|-------|------|--------------------------|
| L19 | Memorial do Programa / Analista MCMV | Regras substantivas do MCMV e identidade do analista virtual — fundação da constituição do agente |
| L03 | Mapa Canônico do Funil | Stages, gates e transições — contexto operacional que o LLM precisa conhecer |

### Complementares (consultar conforme contexto da PR)

| Bloco | Nome | Quando consultar |
|-------|------|-----------------|
| L04–L06 | Topo do Funil | PR-T1.1: separar regras de topo vs. estilo de fala |
| L07–L10 | Meio A (composição familiar) | PR-T1.1: separar regras de composição vs. tom |
| L11–L14 | Meio B (regime/renda) | PR-T1.1: separar regras de renda/regime vs. estilo |
| L15–L16 | Especiais (P3/multi/familiar) | PR-T1.1: regras especiais vs. comportamento |
| L17 | Final Operacional / Docs / Visita | PR-T1.1/T1.3: regras de transição final vs. repertório |
| L18 | Runner / QA / Telemetria | PR-T1.R: critérios de aceite e bateria adversarial |
| C01–C09 | Documentos Complementares | Estrutura reservada — não confirmados; não bloqueiam T1 |

---

## 15. Ordem mínima de leitura da frente

`L19 → L03`

(L04–L17 conforme segmento sendo especificado na PR; L18 em PR-T1.R.)

---

## 16. Quebra de PRs da T1

| PR | Nome canônico | Entregável principal | Dependência | Estado |
|----|--------------|---------------------|------------|--------|
| PR-T1.0 | Abertura do contrato cognitivo canônico (governança) | `CONTRATO_IMPLANTACAO_MACRO_T1.md` preenchido | G0 aprovado | **concluída** |
| PR-T1.1 | Separação canônica: tom × regra × veto × sugestão × repertório | `schema/implantation/T1_CAMADAS_CANONICAS.md` | PR-T1.0 | **concluída** |
| PR-T1.2 | System prompt canônico em camadas (sem ambiguidade central) | `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` | PR-T1.1 | **concluída** |
| PR-T1.3 | Taxonomia oficial (facts/objetivos/pendências/conflitos/riscos/ações) | `schema/implantation/T1_TAXONOMIA_OFICIAL.md` | PR-T1.2 | **desbloqueada** |
| PR-T1.4 | Contrato de saída do agente (reply_text + facts + objetivo + flags + bloqueios) | `schema/implantation/T1_CONTRATO_SAIDA.md` | PR-T1.3 | bloqueada |
| PR-T1.5 | Comportamentos canônicos e proibições | `schema/implantation/T1_COMPORTAMENTOS_E_PROIBICOES.md` | PR-T1.4 | bloqueada |
| PR-T1.R | Readiness e closeout do gate G1 | `schema/implantation/READINESS_G1.md` + arquivo T1 + skeleton T2 | PR-T1.5 | bloqueada |

---

## 17. Gate G1

**Gate de entrada (para abrir T1):** G0 aprovado — satisfeito via `READINESS_G0.md` em 2026-04-23.

**Gate de saída (G1 — para abrir T2):** contrato cognitivo aprovado.

Condições de aprovação de G1:
- PR-T1.0 a PR-T1.5 encerradas com Bloco E válido.
- System prompt canônico sem ambiguidades centrais.
- Taxonomia oficial publicada com todos os tipos cobertos.
- Formato de saída fixado com pelo menos 5 cenários.
- Comportamentos canônicos e proibições completos.
- Bateria adversarial documentada.
- Nenhum artefato T1 permite fala mecânica ou resposta pré-montada.
- `READINESS_G1.md` declarando G1 APROVADO.

**Condição de rollback de T1:** contrato permite "resposta bonita mas operacionalmente frouxa" → T1 não fecha → G1 não aprovado → T2 permanece bloqueada.

---

## Histórico de atualizações do contrato

### 2026-04-23 — PR-T1.0: contrato aberto formalmente

- Skeleton criado em PR-T0.R substituído por corpo formal conforme CONTRACT_SCHEMA.md.
- Objetivo, escopo, critérios de aceite, quebra de PRs e gate G1 definidos.
- PR-T1.1 desbloqueada.
- Próximo passo: PR-T1.1 — Separação canônica tom × regra × veto × sugestão × repertório.
