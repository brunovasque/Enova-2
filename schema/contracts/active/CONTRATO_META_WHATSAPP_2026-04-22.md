# CONTRATO — FRENTE 6 — META/WHATSAPP — ENOVA 2

| Campo                             | Valor |
|-----------------------------------|-------|
| Frente                            | Meta/WhatsApp |
| Fase do A01                       | Prioridade 6 (plugar canal Meta/WhatsApp e operacionalizar entrada/saída real) |
| Prioridade do A01                 | Prioridade 6 |
| Dependencias                      | Frentes 1, 2, 3, 4 e 5 encerradas |
| Legados aplicaveis                | L18 (obrigatorio), C* (complementar, quando confirmado por PDF) |
| Referencias obrigatorias          | A00, A01, A02, CODEX_WORKFLOW, CONTRACT_EXECUTION_PROTOCOL, CONTRACT_CLOSEOUT_PROTOCOL, CONTRACT_SCHEMA, STATUS_SCHEMA, HANDOFF_SCHEMA, CLOUDFLARE_PERMISSION_PROTOCOL, REQUEST_ECONOMY_PROTOCOL, CLOUDFLARE_RUNTIME_AUDIT_2026-04-22, schema/meta/FRENTE6_CHANNEL_ENVELOPE_CONTRACT.md |
| Blocos legados obrigatorios       | L18 |
| Blocos legados complementares     | C* (pendente de confirmacao por leitura direta do PDF) |
| Ordem minima de leitura da frente | A00 -> A01 -> A02 -> contracts/_INDEX -> este contrato -> status/handoff da frente -> L18 (PDF) |
| Status                            | Em execucao |
| Ultima atualizacao                | 2026-04-22 |

---

## 1. Objetivo

Abrir e executar, em recortes curtos e seguros, a Frente 6 de canal Meta/WhatsApp da ENOVA 2, mantendo soberania preservada:

- Core continua soberano de regra/decisao;
- IA continua soberana da fala final;
- camada de canal apenas transporta envelope tecnico e eventos;
- nenhuma integracao real e completa de canal entra sem ordem contratual.

## 2. Escopo

1. Definir contrato operacional da frente e ordem oficial de PRs (PR1 a PR4).
2. Definir shape tecnico canonico de entrada/saida de canal antes de runtime real.
3. Definir limites entre canal, Core, Speech e Adapter.
4. Definir regras minimas de idempotencia, retry, ack, erro e logs no recorte do canal.
5. Implementar runtime minimo no Worker apenas no recorte autorizado da PR3.
6. Executar smoke integrado e closeout formal na PR4.

## 3. Fora de escopo

- STT/TTS real
- audio/multimodalidade plena
- telemetria profunda da Frente 7
- rollout/shadow/canary da Frente 8
- mudancas de regra de negocio no Core
- surface final alternativa ou fala mecanica
- bindings/secrets/vars/routes fora do recorte da PR3
- qualquer mistura de PR2/PR3/PR4 antes da hora

## 4. Dependencias

- Frente 5 encerrada com pendencia contratual zero.
- `schema/CLOUDFLARE_RUNTIME_AUDIT_2026-04-22.md` como limite canônico entre repo e runtime publicado.
- Gate 1 do A01 (contrato aberto) e Gate 2 do A01 (smoke para promocao da frente).

## 5. Entradas

- `schema/contracts/_INDEX.md` com Frente 6 aguardando abertura (estado anterior).
- `schema/status/AUDIO_E_MULTIMODALIDADE_STATUS.md` e `schema/handoffs/AUDIO_E_MULTIMODALIDADE_LATEST.md` confirmando closeout da Frente 5.
- legado aplicavel L18 consultado por PDF, pois bloco nao transcrito no markdown.

## 6. Saidas

- contrato ativo da Frente 6 aberto e versionado no repo;
- ordem oficial PR1/PR2/PR3/PR4 persistida no contrato e nos vivos;
- loop obrigatorio de consulta antes de cada tarefa da frente, persistido no repo;
- status e handoff vivos da Frente 6 criados e atualizados para PR3;
- contrato tecnico de envelope da PR2 persistido em `schema/meta/FRENTE6_CHANNEL_ENVELOPE_CONTRACT.md`;
- runtime minimo da PR3 persistido no Worker com rota tecnica `/__meta__/ingest`;
- proxima acao autorizada explicitada: PR4.

