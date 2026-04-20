# BOOTSTRAP_CLOUDFLARE — Bootstrap Técnico do Cloudflare Worker da ENOVA 2

## O que este bootstrap faz

Prepara o repositório para deploy na plataforma Cloudflare Workers, com dois ambientes canônicos, entrypoint placeholder mínimo e pipeline de deploy via GitHub Actions.

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
- Deploy para `prod` só é permitido a partir da branch `main` — tanto no pipeline quanto localmente por convenção.
- O ambiente `test` (`nv-enova-2-test`) existe para validação controlada antes da promoção.
- Deploy em test e em prod usam o mesmo código-fonte; muda apenas o target environment.

---

## Pipeline de deploy — GitHub Actions

O pipeline está em `.github/workflows/deploy.yml`.

### A. Deploy automático — push/merge em `main`

Qualquer push ou merge direto em `main` dispara automaticamente o deploy para **produção** (`nv-enova-2`).
Não é necessária nenhuma ação manual — o job `deploy-prod-auto` executa `wrangler deploy`.

### B. Deploy manual — `workflow_dispatch`

Para deploy manual de `test` ou `prod`:

1. Acesse a aba **Actions** no GitHub.
2. Selecione o workflow **Deploy — Cloudflare Workers**.
3. Clique em **Run workflow**.
4. Escolha o ambiente: `test` ou `prod`.
5. Clique em **Run workflow**.

**Proteção de prod (manual):**
- Se o ambiente escolhido for `prod` e o workflow for disparado a partir de uma branch diferente de `main`, o job falha imediatamente com mensagem de erro.

**Secrets necessários (já existem no repositório):**
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

## Uso local — terminal e VSCode

### Pré-requisitos

Não é necessário instalar o wrangler globalmente. Use `npx` com a versão pinada.
Certifique-se de ter Node.js instalado (`node -v`).

---

### bash / zsh (macOS, Linux, WSL)

#### Deploy para teste

```bash
CLOUDFLARE_API_TOKEN=<seu-token> CLOUDFLARE_ACCOUNT_ID=<seu-account-id> npx wrangler@3.114.17 deploy --env test
```

#### Deploy para produção

```bash
CLOUDFLARE_API_TOKEN=<seu-token> CLOUDFLARE_ACCOUNT_ID=<seu-account-id> npx wrangler@3.114.17 deploy
```

#### Usando arquivo `.env` local (não commitar)

Crie um `.env` local (não versionado):

```bash
CLOUDFLARE_API_TOKEN=<seu-token>
CLOUDFLARE_ACCOUNT_ID=<seu-account-id>
```

Carregue e use:

```bash
set -a; source .env; set +a
npx wrangler@3.114.17 deploy --env test
```

> **Atenção:** não use `cat .env | xargs` — pode causar problemas com valores que contenham espaços ou caracteres especiais.

---

### PowerShell (Windows, terminal do VSCode em PowerShell)

#### Definir variáveis na sessão atual

```powershell
$env:CLOUDFLARE_API_TOKEN = "<seu-token>"
$env:CLOUDFLARE_ACCOUNT_ID = "<seu-account-id>"
```

> Estas variáveis existem apenas na sessão atual do PowerShell. Ao fechar o terminal, são apagadas.

#### Deploy para teste

```powershell
npx wrangler@3.114.17 deploy --env test
```

#### Deploy para produção

```powershell
npx wrangler@3.114.17 deploy
```

#### Sequência completa em PowerShell

```powershell
$env:CLOUDFLARE_API_TOKEN = "<seu-token>"
$env:CLOUDFLARE_ACCOUNT_ID = "<seu-account-id>"
npx wrangler@3.114.17 deploy --env test
```

#### Persistência permanente no Windows (opcional)

Se quiser que as variáveis persistam entre sessões, use `[System.Environment]::SetEnvironmentVariable`:

```powershell
[System.Environment]::SetEnvironmentVariable("CLOUDFLARE_API_TOKEN", "<seu-token>", "User")
[System.Environment]::SetEnvironmentVariable("CLOUDFLARE_ACCOUNT_ID", "<seu-account-id>", "User")
```

> **Atenção:** persistência permanente exige cuidado — o token ficará salvo no perfil do usuário do sistema.
> Para uso cotidiano no terminal de desenvolvimento, preferir as variáveis de sessão temporária acima.

---

### VSCode — Terminal integrado (PowerShell ou bash)

O terminal integrado do VSCode funciona da mesma forma que qualquer terminal:

- Se o terminal padrão for **PowerShell**, use os comandos PowerShell acima.
- Se o terminal padrão for **bash/zsh** (Git Bash, WSL, macOS), use os comandos bash acima.

Não é necessário nenhum script extra ou extensão adicional.

**Fluxo típico no VSCode:**
1. Abra o terminal integrado (`Ctrl+`` ` ou `Terminal > New Terminal`).
2. Defina as env vars na sessão (PowerShell ou bash).
3. Execute `npx wrangler@3.114.17 deploy --env test`.

**Atenção:** o uso local está sujeito ao mesmo protocolo de permissões Cloudflare definido em `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`. Não amplie o token sem declaração prévia.

---

## Permissões Cloudflare necessárias para deploy

```
Permissões Cloudflare necessárias: sim

  Recurso Cloudflare afetado:          Workers Scripts
  Ação pretendida:                      Publicar/atualizar worker via wrangler deploy
  Permissões atuais suficientes?        incerto — depende do escopo do token configurado
  Permissões adicionais necessárias:    Workers Scripts:Edit (mínimo necessário para wrangler deploy)
  Motivo:                               Pipeline de deploy cria/atualiza o worker em prod e test
  Impacto se não tiver permissão:       wrangler deploy falha; worker não é atualizado
  Pode prosseguir sem ampliar?          não — sem esta permissão, o deploy não ocorre
  Onde ajustar:                         Cloudflare Dashboard > API Tokens > editar token CLOUDFLARE_API_TOKEN
```

> **AVISO PREVENTIVO:** Se o token `CLOUDFLARE_API_TOKEN` não tiver a permissão `Workers Scripts:Edit`,
> o deploy falhará no pipeline e localmente. Verificar o escopo do token antes do primeiro deploy real.

---

## Entrypoint placeholder

O arquivo `src/worker.ts` existe unicamente para satisfazer o campo `main` do `wrangler.toml`.
Ele não contém lógica de produto, bindings, ou arquitetura prematura.
Será substituído pela implementação funcional em PR dedicada, após abertura do contrato da frente ativa.

---

## O que ainda não existe neste bootstrap

- Bindings (KV, R2, D1, Queues, Service Bindings)
- Secrets de aplicação (wrangler secret)
- Routes customizadas
- Observability config
- Lógica de negócio
- Integrações reais

Todos esses elementos serão adicionados em PRs contratuais específicas, conforme a ordem executiva do A01.

---

## Referências

- `wrangler.toml` — configuração do worker
- `src/worker.ts` — entrypoint placeholder
- `.github/workflows/deploy.yml` — pipeline de deploy
- `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md` — protocolo de permissões Cloudflare
- `schema/A01_BACKLOG_MESTRE_ORDEM_EXECUTIVA.md` — Fase 1, scaffold técnico
- `schema/CODEX_WORKFLOW.md` — governança de execução
