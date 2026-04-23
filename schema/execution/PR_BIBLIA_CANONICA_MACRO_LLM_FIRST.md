# PR_BIBLIA_CANONICA_MACRO_LLM_FIRST — Bíblia Canônica de Execução por PRs — ENOVA 2

> **Este documento é a tradução fiel do macro soberano em
> `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` para um plano operacional de PRs.**
> Ele não cria macro novo. Ele organiza, explicita, operacionaliza e trava a sequência
> de execução do que o mestre já manda.
>
> Em qualquer conflito entre esta Bíblia e o mestre em `schema/source/`, **prevalece o mestre**.
> Em qualquer conflito entre esta Bíblia e os documentos derivados (A00, A01, A02, contratos,
> handoffs, status), **prevalece esta Bíblia em sua tradução do mestre** — e qualquer divergência
> deve ser corrigida no documento derivado, não no mestre.
>
> **Uso obrigatório.** Nenhuma PR futura da implantação macro pode nascer fora desta Bíblia.
> A leitura desta Bíblia é exigida em toda PR (ver `schema/execution/PR_EXECUTION_TEMPLATE.md`)
> e o handoff obrigatório de toda PR concluída segue
> `schema/handoffs/PR_HANDOFF_TEMPLATE.md`.

---

## A. Base soberana e precedência

**Base macro soberana (única fonte do macro):**
`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

**Cadeia de precedência documental aplicável a esta Bíblia:**

```
schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  > A00 (schema/A00_PLANO_CANONICO_MACRO.md)
    > A01 (schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md)
      > A00-ADENDO-01 (schema/ADENDO_CANONICO_SOBERANIA_IA.md)
        > A02 (schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md)
          > schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md
            > Contrato/fase ativa em schema/contracts/active/
              > Documentos legados aplicáveis (schema/legacy/, schema/source/.pdf)
```

**Regras duras de precedência:**

1. O mestre manda nas fases macro, gates, microetapas, critérios de pronto e rollback.
2. O A00 manda na arquitetura macro, na precedência documental e nas frentes oficiais.
3. O A01 manda na ordem operacional (T0-T7) e nos gates de bloqueio.
4. O A02 manda no pacote mínimo de documentos por aba.
5. O contrato ativo manda no escopo executável da PR atual.
6. O legado manda nas regras de negócio.

---

## B. Ordem macro oficial (derivada do mestre)

A ordem macro de implantação é **T0 → T1 → T2 → T3 → T4 → T5 → T6 → T7**, conforme
o cronograma tático mestre (mestre, "Cronograma tático mestre" e "Detalhamento por
frente e microetapas"):

| Fase | Janela-base do mestre | Objetivo macro | Saída concreta | Dependência | Gate |
|------|-----------------------|----------------|----------------|-------------|------|
| T0 | Semana 1 | Congelar mudanças, mapear o legado vivo, fluxos, estados, parsers, dependências e riscos | Inventário aprovado | — | G0 — Inventário aprovado |
| T1 | Semanas 2–3 | Constituição do agente: contrato cognitivo, taxonomia, formato de saída, políticas proibitivas | System prompt canônico + manual de fatos e objetivos | T0 | G1 — Contrato assinado |
| T2 | Semanas 4–5 | Estado estruturado, memória, reconciliação | Lead state v1 persistido e auditável | T1 | G2 — Estado validado |
| T3 | Semanas 6–7 | Policy engine v1, regras obrigatórias, veto leve, guardrails declarativos | Motor declarativo com testes críticos | T2 | G3 — Políticas críticas aprovadas |
| T4 | Semanas 8–9 | Orquestrador de turno LLM-first (entrada → interpretação → validação → resposta → persistência) | Turno estável, auditável, com fallback e flags | T2 + T3 | G4 — Turno estável |
| T5 | Semanas 10–12 | Migração do funil core (topo + qualificação + renda + elegibilidade) por fatias com shadow | Paridade funcional dos fluxos prioritários | T4 | G5 — Paridade comprovada |
| T6 | Semanas 13–14 | Acoplar docs, áudio, imagem, sticker — multimodal sob mesma governança | Governança multicanal em sombra | T5 | G6 — Canais controlados |
| T7 | Semanas 15–16 (+ buffer) | Shadow, canary, cutover, desligamento do legado | Go-live com fallback e rollback | T6 | G7 — Go/no-go executivo |

**Nenhuma fase abre sem o gate da anterior aprovado.** Esta é a regra que esta Bíblia
trava em PRs.

---

## C. Gates oficiais (derivados do mestre)

Os gates abaixo são extraídos textualmente do mestre, na seção "Critérios de pronto por
fase" e nas regras de rollback de cada frente.

| Gate | Fase | Condição mínima de pronto (mestre) | Dono operacional do gate |
|------|------|-------------------------------------|--------------------------|
| **G0** | T0 | Mapa do legado aprovado, riscos classificados e dependências de desligamento identificadas | Direção + Arquitetura |
| **G1** | T1 | Contrato cognitivo validado, formato de saída estável e políticas proibitivas documentadas | Arquitetura/Contrato |
| **G2** | T2 | Estado versionado persistindo fatos com origem, confiança e conflito auditável | Estado/Persistência |
| **G3** | T3 | Regras críticas da Enova codificadas em política declarativa com suíte mínima de testes | Policy/Orquestração |
| **G4** | T4 | Ciclo de turno completo funcionando com degradação segura, observabilidade e custo medido | Policy/Orquestração + QA |
| **G5** | T5 | Fluxos prioritários com paridade funcional suficiente e divergências classificadas | QA/Telemetria + Operação |
| **G6** | T6 | Multimodal sob mesma governança sem explodir latência nem quebrar previsibilidade | Canais/Multimodal + QA |
| **G7** | T7 | Shadow mode, canary, rollback e desativação controlada do legado concluídos | Direção/Produto |

**Nenhum gate é declarado fechado por PR de execução isoladamente.** Todo fechamento
de gate exige PR de Readiness/Closeout (ver `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`).

---

## D. Misturas proibidas

Derivado do A01 §9, do CODEX_WORKFLOW §8 e da regra do mestre "Frente A frente, nunca
em paralelo sem necessidade comprovada":

1. **Não misturar frentes em uma mesma PR sem necessidade comprovada e documentada.**
   Frentes oficiais (A00 §11): Core Mecânico 2, Speech, Contexto/Extração/Memória,
   Supabase, Áudio/Multimodal, Meta/WhatsApp, Telemetria, Rollout.
2. **Não misturar fases (T0…T7) na mesma PR.** Cada PR pertence a exatamente uma fase.
3. **Não promover material de PR técnica/local arquivada a implantação macro sem
   passar pelo gate macro correspondente.** (Regra anti-atalho do `PLANO_EXECUTIVO_T0_T7.md`.)
4. **Não abrir T1 sem closeout de G0.** Vale para qualquer Tn → Tn+1.
5. **Não abrir áudio (T6) ou shadow/canary (T7) antes da fundação texto puro fechada.**
6. **Não misturar mudanças de schema persistido (Supabase) com refactor de fala (Speech).**
7. **Não misturar governança e implementação técnica na mesma PR** salvo quando o
   próprio macro pede esse acoplamento (ex.: contrato cognitivo de T1).
8. **Não introduzir LLM real, Supabase real produtivo, Meta real, STT/TTS real, shadow,
   canary ou cutover real antes da fase autorizada pelo macro.**

---

## E. Regras obrigatórias de leitura por PR

**Toda PR desta Bíblia deve ler obrigatoriamente, antes de qualquer execução:**

1. `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — tronco macro soberano.
2. `schema/CODEX_WORKFLOW.md` — fluxo obrigatório de 16 etapas.
3. `schema/A00_PLANO_CANONICO_MACRO.md`, `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`, `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`.
4. `schema/contracts/_INDEX.md` + contrato ativo da fase em `schema/contracts/active/`.
5. `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md` e `CONTRACT_CLOSEOUT_PROTOCOL.md`.
6. `schema/status/<FASE>_STATUS.md` e `schema/handoffs/<FASE>_LATEST.md` da fase ativa.
7. `schema/implantation/PLANO_EXECUTIVO_T0_T7.md`.
8. **Esta Bíblia (`schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`).**
9. **O último handoff de PR (`schema/handoffs/<FASE>_LATEST.md`)** preenchido conforme
   `schema/handoffs/PR_HANDOFF_TEMPLATE.md`.

Cada PR específica adiciona suas leituras (campo "arquivos/documentos a ler" do bloco
abaixo).

---

## F. PRs preparatórias / rebase / reorganização do repo

Derivam do estado atual do repo + da regra anti-atalho do mestre.
Algumas PRs preparatórias **já foram realizadas** e ficam aqui registradas como ponto
de origem da sequência; as demais permanecem autorizadas.

### PR-P0 — REBASE CANÔNICO DA IMPLANTAÇÃO (já executada — registro histórico)

