export type ExternalCertifiedSpecialistStatus =
  | "public_reference"
  | "activation_requested"
  | "active_profile_created"
  | "verified_by_oficiospro"
  | "update_requested"
  | "removal_requested"
  | "opted_out"
  | "archived";

export type ExternalCertifiedProviderType = "natural_person" | "legal_entity";

export type ExternalCertifiedSpecialist = {
  id: string;
  displayName: string;
  providerType: ExternalCertifiedProviderType;
  certificationAuthority: "SEC";
  certificationName: string;
  specialty: string;
  commune: string;
  region: string;
  status: ExternalCertifiedSpecialistStatus;
  sourceName: string;
  officialSourceUrl: string;
  prototypeOnly: boolean;
  legalReviewRequired: boolean;
  lastReviewedAt: string;
};

export const externalCertifiedSpecialistStatusLabels: Record<ExternalCertifiedSpecialistStatus, string> = {
  public_reference: "Aun no activo en OficiosPro",
  activation_requested: "Solicitud de activacion recibida",
  active_profile_created: "Perfil OficiosPro creado",
  verified_by_oficiospro: "Verificado por OficiosPro",
  update_requested: "Actualizacion solicitada",
  removal_requested: "Retiro solicitado",
  opted_out: "Excluido por solicitud",
  archived: "Archivado",
};

export const externalCertifiedProviderTypeLabels: Record<ExternalCertifiedProviderType, string> = {
  natural_person: "Persona natural",
  legal_entity: "Empresa o persona juridica",
};

export const externalCertifiedSpecialistStatuses: ExternalCertifiedSpecialistStatus[] = [
  "public_reference",
  "activation_requested",
  "active_profile_created",
  "verified_by_oficiospro",
  "update_requested",
  "removal_requested",
  "opted_out",
  "archived",
];

export const externalCertifiedSpecialistsPrototype: ExternalCertifiedSpecialist[] = [
  {
    id: "sec-prototype-001",
    displayName: "Ejemplo Ficticio SEC Las Condes",
    providerType: "natural_person",
    certificationAuthority: "SEC",
    certificationName: "Instalador electrico autorizado SEC",
    specialty: "Electricidad domiciliaria",
    commune: "Las Condes",
    region: "Region Metropolitana",
    status: "public_reference",
    sourceName: "Registro publico SEC",
    officialSourceUrl: "https://www.sec.cl/",
    prototypeOnly: true,
    legalReviewRequired: true,
    lastReviewedAt: "2026-07-04",
  },
  {
    id: "sec-prototype-002",
    displayName: "Ejemplo Ficticio SEC Providencia",
    providerType: "natural_person",
    certificationAuthority: "SEC",
    certificationName: "Instalador electrico autorizado SEC",
    specialty: "Mantencion electrica",
    commune: "Providencia",
    region: "Region Metropolitana",
    status: "public_reference",
    sourceName: "Registro publico SEC",
    officialSourceUrl: "https://www.sec.cl/",
    prototypeOnly: true,
    legalReviewRequired: true,
    lastReviewedAt: "2026-07-04",
  },
  {
    id: "sec-prototype-003",
    displayName: "Ejemplo Ficticio SEC Nunoa",
    providerType: "legal_entity",
    certificationAuthority: "SEC",
    certificationName: "Instalador electrico autorizado SEC",
    specialty: "Tableros y circuitos",
    commune: "Nunoa",
    region: "Region Metropolitana",
    status: "public_reference",
    sourceName: "Registro publico SEC",
    officialSourceUrl: "https://www.sec.cl/",
    prototypeOnly: true,
    legalReviewRequired: true,
    lastReviewedAt: "2026-07-04",
  },
];

export const externalCertifiedSpecialistPolicy = {
  initialRegistry: "SEC",
  pageIsNoIndex: true,
  massiveImportRequiresLegalReview: true,
  allowedFields: ["displayName", "providerType", "certificationName", "specialty", "commune", "region"],
  prohibitedFields: ["email", "phone", "exactAddress", "fullRut", "privateNotes"],
};
