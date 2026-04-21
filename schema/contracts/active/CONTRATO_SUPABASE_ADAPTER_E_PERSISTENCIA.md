# CONTRATO — FRENTE 4 — SUPABASE ADAPTER E PERSISTENCIA — ENOVA 2

| Campo                             | Valor |
|-----------------------------------|-------|
| Frente                            | Supabase Adapter e Persistencia |
| Fase do A01                       | Fase 2 (fundacao operacional texto-puro) |
| Prioridade do A01                 | Prioridade 4 |
| Dependencias                      | Frente 1 encerrada; Frente 2 encerrada; Frente 3 encerrada |
| Legados aplicaveis                | L03 (obrigatorio), L18 (obrigatorio), L19 (complementar quando recorte exigir) |
| Referencias obrigatorias          | A00, A01, A02, A00-ADENDO-01, CONTRACT_EXECUTION_PROTOCOL, CONTRACT_CLOSEOUT_PROTOCOL, CONTRACT_SCHEMA, INDEX_LEGADO_MESTRE, PDF mestre |
| Blocos legados obrigatorios       | L03, L18 |
| Blocos legados complementares     | L19, L01, L02, C* quando confirmados por PDF |
| Ordem minima de leitura da frente | A00 -> A01 -> A00-ADENDO-01 -> A02 -> este contrato -> L03 -> L18 -> L19 (quando aplicavel) |
| Status                            | Aberto |
| Ultima atualizacao                | 2026-04-21 |

---

## 1. Identificacao canonica

- Nome da frente: **Frente 4 — Supabase Adapter e Persistencia**
- Classificacao: **governanca/contratual de abertura**
- Estado inicial do contrato: **aberto**
- Data de abertura: **2026-04-21**
- Precedencia aplicada: **A00 > A01 > A00-ADENDO-01 > A02 > CONTRACT_EXECUTION_PROTOCOL > este contrato > legados aplicaveis**
- Frente predecessora: **Frente 3 — Contexto, Extracao Estruturada e Memoria Viva (encerrada na PR39)**
- Proxima frente apos closeout esperado: **Frente 5 — Audio e Multimodalidade**

## 2. Base documental obrigatoria

Este contrato so pode ser executado com leitura integral de:

- `schema/A00_PLANO_CANONICO_MACRO.md`
- `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md`
- `schema/A02_INDICE_MESTRE_GUIA_DE_ENVIO.md`
- `schema/CODEX_WORKFLOW.md`
- `schema/ADENDO_CANONICO_SOBERANIA_IA.md`
- `schema/contracts/_INDEX.md`
- `schema/contracts/CONTRACT_EXECUTION_PROTOCOL.md`
- `schema/contracts/CONTRACT_CLOSEOUT_PROTOCOL.md`
- `schema/CONTRACT_SCHEMA.md`
- `schema/STATUS_SCHEMA.md`
- `schema/HANDOFF_SCHEMA.md`
- `schema/legacy/INDEX_LEGADO_MESTRE.md`
- `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`
- `schema/status/CONTEXTO_EXTRACAO_MEMORIA_VIVA_STATUS.md`
- `schema/handoffs/CONTEXTO_EXTRACAO_MEMORIA_VIVA_LATEST.md`
- `schema/data/FRENTE4_SUPABASE_ADAPTER_PERSISTENCIA_SCHEMA_CANONICO.md`

## 3. Objetivo imutavel do contrato

Esta frente existe para definir, provar e consolidar a camada de persistencia governada da ENOVA 2 por meio do Supabase Adapter, com separacao explicita entre:

- estado soberano de decisao (Core)
- fala soberana (IA)
- persistencia estrutural auditavel (Adapter)

Objetivo operacional final:

> Ter um Supabase Adapter canonico, idempotente e auditavel, capaz de persistir cliente/lead, contexto estruturado, sinais extraidos, memoria viva, documentos, dossie, visita/agendamento e historico operacional util, sem dar autoria de fala ao mecanico e sem substituir a soberania do Core nas regras.

## 4. Item do A01 atendido

- **Prioridade 4**
- **Item:** criar Supabase Adapter com namespace novo, persistencia explicavel e trilho de compatibilidade com a ENOVA 1
- **Sai quando:** houver persistencia canonica com consistencia, replay seguro e closeout formal da frente

## 5. Relacao com A00 e adendo de soberania

Esta frente implementa no A00 os componentes:

- `Persistence Adapter`
- parte de `Telemetry Layer` estritamente ligada a rastreabilidade de escrita

Regra-matriz permanente:

