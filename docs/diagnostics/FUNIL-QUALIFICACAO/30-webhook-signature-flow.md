# 30 — webhook.ts: fluxo de assinatura e bypass E2E

**Data:** 2026-05-08
**Comando:** `grep -n "signature_missing|signature_invalid|has_signature|verifyMeta|x-hub-signature|testBypass|E2E_TEST" src/meta/webhook.ts | head -40`
**Tipo:** Read-only / diagnóstico

---

## Output

```
22:import { verifyMetaSignature } from './signature.ts';
160:  testBypassHeader?: string | null;
170:    has_signature: input.signatureHeader !== null,
175:  const testBypass =
176:    input.testBypassHeader === 'true' &&
177:    readEnvString(input.env, 'E2E_TEST_ENABLED') === 'true';
179:  if (!testBypass) {
180:    const sig = await verifyMetaSignature(input.rawBody, input.signatureHeader, appSecret ?? null);
193:      const status = sig.reason === 'signature_missing' ? 401 : 403;
199:          error: 'signature_invalid',
411:    const signatureHeader = request.headers.get('x-hub-signature-256');
417:      testBypassHeader: request.headers.get('x-enova-test-bypass'),
```

---

## Mapa do fluxo

| Linha | Elemento | Papel |
|---|---|---|
| 22 | `import { verifyMetaSignature }` | Função HMAC-SHA256 importada de `./signature.ts` |
| 160 | `testBypassHeader?: string \| null` | Campo opcional no input de `processMetaWebhookPost` |
| 170 | `has_signature: input.signatureHeader !== null` | Log diagnóstico — registra presença do header |
| 175–177 | `const testBypass = ...` | Gate de bypass: ativo se header=`'true'` E `E2E_TEST_ENABLED=true` |
| 179 | `if (!testBypass)` | Bloco de verificação de assinatura só executa se bypass inativo |
| 180 | `verifyMetaSignature(...)` | Verificação HMAC-SHA256 real — bloqueada quando bypass ativo |
| 193 | `signature_missing` → 401 | Header ausente retorna 401 Unauthorized |
| 199 | `signature_invalid` → 403 | Header presente mas HMAC inválido retorna 403 Forbidden |
| 411 | `x-hub-signature-256` | Header padrão Meta lido pelo handler externo |
| 417 | `x-enova-test-bypass` | Header de bypass lido e passado para `processMetaWebhookPost` |

---

## Fluxo resumido

```
handleMetaWebhook (linha 377)
  └─ lê x-hub-signature-256           (linha 411)  → signatureHeader
  └─ lê x-enova-test-bypass           (linha 417)  → testBypassHeader
  └─ chama processMetaWebhookPost(...)

processMetaWebhookPost (linha 154)
  └─ log has_signature                (linha 170)
  └─ avalia testBypass                (linhas 175-177)
       testBypassHeader === 'true'
       && E2E_TEST_ENABLED === 'true'
  └─ if (!testBypass):
       └─ verifyMetaSignature(...)    (linha 180)
            ├─ sig.ok=false + reason=signature_missing → 401  (linha 193)
            └─ sig.ok=false + reason=*                → 403  (linha 199)
  └─ [continua pipeline se sig.ok=true ou bypass ativo]
```

---

## Observações

- O bypass é **duplo-gateado**: precisa tanto do header HTTP quanto da flag de ambiente `E2E_TEST_ENABLED=true`
- Em prod sem a flag configurada (`undefined !== 'true'`): bypass sempre inativo — seguro por padrão
- A verificação de assinatura ocorre **antes** de qualquer lógica de pipeline ou acesso ao Supabase
- `verifyMetaSignature` está em `src/meta/signature.ts` — não modificado por esta PR
