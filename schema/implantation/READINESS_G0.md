# READINESS_G0 — Readiness e Closeout do Gate G0

## Finalidade

Validar se a fase T0 está completa o suficiente para fechar o gate G0 e autorizar a abertura de T1.

Este documento é a prova formal de readiness de G0 conforme exigido pela Bíblia Canônica de PRs
(§PR-T0.R) e pelo `CONTRACT_CLOSEOUT_PROTOCOL.md`.

Base soberana:
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`

Documentos de evidência consultados:
- `schema/implantation/T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` (PR-T0.1)
- `schema/implantation/INVENTARIO_REGRAS_T0.md` (PR-T0.2)
- `schema/implantation/INVENTARIO_PARSERS_HEURISTICAS_T0.md` (PR-T0.3)
- `schema/implantation/INVENTARIO_CANAIS_TELEMETRIA_T0.md` (PR-T0.4)
- `schema/implantation/MATRIZ_RISCO_T0.md` (PR-T0.5)
- `schema/implantation/INVENTARIO_DESLIGAMENTO_T0.md` (PR-T0.6)
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md`

---

## 1. Smoke Documental — Verificação de Completude dos Inventários T0

### 1.1. PR-T0.1 — Inventário legado vivo (fluxos + estados)

| Item | Entregue? | Evidência |
|------|-----------|-----------|
| Fluxos vivos reais mapeados | sim | Seções 3-5 de `T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md` |
| Stages/estados vivos mapeados | sim | Seção 4 com 18 estados catalogados |
| Gates vivos mapeados | sim | Seção 4.5 — RNM, composição, IR/CTPS/restrição |
| Transições reais ativas | sim | Seção 5.2 — transições dinâmicas críticas |
| Matriz de rastreabilidade operacional | sim | Seção 12 — fluxos topo → pós-envio_docs |
| Inventário de estados/campos com prova | sim | Seção 13 — bifurcação E1/E2 explícita |
| Lacunas declaradas (L-blocks) | sim | Seção 14 — decisão de não fechamento com lacuna explícita; L15-L16 elevados para "validada por referência" via Core Mecânico 2 |
| Bloco E preenchido | sim | Seção final — fechamento `sim` |
| **Status PR-T0.1** | **encerrada** | Contrato seção 2026-04-23 (encerramento de PR-T0.1) |

### 1.2. PR-T0.2 — Inventário de regras e classificação por família

| Item | Entregue? | Evidência |
|------|-----------|-----------|
| 7 famílias canônicas catalogadas | sim | `INVENTARIO_REGRAS_T0.md` |
| 48 regras com bloco legado e status | sim | 38 ativas, 6 condicionais, 4 mortas |
| Fonte LEGADO_MESTRE por regra | sim | Linha ou seção do mestre por item |
| Inconclusivos declarados | sim | 8 categorias; não bloqueiam PR-T0.2 |
| Bloco E preenchido | sim | Fechamento `sim` |
| **Status PR-T0.2** | **encerrada** | Contrato seção 2026-04-23 |

### 1.3. PR-T0.3 — Inventário de parsers, heurísticas e branches de stage

| Item | Entregue? | Evidência |
|------|-----------|-----------|
| 27 pontos de decisão mecânica | sim | `INVENTARIO_PARSERS_HEURISTICAS_T0.md` |
| 5 tipos cobertos (parser/regex/fallback/heurística/stage) | sim | Catalogados com tipo explícito |
| Regra associada (PR-T0.2) por item | sim | ID de regra por ponto |
| Inconclusivos declarados | sim | 8 categorias; não bloqueiam PR-T0.3 |
| Bloco E preenchido | sim | Fechamento `sim` |
| **Status PR-T0.3** | **encerrada** | Contrato seção 2026-04-23 |

### 1.4. PR-T0.4 — Inventário de canais, superfícies e telemetria

| Item | Entregue? | Evidência |
|------|-----------|-----------|
| 28 itens (7 canais, 7 superfícies, 3 endpoints, 13 telemetria) | sim | `INVENTARIO_CANAIS_TELEMETRIA_T0.md` |
| Bifurcação E1/E2 aplicada | sim | TE-04 a TE-12 = design-alvo E2; TE-01 = runtime E1 (linha 3416) |
| SF-03 classificada MORTO | sim | Proibida A00-ADENDO-01/02 |
| Fluxo de dados por canal consolidado | sim | Tabela CT→EP→SF |
| Inconclusivos declarados | sim | 7 categorias (L17/L18); não bloqueiam PR-T0.4 |
| Bloco E preenchido | sim | Fechamento `sim` |
| **Status PR-T0.4** | **encerrada** | Contrato seção 2026-04-23 |

### 1.5. PR-T0.5 — Matriz de risco operacional