## 7. Criterios de aceite

C1. Contrato ativo da Frente 6 aberto em `schema/contracts/active/`.  
C2. Ordem PR1/PR2/PR3/PR4 registrada explicitamente no repo.  
C3. Loop obrigatorio de consulta registrado explicitamente no repo.  
C4. `schema/contracts/_INDEX.md` atualizado com estado contratual corrente da Frente 6.  
C5. `schema/status/META_WHATSAPP_STATUS.md` criado e atualizado conforme o recorte executado.  
C6. `schema/handoffs/META_WHATSAPP_LATEST.md` criado e atualizado conforme o recorte executado.  
C7. `schema/status/_INDEX.md` e `schema/handoffs/_INDEX.md` atualizados.  
C8. Nenhuma implementacao real de canal nas PR1/PR2.  
C9. Proximo passo autorizado claro e sem ambiguidade, conforme estado atual da frente.

## 8. Provas obrigatorias

- diff dos arquivos vivos e do contrato ativo;
- diff do documento da PR2: `schema/meta/FRENTE6_CHANNEL_ENVELOPE_CONTRACT.md`;
- `git status`, branch, SHA e push no mesmo branch;
- `git remote -v` e link de commit nao-404;
- validacao de que nenhum arquivo de runtime funcional de canal foi alterado nesta PR1/PR2.

## 9. Bloqueios

- ausencia de leitura do contrato/status/handoff antes da execucao;
- tentativa de pular ordem de PRs da frente;
- tentativa de abrir runtime real fora da PR3;
- tentativa de misturar rollout/telemetria/Meta completa na mesma PR.

## 10. Proximo passo autorizado

**PR4 — smoke integrado + closeout formal da Frente 6.**

## 11. Relacao com o A01

- Item atendido: **Prioridade 6** (Meta/WhatsApp).
- PR1 abriu governanca da frente sem runtime.
- PR2 executa recorte contratual documental de envelope sem runtime.

## 12. Relacao com legados aplicaveis

- Obrigatorio: **L18** (runner/QA/telemetria) como base de prova, checklist e criterios operacionais da frente.
- Complementar: **C*** somente quando confirmado por leitura direta do PDF mestre.

## 13. Referencias obrigatorias do contrato

