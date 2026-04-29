# CONTRATO OPERACIONAL T8 — ENOVA 2

**Versão:** Rev2 — DIAG → IMPL → PROVA explícito por PR  
**Objetivo final:** ao final da T8, a Enova 2 deve estar operacionalmente funcionando, atendendo cliente real controlado e cumprindo os contratos T1–T7.  
**Origem:** G7 aprovado documentalmente com restrições operacionais.  
**Próxima fase:** T8 — Diagnóstico técnico de aderência contrato × código real + implementação operacional real.

---

## 0. Veredito de entrada da T8

A implantação T0–T7 foi encerrada documentalmente. O G7 foi aprovado com restrições operacionais. Isso significa:

- A base contratual/governança existe.
- O que a Enova 2 deve ser está definido.
- As regras de fala, estado, policy, funil, documentos, canal, dossiê, rollback e go-live estão contratadas.
- Ainda faltam provas e implementação runtime real.
- A T8 é a fase que transforma contrato em sistema operacional.

**Regra-mãe da T8:** se ao final da T8 a Enova 2 não estiver atendendo cliente real controlado conforme os contratos T1–T7, a T8 falhou.

---

## 1. Objetivo macro da T8

Transformar a Enova 2 de uma base contratual/documental aprovada em um sistema operacional funcional, com:

1. Diagnóstico técnico real do repo atual.
2. Comparação contrato T1–T7 × código real.
3. Migração/reaproveitamento do CRM do Repo1 para o Repo2.
4. Backend e frontend do CRM operando no Repo2.
5. Supabase conectado, validado e seguro.
6. Meta/WhatsApp real integrado com controle.
7. Runtime Worker funcionando conforme contrato.
8. Memória evolutiva operacional, estilo Obsidian-plus.
9. Telemetria real ativa.
10. Feature flags e rollback técnico provados.
11. Atendimento real controlado com cliente/lead real ou lead operacional autorizado.
12. G8 aprovado operacionalmente.

---

## 2. Regra obrigatória — três tipos de PR

Toda PR da T8 deve ser classificada como um destes tipos:

### 2.1 PR-DIAG — Diagnóstico

**Finalidade:** descobrir a verdade do código, do repo, do runtime e das integrações.

Pode:
- ler arquivos;
- mapear arquitetura;
- comparar contrato × código;
- listar lacunas;
- indicar riscos;
- produzir plano de implementação.

Não pode:
- alterar runtime;
- alterar produção;
- criar feature;
- mexer em WhatsApp real;
- aplicar migration;
- corrigir código funcional.

Entrega obrigatória:
- relatório de aderência;
- mapa de lacunas;
- riscos;
- recomendações;
- próxima PR-IMPL autorizada.

### 2.2 PR-IMPL — Implementação

**Finalidade:** alterar código/configuração para cumprir contrato.

Pode:
- alterar Worker;
- alterar frontend;
- migrar CRM;
- implementar backend;
- implementar Supabase;
- implementar Meta/WhatsApp;
- implementar memória;
- implementar telemetria;
- implementar flags/rollback.

Não pode:
- abrir cliente real sem PR-PROVA;
- mudar regra MCMV sem contrato;
- quebrar T1–T7;
- misturar frentes sem autorização.

Entrega obrigatória:
- código/configuração alterado;
- testes técnicos;
- evidência;
- plano de rollback;
- próxima PR-PROVA autorizada.

### 2.3 PR-PROVA — Prova real/controlada

**Finalidade:** provar que a implementação funciona.

Pode:
- rodar smoke tests;
- testar endpoint real;
- validar Supabase;
- validar CRM;
- validar Meta/webhook;
- validar logs;
- validar memória;
- validar dossiê;
- validar atendimento controlado.

Não pode:
- esconder falha;
- aprovar sem evidência;
- chamar pronto sem logs;
- liberar cliente real amplo sem autorização humana.

Entrega obrigatória:
- evidência de teste;
- logs;
- prints/retornos técnicos;
- PASS/FAIL;
- decisão: avança, corrige ou bloqueia.

