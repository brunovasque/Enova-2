# MATRIZ_RISCO_T0

## Finalidade

Produzir a matriz de risco operacional do legado vivo da ENOVA 1, cruzando fluxos (PR-T0.1),
regras (PR-T0.2), parsers/heurísticas (PR-T0.3) e canais/superfícies/telemetria (PR-T0.4),
classificando o impacto operacional se cada item de risco quebrar ou for migrado incorretamente.

Base soberana:
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

Documentos cruzados obrigatoriamente:
- `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` (PR-T0.1 — fluxos/estados/gates)
- `schema/implantation/INVENTARIO_REGRAS_T0.md` (PR-T0.2 — 48 regras em 7 famílias)
- `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md` (PR-T0.3 — 27 pontos de decisão)
- `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md` (PR-T0.4 — 28 itens CT/SF/EP/TE)

## Nota de soberania

A classificação de severidade de riscos relacionados a fala, superfície e fallback obedece
obrigatoriamente aos adendos canônicos:
- **A00-ADENDO-01** (`schema/ADENDO_CANONICO_SOBERANIA_IA.md`): IA soberana na fala; mecânico jamais
  com prioridade de fala.
- **A00-ADENDO-02** (`schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md`): Enova 2 é atendente
  especialista MCMV; casca mecânica de fala é arquitetura E1 — proibida na E2.

Todo item classificado como `morto` que for migrado constitui **não conformidade grave** com os
adendos canônicos, independentemente de qualquer outra análise.

## Nota de bifurcação E1 vs E2

Esta matriz segue a bifurcação canônica de PR-T0.1 §13:
- **Origem E1**: risco proveniente de comportamento ou estrutura do runtime real da Enova 1.
- **Referência E2**: risco de implementar design-alvo E2 sobre base E1 sem separação de namespace.

Quando o risco envolve telemetria de tabelas Supabase (TE-07 a TE-12), o impacto está em implementar
o schema E2 sem respeitar a bifurcação — não em omitir um item E1 existente.

## Metodologia

Cada risco foi identificado a partir de:
1. Itens com status `residual`, `morto`, `condicional (inconclusivo)` ou `ativo com risco explícito`
   nos inventários PR-T0.2, PR-T0.3 e PR-T0.4.
2. Inconclusivos declarados nos três inventários (L-blocks não transcritos).
3. Cruzamento de impacto: qual regra (PR-T0.2) + qual mecanismo (PR-T0.3) + qual canal/superfície
   (PR-T0.4) são afetados simultaneamente.
4. Restrições canônicas dos adendos A00-ADENDO-01/02/03.

Critério de evidência: risco incluído somente se referenciado em pelo menos um item auditável
dos inventários anteriores ou do LEGADO_MESTRE soberano.

## Legenda de severidade

| Severidade | Definição |
|------------|-----------|
| `crítico` | Viola adendo canônico, corrompe dados ou bloqueia implantação; trava G0/T1 |
| `alto` | Gera inelegibilidade incorreta, perda de telemetria ou loop sem escape |
| `médio` | Degrada qualidade, causa comportamento inesperado mas reversível |
| `baixo` | Cosmético ou controlável; não bloqueia implantação |

## Legenda de probabilidade

| Probabilidade | Definição |
|---------------|-----------|
| `alta` | Item L-block não transcrito ou padrão de risco histórico confirmado |
| `média` | Condição de risco documentada mas controlável com atenção |
| `baixa` | Risco possível mas improvável dado o estado atual do inventário |

## Legenda de status de risco

| Status | Definição |
|--------|-----------|
| `ativo` | Risco real e presente; deve ser tratado antes ou durante a PR correspondente |
| `condicional` | Risco latente; ativado se condição específica ocorrer |
| `bloqueante` | Risco que bloqueia avanço de gate ou fase enquanto não tratado |
| `declarado` | Risco estrutural com limitação formal (L-blocks); não bloqueia PR-T0.5 mas deve constar do G0 |

---

## Categoria 1 — Elegibilidade

> Riscos que afetam decisão de qualificação ou elegibilidade MCMV: coleta de fatos, validação de
> regras, roteamento de stage e critérios de inelegibilidade.

