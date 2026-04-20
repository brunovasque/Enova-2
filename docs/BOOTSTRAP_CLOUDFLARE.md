# BOOTSTRAP_CLOUDFLARE — Bootstrap Técnico do Cloudflare Worker da ENOVA 2

## O que este bootstrap faz

Prepara o repositório para deploy na plataforma Cloudflare Workers, adicionando o `wrangler.toml` com dois ambientes canônicos e um entrypoint mínimo de placeholder.

**Nenhuma lógica de negócio, binding, secret, integração real ou arquitetura técnica foi aberta nesta etapa.**

---

## Ambientes canônicos

| Ambiente   | Nome do worker       | Uso                                             |
|------------|----------------------|-------------------------------------------------|
| Produção   | `nv-enova-2`         | Worker principal — `main` branch = produção     |
| Teste      | `nv-enova-2-test`    | Validação controlada antes de promoção          |

---

## Regra de produção

- **`main` branch representa produção.**
- Qualquer merge em `main` deve ser tratado como deploy candidato ao worker `nv-enova-2`.
- O ambiente `test` (`nv-enova-2-test`) existe para validação controlada antes da promoção.
- Deploy em test e em prod usam o mesmo código-fonte; muda apenas o target environment.

---

## Comandos de deploy (quando pipeline estiver configurado)

```bash
# Deploy para teste
wrangler deploy --env test

# Deploy para produção
wrangler deploy
```

> **Atenção:** estes comandos não existem em pipeline automatizado ainda.
> Este bootstrap apenas prepara o repositório para isso.
> A criação do pipeline de CI/CD será feita em PR dedicada.

---

## Entrypoint placeholder

O arquivo `src/worker.ts` existe unicamente para satisfazer o campo `main` do `wrangler.toml`.
Ele não contém lógica de produto, bindings, ou arquitetura prematura.
Será substituído pela implementação funcional em PR dedicada, após abertura do contrato da frente ativa.

---

## O que ainda não existe neste bootstrap

- Bindings (KV, R2, D1, Queues, Service Bindings)
- Secrets
- Routes customizadas
- Observability config
- Pipeline de CI/CD (GitHub Actions)
- Lógica de negócio
- Integrações reais

Todos esses elementos serão adicionados em PRs contratuais específicas, conforme a ordem executiva do A01.

---

## Referências

- `wrangler.toml` — configuração do worker
- `src/worker.ts` — entrypoint placeholder
- `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md` — Fase 1, scaffold técnico
- `schema/CODEX_WORKFLOW.md` — governança de execução