### 2.4 Regra de sequência

Nenhuma frente pode ser considerada pronta sem a sequência:

```text
PR-DIAG → PR-IMPL → PR-PROVA
```

Nenhuma implementação sem diagnóstico anterior.  
Nenhuma implementação considerada pronta sem prova posterior.  
Nenhum go-live real sem PR-PROVA e autorização Vasques.

---

## 3. Cláusula Claude Code como Mini-Enavia

Claude Code será usado como executor local/governado, funcionando como uma mini-Enavia operacional.

### 3.1 Papel do Claude Code

Claude Code pode:
- ler o repo inteiro;
- diagnosticar arquitetura;
- editar múltiplos arquivos localmente;
- rodar testes;
- fazer commits;
- preparar PRs;
- comparar contrato × código;
- executar tarefas longas com mais agilidade que Copilot PR comment.

Claude Code não pode:
- ignorar contrato T1–T7;
- alterar produção sem aprovação;
- misturar frentes sem autorização;
- substituir validação humana;
- encerrar PR sem evidência;
- chamar falha de sucesso.

### 3.2 Workflow obrigatório do Claude Code

Toda tarefa Claude Code deve iniciar com:

```text
Leia e siga estritamente schema/CODEX_WORKFLOW.md.
Leia o contrato T8 ativo.
Classifique esta PR como PR-DIAG, PR-IMPL ou PR-PROVA.
Não avance para outro tipo de PR sem autorização.
Trabalhe no mesmo branch/PR.
Faça commits pequenos e rastreáveis.
Ao final, entregue Summary, Commit, Testes, Evidências e Rollback.
```

### 3.3 Proibição de drift

A T8 não permite drift. Cada PR deve ter:
- frente única;
- objetivo único;
- tipo claro;
- escopo fechado;
- evidência objetiva;
- rollback.

---

## 4. Adendo obrigatório — Memória Evolutiva Enova

A Enova 2 deve ter uma memória operacional evolutiva, equivalente ou superior a um Obsidian interno, mas integrada ao sistema.

### 4.1 Objetivo

A Enova deve aprender com cada atendimento e cada ação operacional:
- o que funcionou;
- o que falhou;
- quais objeções apareceram;
- quais respostas converteram melhor;
- quais documentos geraram confusão;
- quais etapas causaram abandono;
- quais regras precisam de reforço;
- quais padrões de lead merecem atenção.

### 4.2 Tipos de memória

1. **Memória de atendimento:** histórico resumido por lead, estágio, decisão, objeção e resultado.
2. **Memória de aprendizado:** lições extraídas de atendimentos, sem virar regra automaticamente.
3. **Memória de contrato:** referências T1–T8, critérios, bloqueios e regras soberanas.
4. **Memória de desempenho:** conversão, abandono, docs recebidos, aprovações, visitas, perdas.
5. **Memória de erro:** falhas de LLM, parser, estado, Meta, Supabase, dossiê, CRM.
6. **Memória comercial:** abordagens que funcionam, objeções comuns, follow-ups eficazes.
7. **Memória de produto:** melhorias sugeridas, recorrências, gargalos de UX e operação.

### 4.3 Regras de segurança da memória

A memória nunca pode:
- alterar regra MCMV sozinha;
- criar fact_* sem validação;
- mudar stage automaticamente;
- promover aprendizado para regra sem aprovação;
- armazenar dado sensível fora do Supabase/estrutura segura;
- expor dados de cliente em prompt desnecessário;
- contradizer T1–T7.

### 4.4 Ciclo de aprendizado

```text
Atendimento → Evento → Classificação → Insight → Validação → Memória → Uso futuro controlado
```

Todo aprendizado deve ter:
- origem;
- evidência;
- categoria;
- risco;
- impacto;
- aprovação necessária;
- status: draft / validado / rejeitado / promovido.

---

## 5. Frentes obrigatórias da T8

### 5.1 Diagnóstico contrato × código real

