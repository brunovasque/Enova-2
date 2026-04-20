# MAPA DE CLÁUSULAS — Core Mecânico 2 — ENOVA 2

> **Este documento é um mapa de vinculação operacional, não um lugar para criatividade contratual.**
>
> Cada entrada mapeia uma cláusula ou regra do contrato macro (A00, A01, blocos legados L03–L17)
> para execução futura do Core Mecânico 2, com referência explícita à fonte.
>
> **Subordinação:** Este mapa está subordinado ao contrato ativo do Core Mecânico 2
> (`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`) e à cadeia de precedência
> `A00 > A01 > A02 > CONTRACT_EXECUTION_PROTOCOL > contrato ativo > legados > PDF-fonte`.
>
> **Regra de fidelidade:** resumos mínimos devem ser estritamente fiéis ao texto-fonte.
> Quando houver dúvida, copiar literalmente o trecho curto da fonte e referenciar página/bloco.

---

## Legenda de tipos de cláusula

| Tipo | Significado |
|------|-------------|
| `soberania conversacional` | Define quem é soberano na fala e quem é soberano na decisão |
| `policy/governança` | Regra de política, precedência ou governança operacional |
| `estado estruturado` | Definição de estado, stage, fact ou estrutura de dados do Core |
| `gate` | Condição de bloqueio ou passagem entre fases/stages |
| `prova` | Evidência obrigatória para aceite |
| `bloqueio` | Condição que impede avanço |
| `rollback` | Regra de reversão ou proteção contra falha |
| `ordem de execução` | Sequência obrigatória de implantação |

---

## Cláusulas do A00 aplicáveis ao Core Mecânico 2

| # | Fonte | Seção/Bloco | Texto vinculante (literal ou resumo fiel) | Efeito operacional no Core | Tipo | PR/tarefa futura |
|---|-------|-------------|-------------------------------------------|---------------------------|------|-----------------|
| A00-01 | A00 | Seção 4.1 | "O negócio manda. As regras do MCMV, do funil e das microregras legadas são a fonte de verdade de negócio." | O Core implementa regras dos blocos L03–L17, não inventa regras novas. | policy/governança | Todas as PRs de modelagem de stages/gates |
| A00-02 | A00 | Seção 4.2 | "O mecânico segue soberano em parse, gates, next-step autorizado, critérios de elegibilidade e persistência estrutural. O LLM não decide regra de negócio." | O Core decide regras; o LLM não altera decisão de negócio. | soberania conversacional | PR de definição da interface Core ↔ Speech |
| A00-03 | A00 | Seção 4.3 | "Uma única surface final por turno. Nenhuma outra camada pode competir pela fala final depois que a resposta for montada." | O Core NÃO emite surface; apenas emite decisão estruturada. | soberania conversacional | PR de desacoplamento Core/Speech |
| A00-04 | A00 | Seção 4.4 | "O LLM pode ser natural, rico e consultivo, mas nunca livre para pular estágio, inventar coleta ou contradizer a política." | O LLM opera sob contrato do stage atual definido pelo Core. | soberania conversacional | PR de definição de contrato por stage |
| A00-05 | A00 | Seção 4.5 | "O cliente nunca pode ficar sem continuidade operacional quando existe next step de coleta. Ao mesmo tempo, nenhuma ponte pode coletar o slot do próximo stage por vazamento acidental." | O Core deve garantir next step contínuo sem vazamento de coleta antecipada. | policy/governança | PR de modelo de transição entre stages |
| A00-06 | A00 | Seção 8.5 | "Policy / Mechanical Core: aplica as regras do MCMV, do funil e da composição familiar; decide o que foi aceito, o que precisa confirmar e qual próximo objetivo operacional autorizado." | Define a função do Core: aplicar regras e decidir next step. | estado estruturado | PR de implementação do modelo de decisão |
| A00-07 | A00 | Seção 3 | "A ENOVA 2 deve operar com quatro soberanias claramente separadas: (1) Policy/Core decide regra e stage; (2) Extractor transforma fala livre em sinais estruturados; (3) Speech Engine monta a resposta final; (4) Persistence Adapter grava estado [...]" | Core é soberania 1 de 4, separada das demais. | soberania conversacional | PR de arquitetura macro do Core |
| A00-08 | A00 | Seção 13 | "A ENOVA 2 não será implantada por temas soltos; será implantada por fatias operacionais completas. Cada fatia precisa nascer com: entrada -> extração -> decisão -> fala -> persistência -> telemetria." | Cada entrega do Core deve ser uma fatia operacional completa. | ordem de execução | Todas as PRs de execução |

