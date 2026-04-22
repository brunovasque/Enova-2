# HANDOFF — Módulo de Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional — ENOVA 2

| Campo | Valor |
|---|---|
| Módulo | Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional |
| Identificador canônico | E1 (Contrato Extraordinário) |
| Data | 2026-04-22 |
| Estado do módulo | contrato aberto |
| Classificação da tarefa | governança |
| Última PR relevante | PR1 — abertura do contrato extraordinário E1 |
| Contrato ativo | `schema/contracts/extraordinary/active/CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL.md` |
| Recorte executado do contrato | PR1 — abertura do contrato extraordinário |
| Pendência contratual remanescente | PR2, PR3, PR4 |
| Houve desvio de contrato? | não |
| Contrato encerrado nesta PR? | não |
| Item do A01 atendido | Pós-macro — contrato extraordinário explícito |
| Próximo passo autorizado | PR2 — contrato técnico do módulo |
| Próximo passo foi alterado? | não — estado inicial do contrato E1 |
| Tarefa fora de contrato? | não |
| Mudanças em dados persistidos (Supabase) | nenhuma |
| Permissões Cloudflare necessárias | nenhuma adicional |
| Fontes de verdade consultadas | ver seção 20 |

---

## 1. Contexto curto

O macro formal da ENOVA 2 encerrou na Frente 8 (Rollout), com PR4 aprovada em 2026-04-22. Nenhum contrato extraordinário existia para Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional.

Esta PR1 abre formalmente o **Contrato Extraordinário E1** — Módulo de Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional — fora da cadeia de 8 frentes formais, com governança contratual forte, 4 camadas definidas e ordem oficial PR1/PR2/PR3/PR4 persistida.

O próximo passo autorizado é **PR2 — contrato técnico do módulo**, que definirá shapes, vínculos técnicos e regras detalhadas de cada camada.

---

## 2. Classificação da tarefa

governança

---

## 3. Última PR relevante

PR4 da Frente 8 — smoke integrado final + closeout formal do macro ENOVA 2 (estado herdado).

---

## 4. O que a PR anterior fechou

*(Estado herdado do macro — Frente 8 PR4)*

- Frente 8 (Rollout) encerrada formalmente.
- Macro ENOVA 2 concluído em 8 frentes.
- Smoke integrado final 8/8 aprovado.
- Contrato da Frente 8 arquivado em `schema/contracts/archive/CONTRATO_ROLLOUT_2026-04-22.md`.
- Status e handoff do Rollout atualizados para estado encerrado.

---

## 5. O que a PR anterior NÃO fechou

*(Estado herdado do macro — Frente 8 PR4)*

- Contrato extraordinário para Memória, Base Normativa, Regras Comerciais e Aprendizado Operacional.
- Definição formal das 4 camadas do módulo.
- Status/handoff vivos do módulo extraordinário.

---

## 6. Diagnóstico confirmado

1. **Macro ENOVA 2 encerrado na Frente 8:** confirmado via `schema/contracts/_INDEX.md`, `schema/status/ROLLOUT_STATUS.md` e `schema/handoffs/ROLLOUT_LATEST.md`.
2. **Nenhum contrato extraordinário ativo para Memória/Base Normativa/Regras Comerciais/Aprendizado Operacional:** confirmado — `schema/contracts/extraordinary/` não existia antes desta PR1.
3. **Módulo deve nascer fora do macro:** confirmado — não é Frente 9, é Contrato Extraordinário E1 explícito.
4. **Esta PR1 deve apenas abrir o contrato e os vivos, sem código funcional:** confirmado — nenhuma alteração em `src/` nesta PR1.
5. **Estrutura para extraordinários não existia:** criada a estrutura mínima `schema/contracts/extraordinary/` com `_INDEX.md` e `active/`.

---

## 7. O que foi feito

- Criado `schema/contracts/extraordinary/_INDEX.md` — índice canônico de contratos extraordinários.
- Criado `schema/contracts/extraordinary/active/CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL.md` — contrato extraordinário E1 ativo.
- Criado `schema/status/EXTRA_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_STATUS.md` — status vivo do módulo.
- Criado `schema/handoffs/EXTRA_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_LATEST.md` — este handoff vivo.
- Atualizado `schema/status/_INDEX.md` — adicionada entrada do módulo E1.
- Atualizado `schema/handoffs/_INDEX.md` — adicionada entrada do módulo E1.
- Atualizado `schema/contracts/_INDEX.md` — adicionada seção de contratos extraordinários.
- Definidas as 4 camadas (A: Base Normativa, B: Regras Comerciais, C: Memória e Aprendizado, D: Memória Manual/Diretiva).
- Definidos limites de soberania, definições operacionais, regras de evidência, regras normativas, regras comerciais, regras de aprendizado permitido/proibido e regras de memória manual.
- Definida integração com atendimento, CRM e camada cognitiva/cérebro.
- Ordem oficial PR1/PR2/PR3/PR4 persistida no contrato e no índice extraordinário.
- Loop obrigatório persistido no contrato e no índice extraordinário.
- Nenhum código funcional criado.

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
- PR2 (contrato técnico) — pendente, próximo passo autorizado