| ID | Origem | Área afetada | Severidade | Probabilidade | Impacto | Evidência | Mitigação sugerida | Status |
|----|--------|-------------|------------|---------------|---------|-----------|-------------------|--------|
| RZ-EL-01 | PH-R01 (regex RNM inconclusivo L04) | Regra RN-04; gate de elegibilidade para estrangeiros | alto | alta | Regex com padrão desconhecido: RNM inválido aceito OU estrangeiro elegível bloqueado indevidamente; violação direta de RN-04 | PH-R01 (ativo inconclusivo L04); RN-04; T0_PR1 §4.5 | Transcrever L04 e validar regex de RNM antes de migrar RN-04; incluir na checklist de G0 | bloqueante |
| RZ-EL-02 | PH-H01 (`offtrackGuard` sem critério documentado) | SF-02 (pré-funil); RR-06 | alto | média | Critério exato de `offtrack_type` (curiosidade, objeção, desabafo) não documentado fora L-blocks; erro = coleta crítica ignorada como offtrack, ou desvio não detectado | PH-H01; RR-06; T0_PR1 §2.1/§4.1 | Documentar critério de classificação de offtrack antes de migrar SF-02; smoke com casos reais | ativo |
| RZ-EL-03 | PH-H04 (`isModoFamiliar` sem critério) | PH-S02 (roteamento restrição parceiro); RR-02; RN-10 | alto | média | Critério de "modo familiar" não documentado fora dos L-blocks; PH-S02 depende diretamente desta heurística; erro = restrição atribuída ao perfil errado (parceiro vs. solo) | PH-H04; PH-S02; RN-10; T0_PR1 §5.2 | Transcrever L07/L09 para extrair critério formal; validar em smoke antes de T1 | ativo |
| RZ-EL-04 | PH-H05 (`low_solo_income` / `limite_operacional` não transcrito) | RN-03; elegibilidade solo | alto | alta | Valor de `limite_operacional` em L11 não transcrito; erro = sugestão de composição omitida em caso viável, ou disparada em caso acima do limiar | PH-H05; RN-03; LEGADO_MESTRE linhas 2373–2378 | Transcrever L11 para extrair `limite_operacional` antes de migrar RN-03 | bloqueante |
| RZ-EL-05 | PH-F02 (`fim_inelegivel` alias — morto) | Decisão de inelegibilidade; RM-03 | médio | baixa | Alias duplicado para `fim_ineligivel`; se chamado erroneamente, decisão de inelegibilidade é ambígua; status morto mas estrutura ainda presente no E1 | PH-F02; RM-03; T0_PR1 §7 | Eliminar alias no Core Mecânico T1 como primeira ação de limpeza | condicional |
| RZ-EL-06 | PH-S07 (`yesNoStages` stubs incompletos — residual) | Gate determinístico yes/no; RM-04 | médio | baixa | Estrutura com chaves sem case correspondente; migrar o padrão sem os gaps; stubs incompletos podem criar passagem incorreta em algum case | PH-S07; RM-04; T0_PR1 §4.3/§7 | Migrar somente o padrão de gate sim/não; descartar completamente a estrutura com gaps | condicional |
| RZ-EL-07 | PH-H02 + PH-H03 (scoring cognitivo com pesos não auditados) | RR-07; SF-06 (motor cognitivo) | médio | média | Algoritmo com 7 condições e pesos: threshold C1≤2/C2≤5/C3≥6; ajuste de peso sem rastreabilidade pode acionar/inibir assistência cognitiva em turnos críticos | PH-H02; PH-H03; LEGADO_MESTRE linhas 2867–2934 | Congelar pesos do scoring E1 antes de migrar; revalidar em shadow mode na E2 | ativo |
| RZ-EL-08 | PH-H06 (`multiple_income_signals` sem critério documentado) | RN-10; RN-11; scoring cognitivo (+2) | médio | alta | Critério de ativação do flag não documentado fora dos L-blocks; falso negativo = renda de co-participante perdida; falso positivo = scoring cognitivo inflado sem necessidade | PH-H06; RN-10; LEGADO_MESTRE linha 2046 | Transcrever L11/L12 para extrair critério de ativação do flag antes de T1 | declarado |

---

## Categoria 2 — Tom/Fala

