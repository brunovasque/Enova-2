import { NextResponse } from "next/server";

// E2-known fase_conversa values — only these are written by src/supabase/crm-store.ts
// mapStageCurrentToFaseConversa(). All other values are legacy Enova-1 stages and must
// be suppressed to avoid displaying stale data in the Conversas list.
const KNOWN_E2_FASE_CONVERSA = new Set([
  "envio_docs",
  "aguardando_retorno_correspondente",
  "agendamento_visita",
  "visita_confirmada",
  "finalizacao_processo",
]);

type ConversationsResponse = {
  ok: boolean;
  conversations: Conversation[];
  error?: string;
};

type EnovaStateRow = {
  wa_id: string | null;
  nome: string | null;
  last_incoming_text: string | null;
  last_user_msg: string | null;
  last_bot_msg: string | null;
  last_incoming_at: string | null;
  updated_at: string | null;
  created_at: string | null;
  fase_conversa: string | null;
  funil_status: string | null;
  atendimento_manual: boolean | null;
};

type EnovaLogRow = {
  wa_id: string | null;
  tag: string | null;
  meta_text: string | null;
  details: unknown;
  created_at: string | null;
};

type CrmLeadMetaEnrich = {
  wa_id: string;
  nome: string | null;
  lead_pool: string | null;
  lead_temp: string | null;
  status_operacional: string | null;
};

type Conversation = {
  id: string;
  wa_id: string;
  nome: string | null;
  last_message_text: string | null;
  last_message_at: string | null;
  updated_at: string | null;
  created_at: string | null;
  fase_conversa: string | null;
  funil_status: string | null;
  atendimento_manual: boolean;
  lead_pool: string | null;
  lead_temp: string | null;
  status_operacional: string | null;
};

const REQUIRED_ENVS = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE"] as const;

const jsonResponse = (body: ConversationsResponse, status: number) =>
  NextResponse.json<ConversationsResponse>(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });

function parseOutgoingText(details: unknown): string | null {
  if (!details) {
    return null;
  }

  try {
    const parsed = typeof details === "string" ? JSON.parse(details) : details;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const candidate =
      (parsed as Record<string, unknown>).reply ??
      (parsed as Record<string, unknown>).bot_text ??
      (parsed as Record<string, unknown>).answer;

    return typeof candidate === "string" ? normalizeText(candidate) : null;
  } catch {
    return null;
  }
}

function normalizeText(value: string | null | undefined): string | null {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized.length > 0 ? normalized : null;
}

function compareDatesDesc(left: string | null, right: string | null): number {
  const parsedLeft = left ? new Date(left).getTime() : Number.NEGATIVE_INFINITY;
  const parsedRight = right ? new Date(right).getTime() : Number.NEGATIVE_INFINITY;
  const leftTs = Number.isFinite(parsedLeft) ? parsedLeft : Number.NEGATIVE_INFINITY;
  const rightTs = Number.isFinite(parsedRight) ? parsedRight : Number.NEGATIVE_INFINITY;

  return rightTs - leftTs;
}

// Returns the fase_conversa only when it is an E2-known value.
// Legacy Enova-1 stages (inicio, clt_renda_perfil_informativo, etc.) are suppressed.
function normalizeFaseConversa(value: string | null): string | null {
  if (!value) return null;
  return KNOWN_E2_FASE_CONVERSA.has(value) ? value : null;
}