| Campo | Conteúdo |
|-------|----------|
| ID lógico | `PR-P0` |
| Título canônico | `T0-PR1 — rebase canonico da implantacao` |
| Fase macro | Pré-T0 (preparatória) |
| Épico/microetapa do mestre | Reposicionamento canônico para T0-T7 (mestre, "Cronograma tático mestre" + "Critérios de pronto por fase") |
| Objetivo exato | Reposicionar o repo no macro T0-T7, corrigir índices/status/handoffs e abrir T0/G0 |
| Por que existe no macro | O repo carregava recortes técnicos arquivados como se fossem implantação macro concluída; o mestre exige T0-T7 explícito |
| Dependência da PR anterior | Nenhuma (origem) |
| Gate de entrada | — |
| Gate de saída esperado | T0 oficialmente aberto, G0 declarado pendente |
| Escopo incluído | A00/A01/A02 com adendo de rebase, criação de `schema/implantation/REBASE_CANONICO_…` e `PLANO_EXECUTIVO_T0_T7.md`, criação do contrato ativo T0, status/handoff macro, índices |
| Escopo proibido | Qualquer entrega de inventário, contrato cognitivo, código novo de runtime |
| Entregáveis obrigatórios | Documentos de rebase + contrato T0 ativo + índices coerentes |
| Testes/evidências mínimas | Diff coerente + leitura cruzada índices ↔ contrato ativo |
| Regra de rollback | Restaurar índices/status anteriores se rebase introduzir incoerência |
| Critérios de pronto | T0 ativo, G0 aberto, próximo passo = T0-PR2 |
| Arquivos a ler | A00, A01, A02, mestre, índices `_INDEX.md` |
| Handoff obrigatório | `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` |
| Próxima PR autorizada | **PR-P1 — Bíblia Canônica de PRs (esta PR)** |

### PR-P1 — BÍBLIA CANÔNICA DE PRs + TEMPLATES OBRIGATÓRIOS (esta PR)

| Campo | Conteúdo |
|-------|----------|
| ID lógico | `PR-P1` |
| Título canônico | `Pré-T0 — Bíblia canônica de PRs derivada do macro` |
| Fase macro | Pré-T0 (governança preparatória obrigatória) |
| Épico/microetapa do mestre | Tradução fiel do mestre em plano operacional de PRs (mestre, "Detalhamento por frente e microetapas") |
| Objetivo exato | Criar a Bíblia Canônica de PRs, o template de handoff e o template de abertura de PR; atualizar índices |
| Por que existe no macro | Sem Bíblia, cada PR vira improviso; o mestre exige sequência inviolável e gates explícitos |
| Dependência da PR anterior | PR-P0 (rebase canônico aplicado) |
| Gate de entrada | T0 ativo, G0 aberto, contrato T0 presente |
| Gate de saída esperado | Bíblia + templates publicados; nenhuma PR futura pode nascer fora deles |
| Escopo incluído | Criar `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`, `schema/handoffs/PR_HANDOFF_TEMPLATE.md`, `schema/execution/PR_EXECUTION_TEMPLATE.md`; atualizar README e índices vivos para apontar a Bíblia e o template |
| Escopo proibido | Inventário do legado vivo (T0-PR2), abertura de T1, mudanças em código de runtime, mudanças em dados Supabase, abertura de novos contratos de frente |
| Entregáveis obrigatórios | Os 3 documentos acima + atualização mínima de índices/README |
| Testes/evidências mínimas | Bíblia consistente com o mestre; templates exigem todos os campos da regra de handoff; README e índices linkam os novos artefatos; PR Governance Gate aprova body |
| Regra de rollback | Reverter os 3 documentos e a alteração dos índices |
| Critérios de pronto | Bíblia cobre T0..T7 + pós; templates obrigatórios publicados; índices/README apontam para eles |
| Arquivos a ler | mestre, A00/A01/A02, CODEX_WORKFLOW, índices vivos, PLANO_EXECUTIVO_T0_T7, contrato T0 |
| Handoff obrigatório | Atualizar `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` registrando que a Bíblia + templates estão publicados e que a próxima PR autorizada continua sendo a primeira PR de inventário de T0 |
| Próxima PR autorizada | **PR-T0.1 — Inventário de fluxos e estados vivos (T0-PR2)** |

---

## G. PRs de T0 — Congelamento, inventário e mapa do legado vivo

Microetapas obrigatórias no mestre (T0):
* Congelar mudanças estruturais no legado durante a janela de mapeamento; só entra hotfix comprovado.
* Listar todo ponto onde decisão hoje depende de parser, regex, fallback, heurística ou branch de stage.
* Classificar cada regra em: negócio, compliance, docs, UX, operação comercial, roteamento e exceção.
* Montar matriz de risco: o que quebra elegibilidade, tom, docs, telemetria.
* Inventário de desligamento futuro: o que sai primeiro, o que precisa conviver, o que deve permanecer.
* Pacote mínimo de testes: smoke read-only sobre fluxos reais; recorte de leads reais; checklist de completude.
* Rollback de frente: se inventário não fechar, T1 não abre.

Estas microetapas são quebradas em PRs T0.1..T0.6.

### PR-T0.1 — INVENTÁRIO DE FLUXOS E ESTADOS VIVOS

| Campo | Conteúdo |
|-------|----------|
| ID lógico | `PR-T0.1` (equivalente operacional ao `T0-PR2` do `PLANO_EXECUTIVO_T0_T7.md`) |
| Título canônico | `T0 — Inventário de fluxos e estados vivos do legado` |
| Fase macro | T0 |
| Épico/microetapa do mestre | T0 — "Mapa dos fluxos vivos do início ao pós-envio_docs" + "Inventário dos estados persistidos, campos realmente usados, compatibilidades temporárias e resíduos de legado" |
| Objetivo exato | Produzir, dentro do repo, mapa textual e auditável dos fluxos vivos do funil legado e dos estados persistidos efetivamente usados |
| Por que existe no macro | É o primeiro entregável de T0; sem ele, nada do mestre avança |
| Dependência da PR anterior | PR-P1 (Bíblia + templates ativos) |
| Gate de entrada | T0 ativo; G0 aberto; congelamento estrutural declarado em `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` |
| Gate de saída esperado | Pré-readiness G0 — fluxos+estados mapeados |
| Escopo incluído | Documento(s) de inventário em `schema/implantation/` ou `schema/legacy/inventory/`: fluxos do início ao pós-envio_docs, estados persistidos, campos usados, resíduos |
| Escopo proibido | Classificar regras (PR-T0.2), parsers/heurísticas (PR-T0.3), canais/superfícies (PR-T0.4), matriz de risco (PR-T0.5), inventário de desligamento (PR-T0.6); tocar runtime; mexer em Supabase |
| Entregáveis obrigatórios | Mapa de fluxos + inventário de estados, com referência cruzada aos blocos legados |
| Testes/evidências mínimas | Smoke read-only documental: cada fluxo cita arquivo legado fonte; cada estado cita coluna/origem |
| Regra de rollback | Reverter o(s) documento(s) de inventário se houver divergência grosseira com comportamento real |
| Critérios de pronto | Inventário cobre topo → pós-envio_docs e enumera todos os estados persistidos efetivamente usados |
| Arquivos a ler | Bíblia, mestre (T0), `schema/legacy/INDEX_LEGADO_MESTRE.md`, contrato T0 |
| Handoff obrigatório | `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` atualizado conforme `PR_HANDOFF_TEMPLATE.md` |
| Próxima PR autorizada | **PR-T0.2 — Inventário de regras e classificação por família** |

### PR-T0.2 — INVENTÁRIO DE REGRAS E CLASSIFICAÇÃO POR FAMÍLIA

| Campo | Conteúdo |
|-------|----------|
| ID lógico | `PR-T0.2` |
| Título canônico | `T0 — Inventário e classificação das regras (negócio/compliance/docs/UX/operação/roteamento/exceção)` |
| Fase macro | T0 |
| Épico/microetapa do mestre | T0 — "Classificar cada regra em: negócio, compliance, docs, UX, operação comercial, roteamento e exceção" |
| Objetivo exato | Listar e classificar todas as regras do legado em 7 famílias canônicas, vinculadas ao bloco legado de origem |
| Dependência | PR-T0.1 |
| Gate de entrada | Pré-readiness PR-T0.1 |
| Gate de saída esperado | Lista canônica de regras por família publicada |
| Escopo incluído | Tabela de regras com: id, família, fonte legada, descrição, status (ativa/condicional/morta) |
| Escopo proibido | Mapear parsers/heurísticas, matriz de risco, inventário de desligamento |
| Entregáveis | `schema/implantation/INVENTARIO_REGRAS_T0.md` (ou nome equivalente) |
| Testes/evidências | Cada regra com citação de bloco legado |
| Rollback | Reverter o documento se classificação contradisser o legado |
| Critérios de pronto | Cobertura de todas as regras citadas no mestre + nos blocos L01–L19/C01–C09 aplicáveis |
| Leituras | Bíblia, mestre (T0), inventário PR-T0.1, blocos legados aplicáveis |
| Handoff | `PR_HANDOFF_TEMPLATE.md` |
| Próxima PR autorizada | **PR-T0.3 — Inventário de parsers, regex, fallbacks e heurísticas** |

### PR-T0.3 — INVENTÁRIO DE PARSERS, REGEX, FALLBACKS E HEURÍSTICAS