---

## 9. O que esta PR fechou

- PR1 do Contrato Extraordinário E1: abertura formal do contrato, status/handoff vivos, índices, ordem PR1/PR2/PR3/PR4, loop obrigatório, 4 camadas definidas, limites e regras registradas.

---

## 10. O que continua pendente após esta PR

- PR2 — contrato técnico do módulo (shapes, vínculos técnicos, regras detalhadas)
- PR3 — runtime mínimo
- PR4 — smoke integrado + closeout formal

---

## 11. Esta tarefa foi fora de contrato?

não — esta PR1 É a abertura do contrato extraordinário E1.

---

## 11a. Contrato ativo

`schema/contracts/extraordinary/active/CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL.md`

---

## 11b. Recorte executado do contrato

PR1 — abertura do contrato extraordinário.

---

## 11c. Pendência contratual remanescente

PR2, PR3 e PR4 conforme ordem oficial do contrato.

---

## 11d. Houve desvio de contrato?

não

---

## 11e. Contrato encerrado nesta PR?

não

---

## 12. Arquivos relevantes

- `schema/contracts/extraordinary/_INDEX.md` (criado)
- `schema/contracts/extraordinary/active/CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL.md` (criado)
- `schema/status/EXTRA_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_STATUS.md` (criado)
- `schema/handoffs/EXTRA_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_LATEST.md` (este arquivo — criado)
- `schema/status/_INDEX.md` (atualizado)
- `schema/handoffs/_INDEX.md` (atualizado)
- `schema/contracts/_INDEX.md` (atualizado)

---

## 13. Item do A01 atendido

Pós-macro — contrato extraordinário explícito. O A01 deve ser atualizado na PR2 para registrar formalmente este item.

---

## 14. Estado atual do módulo

contrato aberto

---

## 15. Próximo passo autorizado

**PR2 — Contrato técnico do módulo**

Antes de iniciar PR2, executar obrigatoriamente o loop definido na seção 15 do contrato ativo.

---

## 16. Riscos

- Risco de PR2 crescer em escopo para incluir runtime — mitigação: o contrato proíbe explicitamente runtime em PR2.
- Risco de confundir contrato extraordinário com Frente 9 do macro — mitigação: identificação canônica E1 (não F9) e índice separado em `extraordinary/`.
- Risco de esquecimento do loop obrigatório — mitigação: loop registrado tanto no contrato quanto no índice extraordinário.
- Risco de misturar norma com heurística — mitigação: regras de evidência e distinção de camadas definidas explicitamente no contrato.

---

## 17. Provas

- Arquivos criados verificáveis no repositório.
- Nenhum arquivo em `src/` foi criado ou alterado — confirmado por escopo desta PR1.
- `schema/contracts/extraordinary/_INDEX.md` existe.
- `schema/contracts/extraordinary/active/CONTRATO_EXTRAORDINARIO_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL.md` existe com status `aberto`.
- `schema/status/EXTRA_MEMORIA_BASE_NORMATIVA_REGRAS_COMERCIAIS_E_APRENDIZADO_OPERACIONAL_STATUS.md` existe.
- `schema/status/_INDEX.md` atualizado com linha E1.
- `schema/handoffs/_INDEX.md` atualizado com linha E1.
- `schema/contracts/_INDEX.md` atualizado com seção de extraordinários.

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
  Índice extraordinário lido:  `schema/contracts/extraordinary/_INDEX.md` (criado nesta PR)
  Contrato ativo lido:         Nenhum — ausência confirmada antes da PR1; criado nesta PR1
  Status da frente lido:       `schema/status/ROLLOUT_STATUS.md` (estado herdado do macro)
  Handoff da frente lido:      `schema/handoffs/ROLLOUT_LATEST.md` (estado herdado do macro)
  Status _INDEX lido:          `schema/status/_INDEX.md`
  Handoff _INDEX lido:         `schema/handoffs/_INDEX.md`
  Índice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  N/A — PR1 é de governança/contrato puro
  PDF mestre consultado:       não consultado — PR1 é de governança/contrato puro
  Protocolos lidos:            `schema/CODEX_WORKFLOW.md`, `schema/CONTRACT_SCHEMA.md`, `schema/STATUS_SCHEMA.md`, `schema/HANDOFF_SCHEMA.md`, `schema/DATA_CHANGE_PROTOCOL.md`, `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`, `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`, `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
