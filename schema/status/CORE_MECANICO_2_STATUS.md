# STATUS VIVO — Core Mecânico 2 — ENOVA 2

| Campo                                      | Valor                                                                                     |
|--------------------------------------------|-------------------------------------------------------------------------------------------|
| Frente                                     | Core Mecânico 2                                                                           |
| Contrato ativo                             | `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`                                    |
| Estado do contrato                         | em execução                                                                               |
| Última PR executou qual recorte            | L03 — mapa de stages e gates (primeiro recorte contratual executado)                      |
| Pendência contratual                       | L04–L17 em aberto; trilho completo ainda pendente                                         |
| Contrato encerrado?                        | não                                                                                       |
| Item do A01                                | Fase 2 — Prioridade 1: modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala |
| Estado atual                               | em execução — primeiro recorte contratual (L03) entregue com smoke passando               |
| Classe da última tarefa                    | contratual — primeiro recorte do Core Mecânico 2: mapa de stages e gates (L03)            |
| Última PR relevante                        | PR de execução L03 — Core Mecânico 2: mapa de stages e gates                              |
| Último commit                              | feat(core): mapa de stages/gates L03 + motor de decisão + smoke suite (5/5 passando)      |
| Pendência remanescente herdada             | Nenhuma — primeira PR contratual de execução entregue                                     |
| Próximo passo autorizado                   | Segunda PR contratual: L04 + L05 + L06 — topo do funil (regras, extração e gates)         |
| Legados aplicáveis                         | Legado mestre unificado — blocos L03 (executado), L04–L17 (pendentes)                     |
| Mudanças em dados persistidos (Supabase)   | nenhuma                                                                                   |
| Permissões Cloudflare — infra herdada (PR #7) | Workers Scripts:Edit — obrigatório para deploy via wrangler (aviso preventivo ativo) |
| Permissões Cloudflare — última tarefa      | nenhuma adicional — implementação de scaffold Core sem deploy                             |
| Fontes consultadas — última tarefa         | ver seção 17 abaixo                                                                       |
| Última atualização                         | 2026-04-20T19:30:00Z                                                                      |

---

## 1. Nome da frente

Core Mecânico 2

## 2. Contrato ativo

`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` — aberto em 2026-04-20T17:47:00Z.

O contrato ativo é uma camada operacional vinculada ao contrato macro (A00, A01, A02, PDF-fonte).
Ele não substitui o PDF-fonte. Ele organiza a execução por etapas com âncora contratual explícita.

Documentos complementares do contrato:
- `schema/contracts/active/CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md` — mapa de cláusulas
- `schema/contracts/active/CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md` — regras de execução ancorada

## 3. Item do A01

- **Fase**: Fase 0 → Fase 2 — contrato do Core aberto, execução funcional autorizada como próximo passo.
- **Próxima fase**: Primeira PR contratual de execução do Core Mecânico 2.
- **Prioridade do backlog**: Prioridade 1 — modelar o Core Mecânico 2 com contratos por stage/objetivo, desacoplado da fala.
- **Gate aplicável**: Gate 1 — sem contrato da frente, não começa implementação. **SATISFEITO** por esta PR.
- **Gate seguinte**: Gate 2 — sem smoke da frente, não promove para a frente seguinte.

## 4. Estado atual

**em execução** — primeiro recorte contratual (L03) entregue com smoke passando

A frente Core Mecânico 2 possui contrato ativo (`schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`).
O primeiro recorte contratual (L03 — mapa de stages e gates) foi executado:
- `src/core/types.ts` — tipos estruturais do Core (stage, gate, LeadState, CoreDecision)
- `src/core/stage-map.ts` — mapa canônico de stages e gates derivado de L03
- `src/core/engine.ts` — motor de decisão estrutural (sem speech, sem fala ao cliente)
- `src/core/smoke.ts` — smoke suite determinística: 5/5 cenários passando

## 5. Classe da última tarefa

**contratual** — primeiro recorte do Core Mecânico 2: mapa de stages e gates (L03).
Âncora: Cláusula-fonte L-01, Bloco L03, Gate 2 (A01). PDF-fonte consultado diretamente.
Nenhuma fala, surface, phrasing ou resposta ao cliente gerada pelo Core.
Smoke suite executada e passando: 5/5 cenários (incluindo bloqueio RNM, casado civil, autônomo/IR, trilho completo).

## 6. Última PR relevante

PR #9 — PR Governance Gate + REQUEST_ECONOMY_PROTOCOL.
PR #10 — Auto-fix controlado do PR Governance Gate + regra @copilot+modelo.
PR #12 — Organização documental do legado mestre.
PR #13 — Encontrabilidade contratual e rastreabilidade de fontes.
PR de abertura — Governança: contrato ativo vinculante do Core Mecânico 2.
PR de execução L03 — Core Mecânico 2: mapa de stages e gates (esta PR):
- Criou `src/core/types.ts` — tipos estruturais: StageId, LeadState, CoreDecision, GateResult, etc.
- Criou `src/core/stage-map.ts` — STAGE_MAP + gates canônicos derivados de L03
- Criou `src/core/engine.ts` — motor de decisão (sem fala; speech_intent como sinal estrutural)
- Criou `src/core/smoke.ts` — smoke suite: 5 cenários, todos passando
- Criou `package.json` + `.gitignore` — scaffold mínimo para execução do smoke
- Atualizou `schema/status/CORE_MECANICO_2_STATUS.md`
- Atualizou `schema/handoffs/CORE_MECANICO_2_LATEST.md`

## 7. Último commit

feat(core): L03 mapa de stages/gates + motor de decisão + smoke suite (5/5 passando)

## 8. Entregas concluídas

- [x] Trio-base canônico: A00 + A01 + A02
- [x] CODEX_WORKFLOW com protocolo obrigatório de execução (16 etapas + 19 seções)
- [x] TASK_CLASSIFICATION com 6 classes canônicas de tarefas
- [x] README_EXECUCAO com ordem de leitura e regras de continuidade
- [x] AGENT_CONTRACT com mandato, classificação obrigatória e regra de continuidade entre PRs
- [x] PULL_REQUEST_TEMPLATE com estado herdado, classificação, o que fecha/não fecha
- [x] CONTRACT_SCHEMA — formato obrigatório de contrato novo
- [x] STATUS_SCHEMA — formato com classe da última tarefa e pendência remanescente herdada
- [x] HANDOFF_SCHEMA — formato com classificação, PR anterior, o que fechou/não fechou
- [x] Estrutura de status vivos e handoffs
- [x] Incorporação dos legados em legado mestre unificado
- [x] DATA_CHANGE_PROTOCOL — protocolo obrigatório de mudanças em dados persistidos do Supabase
- [x] Rastreabilidade total de dados: declaração obrigatória em todo ESTADO HERDADO, ESTADO ENTREGUE, handoff, status e PR template
- [x] Bootstrap técnico Cloudflare Workers: `wrangler.toml` com ambientes canônicos `nv-enova-2` (prod) e `nv-enova-2-test` (test)
- [x] Entrypoint placeholder mínimo `src/worker.ts` (sem lógica de produto)
- [x] `docs/BOOTSTRAP_CLOUDFLARE.md` — documentação do bootstrap e uso local via terminal/VSCode
- [x] CLOUDFLARE_PERMISSION_PROTOCOL — protocolo obrigatório de permissões Cloudflare
- [x] Rastreabilidade total de permissões Cloudflare: declaração obrigatória em todo ESTADO HERDADO, ESTADO ENTREGUE, handoff, status e PR template
- [x] **Pipeline de deploy GitHub Actions** — `.github/workflows/deploy.yml`: disparo manual, test e prod, proteção de branch para prod
- [x] **Camada formal de execução contratual** — `schema/contracts/`: índice, protocolo de execução, protocolo de closeout, diretórios active/archive. CODEX_WORKFLOW 16 etapas. PR template com vínculo contratual. Agent contract com regras anti-desvio.
- [x] **PR Governance Gate** — `.github/workflows/pr-governance-check.yml` + `scripts/validate_pr_governance.js`. Validação determinística de PR sem LLM, sem custo extra. Gate valida campos obrigatórios: vínculo contratual, Supabase, Cloudflare, arquivos vivos, próximo passo.
- [x] **REQUEST_ECONOMY_PROTOCOL** — `schema/REQUEST_ECONOMY_PROTOCOL.md`. Protocolo de economia de request e preferência por modelo barato. Incorporado no CODEX_WORKFLOW (seção 16), AGENT_CONTRACT (regras 20-25), PR template, README e README_EXECUCAO.
- [x] **Auto-fix controlado do PR Governance Gate** — `.github/workflows/pr-governance-autofix.yml` + `scripts/autofix_pr_governance.js`. Auto-fix determinístico: max 3 tentativas, apenas erros triviais, sem LLM. Para obrigatoriamente em erros estruturais.
- [x] **Regra de menção obrigatória ao agente/modelo** — `@copilot+modelo` obrigatório em toda instrução operacional. Documentado em AGENT_CONTRACT (regra 26), CODEX_WORKFLOW (seção 18), README_EXECUCAO e README.
- [x] **Organização documental do legado mestre** — `schema/source/README.md` corrigido, `LEGADO_MESTRE_ENOVA1_ENOVA2.md` reorganizado com honestidade documental, `INDEX_LEGADO_MESTRE.md` transformado em índice operacional real com ordem de leitura + status granular, `CONTRACT_SCHEMA.md` expandido com campos obrigatórios de referências e blocos legados.
- [x] **Contrato ativo vinculante do Core Mecânico 2** — `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md` criado com todas as 16 seções do CONTRACT_SCHEMA + cláusula central de soberania + declaração de subordinação + regra de parada contratual. Mapa de cláusulas (`CONTRATO_CORE_MECANICO_2_CLAUSE_MAP.md`) e regras de execução ancorada (`CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md`) criados. `_INDEX.md` atualizado. Gate 1 do A01 satisfeito.
- [x] **L03 — Mapa de stages e gates (primeiro recorte contratual)** — `src/core/types.ts`, `src/core/stage-map.ts`, `src/core/engine.ts`, `src/core/smoke.ts`. Smoke suite: 5/5 passando. Gate 2 do A01 satisfeito. Core totalmente desacoplado da fala.

## 9. Pendências

- [x] ~~Primeira PR contratual de execução do Core Mecânico 2~~ — **CONCLUÍDA** (L03 executado)
- [ ] Segunda PR contratual: L04 + L05 + L06 — topo do funil (regras, extração e gates)
- [ ] Implementação funcional do trilho completo (L04–L17)
- [ ] Smoke de trilho completo (topo → final) — Gate 2 do A01 satisfeito no recorte L03; trilho completo pendente
- [ ] Verificar e ajustar escopo do token CLOUDFLARE_API_TOKEN antes do primeiro deploy real (Workers Scripts:Edit obrigatório)

## 10. Pendência remanescente herdada

Da PR de abertura de contrato: primeira PR contratual de execução.
**RESOLVIDA** por esta PR — recorte L03 executado, smoke 5/5 passando.

## 11. Bloqueios

Nenhum bloqueio ativo.
Gate 1 do A01 satisfeito — contrato do Core aberto.
Gate 2 do A01 satisfeito no recorte L03 — smoke de stages/gates passando (5/5).
Gate 2 para trilho completo: pendente até L04–L17 serem implementados.

**Aviso preventivo de permissão Cloudflare:**
O token `CLOUDFLARE_API_TOKEN` deve ter permissão `Workers Scripts:Edit` para que o deploy funcione.
Verificar antes do primeiro deploy real. Ver `docs/BOOTSTRAP_CLOUDFLARE.md` e `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`.

## 12. Próximo passo autorizado

**Segunda PR contratual de execução do Core Mecânico 2**: L04 + L05 + L06 — topo do funil (regras de contrato, parser e critérios de gate).

- Classificação: `contratual`
- Vínculo contratual explícito com `schema/contracts/active/CONTRATO_CORE_MECANICO_2.md`
- Âncora contratual obrigatória (conforme `CONTRATO_CORE_MECANICO_2_EXECUTION_RULES.md`)
- Cláusula-fonte: L-02 (mapa de cláusulas)
- Blocos: L04, L05, L06

**Próximo passo alterado** em relação à PR anterior: sim — de "Primeira PR contratual de execução" para "Segunda PR contratual (L04–L06 — topo do funil)".

## 13. Legados aplicáveis

Conforme A02 e `schema/legacy/INDEX_LEGADO_MESTRE.md`:
- **Legado mestre unificado**: `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md`
- **Bloco executado**: L03 (esta PR)
- **Blocos obrigatórios pendentes**: L04–L17
- **Blocos complementares**: L01–L02, L18, L19, C*
- **Consulta por frente**: `schema/legacy/INDEX_LEGADO_MESTRE.md` — seção "Amarração por frente"

## 14. Última atualização

- **Data**: 2026-04-20T19:30:00Z
- **Responsável**: Copilot (PR de execução L03 — Core Mecânico 2: mapa de stages e gates)

## 15. Mudanças em dados persistidos (Supabase) — última tarefa

Mudanças em dados persistidos (Supabase): nenhuma

## 16. Permissões Cloudflare necessárias — última tarefa

Permissões Cloudflare necessárias: nenhuma adicional

## 17. Fontes consultadas — última tarefa

```
Fontes de verdade consultadas — última tarefa (PR de execução L03):
  Índice de contratos lido:    schema/contracts/_INDEX.md
  Contrato ativo lido:         schema/contracts/active/CONTRATO_CORE_MECANICO_2.md
  Status da frente lido:       schema/status/CORE_MECANICO_2_STATUS.md (este arquivo)
  Handoff da frente lido:      schema/handoffs/CORE_MECANICO_2_LATEST.md
  Índice legado consultado:    schema/legacy/INDEX_LEGADO_MESTRE.md
  Legado markdown consultado:  schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md — L03 (estrutura reservada; conteúdo no PDF)
  PDF mestre consultado:       sim — lido diretamente (pdfplumber)
    PDF 6 — Taxonomia, modelo de dados e política de estado/memória: pp. 2–8 (entidades, facts, fases macro, state v2)
    PDF 7 — Ordem executiva e contrato rígido: pp. 1–4 (stack operacional, regras de negócio, tabela de regras R1–R6)
    PDF 8 — Policy Engine plugável no Worker: pp. 1–6 (missão do Core, entrada, saída, política de decisão, código)
    PDF Complementar — Core Mecânico: pp. 118–119 (missão, entrada, saída mínima, política de decisão, teste mínimo)
```