| Campo | Conteúdo |
|-------|----------|
| ID lógico | `PR-T0.3` |
| Título canônico | `T0 — Inventário de parsers/regex/fallbacks/heurísticas e branches de stage` |
| Fase macro | T0 |
| Épico/microetapa do mestre | T0 — "Listar todo ponto onde decisão hoje depende de parser, regex, fallback, heurística ou branch de stage" |
| Objetivo exato | Mapear todo ponto de decisão mecânica do legado vivo |
| Dependência | PR-T0.2 |
| Gate de entrada | Pré-readiness PR-T0.2 |
| Gate de saída esperado | Inventário de pontos de decisão mecânica publicado |
| Escopo incluído | Tabela: id, tipo (parser/regex/fallback/heurística/stage), arquivo legado, regra associada (PR-T0.2), risco macro |
| Escopo proibido | Reescrever lógica; sugerir refatoração; tocar runtime |
| Entregáveis | `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md` |
| Testes/evidências | Cada item com referência ao arquivo legado e à regra-pai |
| Rollback | Reverter documento |
| Critérios de pronto | Cobertura completa de pontos de decisão citados nos blocos legados |
| Leituras | Bíblia, mestre (T0), PR-T0.1, PR-T0.2, blocos legados |
| Handoff | `PR_HANDOFF_TEMPLATE.md` |
| Próxima PR autorizada | **PR-T0.4 — Inventário de canais, superfícies e telemetria** |

### PR-T0.4 — INVENTÁRIO DE CANAIS, SUPERFÍCIES E TELEMETRIA

| Campo | Conteúdo |
|-------|----------|
| ID lógico | `PR-T0.4` |
| Título canônico | `T0 — Mapa de canais/superfícies (texto, docs, áudio potencial, imagem, sticker, endpoints, telemetria)` |
| Fase macro | T0 |
| Épico/microetapa do mestre | T0 — "Mapa de canais e superfícies: texto, docs, áudio potencial, imagem, sticker, endpoints e telemetria" |
| Objetivo exato | Inventariar todas as superfícies de entrada/saída, endpoints e pontos de telemetria existentes no legado |
| Dependência | PR-T0.3 |
| Gate de entrada | Pré-readiness PR-T0.3 |
| Gate de saída esperado | Mapa de canais/superfícies/telemetria publicado |
| Escopo incluído | Tabela: superfície, canal, endpoint, evento de telemetria, fonte legada |
| Escopo proibido | Implantar nada de Meta real, áudio real, telemetria nova; redesenhar superfície |
| Entregáveis | `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md` |
| Testes/evidências | Cada superfície com origem documental |
| Rollback | Reverter documento |
| Critérios de pronto | Cobertura de texto, docs, áudio potencial, imagem, sticker, endpoints e eventos de telemetria efetivos |
| Leituras | Bíblia, mestre (T0), PR-T0.1..T0.3, blocos legados de canal/telemetria |
| Handoff | `PR_HANDOFF_TEMPLATE.md` |
| Próxima PR autorizada | **PR-T0.5 — Matriz de risco** |

### PR-T0.5 — MATRIZ DE RISCO (ELEGIBILIDADE / TOM / DOCS / TELEMETRIA)

| Campo | Conteúdo |
|-------|----------|
| ID lógico | `PR-T0.5` |
| Título canônico | `T0 — Matriz de risco operacional do legado vivo` |
| Fase macro | T0 |
| Épico/microetapa do mestre | T0 — "Matriz de risco: o que quebra elegibilidade, tom, docs, telemetria" |
| Objetivo exato | Produzir matriz que cruza regras (PR-T0.2) × fluxos (PR-T0.1) × parsers (PR-T0.3) × superfícies (PR-T0.4) classificando o impacto se cada item quebrar |
| Dependência | PR-T0.4 |
| Gate de entrada | Pré-readiness PR-T0.4 |
| Gate de saída esperado | Matriz de risco publicada |
| Escopo incluído | `schema/implantation/MATRIZ_RISCO_T0.md` com 4 categorias (elegibilidade, tom, docs, telemetria) e severidade |
| Escopo proibido | Sugerir mitigação técnica; abrir contratos de frente |
| Entregáveis | Matriz publicada |
| Testes/evidências | Cada linha com referência cruzada aos inventários anteriores |
| Rollback | Reverter documento |
| Critérios de pronto | Cobertura das 4 categorias e referência cruzada completa |
| Leituras | Bíblia, mestre (T0), PR-T0.1..T0.4 |
| Handoff | `PR_HANDOFF_TEMPLATE.md` |
| Próxima PR autorizada | **PR-T0.6 — Inventário de desligamento futuro e convivência** |

### PR-T0.6 — INVENTÁRIO DE DESLIGAMENTO FUTURO E CONVIVÊNCIA

| Campo | Conteúdo |
|-------|----------|
| ID lógico | `PR-T0.6` |
| Título canônico | `T0 — Inventário de desligamento futuro (o que sai primeiro / o que convive / o que permanece)` |
| Fase macro | T0 |
| Épico/microetapa do mestre | T0 — "Inventário de desligamento futuro: o que sai primeiro, o que precisa conviver e o que deve permanecer por compatibilidade" |
| Objetivo exato | Classificar cada peça do legado em ordem de desligamento futuro |
| Dependência | PR-T0.5 |
| Gate de entrada | Pré-readiness PR-T0.5 |
| Gate de saída esperado | Documento de desligamento publicado |
| Escopo incluído | `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md` |
| Escopo proibido | Desligar qualquer coisa de fato (T7) |
| Entregáveis | Documento publicado |
| Testes/evidências | Cada peça com referência aos inventários anteriores |
| Rollback | Reverter documento |
| Critérios de pronto | Cobertura completa do legado mapeado em PR-T0.1..T0.4 |
| Leituras | Bíblia, mestre (T0 + T7 — só para amarrar dependência), PR-T0.1..T0.5 |
| Handoff | `PR_HANDOFF_TEMPLATE.md` |
| Próxima PR autorizada | **PR-T0.R — Readiness/Closeout de G0** |

### PR-T0.R — READINESS / SMOKE DOCUMENTAL DE G0 (CLOSEOUT DE T0)

| Campo | Conteúdo |
|-------|----------|
| ID lógico | `PR-T0.R` (equivalente operacional ao `T0-PR4` do `PLANO_EXECUTIVO_T0_T7.md`) |
| Título canônico | `T0 — Readiness e closeout do gate G0` |
| Fase macro | T0 (encerramento) |
| Épico/microetapa do mestre | T0 — "Pacote mínimo de testes: smoke read-only … checklist de completude do inventário aprovado pelo gate técnico" |
| Objetivo exato | Provar completude do inventário T0 e fechar G0 conforme `CONTRACT_CLOSEOUT_PROTOCOL.md` |
| Dependência | PR-T0.6 |
| Gate de entrada | Todos os 6 inventários T0 publicados |
| Gate de saída esperado | **G0 aprovado**, T1 autorizado |
| Escopo incluído | Smoke documental + checklist + atualização do contrato T0 para `encerrado` + arquivamento + abertura formal de T1 no `schema/contracts/_INDEX.md` apontando o próximo contrato cognitivo |
| Escopo proibido | Qualquer entrega técnica de T1 (contrato cognitivo, prompt, taxonomia) |
| Entregáveis | `schema/implantation/READINESS_G0.md` + closeout do contrato T0 + criação do esqueleto de contrato ativo de T1 (sem corpo executivo) |
| Testes/evidências | Smoke documental cruzando inventários ↔ blocos do mestre |
| Rollback | Reabrir G0 se algum inventário falhar smoke |
| Critérios de pronto | Mestre seção "Critérios de pronto por fase — T0" satisfeito |
| Leituras | Bíblia, mestre (T0), PR-T0.1..T0.6, `CONTRACT_CLOSEOUT_PROTOCOL.md` |
| Handoff | `PR_HANDOFF_TEMPLATE.md` declarando G0 fechado e abrindo T1 |
| Próxima PR autorizada | **PR-T1.0 — Abertura do contrato cognitivo (T1)** |

---

## H. PRs de T1 — Constituição do agente e contrato cognitivo canônico

Microetapas obrigatórias no mestre (T1):
* Separar tom, regra de negócio, veto, sugestão mandatória e repertório.
* Definir comportamento em ambiguidade, contradição, cliente prolixo/evasivo, áudio ruim, insistência em preço/aprovação.
* Fechar contrato de saída: `reply_text`, facts, fatos atualizados, objetivo atual, próxima ação, needs_confirmation, políticas acionadas, bloqueios.
* Documentar o que o agente nunca pode fazer.

### PR-T1.0 — ABERTURA DO CONTRATO COGNITIVO (T1)

| Campo | Conteúdo |
|-------|----------|
| ID lógico | `PR-T1.0` |
| Título canônico | `T1 — Abertura do contrato cognitivo canônico (governança)` |
| Fase macro | T1 |
| Épico/microetapa do mestre | T1 — "Constituição do agente" (entrada da fase) |
| Objetivo exato | Abrir formalmente o contrato ativo de T1 em `schema/contracts/active/` conforme `CONTRACT_SCHEMA.md` |
| Dependência | PR-T0.R (G0 aprovado) |
| Gate de entrada | G0 aprovado |
| Gate de saída esperado | Contrato T1 ativo, escopo declarado, microetapas T1 enumeradas |
| Escopo incluído | Criar `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`; atualizar índice de contratos |
| Escopo proibido | Escrever prompt, taxonomia ou políticas (são as PRs T1.1..T1.5) |
| Entregáveis | Contrato T1 ativo |
| Testes/evidências | Contrato cita microetapas T1 do mestre e referencia inventários T0 |
| Rollback | Reverter contrato + índice |
| Critérios de pronto | Contrato T1 atende `CONTRACT_SCHEMA.md` |
| Leituras | Bíblia, mestre (T1), inventários T0, `CONTRACT_EXECUTION_PROTOCOL.md` |
| Handoff | `PR_HANDOFF_TEMPLATE.md` |
| Próxima PR autorizada | **PR-T1.1 — Separação tom × regra × veto × sugestão × repertório** |

