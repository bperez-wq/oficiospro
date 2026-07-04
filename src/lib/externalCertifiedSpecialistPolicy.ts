import type {
  CompanyTechnicalResponsible,
  ExternalCertifiedCompany,
  ExternalCertifiedProfessional,
} from "@/data/externalCertifiedSpecialists";

export function isUnclaimedPublicReference(profile: Pick<ExternalCertifiedProfessional, "profileStatus">) {
  return profile.profileStatus === "UNCLAIMED_PUBLIC_REFERENCE";
}

export function canExposeExternalContact(profile: Pick<ExternalCertifiedProfessional, "profileStatus" | "publicContactEnabled">) {
  return profile.profileStatus === "CLAIMED_PROFESSIONAL_PROFILE" && profile.publicContactEnabled;
}

export function canCreateExternalBooking(profile: Pick<ExternalCertifiedProfessional, "profileStatus" | "bookingEnabled">) {
  return profile.profileStatus === "CLAIMED_PROFESSIONAL_PROFILE" && profile.bookingEnabled;
}

export function canCreateExternalQuotation(profile: Pick<ExternalCertifiedProfessional, "profileStatus" | "quotationEnabled">) {
  return profile.profileStatus === "CLAIMED_PROFESSIONAL_PROFILE" && profile.quotationEnabled;
}

export function canIndexExternalProfile(profile: Pick<ExternalCertifiedProfessional, "profileStatus" | "indexable">) {
  return profile.profileStatus === "CLAIMED_PROFESSIONAL_PROFILE" && profile.indexable;
}

export function projectUnclaimedPublicFields(profile: ExternalCertifiedProfessional) {
  return {
    id: profile.id,
    fullName: profile.fullName,
    serviceType: profile.serviceType,
    licenseClass: profile.licenseClass,
    region: profile.region,
    comuna: profile.comuna,
    certificationStatus: profile.certificationStatus,
    lastVerifiedAt: profile.lastVerifiedAt,
    sourceName: profile.sourceName,
    sourceUrl: profile.sourceUrl,
    fakeData: profile.fakeData,
  };
}

export function showCompanyCertifiedSecBadge() {
  return false;
}

export function companyCanReceiveCommercialActions(company: Pick<ExternalCertifiedCompany, "showcaseStatus" | "bookingEnabled" | "quotationEnabled">) {
  return company.showcaseStatus === "ACTIVE" && (company.bookingEnabled || company.quotationEnabled);
}

export function visibleCompanyTechnicalResponsibles<T extends CompanyTechnicalResponsible>(responsibles: T[]) {
  return responsibles.filter((item) => item.consentStatus === "ACCEPTED" && item.verificationStatus === "VERIFIED");
}

export function canEnableClaimedProfessionalQuotation(profile: Pick<ExternalCertifiedProfessional, "profileStatus" | "quotationEnabled" | "termsAcceptedAt" | "privacyAcceptedAt" | "publicationScope">) {
  return (
    profile.profileStatus === "CLAIMED_PROFESSIONAL_PROFILE" &&
    Boolean(profile.quotationEnabled) &&
    Boolean(profile.termsAcceptedAt) &&
    Boolean(profile.privacyAcceptedAt) &&
    Boolean(profile.publicationScope?.includes("commercial_actions"))
  );
}

export function isRealSecImportAllowed(value: unknown) {
  return String(value ?? "").trim().toLowerCase() === "true";
}

export function assertRealSecImportAllowed(value: unknown) {
  if (!isRealSecImportAllowed(value)) {
    throw new Error("real_sec_import_blocked_pending_legal_review");
  }
}
