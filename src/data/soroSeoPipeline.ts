// Pipeline editorial para contenido investigado o redactado con Soro SEO.
// Regla central: todo contenido de Soro entra como draft/noindex hasta
// aprobacion editorial humana. Nada de este archivo publica paginas,
// modifica el sitemap ni cambia rutas productivas.
//
// Flujo:
// keyword_discovered -> brief_created -> draft_imported -> editorial_review
// -> fact_check -> brand_review -> seo_review -> (legal_or_tax_review)
// -> approved -> scheduled -> published | rejected | archived
//
// Ver docs/soro-seo-editorial-policy.md y scripts/soro-content-audit.mjs.

export type SoroPipelineStatus =
  | "keyword_discovered"
  | "brief_created"
  | "draft_imported"
  | "editorial_review"
  | "fact_check"
  | "brand_review"
  | "seo_review"
  | "legal_or_tax_review"
  | "approved"
  | "scheduled"
  | "published"
  | "rejected"
  | "archived";

export type SoroAudience =
  | "cliente"
  | "especialista"
  | "empresa"
  | "comunidad"
  | "institucion";

export type SoroFunnelStage = "awareness" | "consideration" | "conversion";

export type SoroTargetPageType =
  | "guia"
  | "servicio"
  | "solucion"
  | "trabajo"
  | "institucion"
  | "formalizacion"
  | "empresa";

export type SoroDraftSource = "soro" | "manual" | "internal";

export type SoroFactRisk = "low" | "medium" | "high";

// seoStatus nunca puede nacer en "approved". Solo un revisor humano lo sube.
export type SoroSeoStatus = "draft" | "noindex" | "approved";

export type SoroPipelineItem = {
  id: string;
  keyword: string;
  searchIntent: string;
  audience: SoroAudience;
  funnelStage: SoroFunnelStage;
  targetPageType: SoroTargetPageType;
  proposedSlug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  /** Pagina productiva que responde la misma intencion, si existe. */
  canonicalTarget: string;
  contentBrief: string;
  draftSource: SoroDraftSource;
  factRisk: SoroFactRisk;
  requiresLegalReview: boolean;
  requiresTaxReview: boolean;
  seoStatus: SoroSeoStatus;
  publishStatus: SoroPipelineStatus;
  internalLinks: string[];
  /** Ruta interna a la que apunta el CTA principal. */
  ctaTarget: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  notes: string;
};

export const SORO_PIPELINE_RULES = {
  autopublishAllowed: false,
  defaultSeoStatus: "draft" as SoroSeoStatus,
  defaultPublishStatus: "draft_imported" as SoroPipelineStatus,
  sitemapOnlyForSeoStatus: "approved" as SoroSeoStatus,
  humanReviewRequiredBefore: ["approved", "scheduled", "published"] as SoroPipelineStatus[],
} as const;

/**
 * Items iniciales del pipeline. Corresponden a los drafts de ejemplo en
 * content/soro-drafts/ y a los primeros briefs de docs/soro-seo-topic-briefs.md.
 * Ninguno esta aprobado: son material de trabajo editorial.
 */