### PR-T1.1 — SEPARAÇÃO TOM × REGRA × VETO × SUGESTÃO × REPERTÓRIO

| ID lógico | `PR-T1.1` |
|-------|----------|
| Título canônico | `T1 — Separação canônica entre tom, regra, veto, sugestão mandatória e repertório` |
| Fase macro | T1 |
| Épico/microetapa do mestre | T1 — "Separar o que é tom, regra, veto, sugestão mandatória e repertório" |
| Objetivo exato | Produzir documento canônico que separe essas 5 dimensões para a Enova |
| Dependência | PR-T1.0 |
| Gate de entrada | Contrato T1 ativo |
| Gate de saída esperado | Camadas separadas publicadas |
| Escopo incluído | `schema/implantation/T1_CAMADAS_CANONICAS.md` (ou local definido pelo contrato T1) |
| Escopo proibido | Prompt em camadas (T1.2), taxonomia (T1.3), formato de saída (T1.4), comportamentos (T1.5) |
| Entregáveis | Documento de camadas |
| Testes/evidências | Cada item amarrado a regra de PR-T0.2 |
| Rollback | Reverter documento |
| Critérios de pronto | 5 dimensões cobertas com exemplos |
| Leituras | Bíblia, mestre (T1), contrato T1, PR-T0.2 |
| Handoff | `PR_HANDOFF_TEMPLATE.md` |
| Próxima PR autorizada | **PR-T1.2 — System prompt canônico em camadas** |

### PR-T1.2 — SYSTEM PROMPT CANÔNICO EM CAMADAS

| ID lógico | `PR-T1.2` |
|-------|----------|
| Título canônico | `T1 — System prompt canônico em camadas (sem ambiguidade central)` |
| Fase macro | T1 |
| Épico/microetapa do mestre | T1 — "System prompt canônico em camadas, sem ambiguidades centrais" |
| Objetivo exato | Versão canônica do system prompt da Enova, em camadas, sem código de runtime |
| Dependência | PR-T1.1 |
| Gate de entrada | Camadas separadas (T1.1) publicadas |
| Gate de saída esperado | Prompt canônico publicado |
| Escopo incluído | Documento textual do prompt em camadas, congelado por versão |
| Escopo proibido | Carregar prompt em código de runtime; chamar LLM real |
| Entregáveis | Prompt canônico v1 |
| Testes/evidências | Bateria adversarial mínima documentada (sem execução de LLM real) |
| Rollback | Reverter documento |
| Critérios de pronto | Prompt cobre identidade, limites, objetivos e remete às camadas |
| Leituras | Bíblia, mestre (T1), PR-T1.1 |
| Handoff | `PR_HANDOFF_TEMPLATE.md` |
| Próxima PR autorizada | **PR-T1.3 — Taxonomia oficial (facts/objetivos/pendências/conflitos/riscos/ações)** |

### PR-T1.3 — TAXONOMIA OFICIAL

| ID lógico | `PR-T1.3` |
|-------|----------|
| Título canônico | `T1 — Taxonomia oficial de facts, objetivos, pendências, conflitos, riscos e ações` |
| Fase macro | T1 |
| Épico/microetapa do mestre | T1 — "Taxonomia oficial de facts, objetivos, pendências, conflitos, riscos e ações" |
| Objetivo exato | Publicar taxonomia canônica reusada por T2/T3/T4 |
| Dependência | PR-T1.2 |
| Gate de entrada | Prompt canônico v1 publicado |
| Gate de saída esperado | Taxonomia publicada |
| Escopo | Tabelas de tipos canônicos com nome, descrição, origem legada |
| Proibido | Schema Supabase (T2), políticas (T3) |
| Entregáveis | `schema/implantation/T1_TAXONOMIA_OFICIAL.md` |
| Testes/evidências | Cada tipo amarrado a regra/origem |
| Rollback | Reverter documento |
| Critérios de pronto | Cobertura das 6 categorias do mestre |
| Leituras | Bíblia, mestre (T1), PR-T0.2, PR-T1.1 |
| Handoff | `PR_HANDOFF_TEMPLATE.md` |
| Próxima PR autorizada | **PR-T1.4 — Formato de saída padrão do agente** |

### PR-T1.4 — FORMATO DE SAÍDA PADRÃO DO AGENTE

| ID lógico | `PR-T1.4` |
|-------|----------|
| Título canônico | `T1 — Contrato de saída do agente (reply_text + facts + objetivo + needs_confirmation + flags + bloqueios)` |
| Fase macro | T1 |
| Épico/microetapa do mestre | T1 — "Fechar o contrato de saída … reply_text, facts extraídos, fatos atualizados, objetivo atual, próxima ação pretendida, needs_confirmation, políticas acionadas e bloqueios" |
| Objetivo exato | Definir formato canônico de saída estruturada do LLM em qualquer canal |
| Dependência | PR-T1.3 |
| Gate de entrada | Taxonomia publicada |
| Gate de saída esperado | Schema de saída v1 publicado |
| Escopo | Documento de schema (JSON-shape descritivo, sem implementação) |
| Proibido | Implementar parser/serializer; chamar LLM |
| Entregáveis | `schema/implantation/T1_CONTRATO_SAIDA.md` |
| Testes/evidências | Casos sintéticos de saída cobrindo pelo menos 5 cenários distintos |
| Rollback | Reverter documento |
| Critérios de pronto | Schema cobre todos os campos exigidos pelo mestre |
| Leituras | Bíblia, mestre (T1), PR-T1.3 |
| Handoff | `PR_HANDOFF_TEMPLATE.md` |
| Próxima PR autorizada | **PR-T1.5 — Comportamentos canônicos e proibições** |

### PR-T1.5 — COMPORTAMENTOS CANÔNICOS E PROIBIÇÕES

| ID lógico | `PR-T1.5` |
|-------|----------|
| Título canônico | `T1 — Comportamentos em ambiguidade/contradição/prolixo/evasivo/áudio ruim/insistência em preço + lista do que o agente nunca pode fazer` |
| Fase macro | T1 |
| Épico/microetapa do mestre | T1 — "Definir comportamento em ambiguidade, contradição, cliente prolixo, evasivo, áudio ruim, insistência em preço/aprovação" + "o que o agente nunca pode fazer" |
| Objetivo exato | Documento canônico de comportamentos e proibições |
| Dependência | PR-T1.4 |
| Gate de entrada | Schema de saída publicado |
| Gate de saída esperado | Comportamentos + proibições publicados |
| Escopo | `schema/implantation/T1_COMPORTAMENTOS_E_PROIBICOES.md` |
| Proibido | Implementar policy engine (T3) |
| Entregáveis | Documento canônico |
| Testes/evidências | Bateria adversarial documentada (papel) |
| Rollback | Reverter documento |
| Critérios de pronto | Cobertura de cada cenário citado pelo mestre |
| Leituras | Bíblia, mestre (T1), PR-T1.1..T1.4 |
| Handoff | `PR_HANDOFF_TEMPLATE.md` |
| Próxima PR autorizada | **PR-T1.R — Readiness/Closeout de G1** |

### PR-T1.R — READINESS / CLOSEOUT DE G1

| ID lógico | `PR-T1.R` |
|-------|----------|
| Título canônico | `T1 — Readiness e closeout do gate G1 (contrato cognitivo aprovado)` |
| Fase macro | T1 (encerramento) |
| Épico/microetapa do mestre | T1 — "Pacote mínimo de testes" (bateria adversarial, consistência, revisão manual) + "Regra de rollback da frente" |
| Objetivo | Provar contrato cognitivo + formato + comportamentos; fechar G1 |
| Dependência | PR-T1.5 |
| Gate de entrada | Todos T1.0..T1.5 publicados |
| Gate de saída | **G1 aprovado**; T2 autorizado |
| Escopo | Smoke documental + closeout contrato T1 + abertura esqueleto contrato T2 |
| Proibido | Qualquer entrega de schema Supabase ou estado |
| Entregáveis | `schema/implantation/READINESS_G1.md` + closeout T1 + esqueleto contrato T2 |
| Testes/evidências | Casos sintéticos cobrindo 3 dimensões (estilo/regra/saída) |
| Rollback | Reabrir G1 |
| Critérios de pronto | Mestre — "Critérios de pronto por fase — T1" |
| Leituras | Bíblia, mestre (T1), PR-T1.0..T1.5, `CONTRACT_CLOSEOUT_PROTOCOL.md` |
| Handoff | `PR_HANDOFF_TEMPLATE.md` |
| Próxima PR autorizada | **PR-T2.0 — Abertura do contrato de Estado Estruturado (T2)** |

---

## I. PRs de T2 — Estado estruturado, memória e reconciliação