---

## Cláusulas do A01 aplicáveis ao Core Mecânico 2

| # | Fonte | Seção/Bloco | Texto vinculante (literal ou resumo fiel) | Efeito operacional no Core | Tipo | PR/tarefa futura |
|---|-------|-------------|-------------------------------------------|---------------------------|------|-----------------|
| A01-01 | A01 | Seção 5, P1 | "Prioridade 1 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala." | Objetivo central do contrato do Core. | policy/governança | Todas as PRs |
| A01-02 | A01 | Seção 6, Gate 1 | "Gate 1 — sem contrato da frente, não começa implementação." | Contrato deve existir antes de implementação (satisfeito por esta PR). | gate | PR de abertura de contrato (esta) |
| A01-03 | A01 | Seção 6, Gate 2 | "Gate 2 — sem smoke da frente, não promove para a frente seguinte." | Core precisa de smoke antes de habilitar Speech Engine. | gate | PR de smoke test do Core |
| A01-04 | A01 | Seção 6, Gate 3 | "Gate 3 — sem previsibilidade operacional em texto puro, áudio e canal ficam bloqueados." | Core + texto puro devem funcionar antes de áudio/canal. | gate | PR de validação de previsibilidade |
| A01-05 | A01 | Seção 7, Core | Entregável: "Contrato + modelo de objetivos/stages + decisão previsível". Prova: "Smoke de trilho e next step autorizado". Estado: "Apto a plugar fala". | Os três critérios mínimos de entrega do Core. | prova | PR de modelo + smoke test |
| A01-06 | A01 | Seção 9 | "Uma frente por vez. Não misturar Core, Speech, Supabase, Áudio e Canal na mesma PR sem necessidade comprovada." | Cada PR do Core faz só Core. | policy/governança | Todas as PRs |
| A01-07 | A01 | Seção 9 | "Uma fatia operacional por vez." | Cada PR entrega uma fatia verificável e completa. | ordem de execução | Todas as PRs |
| A01-08 | A01 | Seção 9 | "Diagnóstico antes de patch. Toda PR começa com leitura e prova do problema; sem isso, para." | Nenhuma PR de execução sem leitura prévia. | policy/governança | Todas as PRs |
| A01-09 | A01 | Seção 4, Fase 2 | "Subir Core + Speech + Supabase mínimo para texto puro no topo e composição simples." | Primeira fatia funcional: topo do funil + composição simples (texto puro). | ordem de execução | PR de primeira fatia |

---

## Cláusulas dos blocos legados (L03–L17) aplicáveis ao Core Mecânico 2

> **ATENÇÃO:** os blocos L03–L17 NÃO estão transcritos no markdown. As entradas abaixo referenciam
> o PDF-fonte (`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`) e identificam a função esperada
> de cada bloco para o Core, conforme o `INDEX_LEGADO_MESTRE.md`. O conteúdo detalhado das cláusulas
> de cada bloco deve ser extraído diretamente do PDF durante a execução de cada PR.

