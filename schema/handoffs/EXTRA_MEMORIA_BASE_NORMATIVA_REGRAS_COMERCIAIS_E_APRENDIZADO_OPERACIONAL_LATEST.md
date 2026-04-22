# HANDOFF — Módulo de Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional — ENOVA 2

| Campo | Valor |
|---|---|
| Módulo | Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional |
| Identificador canônico | E1 (Contrato Extraordinário) |
| Data | 2026-04-22 |
| Estado do módulo | contrato em execução |
| Classificação da tarefa | governança / contrato técnico |
| Última PR relevante | PR2 — contrato técnico do módulo E1 |
| Contrato ativo | `schema/contracts/extraordinary/active/CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL.md` |
| Recorte executado do contrato | PR2 — contrato técnico (shapes das 4 camadas, regras de leitura/escrita, regras de evidência, vínculos técnicos) |
| Pendência contratual remanescente | PR3, PR4 |
| Houve desvio de contrato? | não |
| Contrato encerrado nesta PR? | não |
| Item do A01 atendido | Pós-macro — contrato extraordinário explícito |
| Próximo passo autorizado | PR3 — runtime mínimo do módulo |
| Próximo passo foi alterado? | sim — de PR2 para PR3 (PR2 concluída) |
| Tarefa fora de contrato? | não |
| Mudanças em dados persistidos (Supabase) | nenhuma |
| Permissões Cloudflare necessárias | nenhuma adicional |
| Fontes de verdade consultadas | ver seção 20 |

---

## 1. Contexto curto

O macro formal da ENOVA 2 encerrou na Frente 8 (Rollout). A PR1 abriu formalmente o Contrato Extraordinário E1 com 4 camadas definidas e ordem oficial PR1/PR2/PR3/PR4.

Esta PR2 entrega o **contrato técnico canônico do módulo E1** — artefato de fechamento de shapes, vínculos e regras antes de qualquer runtime.

O artefato técnico está em: `schema/contracts/extraordinary/technical/E1_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_APRENDIZADO_TECHNICAL_CONTRACT.md`

O próximo passo autorizado é **PR3 — runtime mínimo do módulo**, conforme seção 11 do contrato técnico.

---

## 2. Classificação da tarefa

governança / contrato técnico

---

## 3. Última PR relevante

PR1 — abertura do contrato extraordinário E1.

---

## 3b. PR2 — o que esta PR fechou

- Criado artefato técnico canônico: `schema/contracts/extraordinary/technical/E1_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_APRENDIZADO_TECHNICAL_CONTRACT.md`
- Shapes completos das 4 camadas (A, B, C, D) com campos obrigatórios/opcionais e enums
- Regras de leitura/escrita fechadas por camada
- Regras de evidência fechadas (válida / insuficiente / aprendizado / hipótese / outcome / bloqueio)
- Integração técnica com CRM, atendimento e camada cognitiva definida
- O que PR3 pode implementar: fechado (seção 11 do contrato técnico)
- O que continua proibido mesmo após PR3: fechado (seção 12 do contrato técnico)
- Contrato ativo atualizado: status → `em execução`, próximo passo → PR3
- Status vivo e handoff atualizados

---

## 4. O que a PR anterior fechou

*(Estado herdado — PR1)*

- Contrato extraordinário E1 aberto formalmente.
- Índice extraordinário criado.
- Status e handoff vivos criados.
- 4 camadas (A, B, C, D) definidas.
- Ordem PR1/PR2/PR3/PR4 persistida.
- Loop obrigatório registrado.

---

## 4b. O que a PR2 (esta) fechou

- Contrato técnico canônico criado: `schema/contracts/extraordinary/technical/E1_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_APRENDIZADO_TECHNICAL_CONTRACT.md`
- Shape completo de `ItemNormativo` (Camada A) com enums e 7 regras obrigatórias
- Shape completo de `RegraComercial` (Camada B) com enums e 7 regras obrigatórias
- Shapes completos da Camada C: `MemoriaPorLead`, `MemoriaPorAtendimento`, `Sinal`, `PadraoDetectado`, `ObjecaoProvavel`, `OutcomeReal` com enums e regras críticas
- Shape completo de `DiretivaMannual` (Camada D) com enums e 7 regras obrigatórias
- Regras de leitura/escrita por camada
- Regras de evidência (seção 9 do contrato técnico)
- Integração técnica com CRM, atendimento e camada cognitiva
- Limites da PR3 (seção 11) e proibições permanentes (seção 12)

