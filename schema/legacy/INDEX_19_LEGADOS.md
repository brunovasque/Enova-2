# INDEX_19_LEGADOS — Índice Completo dos 19 Legados da ENOVA 2

## Finalidade

Este índice amarra os 19 documentos legados da Enova 1 à estrutura canônica da ENOVA 2.
Ele define, para cada legado: nome canônico, função, domínio, quando usar, com qual frente conversa, precedência e status de assimilação.

## Precedência

A00 > A01 > A02 > contrato específico da frente ativa > documentos legados aplicáveis.
O legado manda nas regras de negócio. O pacote canônico novo manda na arquitetura e na ordem executiva.

---

## Índice completo

| Código | Nome canônico                                  | Classe / Família         | Função                                                          | Domínio                              | Quando usar                                                        | Frentes que conversam                                    | Precedência na cadeia | Status de assimilação |
|--------|------------------------------------------------|--------------------------|------------------------------------------------------------------|--------------------------------------|--------------------------------------------------------------------|----------------------------------------------------------|-----------------------|-----------------------|
| L01    | Plano Macro / Handoff Canônico (Parte 1)       | Plano macro / handoff    | Contexto geral, objetivo maior, estado de evolução, decisões já tomadas | Estratégia e continuidade            | Quando a aba exigir contexto global ou continuidade estratégica     | Todas (governança)                                       | 5º na cadeia          | Placeholder criado    |
| L02    | Plano Macro / Handoff Canônico (Parte 2)       | Plano macro / handoff    | Continuidade do L01 — detalhamento e decisões complementares     | Estratégia e continuidade            | Quando a aba exigir contexto global ou continuidade estratégica     | Todas (governança)                                       | 5º na cadeia          | Placeholder criado    |
| L03    | Mapa Canônico do Funil                         | Mapa canônico do funil   | Stages, gates, transições, microregras e expectativas do funil   | Funil e fluxo conversacional         | Sempre que a frente tocar funil, coleta, parse ou nextStage         | Core Mecânico 2, Speech, Contexto, Supabase              | 4º na cadeia          | Placeholder criado    |
| L04    | Topo do Funil — Contrato                       | Topo do funil            | Contrato e regras do topo do funil                               | Topo do funil                        | Somente em frente de topo                                           | Core Mecânico 2                                          | 5º na cadeia          | Placeholder criado    |
| L05    | Topo do Funil — Parser                         | Topo do funil            | Parser e critérios de extração do topo                           | Topo do funil                        | Somente em frente de topo                                           | Core Mecânico 2, Contexto/Extração                       | 5º na cadeia          | Placeholder criado    |
| L06    | Topo do Funil — Critérios                      | Topo do funil            | Critérios de aceite e validação do topo                          | Topo do funil                        | Somente em frente de topo                                           | Core Mecânico 2                                          | 5º na cadeia          | Placeholder criado    |
| L07    | Meio A — Estado Civil (Parte 1)                | Meio A — composição      | Regras de estado civil e composição familiar                     | Meio A / composição                  | Somente em frente de Meio A                                         | Core Mecânico 2                                          | 5º na cadeia          | Placeholder criado    |
| L08    | Meio A — Estado Civil (Parte 2)                | Meio A — composição      | Continuação de regras de composição                              | Meio A / composição                  | Somente em frente de Meio A                                         | Core Mecânico 2                                          | 5º na cadeia          | Placeholder criado    |
| L09    | Meio A — Composição Familiar (Parte 1)         | Meio A — composição      | Microregras de composição familiar                               | Meio A / composição                  | Somente em frente de Meio A                                         | Core Mecânico 2                                          | 5º na cadeia          | Placeholder criado    |
| L10    | Meio A — Composição Familiar (Parte 2)         | Meio A — composição      | Continuação de microregras de composição                         | Meio A / composição                  | Somente em frente de Meio A                                         | Core Mecânico 2                                          | 5º na cadeia          | Placeholder criado    |
| L11    | Meio B — Regime e Renda (Parte 1)              | Meio B — regime/renda    | Regras de regime de bens, renda e IR                             | Meio B / regime e renda              | Somente em frente de Meio B                                         | Core Mecânico 2                                          | 5º na cadeia          | Placeholder criado    |
| L12    | Meio B — Regime e Renda (Parte 2)              | Meio B — regime/renda    | Continuação de regras de regime e renda                          | Meio B / regime e renda              | Somente em frente de Meio B                                         | Core Mecânico 2                                          | 5º na cadeia          | Placeholder criado    |
| L13    | Meio B — CTPS e Dependentes                    | Meio B — regime/renda    | Regras de CTPS, dependentes e restrições                         | Meio B / regime e renda              | Somente em frente de Meio B                                         | Core Mecânico 2                                          | 5º na cadeia          | Placeholder criado    |
| L14    | Meio B — Gates e Restrições                    | Meio B — regime/renda    | Gates de bloqueio e restrições de elegibilidade                  | Meio B / regime e renda              | Somente em frente de Meio B                                         | Core Mecânico 2                                          | 5º na cadeia          | Placeholder criado    |
| L15    | Especiais — Trilhos P3 / Multi                 | Especiais / familiar     | Trilhos especiais e variantes P3/multi                           | Especiais / P3 / multi               | Somente em frente especial/P3/multi                                 | Core Mecânico 2                                          | 5º na cadeia          | Placeholder criado    |
| L16    | Especiais — Familiar e Variantes               | Especiais / familiar     | Composição familiar especial e variantes                         | Especiais / P3 / multi               | Somente em frente especial/P3/multi                                 | Core Mecânico 2                                          | 5º na cadeia          | Placeholder criado    |
| L17    | Final Operacional / Docs / Visita              | Final operacional        | Transição final, documentos, handoff, visita, finalização        | Final / docs / visita                | Somente em frente final                                              | Core Mecânico 2                                          | 5º na cadeia          | Placeholder criado    |
| L18    | Runner / QA / Telemetria                       | Runner / QA / telemetria | Matriz de teste, critérios de aceite e observabilidade           | QA e telemetria                      | Sempre que a aba envolver prova, regressão ou rollout               | Todas (telemetria, QA, rollout)                          | 5º na cadeia          | Placeholder criado    |
| L19    | Memorial do Programa / Analista MCMV           | Memorial do programa     | Regras substantivas do programa, exigências por perfil, critérios| Programa MCMV / analista virtual     | Sempre que a frente tocar interpretação de perfil, política do programa ou perguntas adicionais inteligentes | Core Mecânico 2, Contexto, Áudio, Analista MCMV         | 5º na cadeia          | Placeholder criado    |