- IA continua soberana na fala
- Core continua soberano nas regras e no stage
- Adapter persiste e projeta, nunca fala e nunca decide regra de negocio

## 6. Principios obrigatorios da frente

1. **Separacao de soberanias:** Core decide regra; IA fala; Adapter persiste.
2. **Persistencia com contrato:** nenhuma escrita fora de shape canonico.
3. **Idempotencia por turno:** reprocessar nao pode corromper estado.
4. **Auditabilidade:** toda escrita relevante deve guardar evidencias.
5. **Compatibilidade progressiva:** projetar apenas o necessario para convivio com ENOVA 1.
6. **Governanca anti-lixo:** transcript bruto e texto final da IA nao viram estado soberano por padrao.
7. **Sem drift de frente:** nada de audio real, Meta/WhatsApp, telemetria ampla ou rollout nesta frente.

## 7. Escopo incluido

1. Contrato de dados persistiveis da frente.
2. Shape canonico de entidades/tabelas/colunas/chaves/relacionamentos.
3. Ownership de escrita/leitura por camada.
4. Politica do que persiste e do que nao persiste.
5. Casca canonica do Supabase Adapter (PR42).
6. Politica de merge/update/consistencia e expiracao da memoria viva (PR43).
7. Smoke integrado de persistencia no recorte da frente (PR44).
8. Closeout formal da frente.

## 8. Fora de escopo

- implementacao real de tabela/migration na PR40
- escrita runtime real na PR40
- endpoint funcional novo na PR40
- audio real, STT real, TTS real
- Meta/WhatsApp
- telemetria ampla de produto
- rollout/shadow/canary
- autoria de fala por mecanico, parser, contexto ou adapter
- qualquer decisao de regra de negocio fora do Core

## 9. Entradas da frente

- Core Mecanico 2 encerrado com saida estrutural estavel.
- Speech/Surface encerrados com IA soberana na fala.
- Frente 3 encerrada com contexto/sinais/memoria viva minima.
- Referencia legada L03/L18 e bloco Supabase do PDF mestre (paginas 126-127).

## 10. Saidas esperadas da frente

- contrato de dados persistiveis consolidado
- adapter canonico com fronteiras claras
- politica de merge/update/consistencia documentada e testada
- smoke persistente integrado
- closeout formal com contrato arquivado

## 11. Legados aplicaveis

- **Obrigatorios:** L03 e L18
- **Complementares:** L19 quando recorte exigir memorial do programa
- **Fonte PDF especifica para Supabase Adapter:** `schema/source/LEGADO_MESTRE_ENOVA1_ENOVA2.pdf`, paginas 126-127

## 12. Entregavel macro da frente

Ao final, a ENOVA 2 deve ter persistencia estrutural canonica de:

- cliente e lead
- contexto estruturado
- sinais extraidos
- memoria viva
- documentos
- dossie
- visita/agendamento
- historico operacional util

com separacao entre dado bruto, dado consolidado e projecao de compatibilidade.

## 13. PRs oficiais da frente (ordem imutavel)

### PR 40 — Abertura contratual da Frente 4

**Classificacao:** governanca  
**Objetivo:** abrir contrato, vivos e schema canonico documental de dados (sem runtime).  
**Deve entregar:** contrato ativo + `_INDEX` + status + handoff + documento canonico de dados.  
**Nao deve entregar:** migration real, tabela real, write path real, endpoint funcional.

### PR 41 — Contrato de dados e shape persistivel

**Classificacao:** contratual  
**Objetivo:** consolidar o contrato de dados persistiveis da frente.  
**Microetapas:**
1. definir entidades persistiveis
2. definir tabelas/colunas canonicas
3. definir ids/chaves/timestamps/versionamento
4. definir o que pode e nao pode ser persistido
5. smoke documental/estrutural do contrato de dados

### PR 42 — Adapter base de leitura/escrita canonica

**Classificacao:** contratual  
**Objetivo:** criar casca tecnica minima do adapter com interfaces e boundaries.  
**Microetapas:**
1. criar interfaces de leitura/escrita
2. definir ownership de cada write path
3. centralizar integracao sem espalhar chamada direta
4. manter sem canal externo, sem audio, sem Meta
5. smoke do adapter base

### PR 43 — Politica de merge/update/consistencia

**Classificacao:** contratual  
**Objetivo:** consolidar politicas de append/merge/overwrite e consistencia.  
**Microetapas:**
1. definir append vs merge vs overwrite por entidade
2. definir confirmacao vs pre-slot
3. definir atualizacao de contexto/sinais/memoria
4. definir expiracao/limpeza da memoria viva
5. proteger contra drift e corrupcao de estado

