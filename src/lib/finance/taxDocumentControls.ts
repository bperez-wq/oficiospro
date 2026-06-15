import { OP_SPA_DOCUMENT_RECEIVER, type RequiredSpecialistDocumentKind } from "@/data/specialistFormalization";

export type TaxDocumentControlStatus =
  | "draft"
  | "authorized"
  | "invalidated"
  | "received"
  | "accepted"
  | "claimed"
  | "rejected"
  | "manual_review";

export type TaxDocumentMatchStatus =
  | "matched"
  | "unauthorized"
  | "duplicate"
  | "mismatch_amount"
  | "mismatch_issuer"
  | "mismatch_receiver"
  | "invalid_authorization";

export type TaxDocumentAssignmentStatus =
  | "unknown"
  | "not_assigned"
  | "assigned_without_authorization"
  | "assigned_with_authorization";

export type TaxDocumentSiiStatus = "pending_manual_check" | "valid" | "not_found" | "rejected" | "error";

export type AuthorizedDocumentRequest = {
  id: string;
  authorizationCode: string;
  specialistId: string;
  serviceRequestId?: string;
  payoutId?: string;
  issuerRut: string;
  issuerLegalName?: string;
  receiverRut: string;
  documentType: RequiredSpecialistDocumentKind;
  amountCLP: number;
  status: Extract<TaxDocumentControlStatus, "draft" | "authorized" | "invalidated">;
  reason?: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  invalidatedAt?: string;
};

export type ReceivedTaxDocument = {
  id: string;
  authorizationCode?: string;
  specialistId?: string;
  serviceRequestId?: string;
  payoutId?: string;
  issuerRut: string;
  issuerLegalName?: string;
  receiverRut: string;
  documentType: RequiredSpecialistDocumentKind;
  folio: string;
  amountCLP: number;
  issuedAt?: string;
  receivedAt: string;
  source?: string;
  isTest?: boolean;
  testRunId?: string;
  siiStatus: TaxDocumentSiiStatus;
  assignmentStatus: TaxDocumentAssignmentStatus;
  assignmentProviderReference?: string;
  reviewStatus: Extract<TaxDocumentControlStatus, "received" | "accepted" | "claimed" | "rejected" | "manual_review">;
  matchedAuthorizationId?: string;
  payoutBlocked: boolean;
};

export type FactoringRiskAlert = {
  id: string;
  documentId: string;
  authorizationId?: string;
  severity: "low" | "medium" | "high" | "critical";
  reason:
    | "missing_authorization"
    | "amount_mismatch"
    | "issuer_mismatch"
    | "receiver_mismatch"
    | "duplicate_document"
    | "unauthorized_assignment"
    | "manual_sii_review_required";
  detail: string;
  status: "open" | "in_review" | "resolved" | "dismissed";
  blockPayout: boolean;
  createdAt: string;
};

export type SupplierDocumentPolicy = {
  specialistId?: string;
  documentsRequireAuthorization: boolean;
  assignmentRequiresWrittenApproval: boolean;
  allowFactoring: boolean;
  acceptedReceiverRut: string;
  amountToleranceCLP: number;
  allowedDocumentTypes: RequiredSpecialistDocumentKind[];
};

export type TaxDocumentValidationResult = {
  matchStatus: TaxDocumentMatchStatus;
  reviewStatus: ReceivedTaxDocument["reviewStatus"];
  matchedAuthorization?: AuthorizedDocumentRequest;
  alerts: FactoringRiskAlert[];
  payoutBlocked: boolean;
  reasons: string[];
};

export type TaxDocumentVerificationResult = {
  siiStatus: TaxDocumentSiiStatus;
  assignmentStatus: TaxDocumentAssignmentStatus;
  checkedAt: string;
  checklist: string[];
  notes?: string;
};

export interface TaxDocumentVerificationProvider {
  verify(document: ReceivedTaxDocument): Promise<TaxDocumentVerificationResult>;
}

export class ManualSiiVerificationProvider implements TaxDocumentVerificationProvider {
  async verify(): Promise<TaxDocumentVerificationResult> {
    return {
      siiStatus: "pending_manual_check",
      assignmentStatus: "unknown",
      checkedAt: new Date().toISOString(),
      checklist: manualTaxDocumentChecklist(),
      notes: "Validacion SII manual pendiente. No automatiza consulta real al SII.",
    };
  }
}

export class FactoringAssignmentCheckProvider implements TaxDocumentVerificationProvider {
  async verify(document: ReceivedTaxDocument): Promise<TaxDocumentVerificationResult> {
    return {
      siiStatus: document.siiStatus ?? "pending_manual_check",
      assignmentStatus: document.assignmentStatus ?? "unknown",
      checkedAt: new Date().toISOString(),
      checklist: [
        "Revisar si el DTE fue cedido en registro de cesion/factoring.",
        "Confirmar si existe autorizacion escrita de OP SpA para cesion.",
        "Bloquear payout si existe cesion no autorizada.",
      ],
      notes: "Stub preparado para proveedor de cesion/factoring. No consulta servicios externos.",
    };
  }
}

