# CONTRATO — Core Mecânico 2 — ENOVA 2

| Campo                             | Valor                                                                                     |
|-----------------------------------|-------------------------------------------------------------------------------------------|
| Frente                            | Core Mecânico 2                                                                           |
| Fase do A01                       | Fase 0 → Fase 2 (fundação documental → Core + Speech + Supabase mínimo)                  |
| Prioridade do A01                 | Prioridade 1 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala |
| Dependências                      | Trio-base (A00 + A01 + A02) aprovado; CODEX_WORKFLOW operacional; camada contratual operacional; encontrabilidade contratual endurecida |
| Legados aplicáveis                | L03, L04, L05, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15, L16, L17               |
| Referências obrigatórias          | A00, A01, A02, CONTRACT_EXECUTION_PROTOCOL, schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md, schema/legacy/INDEX_LEGADO_MESTRE.md, schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf, schema/CONTRACT_SOURCE_MAP.md |
| Blocos legados obrigatórios       | L03, L04, L05, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15, L16, L17               |
| Blocos legados complementares     | L01, L02, L18, L19, C*                                                                    |
| Ordem mínima de leitura da frente | L03 → L04→L06 (topo) → L07→L10 (Meio A) → L11→L14 (Meio B) → L15→L16 (Especiais) → L17 (Final) |
| Status                            | Aberto                                                                                    |
| Última atualização                | 2026-04-20T17:47:00Z                                                                      |

---

## DECLARAÇÃO DE SUBORDINAÇÃO E NÃO-SUBSTITUIÇÃO

> **Este contrato ativo NÃO substitui, NÃO resume e NÃO reinterpreta o contrato macro da ENOVA 2.**
>
> A fonte suprema de verdade contratual é o PDF mestre em:
> `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`
>
> Os documentos canônicos que o alimentam:
> - **PDF 1** — Plano Canônico Macro (A00) — pp. 1–10
> - **PDF 2** — Contrato de Implantação (A01) — pp. 1–8
>
> Este contrato ativo é uma **camada operacional vinculada** ao contrato macro.
> Ele existe para organizar a execução do Core Mecânico 2 por etapas, com âncora explícita
> ao plano macro e ao PDF-fonte, sem drift e sem criatividade contratual.

---

## PDF CONSULTADO NESTA ABERTURA

O PDF-fonte (`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`) foi consultado diretamente na abertura deste contrato.

Seções e páginas efetivamente lidas para fundamentar este contrato ativo:

| Documento | Seção/Trecho | Páginas | Uso neste contrato |
|-----------|-------------|---------|-------------------|
| PDF 1 — Plano Canônico Macro | Tese central | p. 1 | Fundamento da soberania conversacional e da governança presa |
| PDF 1 — Plano Canônico Macro | Sec. 1 — Decisão estratégica | p. 1–2 | LLM como motor principal da conversa |
| PDF 1 — Plano Canônico Macro | Sec. 3 — Arquitetura-alvo (Camadas 1–6) | p. 3 | Separação de soberanias; Policy Engine sem linguagem |
| PDF 1 — Plano Canônico Macro | Sec. 4 — Princípios canônicos de engenharia | p. 3 | "Conversa livre; governança presa" |
| PDF 1 — Plano Canônico Macro | Sec. 5 — Modelo de estado estruturado | p. 3–4 | Facts, pendências, conflitos, objetivo atual |
| PDF 1 — Plano Canônico Macro | Sec. 6 — Classes de policy | p. 4 | Obrigatória, bloqueio, roteamento, sugestão mandatória, confirmação, compliance de fala |
| PDF 2 — Contrato de Implantação | Princípio jurídico-operacional | p. 1 | LLM com liberdade conversacional, não decisória irrestrita |
| PDF 2 — Contrato de Implantação | Objeto do contrato | p. 1 | LLM conduz; estado + políticas + validações preservam previsibilidade |
| PDF 2 — Contrato de Implantação | Cláusulas-mestras 1–6 | p. 1–2 | Preservação de negócio, liberdade com governança, estado, política explícita, cutover por provas, rollback |
| PDF 2 — Contrato de Implantação | Não negociáveis | p. 2 | Regras inegociáveis do funil (casado civil, autônomo/IR, renda solo, estrangeiro sem RNM) |
| PDF 2 — Contrato de Implantação | Gates G0–G7 | p. 4–5 | Gates de implantação por frente |
| PDF 2 — Contrato de Implantação | Critérios de aceite executivos | p. 5 | Critérios funcionais, de política, telemetria, regressão e rollback |
| PDF 2 — Contrato de Implantação | Encerramento executivo | p. 8 | "liberdade conversacional com governança dura" |

