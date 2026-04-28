# CONTRATO — T6 Docs, Multimodalidade e Superfícies de Canal — ENOVA 2

| Campo                             | Valor                                                                                         |
|-----------------------------------|-----------------------------------------------------------------------------------------------|
| Frente                            | T6 — Docs, multimodalidade e superfícies de canal                                            |
| Fase do A01                       | T6 (semanas 13–14 da implantação macro)                                                      |
| Prioridade do A01                 | 7                                                                                             |
| Dependências                      | G5 APROVADO (`schema/implantation/T5_READINESS_CLOSEOUT_G5.md`), T5 encerrado, T1–T4 encerrados |
| Legados aplicáveis                | L03 (obrigatório); L17 (PR-T6.3, T6.4, T6.8); L18 (PR-T6.9, T6.R); L19 (complementar em T6.5) |
| Referências obrigatórias          | `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`, `schema/ADENDO_CANONICO_SOBERANIA_IA.md`, `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`, `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`, `schema/CONTRACT_SCHEMA.md`, `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`, `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`, `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` seção M |
| Status                            | **em execução** — PR-T6.1 executada em 2026-04-28; próxima: PR-T6.2                         |
| Última atualização                | 2026-04-28                                                                                    |

---

## Adendos canônicos obrigatórios

Este contrato e todas as suas PRs devem declarar conformidade com:

- `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01) — IA soberana na fala; mecânico jamais com prioridade de fala. **Nenhuma superfície de canal, adapter, pipeline de mídia ou processador de documento pode escrever `reply_text` ao cliente.** Canal é entrada, não cérebro de fala.
- `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02) — identidade MCMV; trava explícita T6: **Multimodalidade NÃO cria outro cérebro. Áudio, imagem, PDF, sticker e botão são superfícies de entrada que alimentam o mesmo pipeline T1→T2→T3→T4→T5.** Canal não decide stage. Mídia não avança funil sozinha.
- `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03) — "Evidência manda no estado." Bloco E obrigatório em toda PR que feche sub-contrato, gate ou contrato.

---

## §1 Objetivo

T6 entrega a **camada de docs, multimodalidade e superfícies de canal da ENOVA 2**: o conjunto de contratos que governa como texto, documentos, imagens, PDFs, áudio, sticker e mídia entram pelo canal (WhatsApp/Meta), são processados, associados ao lead e alimentam — sem desvio — o mesmo pipeline T4 (entrada → LLM → validação → persistência → resposta/rastro/fallback) já aprovado.

**T6 não cria outro cérebro.** Tudo que entra pelo canal passa pela mesma governança já construída: T1 → T2 → T3 → T4 → T5. Canal não decide sozinho. Mídia não avança stage sozinha. Áudio não vira funil paralelo. OCR e transcrição não viram verdade absoluta. WhatsApp não escreve fala por conta própria.

O objetivo de negócio: ao final de T6, a ENOVA 2 consegue receber texto, documento, imagem, PDF, áudio, sticker e mídia inútil pelo WhatsApp real (governado), processar cada tipo de entrada corretamente, associar documentos ao lead e às pessoas certas (P1/P2/P3), manter dossiê operacional com trilha, e operar o adapter Meta/WhatsApp com idempotência — tudo sob a mesma governança LLM-first de T1–T5, sem canal aberto em produção ampla (isso é T7).

**T6 é canal sob governança — não go-live amplo.** O go-live controlado, shadow, canary e cutover são escopo exclusivo de T7.

---

## §2 Escopo

1. **Pré-flight de riscos herdados da T5** — tratamento documental das atenções AT-01, AT-03, AT-04 antes de avançar canal real; AT-05 continua lacuna normativa (PR-T6.1).
2. **Surface única de canal** — contrato da camada de entrada única: texto, documento, imagem, PDF, áudio, sticker, botão/link, evento de sistema; invariante: canal não escreve atendimento (PR-T6.2).
3. **Contrato de anexos e documentos** — governança documental para todos os tipos de documento exigidos pelo dossiê MCMV (PR-T6.3).
4. **Pipeline de imagem/PDF/documento** — como mídia documental é recebida, classificada, associada ao lead e à pessoa correta, marcada e alimenta o dossiê (PR-T6.4).
5. **Áudio no mesmo cérebro conversacional** — transcrição, confiança, extração de fatos, confirmação em ambiguidade, limites de avanço por áudio, tratamento de áudio ruim (PR-T6.5).
6. **Sticker, mídia inútil e mensagens não textuais** — tratamento seguro de sujeira do WhatsApp real sem quebrar o funil (PR-T6.6).
7. **Adapter Meta/WhatsApp governado** — contrato do canal real: webhook, outbound, verificação, idempotência, deduplicação, retries, erros, mídia, rate limit (PR-T6.7).
8. **Dossiê operacional e link do correspondente** — montagem do link, anexos recebidos, docs pendentes, envio/retorno do correspondente, trilha de auditoria (PR-T6.8).
9. **Suite de testes/sandbox multicanal** — cenários completos de validação da governança multicanal (PR-T6.9).
10. **Readiness/Closeout G6** — smoke T6.1–T6.9; verificação CA-T6-01..CA-T6-10; decisão G6 APROVADO ou REPROVADO (PR-T6.R).
11. Atualização de `schema/status/`, `schema/handoffs/` e `schema/contracts/_INDEX.md` a cada PR.

---

## §3 Fora de escopo

- **Canary, cutover ou desligamento do legado** — escopo exclusivo de T7.
- **Rollout em produção ampla** — proibido antes de T7 e G7.
- **Campanha comercial** — fora do escopo desta fase.
- **Alteração de artefatos T1/T2/T3/T4/T5 já aprovados** — qualquer necessidade de ajuste exige revisão contratual formal.
- **Criação de novo cérebro paralelo** — qualquer camada de canal que decida stage, produza `reply_text` ou avance funil de forma independente é violação de A00-ADENDO-01.
- **Usar canal para decidir fluxo sozinho** — proibido; canal é entrada, não orquestrador.
- **Base normativa MCMV/CEF completa** — AT-05 continua lacuna normativa planejada; frente própria futura.
- **Alteração profunda de Supabase sem contrato próprio** — qualquer migration estrutural exige contrato de frente específico.
- **Reescrever T1–T5** — T6 consome a governança existente sem alterá-la.
- **Mudar regra de negócio do funil** — regras MCMV são fixas em T2/T3/T5; T6 não as altera.
- **Produção ampla antes de T7** — T6 vai até sandbox/governança controlada; T7 abre go-live.
- **OCR obrigatório** — OCR pode ser lacuna futura; T6 define governança de documento sem exigir OCR como pré-requisito.
- **Implementação de código TypeScript/JavaScript em `src/`** — T6 é contratual/documental até que PR específica autorize implementação controlada.

---

## §4 Dependências

### Dependências de gate

- **G5 APROVADO** — `schema/implantation/T5_READINESS_CLOSEOUT_G5.md` — G5 PRONTO COM ATENÇÃO — APROVADO — **SATISFEITA em 2026-04-28**.
- **Contrato T5 encerrado** — `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T5_2026-04-28.md` — **SATISFEITA em 2026-04-28**.

### Dependências de artefato (T5 — funil core)

- `schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` — dossiê, correspondente, visita e handoff — **base que T6 expande para canal real**.
- `schema/implantation/T5_MAPA_FATIAS.md` — stages e transições do funil — **intocável por T6**.
- Todos os `T5_FATIA_*.md` — fatias F1–F5 — **intocáveis por T6, exceto PR-T6.1 (pré-flight cirúrgico de AT-01/03/04)**.

### Dependências de artefato (T4 — orquestrador)

- `schema/implantation/T4_PIPELINE_LLM.md` — contrato único LLM; `reply_text` imutável — **trava que T6 preserva em todo canal**.
- `schema/implantation/T4_ENTRADA_TURNO.md` — shape `TurnoEntrada` — **T6 alimenta este shape via adapter de canal**.
- `schema/implantation/T4_VALIDACAO_PERSISTENCIA.md` — VC-01..VC-09 — **validador que persiste fatos coletados por qualquer canal**.
- `schema/implantation/T4_RESPOSTA_RASTRO_METRICAS.md` — `TurnoRastro`; entrega `reply_text` ao canal — **saída do turno que T6 não altera**.
- `schema/implantation/T4_FALLBACKS.md` — 4 cenários de falha — **fallbacks herdados**.

### Dependências de artefato (T2/T3 — estado e políticas)

- `schema/implantation/T2_LEAD_STATE_V1.md` — 35 `fact_*` + derived + signal — **schema que T6 não pode inventar novos fatos sem contrato T2 formal**.
- `schema/implantation/T3_CLASSES_POLITICA.md` — 5 classes de política — **políticas que governam cada superfície de canal**.
- `schema/implantation/T3_VETO_SUAVE_VALIDADOR.md` — VC-01..VC-09 — **validador que bloqueia persistência incorreta em qualquer canal**.

### Dependências de artefato (T1 — contrato cognitivo)

- `schema/implantation/T1_CONTRATO_SAIDA.md` — `TurnoSaida`; `reply_text` exclusivo do LLM — **trava canônica que T6 preserva sem exceção em qualquer canal**.
- `schema/implantation/T1_SYSTEM_PROMPT_CANONICO.md` — identidade do LLM — **base do prompt em qualquer canal**.

### Atenções herdadas da T5 (a tratar em PR-T6.1)

- **AT-01** — Ponteiro F2 averbação → F4 desatualizado; regra correta em F5 RC-F5-36; PR-T6.1 corrige documentalmente.
- **AT-03** — Separado sem averbação descoberto tardiamente em F2; regra correta em F5 RC-F5-37; PR-T6.1 adiciona nota preventiva em F2.
- **AT-04** — Docs para regime múltiplo implícitos em F5; PR-T6.1 adiciona RC explícita em F5 para regime múltiplo — **prioritária antes de qualquer runtime de canal**.
- **AT-05** — Base normativa MCMV/CEF ausente; continua lacuna normativa planejada; não tratada em T6 (frente futura).

---

## §5 Entradas

| # | Artefato | Caminho | Condição de entrada |
|---|----------|---------|---------------------|
| E1 | Readiness G5 | `schema/implantation/T5_READINESS_CLOSEOUT_G5.md` | G5 APROVADO com atenções aceitas; Bloco E presente |
| E2 | Contrato T5 arquivado | `schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T5_2026-04-28.md` | ENCERRADO |
| E3 | Contrato T6 aberto | `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` | ABERTO (este documento) |
| E4 | Fatia F5 docs/handoff | `schema/implantation/T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` | Dossiê, correspondente, visita declarados; RC-F5-01..37 vigentes |
| E5 | Pipeline T4 | `schema/implantation/T4_PIPELINE_LLM.md` + `T4_ENTRADA_TURNO.md` + `T4_VALIDACAO_PERSISTENCIA.md` | Contrato único LLM; `reply_text` imutável; VC-01..09 ativos |
| E6 | Lead state T2 | `schema/implantation/T2_LEAD_STATE_V1.md` | 35 `fact_*` + derived + signal; base que T6 não pode extrapolar |
| E7 | Classes política T3 | `schema/implantation/T3_CLASSES_POLITICA.md` + `T3_VETO_SUAVE_VALIDADOR.md` | 5 classes; VC-01..09; `reply_text` proibido |
| E8 | Bíblia Canônica §M | `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` seção M | PRs T6.0–T6.R mapeadas |
| E9 | Legado mestre T6 | `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md` seção T6 | Microetapas do mestre acessíveis |
| E10 | AT-01/03/04 aceitas | `schema/implantation/T5_READINESS_CLOSEOUT_G5.md §12` | 3 atenções documentadas; PR-T6.1 autorizada a corrigi-las |

---

## §6 Saídas

| # | Artefato | Caminho | PR que o cria | Conteúdo mínimo |
|---|----------|---------|---------------|-----------------|
| S1 | Pré-flight T5 | `schema/implantation/T6_PREFLIGHT_RISCOS_T5.md` | PR-T6.1 | Correção AT-01 (ponteiro F2), AT-03 (nota F2), AT-04 (RC explícita F5 regime múltiplo); AT-05 declarada como lacuna continuada |
| S2 | Surface canal | `schema/implantation/T6_SURFACE_CANAL.md` | PR-T6.2 | Contrato da camada única de entrada: texto, documento, imagem, PDF, áudio, sticker, botão, evento; invariante sem `reply_text`; canal não decide stage |
| S3 | Contrato de anexos | `schema/implantation/T6_CONTRATO_ANEXOS_DOCUMENTOS.md` | PR-T6.3 | Governança de todos os tipos de documento do dossiê MCMV; tipos aceitos/rejeitados; associação ao lead e à pessoa; estados do documento |
| S4 | Pipeline imagem/PDF | `schema/implantation/T6_PIPELINE_IMAGEM_PDF.md` | PR-T6.4 | Como mídia documental é recebida, classificada, associada (P1/P2/P3), marcada (recebido/pendente/inválido) e alimenta dossiê; OCR como lacuna futura |
| S5 | Áudio conversacional | `schema/implantation/T6_AUDIO_CEREBRO_CONVERSACIONAL.md` | PR-T6.5 | Transcrição; nível de confiança; extração de fatos; confirmação em ambiguidade; limites de avanço; áudio ruim; resposta pelo LLM; áudio não avança sozinho |
| S6 | Sticker/mídia inútil | `schema/implantation/T6_STICKER_MIDIA_INUTIL.md` | PR-T6.6 | Tratamento seguro de sujeira do WhatsApp: sticker, imagem sem doc, áudio inaudível, mídia repetida, print confuso, arquivo corrompido, reação/emoji; funil não quebra |
| S7 | Adapter Meta/WhatsApp | `schema/implantation/T6_ADAPTER_META_WHATSAPP.md` | PR-T6.7 | Webhook inbound/outbound; verificação/assinatura; idempotência; deduplicação; retries; erros; rate limit; separação canal/cérebro; não é go-live amplo |
| S8 | Dossiê operacional | `schema/implantation/T6_DOSSIE_OPERACIONAL.md` | PR-T6.8 | Link do correspondente; anexos recebidos; docs pendentes por perfil; envio/retorno do correspondente; segurança mínima; trilha de auditoria |
| S9 | Suite multicanal | `schema/implantation/T6_SUITE_TESTES_MULTICANAL.md` | PR-T6.9 | Cenários: texto puro, texto+imagem, PDF, áudio, mídia inválida, docs incompletos, cliente some, reenvio, aprovado→visita, reprovado→orientação, correspondente retorna |
| S10 | Readiness G6 | `schema/implantation/READINESS_G6.md` | PR-T6.R | Smoke S1–S9; CA-T6-01..CA-T6-10 verificados; canais controlados; multimodal sob mesma governança; decisão G6 APROVADO ou REPROVADO; Bloco E |

---

## §7 Critérios de aceite

| # | Critério | Verificação |
|---|----------|-------------|
| CA-T6-01 | **Canal sob mesma governança T1–T5** — toda entrada de qualquer superfície de canal passa pelo pipeline T4 sem criar camada paralela de decisão | Inspeção de S1–S9: nenhum adapter, pipeline ou processador de mídia produz `reply_text`, decide stage ou avança funil independentemente |
| CA-T6-02 | **`reply_text` exclusivo do LLM** — nenhuma superfície de canal, adapter, pipeline de mídia, processador de documento ou sistema de dossiê produz texto de resposta ao cliente | Inspeção de S1–S9: ausência de qualquer campo `reply_text`, mensagem pré-montada ou template de fala em qualquer output de T6 |
| CA-T6-03 | **Áudio não avança stage sozinho** — transcrição de áudio sempre passa por extração, validação e confirmação antes de persistir fato crítico; nível de confiança declarado; áudio ambíguo sempre confirma com LLM | `T6_AUDIO_CEREBRO_CONVERSACIONAL.md`: limite de avanço por áudio declarado; confiança mínima requerida; fluxo de confirmação presente |
| CA-T6-04 | **Imagem/PDF não vira verdade absoluta** — documento recebido é classificado, associado e marcado; fato extraído de documento é separado de fato extraído do cliente; OCR é lacuna futura; documento sem leitura automática não bloqueia atendimento | `T6_PIPELINE_IMAGEM_PDF.md`: separação fato-cliente × fato-documento; estados do documento; OCR declarado como lacuna |
| CA-T6-05 | **Documento pode ser associado ao lead e à pessoa correta** — cada documento recebido pode ser associado a P1, P2 ou P3; documento sem dono claro gera pendência, não pânico | `T6_CONTRATO_ANEXOS_DOCUMENTOS.md` + `T6_PIPELINE_IMAGEM_PDF.md`: associação P1/P2/P3 declarada; estado "sem dono" tratado |
| CA-T6-06 | **Mídia inválida não quebra o funil** — sticker, imagem ambígua, áudio inaudível, arquivo corrompido e mídia repetida têm tratamento explícito que mantém o atendimento em curso | `T6_STICKER_MIDIA_INUTIL.md`: todos os tipos de sujeira tratados; funil prossegue em todos os casos |
| CA-T6-07 | **WhatsApp/Meta com idempotência e deduplicação** — adapter Meta/WhatsApp garante que evento duplicado não gera dois turnos; webhook assinado; retries controlados | `T6_ADAPTER_META_WHATSAPP.md`: idempotência declarada; deduplicação por `message_id`; assinatura verificada |
| CA-T6-08 | **Dossiê mantém trilha mínima** — toda recepção de documento, envio ao correspondente e retorno do correspondente gera registro rastreável; dossiê tem estado auditável | `T6_DOSSIE_OPERACIONAL.md`: trilha de auditoria declarada; estados do dossiê; log de envio/retorno |
| CA-T6-09 | **Sandbox multicanal cobre casos reais** — suite de testes cobre texto, PDF, áudio, mídia inválida, docs incompletos, cliente sumindo, aprovação→visita, reprovação→orientação | `T6_SUITE_TESTES_MULTICANAL.md`: mínimo de cenários declarados; cobertura de casos de borda |
| CA-T6-10 | **G6 decidido com Bloco E e evidência formal** — READINESS_G6.md contém smoke S1–S9, CA-T6-01..09 verificados, decisão G6 APROVADO ou REPROVADO, Bloco E presente | `READINESS_G6.md` criado por PR-T6.R com smoke, critérios e Bloco E completo |

---

## §8 Provas obrigatórias

| Prova | Descrição |
|-------|-----------|
| P-T6-01 | Diff de cada artefato criado — inspeção confirmando ausência de `reply_text`, template de fala, if/else de fala, decisão de stage sem pipeline T4, ou qualquer mecanismo de canal paralelo |
| P-T6-02 | Referências cruzadas T1/T2/T3/T4/T5 — cada fato, política e output de T6 aponta para artefato canônico existente; nenhum fato inventado fora do schema T2 |
| P-T6-03 | Conformidade A00-ADENDO-01 e A00-ADENDO-02 — declaração explícita de que canal é entrada, não cérebro; `reply_text` exclusivo do LLM; multimodal sob mesma governança |
| P-T6-04 | Separação fato-cliente × fato-documento — prova de que extração de documento e extração de fala do cliente têm confiança e origem distintas |
| P-T6-05 | Smoke S1–S9 (PR-T6.R) — checklist de 9 artefatos com status PASS/FAIL + justificativa; verificação cruzada T1/T2/T3/T4/T5 × T6 |

---

## §9 Bloqueios

| # | Bloqueio | Condição de desbloqueio |
|---|----------|------------------------|
| B-T6-01 | **G5 não aprovado** — T6 não pode abrir sem G5 APROVADO | `T5_READINESS_CLOSEOUT_G5.md` com G5 APROVADO — **DESBLOQUEADO em 2026-04-28** |
| B-T6-02 | **Contrato T5 não encerrado** — T6 não pode iniciar sem T5 formalmente encerrado | `CONTRATO_IMPLANTACAO_MACRO_T5_2026-04-28.md` presente em archive/ — **DESBLOQUEADO em 2026-04-28** |
| B-T6-03 | **PR fora de sequência** — nenhuma PR-T6.N pode iniciar sem a PR-T6.(N-1) concluída e merged | Branch principal atualizado; PR anterior merged |
| B-T6-04 | **Outro cérebro paralelo** — qualquer camada de canal que produza `reply_text` ou decida stage de forma autônoma viola A00-ADENDO-01 | Bloqueio permanente — condição de não-conformidade imediata; PR não pode ser mergeada |
| B-T6-05 | **Áudio como verdade absoluta** — áudio/transcrição persistindo fato crítico sem confirmação viola CA-T6-03 | Bloqueio ativo; `T6_AUDIO_CEREBRO_CONVERSACIONAL.md` deve declarar nível de confiança e fluxo de confirmação |
| B-T6-06 | **Canal sem idempotência** — adapter Meta/WhatsApp sem deduplicação e verificação de assinatura viola CA-T6-07 | Bloqueio ativo; `T6_ADAPTER_META_WHATSAPP.md` deve declarar idempotência antes de qualquer runtime |
| B-T6-07 | **T7 aberta prematuramente** — T7 (shadow/canary/cutover) não pode iniciar antes de G6 APROVADO | Bloqueio ativo até PR-T6.R com G6 APROVADO |
| B-T6-08 | **Produção ampla** — nenhum tráfego real de leads pode ser processado pela ENOVA 2 antes de T7 | Bloqueio ativo; T6 só opera em sandbox/ambiente controlado |
| B-T6-09 | **Alteração de T1–T5** — nenhuma PR T6 pode alterar artefatos de frentes anteriores, exceto PR-T6.1 (pré-flight cirúrgico de AT-01/03/04) | Bloqueio ativo para qualquer PR T6 exceto T6.1; T6.1 tem escopo cirúrgico declarado |
| B-T6-10 | **G6 fechado sem PR-T6.R** — G6 não pode ser declarado sem readiness/closeout formal | Bloqueio ativo até PR-T6.R com smoke S1–S9 e Bloco E |

---

## §10 Próximo passo autorizado

**PR-T6.1 — Pré-flight de riscos herdados da T5**

- Artefato: `schema/implantation/T6_PREFLIGHT_RISCOS_T5.md`
- Escopo: correção cirúrgica das atenções AT-01 (ponteiro F2 averbação → F5), AT-03 (nota F2 separado sem averbação), AT-04 (RC explícita F5 regime múltiplo — prioritária); AT-05 declarada como lacuna continuada; zero runtime
- Referência: `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` §M, PR-T6.1

---

## §11 Relação com o A01

| Campo A01 | Valor |
|-----------|-------|
| Fase      | T6 — Semanas 13–14 |
| Prioridade | 7 |
| Gate de entrada | G5 APROVADO |
| Gate de saída | G6 — Multimodal sob mesma governança sem explodir latência nem quebrar previsibilidade |
| Épico do mestre | "Docs, multimodal e superfícies de canal: acoplar texto, áudio, imagem, sticker — multimodal sob mesma governança T1–T5; canal adapter governado; dossiê operacional" |
| Posição na cadeia | T1 → T2 → T3 → T4 → T5 → **T6 (docs/multimodal/canal)** → T7 (shadow/canary/cutover) |

---

## §12 Relação com T5 encerrada

| Item T5 | Relevância para T6 |
|---------|-------------------|
| `T5_FATIA_DOCUMENTACAO_VISITA_HANDOFF.md` (F5) | Base do dossiê que T6 expande para canal real e recepção de documentos por WhatsApp |
| AT-01/03/04 aceitas em T5.R | T6.1 corrige documentalmente antes de qualquer runtime de canal |
| AT-05 (base normativa MCMV/CEF) | Continua lacuna normativa planejada; não é escopo de T6 |
| Inventário fora de escopo | Permanece fora do escopo de T6; não reabrir |
| Atenções AT-01/03/04 | Tratar em PR-T6.1 como pré-flight; não bloquear abertura de T6 |

---

## §13 Relação com legados aplicáveis

| Legado | Relevância para T6 | Uso por PR |
|--------|-------------------|------------|
| L03 — Mapa Canônico do Funil | **Obrigatório** — stages e gates do funil que canal não pode alterar | Todas as PRs T6.1–T6.R |
| L17 — Final Operacional / Docs / Visita | Obrigatório para docs/dossiê — transição final, documentação, visita e handoff | PR-T6.3, T6.4, T6.8 |
| L18 — Runner / QA / Telemetria | Obrigatório para suite de testes e readiness | PR-T6.9, T6.R |
| L19 — Memorial do Programa / Analista MCMV | Complementar — regras substantivas MCMV por perfil; contexto para governança de documentos | Complementar em T6.3, T6.5 |

---

## §14 Riscos principais

| # | Risco | Mitigação declarada |
|---|-------|---------------------|
| R-T6-01 | WhatsApp real duplicar eventos | CA-T6-07: idempotência e deduplicação por `message_id` em T6.7 |
| R-T6-02 | Cliente mandar documento fora de ordem | CA-T6-04/05: documento classificado e associado; estado "fora de ordem" tratado como pendência |
| R-T6-03 | Cliente mandar foto ruim/ilegível | CA-T6-06: mídia inválida tratada em T6.6; funil não quebra |
| R-T6-04 | Áudio transcrever errado e gerar fato falso | CA-T6-03: nível de confiança + confirmação LLM antes de persistir; fato de áudio confirmado = confirmed |
| R-T6-05 | Anexo sem dono correto (P1/P2/P3) | CA-T6-05: associação P1/P2/P3 obrigatória; sem dono = pendência rastreável |
| R-T6-06 | Dossiê incompleto enviado como completo | CA-T6-08: trilha de auditoria; status do dossiê verificável antes do envio |
| R-T6-07 | Canal tentar responder sem passar pelo LLM | B-T6-04: bloqueio permanente; inspeção de todos os artefatos T6 |
| R-T6-08 | Misturar T6 com T7 (abrir canary/shadow antes da hora) | B-T6-07/08: bloqueios ativos; T7 só abre após G6 |
| R-T6-09 | Abrir produção ampla cedo demais | B-T6-08: T6 só opera em sandbox; produção ampla = T7 |
| R-T6-10 | Resolver tudo de Supabase dentro da T6 | §3 Fora de escopo: migration profunda exige contrato próprio |

---

## §15 Sequência completa de PRs T6.0–T6.R

| PR | Título | Artefato principal | Dependência | Épico/microetapa do mestre |
|----|--------|--------------------|-------------|----------------------------|
| PR-T6.0 | Abertura formal do contrato T6 | `CONTRATO_IMPLANTACAO_MACRO_T6.md` (este) | G5 APROVADO | — (contrato) |
| PR-T6.1 | Pré-flight de riscos herdados da T5 | `T6_PREFLIGHT_RISCOS_T5.md` | PR-T6.0 | "Tratar AT-01/03/04 antes de canal real; AT-05 continua lacuna" |
| PR-T6.2 | Surface única de canal | `T6_SURFACE_CANAL.md` | PR-T6.1 | "Representação unificada para texto, transcrição, imagem, sticker e doc reconhecido" |
| PR-T6.3 | Contrato de anexos e documentos | `T6_CONTRATO_ANEXOS_DOCUMENTOS.md` | PR-T6.2 | "Separar fato extraído do cliente de fato extraído de documento" |
| PR-T6.4 | Pipeline de imagem/PDF/documento | `T6_PIPELINE_IMAGEM_PDF.md` | PR-T6.3 | "Garantir que docs não escapem da política de status, pendência e completude" |
| PR-T6.5 | Áudio no mesmo cérebro conversacional | `T6_AUDIO_CEREBRO_CONVERSACIONAL.md` | PR-T6.4 | "Confirmação humana ou recapitulação antes de persistir fato crítico; medir latência multimodal" |
| PR-T6.6 | Sticker, mídia inútil e mensagens não textuais | `T6_STICKER_MIDIA_INUTIL.md` | PR-T6.5 | "Degradação controlada: canal não quebra quando WhatsApp real traz sujeira" |
| PR-T6.7 | Adapter Meta/WhatsApp governado | `T6_ADAPTER_META_WHATSAPP.md` | PR-T6.6 | "Canal Meta/WhatsApp com operação real; loop completo inbound/outbound governado" |
| PR-T6.8 | Dossiê operacional e link do correspondente | `T6_DOSSIE_OPERACIONAL.md` | PR-T6.7 | "Dossiê com trilha; link do correspondente; envio/retorno rastreável" |
| PR-T6.9 | Suite de testes/sandbox multicanal | `T6_SUITE_TESTES_MULTICANAL.md` | PR-T6.8 | "Pacote mínimo de testes multimodal: áudio, imagem, sticker, doc, casos de borda" |
| PR-T6.R | Readiness/Closeout G6 | `READINESS_G6.md` | PR-T6.9 | — (validação e gate) |

**Regra de sequência:** cada PR só pode iniciar após a PR anterior estar merged em `main`.

**Proibido em qualquer PR T6:**
- Criar `reply_text` em qualquer output de canal, surface, adapter, pipeline de mídia ou dossiê
- Canal decidir stage ou avançar funil de forma autônoma
- Áudio/transcrição persistir fato crítico sem confirmação LLM
- Imagem/PDF/documento ser verdade absoluta sem validação
- Criar novo cérebro paralelo de qualquer espécie
- Abrir T7 antes de G6 APROVADO
- Integrar produção ampla (leads reais em volume)
- Alterar artefatos T1/T2/T3/T4/T5 (exceto PR-T6.1 com escopo cirúrgico declarado)
- Implementar OCR como pré-requisito bloqueante
- Abrir migration profunda de Supabase sem contrato próprio

---

## §16 Gate G6

| Campo | Valor |
|-------|-------|
| Código | G6 |
| Nome | Multimodal sob mesma governança |
| Condição de aprovação | S1–S9 todos com smoke PASS; CA-T6-01..CA-T6-10 todos CUMPRIDOS; canal sob governança T1–T5; multimodal sem criar cérebro paralelo; `reply_text` exclusivo do LLM; Bloco E presente em READINESS_G6.md |
| Condição de reprovação | Qualquer artefato S1–S9 ausente; qualquer CA-T6 marcado como NÃO CUMPRIDO; qualquer superfície que produza `reply_text` ou decida stage; áudio/documento como verdade absoluta; canal paralelo ao pipeline T4 |
| Consequência de aprovação | T7 autorizado — PR-T7.0 pode iniciar (shadow mode, canary, cutover) |
| Consequência de reprovação | T7 bloqueado; lista de lacunas bloqueantes em READINESS_G6.md; não-bloqueantes documentadas |
| Artefato de gate | `schema/implantation/READINESS_G6.md` criado por PR-T6.R |
| PR que executa o gate | PR-T6.R — Readiness/Closeout de G6 |

---

## §17 Adendos canônicos — conformidade explícita

| Adendo | Conformidade neste contrato |
|--------|---------------------------|
| A00-ADENDO-01 (`schema/ADENDO_CANONICO_SOBERANIA_IA.md`) | ✅ — CA-T6-02 garante que nenhum artefato T6 produz `reply_text`; canal é entrada, não surface de fala; B-T6-04 é bloqueio permanente para canal que fale por conta própria |
| A00-ADENDO-02 (`schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`) | ✅ — multimodal sob mesma governança T1–T5; canal não decide; trava explícita T6: "Multimodalidade NÃO cria outro cérebro" |
| A00-ADENDO-03 (`schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md`) | ✅ — Bloco E obrigatório em toda PR que feche sub-contrato, gate ou contrato; READINESS_G6.md requerido para G6 |

---

## Bloco E — PR-T6.0

```
--- ESTADO HERDADO ---
WORKFLOW_ACK: ok
Classificação da tarefa: contratual — abertura formal do contrato T6
Última PR relevante: PR-T5.R (#124) — merged 2026-04-28T03:07:27Z; G5 APROVADO
Contrato ativo: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md (este)
Objetivo imutável do contrato: Docs, multimodalidade e superfícies de canal sob mesma governança T1–T5
Recorte a executar nesta PR: PR-T6.0 — abertura formal do contrato T6
Item do A01: T6 — Prioridade 7 — Docs, multimodal e superfícies de canal
Estado atual da frente: T6 recém-aberta; contrato criado; PR-T6.1 desbloqueada
O que a última PR fechou: T5 encerrada; G5 APROVADO; T6 autorizada
O que a última PR NÃO fechou: Contrato T6; sequência T6.1–T6.R; gate G6
Por que esta tarefa existe: A01 e macro soberano determinam T6 como próxima fase após G5
Esta tarefa está dentro ou fora do contrato ativo: dentro
Objetivo desta tarefa: Criar CONTRATO_IMPLANTACAO_MACRO_T6.md com §1–§17 + Bloco E
Escopo: schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md + live files
Fora de escopo: src/, runtime, canal real, WhatsApp real, T1–T5, artefatos T6.1–T6.R
Houve desvio de contrato?: não
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
Fontes de verdade consultadas:
  Mestre macro consultado:     schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md (este)
  Status da frente lido:       schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md
  Handoff da frente lido:      schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md
  Plano T0-T7 lido:            schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md + schema/A00_PLANO_CANONICO_MACRO.md
  Índice legado consultado:    schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md
  Legado markdown auxiliar:    N/A — contrato de abertura; legados por PR específica
  PDF mestre consultado:       não consultado — markdown soberano suficiente
```

### Evidências de conclusão

| # | Evidência | Verificável em |
|---|---|---|
| 1 | Contrato T6 criado com §1–§17 + Bloco E | Este artefato |
| 2 | Objetivo T6 declarado: canal sob mesma governança T1–T5 | §1 |
| 3 | Escopo e fora de escopo declarados | §2 e §3 |
| 4 | Dependências de T1–T5 e atenções AT-01/03/04 declaradas | §4 |
| 5 | 10 saídas S1–S10 declaradas | §6 |
| 6 | 10 critérios de aceite CA-T6-01..CA-T6-10 declarados | §7 |
| 7 | 10 bloqueios B-T6-01..B-T6-10 declarados | §9 |
| 8 | Sequência T6.0–T6.R (11 PRs) declarada | §15 |
| 9 | Gate G6 declarado com condições de aprovação/reprovação | §16 |
| 10 | Conformidade A00-ADENDO-01/02/03 declarada | §17 |

### Provas

- **P-T6.0-01:** arquivo `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T6.md` criado; `git diff --stat` confirma novo artefato
- **P-T6.0-02:** G5 APROVADO confirmado via PR #124 merged 2026-04-28T03:07:27Z — condição de entrada B-T6-01 satisfeita
- **P-T6.0-03:** zero `reply_text`, zero canal paralelo, zero runtime declarados neste contrato; conformidade A00-ADENDO-01/02/03

```
--- ESTADO ENTREGUE ---
O que foi feito nesta PR: Criado CONTRATO_IMPLANTACAO_MACRO_T6.md — contrato formal T6 com §1–§17 + Bloco E
O que foi fechado nesta PR: Contrato T6 aberto; PR-T6.1 desbloqueada
O que continua pendente: Artefatos S1–S10 (T6.1–T6.R); gate G6; canal real governado
O que ainda não foi fechado do contrato ativo: toda a sequência T6.1–T6.R; gate G6
Recorte executado do contrato: T6 — PR-T6.0 — abertura formal
Houve desvio de contrato?: não
Contrato encerrado nesta PR?: não
O próximo passo autorizado foi alterado?: sim — PR-T6.1 agora autorizada
Esta tarefa foi fora de contrato?: não
Arquivos vivos atualizados: STATUS, LATEST, _INDEX
Mudanças em dados persistidos (Supabase): nenhuma
Permissões Cloudflare necessárias: nenhuma adicional
```