---

## 5. O que a PR anterior NÃO fechou

*(Estado herdado — PR1)*

- Contrato técnico com shapes das 4 camadas — entregue nesta PR2.
- Regras detalhadas de leitura/escrita — entregues nesta PR2.
- Vínculos técnicos com CRM/atendimento/camada cognitiva — entregues nesta PR2.

---

## 5b. O que esta PR2 NÃO fechou

- PR3 — runtime mínimo: pendente
- PR4 — smoke integrado + closeout: pendente

---

## 6. Diagnóstico confirmado

1. **Contrato extraordinário E1 aberto corretamente:** confirmado via PR1 — `schema/contracts/extraordinary/active/CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL.md`.
2. **Próximo passo autorizado era exatamente PR2:** confirmado via `schema/contracts/extraordinary/_INDEX.md` e status/handoff da PR1.
3. **Nenhum contrato técnico específico do E1 existia antes desta PR2:** confirmado — `schema/contracts/extraordinary/technical/` não existia.
4. **Esta PR2 é técnico-documental, sem runtime:** confirmado — nenhuma alteração em `src/`.
5. **Nenhuma ingestão real de normativos ou motor real comercial foi presumido:** confirmado.

---

## 7. O que foi feito

- Criado `schema/contracts/extraordinary/technical/E1_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_APRENDIZADO_TECHNICAL_CONTRACT.md` — contrato técnico canônico do módulo E1.
- Shape de `ItemNormativo` (Camada A) com todos os campos obrigatórios/opcionais, enums e 7 regras obrigatórias.
- Shape de `RegraComercial` (Camada B) com todos os campos, enums e 7 regras obrigatórias.
- Shapes da Camada C: `MemoriaPorLead`, `MemoriaPorAtendimento`, `Sinal`, `PadraoDetectado`, `ObjecaoProvavel`, `OutcomeReal` com campos, enums e regras críticas.
- Shape de `DiretivaMannual` (Camada D) com todos os campos, enums e 7 regras obrigatórias.
- Enums compartilhados: `MemoriaStatus`, `MemoriaConfianca`, `EvidenciaTipo`, `MemoriaOrigem`.
- Regras de leitura/escrita por camada (tabelas por operação).
- Regras de evidência (seção 9): evidência válida, insuficiente, aprendizado, hipótese, outcome, bloqueio.
- Integração técnica com CRM (seção 10.1), atendimento (10.2) e camada cognitiva (10.3).
- O que PR3 pode implementar (seção 11.1) e não pode (11.2).
- O que continua proibido permanentemente mesmo após PR3 (seção 12).
- Atualizado contrato ativo: status → `em execução`, PR2 → executada, próximo passo → PR3.
- Atualizado status vivo e handoff vivo.
- Atualizado `schema/contracts/extraordinary/_INDEX.md`.
- Atualizado `schema/contracts/_INDEX.md`.
- Nenhum arquivo em `src/` foi criado ou alterado.

---

## 8. O que não foi feito

- Nenhuma implementação em `src/`
- Nenhuma mudança funcional no CRM ou na camada cognitiva
- Nenhuma integração externa nova
- Nenhum dashboard ou visualização
- Nenhum aprendizado automático
- Nenhuma ingestão de normativos externos
- Nenhum motor de regras comerciais
- Nenhuma refatoração ampla
- PR3 (runtime mínimo) — pendente, próximo passo autorizado

---

## 9. O que esta PR fechou

- PR2 do Contrato Extraordinário E1: contrato técnico canônico completo com shapes das 4 camadas, regras de leitura/escrita, regras de evidência e vínculos técnicos fechados.

---

## 10. O que continua pendente após esta PR

- PR3 — runtime mínimo do módulo (shapes → implementação em `src/`)
- PR4 — smoke integrado + closeout formal

---

## 11. Esta tarefa foi fora de contrato?

não — esta PR2 é o contrato técnico do módulo E1, conforme ordem oficial PR1/PR2/PR3/PR4.

---

## 11a. Contrato ativo

`schema/contracts/extraordinary/active/CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL.md`

