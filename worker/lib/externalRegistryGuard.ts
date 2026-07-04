export type ExternalRegistryAction = "booking" | "quotation" | "contact" | "real_sec_import";

const unclaimedStatuses = new Set(["UNCLAIMED_PUBLIC_REFERENCE", "public_reference", "unclaimed_public_reference"]);

export function isTruthyFlag(value: unknown) {
  return String(value ?? "").trim().toLowerCase() === "true";
}

export function isExternalRegistryPath(pathname: string) {
  return pathname.startsWith("/registro-publico-externo/");
}

export function isUnclaimedExternalTarget(payload: Record<string, unknown>) {
  const status = String(payload.profileStatus ?? payload.externalProfileStatus ?? payload.targetProfileStatus ?? "").trim();
  const id = String(payload.externalRef ?? payload.externalRegistryId ?? payload.externalCertifiedProfessionalId ?? payload.specialistId ?? payload.targetId ?? "").trim();
  const source = String(payload.source ?? payload.sourcePage ?? payload.sourceComponent ?? "").trim();
  const nested = nestedPayload(payload);
  const nestedStatus = String(nested.profileStatus ?? nested.externalProfileStatus ?? "").trim();
  const nestedId = String(nested.externalRef ?? nested.externalRegistryId ?? nested.externalCertifiedProfessionalId ?? "").trim();

  return (
    unclaimedStatuses.has(status) ||
    unclaimedStatuses.has(nestedStatus) ||
    id.startsWith("sec-prototype-") ||
    nestedId.startsWith("sec-prototype-") ||
    source.includes("external_public_registry")
  );
}

export function externalRegistryActionError(action: ExternalRegistryAction, payload: Record<string, unknown>) {
  if (action === "real_sec_import") return "real_sec_import_blocked_pending_legal_review";
  if (isUnclaimedExternalTarget(payload)) return `external_registry_${action}_blocked_unclaimed_profile`;
  return null;
}

export function assertExternalRegistryActionAllowed(action: ExternalRegistryAction, payload: Record<string, unknown>) {
  const error = externalRegistryActionError(action, payload);
  if (error) throw new Error(error);
}

export function assertRealSecImportAllowed(value: unknown) {
  if (!isTruthyFlag(value)) throw new Error("real_sec_import_blocked_pending_legal_review");
}

function nestedPayload(payload: Record<string, unknown>) {
  const value = payload.payload;
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
