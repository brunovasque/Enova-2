# FUNIL DE QUALIFICAÇÃO ENOVA 2 — Visão Geral T5
# Gerado: 2026-05-05 (read-only research — nenhum src/ alterado)

---

## 1. Status do Contrato T5

| Campo | Valor |
|-------|-------|
| Contrato | T5 — Mapa Declarativo do Funil |
| Estado | **ENCERRADO** |
| Gate | **G5 APROVADO 2026-04-28** |
| PRs executadas | T5.0 → T5.1 → T5.2 → T5.3 → T5.4 → T5.5 → T5.6 → T5.7 → T5.8 → T5.R |
| Critérios G5 | S1-S8 smoke PASS + CA-01..CA-10 + zero if/else de fala + Bloco E |
| Restrição | T5 é 100% declarativo — nenhum arquivo `src/` foi alterado |

---

## 2. Estrutura Macro: 5 Fatias + 45 Stages Legados

```
F1 — Topo / Abertura          (7 stages legados → current_phase=discovery)
F2 — Qualificação / Composição (7 stages legados → current_phase=qualification)
F3 — Renda / Regime            (21 stages legados → current_phase=qualification/qualification_special)
F4 — Elegibilidade / Restrição (5 stages legados → current_phase=qualification/qualification_special)
F5 — Docs / Handoff            (5 stages legados → current_phase=docs_prep → visit_conversion)
FI — Informativa transversal   (cross-fatia)
FP — Paridade Enova 1          (cobertura completa)
FS — Shadow                    (validação sem go-live)
```

### Mapa canônico de current_phase (L03 stage-map.ts)

```
discovery → qualification_civil → qualification_renda →
qualification_eligibility → qualification_special →
docs_prep → docs_collection → broker_handoff → visit
```

---

## 3. F1 — Topo / Abertura (current_phase=discovery)

### Stages legados mapeados (7)

| Stage legado | Descrição |
|---|---|
| inicio | Abertura — primeiro contato |
| inicio_decisao | Detecta interesse inicial do lead |
| inicio_nome | Coleta nome completo |
| inicio_programa | Explica MCMV brevemente |
| inicio_nacionalidade | Pergunta se brasileiro ou estrangeiro |
| inicio_rnm | Solicita RNM (se estrangeiro) |
| inicio_tem_validade | Verifica validade do RNM |

### Fatos mínimos de saída F1

| Fato | Tipo | Condição |
|------|------|----------|
| fact_customer_goal | captured (não confirmado) | obrigatório |
| fact_lead_name | captured | obrigatório |
| fact_nationality | confirmed | obrigatório |
| fact_rnm_status | confirmed | apenas se estrangeiro |
| derived_rnm_required | derived | se fact_nationality=estrangeiro |
| derived_rnm_block | derived | se rnm_status ∈ {sem_rnm, vencido, inválido} |

### Rota canônica F1 (topo-gates.ts)

```
Gate 1: customer_goal ausente → bloqueia → COLETAR_CUSTOMER_GOAL
Gate 2: nome_completo ausente → bloqueia → EXPLICAR_MCMV_E_COLETAR_NOME
Gate 3: nacionalidade ausente → bloqueia → PERGUNTAR_NACIONALIDADE
Gate 4: estrangeiro + RNM inválido → bloqueia → PERGUNTAR_RNM_E_VALIDADE
Gate 5: topo mínimo completo → autoriza → qualification_civil
```

### Regras críticas F1

- `fact_customer_goal` apenas **captured** é suficiente para avançar — curiosidade e simulação são entradas válidas
- RNM: apenas validade **indeterminada** (sem data de vencimento) é aceita; validade determinada mesmo não expirada = bloqueio (LF-02)
- Bloqueio `BLQ-F1-01`: `R_ESTRANGEIRO_SEM_RNM` quando fact_rnm_status ∈ {sem_rnm, vencido, inválido}

---

## 4. F2 — Qualificação Civil / Composição Familiar (current_phase=qualification)

### Stages legados mapeados (7)