export const defaultSupplierDocumentPolicy: SupplierDocumentPolicy = {
  documentsRequireAuthorization: true,
  assignmentRequiresWrittenApproval: true,
  allowFactoring: false,
  acceptedReceiverRut: OP_SPA_DOCUMENT_RECEIVER.rut,
  amountToleranceCLP: 1000,
  allowedDocumentTypes: ["boleta_honorarios", "factura_afecta", "factura_exenta"],
};

export function validateReceivedTaxDocument({
  document,
  authorizations,
  existingDocuments = [],
  policy = defaultSupplierDocumentPolicy,
}: {
  document: ReceivedTaxDocument;
  authorizations: AuthorizedDocumentRequest[];
  existingDocuments?: ReceivedTaxDocument[];
  policy?: SupplierDocumentPolicy;
}): TaxDocumentValidationResult {
  const match = matchDocumentToAuthorization({ document, authorizations, existingDocuments, policy });
  const alerts = [
    ...alertsForMatch(document, match, policy),
    ...detectFactoringRisk(document, policy, match.matchedAuthorization),
  ];
  const payoutBlocked = alerts.some((alert) => alert.blockPayout) || match.matchStatus !== "matched";
  const reviewStatus = resolveReviewStatus(match.matchStatus, alerts);

  return {
    matchStatus: match.matchStatus,
    reviewStatus,
    matchedAuthorization: match.matchedAuthorization,
    alerts,
    payoutBlocked,
    reasons: match.reasons,
  };
}

export function matchDocumentToAuthorization({
  document,
  authorizations,
  existingDocuments = [],
  policy = defaultSupplierDocumentPolicy,
}: {
  document: ReceivedTaxDocument;
  authorizations: AuthorizedDocumentRequest[];
  existingDocuments?: ReceivedTaxDocument[];
  policy?: SupplierDocumentPolicy;
}) {
  const duplicate = existingDocuments.some((item) => isSameTaxDocument(item, document) && item.id !== document.id);
  if (duplicate) {
    return {
      matchStatus: "duplicate" as TaxDocumentMatchStatus,
      matchedAuthorization: undefined,
      reasons: ["Documento duplicado por emisor, tipo y folio."],
      amountDeltaCLP: 0,
    };
  }

  const authorization = findAuthorization(document, authorizations);
  if (!authorization) {
    return {
      matchStatus: "unauthorized" as TaxDocumentMatchStatus,
      matchedAuthorization: undefined,
      reasons: ["No existe autorizacion interna previa para este documento."],
      amountDeltaCLP: 0,
    };
  }

  if (authorization.status !== "authorized") {
    return {
      matchStatus: "invalid_authorization" as TaxDocumentMatchStatus,
      matchedAuthorization: authorization,
      reasons: ["La autorizacion existe, pero no esta vigente."],
      amountDeltaCLP: document.amountCLP - authorization.amountCLP,
    };
  }

  if (normalizeRut(document.issuerRut) !== normalizeRut(authorization.issuerRut)) {
    return {
      matchStatus: "mismatch_issuer" as TaxDocumentMatchStatus,
      matchedAuthorization: authorization,
      reasons: ["El RUT emisor no coincide con la autorizacion."],
      amountDeltaCLP: document.amountCLP - authorization.amountCLP,
    };
  }

  if (policy.acceptedReceiverRut && normalizeRut(document.receiverRut) !== normalizeRut(policy.acceptedReceiverRut)) {
    return {
      matchStatus: "mismatch_receiver" as TaxDocumentMatchStatus,
      matchedAuthorization: authorization,
      reasons: ["El receptor no coincide con OP SpA autorizado."],
      amountDeltaCLP: document.amountCLP - authorization.amountCLP,
    };
  }

  const amountDeltaCLP = document.amountCLP - authorization.amountCLP;
  if (Math.abs(amountDeltaCLP) > policy.amountToleranceCLP) {
    return {
      matchStatus: "mismatch_amount" as TaxDocumentMatchStatus,
      matchedAuthorization: authorization,
      reasons: ["El monto del documento no coincide con la autorizacion."],
      amountDeltaCLP,
    };
  }

  return {
    matchStatus: "matched" as TaxDocumentMatchStatus,
    matchedAuthorization: authorization,
    reasons: [],
    amountDeltaCLP,
  };
}

export function detectFactoringRisk(
  document: ReceivedTaxDocument,
  policy: SupplierDocumentPolicy = defaultSupplierDocumentPolicy,
  authorization?: AuthorizedDocumentRequest,
): FactoringRiskAlert[] {
  const alerts: FactoringRiskAlert[] = [];
  if (document.assignmentStatus === "assigned_without_authorization" && policy.assignmentRequiresWrittenApproval) {
    alerts.push(createAlert({
      document,
      authorizationId: authorization?.id,
      severity: "critical",
      reason: "unauthorized_assignment",
      detail: "Documento cedido/factorizado sin autorizacion previa y por escrito de OP SpA.",
      blockPayout: true,
    }));
  }
  if (document.assignmentStatus === "unknown") {
    alerts.push(createAlert({
      document,
      authorizationId: authorization?.id,
      severity: "medium",
      reason: "manual_sii_review_required",
      detail: "Estado de cesion/factoring pendiente de revision manual.",
      blockPayout: false,
    }));
  }
  return alerts;
}