---

## PRECEDÊNCIA DOCUMENTAL OFICIAL

A precedência documental deste contrato é, em ordem descendente:

```
A00 > A01 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato ativo do Core (este documento)
    > documentos legados aplicáveis > PDF-fonte como árbitro da cláusula macro em caso de dúvida textual
```

**Regra de conflito, ambiguidade ou lacuna:**
Em caso de conflito entre este contrato ativo e qualquer documento de precedência superior, prevalece o documento de nível mais alto.
Em caso de ambiguidade ou lacuna, o agente deve **parar** e consultar diretamente o PDF-fonte (`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`) antes de prosseguir.

**Proibição absoluta:** este contrato ativo não pode contradizer, enfraquecer, resumir livremente ou reinterpretar cláusulas do A00, A01, A02 ou do PDF-fonte.

---

## 1. Título

CONTRATO — Core Mecânico 2 — ENOVA 2

---

## 2. Objetivo

Modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala.

> **Âncora-fonte:** A01, seção 5, Prioridade 1: "Prioridade 1 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala."
>
> **Âncora-fonte:** A00, seção 8.5: "Policy / Mechanical Core: aplica as regras do MCMV, do funil e da composição familiar; decide o que foi aceito, o que precisa confirmar e qual próximo objetivo operacional autorizado."

---

## 3. Escopo

O escopo deste contrato é exclusivamente o que o A01 e o A00 definem para o Core Mecânico 2:

1. **Modelo de objetivos/stages com decisão previsível** — conforme A01 seção 7 (entregável mínimo do Core Mecânico 2): "Contrato + modelo de objetivos/stages + decisão previsível".
2. **Desacoplamento total da fala** — o Core decide regra e stage; o Speech monta resposta. Conforme A00 seção 4.2: "O mecânico segue soberano em parse, gates, next-step autorizado, critérios de elegibilidade e persistência estrutural. O LLM não decide regra de negócio." E A00 seção 8.5 vs 8.6: Policy/Core é camada separada do Speech Engine.
3. **Smoke de trilho e next step autorizado** — conforme A01 seção 7 (prova mínima do Core): "Smoke de trilho e next step autorizado".
4. **Validação estrutural mínima** — o mecânico valida: objetivo atual, facts mínimos obrigatórios, policy/gates, bloqueios, próximo passo autorizado. Conforme A00 seção 8.5.
5. **Aplicação das regras do MCMV, funil e composição familiar** — conforme A00 seção 4.1: "O negócio manda. As regras do MCMV, do funil e das microregras legadas são a fonte de verdade de negócio." E A00 seção 8.5.

Cada item acima deve ser executado em PRs futuras subordinadas a este contrato, com âncora contratual explícita.

---

## 4. Fora de escopo

O que este contrato **NÃO** autoriza:

1. Criar speech engine, surface, resposta ao cliente ou qualquer camada de fala.
2. Criar extractor, parser ou camada de extração de sinais/slots.
3. Criar persistência no Supabase ou adapter de gravação.
4. Criar integração com canal Meta/WhatsApp.
5. Criar pipeline de áudio ou multimodalidade.
6. Criar telemetria, admin ou observabilidade.
7. Abrir rollout, shadow mode, canary ou cutover.
8. Criar worker funcional completo (além do scaffold placeholder já existente).
9. Alterar A00, A01 ou A02 sem revisão formal.
10. Resumir livremente, parafrasear ou reinterpretar cláusulas do PDF-fonte.

> **Âncora-fonte:** A01 seção 3 — cada frente é separada. A01 seção 6 — gates de bloqueio. A00 seção 5-6 — escopo e fora de escopo do plano macro.

---

## 5. Dependências

Todas as dependências abaixo estão satisfeitas:

