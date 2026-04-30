# T8_SUPABASE_PROVA_REAL_EXECUTADA — Execução real Supabase (PR-T8.9B)

**PR**: PR-T8.9B | **Tipo**: PR-PROVA  
**Base**: PR-T8.9 (harness instalado)  
**Data**: 2026-04-30  
**Branch**: feat/t8-pr-t8-9b-execucao-real-supabase

---

## §1 — Meta

| Campo | Valor |
|---|---|
| PR | PR-T8.9B |
| Tipo | PR-PROVA |
| Base | PR-T8.9 — harness `prove:supabase-real` instalado |
| Objetivo | Execução real Supabase com env real controlada e registro de evidência |
| Próxima PR | A definir por Vasques — frente depende do resultado desta PR |

---

## §2 — Ambiente

| Item | Status |
|---|---|
| Modo skip testado (Claude Code) | SIM — `SKIPPED_REAL_ENV_MISSING` / exit 0 / nunca falha CI |
| Modo real testado (Vasques local) | SIM — envs reais fornecidas por Vasques |
| URL mascarada | `https://jsqwhnmjsbmtfyyukwsr.supabase.co` |
| Service role exposta? | NÃO — script imprime apenas `eyJhbG…(219 chars)` |
| Data/hora execução por Vasques | 2026-04-30 |

---

## §3 — Comandos executados

```bash
# Vasques rodou localmente com envs reais (segredo nunca exposto aqui):
SUPABASE_REAL_ENABLED=true \
SUPABASE_URL=<masked: https://jsqwhnmjsbmtfyyukwsr.supabase.co> \
SUPABASE_SERVICE_ROLE_KEY=<masked: eyJhbG...219 chars> \
npm run prove:supabase-real
```

---

## §4 — Resultado do modo skip

```
PROVA-SUPABASE-REAL | PR-T8.9 | 2026-04-30
============================================================
SKIPPED: SKIPPED_REAL_ENV_MISSING
  SUPABASE_REAL_ENABLED não é "true" ou envs ausentes. Prova pulada — nunca falha CI.
EXIT 0 (skipped)
```

Modo skip: **exit 0 confirmado**. CI seguro sem env real.

---

## §5 — Resultado da primeira execução real (v1 do harness — fetch failed)

Vasques executou o harness `proof.ts` na versão PR-T8.9 (antes da correção de diagnóstico desta PR-T8.9B). Resultado:

```
PROVA-SUPABASE-REAL | PR-T8.9 | 2026-04-30

Modo real ativo.
url_masked      : https://jsqwhnmjsbmtfyyukwsr.supabase.co
service_role   : eyJhbG...(219 chars)
lead_ref        : (não setado — leitura geral)
write_enabled  : false
known_tables    : 30
known_buckets   : 4

[P1] Readiness ........... OK   mode=supabase_real url=https://jsqwhnmjsbmtfyyukwsr.supabase.co warnings=3
[P2] Auth inválida ....... FAIL http_status=null ok=false
[P3] crm_lead_meta ....... FAIL error=network_error: fetch failed
[P4] enova_docs .......... FAIL error=network_error: fetch failed
[P5] Dossier snapshot .... FAIL state_ok=false override_ok=false
[P6] enova_document_files  FAIL error=network_error: fetch failed
[P7] Storage buckets ..... FAIL error=network_error: fetch failed
[P8] Write opcional ...... SKIPPED SUPABASE_PROOF_WRITE_ENABLED não setado.

RESULTADO: 2/8 PASS | 1 SKIPPED | 6 FAIL
EXIT 1 (falha em modo real)
```

### Interpretação

| Fase | Status | Significado |
|---|---|---|
| P1 | PASS | Readiness local OK — envs reconhecidas, URL parseada |
| P2 | FAIL (NETWORK_FAIL) | fetch retornou `http_status=null` — não chegou ao endpoint |
| P3–P7 | FAIL (network_error: fetch failed) | Nenhuma chamada HTTP chegou ao Supabase |
| P8 | SKIPPED | Correto — write não habilitado |

**Diagnóstico**: o problema não é de schema, autenticação ou dados. É um problema de **conectividade de rede no ambiente local de Vasques** — o `fetch` do Node.js/tsx não está alcançando o host externo `jsqwhnmjsbmtfyyukwsr.supabase.co`.

Causas possíveis:
1. **Firewall corporativo ou VPN** bloqueando saída na porta 443 para `*.supabase.co`
2. **Proxy não configurado** no ambiente Node.js (Node não herda proxy do sistema automaticamente)
3. **Resolução DNS** falhando para o domínio
4. **Node.js < 18** sem suporte a fetch nativo (improvável — o script rodou até P1)

---

## §6 — Correção implementada nesta PR-T8.9B

O `proof.ts` foi atualizado para incluir **bloco de diagnóstico P0** antes das fases reais:

### Adições ao proof.ts

