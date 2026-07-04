export type ExternalCertifiedProfileStatus =
  | "UNCLAIMED_PUBLIC_REFERENCE"
  | "CLAIMED_PROFESSIONAL_PROFILE"
  | "SUSPENDED"
  | "HIDDEN_BY_REQUEST";

export type ExternalCertifiedProviderType = "natural_person" | "legal_entity";

export type ExternalCertificationStatus = "PUBLIC_SOURCE_VERIFIED" | "PENDING_RECHECK" | "NOT_VERIFIED";

export type ExternalCertifiedProfessional = {
  id: string;
  fullName: string;
  displayName: string;
  providerType: ExternalCertifiedProviderType;
  serviceType: "electrico" | "gas" | "otro_autorizado";
  licenseClass?: string;
  region: string;
  comuna: string;
  certificationStatus: ExternalCertificationStatus;
  lastVerifiedAt: string;
  sourceName: string;
  sourceUrl: string;
  sourceRecordHash: string;
  profileStatus: ExternalCertifiedProfileStatus;
  fakeData: boolean;
  publicContactEnabled: boolean;
  bookingEnabled: boolean;
  quotationEnabled: boolean;
  indexable: boolean;
  termsAcceptedAt?: string;
  privacyAcceptedAt?: string;
  publicationScope?: string[];
};

export type CompanyShowcaseStatus = "DRAFT" | "ACTIVE" | "SUSPENDED";
export type TechnicalResponsibleConsentStatus = "PENDING" | "ACCEPTED" | "REVOKED";
export type TechnicalResponsibleVerificationStatus = "UNVERIFIED" | "VERIFIED" | "EXPIRED";

export type ExternalCertifiedCompany = {
  id: string;
  legalName: string;
  tradeName: string;
  region: string;
  comuna: string;
  showcaseStatus: CompanyShowcaseStatus;
  bookingEnabled: boolean;
  quotationEnabled: boolean;
  indexable: boolean;
};

export type CompanyTechnicalResponsible = {
  id: string;
  companyId: string;
  professionalId: string;
  role: string;
  consentStatus: TechnicalResponsibleConsentStatus;
  verificationStatus: TechnicalResponsibleVerificationStatus;
  verifiedAt?: string;
  expiresAt?: string;
};

export type DataSubjectRequestType = "ACCESS" | "RECTIFICATION" | "SUPPRESSION" | "OPPOSITION" | "BLOCKING" | "OTHER";
export type DataSubjectRequestStatus = "RECEIVED" | "IN_REVIEW" | "RESOLVED" | "REJECTED";

export type ConsentLog = {
  id: string;
  userId: string;
  professionalId?: string;
  companyId?: string;
  consentType: "TERMS" | "PRIVACY" | "PUBLICATION" | "INDEXATION" | "COMPANY_LINK";
  termsVersion: string;
  privacyVersion: string;
  grantedAt: string;
  revokedAt?: string;
  evidenceJson: string;
};

export const externalCertifiedProfileStatusLabels: Record<ExternalCertifiedProfileStatus, string> = {
  UNCLAIMED_PUBLIC_REFERENCE: "Ficha informativa no reclamada",
  CLAIMED_PROFESSIONAL_PROFILE: "Perfil profesional activado",
  SUSPENDED: "Suspendido",
  HIDDEN_BY_REQUEST: "Oculto por solicitud",
};

export const externalCertificationStatusLabels: Record<ExternalCertificationStatus, string> = {
  PUBLIC_SOURCE_VERIFIED: "Verificado en fuente publica",
  PENDING_RECHECK: "Pendiente de nueva verificacion",
  NOT_VERIFIED: "No verificado",
};

export const externalCertifiedProviderTypeLabels: Record<ExternalCertifiedProviderType, string> = {
  natural_person: "Persona natural",
  legal_entity: "Empresa o persona juridica",
};

export const dataSubjectRequestTypeLabels: Record<DataSubjectRequestType, string> = {
  ACCESS: "Acceso",
  RECTIFICATION: "Rectificacion",
  SUPPRESSION: "Supresion",
  OPPOSITION: "Oposicion",
  BLOCKING: "Bloqueo",
  OTHER: "Otro",
};

