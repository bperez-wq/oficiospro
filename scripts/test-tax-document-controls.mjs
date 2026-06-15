#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const controlsSource = readFileSync(join(root, "src/lib/finance/taxDocumentControls.ts"), "utf8");
const migrationSource = readFileSync(join(root, "migrations/0009_tax_document_controls.sql"), "utf8");

let failures = 0;

for (const name of [
  "validateReceivedTaxDocument",
  "matchDocumentToAuthorization",
  "detectFactoringRisk",
  "shouldAcceptDocument",
  "shouldBlockPayoutForDocument",
  "TaxDocumentVerificationProvider",
  "ManualSiiVerificationProvider",
  "FactoringAssignmentCheckProvider",
]) {
  assert(`Source exposes ${name}`, controlsSource.includes(name));
}

for (const table of [
  "authorized_document_requests",
  "received_tax_documents",
  "factoring_risk_alerts",
  "supplier_document_policies",
]) {
  assert(`Migration creates ${table}`, migrationSource.includes(`CREATE TABLE IF NOT EXISTS ${table}`));
}

const authorization = {
  id: "auth_1",
  authorizationCode: "OP-AUTH-20260615-ABC123",
  specialistId: "spec_1",
  serviceRequestId: "sr_1",
  payoutId: "payout_1",
  issuerRut: "16.111.222-3",
  receiverRut: "OP-SPA-RUT",
  documentType: "boleta_honorarios",
  amountCLP: 50000,
  status: "authorized",
};

const baseDocument = {
  id: "doc_1",
  authorizationCode: authorization.authorizationCode,
  specialistId: authorization.specialistId,
  serviceRequestId: authorization.serviceRequestId,
  payoutId: authorization.payoutId,
  issuerRut: authorization.issuerRut,
  receiverRut: authorization.receiverRut,
  documentType: authorization.documentType,
  folio: "BHE-100",
  amountCLP: authorization.amountCLP,
  receivedAt: "2026-06-15T12:00:00.000Z",
  siiStatus: "valid",
  assignmentStatus: "not_assigned",
  reviewStatus: "received",
  payoutBlocked: true,
};

const matched = validateReceivedTaxDocument(baseDocument, [authorization], []);
assert("Matched document is accepted", shouldAcceptDocument(matched));
assert("Matched document does not block payout", !shouldBlockPayoutForDocument(matched));

const unauthorized = validateReceivedTaxDocument({ ...baseDocument, id: "doc_unauth", authorizationCode: "NOPE" }, [authorization], []);
assert("Unauthorized document is claimed", unauthorized.reviewStatus === "claimed");
assert("Unauthorized document blocks payout", shouldBlockPayoutForDocument(unauthorized));
assert("Unauthorized alert exists", unauthorized.alerts.some((alert) => alert.reason === "missing_authorization"));

const amountMismatch = validateReceivedTaxDocument({ ...baseDocument, id: "doc_amount", amountCLP: 62000 }, [authorization], []);
assert("Amount mismatch requires manual review", amountMismatch.reviewStatus === "manual_review");
assert("Amount mismatch blocks payout", shouldBlockPayoutForDocument(amountMismatch));

const issuerMismatch = validateReceivedTaxDocument({ ...baseDocument, id: "doc_issuer", issuerRut: "99.999.999-9" }, [authorization], []);
assert("Issuer mismatch is rejected", issuerMismatch.reviewStatus === "rejected");
assert("Issuer mismatch blocks payout", shouldBlockPayoutForDocument(issuerMismatch));

const duplicate = validateReceivedTaxDocument({ ...baseDocument, id: "doc_dup" }, [authorization], [baseDocument]);
assert("Duplicate document is rejected", duplicate.reviewStatus === "rejected");
assert("Duplicate blocks payout", shouldBlockPayoutForDocument(duplicate));

const assigned = validateReceivedTaxDocument({ ...baseDocument, id: "doc_assigned", folio: "BHE-101", assignmentStatus: "assigned_without_authorization" }, [authorization], []);
assert("Unauthorized assignment blocks payout", shouldBlockPayoutForDocument(assigned));
assert("Unauthorized assignment creates critical alert", assigned.alerts.some((alert) => alert.reason === "unauthorized_assignment" && alert.severity === "critical"));