Microetapas obrigatórias no mestre (T2):
* Definir nomes canônicos dos fatos (sem duplicidade semântica).
* Separar fato bruto, fato confirmado, inferência, hipótese e pendência.
* Política de confiança por origem (texto explícito, indireto, áudio, doc, inferência).
* Resumo persistido para turnos longos.
* Mapear fatos vindos do legado e como serão reconciliados.

### PR-T2.0 — ABERTURA DO CONTRATO DE ESTADO ESTRUTURADO

| Campo | Conteúdo |
|-------|----------|
| ID lógico | `PR-T2.0` |
| Título canônico | `T2 — Abertura do contrato de estado estruturado e memória v1` |
| Fase macro | T2 |
| Épico/microetapa do mestre | T2 — entrada |
| Dependência | PR-T1.R (G1 aprovado) |
| Gate de entrada | G1 aprovado |
| Gate de saída esperado | Contrato T2 ativo |
| Escopo | Criar `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T2.md` |
| Proibido | Schema concreto (T2.2), reconciliação (T2.4) |
| Entregáveis | Contrato T2 ativo |
| Critérios de pronto | Atende `CONTRACT_SCHEMA.md` e cita microetapas T2 do mestre |
| Leituras | Bíblia, mestre (T2), readiness G1 |
| Handoff | `PR_HANDOFF_TEMPLATE.md` |
| Próxima PR autorizada | **PR-T2.1 — Nomes canônicos dos fatos** |

### PR-T2.1 — NOMES CANÔNICOS DOS FATOS

| ID lógico | `PR-T2.1` |
|-------|----------|
| Título canônico | `T2 — Nomes canônicos de fatos (sem duplicidade semântica)` |
| Épico/microetapa do mestre | T2 — "Definir nomes canônicos dos fatos e evitar duplicidade semântica" |
| Dependência | PR-T2.0 |
| Gate de entrada | Contrato T2 ativo |
| Gate de saída esperado | Dicionário canônico de fatos publicado |
| Escopo | `schema/implantation/T2_DICIONARIO_FATOS.md` |
| Proibido | Schema Supabase, política de confiança |
| Entregáveis | Documento canônico |
| Testes/evidências | Cada fato amarrado a regra de PR-T0.2 + taxonomia PR-T1.3 |
| Rollback | Reverter documento |
| Critérios de pronto | Cobertura dos fatos principais (perfil, renda, composição, regime, elegibilidade, doc) |
| Próxima PR autorizada | **PR-T2.2 — Schema lead_state v1** |

### PR-T2.2 — SCHEMA `lead_state` v1

| ID lógico | `PR-T2.2` |
|-------|----------|
| Título canônico | `T2 — Schema lead_state v1 (fatos, objetivos, pendências, conflitos, histórico resumido, metadados de confiança)` |
| Épico/microetapa do mestre | T2 — entregável "Schema lead_state v1" |
| Dependência | PR-T2.1 |
| Gate de entrada | Dicionário canônico publicado |
| Gate de saída esperado | Schema v1 publicado |
| Escopo | `schema/implantation/T2_LEAD_STATE_V1.md` (descrição estrutural + camada de compatibilidade transitória); pode ser acompanhado por uma especificação SQL declarativa **sem aplicar nada em Supabase real** |
| Proibido | Mudar tabelas Supabase reais; declarar `Mudanças em dados persistidos: sim` sem o `DATA_CHANGE_PROTOCOL.md` cumprido |
| Entregáveis | Documento de schema v1 |
| Testes/evidências | Mapeamento campo ↔ fato canônico ↔ regra |
| Rollback | Reverter documento |
| Critérios de pronto | Cobertura: fatos, objetivos, pendências, conflitos, histórico resumido, metadados de confiança |
| Próxima PR autorizada | **PR-T2.3 — Política de confiança por origem** |

### PR-T2.3 — POLÍTICA DE CONFIANÇA POR ORIGEM

| ID lógico | `PR-T2.3` |
|-------|----------|
| Título canônico | `T2 — Política de confiança por origem do dado (texto explícito, indireto, áudio, doc, inferência)` |
| Épico/microetapa do mestre | T2 — "Política de confiança por origem" |
| Dependência | PR-T2.2 |
| Gate de entrada | Schema v1 publicado |
| Gate de saída esperado | Política publicada |
| Escopo | `schema/implantation/T2_POLITICA_CONFIANCA.md` |
| Proibido | Implementar reconciliação (T2.4) |
| Entregáveis | Documento canônico |
| Testes/evidências | Casos sintéticos por origem |
| Critérios de pronto | Cobertura das 5 origens citadas pelo mestre |
| Próxima PR autorizada | **PR-T2.4 — Reconciliação e separação de fato bruto/confirmado/inferência/hipótese/pendência** |

### PR-T2.4 — RECONCILIAÇÃO E TIPOLOGIA DO FATO

| ID lógico | `PR-T2.4` |
|-------|----------|
| Título canônico | `T2 — Reconciliação de conflitos e tipologia (bruto/confirmado/inferência/hipótese/pendência)` |
| Épico/microetapa do mestre | T2 — "Separar fato bruto, fato confirmado, inferência, hipótese e pendência" + "camada de reconciliação" |
| Dependência | PR-T2.3 |
| Gate de entrada | Política de confiança publicada |
| Gate de saída esperado | Tipologia + camada de reconciliação publicadas |
| Escopo | `schema/implantation/T2_RECONCILIACAO.md` |
| Proibido | Implementar resumo persistido (T2.5) |
| Entregáveis | Documento canônico |
| Testes/evidências | Casos: renda ajustada, estado civil corrigido, parceiro entra depois, autônomo revela IR, etc. (mestre) |
| Critérios de pronto | Cobertura dos casos do mestre |
| Próxima PR autorizada | **PR-T2.5 — Resumo persistido + compatibilidade com legado** |

### PR-T2.5 — RESUMO PERSISTIDO + COMPATIBILIDADE COM LEGADO

| ID lógico | `PR-T2.5` |
|-------|----------|
| Título canônico | `T2 — Resumo persistido para turnos longos + compatibilidade transitória com legado` |
| Épico/microetapa do mestre | T2 — "Desenhar o resumo persistido para turnos longos" + "Mapear quais fatos continuam vindo do legado até a migração completa" |
| Dependência | PR-T2.4 |
| Gate de entrada | Reconciliação publicada |
| Gate de saída esperado | Política publicada |
| Escopo | `schema/implantation/T2_RESUMO_PERSISTIDO.md` |
| Proibido | Mudar tabelas Supabase reais |
| Entregáveis | Documento canônico |
| Critérios de pronto | Mapa completo de fatos legados a reconciliar |
| Próxima PR autorizada | **PR-T2.R — Readiness/Closeout de G2** |

### PR-T2.R — READINESS / CLOSEOUT DE G2

| ID lógico | `PR-T2.R` |
|-------|----------|
| Gate de saída | **G2 aprovado**; T3 autorizado |
| Escopo | Smoke documental dos casos de mudança de versão de fato + auditoria de origem; closeout contrato T2; esqueleto contrato T3 |
| Critérios de pronto | Mestre — "Critérios de pronto por fase — T2" |
| Próxima PR autorizada | **PR-T3.0 — Abertura do contrato de Policy Engine v1 (T3)** |

---

## J. PRs de T3 — Policy engine v1 e guardrails declarativos

Microetapas obrigatórias no mestre (T3):
* Transformar primeiro as regras mais sensíveis (casado civil → conjunto; autônomo → IR; renda solo baixa → composição; estrangeiro sem RNM → não avançar).
* Definir o que é "bloquear avanço", "desviar objetivo", "pedir confirmação" e "apenas orientar".
* Ordem estável de avaliação para evitar colisão.
* Política de composição quando várias regras disparam.
* Política de veto suave.

### PR-T3.0 — ABERTURA DO CONTRATO DE POLICY ENGINE v1

| ID lógico | `PR-T3.0` |
|-------|----------|
| Dependência | PR-T2.R (G2 aprovado) |
| Escopo | Criar contrato ativo T3 |
| Próxima PR autorizada | **PR-T3.1 — Classes canônicas de política** |

### PR-T3.1 — CLASSES CANÔNICAS DE POLÍTICA

| ID lógico | `PR-T3.1` |
|-------|----------|
| Título | `T3 — Classes canônicas: obrigação, bloqueio, sugestão mandatória, confirmação, roteamento` |
| Épico/microetapa do mestre | T3 — entregável "Motor declarativo de políticas com classes" |
| Dependência | PR-T3.0 |
| Escopo | `schema/implantation/T3_CLASSES_POLITICA.md` |
| Próxima PR autorizada | **PR-T3.2 — Codificação das regras críticas** |

### PR-T3.2 — CODIFICAÇÃO DAS REGRAS CRÍTICAS

| ID lógico | `PR-T3.2` |
|-------|----------|
| Título | `T3 — Codificação declarativa das regras críticas (casado→conjunto, autônomo→IR, solo baixa→composição, estrangeiro→bloqueio)` |
| Épico/microetapa do mestre | T3 — microetapa "Transformar as regras mais sensíveis primeiro" |
| Dependência | PR-T3.1 |
| Escopo | `schema/implantation/T3_REGRAS_CRITICAS_DECLARATIVAS.md` |
| Proibido | Orquestrador (T4) |
| Próxima PR autorizada | **PR-T3.3 — Ordem de avaliação e composição de políticas** |

