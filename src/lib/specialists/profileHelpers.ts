import type { PendingSpecialistProfile, SpecialistPublicationStatus } from "@/lib/storage";

// Helpers PUROS del perfil de especialista, extraidos de storage.ts. No tocan
// localStorage ni el backend, asi que sobreviven a la migracion a DB real y son
// testeables de forma aislada. storage.ts los re-exporta para no romper imports.

const diacriticsRegex = new RegExp("[\\u0300-\\u036f]", "g");

export function specialistSlug(name: string, specialty?: string, commune?: string, fallback?: string) {
  const base = [name, specialty, commune].filter(Boolean).join(" ");
  const slug = (base || fallback || `especialista-${Date.now()}`)
    .normalize("NFD")
    .replace(diacriticsRegex, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || fallback || `especialista-${Date.now()}`;
}

export function uniqueSpecialistSlug(baseSlug: string, existingSlugs: string[]) {
  const existing = new Set(existingSlugs.filter(Boolean));
  if (!existing.has(baseSlug)) return baseSlug;
  let suffix = 2;
  while (existing.has(`${baseSlug}-${suffix}`)) suffix += 1;
  return `${baseSlug}-${suffix}`;
}

export function isPublicSpecialistStatus(status?: SpecialistPublicationStatus) {
  return status === undefined || status === "published";
}

export function specialistPublicationReadiness(request: PendingSpecialistProfile) {
  const identity = request.identityVerification;
  const completeReferences = (request.references ?? []).filter((reference) => reference.name && reference.phone && reference.work);
  const services = request.services ?? [];
  const missing = [
    identity?.verificationStatus === "approved" ? "" : "Identidad aprobada",
    completeReferences.length >= 3 ? "" : "3 referencias completas",
    request.profilePhoto || identity?.profilePhotoUrl ? "" : "Foto pública",
    identity?.idFrontUrl ? "" : "Cédula frontal",
    identity?.idBackUrl ? "" : "Cédula reverso",
    identity?.selfieUrl ? "" : "Selfie de verificación",
    services.length ? "" : "Servicios declarados",
    request.commune && request.coverageRadiusKm ? "" : "Comuna y cobertura",
    services.some((service) => service.pricingMode === "quote_required" || Number(service.specialistExpectedPayoutCLP ?? service.specialistPayoutCLP ?? service.clientCredits ?? 0) > 0)
      ? ""
      : "Precios o modalidad de cotización",
  ].filter(Boolean);
  return { ok: missing.length === 0, missing };
}