export const externalCertifiedProfessionalsPrototype: ExternalCertifiedProfessional[] = [
  {
    id: "sec-prototype-001",
    fullName: "Ejemplo Ficticio SEC Las Condes",
    displayName: "Ejemplo Ficticio SEC Las Condes",
    providerType: "natural_person",
    serviceType: "electrico",
    licenseClass: "Instalador electrico autorizado SEC",
    region: "Region Metropolitana",
    comuna: "Las Condes",
    certificationStatus: "PUBLIC_SOURCE_VERIFIED",
    lastVerifiedAt: "2026-07-04",
    sourceName: "Registro publico SEC",
    sourceUrl: "https://www.sec.cl/",
    sourceRecordHash: "fake-sec-hash-001",
    profileStatus: "UNCLAIMED_PUBLIC_REFERENCE",
    fakeData: true,
    publicContactEnabled: false,
    bookingEnabled: false,
    quotationEnabled: false,
    indexable: false,
  },
  {
    id: "sec-prototype-002",
    fullName: "Ejemplo Ficticio SEC Providencia",
    displayName: "Ejemplo Ficticio SEC Providencia",
    providerType: "natural_person",
    serviceType: "gas",
    licenseClass: "Instalador autorizado SEC",
    region: "Region Metropolitana",
    comuna: "Providencia",
    certificationStatus: "PUBLIC_SOURCE_VERIFIED",
    lastVerifiedAt: "2026-07-04",
    sourceName: "Registro publico SEC",
    sourceUrl: "https://www.sec.cl/",
    sourceRecordHash: "fake-sec-hash-002",
    profileStatus: "UNCLAIMED_PUBLIC_REFERENCE",
    fakeData: true,
    publicContactEnabled: false,
    bookingEnabled: false,
    quotationEnabled: false,
    indexable: false,
  },
  {
    id: "sec-prototype-003",
    fullName: "Ejemplo Ficticio Empresa Tecnica Nunoa",
    displayName: "Ejemplo Ficticio Empresa Tecnica Nunoa",
    providerType: "legal_entity",
    serviceType: "electrico",
    licenseClass: "Referencia publica de responsable tecnico pendiente",
    region: "Region Metropolitana",
    comuna: "Nunoa",
    certificationStatus: "PENDING_RECHECK",
    lastVerifiedAt: "2026-07-04",
    sourceName: "Registro publico SEC",
    sourceUrl: "https://www.sec.cl/",
    sourceRecordHash: "fake-sec-hash-003",
    profileStatus: "UNCLAIMED_PUBLIC_REFERENCE",
    fakeData: true,
    publicContactEnabled: false,
    bookingEnabled: false,
    quotationEnabled: false,
    indexable: false,
  },
];

export const externalCertifiedCompaniesPrototype: ExternalCertifiedCompany[] = [
  {
    id: "company-prototype-001",
    legalName: "Empresa Ficticia Tecnica SpA",
    tradeName: "Empresa Ficticia Tecnica",
    region: "Region Metropolitana",
    comuna: "Nunoa",
    showcaseStatus: "DRAFT",
    bookingEnabled: false,
    quotationEnabled: false,
    indexable: false,
  },
];

export const companyTechnicalResponsiblesPrototype: CompanyTechnicalResponsible[] = [
  {
    id: "ctr-prototype-001",
    companyId: "company-prototype-001",
    professionalId: "sec-prototype-001",
    role: "Responsable tecnico",
    consentStatus: "PENDING",
    verificationStatus: "UNVERIFIED",
  },
];

export const externalCertifiedRegistryPolicy = {
  initialRegistry: "SEC",
  unclaimedNoIndex: true,
  allowRealSecImportDefault: false,
  massiveImportRequiresLegalReview: true,
  allowedUnclaimedFields: ["fullName", "serviceType", "licenseClass", "comuna", "region", "certificationStatus", "lastVerifiedAt", "sourceName", "sourceUrl"],
  prohibitedUnclaimedFields: ["rut", "email", "phone", "whatsapp", "exactAddress", "photo", "availability", "prices", "reviews", "ranking", "recommendedBadge"],
  legalDisclaimer:
    "Esta ficha es informativa y no ha sido activada por la persona titular. La informacion de certificacion corresponde a datos consultables en registros publicos de la SEC. OficiosPro no pertenece a la SEC, no emite certificaciones y no garantiza la vigencia al momento de contratar. Verifique siempre en el sitio oficial de la SEC.",
};