export function shouldAcceptDocument(result: TaxDocumentValidationResult) {
  return result.matchStatus === "matched" && !result.payoutBlocked && result.reviewStatus === "accepted";
}

export function shouldBlockPayoutForDocument(result: TaxDocumentValidationResult) {
  return result.payoutBlocked || result.reviewStatus !== "accepted";
}

export function createAuthorizationCode(prefix = "OP-AUTH") {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${date}-${random}`;
}

export function manualTaxDocumentChecklist() {
  return [
    "Confirmar que existe authorizationCode vigente antes de recibir el documento.",
    "Verificar RUT emisor, receptor OP SpA, tipo, folio y monto.",
    "Validar estado SII del documento cuando exista integracion o revision manual.",
    "Revisar si el documento fue cedido, factorizado o transferido.",
    "Bloquear payout y crear tarea contable/legal si hay documento no autorizado.",
  ];
}

function findAuthorization(document: ReceivedTaxDocument, authorizations: AuthorizedDocumentRequest[]) {
  const active = authorizations.filter((authorization) => authorization.status === "authorized");
  if (document.authorizationCode) {
    const byCode = active.find((authorization) => authorization.authorizationCode === document.authorizationCode);
    if (byCode) return byCode;
  }
  return active.find((authorization) => {
    const sameIssuer = normalizeRut(authorization.issuerRut) === normalizeRut(document.issuerRut);
    const sameType = authorization.documentType === document.documentType;
    const sameService = !authorization.serviceRequestId || !document.serviceRequestId || authorization.serviceRequestId === document.serviceRequestId;
    const samePayout = !authorization.payoutId || !document.payoutId || authorization.payoutId === document.payoutId;
    return sameIssuer && sameType && sameService && samePayout;
  });
}

function alertsForMatch(
  document: ReceivedTaxDocument,
  match: ReturnType<typeof matchDocumentToAuthorization>,
  policy: SupplierDocumentPolicy,
) {
  const common = { document, authorizationId: match.matchedAuthorization?.id };
  if (match.matchStatus === "matched") return [];
  if (match.matchStatus === "duplicate") {
    return [createAlert({ ...common, severity: "high", reason: "duplicate_document", detail: match.reasons[0], blockPayout: true })];
  }
  if (match.matchStatus === "mismatch_amount") {
    return [createAlert({ ...common, severity: "medium", reason: "amount_mismatch", detail: match.reasons[0], blockPayout: true })];
  }
  if (match.matchStatus === "mismatch_issuer") {
    return [createAlert({ ...common, severity: "critical", reason: "issuer_mismatch", detail: match.reasons[0], blockPayout: true })];
  }
  if (match.matchStatus === "mismatch_receiver") {
    return [createAlert({ ...common, severity: "critical", reason: "receiver_mismatch", detail: match.reasons[0], blockPayout: true })];
  }
  return [
    createAlert({
      ...common,
      severity: policy.documentsRequireAuthorization ? "high" : "medium",
      reason: "missing_authorization",
      detail: match.reasons[0] ?? "Documento recibido sin autorizacion previa.",
      blockPayout: true,
    }),
  ];
}

function createAlert(input: {
  document: ReceivedTaxDocument;
  authorizationId?: string;
  severity: FactoringRiskAlert["severity"];
  reason: FactoringRiskAlert["reason"];
  detail: string;
  blockPayout: boolean;
}): FactoringRiskAlert {
  return {
    id: `tax_alert_${input.document.id}_${input.reason}`,
    documentId: input.document.id,
    authorizationId: input.authorizationId,
    severity: input.severity,
    reason: input.reason,
    detail: input.detail,
    status: "open",
    blockPayout: input.blockPayout,
    createdAt: new Date().toISOString(),
  };
}

function resolveReviewStatus(matchStatus: TaxDocumentMatchStatus, alerts: FactoringRiskAlert[]): ReceivedTaxDocument["reviewStatus"] {
  if (matchStatus === "matched" && !alerts.some((alert) => alert.blockPayout)) return "accepted";
  if (matchStatus === "mismatch_amount") return "manual_review";
  if (matchStatus === "duplicate" || matchStatus === "mismatch_issuer" || matchStatus === "mismatch_receiver") return "rejected";
  return "claimed";
}

function isSameTaxDocument(left: ReceivedTaxDocument, right: ReceivedTaxDocument) {
  return (
    normalizeRut(left.issuerRut) === normalizeRut(right.issuerRut) &&
    left.documentType === right.documentType &&
    String(left.folio).trim().toLowerCase() === String(right.folio).trim().toLowerCase()
  );
}

function normalizeRut(value: string) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^0-9K]/g, "");
}
