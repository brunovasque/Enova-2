# FRENTE 7 — CONTRATO TECNICO DE OBSERVABILIDADE E TELEMETRIA (PR2)

| Campo | Valor |
|---|---|
| Frente | Telemetria e Observabilidade |
| PR da frente | PR2 — contrato tecnico de observabilidade/telemetria |
| Tipo de entrega | documental tecnica (sem runtime) |
| Runtime nesta PR | nao |
| Integacao externa real nesta PR | nao |
| Dashboard externo obrigatorio nesta PR | nao |
| Ferramenta externa obrigatoria nesta PR | nao |
| Proximo passo alvo | PR3 — runtime minimo de observabilidade no Worker/repo |
| Ultima atualizacao | 2026-04-22 |

---

## 1. Objetivo deste artefato

Fechar o contrato tecnico canonico da Frente 7 antes de qualquer implementacao de runtime, estabelecendo:

- taxonomia de eventos;
- shape minimo de sinais;
- camadas e responsabilidades de observabilidade;
- correlacao/trace obrigatoria no recorte minimo;
- contrato de logs;
- contrato de sintomas, alertas, health e evidencias;
- separacao operacional entre observabilidade minima e observabilidade profunda;
- limites do que a PR3 pode implementar;
- limites do que continua proibido mesmo apos PR3.

## 2. Escopo desta PR2

Incluido nesta PR2:

1. Contrato tecnico de observabilidade/telemetria para a Frente 7.
2. Criticos minimos para PR3 (runtime minimo) e PR4 (smoke integrado + closeout).
3. Limites explicitos de escopo, seguranca e fronteira externa.

Fora de escopo desta PR2:

- implementacao de hooks/emissores;
- alteracao de `src/`, `package.json`, `wrangler.toml` ou scripts de runtime;
- deploy/manual publish;
- dashboard externo;
- pipeline externa obrigatoria;
- secrets, bindings, vars;
- Meta real, Supabase real novo/produtivo, rollout real.

## 3. Convencao canonica de eventos

Padrao de nome:

`f7.<layer>.<category>.<action>`

Regras:

1. Sempre lowercase com ponto como separador.
2. `layer` obrigatoria deve refletir a camada emissora real.
3. `category` deve existir na taxonomia da secao 4.
4. `action` deve ser verbo objetivo (`received`, `validated`, `blocked`, `emitted`, `completed`, `failed`).
5. Nao usar nomes semanticos vagos como `event.generic`, `unknown`, `misc`.

## 4. Taxonomia minima de eventos (canonica)

| Categoria canonica | Finalidade | Exemplo de evento | Severidade padrao |
|---|---|---|---|
| `request_lifecycle` | Ciclo de entrada/saida de requisicao | `f7.worker.request_lifecycle.received` | info |
| `decision_transition` | Avaliacao de decisao e transicao de stage/objetivo | `f7.core.decision_transition.evaluated` | info |
| `validation_failure` | Falha de validacao de contrato/entrada | `f7.worker.validation_failure.detected` | warn |
| `contract_symptom` | Sintoma contratual de desvio ou quebra de regra | `f7.governance.contract_symptom.raised` | warn |
| `runtime_guard` | Bloqueio protetivo de runtime minimo | `f7.worker.runtime_guard.blocked` | warn |
| `smoke_evidence` | Evidencia tecnica de teste/smoke | `f7.smoke.smoke_evidence.recorded` | info |
| `external_boundary_blocked` | Tentativa bloqueada em fronteira externa proibida | `f7.channel.external_boundary_blocked.enforced` | warn |
| `health_signal` | Snapshot de saude tecnica do recorte | `f7.worker.health_signal.reported` | info |
| `persistence_signal` | Sinal tecnico de persistencia quando houver camada envolvida | `f7.adapter.persistence_signal.observed` | info |
| `channel_signal` | Sinal tecnico de canal sem integracao real | `f7.channel.channel_signal.accepted` | info |

Observacao: esta taxonomia e minima. PR3 implementa o recorte minimo necessario. PR4 valida aderencia, consistencia e ausencia de drift.

## 5. Envelope minimo de sinais (obrigatorio)

### 5.1 Campos obrigatorios em todo evento

| Campo | Tipo | Obrigatorio | Regra |
|---|---|---|---|
| `event_name` | string | sim | Deve seguir secao 3 |
| `event_version` | string | sim | Inicial `f7.v1` |
| `layer` | string | sim | `worker`, `core`, `speech`, `context`, `adapter`, `channel`, `smoke`, `governance` |
| `source` | string | sim | Origem concreta (arquivo/modulo/processo) |
| `contract_front` | string | sim | Valor fixo `front7_telemetria_observabilidade` |
| `trace_id` | string | sim | Identificador principal de rastreio fim a fim |
| `severity` | string | sim | `info`, `warn`, `error`, `critical` |
| `outcome` | string | sim | `accepted`, `rejected`, `blocked`, `completed`, `failed`, `observed` |
| `timestamp` | string (ISO 8601) | sim | Data/hora de emissao |