| Dependência | Status | Referência |
|-------------|--------|------------|
| Trio-base canônico (A00 + A01 + A02) | ✅ Concluído | PR #2 |
| CODEX_WORKFLOW com 16 etapas | ✅ Concluído | PR #3 |
| Camada contratual (INDEX, EXECUTION, CLOSEOUT) | ✅ Concluído | PR #8 |
| CONTRACT_SCHEMA | ✅ Concluído | PR #8, expandido PR #12 |
| STATUS_SCHEMA + HANDOFF_SCHEMA | ✅ Concluído | PR #3, expandido PR #13 |
| TASK_CLASSIFICATION | ✅ Concluído | PR #3 |
| Bootstrap Cloudflare Workers (wrangler.toml + entrypoint placeholder) | ✅ Concluído | PR #7 |
| Pipeline de deploy GitHub Actions | ✅ Concluído | PR #7 |
| PR Governance Gate | ✅ Concluído | PR #9 |
| Organização documental do legado mestre | ✅ Concluído | PR #12 |
| Encontrabilidade contratual + rastreabilidade de fontes | ✅ Concluído | PR #13 |

> **Âncora-fonte:** A01 seção 6, Gate 1: "Gate 1 — sem contrato da frente, não começa implementação." Este contrato satisfaz o Gate 1.

---

## 6. Entradas

Os seguintes artefatos devem existir antes do início da execução de qualquer PR subordinada a este contrato:

1. Este contrato ativo, aprovado e registrado em `schema/contracts/_INDEX.md`.
2. `schema/A00_PLANO_CANONICO_MACRO.md` — plano macro.
3. `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md` — backlog e ordem executiva.
4. `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md` — índice mestre.
5. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — PDF-fonte bruto canônico.
6. `schema/legacy/INDEX_LEGADO_MESTRE.md` — índice operacional do legado mestre.
7. `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` — protocolo de execução.
8. `schema/CONTRACT_SOURCE_MAP.md` — mapa de fontes e ponte documental.
9. Blocos legados obrigatórios (L03–L17) — consultados via PDF-fonte (blocos não transcritos no markdown).

---

## 7. Saídas

Ao final da execução completa deste contrato, devem existir:

1. **Modelo de objetivos/stages** — definição formal dos stages do funil e dos objetivos do Core, com regras de transição, conforme os blocos L03–L17 do legado mestre.
2. **Decisão previsível** — dado um estado de conversa e um stage, o Core deve produzir decisão previsível e verificável (next step autorizado, gates aplicáveis, bloqueios).
3. **Desacoplamento total da fala** — o Core emite decisão e estado estruturado; o Speech Engine monta a resposta final. Nenhuma camada do Core define phrasing ou escreve resposta ao cliente.
4. **Smoke de trilho** — evidência verificável de que o Core transita corretamente entre stages, aplica gates e emite next step autorizado sem drift.

> **Âncora-fonte:** A01 seção 7, coluna "Entregável mínimo" e "Prova mínima" do Core Mecânico 2.

---

## 8. Critérios de aceite

1. Existe modelo formal de objetivos/stages derivado dos blocos L03–L17 do legado.
2. Dado um estado de entrada, o Core produz decisão determinística e next step autorizado.
3. O Core não emite phrasing, resposta final ou qualquer texto voltado ao cliente.
4. Gates do funil são aplicados conforme regras dos blocos L03–L17.
5. Smoke test de trilho demonstra transição correta entre pelo menos 3 stages (topo, meio, gate).
6. Nenhuma regra de negócio do Core é inventada fora dos blocos L03–L17 do legado ou do PDF-fonte.
7. O worker funcional do Core opera de forma desacoplada do Speech Engine.

> **Âncora-fonte:** A01 seção 7 — "Contrato + modelo de objetivos/stages + decisão previsível" e "Smoke de trilho e next step autorizado".

---

## 9. Provas obrigatórias

1. Diff/PR mostrando o modelo de objetivos/stages implementado.
2. Smoke test de trilho: entrada → decisão → next step autorizado (pelo menos 3 cenários).
3. Evidência de que o Core não emite phrasing (inspeção de código).
4. Evidência de que gates são aplicados (smoke test com bloqueio ativado).
5. Referência explícita ao bloco legado (L03–L17 ou PDF-fonte) para cada regra implementada.

---

## 10. Bloqueios

1. **Sem contrato ativo aberto**: bloqueio removido por esta PR (Gate 1 do A01 satisfeito).
2. **Blocos legados não transcritos**: os blocos L03–L17 não estão transcritos no markdown. A execução deve consultar diretamente o PDF-fonte para cada bloco necessário. Não é bloqueio absoluto, mas requer declaração explícita de consulta ao PDF.
3. **Token Cloudflare**: verificar permissão `Workers Scripts:Edit` antes do primeiro deploy real. Aviso preventivo herdado das PRs anteriores.