| Item | Entregue? | Evidência |
|------|-----------|-----------|
| 26 riscos em 5 categorias | sim | `MATRIZ_RISCO_T0.md` |
| 3 críticos identificados | sim | RZ-TM-01, RZ-TE-02, RZ-ES-04 |
| 7 bloqueantes para G0 declarados | sim | Tabela explícita na seção final |
| Referência cruzada com PR-T0.1 a PR-T0.4 | sim | ID de origem por risco |
| Inconclusivos declarados | sim | 7 categorias; não bloqueiam PR-T0.5 |
| Bloco E preenchido | sim | Fechamento `sim` |
| **Status PR-T0.5** | **encerrada** | Contrato seção 2026-04-23 |

### 1.6. PR-T0.6 — Inventário de desligamento futuro e convivência

| Item | Entregue? | Evidência |
|------|-----------|-----------|
| 39 itens em 5 classificações (DI/RO/CT/MD/RC) | sim | `INVENTARIO_DESLIGAMENTO_T0.md` |
| 7 itens mortos/imediatos (DI) declarados | sim | DS-DI-01 a DS-DI-07 |
| 7 critérios CDC canônicos | sim | CDC-01 a CDC-07 |
| Mapa de dependências de fallback | sim | EP/CT-01 → SF-02 → SF-01 → PH-F03 |
| Referência cruzada com MATRIZ_RISCO | sim | RZ-xx por item onde aplicável |
| Soberania LLM-first verificada | sim | DS-DI-01 a DS-DI-07 classificados proibidos |
| Inconclusivos declarados | sim | 7 categorias (L17/L18); não bloqueiam PR-T0.6 |
| Bloco E preenchido | sim | Fechamento `sim` |
| **Status PR-T0.6** | **encerrada** | Contrato seção 2026-04-23 |

---

## 2. Smoke dos Critérios de Aceite de T0

| Critério | Status | Evidência |
|----------|--------|-----------|
| Mestre `LEGADO_MESTRE_ENOVA1_ENOVA2.md` registrado como tronco soberano | cumprido | `_INDEX.md`, todos os contratos, todos os inventários referenciam o mestre como base soberana |
| Repo deixa de se apresentar como implantação macro concluída | cumprido | Rebase canônico T0-PR1; README atualizado; `_INDEX.md` e contrato T0 declaram fase T0/G0 ativo |
| Ordem T0-T7 e gates G0-G7 persistidos | cumprido | `CODEX_WORKFLOW.md`, `PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md`, `PLANO_EXECUTIVO_T0_T7.md` |
| Status/handoff macro indicam fase real e próximo passo único autorizado | cumprido | `IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` e `IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` atualizados por todos os PRs T0.1 a T0.6 |
| Inventário legado vivo produzido e validado | cumprido | PR-T0.1 a PR-T0.6 encerradas — 6 inventários com Bloco E preenchido e fechamento declarado `sim` |
| G0 aprovado antes de T1 | cumprido | Este documento declara G0 APROVADO. T1 não foi aberta em nenhum momento de T0. |

---

## 3. Verificação dos 7 Bloqueantes para G0

Os 7 bloqueantes foram declarados na seção final de `INVENTARIO_DESLIGAMENTO_T0.md` e
`MATRIZ_RISCO_T0.md`. Abaixo a análise de resolução de cada um para fins de G0.

| ID | Descrição | Resolução T0 | Status para G0 |
|----|-----------|--------------|----------------|
| RZ-EL-01 | parseCorrespondenteBlocks — regex L04 runtime desconhecido | Catalogado como PH-R01 (convivência CT, CDC-06); risco declarado em MATRIZ_RISCO; item DS-CT-05 com critério de desligamento por CDC-06 | **DECLARADO** — risco de implementação escopo T1/T5; não impede closeout documental T0 |
| RZ-EL-04 | limite_operacional — L11 não transcrito | Catalogado como inconclusivo estrutural (limitação PDF); declarado em todos os inventários (PR-T0.2, PR-T0.3, MATRIZ_RISCO) | **DECLARADO** — limitação de transcrição estrutural; escopo T1 quando L11 for transcrito |
| RZ-TM-01 | Casca mecânica de fala — crítico | SF-03 e PH-F05 classificados DS-DI-01 (desligar imediato pré-T1); proibição formal A00-ADENDO-01/02 registrada; SF-03 MORTO em PR-T0.4 | **SATISFEITO** — proibição canônica registrada; desligamento declarado como obrigatório pré-T1 |
| RZ-DC-02 | keepStage sem timeout definido | Risco catalogado na MATRIZ_RISCO; classificado como risco operacional escopo T1/T5 | **DECLARADO** — risco de implementação; T0 cumpre função de identificação; mitigação em T1/T5 |
| RZ-TE-02 | Schema Supabase E1 desconhecido — L18 não transcrito | Catalogado como inconclusivo estrutural em todos os inventários; bifurcação E1/E2 aplicada (TE-04 a TE-12 = design-alvo E2 com schema declarado; TE-01 = emissão E1 real) | **DECLARADO** — limitação de transcrição estrutural; mitigação em T1 quando L18 for transcrito |
| RZ-TE-03 | CRM E1 não mapeado — L18 não transcrito | Catalogado como TE-13 (CRM E1, DS-CT-04), convivência temporária com CDC-04 como critério de desligamento | **DECLARADO** — equivalente CRM E2 será definido em T1; CRM E1 permanece em convivência supervisionada |
| RZ-ES-04 | T1 aberta sem G0 aprovado | Meta-regra: satisfeita pela aprovação de G0 neste documento; T1 não foi aberta em nenhum momento de T0 | **SATISFEITO** — auto-satisfeito pela aprovação de G0 nesta PR |