Mapear:
- o que existe no repo;
- o que existe no runtime;
- o que falta;
- o que está parcial;
- o que conflita com contrato;
- o que pode ser reaproveitado;
- o que precisa ser implementado.

### 5.2 CRM Repo1 → Repo2

A T8 deve reaproveitar o CRM já construído no Repo1.

Obrigatório:
- diagnosticar backend do CRM no Repo1;
- diagnosticar frontend do CRM no Repo1;
- mapear rotas, componentes, APIs, auth, tabelas, fluxos;
- migrar para Repo2 sem reescrever do zero;
- preservar trabalho já feito;
- adaptar ao contrato T1–T7;
- provar CRM funcionando no Repo2.

### 5.3 Supabase

Obrigatório diagnosticar, implementar e provar:
- tabelas;
- migrations;
- buckets;
- storage de documentos;
- policies/RLS;
- vínculos lead/documento/dossiê;
- logs;
- memória evolutiva;
- auditoria;
- segurança.

### 5.4 Meta/WhatsApp

Obrigatório diagnosticar, implementar e provar:
- webhook;
- assinatura;
- challenge;
- inbound;
- outbound;
- mídia;
- erro/retry;
- rate limit;
- templates se necessário;
- teste real controlado.

### 5.5 Runtime Worker

Obrigatório:
- Worker recebendo evento;
- surface de canal;
- T4 orquestrando;
- LLM respondendo;
- state sendo atualizado;
- policy sendo respeitada;
- dossiê sendo alimentado;
- logs sendo persistidos;
- fallback seguro;
- rollback/flags.

### 5.6 Go-live operacional mínimo

A T8 só fecha se houver prova de atendimento real controlado:
- lead real ou lead operacional autorizado;
- WhatsApp real ou canal real controlado autorizado;
- estado persistido;
- resposta LLM conforme contrato;
- CRM mostrando lead;
- Supabase persistindo dados;
- telemetria visível;
- rollback possível;
- Vasques autorizando fechamento.

---

# 6. Mapa das 17 PRs da T8

## PR-T8.0 — Abertura formal do contrato T8

**Tipo:** PR-DIAG/GOVERNANÇA  
**Objetivo:** abrir o contrato T8 com regra DIAG → IMPL → PROVA, escopo operacional e gate G8.

**Entrega obrigatória:**
- `schema/contracts/active/CONTRATO_IMPLANTACAO_MACRO_T8.md`;
- status atualizado;
- handoff atualizado;
- PRs T8.1–T8.R formalizadas.

**Não pode:** alterar `src/`, runtime, Supabase, Meta ou CRM.

**Bloqueia próxima se:** contrato T8 não declarar que T8 só fecha com Enova atendendo cliente real controlado.

**Próxima:** PR-T8.1.

---

## PR-T8.1 — Inventário técnico real do Repo2

**Tipo:** PR-DIAG  
**Objetivo:** mapear o que existe hoje no Repo2.

**Conteúdo obrigatório:**
- árvore relevante do repo;
- Worker/backend;
- frontend;
- APIs;
- Supabase bindings;
- Meta/webhook;
- CRM presente/ausente;
- testes existentes;
- contratos existentes;
- arquivos vivos.

**Entrega obrigatória:**
- `schema/diagnostics/T8_REPO2_INVENTARIO_TECNICO.md`.

**Não pode:** alterar código funcional.

**Bloqueia próxima se:** não houver mapa claro do repo.

**Próxima:** PR-T8.2.

---

## PR-T8.2 — Matriz contrato T1–T7 × código real

**Tipo:** PR-DIAG  
**Objetivo:** comparar contrato T1–T7 com código existente.

**Conteúdo obrigatório:**
- matriz por frente;
- existe / parcial / ausente / conflitante;
- lacunas runtime;
- lacunas Supabase;
- lacunas Meta;
- lacunas CRM;
- riscos;
- priorização.

**Entrega obrigatória:**
- `schema/diagnostics/T8_MATRIZ_ADERENCIA_CONTRATO_CODIGO.md`.

**Bloqueia próxima se:** não houver lista priorizada de implementação.

