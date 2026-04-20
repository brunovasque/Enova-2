# CLOUDFLARE_PERMISSION_PROTOCOL — Protocolo Obrigatório de Permissões Cloudflare — ENOVA 2

> **Este protocolo é lei operacional complementar ao CODEX_WORKFLOW.**
> Toda tarefa ou PR que passe a usar, configurar, alterar ou depender de qualquer recurso Cloudflare está sujeita a este protocolo.
> Nenhuma PR pode introduzir dependência de recurso Cloudflare sem declarar explicitamente se as permissões atuais bastam ou não.

---

## 1. Finalidade

Este protocolo garante rastreabilidade total e visibilidade preventiva de qualquer necessidade nova de permissão Cloudflare na ENOVA 2.

Ele existe para evitar que falhas silenciosas de deploy, binding ou acesso ocorram por permissão insuficiente do token Cloudflare — risco que, se não declarado, se tornaria implícito e invisível até o momento do falha real em produção.

O protocolo não cobre implementação funcional nem criação real de recursos. Cobre exclusivamente **declaração de necessidade de permissão** e **rastreabilidade preventiva** do que está sendo adicionado, configurado ou dependido.

---

## 2. Precedência

**A00 > A01 > A02 > CLOUDFLARE_PERMISSION_PROTOCOL > contrato específico da frente ativa**

Em caso de conflito, prevalece o nível mais alto da cadeia. Este protocolo está subordinado ao A00, A01 e A02, mas tem precedência sobre qualquer decisão de frente individual quando o assunto é permissão Cloudflare.

---

## 3. Escopo — quais recursos este protocolo cobre

Este protocolo se aplica quando uma tarefa ou PR passa a usar, alterar, configurar ou depender de qualquer um dos recursos abaixo:

| Recurso Cloudflare           | Exemplos de operações que exigem declaração                                   |
|------------------------------|-------------------------------------------------------------------------------|
| **Workers Scripts**          | criar, atualizar, publicar, renomear ou deletar um Worker                     |
| **Workers Routes**           | criar, atualizar ou deletar rotas de Worker                                   |
| **KV (Key-Value)**           | criar namespace, ler/escrever chaves, associar binding                        |
| **R2**                       | criar bucket, ler/escrever objetos, associar binding                          |
| **D1 (SQLite)**              | criar banco, executar migrations, associar binding                            |
| **Queues**                   | criar fila, publicar/consumir mensagens, associar binding                     |
| **Service Bindings**         | declarar dependência entre Workers                                            |
| **Secrets e Vars de deploy** | criar, atualizar ou remover `wrangler secret` ou variáveis de ambiente        |
| **Observability**            | qualquer configuração de logs ou analytics que exija permissão                |
| **Outros recursos**          | qualquer recurso Cloudflare não listado acima que a PR passe a usar           |

**Nota:** O protocolo não se aplica a menções de recursos em comentários de código ou documentação que não criem dependência real de execução ou deploy. Aplica-se quando a tarefa passa a **depender** do recurso.

---

## 4. Campos obrigatórios de declaração

### 4.1 Quando NÃO há necessidade nova de permissão Cloudflare

Toda tarefa ou PR deve declarar explicitamente, mesmo sem necessidade nova:

```
Permissões Cloudflare necessárias: nenhuma adicional
```

Esta declaração é **obrigatória** — inclusive em tarefas de governança, diagnóstico, hotfix documental ou qualquer outra classe que não introduza nova dependência de recurso Cloudflare.
Ausência desta declaração = tarefa não conforme.

### 4.2 Quando HÁ necessidade nova de permissão Cloudflare

Se a tarefa ou PR introduzir dependência de novo recurso Cloudflare ou ampliar o uso de recurso existente:

```
Permissões Cloudflare necessárias: sim

  Recurso Cloudflare afetado:          <Workers Script | KV | R2 | D1 | Queues | Routes | Service Binding | Secrets | Vars | Observability | Outro>
  Ação pretendida:                      <o que a tarefa vai fazer com este recurso>
  Permissões atuais suficientes?        <sim | não | incerto>
  Permissões adicionais necessárias:    <lista de permissões ou "nenhuma" se suficiente>
  Motivo:                               <por que este recurso é necessário para a tarefa>
  Impacto se não ampliar permissões:    <o que deixa de funcionar, qual é o risco>
  Pode prosseguir sem ampliar?          <sim | não — justificativa>
  Onde ajustar:                         <token Cloudflare | GitHub Secrets | wrangler.toml bindings | Cloudflare Dashboard | outro>
```

Se mais de um recurso for afetado, repetir o bloco para cada recurso.

---

## 5. Regra de parada

Se uma tarefa ou PR introduzir dependência de recurso Cloudflare **e não declarar todos os campos obrigatórios** da seção 4.2:

- **recurso Cloudflare afetado**
- **ação pretendida**
- **permissões atuais suficientes?**
- **permissões adicionais necessárias**
- **impacto se não ampliar**

→ **A tarefa é não conforme e deve parar imediatamente.**

Retomar somente após declaração completa.

---

## 6. Regra de escopo mínimo do token

O token Cloudflare utilizado para deploy e operações de API deve ter apenas as permissões estritamente necessárias para o que está sendo executado no momento.

- **Não ampliar o token com permissões preventivas** — adicionar apenas quando a necessidade for real e declarada.
- **Não reusar um token de escopo amplo** para tarefas que requerem escopo restrito.
- **Documentar o escopo atual do token** sempre que uma PR declara `Permissões Cloudflare necessárias: sim`.