### 5.2 Campos condicionais obrigatorios

| Campo | Quando obrigatorio | Regra |
|---|---|---|
| `correlation_id` | evento associado a cadeia multietapa ou retry | Deve agrupar eventos correlatos de uma mesma intencao operacional |
| `request_id` | camada `worker` em entrada HTTP | Identificador unico da requisicao tecnica |
| `execution_id` | camada `core` em avaliacao de decisao/transicao | Identificador unico da execucao de decisao |
| `lead_ref` | quando houver referencia de lead/caso | Nunca inventar valor se nao existir |
| `symptom_code` | categorias `validation_failure`, `contract_symptom`, `runtime_guard` | Codigo curto e estavel da anomalia |
| `evidence_ref` | categoria `smoke_evidence` | Identificador do artefato de prova |
| `health_status` | categoria `health_signal` | `healthy`, `degraded`, `unhealthy` |
| `boundary_ref` | categoria `external_boundary_blocked` | Fronteira bloqueada (`meta_real`, `dashboard_externo`, etc.) |

### 5.3 Campos opcionais controlados

| Campo | Tipo | Regra |
|---|---|---|
| `details` | objeto | Apenas dados tecnicos nao sensiveis |
| `component` | string | Nome do componente emissor |
| `evidence_type` | string | Tipo da evidencia (`smoke_log`, `contract_check`, `assertion`) |
| `retry_count` | integer | Somente quando aplicavel |

## 6. Camadas de observabilidade e responsabilidade minima

| Camada | Escopo de observacao | Minimo esperado no recorte da PR3 |
|---|---|---|
| Worker/runtime | Entrada HTTP tecnica, validacao estrutural, bloqueios de guarda | Eventos `request_lifecycle`, `validation_failure`, `runtime_guard`, `health_signal` |
| Core | Decisao, transicao, bloqueio de regra | Eventos `decision_transition` e sinais de outcome |
| Speech | Contrato de surface e soberania de fala | Sinais tecnicos de conformidade, sem texto de cliente em log bruto |
| Contexto/memoria | Qualidade estrutural de contexto e pendencias | Sinais de consistencia, nao de conteudo sensivel |
| Adapter/persistencia | Integridade tecnica da escrita/leitura quando aplicavel | `persistence_signal` sem abrir persistencia nova nesta PR2 |
| Canal | Fronteira tecnica do canal | `channel_signal` e `external_boundary_blocked` |
| Smoke/testes | Provas de aderencia contratual | `smoke_evidence` com `evidence_ref` rastreavel |
| Governanca/contrato | Conformidade contratual e de escopo | `contract_symptom` para drift e violacao de limite |

Separacao obrigatoria:

- observabilidade de arquitetura: integridade tecnica das camadas e contratos;
- observabilidade de produto: comportamento real de uso/operacao externa (fora do recorte minimo desta frente, salvo sinais tecnicos locais).

## 7. Contrato de correlacao e trace

### 7.1 Definicoes

- `trace_id`: fio principal de rastreio entre camadas.
- `correlation_id`: agrupador de eventos da mesma intencao operacional (inclui retry).
- `request_id`: unidade da requisicao tecnica recebida pelo Worker.
- `execution_id`: unidade de avaliacao da logica de decisao.
- `session_id`: opcional, somente quando existir sessao tecnica definida.

### 7.2 Regras de propagacao minima (obrigatorias na PR3)

1. Se o ingresso nao trouxer `trace_id`, a camada de entrada gera um e propaga sem mutacao.
2. `trace_id` nao pode ser sobrescrito por camadas seguintes.
3. `correlation_id` deve ser mantido entre eventos do mesmo fluxo logico.
4. `request_id` deve aparecer em eventos de entrada/saida HTTP do Worker.
5. `execution_id` deve aparecer em eventos de decisao/transicao do Core.
6. `symptom_code`, `evidence_ref` e `health_status` devem sempre carregar `trace_id`.

## 8. Contrato de logs tecnicos

### 8.1 Formato minimo

- Log estruturado em JSON (um evento por entrada logica).
- Deve conter os campos obrigatorios da secao 5.
- Deve distinguir log tecnico, sintoma e evidencia.

### 8.2 O que pode ser logado

- codigos de erro/sintoma;
- ids tecnicos de correlacao;
- outcome tecnico;
- metadados de camada/componente;
- referencia de evidencia (`evidence_ref`);
- estado de fronteira bloqueada.

### 8.3 O que nao pode ser logado

- segredo/token/chave/credencial;
- payload sensivel bruto que exponha dado pessoal nao necessario;
- resposta final ao cliente como texto livre em log tecnico;
- dump integral de objetos com risco de vazamento.