### PR-T3.3 — ORDEM DE AVALIAÇÃO E COMPOSIÇÃO DE POLÍTICAS

| ID lógico | `PR-T3.3` |
|-------|----------|
| Épico/microetapa do mestre | T3 — "Ordem estável de avaliação" + "Política de composição" |
| Dependência | PR-T3.2 |
| Próxima PR autorizada | **PR-T3.4 — Veto suave + validador pós-resposta/pré-persistência** |

### PR-T3.4 — VETO SUAVE + VALIDADOR PÓS-RESPOSTA / PRÉ-PERSISTÊNCIA

| ID lógico | `PR-T3.4` |
|-------|----------|
| Épico/microetapa do mestre | T3 — "Política de veto suave" + entregável "Validador pós-resposta e pré-persistência" |
| Dependência | PR-T3.3 |
| Próxima PR autorizada | **PR-T3.5 — Suíte de regras críticas (positivo/negativo/ambíguo + colisões + regressão)** |

### PR-T3.5 — SUÍTE DE TESTES DE REGRAS CRÍTICAS

| ID lógico | `PR-T3.5` |
|-------|----------|
| Épico/microetapa do mestre | T3 — "Pacote mínimo de testes" |
| Dependência | PR-T3.4 |
| Próxima PR autorizada | **PR-T3.R — Readiness/Closeout de G3** |

### PR-T3.R — READINESS / CLOSEOUT DE G3

| Gate de saída | **G3 aprovado**; T4 autorizado |
| Próxima PR autorizada | **PR-T4.0 — Abertura do contrato do Orquestrador (T4)** |

---

## K. PRs de T4 — Orquestrador de turno LLM-first

Microetapas obrigatórias no mestre (T4):
* Padronizar entrada (mensagem, anexos, canal, contexto resumido, estado, políticas, objetivo).
* Executar LLM com contrato único, capturar texto e estrutura.
* Passar saída pelo policy engine e reconciliador antes de persistir.
* Gerar resposta, registrar rastro, publicar métricas mínimas.
* Fallbacks: erro de modelo, formato inválido, omissão de campos, contradição séria.

### PR-T4.0 — ABERTURA DO CONTRATO DO ORQUESTRADOR

| Dependência | PR-T3.R (G3 aprovado) |
| Próxima PR autorizada | **PR-T4.1 — Padronização da entrada do turno** |

### PR-T4.1 — PADRONIZAÇÃO DA ENTRADA DO TURNO

| Épico/microetapa do mestre | T4 — "Padronizar a entrada" |
| Dependência | PR-T4.0 |
| Próxima PR autorizada | **PR-T4.2 — Pipeline LLM com contrato único + captura de texto e estrutura** |

### PR-T4.2 — PIPELINE LLM COM CONTRATO ÚNICO

| Épico/microetapa do mestre | T4 — "Executar o LLM com contrato único e capturar tanto o texto quanto a estrutura" |
| Dependência | PR-T4.1 |
| Próxima PR autorizada | **PR-T4.3 — Validação policy engine + reconciliação antes de persistir** |

### PR-T4.3 — VALIDAÇÃO POLICY + RECONCILIAÇÃO ANTES DE PERSISTIR

| Épico/microetapa do mestre | T4 — "Passar a saída pelo policy engine e pelo reconciliador de estado antes de persistir" |
| Dependência | PR-T4.2 |
| Próxima PR autorizada | **PR-T4.4 — Resposta final + rastro do turno + métricas mínimas** |

### PR-T4.4 — RESPOSTA FINAL + RASTRO + MÉTRICAS

| Épico/microetapa do mestre | T4 — "Gerar resposta final, registrar o rastro do turno e publicar métricas mínimas" |
| Dependência | PR-T4.3 |
| Próxima PR autorizada | **PR-T4.5 — Fallbacks (erro de modelo / formato inválido / omissão / contradição)** |

### PR-T4.5 — FALLBACKS DE SEGURANÇA

| Épico/microetapa do mestre | T4 — "Tratamento explícito para erro de modelo, formato inválido, omissão de campos e contradição séria" + "feature flags para shadow mode e cutover parcial" |
| Dependência | PR-T4.4 |
| Próxima PR autorizada | **PR-T4.6 — Bateria E2E sandbox + medição latência/custo** |

### PR-T4.6 — BATERIA E2E SANDBOX + LATÊNCIA/CUSTO

| Épico/microetapa do mestre | T4 — "Pacote mínimo de testes" |
| Dependência | PR-T4.5 |
| Próxima PR autorizada | **PR-T4.R — Readiness/Closeout de G4** |

### PR-T4.R — READINESS / CLOSEOUT DE G4

| Gate de saída | **G4 aprovado**; T5 autorizado |
| Próxima PR autorizada | **PR-T5.0 — Abertura do contrato de migração do funil prioritário (T5)** |

---

## L. PRs de T5 — Migração do funil prioritário

Microetapas obrigatórias no mestre (T5):
* Quebrar a migração em fatias: topo+abertura; identificação base; composição/estado civil; renda+regime; elegibilidade+inviabilidade; envio_docs.
* Para cada fatia: fatos mínimos, políticas mínimas, respostas proibidas e critérios de pronto.
* Shadow mode por fatia antes de ligar em produção.
* Comparativo lado a lado classificando divergências.
* Só desligar dependência do trilho antigo quando a nova fatia superar o mínimo contratual.

### PR-T5.0 — ABERTURA DO CONTRATO DE MIGRAÇÃO

| Dependência | PR-T4.R (G4 aprovado) |
| Próxima PR autorizada | **PR-T5.1 — Fatia: Topo + abertura** |

### PR-T5.1 — FATIA TOPO + ABERTURA

| Épico/microetapa do mestre | T5 — fatia 1 |
| Dependência | PR-T5.0 |
| Microetapas obrigatórias | Definir fatos mínimos da fatia, políticas mínimas, respostas proibidas, critérios de pronto, shadow da fatia, comparativo |
| Gate de saída esperado | Shadow + paridade da fatia aprovados |
| Próxima PR autorizada | **PR-T5.2 — Fatia: Identificação base** |

### PR-T5.2 — FATIA IDENTIFICAÇÃO BASE

| Épico/microetapa do mestre | T5 — fatia 2 |
| Dependência | PR-T5.1 |
| Próxima PR autorizada | **PR-T5.3 — Fatia: Composição / estado civil** |

### PR-T5.3 — FATIA COMPOSIÇÃO / ESTADO CIVIL

| Épico/microetapa do mestre | T5 — fatia 3 |
| Dependência | PR-T5.2 |
| Próxima PR autorizada | **PR-T5.4 — Fatia: Renda e regime** |

### PR-T5.4 — FATIA RENDA E REGIME

| Épico/microetapa do mestre | T5 — fatia 4 |
| Dependência | PR-T5.3 |
| Próxima PR autorizada | **PR-T5.5 — Fatia: Elegibilidade e sinais de inviabilidade** |

### PR-T5.5 — FATIA ELEGIBILIDADE / INVIABILIDADE

| Épico/microetapa do mestre | T5 — fatia 5 |
| Dependência | PR-T5.4 |
| Próxima PR autorizada | **PR-T5.6 — Fatia: envio_docs (apenas roteamento por prontidão, não escada cega)** |

### PR-T5.6 — FATIA `envio_docs`

| Épico/microetapa do mestre | T5 — fatia 6 + entregável "Roteamento para docs com política de prontidão" |
| Dependência | PR-T5.5 |
| Próxima PR autorizada | **PR-T5.7 — Comparativo de paridade legado × novo motor** |

### PR-T5.7 — COMPARATIVO DE PARIDADE LEGADO × NOVO MOTOR

| Épico/microetapa do mestre | T5 — entregável "Comparativo de paridade entre legado e novo motor" + microetapa "Revisar divergências classificando em melhoria/regressão/aceitável/bug" |
| Dependência | PR-T5.6 |
| Próxima PR autorizada | **PR-T5.R — Readiness/Closeout de G5** |

### PR-T5.R — READINESS / CLOSEOUT DE G5

| Gate de saída | **G5 aprovado**; T6 autorizado |
| Próxima PR autorizada | **PR-T6.0 — Abertura do contrato Multimodal/Docs (T6)** |

---

## M. PRs de T6 — Docs, multimodal e superfícies de canal

Microetapas obrigatórias no mestre (T6):
* Representação unificada para texto/transcrição/imagem/sticker/doc.
* Separar fato extraído do cliente vs. de documento.
* Definir confirmação humana ou recapitulação por canal.
* Medir latência multimodal e definir degradação.
* Garantir que docs não escapem da política de status/pendência/completude.

### PR-T6.0 — ABERTURA DO CONTRATO MULTIMODAL/DOCS

| Dependência | PR-T5.R (G5 aprovado) |
| Próxima PR autorizada | **PR-T6.1 — Representação unificada multimodal** |

### PR-T6.1 — REPRESENTAÇÃO UNIFICADA MULTIMODAL

| Épico/microetapa do mestre | T6 — "Representação unificada para texto, transcrição, imagem, sticker e doc reconhecido" |
| Próxima PR autorizada | **PR-T6.2 — Separação de confiança cliente × documento** |

### PR-T6.2 — SEPARAÇÃO DE CONFIANÇA CLIENTE × DOCUMENTO