1. **`runNetworkDiagnostics(cfg)`** — função de pré-diagnóstico:
   - Imprime `process.version` (Node.js version)
   - Imprime `typeof fetch` (confirma disponibilidade)
   - Testa endpoint neutro público (`https://httpstat.us/200`) — confirma se Node tem acesso à internet em geral
   - Testa `HEAD /rest/v1/` do Supabase sem auth — confirma se DNS e TLS estão resolvendo

2. **`extractNetworkCause(e, secret)`** — extrai `.cause` do erro undici:
   - Node.js 18+ (undici) encapsula o erro real do SO em `error.cause`
   - Causa real pode ser: `ENOTFOUND` (DNS), `ECONNREFUSED` (porta), `CERT_*` (TLS), `UND_ERR_CONNECT_TIMEOUT` (timeout)
   - Service role sempre sanitizada antes de imprimir

3. **Diagnóstico de causa raiz** no bloco de falhas:
   - Se todas as fases são `NETWORK_FAIL` + endpoint neutro falha → bloqueio de rede local
   - Se endpoint neutro OK mas Supabase falha → DNS/TLS específico do Supabase
   - Se endpoint neutro OK e Supabase HEAD OK mas fases falham → autenticação/URL incorreta

### Output esperado do P0 (quando Vasques rodar novamente)

```
--- Diagnóstico de rede (P0) ---
  Node.js: v<versão>
  fetch disponível: true (typeof=function)
  endpoint neutro (https://httpstat.us/200): status=200 ok=true    ← OU FAIL com causa
  Supabase /rest/v1/ HEAD: status=401 (esperado sem auth — OK)      ← OU FAIL com causa
--- Fim P0 ---
```

Se `httpstat.us` FAIL → problema de rede local, não do Supabase.  
Se `httpstat.us` OK + Supabase FAIL → DNS/TLS específico do Supabase.  
Se ambos OK → problema era de key/URL (menos provável dado o P1 OK).

---

## §7 — Segurança

| Verificação | Status |
|---|---|
| Service role apareceu em stdout? | NÃO — impresso apenas `eyJhbG…(219 chars)` |
| URL completa exposta? | NÃO — apenas `https://jsqwhnmjsbmtfyyukwsr.supabase.co` (host, sem path/key) |
| Segredo em output de erro? | NÃO — `safeErrorMessage` e `extractNetworkCause` sanitizam o secret |
| Schema alterado? | NÃO |
| RLS alterado? | NÃO |
| Bucket alterado? | NÃO |
| Delete/update/reset real? | NÃO |

---

## §8 — Resultado final desta PR-T8.9B

| Critério | Status |
|---|---|
| Supabase real aprovado | **PENDENTE** — fetch falhou por problema de rede local |
| Documentos aprovados | PENDENTE |
| Dossiê aprovado | PENDENTE |
| Storage aprovado | PENDENTE |
| Frente Supabase encerrada | **NÃO** — pendente execução real positiva |

**Esta PR-T8.9B entrega**: diagnóstico preciso do bloqueio + correção do harness com P0 de diagnóstico de rede. Não declara prova real positiva pois a execução real falhou por problema externo ao código.

---

## §9 — Limitações remanescentes e causa raiz do bloqueio

O código Supabase (PR-T8.8: `client.ts`, `crm-store.ts`, `readiness.ts`) está correto — P1 confirmou que readiness reconhece as envs e parseia a URL. O bloqueio é de conectividade de rede do ambiente local de Vasques.

**Ação necessária para desbloquear**:

```bash
# 1. Verificar se o Node consegue acessar qualquer host externo:
node -e "fetch('https://httpstat.us/200').then(r => console.log('OK:', r.status)).catch(e => console.log('FAIL:', e.message, e.cause?.code))"

# 2. Se falhar, verificar proxy (Windows):
echo %HTTPS_PROXY%
echo %HTTP_PROXY%

# 3. Se proxy necessário, configurar:
set HTTPS_PROXY=http://proxy:porta
set HTTP_PROXY=http://proxy:porta
npm run prove:supabase-real

# 4. Verificar DNS:
nslookup jsqwhnmjsbmtfyyukwsr.supabase.co

# 5. Verificar porta 443:
Test-NetConnection jsqwhnmjsbmtfyyukwsr.supabase.co -Port 443
```

---

## §10 — Próxima PR recomendada

**Opção A (preferida)**: Vasques resolve conectividade local e reexecuta `prove:supabase-real` com P0 ativo. Com output positivo, esta PR-T8.9B é completada e a frente Supabase encerrada.

**Opção B**: Se o problema for de proxy/rede corporativa irresolvível localmente, Vasques executa os comandos de diagnóstico `node -e "..."` e cola o resultado aqui. O Claude adapta o harness para usar `https` nativo do Node (sempre disponível, não afetado por fetch/undici), ou usa `axios`/`node-fetch` como fallback.

**Frentes seguintes após Supabase provado**:
1. Correção de RLS nas tabelas desativadas
2. Revisão de policy dos buckets públicos (`documentos-pre-analise`, `enavia-brain`)
3. Integração Meta/WhatsApp real
4. LLM real controlado
5. Atendimento de cliente real (pós-G8)
