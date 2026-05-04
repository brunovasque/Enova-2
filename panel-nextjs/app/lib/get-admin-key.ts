export function getAdminKey(env: Record<string, string | undefined> = process.env): string {
  return env.CRM_ADMIN_KEY ?? env.ENOVA_ADMIN_KEY ?? "";
}
