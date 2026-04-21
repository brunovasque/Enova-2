# HANDOFF — Contexto, Extração e Memória Viva — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Contexto, Extração e Memória Viva |
| Data | 2026-04-21 |
| Estado da frente | contrato em execução |
| Classificação da tarefa | contratual |
| Última PR relevante | PR 38 — memória viva mínima e útil |
| Contrato ativo | `schema/contracts/active/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA.md` |
| Recorte executado do contrato | PR 38 — memória viva mínima e útil |
| Pendência contratual remanescente | PR 39 — acceptance smoke + closeout |
| Houve desvio de contrato? | não |
| Contrato encerrado nesta PR? | não |
| Item do A01 atendido | Fase 3 — Prioridade 3 — memória curta útil sem perder trilho |
| Próximo passo autorizado | PR 39 — acceptance smoke + closeout da Frente 3 |
| Próximo passo foi alterado? | sim — saiu de “executar PR 38” para “executar PR 39” |
| Tarefa fora de contrato? | não |
| Mudanças em dados persistidos (Supabase) | nenhuma |
| Permissões Cloudflare necessárias | nenhuma adicional |

---

## 1. Contexto curto

A Frente 3 está em execução contratual. A PR 35 abriu o contrato da frente, a PR 36 entregou o schema base de Contexto + Extração Estruturada, a PR 37 entregou a consolidação mínima de múltiplos sinais no mesmo turno e a PR 38 entregou memória viva mínima útil. A camada continua sendo insumo estrutural para Core e Speech, sem autoria de fala, sem decisão de regra e sem persistência oficial.

## 2. O que foi feito

- criado `src/context/schema.ts`
- criado `src/context/smoke.ts`
- adicionado script `npm run smoke:context`
- incluído `smoke:context` em `npm run smoke:all`
- criado `src/context/multi-signal.ts`
- criado `src/context/living-memory.ts`
- ampliado `src/context/smoke.ts` com smoke específico da PR 37
- ampliado `src/context/smoke.ts` com smoke específico da PR 38
- atualizado `schema/contracts/_INDEX.md`
- atualizado `schema/status/CONTEXTO_EXTRACAO_MEMORIA_VIVA_STATUS.md`
- atualizado `schema/handoffs/CONTEXTO_EXTRACAO_MEMORIA_VIVA_LATEST.md`

## 2.1. Detalhe do recorte PR 36

- Pacote semântico único do turno definido.
- Shape de sinais extraídos definido.
- Categorias canônicas separadas: facts, intents, questions, objections, slot_candidates, pending, ambiguities, evidence e confidence.
- Guardrails estruturais definidos:
  - contexto pode informar Core
  - contexto pode informar LLM/Speech
  - contexto não escreve resposta ao cliente
  - contexto não decide regra de negócio
  - contexto não avança stage
  - contexto não persiste slot oficial

## 2.2. Detalhe do recorte PR 37

- Turno composto com múltiplos sinais consolidado sem colapsar em string solta.
- Sinais separados em buckets estruturais:
  - `accepted`
  - `pending`
  - `requires_confirmation`
- `current_objective`, `block_advance` e `gates_activated` preservados do contexto estrutural recebido.
- Resultado criado para informar Core e IA sem virar decisão autônoma nem surface mecânica.
- Casos de smoke cobertos:
  - cliente responde a pergunta atual e faz uma dúvida junto
  - cliente informa dois dados de perfil no mesmo turno
  - cliente traz objeção + dado de renda
  - cliente mistura resposta, medo e pergunta no mesmo texto

## 2.3. Detalhe do recorte PR 38

- Memória viva mínima criada como resumo operativo curto para o próximo raciocínio.
- Categorias permitidas modeladas:
  - dúvida aberta
  - objeção em aberto
  - contexto útil
  - pendência do próximo turno
  - preferência/constrangimento útil de conversa
- Categorias proibidas rejeitadas:
  - transcript bruto
  - resposta final anterior inteira
  - estado estrutural do Core
  - slot oficial
  - persistência de banco
- A memória viva pode informar Core e IA, mas não escreve fala, não decide regra, não avança stage, não oficializa slot e não assume Supabase.
- Casos de smoke cobertos:
  - consolidação de sinais úteis para o próximo turno
  - rejeição de histórico bruto, prompt inflado e persistência
  - preservação do Core e ausência de dependência Supabase

## 3. O que não foi feito

- nenhuma acceptance smoke / closeout da PR39
- nenhuma persistência real
- nenhuma integração Supabase
- nenhuma integração Meta/WhatsApp
- nenhuma telemetria nova
- nenhum áudio ou multimodalidade
- nenhuma alteração em Worker, Core ou Speech

## 4. O que esta PR fechou

PR 38 — memória viva mínima e útil.

## 5. O que continua pendente

- PR 39 — acceptance smoke + closeout

## 6. Próximo passo autorizado

PR 39 — acceptance smoke + closeout da Frente 3.

## 6.1. Âncora e fontes consultadas

- Contrato ativo: `schema/contracts/active/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA.md`
- A00/A01/A02 lidos.
- Adendo canônico de soberania da IA lido.
- PDF mestre consultado: páginas 122-123, Contrato de Contexto, Extração de Slots e Memória Viva.
- Regra herdada central: extractor captura muita coisa, mas quem oficializa é o Core Mecânico; informação fora de hora pode ser contexto/pré-slot; ambiguidade deve ser confirmada antes de consolidar; quando o cliente disser várias coisas ao mesmo tempo, a ENOVA 2 não deve fingir que ouviu só uma.
- Regra aplicada na PR38: memória viva é resumo operativo curto para manter naturalidade e evitar repetição burra; memória estrutural e persistência final pertencem a camadas próprias.

## 6.2. Provas executadas

- `npm run smoke:context` — passou, 10/10 cenários.
- `npm run smoke:all` — passou.
- Cenários cobertos:
  - shape canônico do pacote semântico do turno
  - contexto informa Core/Speech sem fala mecânica nem decisão
  - guardrail rejeita autoridade indevida do contexto
  - resposta atual + dúvida no mesmo turno
  - dois dados de perfil no mesmo turno
  - objeção + renda aproximada
  - resposta + medo + pergunta no mesmo texto
  - memória viva consolida sinais úteis para próximo turno
  - memória viva rejeita histórico bruto, prompt inflado e persistência
  - memória viva informa sem substituir Core nem Supabase

## 7. Riscos

- drift para fala mecânica
- drift para persistência da Frente 4
- memória viva virar dump textual
- PR 39 precisa executar acceptance smoke + closeout sem abrir persistência real da Frente 4

## 8. Mudanças em dados persistidos (Supabase)

Mudanças em dados persistidos (Supabase): nenhuma

## 9. Permissões Cloudflare necessárias

Permissões Cloudflare necessárias: nenhuma adicional

## 10. Fontes consultadas como fonte de verdade

Fontes de verdade consultadas:
  Índice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA.md`
  Status da frente lido:       `schema/status/CONTEXTO_EXTRACAO_MEMORIA_VIVA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/CONTEXTO_EXTRACAO_MEMORIA_VIVA_LATEST.md`
  Índice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos L03, L05 e L19 identificados, não transcritos
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — páginas 122-123; apoio nas páginas 7, 14 e 24