### 8.4 Regra minima de redaction

1. Campos potencialmente sensiveis devem ser mascarados no log tecnico.
2. Nao registrar segredo mesmo em ambiente local.
3. Em caso de necessidade diagnostica, registrar apenas referencia (`evidence_ref`) em vez de conteudo bruto.

### 8.5 Distincao obrigatoria

- log tecnico: registro operacional de execucao;
- sintoma: anomalia classificada com `symptom_code` e severidade;
- evidencia: prova rastreavel de teste/aceite (ex.: smoke), referenciada por `evidence_ref`.

## 9. Contrato de sintomas, alertas, health e evidencias

### 9.1 Definicoes formais

- sintoma: indicio tecnico de desvio em regra de contrato, validacao ou guarda.
- alerta: sintoma com severidade `error` ou `critical`; nesta frente, alerta e interno (sem dispatch externo).
- health signal: pulso de saude tecnica do recorte (`healthy`, `degraded`, `unhealthy`).
- evidencia: artefato verificavel de prova de comportamento esperado.

### 9.2 Minimo que a PR3 deve conseguir emitir

1. Pelo menos 1 evento de `request_lifecycle` por requisicao tecnica processada.
2. Pelo menos 1 evento de `decision_transition` quando houver avaliacao do Core.
3. Evento de `validation_failure` quando entrada/envelope falhar.
4. Evento de `runtime_guard` quando limite tecnico bloquear acao fora de escopo.
5. Evento de `external_boundary_blocked` para bloqueio de integracao externa proibida.
6. Evento de `health_signal` para snapshot tecnico minimo.
7. Evento de `smoke_evidence` durante smoke da frente.

### 9.3 O que pode ser provado so no repo

- shape de eventos e logs;
- propagacao minima de ids de correlacao;
- emissao de sintomas/health/evidencias em recorte local;
- bloqueio tecnico de fronteiras externas proibidas.

### 9.4 O que depende de ambiente externo (fora da PR3/PR4)

- alerta operacional em ferramenta externa;
- dashboard externo real;
- pipeline externa obrigatoria;
- integracao real Meta ou nova ativacao Supabase produtiva;
- evidencia de runtime publicado fora do repo.

## 10. Observabilidade minima vs observabilidade profunda

| Camada de capacidade | Estado nesta frente |
|---|---|
| Observabilidade minima (repo/runtime local) | entra na Frente 7 |
| Observabilidade profunda externa (dashboard real, alerta real, pipeline externa) | nao entra automaticamente; exige autorizacao/contrato proprio quando depender de ambiente externo |

## 11. Limites tecnicos da PR3 (autorizado)

A PR3 pode:

1. implementar hooks minimos;
2. emitir sinais minimos conforme este contrato;
3. criar smoke minimo aderente ao contrato;
4. provar bloqueios de fronteira externa proibida;
5. manter escopo tecnico local/repo.

A PR3 nao pode:

- abrir dashboard externo;
- exigir ferramenta externa obrigatoria;
- abrir deploy externo/manual;
- abrir telemetria profunda externa;
- alterar soberania do Core/IA;
- abrir Meta real, Supabase real novo/produtivo ou rollout real.

## 12. Criterios tecnicos de aceite para PR4

PR4 deve validar, no minimo:

1. aderencia da emissao ao envelope da secao 5;
2. aderencia da taxonomia da secao 4;
3. propagacao minima de `trace_id` e ids condicionais;
4. distincoes corretas entre log/sintoma/evidencia;
5. provas de health signal e smoke evidence;
6. prova de limites preservados (sem dashboard externo, sem ferramenta externa obrigatoria, sem integracao externa real);
7. integridade das frentes anteriores sem drift.

## 13. O que continua proibido mesmo depois da PR3

- dashboard externo real sem autorizacao especifica;
- ferramenta externa obrigatoria sem autorizacao especifica;
- abertura de secrets/bindings/vars fora de protocolo;
- deploy/manual publish fora de escopo autorizado;
- Meta real, Supabase real novo/produtivo e rollout real sem contrato extraordinario;
- telemetria profunda externa sem contrato proprio.

## 14. Fontes de verdade desta PR2

- `schema/contracts/active/CONTRATO_TELEMETRIA_E_OBSERVABILIDADE.md`
- `schema/contracts/_INDEX.md`
- `schema/status/TELEMETRIA_E_OBSERVABILIDADE_STATUS.md`
- `schema/handoffs/TELEMETRIA_E_OBSERVABILIDADE_LATEST.md`
- `schema/A00_PLANO_CANONICO_MACRO.md`
- `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
- `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
- `schema/CLOUDFLARE_RUNTIME_AUDIT_2026-04-22.md`
- `schema/legacy/INDEX_LEGADO_MESTRE.md` (L18 obrigatorio; L03 complementar)
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf` (blocos nao transcritos em markdown)
