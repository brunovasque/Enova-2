# HANDOFF — Contexto, Extração e Memória Viva — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Contexto, Extração e Memória Viva |
| Data | 2026-04-21 |
| Estado da frente | contrato em execução |
| Classificação da tarefa | contratual |
| Última PR relevante | PR 37 — múltiplas informações no mesmo turno |
| Contrato ativo | `schema/contracts/active/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA.md` |
| Recorte executado do contrato | PR 37 — consolidação mínima de múltiplas informações no mesmo turno |
| Pendência contratual remanescente | PRs 38 e 39 |
| Houve desvio de contrato? | não |
| Contrato encerrado nesta PR? | não |
| Item do A01 atendido | Fase 3 — Prioridade 3 — extração multi-intenção sem perder trilho |
| Próximo passo autorizado | PR 38 — memória viva mínima e útil |
| Próximo passo foi alterado? | sim — saiu de “executar PR 37” para “executar PR 38” |
| Tarefa fora de contrato? | não |
| Mudanças em dados persistidos (Supabase) | nenhuma |
| Permissões Cloudflare necessárias | nenhuma adicional |

---

## 1. Contexto curto

A Frente 3 está em execução contratual. A PR 35 abriu o contrato da frente, a PR 36 entregou o schema base de Contexto + Extração Estruturada, e a PR 37 entregou a consolidação mínima de múltiplos sinais no mesmo turno. A camada continua sendo insumo estrutural para Core e Speech, sem autoria de fala, sem decisão de regra e sem persistência oficial.

## 2. O que foi feito

- criado `src/context/schema.ts`
- criado `src/context/smoke.ts`
- adicionado script `npm run smoke:context`
- incluído `smoke:context` em `npm run smoke:all`
- criado `src/context/multi-signal.ts`
- ampliado `src/context/smoke.ts` com smoke específico da PR 37
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

## 3. O que não foi feito

- nenhuma memória viva funcional
- nenhuma persistência real
- nenhuma integração Supabase
- nenhuma integração Meta/WhatsApp
- nenhuma telemetria nova
- nenhum áudio ou multimodalidade
- nenhuma alteração em Worker, Core ou Speech

## 4. O que esta PR fechou

PR 37 — múltiplas informações no mesmo turno.

## 5. O que continua pendente

- PR 38 — memória viva mínima
- PR 39 — acceptance smoke + closeout

## 6. Próximo passo autorizado

PR 38 — memória viva mínima e útil.

## 6.1. Âncora e fontes consultadas

- Contrato ativo: `schema/contracts/active/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA.md`
- A00/A01/A02 lidos.
- Adendo canônico de soberania da IA lido.
- PDF mestre consultado: páginas 122-123, Contrato de Contexto, Extração de Slots e Memória Viva.
- Regra herdada central: extractor captura muita coisa, mas quem oficializa é o Core Mecânico; informação fora de hora pode ser contexto/pré-slot; ambiguidade deve ser confirmada antes de consolidar; quando o cliente disser várias coisas ao mesmo tempo, a ENOVA 2 não deve fingir que ouviu só uma.

## 6.2. Provas executadas

- `npm run smoke:context` — passou, 7/7 cenários.
- `npm run smoke:all` — passou.
- Cenários cobertos:
  - shape canônico do pacote semântico do turno
  - contexto informa Core/Speech sem fala mecânica nem decisão
  - guardrail rejeita autoridade indevida do contexto
  - resposta atual + dúvida no mesmo turno
  - dois dados de perfil no mesmo turno
  - objeção + renda aproximada
  - resposta + medo + pergunta no mesmo texto

## 7. Riscos

- drift para fala mecânica
- drift para persistência da Frente 4
- memória viva virar dump textual
- PR 38 precisa criar memória viva mínima sem virar histórico bruto, prompt inflado ou persistência real da Frente 4

## 8. Mudanças em dados persistidos (Supabase)

Mudanças em dados persistidos (Supabase): nenhuma

## 9. Permissões Cloudflare necessárias

Permissões Cloudflare necessárias: nenhuma adicional