- `schema/A00_PLANO_CANONICO_MACRO.md`
- `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
- `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
- `schema/CODEX_WORKFLOW.md`
- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
- `schema/CONTRACT_SCHEMA.md`
- `schema/STATUS_SCHEMA.md`
- `schema/HANDOFF_SCHEMA.md`
- `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`
- `schema/REQUEST_ECONOMY_PROTOCOL.md`
- `schema/CLOUDFLARE_RUNTIME_AUDIT_2026-04-22.md`
- `schema/meta/FRENTE6_CHANNEL_ENVELOPE_CONTRACT.md`
- `schema/legacy/INDEX_LEGADO_MESTRE.md`
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`

## 14. Blocos legados aplicaveis

- obrigatorio: L18
- complementar: C*

## 15. Ordem minima de leitura da frente

1. `schema/contracts/_INDEX.md`
2. contrato ativo da Frente 6 (`schema/contracts/active/CONTRATO_META_WHATSAPP_2026-04-22.md`)
3. status vivo da Frente 6
4. handoff vivo da Frente 6
5. ordem oficial de PRs da frente (seção 16 deste contrato)
6. legado L18 (PDF mestre, enquanto nao houver transcricao no markdown)

## 16. PRs oficiais da Frente 6 (ordem imutavel)

### PR1 — abertura do micro contrato da Frente 6

- abrir contrato, status, handoff e indices vivos;
- registrar ordem oficial da frente e loop obrigatorio;
- sem runtime de canal.

### PR2 — contrato tecnico do canal / envelope de integracao

- shape canonico inbound/outbound;
- eventos aceitos;
- limites entre canal, Core, Speech e Adapter;
- idempotencia, retry, ack, erro e logs minimos;
- persistencia do contrato tecnico em `schema/meta/FRENTE6_CHANNEL_ENVELOPE_CONTRACT.md`;
- sem Meta real ainda.

### PR3 — runtime minimo do canal no Worker

- rota tecnica minima no Worker;
- validacao de metodo/path/body;
- resposta tecnica controlada;
- primeiro recorte real Cloudflare apenas se necessario e declarado;
- sem rollout e sem telemetria profunda.

### PR4 — smoke integrado + closeout da Frente 6

- smoke do recorte contratado;
- prova de soberania preservada;
- prova de ack/erro/limites;
- closeout formal da frente se criterios forem cumpridos.

## 17. Loop obrigatorio antes de cada tarefa da Frente 6

Nenhuma tarefa da Frente 6 pode iniciar sem cumprir este loop:

1. Ler `schema/contracts/_INDEX.md`.
2. Ler o contrato ativo da Frente 6.
3. Ler o status vivo da Frente 6.
4. Ler o handoff vivo da Frente 6.
5. Confirmar em qual PR oficial (PR1/PR2/PR3/PR4) a tarefa se encaixa.
6. Se a tarefa nao encaixar na ordem oficial, parar e abrir revisao contratual.

Regras:

- proibido pular ordem;
- proibido misturar recortes de PRs diferentes;
- proibido abrir escopo fora do contrato sem revisao explicita.

## 18. Riscos e dependencias Cloudflare (sem implementacao em PR1/PR2)

R1. Falso senso de integracao real sem prova externa de runtime publicado.  
Mitigacao: seguir limites da auditoria `schema/CLOUDFLARE_RUNTIME_AUDIT_2026-04-22.md`.

R2. Abrir webhook real cedo demais (antes da PR3).  
Mitigacao: ordem imutavel PR1->PR2->PR3->PR4 e loop obrigatorio.

R3. Necessidade futura de permissao Cloudflare para rota/secrets no recorte de PR3.  
Mitigacao: declaracao obrigatoria via `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` quando chegar a PR3.

## 19. Estado inicial do contrato

- Estado da frente ao abrir: **contrato aberto**
- Mudancas em dados persistidos (Supabase): **nenhuma**
- Permissoes Cloudflare necessarias: **nenhuma adicional nesta PR1**

## 20. Estado apos execucao da PR2

- Estado da frente: **em execucao**
- Recorte executado nesta PR2: **contrato tecnico do canal/envelope de integracao**
- Artefato documental da PR2: `schema/meta/FRENTE6_CHANNEL_ENVELOPE_CONTRACT.md`
- Mudancas em dados persistidos (Supabase): **nenhuma**
- Permissoes Cloudflare necessarias: **nenhuma adicional**

## 21. Estado apos execucao da PR3

- Estado da frente: **em execucao**
- Recorte executado nesta PR3: **runtime minimo do canal no Worker**
- Runtime tecnico criado: `POST /__meta__/ingest`
- Artefatos de runtime da PR3:
  - `src/meta/types.ts`
  - `src/meta/validate.ts`
  - `src/meta/ingest.ts`
  - `src/meta/smoke.ts`
  - `src/worker.ts`
  - `package.json`
- Validacoes implementadas: metodo, path dedicado, JSON obrigatorio, shape inbound do envelope, campos obrigatorios, timestamps ISO, evento inbound aceito pelo contrato da PR2.
- Resposta tecnica: aceite `202` com `accepted: true`, `mode: technical_only`, correlacao (`trace_id`, `idempotency_key`, `event_id`, `lead_ref`) e declaracao explicita de ausencia de integracao real Meta.
- Sem Meta real, sem chamada externa, sem persistencia nova, sem binding/secret/var/route externo, sem rollout e sem telemetria profunda.
- Proximo passo autorizado: **PR4 — smoke integrado + closeout formal da Frente 6**.
- Mudancas em dados persistidos (Supabase): **nenhuma**
- Permissoes Cloudflare necessarias: **nenhuma adicional**