---

## Amarração por frente (qual legado ler em cada frente)

| Frente                                         | Legados obrigatórios         | Legados complementares        |
|------------------------------------------------|------------------------------|-------------------------------|
| Core Mecânico 2                                | L03, L04–L17                 | L01–L02, L18, L19             |
| Speech Engine e Surface Única                  | L03, L01–L02                 | Família da frente ativa       |
| Contexto, Extração e Memória Viva              | L03, L19                     | Família da frente ativa       |
| Supabase Adapter e Persistência                | L03, L18                     | Contrato da frente ativa      |
| Áudio e Multimodalidade                        | L19                          | L03, contrato da frente ativa |
| Meta/WhatsApp                                  | L18                          | Contrato da frente ativa      |
| Telemetria e Observabilidade                   | L18                          | L03, contrato da frente ativa |
| Rollout                                        | L18                          | L03, contrato da frente ativa |

---

## Regra de incorporação sem drift

1. Cada legado tem um arquivo dedicado neste diretório (`L01_*.md` até `L19_*.md`).
2. Enquanto o conteúdo original não estiver transcrito, o arquivo funciona como **placeholder estruturado**.
3. A incorporação deve preservar o conteúdo original com fidelidade — **não resumir demais**.
4. Após incorporação, atualizar o status de assimilação neste índice para `Conteúdo incorporado`.
5. Nenhum legado pode ser alterado em conteúdo de regra de negócio sem aprovação explícita e atualização do A02.
6. A incorporação não cria nova precedência — o legado segue como 5º/6º na cadeia conforme A00.

## Status canônicos de assimilação

| Status                  | Significado                                                        |
|-------------------------|--------------------------------------------------------------------|
| Placeholder criado      | Arquivo existe com estrutura canônica, conteúdo original pendente   |
| Conteúdo incorporado    | Conteúdo original transcrito com fidelidade no arquivo canônico     |
| Revisado e validado     | Conteúdo revisado por humano e confirmado como fiel ao original     |