**Próxima:** PR-T8.3.

---

## PR-T8.3 — Diagnóstico CRM Repo1 → Repo2

**Tipo:** PR-DIAG  
**Objetivo:** mapear o CRM do Repo1 para reaproveitamento integral no Repo2.

**Conteúdo obrigatório:**
- localização do CRM no Repo1;
- frontend;
- backend;
- rotas;
- componentes;
- autenticação;
- tabelas;
- APIs;
- dependências;
- plano de migração.

**Entrega obrigatória:**
- `schema/diagnostics/T8_CRM_REPO1_DIAGNOSTICO_MIGRACAO.md`.

**Não pode:** reescrever CRM do zero.

**Bloqueia próxima se:** não estiver claro o que será migrado.

**Próxima:** PR-T8.4.

---

## PR-T8.4 — Migração backend CRM Repo1 → Repo2

**Tipo:** PR-IMPL  
**Objetivo:** migrar/adaptar backend do CRM do Repo1 para Repo2.

**Pode mexer:** backend, APIs, rotas, serviços, contratos de dados.

**Conteúdo obrigatório:**
- rotas CRM;
- leitura/escrita Supabase;
- endpoints de lead;
- endpoints de dossiê;
- endpoints de logs/status;
- compatibilidade com contrato.

**Entrega obrigatória:**
- backend CRM no Repo2;
- testes básicos;
- rollback.

**Bloqueia próxima se:** backend não compilar ou rotas básicas falharem.

**Próxima:** PR-T8.5.

---

## PR-T8.5 — Migração frontend CRM Repo1 → Repo2

**Tipo:** PR-IMPL  
**Objetivo:** migrar/adaptar painel CRM completo do Repo1 para Repo2.

**Pode mexer:** frontend, componentes, páginas, layout, chamadas API.

**Conteúdo obrigatório:**
- lista de leads;
- detalhe do lead;
- conversa;
- documentos;
- dossiê;
- status/fase;
- ações operacionais;
- visual aproveitando o que já existe no Repo1.

**Entrega obrigatória:**
- CRM visível/operável no Repo2;
- integração com backend da PR-T8.4.

**Bloqueia próxima se:** CRM não abrir ou não consumir backend.

**Próxima:** PR-T8.6.

---

## PR-T8.6 — Prova real do CRM no Repo2

**Tipo:** PR-PROVA  
**Objetivo:** provar que o CRM migrado funciona no Repo2.

**Provas obrigatórias:**
- abrir painel;
- listar lead fake/controlado;
- abrir detalhe;
- visualizar status;
- visualizar docs/dossiê quando existirem;
- registrar evidência.

**Entrega obrigatória:**
- `schema/proofs/T8_CRM_PROVA_OPERACIONAL.md`;
- logs/prints/retornos.

**Bloqueia próxima se:** CRM não funcionar ponta a ponta.

**Próxima:** PR-T8.7.

---

## PR-T8.7 — Diagnóstico Supabase real

**Tipo:** PR-DIAG  
**Objetivo:** mapear Supabase atual e lacunas.

**Conteúdo obrigatório:**
- tabelas;
- colunas;
- buckets;
- RLS/policies;
- envs;
- queries;
- relação com CRM;
- relação com docs/dossiê;
- relação com memória.

**Entrega obrigatória:**
- `schema/diagnostics/T8_SUPABASE_DIAGNOSTICO.md`.

**Bloqueia próxima se:** schema real não estiver mapeado.

**Próxima:** PR-T8.8.

---

## PR-T8.8 — Implementação Supabase operacional

**Tipo:** PR-IMPL  
**Objetivo:** implementar/ajustar Supabase para operação real mínima.

**Pode mexer:** migrations, queries, storage, policies, integração backend.

**Conteúdo obrigatório:**
- lead state;
- documentos;
- dossiê;
- eventos/logs;
- memória evolutiva;
- auditoria;
- buckets;
- segurança.

**Entrega obrigatória:**
- migrations/ajustes;
- código integrado;
- rollback.