| Stage legado | Descrição |
|---|---|
| estado_civil | Pergunta estado civil |
| confirmar_casamento | Confirma casamento civil vs. união estável |
| interpretar_composicao | Decide rota solo vs. conjunto |
| confirmar_avo_familiar | Alerta risco avô/avó >67 anos |
| dependente | Pergunta sobre dependentes |
| financiamentos_conjunto | Verifica financiamentos em conjunto |
| quem_pode_somar | Identifica candidatos à composição |

### 9 Regras Vasques de F2

| # | Regra |
|---|-------|
| R1 | Casado civil → processo **obrigatoriamente em conjunto** |
| R2 | União estável ≠ casamento; **não obriga** conjunto |
| R3 | Solteiro com composição = solo + rota composição voluntária |
| R4 | Avô/avó >67 anos → **alertar risco CEF** sem bloquear seco |
| R5 | Dependente condicional: pular se conjunto; perguntar se solo <R$4k; pular se solo >R$4k |
| R6 | `financiamentos_conjunto` NUNCA = financiamento anterior; sempre = **em conjunto AGORA** |
| R7 | Identificar candidatos composição sem prometer aprovação |
| R8 | Familiar casado civil → cônjuge desse familiar **entra** (P3 cascading) |
| R9 | Base normativa MCMV/CEF = **lacuna declarada** (LF-05) |

### Lacunas F2 (LF-01..LF-05)

| ID | Lacuna |
|----|--------|
| LF-01 | Financiamento conjunto atual (ausente no schema) |
| LF-02 | Estado civil do familiar P3 |
| LF-03 | Cônjuge do familiar P3 |
| LF-04 | Idade do familiar |
| LF-05 | Base normativa MCMV/CEF |

### Roteamento F2

| Rota | Condição | Destino |
|------|----------|---------|
| ROT-F2-01 | p3_required=false | qualification |
| ROT-F2-02 | p3_required=true | qualification_special |

---

## 5. F3 — Renda / Regime / Composição (current_phase=qualification/qualification_special)

### Stages legados mapeados (21)

| Stage legado | Descrição |
|---|---|
| regime_trabalho | CLT, MEI, autônomo, informal, desempregado |
| renda | Valor da renda principal |
| ctps_36 | CTPS ≥36 meses vigente |
| ir_declarado | IR declarado nos últimos 2 anos |
| ... (17 stages adicionais de regime e composição) | |

### Princípio-mãe RC-F3-01

> **Toda renda precisa ter: dono, regime, valor, comprovação, relação.**

### Regras comerciais críticas F3

| Código | Regra |
|--------|-------|
| RC-F3-07 | Pensão alimentícia **não entra** como renda |
| RC-F3-08 | BF/BPC **não é renda válida** |
| RC-F3-19 | Seguro-desemprego e trabalho temporário **não são renda estável** |
| derived_subsidy_band_hint | Hint interno **APENAS** — não calcula aprovação, não promete subsídio |

### Lacunas F3 (LF-01..LF-09)

| ID | Lacuna |
|----|--------|
| LF-01 | Valor separado por fonte de renda |
| LF-02 | IRPF do familiar P3 |
| LF-03 | CTPS do familiar P3 |
| LF-04 | Tipo de pensão (alimentícia vs. previdenciária) |
| LF-05 | Benefício social não financiável |
| LF-06 | Pró-labore |
| LF-07 | Renda variável — média |
| LF-08 | CNPJ-only sem pró-labore |
| LF-09 | Desempregado — enum canônico |

### Cross-fatia F2→F3

- `dependente` resolvido quando renda P1 confirmada
- P3 cascading: se P3 casado civil → cônjuge entra → nova iteração F2+F3

---

## 6. F4 — Elegibilidade / Restrição (current_phase=qualification/qualification_special)

### Stages legados mapeados (5)

| Stage legado | Descrição |
|---|---|
| restricao | Verifica restrições (Serasa, FGTS, SPC) |
| regularizacao_restricao | Rota de regularização |
| fim_inelegivel | Encerramento por inelegibilidade |
| verificar_averbacao | Verifica averbação de divórcio |
| verificar_inventario | Verifica inventário pendente |