---

## 11. Próximo passo autorizado

Após a abertura deste contrato (esta PR), o próximo passo autorizado é:

**Primeira PR contratual de execução do Core Mecânico 2**, que deve:
- Ser classificada como `contratual`
- Declarar vínculo contratual com este contrato ativo
- Executar um recorte específico e limitado deste contrato
- Apontar cláusula-fonte, página-fonte, gate-fonte e evidência exigida (conforme `CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md`)
- Respeitar a ordem de execução derivada da ordem mínima de leitura: L03 → topo → Meio A → Meio B → Especiais → Final

> **Âncora-fonte:** A01 seção 12: "o próximo passo autorizado é abrir ou revisar o contrato da frente ativa inicial: Core Mecânico 2."

---

## 12. Relação com o A01

| Campo | Valor |
|-------|-------|
| Fase | Fase 0 → Fase 2 |
| Prioridade | Prioridade 1 |
| Item | Modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala |
| Gate aplicável | Gate 1 — sem contrato da frente, não começa implementação (satisfeito por esta PR) |
| Gate seguinte | Gate 2 — sem smoke da frente, não promove para a frente seguinte |

---

## 13. Relação com legados aplicáveis

Conforme A02 seção 5 (amarração de legados ao Core Mecânico e Policy Engine):

> "Core Mecânico e Policy Engine: L03 + L04-L17. Nova máquina de decisão usa regras legadas sem herdar as 35k linhas."

Os blocos L03–L17 são fonte de verdade de negócio para este contrato. Eles alimentam as regras de stages, gates, transições, composição familiar, regime, renda, elegibilidade, trilhos especiais e finalização do funil.

---

## 14. Referências obrigatórias do contrato

- `schema/A00_PLANO_CANONICO_MACRO.md`
- `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
- `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
- `schema/CONTRACT_SCHEMA.md`
- `schema/CONTRACT_SOURCE_MAP.md`
- `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
- `schema/legacy/INDEX_LEGADO_MESTRE.md`
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`
- `schema/contracts/active/CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md`
- `schema/contracts/active/CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md`

---

## 15. Blocos legados aplicáveis

### Obrigatórios

| Bloco | Nome canônico | Função para o Core | Status de incorporação |
|-------|--------------|--------------------|-----------------------|
| L03 | Mapa Canônico do Funil | Stages, gates, transições e microregras do funil — referência central | Identificado estruturalmente — não transcrito |
| L04 | Topo do Funil — Contrato | Contrato e regras operacionais do topo | Identificado estruturalmente — não transcrito |
| L05 | Topo do Funil — Parser | Parser e critérios de extração do topo | Identificado estruturalmente — não transcrito |
| L06 | Topo do Funil — Critérios | Critérios de aceite e validação do topo | Identificado estruturalmente — não transcrito |
| L07 | Meio A — Estado Civil (Parte 1) | Regras de estado civil e composição familiar | Identificado estruturalmente — não transcrito |
| L08 | Meio A — Estado Civil (Parte 2) | Continuação de regras de composição por estado civil | Identificado estruturalmente — não transcrito |
| L09 | Meio A — Composição Familiar (Parte 1) | Microregras de composição familiar | Identificado estruturalmente — não transcrito |
| L10 | Meio A — Composição Familiar (Parte 2) | Continuação de microregras de composição familiar | Identificado estruturalmente — não transcrito |
| L11 | Meio B — Regime e Renda (Parte 1) | Regras de regime de bens, renda e IR | Identificado estruturalmente — não transcrito |
| L12 | Meio B — Regime e Renda (Parte 2) | Continuação de regras de regime e renda | Identificado estruturalmente — não transcrito |
| L13 | Meio B — CTPS e Dependentes | Regras de CTPS, dependentes e restrições | Identificado estruturalmente — não transcrito |
| L14 | Meio B — Gates e Restrições | Gates de bloqueio e restrições de elegibilidade do Meio B | Identificado estruturalmente — não transcrito |
| L15 | Especiais — Trilhos P3 / Multi | Trilhos especiais e variantes P3 e multi-proponente | Identificado estruturalmente — não transcrito |
| L16 | Especiais — Familiar e Variantes | Composição familiar especial e variantes | Identificado estruturalmente — não transcrito |
| L17 | Final Operacional / Docs / Visita | Transição final, documentos, handoff e visita | Identificado estruturalmente — não transcrito |

