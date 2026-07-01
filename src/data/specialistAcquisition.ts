export const acquisitionSourceIds = [
  "facebook_group",
  "whatsapp_referral",
  "omil",
  "sence",
  "chilevalora",
  "cft_ip",
  "liceo_tecnico",
  "ferreteria",
  "proveedor_materiales",
  "administrador_comunidad",
  "gremio",
  "seo_trabajos",
  "referido_especialista",
  "campana_local",
] as const;

export type AcquisitionSource = (typeof acquisitionSourceIds)[number];

export type AcquisitionContext = {
  source?: AcquisitionSource | "direct";
  sourceDetail?: string;
  campaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  commune?: string;
  trade?: string;
  referrerSpecialistId?: string;
  referralCode?: string;
  landingPage?: string;
};

export const acquisitionSourceLabels: Record<AcquisitionSource | "direct", string> = {
  direct: "Directo",
  facebook_group: "Grupo de Facebook",
  whatsapp_referral: "Referido por WhatsApp",
  omil: "OMIL / municipalidad",
  sence: "SENCE",
  chilevalora: "ChileValora",
  cft_ip: "CFT / IP",
  liceo_tecnico: "Liceo técnico",
  ferreteria: "Ferreteria",
  proveedor_materiales: "Proveedor de materiales",
  administrador_comunidad: "Administrador de comunidad",
  gremio: "Gremio",
  seo_trabajos: "SEO trabajos",
  referido_especialista: "Referido especialista",
  campana_local: "Campana local",
};

export const institutionalSources: AcquisitionSource[] = ["omil", "sence", "chilevalora", "cft_ip", "liceo_tecnico"];

export const founderStatuses = [
  "fundador_postulante",
  "fundador_en_revision",
  "fundador_aprobado",
  "fundador_publicado",
  "requiere_mas_info",
  "rechazado",
] as const;

export type FounderStatus = (typeof founderStatuses)[number];

export const founderQualityChecklist = [
  "experiencia_declarada",
  "comuna_cobertura",
  "servicios_claros",
  "portfolio_si_existe",
  "referencias_opcionales",
  "disponibilidad",
  "tipo_tributario_formalizacion",
  "aceptacion_terminos",
  "perfil_completo_minimo",
] as const;

export type FounderQualityChecklistItem = (typeof founderQualityChecklist)[number];

export const founderProgramBenefits = [
  "Perfil profesional sin costo inicial durante el piloto.",
  "Visibilidad por oficio, comuna y especialidades cuando el perfil sea aprobado.",
  "Orden de servicios, tarifas esperadas y cobertura en un solo perfil.",
  "Formalizacion asistida y apoyo para entender documentos de cobro.",
  "Cotización virtual y solicitudes con contexto cuando exista demanda real.",
  "Reputacion acumulable por trabajos, evidencia y calificaciones.",
];

export const founderNoPromiseMessages = [
  "No prometemos ingresos garantizados.",
  "No prometemos volumen fijo de trabajos.",
  "La publicacion depende de revision, cobertura y calidad minima del perfil.",
];

export const founderConversionEvents = [
  "founder_page_view",
  "founder_cta_click",
  "specialist_application_started",
  "specialist_application_submitted",
  "referral_link_clicked",
  "institution_lead_submitted",
] as const;

export type FounderConversionEvent = (typeof founderConversionEvents)[number];

const sourceAliases: Record<string, AcquisitionSource> = {
  "campaña_local": "campana_local",
  "campana-local": "campana_local",
  "facebook": "facebook_group",
  "whatsapp": "whatsapp_referral",
  "referido": "referido_especialista",
  "seo": "seo_trabajos",
  "seo_jobs": "seo_trabajos",
};

