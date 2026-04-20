/**
 * ENOVA 2 — Cloudflare Worker entrypoint
 *
 * BOOTSTRAP PLACEHOLDER — sem lógica de produto, sem bindings, sem arquitetura prematura.
 * Este arquivo existe unicamente para satisfazer o campo `main` do wrangler.toml.
 * A implementação funcional será adicionada em PR dedicada, após contrato da frente ativa.
 *
 * NÃO ALTERAR este arquivo fora de uma PR contratual de implementação técnica.
 */
export default {
  fetch(_request: Request): Response {
    return new Response('ENOVA 2 — bootstrap placeholder', { status: 200 });
  },
} satisfies ExportedHandler;