### PR 44 — Smoke persistente + closeout da Frente 4

**Classificacao:** contratual + closeout  
**Objetivo:** provar a frente integrada e encerrar contrato formalmente.  
**Microetapas:**
1. acceptance smoke de persistencia
2. prova de consistencia por replay seguro
3. prova de soberania preservada (Core regra, IA fala, Adapter persiste)
4. executar `CONTRACT_CLOSEOUT_PROTOCOL.md`
5. arquivar contrato e atualizar vivos

## 14. Criterios de aceite da frente

C1. Contrato de dados persistiveis definido e rastreavel.  
C2. Entidades/tabelas/colunas/chaves/relacionamentos canonicos definidos.  
C3. Adapter base com boundaries claros (sem espalhar integracao).  
C4. Politica de merge/update/consistencia formalizada e testavel.  
C5. Replay seguro sem corrupcao de estado.  
C6. Diferenca entre estado soberano do Core e estado persistido explicita.  
C7. IA segue soberana na fala; Adapter nao ganha autoria de resposta.  
C8. Closeout formal concluido via PR44.

## 15. Criterios de closeout

O contrato so pode encerrar quando:

1. PR40, PR41, PR42, PR43 e PR44 estiverem concluídas.
2. C1-C8 estiverem comprovados por evidencias objetivas.
3. smoke integrado de persistencia estiver passando.
4. `CONTRACT_CLOSEOUT_PROTOCOL.md` estiver integralmente cumprido.
5. contrato for movido para `schema/contracts/archive/`.
6. `_INDEX`, status e handoff da frente estiverem atualizados.

## 16. Criterios de nao conformidade

- Adapter escrevendo resposta ao cliente.
- Adapter decidindo regra de negocio, gate ou stage.
- Persistencia de transcript bruto por padrao sem politica.
- Texto final da IA tratado como estado soberano.
- Escrita sem idempotencia ou sem evidencia de origem.
- Mistura de Frente 4 com audio/Meta/telemetria/rollout na mesma PR.
- Qualquer implementacao fora da ordem PR40->PR44.

## 17. Riscos e bloqueios conhecidos

R1. **Drift de soberania:** adapter tentando decidir regra/fala.  
Mitigacao: limites de ownership no contrato + smoke de soberania.

R2. **Persistencia caotica:** guardar texto bruto sem valor operacional.  
Mitigacao: politica explicita do que persiste e do que nao persiste.

R3. **Quebra de compatibilidade com ENOVA 1:** escrita direta em campos criticos.  
Mitigacao: namespace/logica de projecao canonica e rollout de escrita controlada.

R4. **Replay nao idempotente:** duplicacao/corrupcao em reprocessamento.  
Mitigacao: chave idempotente por turno e politicas de merge.

## 18. Regras de implementacao da frente

1. Uma PR por recorte oficial.
2. Diagnostico READ-ONLY antes de qualquer patch.
3. Smoke obrigatorio por PR.
4. Sem refatoracao solta.
5. Sem mistura com outras frentes.
6. Sem alteracao silenciosa do objetivo do contrato.
7. Qualquer desvio exige revisao formal.
8. Atualizacao viva obrigatoria em toda PR.

## 19. Estado inicial da frente

- Contrato ativo: **este contrato**
- Estado inicial: **contrato aberto**
- Ultima frente encerrada: **Frente 3 (PR39)**
- Proximo passo autorizado ao abrir: **PR41 — contrato de dados e shape persistivel**
- Mudancas em dados persistidos (Supabase): **nenhuma nesta PR40**
- Permissoes Cloudflare necessarias: **nenhuma adicional**

## 20. Proximo passo autorizado

> **Executar PR41 — contrato de dados e shape persistivel da Frente 4, ainda sem migration real e sem write path runtime real.**

## 21. Bloco executivo curto

- abrir governanca completa da Frente 4
- definir desenho canonico da persistencia
- quebrar execucao em PR41-PR44 com microetapas claras
- preservar soberania do Core e da IA
- impedir fala mecanica e persistencia caotica

## 22. Conformidade com soberania da IA

Este contrato declara conformidade integral com:

- `schema/ADENDO_CANONICO_SOBERANIA_IA.md`

Regra-matriz aplicada:

> IA soberana em raciocinio e fala.  
> Core soberano em regra de negocio.  
> Supabase Adapter soberano apenas em persistencia estrutural auditavel.  
> Nenhuma camada de persistencia tem permissao para escrever resposta final ao cliente.