export function normalizeAcquisitionSource(value?: string | null): AcquisitionSource | "direct" {
  const normalized = normalizeToken(value);
  if (!normalized) return "direct";
  const alias = sourceAliases[normalized];
  if (alias) return alias;
  return acquisitionSourceIds.includes(normalized as AcquisitionSource) ? (normalized as AcquisitionSource) : "direct";
}

export function isInstitutionalAcquisitionSource(source?: string | null) {
  const normalized = normalizeAcquisitionSource(source);
  return normalized !== "direct" && institutionalSources.includes(normalized);
}

export function sourceLabel(source?: string | null) {
  return acquisitionSourceLabels[normalizeAcquisitionSource(source)];
}

export function buildAcquisitionContextFromSearch(search: string, fallback: AcquisitionContext = {}): AcquisitionContext {
  const params = new URLSearchParams(search);
  const utmSource = params.get("utm_source") ?? fallback.utmSource;
  const utmMedium = params.get("utm_medium") ?? fallback.utmMedium;
  const utmCampaign = params.get("utm_campaign") ?? fallback.utmCampaign;
  const utmContent = params.get("utm_content") ?? fallback.utmContent;
  const source = normalizeAcquisitionSource(params.get("source") ?? utmSource ?? fallback.source);
  return compactContext({
    source,
    sourceDetail: params.get("sourceDetail") ?? utmContent ?? fallback.sourceDetail,
    campaign: params.get("campaign") ?? utmCampaign ?? fallback.campaign ?? "founder_specialists",
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    commune: params.get("commune") ?? params.get("comuna") ?? fallback.commune,
    trade: params.get("trade") ?? params.get("oficio") ?? fallback.trade,
    referrerSpecialistId: params.get("referrerSpecialistId") ?? fallback.referrerSpecialistId,
    referralCode: params.get("referralCode") ?? params.get("ref") ?? fallback.referralCode,
    landingPage: fallback.landingPage,
  });
}

export function founderRegistrationHref(context: AcquisitionContext = {}) {
  const params = new URLSearchParams();
  const source = normalizeAcquisitionSource(context.source);
  if (source !== "direct") params.set("source", source);
  if (context.sourceDetail) params.set("sourceDetail", context.sourceDetail);
  params.set("campaign", context.campaign ?? "founder_specialists");
  if (context.utmSource) params.set("utm_source", context.utmSource);
  if (context.utmMedium) params.set("utm_medium", context.utmMedium);
  if (context.utmCampaign) params.set("utm_campaign", context.utmCampaign);
  if (context.utmContent) params.set("utm_content", context.utmContent);
  if (context.commune) params.set("commune", context.commune);
  if (context.trade) params.set("trade", normalizeToken(context.trade));
  if (context.referrerSpecialistId) params.set("referrerSpecialistId", context.referrerSpecialistId);
  if (context.referralCode) params.set("referralCode", context.referralCode);
  const query = params.toString();
  return query ? `/registro-especialista?${query}` : "/registro-especialista";
}

export function founderReferralHref(referralCode?: string, referrerSpecialistId?: string) {
  return founderRegistrationHref({
    source: "referido_especialista",
    campaign: "founder_specialist_referrals",
    utmSource: "referral",
    utmMedium: "specialist_share",
    utmCampaign: "founder_specialist_referrals",
    utmContent: "referral_tool",
    referralCode,
    referrerSpecialistId,
  });
}

export function institutionalRegistrationHref(source: AcquisitionSource = "omil", sourceDetail?: string) {
  return founderRegistrationHref({
    source,
    sourceDetail,
    campaign: "institutional_founder_specialists",
  });
}

export function compactContext(context: AcquisitionContext): AcquisitionContext {
  return Object.fromEntries(Object.entries(context).filter(([, value]) => value !== undefined && value !== "")) as AcquisitionContext;
}

export function normalizeToken(value?: string | null) {
  return String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function acquisitionSourceOptions() {
  return acquisitionSourceIds.map((source) => ({ value: source, label: acquisitionSourceLabels[source] }));
}
