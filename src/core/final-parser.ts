/**
 * ENOVA 2 — Core Mecânico 2 — Parser/Extrator do Final Operacional (L17)
 */

import type {
  DocStatus,
  DocsChannelChoice,
  FinalParseStatus,
  HandoffReadiness,
  VisitInterest,
} from './final-rules.ts';
import {
  FINAL_COMPLETE_DOC_STATUSES,
  FINAL_DOCS_COLLECTION_REQUIRED_FACTS,
  FINAL_DOCS_PREP_REQUIRED_FACTS,
  FINAL_OPTIONAL_FACTS,
  FINAL_VISIT_REQUIRED_FACTS,
} from './final-rules.ts';

export interface FinalTurnExtract {
  facts_current: Record<string, unknown>;
  facts_extracted: Record<string, unknown>;
}

export interface FinalSignals {
  docs_channel_choice_detected: boolean;
  docs_channel_choice_value: DocsChannelChoice | null;
  visit_interest_detected: boolean;
  visit_interest_value: VisitInterest | null;
  doc_identity_status_detected: boolean;
  doc_identity_status_value: DocStatus | null;
  doc_income_status_detected: boolean;
  doc_income_status_value: DocStatus | null;
  doc_residence_status_detected: boolean;
  doc_residence_status_value: DocStatus | null;
  doc_ctps_status_detected: boolean;
  doc_ctps_status_value: DocStatus | null;
  handoff_readiness_detected: boolean;
  handoff_readiness_value: HandoffReadiness | null;
  visit_track_active: boolean;
  docs_complete: boolean;
  pending_doc_keys: string[];
  parse_status: FinalParseStatus;
  keys_checked: string[];
}

export function extractFinalSignals(input: FinalTurnExtract): FinalSignals {
  const merged: Record<string, unknown> = {
    ...input.facts_current,
    ...input.facts_extracted,
  };

  const docsChannelChoiceValue = normalizeDocsChannelChoice(merged['docs_channel_choice']);
  const visitInterestValue = normalizeVisitInterest(merged['visit_interest']);
  const docIdentityStatusValue = normalizeDocStatus(merged['doc_identity_status']);
  const docIncomeStatusValue = normalizeDocStatus(merged['doc_income_status']);
  const docResidenceStatusValue = normalizeDocStatus(merged['doc_residence_status']);
  const docCtpsStatusValue = normalizeDocStatus(merged['doc_ctps_status']);
  const handoffReadinessValue = normalizeHandoffReadiness(merged['handoff_readiness']);

  const visitTrackActive =
    docsChannelChoiceValue === 'visita_presencial' ||
    visitInterestValue === 'sim';

  const pendingDocKeys = [
    ['doc_identity_status', docIdentityStatusValue],
    ['doc_income_status', docIncomeStatusValue],
    ['doc_residence_status', docResidenceStatusValue],
  ].filter(([, value]) => value === null || !FINAL_COMPLETE_DOC_STATUSES.has(value))
    .map(([key]) => key);

  return {
    docs_channel_choice_detected: docsChannelChoiceValue !== null,
    docs_channel_choice_value: docsChannelChoiceValue,
    visit_interest_detected: visitInterestValue !== null,
    visit_interest_value: visitInterestValue,
    doc_identity_status_detected: docIdentityStatusValue !== null,
    doc_identity_status_value: docIdentityStatusValue,
    doc_income_status_detected: docIncomeStatusValue !== null,
    doc_income_status_value: docIncomeStatusValue,
    doc_residence_status_detected: docResidenceStatusValue !== null,
    doc_residence_status_value: docResidenceStatusValue,
    doc_ctps_status_detected: docCtpsStatusValue !== null,
    doc_ctps_status_value: docCtpsStatusValue,
    handoff_readiness_detected: handoffReadinessValue !== null,
    handoff_readiness_value: handoffReadinessValue,
    visit_track_active: visitTrackActive,
    docs_complete: pendingDocKeys.length === 0,
    pending_doc_keys: pendingDocKeys,
    parse_status: computeParseStatus(
      docsChannelChoiceValue !== null,
      visitInterestValue !== null,
      docIdentityStatusValue !== null,
      docIncomeStatusValue !== null,
      docResidenceStatusValue !== null,
      docCtpsStatusValue !== null,
      handoffReadinessValue !== null,
    ),
    keys_checked: [
      ...FINAL_DOCS_PREP_REQUIRED_FACTS,
      ...FINAL_DOCS_COLLECTION_REQUIRED_FACTS,
      ...FINAL_VISIT_REQUIRED_FACTS,
      ...FINAL_OPTIONAL_FACTS,
    ],
  };
}

function normalizeDocsChannelChoice(raw: unknown): DocsChannelChoice | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase();

  if (value === 'whatsapp') return 'whatsapp';
  if (value === 'site') return 'site';
  if (value === 'visita presencial' || value === 'visita_presencial') return 'visita_presencial';

  return null;
}

function normalizeVisitInterest(raw: unknown): VisitInterest | null {
  if (raw === null || raw === undefined) return null;

  if (typeof raw === 'boolean') {
    return raw ? 'sim' : 'nao';
  }

  const value = String(raw).trim().toLowerCase();
  if (value === 'sim') return 'sim';
  if (value === 'nao' || value === 'não') return 'nao';
  if (value === 'talvez') return 'talvez';

  return null;
}

function normalizeDocStatus(raw: unknown): DocStatus | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase();
  if (value === 'faltando' || value === 'parcial' || value === 'recebido' || value === 'validado') {
    return value as DocStatus;
  }

  return null;
}

function normalizeHandoffReadiness(raw: unknown): HandoffReadiness | null {
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim().toLowerCase().replace(/\s+/g, '_');

  if (
    value === 'none' ||
    value === 'parcial' ||
    value === 'pronto_para_docs' ||
    value === 'pronto_para_correspondente' ||
    value === 'pronto_para_visita'
  ) {
    return value as HandoffReadiness;
  }

  return null;
}

function computeParseStatus(
  docsChannelChoiceDetected: boolean,
  visitInterestDetected: boolean,
  docIdentityStatusDetected: boolean,
  docIncomeStatusDetected: boolean,
  docResidenceStatusDetected: boolean,
  docCtpsStatusDetected: boolean,
  handoffReadinessDetected: boolean,
): FinalParseStatus {
  if (docsChannelChoiceDetected || (docIdentityStatusDetected && docIncomeStatusDetected && docResidenceStatusDetected)) {
    return 'ready';
  }

  if (
    docsChannelChoiceDetected ||
    visitInterestDetected ||
    docIdentityStatusDetected ||
    docIncomeStatusDetected ||
    docResidenceStatusDetected ||
    docCtpsStatusDetected ||
    handoffReadinessDetected
  ) {
    return 'partial';
  }

  return 'empty';
}