---

## 7. Regra de "não ampliar token sem necessidade real"

- Ampliar o token Cloudflare é uma decisão explícita — não pode ser implícita.
- Toda ampliação de permissão deve ser precedida de declaração neste protocolo.
- Ampliação de token sem necessidade declarada = não conformidade.
- Se a necessidade for identificada após o início da tarefa, parar, declarar e aguardar aprovação antes de ampliar.

---

## 8. Regra de aviso preventivo

O agente **deve avisar preventivamente** ao usuário nas seguintes situações:

- Quando a PR passa a depender de recurso Cloudflare cujo token atual pode não ter permissão suficiente.
- Quando o estado atual das permissões é incerto (não verificável via repositório).
- Quando a ausência de permissão pode causar falha silenciosa em produção.

O aviso preventivo deve ser explícito na resposta final, no campo **Riscos / Pendências**, e não pode ser deixado implícito.

Exemplo de aviso preventivo:
```
AVISO PREVENTIVO DE PERMISSÃO CLOUDFLARE:
Esta PR passa a depender de [recurso]. Se o token Cloudflare atual não tiver
permissão [X], o deploy/binding falhará em produção. Ação necessária antes de deploy:
[onde e como ajustar a permissão].
```

---

## 9. O que atualizar quando houver necessidade nova

Toda declaração `Permissões Cloudflare necessárias: sim` obriga as seguintes atualizações:

1. **Handoff da frente** (`schema/handoffs/<FRENTE>_LATEST.md`) — registrar recurso afetado, permissão necessária, o que ficou pendente.
2. **Status da frente** (`schema/status/<FRENTE>_STATUS.md`) — se a necessidade de permissão bloqueia o avanço da frente, refletir como bloqueio ativo.
3. **PR Template** — preencher todos os campos de permissões Cloudflare.
4. **ESTADO HERDADO e ESTADO ENTREGUE** do CODEX_WORKFLOW — incluir declaração de permissões Cloudflare.

---

## 10. O que é proibido

- Introduzir binding, secret, var ou rota Cloudflare em `wrangler.toml` sem declaração prévia neste protocolo.
- Referenciar recurso Cloudflare (KV namespace, R2 bucket, D1 database, fila) sem declarar permissão necessária.
- Criar ou configurar recurso Cloudflare real (via Dashboard ou wrangler) sem declaração neste protocolo.
- Deixar a necessidade de nova permissão Cloudflare implícita — o risco deve ser visível.
- Ampliar token com permissão não declarada neste protocolo.

---

## 11. Exemplos de declaração

### Exemplo A — Tarefa sem necessidade de permissão Cloudflare

```
Permissões Cloudflare necessárias: nenhuma adicional
```

### Exemplo B — Tarefa que adiciona binding KV

```
Permissões Cloudflare necessárias: sim

  Recurso Cloudflare afetado:          KV (Key-Value)
  Ação pretendida:                      Criar namespace KV e associar binding ao Worker
  Permissões atuais suficientes?        não — token atual não tem permissão de criação de KV
  Permissões adicionais necessárias:    Workers KV Storage:Edit no token Cloudflare
  Motivo:                               Cache de sessão de usuário precisa de KV para persistência rápida
  Impacto se não ampliar permissões:    Deploy falha na etapa de provisionamento do namespace; worker não consegue fazer bind
  Pode prosseguir sem ampliar?          não — binding é necessário para o worker funcionar
  Onde ajustar:                         Token Cloudflare (Cloudflare Dashboard > API Tokens) + GitHub Secret CLOUDFLARE_API_TOKEN
```

### Exemplo C — Tarefa que adiciona secret de deploy

```
Permissões Cloudflare necessárias: sim

  Recurso Cloudflare afetado:          Secrets de deploy (wrangler secret)
  Ação pretendida:                      Adicionar secret SUPABASE_KEY via wrangler secret put
  Permissões atuais suficientes?        incerto — depende do escopo do token configurado no CI
  Permissões adicionais necessárias:    Workers Scripts:Edit (necessário para wrangler secret put)
  Motivo:                               Worker precisa autenticar no Supabase em tempo de execução
  Impacto se não ampliar permissões:    wrangler secret put falha; secret não fica disponível no worker
  Pode prosseguir sem ampliar?          não — sem o secret, a integração com Supabase não funciona
  Onde ajustar:                         GitHub Secret CLOUDFLARE_API_TOKEN (verificar se já tem Workers Scripts:Edit)
```

---

## 12. Integração com o CODEX_WORKFLOW

Este protocolo é complementar ao `schema/CODEX_WORKFLOW.md`.
Os blocos `ESTADO HERDADO` e `ESTADO ENTREGUE` do CODEX_WORKFLOW **devem incluir** a declaração de permissões Cloudflare conforme este protocolo.

Ver seções 4 e 5 do CODEX_WORKFLOW para os blocos obrigatórios.
Ver seção 15 do CODEX_WORKFLOW para a referência a este protocolo.

---

## 13. Índice de necessidades de permissão desta PR

Esta seção deve ser preenchida em cada PR que declare `Permissões Cloudflare necessárias: sim`.

| PR | Recurso | Ação | Permissão necessária | Suficiente? | Onde ajustar |
|----|---------|------|----------------------|-------------|--------------|
| *(vazio — preencher por PR)* | | | | | |