| Épico/microetapa do mestre | T6 — "Separar fato extraído do cliente de fato extraído de documento" |
| Próxima PR autorizada | **PR-T6.3 — Política de confirmação por canal + recapitulação** |

### PR-T6.3 — CONFIRMAÇÃO POR CANAL E RECAPITULAÇÃO

| Épico/microetapa do mestre | T6 — "Confirmação humana ou recapitulação antes de persistir fato crítico" |
| Próxima PR autorizada | **PR-T6.4 — Latência/custo + estratégia de degradação** |

### PR-T6.4 — LATÊNCIA / CUSTO / DEGRADAÇÃO

| Épico/microetapa do mestre | T6 — "Medir impacto de latência do multimodal e criar fila/estratégia de degradação" |
| Próxima PR autorizada | **PR-T6.5 — Docs sob política de status/pendência/completude** |

### PR-T6.5 — DOCS SOB POLÍTICA DE STATUS / PENDÊNCIA / COMPLETUDE

| Épico/microetapa do mestre | T6 — "Garantir que docs não escapem da política de status, pendência e completude" |
| Próxima PR autorizada | **PR-T6.6 — Bateria multimodal (áudio/imagem/sticker/doc) + custo por canal** |

### PR-T6.6 — BATERIA MULTIMODAL

| Épico/microetapa do mestre | T6 — "Pacote mínimo de testes" |
| Próxima PR autorizada | **PR-T6.R — Readiness/Closeout de G6** |

### PR-T6.R — READINESS / CLOSEOUT DE G6

| Gate de saída | **G6 aprovado**; T7 autorizado |
| Próxima PR autorizada | **PR-T7.0 — Abertura do contrato de Shadow/Canary/Cutover (T7)** |

---

## N. PRs de T7 — Shadow, canary, cutover e desativação do legado

Microetapas obrigatórias no mestre (T7):
* Rodar novo motor em paralelo ao legado em amostra representativa sem impactar cliente.
* Classificar divergências e fechar ações antes do canary.
* Abrir canary por porcentagem/canal/fatia, nunca em 100% de primeira.
* Medir continuamente acerto, políticas violadas, latência, custo, retrabalho, incidentes.
* Desligar legado em ordem, com mapa de dependências e prova de cobertura.

### PR-T7.0 — ABERTURA DO CONTRATO T7

| Dependência | PR-T6.R (G6 aprovado) |
| Próxima PR autorizada | **PR-T7.1 — Shadow mode** |

### PR-T7.1 — SHADOW MODE FECHADO

| Épico/microetapa do mestre | T7 — "Rodar o novo motor em paralelo ao legado em amostra representativa sem impactar cliente" + entregável "Shadow mode fechado com métricas e análise de divergência" |
| Próxima PR autorizada | **PR-T7.2 — Classificação de divergências + ações** |

### PR-T7.2 — CLASSIFICAÇÃO DE DIVERGÊNCIAS

| Épico/microetapa do mestre | T7 — "Classificar divergências e fechar ações antes do canary" |
| Próxima PR autorizada | **PR-T7.3 — Canary inicial (porcentagem/canal/fatia)** |

### PR-T7.3 — CANARY INICIAL

| Épico/microetapa do mestre | T7 — "Abrir canary por porcentagem, por canal ou por fatia de funil, nunca em 100% de primeira" |
| Próxima PR autorizada | **PR-T7.4 — Medição contínua (acerto/violação/latência/custo/retrabalho/incidentes)** |

### PR-T7.4 — MEDIÇÃO CONTÍNUA + RUNBOOK ROLLBACK

| Épico/microetapa do mestre | T7 — entregável "Gate executivo de go-live e runbook de rollback rápido" |
| Próxima PR autorizada | **PR-T7.5 — Cutover progressivo + desligamento ordenado do legado** |

### PR-T7.5 — CUTOVER + DESLIGAMENTO ORDENADO

| Épico/microetapa do mestre | T7 — "Desligar legado em ordem, com mapa de dependências e prova de que a nova camada cobre o caso" |
| Dependência | PR-T0.6 (inventário de desligamento) + PR-T7.4 |
| Próxima PR autorizada | **PR-T7.R — Readiness/Closeout de G7 (go-live)** |

### PR-T7.R — READINESS / CLOSEOUT DE G7 (GO-LIVE)

| Gate de saída | **G7 aprovado**; implantação macro declarada concluída |
| Critérios de pronto | Mestre — "Critérios de pronto por fase — T7" + checklist go/no-go com evidências |
| Próxima PR autorizada | **Bloco O (pós-go-live)**, somente se autorizado pelo macro |

---

## O. Pós-go-live (somente se permitido pelo macro)