---

## 11b. Recorte executado do contrato

PR2 — contrato técnico do módulo.

---

## 11c. Pendência contratual remanescente

PR3 e PR4 conforme ordem oficial do contrato.

---

## 11d. Houve desvio de contrato?

não

---

## 11e. Contrato encerrado nesta PR?

não

---

## 12. Arquivos relevantes

- `schema/contracts/extraordinary/technical/E1_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_APRENDIZADO_TECHNICAL_CONTRACT.md` (criado)
- `schema/contracts/extraordinary/active/CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL.md` (atualizado: status, PR2 executada, próximo passo PR3)
- `schema/status/EXTRA_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_STATUS.md` (atualizado)
- `schema/handoffs/EXTRA_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_LATEST.md` (este arquivo — atualizado)
- `schema/contracts/extraordinary/_INDEX.md` (atualizado)
- `schema/contracts/_INDEX.md` (atualizado)

---

## 13. Item do A01 atendido

Pós-macro — contrato extraordinário explícito. O A01 deve ser atualizado na PR2 para registrar formalmente este item.

---

## 14. Estado atual do módulo

contrato aberto

---

## 15. Próximo passo autorizado

**PR3 — Runtime mínimo do módulo E1**

Antes de iniciar PR3, executar obrigatoriamente o loop definido na seção 15 do contrato ativo e consultar seção 11 do contrato técnico.

**Seção 11 do contrato técnico define:**
- O que PR3 pode implementar (11.1): estruturas TypeScript, hooks mínimos, base consultiva mínima, regras comerciais mínimas, memória mínima, smoke mínimo
- O que PR3 não pode implementar (11.2): aprendizado automático completo, motor de inferência, automação de regras comerciais, ingestão de normativos reais, UI/painel

---

## 16. Riscos

- Risco de PR2 crescer em escopo para incluir runtime — mitigação: o contrato proíbe explicitamente runtime em PR2.
- Risco de confundir contrato extraordinário com Frente 9 do macro — mitigação: identificação canônica E1 (não F9) e índice separado em `extraordinary/`.
- Risco de esquecimento do loop obrigatório — mitigação: loop registrado tanto no contrato quanto no índice extraordinário.
- Risco de misturar norma com heurística — mitigação: regras de evidência e distinção de camadas definidas explicitamente no contrato.

---

## 17. Provas

- Artefato técnico verificável em `schema/contracts/extraordinary/technical/E1_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_APRENDIZADO_TECHNICAL_CONTRACT.md`.
- Nenhum arquivo em `src/` foi criado ou alterado — confirmado por escopo desta PR2.
- `schema/contracts/extraordinary/technical/` criado com artefato técnico canônico.
- Contrato ativo com status `em execução` e próximo passo `PR3`.
- Status vivo atualizado para `em execução` com próximo passo `PR3`.
- Handoff vivo atualizado com recorte PR2 e próximo passo PR3.
- `schema/contracts/extraordinary/_INDEX.md` atualizado com PR2 executada.
- `schema/contracts/_INDEX.md` atualizado.

---

## 18. Mudanças em dados persistidos (Supabase)

Mudanças em dados persistidos (Supabase): nenhuma

---

## 19. Permissões Cloudflare necessárias

Permissões Cloudflare necessárias: nenhuma adicional

---

## 20. Fontes consultadas como fonte de verdade

Fontes de verdade consultadas:
  Índice de contratos lido:    `schema/contracts/_INDEX.md`
  Índice extraordinário lido:  `schema/contracts/extraordinary/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/extraordinary/active/CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL.md`
  Status da frente lido:       `schema/status/EXTRA_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/EXTRA_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_LATEST.md`
  Índice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  N/A — PR2 é contrato técnico documental puro
  PDF mestre consultado:       não consultado — PR2 é contrato técnico documental puro
  A00 lido:                    `schema/A00_PLANO_CANONICO_MACRO.md`
  A01 lido:                    `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
  Protocolos lidos:            `schema/CODEX_WORKFLOW.md`, `schema/CONTRACT_SCHEMA.md`, `schema/STATUS_SCHEMA.md`, `schema/HANDOFF_SCHEMA.md`, `schema/DATA_CHANGE_PROTOCOL.md`, `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`, `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`, `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
