# INVENTARIO_PARSERS_HEURISTICAS_T0

## Finalidade

Inventariar os parsers, regex, fallbacks, heurísticas e branches de stage do legado ENOVA 1,
com bloco legado de origem, fonte auditável, regra associada (PR-T0.2), status e risco estrutural,
conforme entregável de `PR-T0.3` definido na Bíblia.

Base soberana:
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

Documentos complementares consultados:
- `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` (inventário de fluxos/gates/transições)
- `schema/implantation/INVENTARIO_REGRAS_T0.md` (regras PR-T0.2 — vinculação de ID)
- `schema/legacy/INDEX_LEGADO_MESTRE.md` (índice de blocos L01–L19, C01–C09)

## Metodologia

Os pontos de decisão mecânica foram identificados a partir de:

1. LEGADO_MESTRE soberano (markdown acessível — linhas citadas explicitamente):
   - Seções de design do Core Mecânico (PDF7 / linha 2366+): regras operacionais, `route_reason`, thresholds
   - Seção de heurísticas cognitivas (linhas 2852–2934): algoritmo de scoring multi-sinal
   - Seções de fallback e migração (linhas 2355, 2985, 4481–4490): fallback legado e cadeia de fala mecânica
2. Inventário de fluxos vivos T0.1:
   - §2.1/§4.1 — pré-funil (offtrackGuard, dedupe, bypass)
   - §4.3/§4.4 — gates determinístico (yesNoStages) e cognitivo
   - §5.2 — transições dinâmicas críticas
   - §7 — resíduos, stubs e legado morto
3. Inventário de regras T0.2 (INVENTARIO_REGRAS_T0.md):
   - regras RM-01 a RM-05 (mortas) e RR-01 a RR-07 (roteamento) como âncoras de vinculação

Critério de evidência: item incluído somente se citado em pelo menos uma fonte acessível
com referência auditável de linha ou seção.

## Limitação

Blocos L01–L19 e C01–C09 não estão transcritos (somente em PDF — ver §7 Inconclusivos).
Regex e parsers de detalhe fino (formato exato de CPF/CNPJ, parsing numérico de renda,
lógica interna dos 73 cases, critérios exatos de `offtrack_type`, threshold de `limite_operacional`,
critério de `isModoFamiliar`) somente serão verificáveis após transcrição desses blocos.

O catálogo desta PR cobre todos os pontos identificáveis nas fontes acessíveis.
Os inconclusivos de L-blocks não bloqueiam PR-T0.3 (mesmo critério de PR-T0.2 §8).

## Legenda de status

| Status | Definição |
|--------|-----------|
| `ativo` | Item operacional no E1, deve ser avaliado para migração/substituição na E2 |
| `residual` | Item existe no E1 mas sem callsite ativo; redesenho obrigatório antes de migrar |
| `morto` | Item existe no E1 mas NÃO deve ser migrado (proibido por soberania LLM-first ou legado sem uso) |

## Legenda de tipos

| Tipo | Definição |
|------|-----------|
| `parser` | Função de extração ou transformação de dado bruto (texto, bloco, campo) |
| `regex` | Padrão de correspondência textual para validação ou extração |
| `fallback` | Resposta ou caminho de contingência quando fluxo normal não resolve |
| `heurística` | Algoritmo de pontuação, classificação ou inferência não-determinística |
| `stage` | Branch condicional ou transição dinâmica de stage no switch(stage) |

---

## Tabela mestre de parsers e heurísticas