### Complementares

| Bloco | Quando consultar |
|-------|-----------------|
| L01, L02 | Quando necessário contexto histórico ou continuidade estratégica |
| L18 | Ao abrir frentes de QA, rollout ou telemetria do Core |
| L19 | Ao tratar interpretação de perfil ou política do programa MCMV |
| C* | Após confirmação dos títulos e funções via leitura direta do PDF |

> **Nota:** todos os blocos obrigatórios têm status "Identificado estruturalmente — não transcrito". A execução deste contrato DEVE consultar o PDF-fonte (`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`) para cada bloco necessário e declarar explicitamente a consulta.

---

## 16. Ordem mínima de leitura da frente

Conforme `INDEX_LEGADO_MESTRE.md`:

```
L03 → L04→L06 (topo) → L07→L10 (Meio A) → L11→L14 (Meio B) → L15→L16 (Especiais) → L17 (Final)
```

---

## CLÁUSULA CENTRAL: SOBERANIA CONVERSACIONAL E PAPEL DO MECÂNICO

> **Esta cláusula é a cláusula mais importante deste contrato.**
> Ela define a separação entre o que o LLM faz e o que o mecânico faz.
> Ela NÃO pode ser enfraquecida, resumida livremente ou reinterpretada.

### O LLM é soberano na fala e na condução conversacional

> **Âncora-fonte (PDF 1, p. 1 — Tese central):** "a Enova deve sair de uma arquitetura centrada em trilhos rígidos e múltiplos motores sobrepostos para uma arquitetura em que o LLM seja o motor principal da conversa, enquanto a governança fica presa em políticas explícitas, memória estruturada, validações mínimas e telemetria forte."
>
> **Âncora-fonte (PDF 2, p. 1 — Princípio jurídico-operacional):** "o LLM terá liberdade conversacional, mas jamais liberdade decisória irrestrita. Decisão operacional, persistência de fatos críticos, avanço de objetivo e desbloqueio de cenários sensíveis devem obedecer ao contrato de políticas, estado e validações mínimas aqui instituído."
>
> **Âncora-fonte (PDF 2, p. 1 — Cláusula 2 — Liberdade com governança):** "O agente pode variar fala, tom, ordem natural de acolhimento e tratamento multimodal, mas não pode descumprir política obrigatória."
>
> **Âncora-fonte (A00, seção 4.4 — derivado do PDF 1):** "O LLM **pode ser natural, rico e consultivo**, mas nunca livre para pular estágio, inventar coleta ou contradizer a política."
>
> **Âncora-fonte (A00, seção 8.6 — derivado do PDF 1, Sec. 3):** "Speech Engine: monta uma **única resposta final, natural e contextual**, obedecendo o contrato do stage/objetivo atual."

O LLM é o motor principal da conversa. Ele:
- monta a resposta final ao cliente (via Speech Engine);
- conduz a conversa com naturalidade;
- é soberano na fala, no phrasing e na condução conversacional;
- opera sob contrato do stage/objetivo atual, mas com liberdade de expressão natural.

### O mecânico NÃO é soberano da conversa

> **Âncora-fonte (PDF 1, p. 3 — Sec. 3, Camada 4 — Policy Engine):** "Aplica regras obrigatórias, bloqueios, confirmações, sugestões mandatórias e roteamentos, **sem determinar a linguagem da conversa**."
>
> **Âncora-fonte (PDF 1, p. 3 — Sec. 4 — Princípios canônicos):** "Conversa livre; governança presa."
>
> **Âncora-fonte (A00, seção 4.2 — derivado do PDF 1 + PDF 2):** "**O mecânico segue soberano em parse, gates, next-step autorizado, critérios de elegibilidade e persistência estrutural. O LLM não decide regra de negócio.**"
>
> **Âncora-fonte (A00, seção 8.5 — derivado do PDF 1, Sec. 3):** "Policy / Mechanical Core: aplica as regras do MCMV, do funil e da composição familiar; **decide o que foi aceito, o que precisa confirmar e qual próximo objetivo operacional autorizado.**"

O mecânico existe apenas para validação estrutural mínima:
- **objetivo atual** — qual stage/objetivo está ativo
- **facts mínimos obrigatórios** — quais dados já existem e quais faltam
- **policy/gates** — quais regras e gates se aplicam no estado atual
- **bloqueios** — quais condições impedem avanço
- **próximo passo autorizado** — qual é o único next step válido

