# T10.3 — Prova de Import Bruto do Painel Enova 1 → panel-nextjs/

**Tipo**: PR-IMPL — import bruto
**Branch**: `feat/t10.3-panel-import-bruto`
**Contrato ativo**: `schema/contracts/active/CONTRATO_T10_PANEL_CRM_MIGRATION.md`
**Data**: 2026-05-03
**Critério que esta prova fecha**: CA-T10-02 (P-T10-01)

---

## 1. Origem e destino

| Campo | Valor |
|-------|-------|
| Origem | `D:\Enova\panel` — repo legado Enova 1 (READ-ONLY) |
| Destino | `D:\Enova-2\panel-nextjs\` — subdiretório isolado no repo Enova-2 |
| Ferramenta de cópia | `robocopy` (Windows) — modo `/E` (recursivo com subdiretórios vazios) |

---

## 2. Estratégia de cópia

- Cópia bruta/fiel — sem adaptação de código funcional
- Sem alterar auth, envs, chamadas Supabase, chamadas Worker, visual/UX
- Exclusão explícita de `node_modules/`, `.next/`, arquivos `.env*`
- Preservação de estrutura de diretórios, nomes de arquivos e conteúdo
- D:\Enova permaneceu READ-ONLY durante toda a operação

---

## 3. Contagem de arquivos

| Local | Arquivos (excl. node_modules/.next/.env) |
|-------|------------------------------------------|
| Origem: `D:\Enova\panel` | **100** |
| Destino: `D:\Enova-2\panel-nextjs` | **100** |
| Delta | **0** — cópia completa sem perda |

---

## 4. Arquivos copiados (lista completa)

```
.gitignore
app\api\atendimento\_shared.ts
app\api\bases\_shared.ts
app\api\bases\route.ts
app\api\case-files\_shared.ts
app\api\case-files\diagnostic\route.ts
app\api\case-files\open\route.ts
app\api\case-files\route.ts
app\api\client-profile\_shared.ts
app\api\client-profile\route.ts
app\api\conversations\route.ts
app\api\crm\_shared.ts
app\api\crm\route.ts
app\api\enova-ia-chat\route.ts
app\api\health\route.ts
app\api\incidentes\_shared.ts
app\api\manual-mode\route.ts
app\api\messages\route.ts
app\api\prefill\_shared.ts
app\api\prefill\route.ts
app\api\send\route.ts
app\atendimento\[wa_id]\AtendimentoDetalheUI.tsx
app\atendimento\[wa_id]\detalhe.module.css
app\atendimento\[wa_id]\page.tsx
app\atendimento\actions.ts
app\atendimento\atendimento.module.css
app\atendimento\AtendimentoUI.tsx
app\atendimento\loading.tsx
app\atendimento\page.tsx
app\bases\_callNowSuggest.ts
app\bases\actions.ts
app\bases\bases.module.css
app\bases\BasesUI.tsx
app\bases\page.tsx
app\components\PanelNav.tsx
app\conversations\conversations.module.css
app\conversations\ConversationUI.tsx
app\conversations\loading.tsx
app\conversations\page.tsx
app\conversations\PdfThumbnail.tsx
app\conversations\SmartFilePreview.tsx
app\crm\actions.ts
app\crm\aprovado-ficha.module.css
app\crm\AprovadoFichaView.tsx
app\crm\crm.module.css
app\crm\CrmUI.tsx
app\crm\page.tsx
app\dashboard\loading.tsx
app\dashboard\page.tsx
app\dossie\actions.ts
app\dossie\dossie.module.css
app\dossie\DossieUI.tsx
app\dossie\page.tsx
app\enova-ia\enova-ia.module.css
app\enova-ia\EnovaIaUI.tsx
app\enova-ia\page.tsx
app\globals.css
app\incidentes\actions.ts
app\incidentes\incidentes.module.css
app\incidentes\IncidentesUI.tsx
app\incidentes\page.tsx
app\layout.tsx
app\lib\enova-ia-action-builder.ts
app\lib\enova-ia-chat.ts
app\lib\enova-ia-execution-bridge.ts
app\lib\enova-ia-execution-contract.ts
app\lib\enova-ia-execution-handshake.ts
app\lib\enova-ia-fila.ts
app\lib\enova-ia-knowledge.ts
app\lib\enova-ia-leitura.ts
app\lib\enova-ia-openai.ts
app\lib\enova-ia-pre-execution.ts
app\lib\enova-ia-preparation.ts
app\lib\enova-ia-programas.ts
app\lib\lead-autonomy.ts
app\lib\lead-autonomy-labels.ts
app\lib\lead-cognitive.ts
app\lib\lead-cognitive-labels.ts
app\lib\lead-docs.ts
app\lib\lead-docs-labels.ts
app\lib\lead-followup.ts
app\lib\lead-followup-labels.ts
app\lib\lead-meta-ops.ts
app\lib\lead-meta-ops-labels.ts
app\lib\lead-reclassification.ts
app\lib\lead-reclassification-labels.ts
app\lib\lead-signals.ts
app\lib\lead-visit-readiness.ts
app\lib\lead-visit-readiness-labels.ts
app\page.tsx
next.config.js
next-env.d.ts
package.json
package-lock.json
public\brand\.keep
public\brand\enova-watermark.png
public\favicon.png
public\images\enova-logo.png
README.md
tsconfig.json
```

---

## 5. Itens excluídos intencionalmente

| Item excluído | Motivo |
|---------------|--------|
| `node_modules/` | Dependências instaláveis — não versionadas por convenção |
| `.next/` | Build cache gerado — não versionar |
| `.env`, `.env.*`, `.env.local` | Segredos/configuração de ambiente — nunca commitar |
| Logs locais | Arquivos temporários — não existem na origem relevante |
| Arquivos de cache temporários | Não existem na origem relevante |

---

## 6. Verificação de arquivos principais obrigatórios

| Arquivo | Presente? |
|---------|-----------|
| `panel-nextjs/package.json` | ✅ SIM |
| `panel-nextjs/next.config.js` | ✅ SIM |
| `panel-nextjs/tsconfig.json` | ✅ SIM |
| `panel-nextjs/app/layout.tsx` | ✅ SIM |
| `panel-nextjs/app/components/PanelNav.tsx` | ✅ SIM |
| `panel-nextjs/app/crm/CrmUI.tsx` | ✅ SIM |
| `panel-nextjs/app/api/crm/route.ts` | ✅ SIM |
| `panel-nextjs/app/api/crm/_shared.ts` | ✅ SIM |

Todos os 8 arquivos obrigatórios presentes.

---

## 7. Ajuste de .gitignore

O `.gitignore` raiz do Enova-2 foi atualizado com:

```gitignore
# panel-nextjs — subprojeto Next.js isolado
panel-nextjs/node_modules/
panel-nextjs/.next/
panel-nextjs/.env*
panel-nextjs/tsconfig.tsbuildinfo
panel-nextjs/public/pdf.worker.min.mjs
```

Nota: o `panel-nextjs/.gitignore` copiado da origem já exclui `.next/` e `node_modules/` localmente. O root `.gitignore` adiciona camada de proteção adicional para `.env*` e artefatos de build.

---

## 8. Declarações de soberania

- **D:\Enova permaneceu READ-ONLY**: nenhum arquivo foi criado, alterado ou deletado em `D:\Enova`. A operação foi exclusivamente de leitura na origem.
- **`src/` Worker não foi alterado**: `git status` confirma zero alterações em `src/`. O Worker Cloudflare permanece intacto.
- **Nenhum segredo copiado**: nenhum arquivo `.env`, `.env.local`, `.env.production` ou similar foi copiado.
- **Nenhuma adaptação funcional**: código copiado é idêntico ao da origem — sem modificação de auth, envs, chamadas Supabase, chamadas Worker, visual/UX.

---

## 9. Validação de git diff

Arquivos modificados nesta PR (esperado):
- `.gitignore` — adição de entradas `panel-nextjs/`
- `panel-nextjs/**` — 100 arquivos novos (import bruto)
- `schema/proofs/T10_3_PANEL_IMPORT_PROOF.md` — este arquivo
- `schema/status/IMPLANTACAO_MACRO_LLM_FIRST_STATUS.md` — atualizado
- `schema/handoffs/IMPLANTACAO_MACRO_LLM_FIRST_LATEST.md` — atualizado

Arquivos NÃO modificados:
- `src/` — zero alterações (confirmado por git status)
- `wrangler.toml` — zero alterações
- `schema/contracts/` — zero alterações
- Qualquer arquivo em `D:\Enova` — zero alterações

---

## 10. Lacunas declaradas

Nenhuma lacuna bloqueante para T10.3. As seguintes lacunas existem e serão tratadas em PRs futuras:

| Lacuna | PR que trata |
|--------|-------------|
| Envs não configuradas (`.env.local` não existe em `panel-nextjs/`) | T10.4-ADAPT |
| Auth header divergente (`x-enova-admin-key` vs `X-CRM-Admin-Key`) | T10.4-ADAPT |
| `WORKER_BASE_URL` não configurada | T10.4-ADAPT |
| `next build` não executado — pode ter erros de TypeScript/import | T10.5-RUN |
| 26 arquivos `app/lib/` ENOVA IA com lógica dependente de Enova 1 | T10.4/T10.5 — ENOVA IA pode não funcionar inicialmente |

---

## 11. Bloco E — Fechamento por Prova (A00-ADENDO-03)

```
--- BLOCO E — FECHAMENTO POR PROVA (A00-ADENDO-03) ---
Documento-base da evidência:           schema/proofs/T10_3_PANEL_IMPORT_PROOF.md
Estado da evidência:                   completa
Há lacuna remanescente?:               não — lacunas existentes são de fases futuras (T10.4/T10.5), não bloqueiam G10.2
Há item parcial/inconclusivo bloqueante?: não — contagem 100=100, 8/8 arquivos principais presentes, src/ intocado, D:\Enova read-only preservado
Fechamento permitido nesta PR?:        sim — G10.2 (import sem perda de arquivos) é fechado por esta PR
Estado permitido após esta PR:         G10.2 APROVADO; T10.4-ADAPT desbloqueada; T10 em execução
Próxima PR autorizada:                 T10.4-ADAPT (PR-IMPL — adaptação mínima: envs, auth, WORKER_BASE_URL, build)
```