---

## 7. F5 — Docs / Handoff (current_phase=docs_prep → visit_conversion)

### Stages legados mapeados (5)

| Stage legado | Descrição |
|---|---|
| envio_docs | Canal de envio documental |
| agendamento_visita | Agendamento de visita ao imóvel |
| aguardando_retorno_correspondente | Aguarda resposta do correspondente |
| finalizacao | Finalização do processo |
| finalizacao_processo | Handoff final ao broker |

---

## 8. Anti-padrões Proibidos (AP-01..AP-12)

| ID | Anti-padrão |
|----|-------------|
| AP-01 | Prometer aprovação de crédito |
| AP-02 | Calcular subsídio específico |
| AP-03 | Confirmar valor de prestação |
| AP-04 | Comparar bancos ou taxas |
| AP-05 | Pular rota canônica (ex.: pular nacionalidade) |
| AP-06 | Aceitar renda de BF/BPC como válida |
| AP-07 | Tratar união estável = casamento civil |
| AP-08 | Bloquear lead por curiosidade (customer_goal=apenas_curiosidade não bloqueia) |
| AP-09 | Aceitar RNM com validade determinada |
| AP-10 | Prometer composição sem verificar estado civil do P3 |
| AP-11 | Perguntar estado civil antes de identificar customer_goal |
| AP-12 | Usar `reply_text` templates (LLM é soberano da fala) |

---

## 9. Grep de termos de funil em schema/contracts/

Termos encontrados (grep schema/contracts/ — principais arquivos):

| Termo | Arquivos |
|-------|---------|
| `qualification_civil` | CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md, T5_MAPA_FATIAS.md, T5_FATIA_TOPO_ABERTURA.md |
| `qualification_renda` | T5_MAPA_FATIAS.md, CONTRATO_T9_LLM_FUNIL_SUPABASE_RUNTIME.md |
| `discovery` | Todos os contratos ativos |
| `estado_civil` | T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md |
| `nacionalidade` | T5_FATIA_TOPO_ABERTURA.md, topo-rules.ts |
| `MCMV` | T5_FATIA_*.md (transversal) |
| `renda` | T5_FATIA_RENDA_REGIME_COMPOSICAO.md |
| `elegibilidade` | T5_FATIA_ELEGIBILIDADE_RESTRICAO.md |

---

## 10. Princípios Contratuais do T5 (invariáveis)

1. **LLM soberano da fala** — Core Mecânico jamais gera texto ao cliente
2. **Zero reply_text templates** — nenhuma PR T5 contém templates de resposta
3. **Declarativo puro** — T5 não alterou nenhum arquivo `src/`
4. **Rota canônica inviolável** — ordem dos gates não pode ser reordenada
5. **Degradação graceful** — todo bloqueio tem razão estrutural, não encerra o lead
6. **fact_customer_goal captured = suficiente** — curiosidade não bloqueia o funil
7. **derived_subsidy_band_hint = hint interno** — não alimenta comunicação ao cliente

---

## 11. Arquivos fonte T5

| Arquivo | Conteúdo |
|---------|----------|
| `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T5.md` | Contrato T5 completo (encerrado, G5 APROVADO) |
| `schema/implantation/T5_MAPA_FATIAS.md` | 45 stages legados → 5 fatias (644 linhas) |
| `schema/implantation/T5_FATIA_TOPO_ABERTURA.md` | Contrato F1 (634 linhas) |
| `schema/implantation/T5_FATIA_QUALIFICACAO_INICIAL_COMPOSICAO_FAMILIAR.md` | Contrato F2 (868 linhas) |
| `schema/implantation/T5_FATIA_RENDA_REGIME_COMPOSICAO.md` | Contrato F3 (1003 linhas) |
| `schema/implantation/T5_FATIA_ELEGIBILIDADE_RESTRICAO.md` | Contrato F4 |