### O que o mecânico NÃO faz

O mecânico:
- **NÃO define phrasing** — quem monta a fala é o Speech Engine / LLM
- **NÃO escreve resposta final** — a surface final pertence ao Speech Engine
- **NÃO pode virar trilho de texto rígido** — ele emite decisão estruturada, não texto pro cliente
- **NÃO compete pela fala** — âncora direta: PDF 1, p. 3, Sec. 3: "O LLM conversa livremente; a decisão, o avanço e a conformidade são controlados por estruturas externas e explícitas." | A00 seção 4.3: "Uma única surface final por turno. Nenhuma outra camada pode competir pela fala final depois que a resposta for montada."

### Governança presa em políticas, estado estruturado, validações mínimas e telemetria

> **Âncora-fonte (PDF 2, p. 1 — Objeto do contrato):** "substituir de forma controlada os motores atuais por uma arquitetura única em que o LLM conduz a interação, enquanto **estado estruturado, políticas explícitas, validações mínimas e telemetria canônica** preservam previsibilidade, segurança e auditabilidade."
>
> **Âncora-fonte (PDF 2, p. 8 — Encerramento executivo):** "O modelo aprovado neste pacote segue uma terceira via: **liberdade conversacional com governança dura**. Essa é a fundação oficial da substituição estrutural da Enova."
>
> **Âncora-fonte (A00, seção 3 — derivado do PDF 1):** "A ENOVA 2 deve operar com **quatro soberanias claramente separadas**: (1) Policy/Core decide regra e stage; (2) Extractor transforma fala livre em sinais estruturados; (3) Speech Engine monta a resposta final; (4) Persistence Adapter grava estado, evidências e memória operacional no Supabase."

A governança operacional fica presa em:
1. **Políticas explícitas** — regras do MCMV, funil, microregras, gates (blocos L03–L17); conforme PDF 1, Sec. 6, p. 4: "As regras devem ser escritas de forma declarativa, expansível e auditável."
2. **Estado estruturado** — state machine do Core com stages, facts, next step; conforme PDF 1, Sec. 5, p. 3: facts centrais, facts derivados, pendências, conflitos, objetivo atual.
3. **Validações mínimas** — gates, critérios de elegibilidade, restrições; conforme PDF 2, p. 4–5: Gates G0–G7 e critérios de aceite executivos.
4. **Telemetria** — registro de causas, arbitragens, divergências, confiança; conforme PDF 2, p. 5: "Critério de telemetria: gera evidência suficiente para auditoria do turno e da decisão."

> **Proibição formal (PDF 2, p. 8):** "a segunda [falha] é trocar esse mecânico por um LLM solto, bonito e perigoso." Nenhuma PR futura subordinada a este contrato pode reintroduzir comportamento de "trilho de texto rígido" no mecânico. O mecânico emite decisão e estado; a fala pertence ao LLM/Speech Engine.

---

## REGRA DE PARADA CONTRATUAL

Se, durante a execução de qualquer PR subordinada a este contrato, o agente encontrar:

1. **Falta de âncora contratual explícita** — a PR tenta implementar regra que não tem referência ao bloco legado (L03–L17) ou ao PDF-fonte → **PARAR**
2. **Dúvida interpretativa** — não é claro qual regra do legado se aplica → **PARAR** e consultar PDF-fonte
3. **Expansão de escopo fora da cláusula** — a PR tenta adicionar funcionalidade não prevista neste contrato → **PARAR**
4. **Conflito com o contrato macro** — a implementação contradiz A00, A01, A02 ou PDF-fonte → **PARAR**
5. **Tentativa de criar phrasing ou resposta final no Core** — viola a cláusula central de soberania → **PARAR**

Ver também: `schema/contracts/active/CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md`

---

## ABERTURA DO CONTRATO — REGISTRO FORMAL

```
Contrato aberto:           CONTRATO — Core Mecânico 2 — ENOVA 2
Data de abertura:          2026-04-20T17:47:00Z
PR que abriu:              PR desta abertura (governança)
Classificação da tarefa:   governança
Contrato anterior:         Nenhum — primeira abertura
Status:                    Aberto
Execução funcional:        Nenhuma — contrato aberto sem implementação
Próximo passo autorizado:  Primeira PR contratual de execução do Core Mecânico 2
```