export async function GET() {
  const missingEnvs = REQUIRED_ENVS.filter((envName) => !process.env[envName]);

  if (missingEnvs.length > 0) {
    return jsonResponse(
      {
        ok: false,
        conversations: [],
        error: `missing env: ${missingEnvs.join(", ")}`,
      },
      500,
    );
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL as string;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE as string;

    // Primary source: enova_state owns atendimento_manual and the canonical wa_id list.
    const response = await fetch(
      new URL(
        "/rest/v1/enova_state?select=*&order=updated_at.desc&limit=200",
        supabaseUrl,
      ),
      {
        method: "GET",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return jsonResponse(
        {
          ok: false,
          conversations: [],
          error: `supabase query failed (${response.status})`,
        },
        502,
      );
    }

    const rows = (await response.json()) as EnovaStateRow[];
    const waIds = Array.isArray(rows)
      ? rows
          .map((row) => row.wa_id)
          .filter((waId): waId is string => typeof waId === "string" && waId.length > 0)
      : [];

    const latestByWaId = new Map<string, { text: string | null; createdAt: string | null }>();
    const crmByWaId = new Map<string, CrmLeadMetaEnrich>();

    if (waIds.length > 0) {
      const escapedWaIds = waIds.map((waId) => `"${waId.replace(/\"/g, '\\\"')}"`).join(",");

      // Enrichment 1: enova_log — legacy fallback for last_message_text (Enova-1 data only;
      // Enova-2 Worker does not write meta_minimal/DECISION_OUTPUT/SEND_OK tags).
      const logsEndpoint = new URL("/rest/v1/enova_log", supabaseUrl);
      logsEndpoint.searchParams.set("select", "wa_id,tag,meta_text,details,created_at");
      logsEndpoint.searchParams.set("wa_id", `in.(${escapedWaIds})`);
      logsEndpoint.searchParams.set("tag", "in.(meta_minimal,DECISION_OUTPUT,SEND_OK)");
      logsEndpoint.searchParams.set("order", "created_at.desc");
      logsEndpoint.searchParams.set("limit", "3000");

      // Enrichment 2: crm_lead_meta — current CRM data managed by the panel itself.
      // Provides nome, lead_pool, lead_temp, status_operacional (always up-to-date).
      const crmEndpoint = new URL("/rest/v1/crm_lead_meta", supabaseUrl);
      crmEndpoint.searchParams.set("select", "wa_id,nome,lead_pool,lead_temp,status_operacional");
      crmEndpoint.searchParams.set("wa_id", `in.(${escapedWaIds})`);
      crmEndpoint.searchParams.set("limit", "200");

      const [logsResponse, crmResponse] = await Promise.all([
        fetch(logsEndpoint, {
          method: "GET",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          cache: "no-store",
        }),
        fetch(crmEndpoint, {
          method: "GET",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          cache: "no-store",
        }),
      ]);

      if (logsResponse.ok) {
        const logRows = (await logsResponse.json()) as EnovaLogRow[];

        if (Array.isArray(logRows)) {
          for (const logRow of logRows) {
            if (!logRow.wa_id || latestByWaId.has(logRow.wa_id)) {
              continue;
            }

            let text: string | null = null;

            if (logRow.tag === "meta_minimal") {
              text = normalizeText(logRow.meta_text);
            } else if (logRow.tag === "DECISION_OUTPUT" || logRow.tag === "SEND_OK") {
              text = parseOutgoingText(logRow.details) ?? normalizeText(logRow.meta_text);
            }

            if (!text) {
              continue;
            }

            latestByWaId.set(logRow.wa_id, {
              text,
              createdAt: logRow.created_at ?? null,
            });
          }
        }
      }

      if (crmResponse.ok) {
        const crmRows = (await crmResponse.json()) as CrmLeadMetaEnrich[];
        if (Array.isArray(crmRows)) {
          for (const crmRow of crmRows) {
            if (crmRow.wa_id) {
              crmByWaId.set(crmRow.wa_id, crmRow);
            }
          }
        }
      }
    }

    const conversations = Array.isArray(rows)
      ? rows
          .filter((row) => typeof row?.wa_id === "string" && row.wa_id.length > 0)
          .map((row) => {
            const waId = row.wa_id as string;
            const latestLog = latestByWaId.get(waId);
            const crm = crmByWaId.get(waId) ?? null;
            const activityAt =
              latestLog?.createdAt ?? row.last_incoming_at ?? row.updated_at ?? row.created_at ?? null;

            // Prefer crm_lead_meta.nome (panel-managed) over enova_state.nome (stale E1).
            const nome = normalizeText(crm?.nome) ?? normalizeText(row.nome);

            return {
              id: waId,
              wa_id: waId,
              nome,
              last_message_text:
                latestLog?.text ??
                normalizeText(row.last_incoming_text) ??
                normalizeText(row.last_user_msg) ??
                normalizeText(row.last_bot_msg) ??
                null,
              last_message_at: activityAt,
              updated_at: row.updated_at ?? null,
              created_at: row.created_at ?? null,
              // Suppress legacy E1 fase_conversa values; only show E2-known stages.
              fase_conversa: normalizeFaseConversa(row.fase_conversa),
              // funil_status from enova_state is entirely legacy E1 — always null here.
              funil_status: null,
              atendimento_manual: Boolean(row.atendimento_manual),
              lead_pool: typeof crm?.lead_pool === "string" ? crm.lead_pool : null,
              lead_temp: typeof crm?.lead_temp === "string" ? crm.lead_temp : null,
              status_operacional: typeof crm?.status_operacional === "string" ? crm.status_operacional : null,
            };
          })
          .sort((left, right) => compareDatesDesc(left.last_message_at, right.last_message_at))
      : [];

    return jsonResponse(
      {
        ok: true,
        conversations,
      },
      200,
    );
  } catch {
    return jsonResponse(
      {
        ok: false,
        conversations: [],
        error: "failed to load conversations",
      },
      500,
    );
  }
}