export const soroPipelineItems: SoroPipelineItem[] = [
  {
    id: "soro-2026-001",
    keyword: "como ofrecer mis servicios de oficio online",
    searchIntent: "Especialista que quiere conseguir clientes por internet sin saber por donde partir.",
    audience: "especialista",
    funnelStage: "consideration",
    targetPageType: "guia",
    proposedSlug: "como-ofrecer-mis-servicios",
    title: "Cómo ofrecer tus servicios de oficio online en Chile",
    metaTitle: "Cómo ofrecer tus servicios de oficio online | OficiosPro",
    metaDescription:
      "Guía práctica para gásfiters, electricistas y otros especialistas que quieren mostrar su trabajo y recibir solicitudes online en Chile.",
    canonicalTarget: "/registro-especialista",
    contentBrief:
      "Explicar paso a paso como un especialista pasa de boca a boca a perfil digital: definir oficio y comunas, mostrar trabajos, recibir solicitudes. CTA a /registro-especialista. Sin prometer ingresos ni volumen de clientes.",
    draftSource: "soro",
    factRisk: "low",
    requiresLegalReview: false,
    requiresTaxReview: true,
    seoStatus: "draft",
    publishStatus: "draft_imported",
    internalLinks: ["/registro-especialista", "/especialistas-fundadores", "/trabajos/gasfiteria"],
    ctaTarget: "/registro-especialista",
    reviewedBy: null,
    reviewedAt: null,
    notes: "Draft de ejemplo: content/soro-drafts/example-specialist-guide.md",
  },
  {
    id: "soro-2026-002",
    keyword: "que hacer ante una filtracion de agua",
    searchIntent: "Cliente hogar con problema urgente que busca orientacion y luego un especialista.",
    audience: "cliente",
    funnelStage: "awareness",
    targetPageType: "guia",
    proposedSlug: "que-hacer-ante-una-filtracion",
    title: "Qué hacer ante una filtración de agua en tu casa",
    metaTitle: "Filtración de agua: qué hacer primero | OficiosPro",
    metaDescription:
      "Pasos inmediatos ante una filtración de agua, cuándo llamar a un gásfiter y cómo cotizar la reparación con un especialista verificado.",
    canonicalTarget: "/soluciones/filtracion-de-agua",
    contentBrief:
      "Primeros pasos seguros (cortar agua, no manipular electricidad), señales de gravedad, cuando llamar gasfiter. CTA a solucion/servicio segun cobertura real. No afirmar tiempos de llegada ni disponibilidad.",
    draftSource: "soro",
    factRisk: "medium",
    requiresLegalReview: false,
    requiresTaxReview: false,
    seoStatus: "draft",
    publishStatus: "draft_imported",
    internalLinks: ["/servicios/gasfiteria", "/especialistas", "/faq"],
    ctaTarget: "/servicios/gasfiteria",
    reviewedBy: null,
    reviewedAt: null,
    notes: "Draft de ejemplo: content/soro-drafts/example-client-problem-guide.md. Validar canonicalTarget contra rutas reales de /soluciones antes de aprobar.",
  },
  {
    id: "soro-2026-003",
    keyword: "boleta de honorarios para trabajadores de oficio",
    searchIntent: "Especialista independiente que quiere formalizarse y no sabe como emitir boletas.",
    audience: "especialista",
    funnelStage: "consideration",
    targetPageType: "formalizacion",
    proposedSlug: "boleta-honorarios-especialistas",
    title: "Boleta de honorarios para especialistas de oficio: lo básico",
    metaTitle: "Boleta de honorarios para especialistas | OficiosPro",
    metaDescription:
      "Qué es la boleta de honorarios, cuándo se usa en trabajos de oficio y cómo la formalización asistida de OficiosPro te acompaña en el proceso.",
    canonicalTarget: "/formalizacion",
    contentBrief:
      "Contenido informativo general con disclaimer: no es asesoria tributaria definitiva. Derivar a /formalizacion y recomendar contador para casos especificos. Requiere revision tributaria antes de aprobar.",
    draftSource: "soro",
    factRisk: "high",
    requiresLegalReview: false,
    requiresTaxReview: true,
    seoStatus: "draft",
    publishStatus: "draft_imported",
    internalLinks: ["/formalizacion", "/registro-especialista", "/faq"],
    ctaTarget: "/formalizacion",
    reviewedBy: null,
    reviewedAt: null,
    notes: "Bloqueado en legal_or_tax_review hasta validacion con checklist docs/accountant-validation-checklist.md.",
  },
  {
    id: "soro-2026-004",
    keyword: "digitalizacion de oficios locales municipios",
    searchIntent: "Institucion o municipio que busca programas de empleabilidad y digitalizacion de oficios.",
    audience: "institucion",
    funnelStage: "consideration",
    targetPageType: "institucion",
    proposedSlug: "digitalizacion-oficios-locales",
    title: "Digitalización de oficios locales: guía para instituciones",
    metaTitle: "Digitalización de oficios locales | OficiosPro Instituciones",
    metaDescription:
      "Cómo municipios e instituciones pueden apoyar la digitalización y formalización de trabajadores de oficio con pilotos comunales medibles.",
    canonicalTarget: "/instituciones",
    contentBrief:
      "Explicar el modelo de piloto comunal: mapeo de especialistas, perfil digital, formalizacion asistida, medicion. CTA a /instituciones. No prometer convenios ni resultados de empleabilidad.",
    draftSource: "soro",
    factRisk: "medium",
    requiresLegalReview: true,
    requiresTaxReview: true,
    seoStatus: "draft",
    publishStatus: "draft_imported",
    internalLinks: ["/instituciones", "/formalizacion", "/impacto"],
    ctaTarget: "/instituciones",
    reviewedBy: null,
    reviewedAt: null,
    notes: "Draft de ejemplo: content/soro-drafts/example-institution-guide.md. Menciona instituciones publicas: requiere revision institucional.",
  },
  {
    id: "soro-2026-005",
    keyword: "oficios en la era de la inteligencia artificial",
    searchIntent: "Lector general, prensa, instituciones y especialistas que buscan perspectiva sobre el futuro del trabajo de oficio.",
    audience: "especialista",
    funnelStage: "awareness",
    targetPageType: "guia",
    proposedSlug: "oficios-en-la-era-ia",
    title: "Oficios en la era de la IA: por qué el trabajo en terreno sigue siendo esencial",
    metaTitle: "Oficios en la era de la IA | OficiosPro",
    metaDescription:
      "La IA no repara una filtración ni instala un calefont. Por qué los oficios esenciales ganan valor y cómo la tecnología puede apoyarlos.",
    canonicalTarget: "/",
    contentBrief:
      "Tesis OficiosPro: los oficios en terreno no son automatizables y la tecnologia debe darles visibilidad, confianza y formalizacion. Tono chileno, claro, sin catastrofismo ni promesas.",
    draftSource: "internal",
    factRisk: "low",
    requiresLegalReview: false,
    requiresTaxReview: false,
    seoStatus: "draft",
    publishStatus: "brief_created",
    internalLinks: ["/especialistas-fundadores", "/registro-especialista", "/impacto"],
    ctaTarget: "/registro-especialista",
    reviewedBy: null,
    reviewedAt: null,
    notes: "Pieza de tesis de marca. Priorizar calidad sobre velocidad.",
  },
];

/** Items que aun requieren revision humana antes de cualquier publicacion. */
export function getItemsPendingReview(items: SoroPipelineItem[] = soroPipelineItems): SoroPipelineItem[] {
  return items.filter(
    (item) => item.publishStatus !== "published" && item.publishStatus !== "archived" && item.seoStatus !== "approved",
  );
}

/** Un item solo puede publicarse con revision humana registrada y estado approved. */
export function canPublish(item: SoroPipelineItem): boolean {
  return (
    item.seoStatus === "approved" &&
    item.publishStatus === "approved" &&
    item.reviewedBy !== null &&
    item.reviewedAt !== null &&
    (!item.requiresTaxReview || item.notes.length > 0) &&
    (!item.requiresLegalReview || item.notes.length > 0)
  );
}
