# HANDOFF — Contexto, Extração e Memória Viva — ENOVA 2

| Campo | Valor |
|---|---|
| Frente | Contexto, Extração e Memória Viva |
| Data | 2026-04-21 |
| Estado da frente | concluída — contrato encerrado formalmente |
| Classificação da tarefa | contratual |
| Última PR relevante | PR 39 — acceptance smoke + closeout da Frente 3 |
| Contrato ativo | Nenhum — contrato anterior encerrado em 2026-04-21 |
| Recorte executado do contrato | PR 39 — acceptance smoke + closeout formal |
| Pendência contratual remanescente | nenhuma |
| Houve desvio de contrato? | não |
| Contrato encerrado nesta PR? | sim |
| Item do A01 atendido | Fase 3 — Prioridade 3 — extração multi-intenção e memória curta úteis concluídas |
| Próximo passo autorizado | abrir o contrato da Frente 4 — Supabase Adapter e Persistência |
| Próximo passo foi alterado? | sim — saiu de “executar PR 39” para “abrir contrato da Frente 4” |
| Tarefa fora de contrato? | não |
| Mudanças em dados persistidos (Supabase) | nenhuma |
| Permissões Cloudflare necessárias | nenhuma adicional |

---

## 1. Contexto curto

A Frente 3 foi encerrada formalmente na PR 39. A PR 35 abriu o contrato, a PR 36 entregou o schema base de Contexto + Extração Estruturada, a PR 37 entregou a consolidação mínima de múltiplos sinais no mesmo turno, a PR 38 entregou memória viva mínima útil e a PR 39 entregou o acceptance smoke final + closeout protocolar.

A camada entregue permanece como insumo estrutural para Core e Speech: não escreve resposta ao cliente, não decide regra de negócio, não avança stage e não persiste slot oficial. A próxima frente autorizada é somente a abertura contratual da Frente 4 — Supabase Adapter e Persistência.

## 2. O que foi feito

- criado `src/context/schema.ts`
- criado `src/context/smoke.ts`
- adicionado script `npm run smoke:context`
- incluído `smoke:context` em `npm run smoke:all`
- criado `src/context/multi-signal.ts`
- criado `src/context/living-memory.ts`
- ampliado `src/context/smoke.ts` com smoke específico da PR 37
- ampliado `src/context/smoke.ts` com smoke específico da PR 38
- ampliado `src/context/smoke.ts` com acceptance smoke final da PR 39
- criado `schema/contracts/closeout/CONTEXTO_EXTRACAO_MEMORIA_VIVA_CLOSEOUT_READINESS.md`
- contrato movido para `schema/contracts/archive/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA_2026-04-21.md`
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

- nenhuma persistência real
- nenhuma integração Supabase
- nenhuma integração Meta/WhatsApp
- nenhuma telemetria nova
- nenhum áudio ou multimodalidade
- nenhuma alteração em Worker, Core ou Speech
- nenhuma abertura de contrato da Frente 4

## 3.1. Detalhe do recorte PR 39

- Acceptance smoke final integrado adicionado ao cenário 11 de `src/context/smoke.ts`.
- O cenário integrado prova:
  - contexto estruturado
  - extração de múltiplos sinais
  - preservação de `current_objective` e `block_advance`
  - memória viva mínima
  - IA soberana na fala por integração com policy/surface da Speech
  - mecânico sem prioridade de fala
- Closeout readiness criado e critérios C1-C7 registrados como cumpridos.
- Contrato ativo arquivado conforme `CONTRACT_CLOSEOUT_PROTOCOL.md`.

## 4. O que esta PR fechou

PR 39 — acceptance smoke + closeout formal da Frente 3.

## 5. O que continua pendente

nenhuma pendência contratual remanescente da Frente 3.

## 6. Próximo passo autorizado

Abrir o contrato da Frente 4 — Supabase Adapter e Persistência.

## 6.1. Âncora e fontes consultadas

- Contrato ativo: `schema/contracts/active/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA.md`
- A00/A01/A02 lidos.
- Adendo canônico de soberania da IA lido.
- PDF mestre consultado: páginas 122-123, Contrato de Contexto, Extração de Slots e Memória Viva.
- Regra herdada central: extractor captura muita coisa, mas quem oficializa é o Core Mecânico; informação fora de hora pode ser contexto/pré-slot; ambiguidade deve ser confirmada antes de consolidar; quando o cliente disser várias coisas ao mesmo tempo, a ENOVA 2 não deve fingir que ouviu só uma.
- Regra aplicada na PR38: memória viva é resumo operativo curto para manter naturalidade e evitar repetição burra; memória estrutural e persistência final pertencem a camadas próprias.

## 6.2. Provas executadas

- `npm run smoke:context` — passou, 11/11 cenários.
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
  - acceptance final integrado da Frente 3 cobrindo C1-C7

## 6.3. Encerramento de contrato

--- ENCERRAMENTO DE CONTRATO ---
Contrato encerrado:                     `schema/contracts/archive/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA_2026-04-21.md`
Contrato encerrado com sucesso?:        sim
Objetivo do contrato cumprido?:         sim — contexto estruturado, multi-sinal, memória viva e acceptance smoke final foram entregues
Critérios de aceite cumpridos?:         sim — C1, C2, C3, C4, C5, C6 e C7 cumpridos
Fora de escopo respeitado?:             sim
Pendências remanescentes:               nenhuma
Evidências / provas do encerramento:    `npm run smoke:context`, `npm run smoke:all`, closeout readiness e PRs 35-39
Data de encerramento:                   2026-04-21
PR que encerrou:                        PR 39 — acceptance smoke + closeout da Frente 3
Destino do contrato encerrado:          archive — `schema/contracts/archive/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA_2026-04-21.md`
Próximo contrato autorizado:            Frente 4 — Supabase Adapter e Persistência

## 7. Riscos

- drift para fala mecânica
- drift para persistência da Frente 4
- memória viva virar dump textual
- risco remanescente passa para a próxima frente: abrir o contrato da Frente 4 sem implementar persistência antes do contrato

## 8. Mudanças em dados persistidos (Supabase)

Mudanças em dados persistidos (Supabase): nenhuma

## 9. Permissões Cloudflare necessárias

Permissões Cloudflare necessárias: nenhuma adicional

## 10. Fontes consultadas como fonte de verdade

Fontes de verdade consultadas:
  Índice de contratos lido:    `schema/contracts/_INDEX.md`
  Contrato ativo lido:         `schema/contracts/active/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA.md` — lido antes do arquivamento; arquivado após closeout em `schema/contracts/archive/CONTRATO_CONTEXTO_EXTRACAO_E_MEMORIA_VIVA_2026-04-21.md`
  Status da frente lido:       `schema/status/CONTEXTO_EXTRACAO_MEMORIA_VIVA_STATUS.md`
  Handoff da frente lido:      `schema/handoffs/CONTEXTO_EXTRACAO_MEMORIA_VIVA_LATEST.md`
  Índice legado consultado:    `schema/legacy/INDEX_LEGADO_MESTRE.md`
  Legado markdown consultado:  `schema/legacy/LEGADO_MESTRE_ENOVA1_ENOVA2.md` — blocos L03, L05 e L19 identificados, não transcritos
  PDF mestre consultado:       `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` — páginas 122-123; apoio nas páginas 7, 14 e 24