**Bloqueia próxima se:** não salvar/ler dados mínimos.

**Próxima:** PR-T8.9.

---

## PR-T8.9 — Prova Supabase + documentos + dossiê

**Tipo:** PR-PROVA  
**Objetivo:** provar persistência real no Supabase.

**Provas obrigatórias:**
- criar lead teste;
- salvar estado;
- anexar documento controlado;
- gravar evento/log;
- montar referência de dossiê;
- ler no CRM.

**Entrega obrigatória:**
- `schema/proofs/T8_SUPABASE_PROVA_OPERACIONAL.md`.

**Bloqueia próxima se:** persistência falhar.

**Próxima:** PR-T8.10.

---

## PR-T8.10 — Diagnóstico Meta/WhatsApp + Worker runtime

**Tipo:** PR-DIAG  
**Objetivo:** mapear estado real de Meta/WhatsApp, webhook e Worker.

**Conteúdo obrigatório:**
- webhook;
- verify token;
- assinatura;
- inbound;
- outbound;
- mídia;
- envs/secrets;
- Worker routes;
- logs;
- falhas.

**Entrega obrigatória:**
- `schema/diagnostics/T8_META_WORKER_DIAGNOSTICO.md`.

**Bloqueia próxima se:** não houver mapa claro de integração.

**Próxima:** PR-T8.11.

---

## PR-T8.11 — Implementação Meta/WhatsApp + Worker inbound/outbound

**Tipo:** PR-IMPL  
**Objetivo:** implementar integração operacional mínima Meta/WhatsApp com Worker.

**Pode mexer:** Worker, webhook, adapter, routes, outbound, media handling.

**Conteúdo obrigatório:**
- challenge;
- assinatura;
- inbound normalizado;
- outbound seguro;
- dedupe/idempotência;
- mídia básica;
- logs;
- rate/error handling.

**Entrega obrigatória:**
- Worker integrado;
- testes técnicos;
- rollback.

**Bloqueia próxima se:** webhook/inbound/outbound não funcionar em teste controlado.

**Próxima:** PR-T8.12.

---

## PR-T8.12 — Prova Meta/WhatsApp controlada

**Tipo:** PR-PROVA  
**Objetivo:** provar canal Meta/WhatsApp em ambiente controlado.

**Provas obrigatórias:**
- challenge/verificação;
- inbound controlado;
- outbound controlado;
- dedupe;
- log do evento;
- persistência no Supabase;
- visualização no CRM.

**Entrega obrigatória:**
- `schema/proofs/T8_META_WHATSAPP_PROVA_CONTROLADA.md`.

**Bloqueia próxima se:** canal não provar ponta a ponta.

**Próxima:** PR-T8.13.

---

## PR-T8.13 — Memória evolutiva + telemetria operacional

**Tipo:** PR-IMPL  
**Objetivo:** implementar memória evolutiva e telemetria real.

**Pode mexer:** backend, Supabase, logs, memory service, CRM views.

**Conteúdo obrigatório:**
- eventos de atendimento;
- aprendizados candidatos;
- classificação de sucesso/falha;
- memória por lead;
- memória global validável;
- dashboard/logs;
- telemetria de turnos;
- auditoria.

**Entrega obrigatória:**
- memória funcional;
- telemetria persistida;
- rollback.

**Bloqueia próxima se:** eventos não forem persistidos.

**Próxima:** PR-T8.14.

---

## PR-T8.14 — Prova memória + telemetria + regressão contratual

**Tipo:** PR-PROVA  
**Objetivo:** provar que memória e telemetria funcionam sem quebrar contrato.

**Provas obrigatórias:**
- evento de atendimento salvo;
- insight candidato criado;
- insight não vira regra sozinho;
- telemetria de turno visível;
- CRM exibe evidência;
- regressão T1–T7 sem quebra.

**Entrega obrigatória:**
- `schema/proofs/T8_MEMORIA_TELEMETRIA_PROVA.md`.

**Bloqueia próxima se:** memória alterar comportamento sem validação.

**Próxima:** PR-T8.15.

