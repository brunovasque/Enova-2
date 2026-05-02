/**
 * ENOVA 2 — PR-DIAG T8 — Telemetria cirúrgica de diagnóstico PROD.
 *
 * console.log estruturado visível no wrangler tail.
 * Nunca loga secrets. Mascaramento obrigatório de IDs sensíveis.
 * Não muda comportamento. Não muda regra de negócio.
 */

export function maskId(id: string | null | undefined): string {
  if (!id || id.length === 0) return '(empty)';
  if (id.length <= 6) return id.slice(0, 2) + '****';
  return id.slice(0, 3) + '****' + id.slice(-3);
}

export function diagLog(action: string, details: Record<string, unknown>): void {
  try {
    console.log(JSON.stringify({ diag: action, ...details }));
  } catch {
    console.log(`[DIAG_ERR] ${action}`);
  }
}
