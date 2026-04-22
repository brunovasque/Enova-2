# CLOUDFLARE RUNTIME AUDIT — 2026-04-22

## Finalidade

Registrar, de forma auditável, o limite entre:
- governança/documentação do repositório,
- código versionado executável,
- e o que é confirmável como publicação no Worker Cloudflare.

Esta auditoria é **pré-abertura da Frente 6** e não abre novo escopo técnico.

## Pergunta-mãe auditada

“Onde a linguagem está velha, onde a governança está desalinhada, e o que já é integração viva versus o que ainda não passa do repo para o Cloudflare?”

## Fontes auditadas nesta PR

- `README.md`
- `docs/BOOTSTRAP_CLOUDFLARE.md`
- `schema/README_EXECUCAO.md`
- `schema/CODEX_WORKFLOW.md`
- `schema/CLOUDFLARE_PERMISSION_PROTOCOL.md`
- `schema/contracts/_INDEX.md`
- `schema/status/_INDEX.md`
- `schema/status/AUDIO_E_MULTIMODALIDADE_STATUS.md`
- `schema/handoffs/AUDIO_E_MULTIMODALIDADE_LATEST.md`
- `wrangler.toml`
- `.github/workflows/deploy.yml`
- `src/worker.ts`
- `src/worker-route-smoke.ts`
- `package.json`
- smokes/runtimes de `core`, `audio`, `context`, `adapter`, `speech` (via scripts em `package.json`)

## Confirmado pelo repositório

1. Há runtime técnico versionado no repo (não apenas documentação), com módulos em `src/core`, `src/speech`, `src/context`, `src/adapter` e `src/audio`.
2. O entrypoint de deploy Cloudflare é `src/worker.ts` (`wrangler.toml`).
3. O Worker expõe rota técnica viva `POST /__core__/run` e retorna apenas JSON estrutural (sem surface conversacional).
4. O pipeline de deploy existe em `.github/workflows/deploy.yml`:
   - deploy automático em push para `main`;
   - deploy manual para `test`/`prod` com trava de `prod` fora da `main`.
5. Há smoke de rota do Worker (`npm run smoke:worker`) e suíte de smokes (`npm run smoke:all`) para validar comportamento do código versionado.

## Inferido pelo repositório (com alta confiança)

1. O bundle publicado pelo deploy atual tende a refletir o grafo de import do entrypoint `src/worker.ts`, portanto o caminho vivo exposto hoje é o da rota técnica do Worker.
2. Código de outras frentes pode existir no repositório sem estar necessariamente exposto como rota/fluxo ativo no Worker publicado.
3. Governança em `schema/` regula execução e contrato, mas não é publicada como runtime Cloudflare.

## Não verificável por esta PR (sem acesso externo)

1. Qual commit está efetivamente ativo no runtime Cloudflare neste instante.
2. Estado real do Worker em produção/teste no dashboard/logs da Cloudflare.
3. Saúde de secrets/bindings/tokens reais no ambiente Cloudflare.
4. URL pública/rota externa efetivamente resolvendo no edge neste momento.

## Checklist humano para fechar auditoria 100% de runtime publicado

1. Executar pipeline de deploy da `main` e coletar `run id` + commit SHA publicado.
2. Validar no dashboard Cloudflare:
   - script `nv-enova-2` e `nv-enova-2-test`;
   - timestamp de deploy;
   - versão/commit correspondente.
3. Fazer chamada HTTP real para a rota técnica publicada e comparar payload com `src/worker.ts`.
4. Conferir logs de execução no Cloudflare para confirmar rota e shape estrutural.

## Conclusão canônica desta auditoria

- O repo Enova-2 **não** está mais em estado “somente documental”.
- Já existe bootstrap/deploy/worker técnico mínimo funcional no código versionado.
- O deploy atual publica o que está conectado ao entrypoint do Worker.
- Itens como Meta/WhatsApp, STT/TTS real, rollout, telemetria profunda e bindings adicionais continuam fora do recorte atual.
- Abertura da Frente 6 permanece como próximo passo autorizado, mas **não é iniciada nesta PR**.