### Interpretação dos status

- **SATISFEITO**: risco endereçado no escopo T0 com evidência completa.
- **DECLARADO**: risco identificado, catalogado e com escopo de resolução definido para T1+. Não representa gap de inventário T0 — representa trabalho futuro corretamente mapeado. A00-ADENDO-03 exige que lacunas residuais sejam *declaradas*, não eliminadas, para que fechamento seja permitido quando o escopo de prova cobre o compromisso do contrato (inventário, não implementação).

---

## 4. Verificação de Coerência Entre Inventários

| Par de inventários | Coerência verificada | Observação |
|--------------------|----------------------|------------|
| PR-T0.1 (fluxos/estados) × PR-T0.2 (regras) | sim | Regras em PR-T0.2 referenciadas a gates/fluxos de PR-T0.1; IDs cruzados |
| PR-T0.2 (regras) × PR-T0.3 (parsers) | sim | Cada parser/heurística tem ID de regra associada de PR-T0.2 |
| PR-T0.3 (parsers) × PR-T0.4 (canais) | sim | Parsers referenciados a superfícies e canais de PR-T0.4 onde aplicável |
| PR-T0.4 (canais) × PR-T0.5 (risco) | sim | Riscos RZ-TM-01, RZ-TE-01 a RZ-TE-05 referenciam IDs de PR-T0.4 |
| PR-T0.5 (risco) × PR-T0.6 (desligamento) | sim | Referência cruzada RZ-xx por item em PR-T0.6; 7 bloqueantes aparecem em ambos |
| Adendos A00-ADENDO-01/02/03 × todos os PRs | sim | SF-03 MORTO em PR-T0.4; DS-DI-01/02 em PR-T0.6; Bloco E em todos |

---

## 5. Limitações Residuais Formalmente Declaradas

As seguintes limitações são estruturais e não constituem falha de inventário T0. Ficam declaradas
para que T1 as endereça nos momentos corretos:

1. **L-blocks L17 e L18 não transcritos** — PDFs da ENOVA 1 não convertidos para texto; schema Supabase
   E1 real e integração CRM E1 ficam como inconclusivos estruturais. Impacto: TE-02 (schema), TE-03
   (CRM), PH-R01 (regex RNM). Escopo de resolução: T1 (quando L17/L18 forem transcritos).

2. **L04 (parseCorrespondenteBlocks) não transcrito** — regex de RNM em runtime E1 desconhecida.
   Catalogado como PH-R01 (convivência CT, CDC-06). Escopo de resolução: T1/T5.

3. **L11 (limite_operacional) não transcrito** — limite operacional de composição desconhecido.
   Catalogado em INVENTARIO_REGRAS_T0 como inconclusivo. Escopo de resolução: T1.

4. **keepStage sem timeout** — comportamento de retenção de stage sem timeout explícito em E1.
   Risco operacional catalogado (RZ-DC-02). Escopo de resolução: T1/T5.

5. **Schema Supabase E1 real** — colunas/tabelas da persistência E1 não provadas sem inferência.
   Bifurcação E1/E2 aplicada (seção 13 de T0_PR1_ENOVA1_LEGADO_VIVO_CANONICO.md). Escopo: T1.

---

## 6. Decisão Formal sobre G0