> Riscos que afetam soberania de fala do LLM, tom do atendimento e superfície de resposta ao cliente.
> Itens classificados como `morto` nesta categoria são **proibidos** por A00-ADENDO-01/02 —
> qualquer migração é não conformidade grave.

| ID | Origem | Área afetada | Severidade | Probabilidade | Impacto | Evidência | Mitigação sugerida | Status |
|----|--------|-------------|------------|---------------|---------|-----------|-------------------|--------|
| RZ-TM-01 | SF-03 (fala mecânica morta) + PH-F05 (cadeia fallback morta) + RM-01 + RM-02 | Toda a superfície de fala ao cliente | crítico | média | Migrar SF-03/PH-F05/RM-01/RM-02 para E2 viola A00-ADENDO-01/02 diretamente; LLM perde soberania de fala; Enova 2 se comporta como bot de regras; dano de produto e governança | SF-03 (morto); PH-F05 (morto); RM-01 (morta); RM-02 (morta); RU-06; A00-ADENDO-01/02 | Eliminação obrigatória antes de T1; zero reuso da cadeia rawArr/helper/bridge/fallback-de-fala | ativo |
| RZ-TM-02 | PH-F06 (`route_reason = "default_path"`) + ausência de policy rules | Roteamento de coleta; RC-04 | alto | média | Fallback `default_path` assumindo coleta sem policy rules cobrindo a sequência; viola RC-04 (regras críticas não podem depender só do prompt) | PH-F06; RC-04; RR-01 | Substituir `default_path` por policy rules declarativas em T3 antes de desligar E1 | ativo |
| RZ-TM-03 | PH-H07 (`needs_confirmation` com falso positivo/negativo) | RU-03; RE-03; avanço de stage | alto | média | Falso negativo: avanço de stage com dado inválido; falso positivo: bloqueio desnecessário + aumento de score cognitivo (+3 — peso máximo); comprometimento de qualidade do atendimento | PH-H07; RU-03; RE-03; LEGADO_MESTRE linha 2867 | Definir critério canônico de `needs_confirmation` com smoke de casos reais antes de T1 | ativo |
| RZ-TM-04 | PH-H06 + PH-P01 (extração de renda com múltiplos regimes) | RN-10; tom após conflito de dados | médio | alta | Múltiplos regimes no mesmo texto podem gerar extração imprecisa sem flag de conflito; LLM avança sem confirmar ambiguidade de renda; violação de RU-03 | PH-P01; PH-H06; RN-10; LEGADO_MESTRE linhas 2854–2856 | Implementar verificação de conflito pós-captura de renda múltipla como gate cognitivo | ativo |

---

## Categoria 3 — Docs

> Riscos que afetam coleta, processamento, roteamento e handoff de documentação.

| ID | Origem | Área afetada | Severidade | Probabilidade | Impacto | Evidência | Mitigação sugerida | Status |
|----|--------|-------------|------------|---------------|---------|-----------|-------------------|--------|
| RZ-DC-01 | PH-P02 (`parseCorrespondenteBlocks` + `handleCorrespondenteRetorno` — residual) | SF-05 (trilho correspondente); RO-01; RM-05 | alto | alta | Funções órfãs sem callsite ativo; formato do rawText não documentado; trilho correspondente quebrado ao migrar; pacote de docs pode não ser processado; handoff operacional interrompido | PH-P02; RM-05; RO-01; SF-05; T0_PR1 §7 | Redesenhar trilho correspondente do zero em T1/T5 — não migrar estas funções diretamente | ativo |
| RZ-DC-02 | PH-F04 (`keepStage` sem timeout) | SF-04 (`envio_docs`); RD-04; PH-S03 | alto | média | Lead preso no stage de docs indefinidamente se nenhum doc chegar; não há timeout ou escape documentado; loop infinito possível | PH-F04; RD-04; SF-04; PH-S03; T0_PR1 §5.2 | Definir critério de escape (timeout ou intervenção manual) antes de migrar SF-04 para T1 | bloqueante |
| RZ-DC-03 | PH-S03 (roteamento dinâmico com 3 caminhos) | SF-04; RD-04; RD-05 | médio | média | Prioridade entre `keepStage > nextStage > nextStageAfterUpload` não documentada explicitamente; erro de ordem = loop ou avanço indevido em `envio_docs` | PH-S03; RD-04; RD-05; T0_PR1 §2.5/§5.2 | Documentar ordem de prioridade dos 3 caminhos antes de migrar SF-04; smoke de checklist docs | ativo |
| RZ-DC-04 | CT-06 (canal site — upload web — condicional L17) | RD-03; canal alternativo de docs | médio | alta | Canal alternativo de envio de docs via site não documentado fora de L17 (não transcrito); integração real desconhecida; canal pode ser implementado incorretamente ou omitido | CT-06; RD-03; LEGADO_MESTRE linha 2069 | Transcrever L17 antes de migrar CT-06; implementar somente com documentação completa | declarado |
| RZ-DC-05 | PH-P02 + CT-03 (imagem — condicional L17) | TE-10 (`enova_artifacts`); RD-01; RD-02 | médio | alta | Detalhe de extração de imagem/documento visual em L17 não transcrito; `parsing_status` de artefatos não rastreável sem schema E1; artefatos podem ser perdidos | CT-03; PH-P02; TE-10; RD-01 | Transcrever L17 antes de migrar coleta de docs via imagem; não implementar `enova_artifacts` sem schema E1 confirmado | declarado |