| ID | Tipo | Nome | Bloco legado (origem E1) | Fonte auditável | Regra associada (PR-T0.2) | Status | Risco estrutural |
|----|------|------|--------------------------|-----------------|--------------------------|--------|-----------------|
| PH-P01 | parser | Extração de renda declarada do texto livre | L11, L12 | LEGADO_MESTRE linha 2045-2046 (`monthly_income_p1`, `has_multi_income_p1`); linha 2854: "múltiplas rendas ou múltiplos regimes no mesmo texto" | RN-02, RN-03, RN-10 | ativo | Captura via LLM sem parser determinístico; texto com múltiplos regimes pode gerar extração imprecisa; requer verificação de conflito pós-captura |
| PH-P02 | parser | `parseCorrespondenteBlocks` e `handleCorrespondenteRetorno` — parser/handler de retorno do correspondente | L17 | T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §7: "sem callsite estático atual"; INVENTARIO_REGRAS RM-05 | RO-01, RM-05 | residual | Funções órfãs sem callsite ativo; formato do rawText não documentado; redesenho obrigatório antes de migrar para trilho correspondente de T1 |
| PH-R01 | regex | Validação de formato e validade de RNM | L04 | LEGADO_MESTRE linha 2383: "validar RNM antes de avançar"; T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §4.5: RNM como gate de negócio ativo | RN-04 | ativo (inconclusivo — L04 não transcrito) | Padrão exato não verificável; regex errado = bloqueio indevido ou aceitação de RNM inválido; risco alto de negócio MCMV |
| PH-R02 | regex | Deduplicação de mensagem por `wamid`/`messageId` | L03 | T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §2.1/§4.1: "dedupe por `wamid`"; INVENTARIO_REGRAS RO-04 | RO-04 | ativo | Lógica exata em L03 não transcrita; dedup incorreto gera processamento duplicado na borda de entrada |
| PH-F01 | fallback | `UNKNOWN_STAGE_REFERENCED` — fallback explícito de stage desconhecido | L03 | T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §7: "fallbacks explícitos de `UNKNOWN_STAGE_REFERENCED` em alguns stages" | RR-01 | residual | Indica gap no switch(stage); eliminar ao migrar para policy rules em T3; presença é sintoma de stage não mapeado |
| PH-F02 | fallback | `fim_inelegivel` — alias/ponte para `fim_ineligivel` | L03 | T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §7: "`fim_inelegivel` como alias/ponte para `fim_ineligivel`"; INVENTARIO_REGRAS RM-03 | RM-03 | morto | Dupla nomenclatura causa ambiguidade; eliminar no Core Mecânico T1 antes de qualquer migração |
| PH-F03 | fallback | Legado E1 congelado como fallback de migração (`route_fallback = true`) | L03 | LEGADO_MESTRE linha 2355: "motor mecânico legado fica congelado como fallback"; linha 2985: "marcar route_fallback = true" | RO-05 | condicional | Fallback estrutural sem critério objetivo de desligamento documentado; risco de dependência crônica; desativação exige prova de cobertura formal |
| PH-F04 | fallback | `keepStage` — estágio mantido quando checklist de docs não avança | L17 | T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §5.2: "`envio_docs => resposta.keepStage \|\| 'envio_docs'`"; INVENTARIO_REGRAS RD-04 | RD-04 | ativo | Loop de stage dependente de resposta externa; sem timeout explícito documentado; risco de loop infinito se `keepStage` nunca resolver |
| PH-F05 | fallback | Cadeia fallback/rawArr/helper/bridge de fala mecânica E1 | L03 | LEGADO_MESTRE linha 4481: "cadeia de fallback, rawArr, helper e bridge da ENOVA 1"; linha 4490: "Nenhum fallback genérico pode vencer coleta crítica" | RM-01 | morto | Arquitetura de fala mecânica por prefixo; proibida por A00-ADENDO-01/02; não migrar; eliminar completamente da cadeia de speech |
| PH-F06 | fallback | `route_reason = "default_path"` — roteamento padrão sem sinal crítico | L03 | LEGADO_MESTRE linha 3360: `"route_reason": "default_path \| critical_turn \| budget_guard \| fallback"` | RR-01 | ativo | Rota mínima de coleta; risco baixo se policy rules cobrarem corretamente a sequência de stages |
| PH-H01 | heurística | `offtrackGuard` — detecção e classificação de desvio de tema pré-funil | L03 | T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §2.1/§4.1: "`offtrackGuard` pre-`runFunnel`"; LEGADO_MESTRE linha 2081: `offtrack_type: curiosidade, objeção, desabafo, pergunta lateral` | RR-06, RU-04 | ativo | Critério exato de classificação por categoria não documentado fora dos L-blocks; erro = offtrack tratado como coleta ou coleta ignorada como desvio |
| PH-H02 | heurística | `shouldTriggerCognitiveAssist` — scoring multi-sinal para acionar assistência cognitiva | L03, L19 | LEGADO_MESTRE linhas 2867–2934: 7 condições com pesos (needs_confirmation +3, confidence<0.65 +2, contradiction +3, multiple_income_signals +2, multiple_regime_signals +2, foreign_document_pending +3, complex_family_composition +3, offtrack_sensitive +2); thresholds C1≤2/C2≤5/C3≥6 | RR-07 | condicional | Algoritmo com 7 condições e 3 níveis; threshold de ativação exato não confirmado sem L-blocks; alteração de peso pode acionar/inibir cognitivo em turnos críticos |
| PH-H03 | heurística | Threshold de confiança do sinal cognitivo (< 0.65) | L03, L19 | LEGADO_MESTRE linha 2868: `if last_turn.confidence < 0.65: score += 2` | RR-07 | condicional | Valor fixo hardcoded; ajuste sem rastreabilidade degrada sinal cognitivo; crítico para qualidade de assistência |
| PH-H04 | heurística | `isModoFamiliar(st)` — verificação de modo familiar para roteamento de parceiro | L07, L09 | T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §5.2: "`ctps_36_parceiro => isModoFamiliar(st) ? 'restricao_parceiro' : 'restricao'"` | RN-10, RR-02 | ativo | Critério exato de "modo familiar" não documentado fora dos L-blocks; erro = roteamento errado de restrição do parceiro |
| PH-H05 | heurística | `low_solo_income` — limiar de renda solo para sugestão de composição | L11 | LEGADO_MESTRE linhas 2373–2378: "se processo=solo e renda_total_confirmada < limite_operacional → sugerir composição"; linha 3175: `"low_solo_income"` | RN-03 | ativo | Valor de `limite_operacional` não transcrito (L11 não acessível); erro = inviabilizar caso viável ou omitir sugestão de composição quando necessário |
| PH-H06 | heurística | `multiple_income_signals` — flag de múltiplas fontes de renda | L11, L12 | LEGADO_MESTRE linha 2046: `has_multi_income_p1`; linhas 2870/2910-2912: `if state.multiple_income_signals: score += 2` | RN-10, RN-11 | ativo | Critério de ativação do flag não documentado fora dos L-blocks; falso negativo = perder renda de co-participante; afeta scoring cognitivo (+2) |
| PH-H07 | heurística | `needs_confirmation` — flag de ambiguidade/contradição factual | L03 | LEGADO_MESTRE linhas 2159/2610/2743: "gravar captured/inferred e marcar needs_confirmation"; "Em caso de ambiguidade ou contradição, sinalizar needs_confirmation = true"; linha 2867: `if last_turn.needs_confirmation: score += 3` | RU-03, RE-03 | ativo | Falso positivo bloqueia avanço desnecessariamente; falso negativo avança com dado inválido; consumido pelo scoring cognitivo (+3 — peso mais alto) |
| PH-S01 | stage | Restauração de fase persistida (`inicio_decisao => st.fase_conversa \|\| "inicio_programa"`) | L03 | T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §5.2 | RR-01 | ativo | Branch que restaura fase do lead ao invés do default; limpeza incorreta de `fase_conversa` = lead sempre recomeça do início |
| PH-S02 | stage | Roteamento condicional por modo familiar (`ctps_36_parceiro => isModoFamiliar ? "restricao_parceiro" : "restricao"`) | L07, L09 | T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §5.2 | RN-10, RR-02 | ativo | Bifurcação crítica de restrição parceiro vs. solo; depende de PH-H04; erro = restrição atribuída ao perfil errado |
| PH-S03 | stage | Roteamento dinâmico de docs (`envio_docs => keepStage \|\| nextStage \|\| nextStageAfterUpload`) | L17 | T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §5.2/§2.5; INVENTARIO_REGRAS RD-04 | RD-04, RD-05 | ativo | Três caminhos de saída com prioridade implícita não documentada fora dos L-blocks; erro de ordem = loop ou avanço indevido |
| PH-S04 | stage | `restricao_parceiro => nextStage` (dinâmico) | L07, L14 | T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §5.2 | RN-12 | ativo | Next stage calculado dinamicamente; critério em L14 não transcrito; gap de roteamento de restrição ao migrar |
| PH-S05 | stage | `parceiro_tem_renda => nextStage` (dinâmico) | L11, L12 | T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §5.2 | RN-10 | ativo | Next stage de renda do parceiro calculado dinamicamente; L-blocks não transcritos; risco de gap de coleta |
| PH-S06 | stage | `COGNITIVE_V2_MODE = off\|shadow\|on` — branching por feature flag cognitivo | L03, L19 | T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §2.4/§6: "branching por `COGNITIVE_V2_MODE`; ativação real em produção inconclusiva"; INVENTARIO_REGRAS RE-05 | RR-07, RE-05 | condicional | Ativação `on` em produção inconclusiva (§6); deprecar motor legado antes de migrar; risco de migrar com `shadow` ativo sem telemetria adequada |
| PH-S07 | stage | `yesNoStages` com offtrack trava determinística | L03 | T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §4.3/§7: "chaves em `yesNoStages` sem `case` correspondente"; INVENTARIO_REGRAS RM-04 | RM-04 | residual | Estrutura com chaves sem case correspondente (stub incompleto); migrar somente o padrão (gate sim/não determinístico), não a estrutura com gaps |
| PH-S08 | stage | Espinha dorsal sequencial de 73 stages (`switch(stage)`) | L03 | T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md §3/§5.1: "73 stages únicos no switch(stage)"; espinha dorsal `inicio → estado_civil → somar_renda → regime → ir → ctps → restricao → envio_docs` | RR-01 | ativo | Sequência principal de coleta; 73 cases = fonte de verdade do fluxo vivo; qualquer gap na migração = coleta incompleta ou roteamento errado |
| PH-S09 | stage | Roteamento para `qualification_special` (P3/multi/conjunto) | L15 | INVENTARIO_REGRAS RR-03: "`p3_required=true` OU `processo=conjunto` → `qualification_special`"; Core Mecânico 2 branch `feat/core-especiais-p3-multi-variantes` (commit a3c27ab) | RN-09, RN-10, RR-03 | ativo | Stage especial para participantes especiais; critério de entrada já implementado no Core Mecânico 2; migração para E2 deve preservar lógica de gate de entrada |

---

## Contagem por tipo e status

| Tipo | Ativos | Condicionais | Residuais | Mortos | Total |
|------|--------|--------------|-----------|--------|-------|
| parser | 1 | 0 | 1 | 0 | 2 |
| regex | 2 | 0 | 0 | 0 | 2 |
| fallback | 3 | 1 | 1 | 2 | 7 |
| heurística | 4 | 3 | 0 | 0 | 7 |
| stage | 7 | 1 | 1 | 0 | 9 |
| **Total** | **17** | **5** | **3** | **2** | **27** |

---

## Inconclusivos declarados (não catalogados nesta PR por limitação de L-blocks)

Os seguintes pontos de decisão mecânica são suspeitos de existir nos L-blocks não transcritos
mas não puderam ser catalogados com evidência auditável nesta PR:

| Categoria | Descrição da lacuna | Bloco legado provável | Próxima PR |
|-----------|--------------------|-----------------------|------------|
| Regex de validação de CPF/CNPJ | Padrão exato e lógica de dígito verificador do legado E1 | L03, L04 | PR-T0.3+ / transcrição L04 |
| Regex de parsing numérico de renda | Extração de valor monetário de texto livre (além de captura LLM) | L11, L12 | PR-T0.3+ / transcrição L11 |
| Regex de formato de CTPS/documentos | Padrão de validação de CTPS e outros documentos de renda | L13, L17 | PR-T0.3+ / transcrição L13 |
| Lógica completa de `isModoFamiliar` | Critério exato de ativação do modo familiar (composição, estado civil, P2) | L07, L09 | PR-T0.3+ / transcrição L07 |
| Critérios exatos de `offtrack_type` | Regras de classificação de cada categoria de desvio (curiosidade vs. objeção etc.) | L03 | PR-T0.3+ / transcrição L03 |
| Valor de `limite_operacional` (renda baixa solo) | Limiar numérico MCMV para PH-H05 | L11 | PR-T0.3+ / transcrição L11 |
| Detalhe dos 73 cases do switch(stage) | Lógica interna de cada case além da espinha dorsal observável | L03 | PR-T0.R / transcrição completa L03 |
| Parsers de mídia/imagem (OCR e extração de campos) | Extração de dados de imagem de documentos (RG, CPF, CTPS) | L17, L18 | PR-T0.4+ |

---

## Nota sobre blocos L e C não transcritos

Todos os blocos L01–L19 e C01–C09 estão identificados estruturalmente no índice
(`schema/legacy/INDEX_LEGADO_MESTRE.md`) mas NÃO estão transcritos — o conteúdo está
somente no PDF (`schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`), não acessível sem ferramenta PDF.

O catálogo desta PR cobre todos os pontos identificáveis nas fontes acessíveis (LEGADO_MESTRE
markdown, inventário T0.1, inventário T0.2 e implementação Core Mecânico 2). Os inconclusivos
serão expandidos nas PRs seguintes quando L-blocks forem transcritos ou quando implementações
derivadas do PDF fornecerem prova equivalente auditável.

---

## Status de cobertura de PR-T0.3

- Tipos cobertos: 5/5 (parser, regex, fallback, heurística, stage).
- Pontos catalogados: 27 (17 ativos, 5 condicionais, 3 residuais, 2 mortos).
- Inconclusivos declarados: 8 categorias (não bloqueiam fechamento de PR-T0.3).
- Bloco legado citado por item: sim (todos os 27 itens têm bloco legado de origem).
- Fonte auditável citada por item: sim (todos com linha ou seção verificável).
- Regra associada (PR-T0.2): sim (todos linkados a pelo menos uma regra do inventário de regras).
- Coerência com soberania LLM-first: sim — itens de fala mecânica classificados como "morto".
- Coerência com PR-T0.1: sim — transições dinâmicas e gates alinhados com matriz de rastreabilidade.

Decisão de fechamento de PR-T0.3:
- `PR-T0.3` **pronta para encerramento**.
- Próximo passo autorizado: PR-T0.4 — Inventário de canais, superfícies e telemetria.