---

## PR-T8.15 — Feature flags, rollback técnico e harness de go-live

**Tipo:** PR-IMPL  
**Objetivo:** implementar controles finais para operação real segura.

**Pode mexer:** flags, runtime config, admin endpoints, rollback, harness de teste.

**Conteúdo obrigatório:**
- ENOVA2_ENABLED;
- CHANNEL_ENABLED;
- CANARY_PERCENT;
- ROLLBACK_FLAG;
- modo manutenção;
- endpoint health;
- endpoint smoke;
- rollback técnico;
- prova de desligamento.

**Entrega obrigatória:**
- flags reais;
- rollback técnico;
- smoke harness;
- rollback documentado.

**Bloqueia próxima se:** não houver forma de desligar/reverter.

**Próxima:** PR-T8.R.

---

## PR-T8.R — Prova operacional real e closeout G8

**Tipo:** PR-PROVA / CLOSEOUT  
**Objetivo:** provar a Enova 2 funcionando operacionalmente e fechar G8.

**Provas obrigatórias:**
- atendimento controlado real ou autorizado;
- WhatsApp/canal real controlado;
- lead criado/persistido;
- resposta LLM conforme contrato;
- estado atualizado;
- CRM exibindo lead/conversa/status;
- Supabase persistindo estado/logs/docs;
- memória registrando aprendizado candidato;
- telemetria visível;
- rollback possível;
- autorização Vasques.

**Entrega obrigatória:**
- `schema/implantation/READINESS_G8.md`;
- evidências operacionais;
- veredito G8.

**G8 só pode ser aprovado se:**
- Enova 2 atender cliente/lead real controlado;
- nenhum contrato T1–T7 for violado;
- CRM funcionar;
- Supabase funcionar;
- Meta/WhatsApp funcionar;
- memória/telemetria funcionarem;
- rollback existir;
- Vasques aprovar.

---

## 7. Gate G8

### 7.1 G8 aprovado operacionalmente

G8 só pode ser aprovado se a Enova 2 estiver funcional no mundo real/controlado.

### 7.2 G8 não pode ser aprovado se

- não houver atendimento real/controlado;
- CRM não funcionar;
- Supabase não persistir;
- Meta/WhatsApp não funcionar;
- telemetria não existir;
- memória não registrar;
- rollback não funcionar;
- houver violação MCMV;
- houver reply_text mecânico dominante;
- houver perda de lead_state;
- Vasques não autorizar.

---

## 8. Body obrigatório das PRs T8

Toda PR da T8 deve conter exatamente:

```md
## Contrato ativo
## Tipo da PR
## Objetivo
## Classificação da tarefa
## Escopo
## Fora de escopo
## Arquivos vivos atualizados
## Testes / Validação
## Plano de rollback
## Próximo passo autorizado
## Contrato encerrado nesta PR?
```

### 8.1 Tipo da PR

Deve declarar:

```text
Tipo: PR-DIAG
```

ou

```text
Tipo: PR-IMPL
```

ou

```text
Tipo: PR-PROVA
```

---

## 9. Regra de sucesso da T8

A T8 é sucesso somente se:

1. Diagnóstico real foi feito.
2. Código foi implementado.
3. Provas reais foram executadas.
4. CRM Repo1 foi reaproveitado no Repo2.
5. Supabase está operacional.
6. Meta/WhatsApp está operacional controlado.
7. Memória evolutiva está operacional.
8. Telemetria real existe.
9. Rollback funciona.
10. Enova 2 atende cliente/lead real controlado conforme contrato.

Se qualquer item crítico faltar, a T8 não fecha G8.

---

## 10. Primeira tarefa recomendada

Abrir **PR-T8.0 — Abertura formal do contrato T8**.

Modelo recomendado: Claude Code / Opus.

Objetivo da PR-T8.0:
- criar contrato ativo T8 no repo;
- incluir este mapa de 17 PRs;
- declarar DIAG → IMPL → PROVA como regra obrigatória;
- declarar que G8 só aprova com Enova 2 operacional.