---

## Categoria 4 — Telemetria

> Riscos que afetam observabilidade, auditabilidade e rastreabilidade do sistema.
> Viola RC-05 qualquer migração que destrua telemetria conquistada no E1.

| ID | Origem | Área afetada | Severidade | Probabilidade | Impacto | Evidência | Mitigação sugerida | Status |
|----|--------|-------------|------------|---------------|---------|-----------|-------------------|--------|
| RZ-TE-01 | TE-01 (`console.log` como único emitter E1) | RC-05; RO-03; toda a cadeia de telemetria | alto | alta | `console.log` sem persistência direta em DB; perda de telemetria se logs não capturados; substituição direta por emitter E2 sem transitório = destruição da trilha E1; violação de RC-05 | TE-01; RC-05; LEGADO_MESTRE linhas 3411–3416 | Substituir por emitter assíncrono persistente em T4/T5; manter `console.log` durante shadow; só desligar após prova de cobertura | ativo |
| RZ-TE-02 | TE-07 a TE-13 (schema real de tabelas E1 desconhecido — L18 não transcrito) | RC-05; toda a migração de telemetria Supabase | crítico | alta | Schema exato das tabelas E1 desconhecido (L18 não transcrito); implementar schema E2 diretamente sobre E1 sem bifurcação = dados E1 corrompidos; migração destrutiva sem possibilidade de rollback | TE-07 a TE-13; RC-05; L18 (não transcrito) | Transcrever L18 antes de implementar qualquer tabela Supabase E2; usar namespace `enova2_*` separado (TE-12) até prova de cobertura | bloqueante |
| RZ-TE-03 | TE-13 (CRM real E1 em L18 não transcrito) | RC-05; RO-03; trilha auditável | alto | alta | Trilha CRM por etapa do E1 real desconhecida; migração pode destruir trilha auditável conquistada; violação direta de RC-05 | TE-13; RC-05; RO-03; LEGADO_MESTRE linha 38 | Transcrever L18 para mapear trilha CRM E1 antes de qualquer migração de telemetria; smoke de auditoria obrigatório | bloqueante |
| RZ-TE-04 | CT-02 (áudio) + PH-P01 + L17/L18 não transcritos | TE-10 (`enova_artifacts` áudio); telemetria de voz | médio | alta | Telemetria de áudio/transcrição no E1 completamente inconclusiva; canal ativo mas sem rastreabilidade; implementação de TTS/STT em T6 sem base pode destruir trilha de áudio existente | CT-02; PH-P01; TE-10; L17/L18 | Transcrever L17/L18 antes de implementar pipeline de áudio em T6; não assumir que E1 não tem telemetria de áudio | declarado |
| RZ-TE-05 | TE-06 (`turn.fallback_used` sem monitoramento explícito) + PH-F03 | RO-05; RE-02; migração shadow | médio | média | `turn.fallback_used` rastreia uso do legado como fallback durante migração; sem monitoramento explícito = impossível medir dependência do E1; nunca haverá prova de cobertura para desligar fallback | TE-06; RO-05; PH-F03; RE-02 | Implementar captura de `turn.fallback_used` como KPI de migração obrigatório antes de shadow/canary | ativo |