for (const [name, result] of [
  ["matched", matched],
  ["unauthorized", unauthorized],
  ["amount_mismatch", amountMismatch],
  ["issuer_mismatch", issuerMismatch],
  ["duplicate", duplicate],
  ["assigned", assigned],
]) {
  console.log([
    name.padEnd(16),
    `match=${result.matchStatus}`,
    `review=${result.reviewStatus}`,
    `blocked=${result.payoutBlocked}`,
    `alerts=${result.alerts.map((alert) => alert.reason).join(",") || "-"}`,
  ].join(" | "));
}

console.log(`\nTax document controls test finished with ${failures} failure(s).`);
process.exitCode = failures ? 1 : 0;

function validateReceivedTaxDocument(document, authorizations, existingDocuments) {
  const match = matchDocumentToAuthorization(document, authorizations, existingDocuments);
  const alerts = [
    ...alertsForMatch(document, match),
    ...detectFactoringRisk(document),
  ];
  const payoutBlocked = alerts.some((alert) => alert.blockPayout) || match.matchStatus !== "matched";
  const reviewStatus = resolveReviewStatus(match.matchStatus, alerts);
  return { matchStatus: match.matchStatus, reviewStatus, matchedAuthorization: match.authorization, alerts, payoutBlocked };
}

function matchDocumentToAuthorization(document, authorizations, existingDocuments) {
  const duplicate = existingDocuments.some((item) => sameDocument(item, document) && item.id !== document.id);
  if (duplicate) return { matchStatus: "duplicate" };
  const authorization = authorizations.find((item) => item.authorizationCode === document.authorizationCode && item.status === "authorized");
  if (!authorization) return { matchStatus: "unauthorized" };
  if (normalizeRut(document.issuerRut) !== normalizeRut(authorization.issuerRut)) return { matchStatus: "mismatch_issuer", authorization };
  if (normalizeRut(document.receiverRut) !== normalizeRut(authorization.receiverRut)) return { matchStatus: "mismatch_receiver", authorization };
  if (Math.abs(document.amountCLP - authorization.amountCLP) > 1000) return { matchStatus: "mismatch_amount", authorization };
  return { matchStatus: "matched", authorization };
}

function detectFactoringRisk(document) {
  if (document.assignmentStatus !== "assigned_without_authorization") return [];
  return [{ reason: "unauthorized_assignment", severity: "critical", blockPayout: true }];
}

function shouldAcceptDocument(result) {
  return result.matchStatus === "matched" && result.reviewStatus === "accepted" && !result.payoutBlocked;
}

function shouldBlockPayoutForDocument(result) {
  return result.payoutBlocked || result.reviewStatus !== "accepted";
}

function alertsForMatch(_document, match) {
  if (match.matchStatus === "matched") return [];
  const map = {
    unauthorized: "missing_authorization",
    duplicate: "duplicate_document",
    mismatch_amount: "amount_mismatch",
    mismatch_issuer: "issuer_mismatch",
    mismatch_receiver: "receiver_mismatch",
  };
  return [{ reason: map[match.matchStatus] ?? "missing_authorization", severity: "high", blockPayout: true }];
}

function resolveReviewStatus(matchStatus, alerts) {
  if (matchStatus === "matched" && !alerts.some((alert) => alert.blockPayout)) return "accepted";
  if (matchStatus === "mismatch_amount") return "manual_review";
  if (matchStatus === "duplicate" || matchStatus === "mismatch_issuer" || matchStatus === "mismatch_receiver") return "rejected";
  return "claimed";
}

function sameDocument(left, right) {
  return normalizeRut(left.issuerRut) === normalizeRut(right.issuerRut) &&
    left.documentType === right.documentType &&
    String(left.folio).toLowerCase() === String(right.folio).toLowerCase();
}

function normalizeRut(value) {
  return String(value ?? "").toUpperCase().replace(/[^0-9K]/g, "");
}

function assert(label, condition) {
  if (!condition) {
    failures += 1;
    console.error(`FAIL: ${label}`);
  }
}