O mestre **não autoriza expansão fora do escopo macro antes de G7 aprovado**.
Após G7, o mestre permite apenas: war room curto pós-corte (mestre, T7 — "Pacote mínimo
de testes") e regressão observada.

### PR-PG.1 — WAR ROOM CURTO PÓS-CORTE

| Épico/microetapa do mestre | T7 — "War room curto após o corte para observar regressão nas primeiras horas e dias" |
| Dependência | PR-T7.R |
| Próxima PR autorizada | **PR-PG.2 — Encerramento macro + arquivamento dos contratos T0..T7** |

### PR-PG.2 — ENCERRAMENTO MACRO + ARQUIVAMENTO

| Escopo | Closeout dos contratos macro restantes; arquivamento; atualização final dos índices vivos |
| Proibido | Abrir nova frente fora do macro |
| Próxima PR autorizada | **(Nenhuma — macro concluído. Novas frentes exigem nova Bíblia/macro.)** |

---

## P. Regra obrigatória de handoff por PR

**Toda PR concluída deve terminar com um handoff escrito no repo, no arquivo
`schema/handoffs/<FASE>_LATEST.md`, seguindo `schema/handoffs/PR_HANDOFF_TEMPLATE.md`.**

O handoff é **obrigatório, nunca opcional**. PR sem handoff conforme o template é
considerada não conforme e bloqueia a abertura da próxima PR.

> **Obrigatório também:** declarar o bloco de **Exceção contratual** conforme §S
> desta Bíblia. Mesmo quando não há exceção ativa, o handoff deve declarar
> explicitamente `Exceção contratual autorizada pelo Vasques?: não`. Sem essa
> declaração, o handoff é não conforme.

O handoff deve conter no mínimo:

* Base macro lida.
* Fase / épico / microetapa do mestre.
* PR atual (ID lógico desta Bíblia + número/título da PR no GitHub).
* Objetivo executado.
* Escopo incluído.
* Escopo proibido.
* Arquivos alterados.
* Testes/evidências mínimas (com links).
* Gate atual.
* Gate atingido ou não.
* Pendências remanescentes.
* Riscos remanescentes.
* Plano de rollback.
* **Próxima PR autorizada** (ID lógico desta Bíblia).
* Resumo da próxima PR.
* Leituras obrigatórias da próxima PR.
* O que NÃO foi feito (lista objetiva).
* Por que a próxima PR é a próxima correta segundo o macro.
* Quais arquivos a próxima PR deve tocar ou evitar.
* Quais riscos herdados continuam abertos.

---

## Q. Regra obrigatória de abertura da próxima PR

**Toda nova PR deve abrir-se conforme `schema/execution/PR_EXECUTION_TEMPLATE.md`.**
O template exige declaração explícita de:

* Base macro lida (`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`).
* Fase ativa do macro (T0..T7).
* Épico/microetapa do mestre.
* Dependência da PR anterior (ID lógico desta Bíblia + número/título no GitHub).
* Gate de entrada.
* O que esta PR fecha.
* O que esta PR explicitamente não fecha.
* Handoff que está seguindo (link para o `<FASE>_LATEST.md`).
* Aderência à regra de menção `@copilot+claude-sonnet-4.6` quando aplicável.

PR aberta sem essa declaração é não conforme e o PR Governance Gate deve barrá-la.

> **Obrigatório também:** declarar o bloco de **Exceção contratual** conforme §S
> desta Bíblia. Toda PR deve declarar explicitamente se opera sob exceção
> contratual autorizada pelo Vasques. Sem essa declaração (mesmo quando a
> resposta for `não`), a PR é não conforme.

---

## R. Sequência completa "PR atual → próxima PR"

| Atual | Próxima |
|-------|---------|
| PR-P0 (já feita) | PR-P1 |
| PR-P1 (esta) | **PR-T0.1** |
| PR-T0.1 | PR-T0.2 |
| PR-T0.2 | PR-T0.3 |
| PR-T0.3 | PR-T0.4 |
| PR-T0.4 | PR-T0.5 |
| PR-T0.5 | PR-T0.6 |
| PR-T0.6 | PR-T0.R |
| PR-T0.R (G0 aprovado) | PR-T1.0 |
| PR-T1.0 | PR-T1.1 |
| PR-T1.1 | PR-T1.2 |
| PR-T1.2 | PR-T1.3 |
| PR-T1.3 | PR-T1.4 |
| PR-T1.4 | PR-T1.5 |
| PR-T1.5 | PR-T1.R |
| PR-T1.R (G1 aprovado) | PR-T2.0 |
| PR-T2.0 | PR-T2.1 |
| PR-T2.1 | PR-T2.2 |
| PR-T2.2 | PR-T2.3 |
| PR-T2.3 | PR-T2.4 |
| PR-T2.4 | PR-T2.5 |
| PR-T2.5 | PR-T2.R |
| PR-T2.R (G2 aprovado) | PR-T3.0 |
| PR-T3.0 | PR-T3.1 |
| PR-T3.1 | PR-T3.2 |
| PR-T3.2 | PR-T3.3 |
| PR-T3.3 | PR-T3.4 |
| PR-T3.4 | PR-T3.5 |
| PR-T3.5 | PR-T3.R |
| PR-T3.R (G3 aprovado) | PR-T4.0 |
| PR-T4.0 | PR-T4.1 |
| PR-T4.1 | PR-T4.2 |
| PR-T4.2 | PR-T4.3 |
| PR-T4.3 | PR-T4.4 |
| PR-T4.4 | PR-T4.5 |
| PR-T4.5 | PR-T4.6 |
| PR-T4.6 | PR-T4.R |
| PR-T4.R (G4 aprovado) | PR-T5.0 |
| PR-T5.0 | PR-T5.1 |
| PR-T5.1 | PR-T5.2 |
| PR-T5.2 | PR-T5.3 |
| PR-T5.3 | PR-T5.4 |
| PR-T5.4 | PR-T5.5 |
| PR-T5.5 | PR-T5.6 |
| PR-T5.6 | PR-T5.7 |
| PR-T5.7 | PR-T5.R |
| PR-T5.R (G5 aprovado) | PR-T6.0 |
| PR-T6.0 | PR-T6.1 |
| PR-T6.1 | PR-T6.2 |
| PR-T6.2 | PR-T6.3 |
| PR-T6.3 | PR-T6.4 |
| PR-T6.4 | PR-T6.5 |
| PR-T6.5 | PR-T6.6 |
| PR-T6.6 | PR-T6.R |
| PR-T6.R (G6 aprovado) | PR-T7.0 |
| PR-T7.0 | PR-T7.1 |
| PR-T7.1 | PR-T7.2 |
| PR-T7.2 | PR-T7.3 |
| PR-T7.3 | PR-T7.4 |
| PR-T7.4 | PR-T7.5 |
| PR-T7.5 | PR-T7.R |
| PR-T7.R (G7 aprovado) | PR-PG.1 |
| PR-PG.1 | PR-PG.2 |
| PR-PG.2 | (Macro concluído) |

**Bloqueios formais explícitos (não esquecimentos):**

* Nenhuma PR de T1..T7 pode abrir antes do Readiness do gate anterior.
* Nenhuma PR de fatia de T5 pode abrir antes da fatia anterior estar com shadow/paridade declarados.
* Nenhuma PR de T6 pode abrir antes de G5 fechado.
* Nenhuma PR de T7 pode abrir antes de G6 fechado.
* Nenhuma PR pós-go-live (PR-PG.*) pode abrir antes de G7 aprovado.

---

## S. Regra canônica de exceção contratual (autorização manual obrigatória do Vasques)

> **Esta regra é soberana sobre toda a Bíblia, sobre todos os contratos ativos, sobre
> qualquer "interpretação útil" ou "quebra benéfica" que um executor possa cogitar.**
> Em qualquer dúvida, vale a versão literal do contrato/macro — não a versão
> "melhorada" pelo executor.

### S.1 Princípio

* **Regra padrão, sempre:** seguir o contrato e o macro literalmente.
* **Nenhuma quebra, flexibilização, suspensão parcial, suavização, "atalho útil",
  "quebra benéfica" ou desvio pontual** do contrato/macro pode ser feita por
  interpretação do executor (humano ou agente), por economia de tempo, por
  conveniência técnica, por suposto benefício ao usuário ou por qualquer outra
  justificativa interna do executor.
* **Somente o Vasques pode autorizar manualmente uma exceção contratual.**
  Nenhuma outra pessoa, agente, modelo, automação ou processo está autorizado.
* A autorização do Vasques deve ser **explícita, específica, temporária e
  registrada** no repo (no body da PR + no handoff vivo da fase). Autorização
  verbal, implícita, presumida ou genérica é inválida.
* **Encerrada a causa específica que motivou a exceção, o projeto retorna
  automaticamente à normalidade do contrato.** Nenhuma exceção é permanente
  por omissão.

### S.2 Campos obrigatórios de uma exceção válida

Toda autorização de exceção contratual deve declarar, sem exceção, todos os campos
abaixo (mesmo formato exigido pelos templates §Q e §P):

```
Exceção contratual autorizada pelo Vasques?: sim
Motivo específico da exceção: <causa pontual e verificável>
Benefício esperado ao contrato/projeto: <ganho concreto, não estético>
Escopo exato da quebra: <o que sai do contrato literal — e nada além disso>
Duração da exceção (esta PR / até qual PR): <PR-X | até PR-Y inclusive>
Condição objetiva de retorno à normalidade contratual: <evento mensurável que encerra a exceção>
Evidência da autorização do Vasques: <link/quote do comentário ou registro explícito>
```

Sem qualquer um desses campos, **a exceção é inválida** e o contrato literal vale.

### S.3 O que está expressamente fora de exceção (nunca exceptuável)

Mesmo com autorização do Vasques, **as seguintes regras nunca podem ser
exceptuadas**, porque pertencem ao macro soberano e ao adendo A00-ADENDO-01:

1. **Soberania da IA na fala** (`schema/ADENDO_CANONICO_SOBERANIA_IA.md`).
   Não é admissível introduzir fala mecânica, surface engessada, fallback dominante
   sobre o LLM, prioridade de fala do mecânico ou qualquer arquitetura que retire
   a soberania da IA na fala. **"Quebra benéfica" desse princípio é proibida.**
2. **Quebra das regras de negócio do MCMV** consolidadas no legado.
3. **Pular gates** (G0..G7) ou abrir fase Tn antes do Readiness/Closeout de Tn-1.
4. **Mudança silenciosa em dados persistidos do Supabase** sem `DATA_CHANGE_PROTOCOL.md`
   cumprido integralmente.
5. **Encerramento implícito de contrato** sem `CONTRACT_CLOSEOUT_PROTOCOL.md`.

Esses pontos são limites duros do projeto. Exceção que tente atingi-los é nula
de origem.

### S.4 Fluxo obrigatório quando o executor identificar suposta necessidade de exceção

1. **Parar a execução.** Não aplicar a quebra.
2. Declarar no body da PR a **proposta de exceção** com todos os campos de §S.2,
   marcando `Exceção contratual autorizada pelo Vasques?: pendente — aguardando autorização`.
3. Aguardar manifestação **explícita** do Vasques.
4. Só prosseguir com a quebra após o Vasques registrar autorização explícita
   (comentário no PR, mensagem registrada no handoff). A autorização entra no
   repo via atualização do body + handoff.
5. Ao encerrar a causa específica, registrar o retorno à normalidade no handoff
   da PR seguinte e remover qualquer marca de exceção ativa.

### S.5 Regra padrão na ausência de exceção válida

Em toda PR, na ausência de autorização do Vasques registrada conforme §S.2:
**seguir o contrato literalmente, sem julgamento autoral do executor**.

### S.6 Aplicação obrigatória nos templates

Esta regra é aplicada operacionalmente em:

* `schema/execution/PR_EXECUTION_TEMPLATE.md` — bloco "Exceção contratual" obrigatório
  no body de toda PR (mesmo quando não há exceção, declarando explicitamente `não`).
* `schema/handoffs/PR_HANDOFF_TEMPLATE.md` — bloco "Exceção contratual" obrigatório
  em todo handoff (declarando se a PR atual operou sob exceção e se a próxima PR
  herda exceção ativa ou volta à normalidade).
* Esta Bíblia §P (handoff) e §Q (abertura) referenciam esta seção como leitura
  obrigatória.

---

## Apêndice 1 — Mapeamento entre IDs lógicos desta Bíblia e o `PLANO_EXECUTIVO_T0_T7.md`

| Bíblia | `PLANO_EXECUTIVO_T0_T7.md` |
|--------|----------------------------|
| PR-P0 | T0-PR1 — rebase canonico da implantacao |
| PR-T0.1..T0.5 | T0-PR2 (inventario) + T0-PR3 (matriz risco/desligamento) — quebrados por microetapa |
| PR-T0.6 | T0-PR3 (parte de desligamento) |
| PR-T0.R | T0-PR4 — smoke documental/readiness G0 |

A quebra fina por microetapa **não invalida** o `PLANO_EXECUTIVO_T0_T7.md`; ela
explicita o que aquele plano agrupava em PRs maiores. Em conflito de granularidade,
**prevalece esta Bíblia**, porque ela aproxima a execução das microetapas literais do
mestre.

---

## Apêndice 2 — Como qualquer nova aba retoma o projeto

1. Ler `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`.
2. Ler esta Bíblia.
3. Ler o último handoff em `schema/handoffs/<FASE>_LATEST.md`.
4. Aplicar `schema/execution/PR_EXECUTION_TEMPLATE.md` para abrir a próxima PR
   indicada no handoff (que deve coincidir com a "Próxima PR autorizada" da PR atual
   nesta Bíblia).
5. Ao concluir, escrever handoff com `schema/handoffs/PR_HANDOFF_TEMPLATE.md`.

**Continuidade zero-escuro garantida pela tripla: mestre + Bíblia + último handoff.**