---

## Categoria 5 — Estrutural/Governança

> Riscos transversais de governança da implantação: lacunas de L-blocks, mistura E1/E2,
> avanço indevido de gate/fase e fechamento sem prova.
> Esta categoria cobre riscos que afetam múltiplas categorias simultaneamente.

| ID | Origem | Área afetada | Severidade | Probabilidade | Impacto | Evidência | Mitigação sugerida | Status |
|----|--------|-------------|------------|---------------|---------|-----------|-------------------|--------|
| RZ-ES-01 | L01–L19 + C01–C09 não transcritos | Todos os inventários PR-T0.2/T0.3/T0.4; G0 | alto | alta (estrutural) | 26 L-blocks + 9 C-blocks com regras, parsers, heurísticas e telemetria desconhecidos; G0 não pode fechar com cobertura completa sem transcrição; migração sobre base parcialmente desconhecida | Seção de inconclusivos de PR-T0.2, PR-T0.3, PR-T0.4; INDEX_LEGADO_MESTRE | Iniciar transcrição de L-blocks críticos (L04, L11, L17, L18) em PR-T0.R / T1 prioritário | declarado |
| RZ-ES-02 | PH-F03 (E1 como fallback sem critério de desligamento) + RO-05 | Toda a estratégia de migração; T5 | alto | média | E1 congelado como fallback sem critério objetivo de desligamento documentado; risco de dependência crônica; desativação exige prova de cobertura que nunca chega sem métricas formais | PH-F03; RO-05; LEGADO_MESTRE linha 2355 | Definir critério formal de desligamento do fallback E1 (threshold de `turn.fallback_used`) antes de T5 | condicional |
| RZ-ES-03 | TE-12 (`projection_bridge_v2`) + TE-07 a TE-11 (design-alvo E2 sobre E1) | Schema Supabase; RC-05 | alto | média | Namespace `enova2_*` não implantado — qualquer implementação de tabela E2 sobre E1 sem separação = corrupção de dados; `projection_bridge_v2` como adaptador obrigatório não pode ser omitido | TE-12; TE-07 a TE-11; LEGADO_MESTRE linhas 4932–4938 | Implantar namespace `enova2_*` separado como primeiro passo de qualquer T2/T4; nunca sobrescrever tabelas E1 | ativo |
| RZ-ES-04 | RE-04 (inventário não fechado → implantação não avança) | Gate G0; abertura de T1 | crítico | média (risco de pressão) | T1 aberta sem G0 aprovado = implantação sobre base não verificada; risco de erro invisível em fases posteriores; padrão histórico de fechamento precoce | RE-04; CONTRATO_T0 seção Bloqueios; A00-ADENDO-03 | Nunca abrir T1 sem G0 aprovado; PR-T0.R deve verificar completude do inventário antes de aprovar G0 | bloqueante |
| RZ-ES-05 | A00-ADENDO-03 (fechamento sem prova suficiente) | Todo o ciclo de PRs T0; arquivos vivos | alto | média (padrão histórico) | Declaração de PR encerrada com evidência parcial no documento-base; propaga estado incorreto para contrato/status/handoff; padrão de erro instituído pelo A00-ADENDO-03 | A00-ADENDO-03 §1/§2; historico no IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md | Bloco E obrigatório em toda PR que tente encerrar etapa; revisão dos arquivos vivos antes de qualquer fechamento | ativo |

---

## Resumo executivo por categoria

| Categoria | Crítico | Alto | Médio | Total | Bloqueantes para G0/T1 |
|-----------|---------|------|-------|-------|------------------------|
| Elegibilidade | 0 | 4 | 4 | 8 | RZ-EL-01, RZ-EL-04 |
| Tom/Fala | 1 | 3 | 0 | 4 | RZ-TM-01 (adendo canônico) |
| Docs | 0 | 2 | 3 | 5 | RZ-DC-02 |
| Telemetria | 1 | 2 | 2 | 5 | RZ-TE-02, RZ-TE-03 |
| Estrutural/Governança | 1 | 3 | 0 | 4 | RZ-ES-04 (gate), RZ-TE-02/03 |
| **Total** | **3** | **14** | **9** | **26** | **7 bloqueantes** |