```
DECISÃO G0: APROVADO COM LIMITAÇÕES RESIDUAIS FORMALMENTE DECLARADAS

Data da decisão: 2026-04-23
PR que aprova G0: PR-T0.R

Justificativa:
- Todos os 6 inventários T0 (PR-T0.1 a PR-T0.6) foram encerrados com Bloco E completo.
- Todos os critérios de aceite de T0 estão cumpridos.
- Os 7 bloqueantes para G0: 2 satisfeitos com evidência, 5 declarados com escopo de resolução
  definido para T1+. Declaração formal satisfaz A00-ADENDO-03 para gate documental.
- Nenhuma lacuna remanescente bloqueia o inventário documental — as limitações residuais são
  de transcrição de PDF (estrutural) e de implementação futura (escopo T1+), não de escopo T0.
- Fora de escopo de T0 respeitado: sem runtime funcional, sem Supabase produtivo, sem LLM real,
  sem shadow/canary, sem alteração em src/, package.json ou wrangler.toml em nenhuma PR.
- A00-ADENDO-03: fechamento por prova — evidência documental completa para o escopo contratado.

G0 está aprovado.
T1 está autorizada a abrir conforme PR-T1.0.
```

---

## 7. Encerramento do Contrato T0

Conforme `CONTRACT_CLOSEOUT_PROTOCOL.md` seção 4:

```
--- ENCERRAMENTO DE CONTRATO ---
Contrato encerrado:                     schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T0.md
Contrato encerrado com sucesso?:        sim
Objetivo do contrato cumprido?:         sim — fase T0 (congelamento, inventário e mapa do legado vivo) executada integralmente
Critérios de aceite cumpridos?:         sim
  - [x] Mestre LEGADO_MESTRE_ENOVA1_ENOVA2.md registrado como tronco soberano
  - [x] Repo deixa de se apresentar como implantação macro concluída
  - [x] Ordem T0-T7 e gates G0-G7 persistidos
  - [x] Status/handoff macro indicam fase real e próximo passo único autorizado
  - [x] Inventário legado vivo produzido e validado (PR-T0.1 a PR-T0.6)
  - [x] G0 aprovado antes de T1
Fora de escopo respeitado?:             sim — nenhuma PR alterou runtime, LLM real, Supabase produtivo,
                                         STT/TTS real, shadow/canary ou UI externa
Pendências remanescentes:               limitações residuais de L-blocks declaradas (seção 5);
                                        não constituem pendência contratual T0 — são escopo T1+
Evidências / provas do encerramento:    PR-T0.1 (PR #73), PR-T0.2 (PR #74/75/76), PR-T0.3 (PR #77/78),
                                        PR-T0.4 (PR #79), PR-T0.5 (PR #80), PR-T0.6 (PR #81);
                                        6 inventários em schema/implantation/; Bloco E em todos;
                                        READINESS_G0.md (este documento) com smoke completo
Data de encerramento:                   2026-04-23T00:00:00Z
PR que encerrou:                        PR-T0.R — Readiness e closeout do gate G0
Destino do contrato encerrado:          archive (schema/contracts/archive/CONTRATO_IMPLANTACAO_MACRO_T0_2026-04-23.md)
Próximo contrato autorizado:            schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md (skeleton)
```

---

## 8. Próximos Passos Autorizados

1. **PR-T1.0** — abertura da fase T1 com execução do contrato T1.
2. **Antes de PR-T1.0**: ler obrigatoriamente:
   - `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
   - `schema/execution/PR_BIBLIA_CANONICA_MACRO_LLM_FIRST.md` (seção PR-T1.0)
   - `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T1.md`
   - `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md`
   - `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md`
   - `schema/ADENDO_CANONICO_SOBERANIA_IA.md` (A00-ADENDO-01)
   - `schema/ADENDO_CANONICO_SOBERANIA_LLM_MCMV.md` (A00-ADENDO-02)
   - `schema/ADENDO_CANONICO_FECHAMENTO_POR_PROVA.md` (A00-ADENDO-03)

---

## BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/implantation/READINESS_G0.md (este documento) +
                                        PR-T0.1 a PR-T0.6 (inventários seção 1)
Estado da evidência:                   completa — smoke documental de todos os 6 inventários
                                        realizado; critérios de aceite T0 verificados; 7 bloqueantes
                                        G0 analisados com resolução declarada
Há lacuna remanescente?:               sim — 5 limitações residuais estruturais declaradas (seção 5):
                                        L17/L18 não transcritos, L04 não transcrito, L11 não
                                        transcrito, keepStage sem timeout, schema Supabase E1;
                                        TODAS com escopo de resolução T1+ e NÃO bloqueantes para
                                        gate documental T0 (inventário concluído para o escopo
                                        contratado)
Há item parcial/inconclusivo bloqueante?: não — inconclusivos são de transcrição PDF estrutural
                                        (fora do escopo de T0) e de implementação futura (T1+);
                                        nenhum critério de aceite T0 ficou parcial
Fechamento permitido nesta PR?:        sim
Estado permitido após esta PR:         T0 encerrada; G0 aprovado; T1 autorizada
Próxima PR autorizada:                 PR-T1.0 — abertura da fase T1
```