| # | Fonte | Bloco | Função (conforme INDEX_LEGADO_MESTRE.md) | Efeito operacional no Core | Tipo | PR/tarefa futura |
|---|-------|-------|------------------------------------------|---------------------------|------|-----------------|
| L-01 | PDF 1 | L03 | Stages, gates, transições e microregras do funil — referência central de fluxo | Define o mapa de stages e gates que o Core implementa. Bloco mais crítico. | estado estruturado | PR de mapa de stages e gates |
| L-02 | PDF 1 | L04 | Contrato e regras operacionais do topo do funil | Define regras operacionais do stage de topo. | policy/governança | PR de topo do funil |
| L-03 | PDF 1 | L05 | Parser e critérios de extração do topo | Define critérios de extração de sinais do topo. Interface Core ↔ Extractor. | estado estruturado | PR de interface de extração do topo |
| L-04 | PDF 1 | L06 | Critérios de aceite e validação do topo | Define gates de validação e aceite no topo. | gate | PR de gates do topo |
| L-05 | PDF 1 | L07 | Regras de estado civil e impacto na composição familiar | Define regras de estado civil para Meio A. | policy/governança | PR de regras de Meio A |
| L-06 | PDF 1 | L08 | Continuação de regras de composição por estado civil | Complementa L07. | policy/governança | PR de regras de Meio A |
| L-07 | PDF 1 | L09 | Microregras de composição familiar — elegibilidade e dependentes | Define microregras de composição para Meio A. | policy/governança | PR de microregras de Meio A |
| L-08 | PDF 1 | L10 | Continuação de microregras de composição familiar | Complementa L09. | policy/governança | PR de microregras de Meio A |
| L-09 | PDF 1 | L11 | Regras de regime de bens, renda e IR — base para elegibilidade | Define regras de regime e renda para Meio B. | policy/governança | PR de regras de Meio B |
| L-10 | PDF 1 | L12 | Continuação de regras de regime e renda | Complementa L11. | policy/governança | PR de regras de Meio B |
| L-11 | PDF 1 | L13 | Regras de CTPS, dependentes e restrições de elegibilidade | Define restrições de Meio B. | bloqueio | PR de restrições de Meio B |
| L-12 | PDF 1 | L14 | Gates de bloqueio e restrições de elegibilidade do Meio B | Define gates formais de Meio B. | gate | PR de gates de Meio B |
| L-13 | PDF 1 | L15 | Trilhos especiais e variantes P3 e multi-proponente | Define trilhos especiais do funil. | estado estruturado | PR de trilhos especiais |
| L-14 | PDF 1 | L16 | Composição familiar especial e variantes de elegibilidade | Complementa L15. | policy/governança | PR de trilhos especiais |
| L-15 | PDF 1 | L17 | Transição final do funil, documentos, handoff e visita | Define a fase final operacional. | estado estruturado | PR de fase final |

---

## Ordem sugerida de execução das PRs do Core

Baseada na ordem mínima de leitura da frente e na regra de fatias operacionais:

| Ordem | Bloco(s) | Recorte | Pré-requisito |
|-------|----------|---------|---------------|
| 1 | L03 | Mapa de stages e gates — estrutura central | Contrato aberto (esta PR) |
| 2 | L04, L05, L06 | Topo do funil — regras, extração e gates | Mapa de stages (Ordem 1) |
| 3 | L07, L08, L09, L10 | Meio A — estado civil e composição familiar | Topo funcional (Ordem 2) |
| 4 | L11, L12, L13, L14 | Meio B — regime, renda, CTPS, gates | Meio A funcional (Ordem 3) |
| 5 | L15, L16 | Especiais — trilhos P3, multi, variantes | Meio B funcional (Ordem 4) |
| 6 | L17 | Final — transição final, docs, visita | Especiais funcional (Ordem 5) |
| 7 | Integração | Smoke test de trilho completo (topo → final) | Todos os stages (Ordens 1–6) |

> **Nota:** cada PR de execução deve consultar o PDF-fonte para os blocos necessários e
> declarar explicitamente a consulta, conforme `CONTRACT_SOURCE_MAP.md` seção 6 e
> `CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md`.

---

## Regras de uso deste mapa

1. Este mapa é um **índice de vinculação**, não um documento de implementação.
2. Cada PR futura deve apontar para uma ou mais entradas deste mapa como âncora contratual.
3. Se a PR não conseguir apontar para uma entrada deste mapa, ela deve **parar**.
4. Novas entradas só podem ser adicionadas com referência explícita ao PDF-fonte ou ao A00/A01/A02.
5. Entradas existentes não podem ser modificadas para enfraquecer a vinculação com a fonte.
6. Este mapa deve ser atualizado à medida que PRs de execução concluem recortes do contrato.