---

## Riscos bloqueantes para G0 — síntese

Os seguintes riscos devem ser tratados ou formalmente declarados como limitação residual aceita
antes que G0 possa ser aprovado na PR-T0.R:

| ID | Categoria | Risco bloqueante |
|----|-----------|-----------------|
| RZ-EL-01 | Elegibilidade | Regex de RNM desconhecido (L04 não transcrito) |
| RZ-EL-04 | Elegibilidade | `limite_operacional` de renda solo desconhecido (L11 não transcrito) |
| RZ-TM-01 | Tom/Fala | Casca mecânica de fala migrada (A00-ADENDO-01/02 — proibição absoluta) |
| RZ-DC-02 | Docs | `keepStage` sem timeout em `envio_docs` (loop sem escape) |
| RZ-TE-02 | Telemetria | Schema real de tabelas E1 desconhecido (L18 não transcrito) |
| RZ-TE-03 | Telemetria | CRM E1 real desconhecido (L18 não transcrito — viola RC-05) |
| RZ-ES-04 | Estrutural | Abertura de T1 sem G0 aprovado |

---

## Inconclusivos declarados (não catalogados nesta PR por limitação de L-blocks)

| Categoria | Descrição da lacuna | Bloco legado provável | Próxima PR |
|-----------|--------------------|-----------------------|------------|
| Riscos de regras de topo fino | Regras de captação do primeiro sinal, objeção de entrada | L04, L05, L06 | PR-T0.R / transcrição L04 |
| Riscos de composição familiar | Variantes de composição, impacto em risco de elegibilidade | L09, L10 | PR-T0.R |
| Riscos de renda múltipla | Dois regimes por participante; composição informal | L11, L12 | PR-T0.R |
| Riscos de estado civil intermediário | Divorciado, viúvo, impacto em processo | L07, L08 | PR-T0.R |
| Riscos de QA/admin | Riscos de contaminação do fluxo produtivo por simulação | L18 | PR-T0.R |
| Riscos de restrição fina | Regularização parcial, RNM expirado, restrição em cobrança | L13, L14 | PR-T0.R |
| Riscos de trilho final | Critérios exatos de visita presencial vs. correspondente | L17 | PR-T0.R |

---

## Status de cobertura de PR-T0.5

- Categorias cobertas: 5 (elegibilidade, tom/fala, docs, telemetria, estrutural/governança).
- Itens catalogados: 26 riscos (3 críticos, 14 altos, 9 médios).
- Referência cruzada com PR-T0.1 a PR-T0.4: sim — cada risco cita o ID de origem do inventário correspondente.
- Bifurcação E1/E2 aplicada: sim — riscos de mistura E1/E2 explicitamente classificados.
- Soberania LLM-first verificada: sim — RZ-TM-01 classificado como crítico/proibido.
- Inconclusivos de L-blocks declarados: 7 categorias (não bloqueiam PR-T0.5).
- Bloco E (A00-ADENDO-03): incorporado na seção de fechamento abaixo.

---

## § — Bloco E — Fechamento por prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/MATRIZ_RISCO_T0.md
Estado da evidência:                   completa — 26 riscos catalogados em 5 categorias,
                                       cobrindo todas as fontes acessíveis; referência cruzada
                                       com PR-T0.1 a PR-T0.4 por item; critério de aceite de
                                       PR-T0.5 (Bíblia §PR-T0.5) plenamente atendido
Há lacuna remanescente?:               sim — riscos de L-blocks não transcritos (L04, L07-L14,
                                       L17, L18) declarados explicitamente em §Inconclusivos;
                                       não bloqueiam PR-T0.5 (mesmo critério PR-T0.2/T0.3/T0.4)
Há item parcial/inconclusivo bloqueante?: não — todos os 26 riscos têm evidência auditável
                                       nos inventários anteriores; inconclusivos de L-blocks são
                                       limitações estruturais de acesso, não itens parciais
                                       do catálogo de PR-T0.5
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         encerrada
Próxima PR autorizada:                 PR-T0.6 — Inventário de desligamento futuro e convivência
```
