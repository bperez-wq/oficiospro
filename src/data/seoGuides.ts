// Guias SEO controladas para la ruta /guias/[slug].
// La ruta renderiza SOLO guias con editorialStatus === "approved".
//
// Reglas:
// - El estado editorial publicable vive en seoGuidesData.json (fuente unica
//   compartida con scripts/generate-sitemap.mjs). Aprobar = editar ese JSON
//   con reviewedBy y reviewedAt. Decision humana, nunca automatica.
// - Contenido tributario lleva disclaimer obligatorio y se mantiene draft
//   hasta revision tributaria.
// - Solo guias approved entran al sitemap.

import guidesStatusData from "./seoGuidesData.json";
import type { SoroAudience, SoroFunnelStage } from "./soroSeoPipeline";

export type GuideEditorialStatus = "draft" | "approved" | "archived";

export type SeoGuideSection = {
  heading: string;
  paragraphs: string[];
  steps?: string[];
};

export type SeoGuide = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  audience: SoroAudience;
  funnelStage: SoroFunnelStage;
  intro: string;
  sections: SeoGuideSection[];
  faqs: { question: string; answer: string }[];
  ctaLabel: string;
  ctaTarget: string;
  internalLinks: string[];
  /** Disclaimer visible obligatorio para contenido tributario/legal. */
  disclaimer?: string;
  requiresTaxReview: boolean;
  requiresLegalReview: boolean;
  editorialStatus: GuideEditorialStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  lastUpdatedAt: string;
};

type GuideStatusEntry = {
  slug: string;
  editorialStatus: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  lastUpdatedAt: string;
};

const guideStatusBySlug = new Map<string, GuideStatusEntry>(
  (guidesStatusData.guides as GuideStatusEntry[]).map((entry) => [entry.slug, entry]),
);

function applyGuideStatus(guide: SeoGuide): SeoGuide {
  const status = guideStatusBySlug.get(guide.slug);
  if (!status) return guide;
  return {
    ...guide,
    editorialStatus: status.editorialStatus as GuideEditorialStatus,
    reviewedBy: status.reviewedBy,
    reviewedAt: status.reviewedAt,
    lastUpdatedAt: status.lastUpdatedAt,
  };
}

const seoGuidesContent: SeoGuide[] = [
  {
    slug: "como-ofrecer-mis-servicios",
    title: "Cómo ofrecer tus servicios de oficio online",
    metaTitle: "Cómo ofrecer tus servicios de oficio online | OficiosPro",
    metaDescription:
      "Guía práctica para especialistas: crea tu perfil digital, muestra trabajos realizados y recibe solicitudes de clientes por comuna.",
    audience: "especialista",
    funnelStage: "consideration",
    intro:
      "Si trabajas en un oficio y tus clientes llegan solo por boca a boca, un perfil digital te permite mostrar tu trabajo y recibir solicitudes de tu comuna sin depender de redes sociales.",
    sections: [
      {
        heading: "Define tu oficio y tus comunas",
        paragraphs: [
          "Elige el oficio principal que mejor describe tu trabajo y las comunas donde realmente puedes atender. Es mejor partir con pocas comunas bien cubiertas que prometer cobertura que no puedes cumplir.",
        ],
      },
      {
        heading: "Muestra trabajos reales",
        paragraphs: [
          "Las fotos de trabajos terminados son la principal señal de confianza para un cliente que no te conoce. Sube trabajos propios, con buena luz y descripción breve de lo que hiciste.",
        ],
      },
      {
        heading: "Crea tu perfil en OficiosPro",
        paragraphs: [
          "El registro es gratuito y guiado. Tu perfil pasa por revisión antes de publicarse, para mantener la calidad de la red.",
        ],
        steps: [
          "Entra a /registro-especialista.",
          "Completa oficio, comunas y experiencia.",
          "Sube fotos de trabajos realizados.",
          "Envía tu postulación y espera la revisión.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Cuesta algo crear el perfil?",
        answer: "No. Crear el perfil de especialista no tiene costo. OficiosPro cobra una comisión de 9,5% + IVA solo sobre servicios gestionados por la plataforma.",
      },
      {
        question: "¿Cuántos clientes voy a conseguir?",
        answer: "Depende de tu oficio, tu comuna y la demanda real. OficiosPro no garantiza un volumen de clientes ni ingresos.",
      },
    ],
    ctaLabel: "Crear mi perfil de especialista",
    ctaTarget: "/registro-especialista",
    internalLinks: ["/registro-especialista", "/especialistas-fundadores", "/formalizacion"],
    requiresTaxReview: false,
    requiresLegalReview: false,
    editorialStatus: "draft",
    reviewedBy: null,
    reviewedAt: null,
    lastUpdatedAt: "2026-07-02",
  },
  {
    slug: "como-encontrar-especialista-confiable",
    title: "Cómo encontrar un especialista confiable para tu casa",
    metaTitle: "Cómo encontrar un especialista confiable | OficiosPro",
    metaDescription:
      "Qué revisar antes de contratar un gásfiter, electricista u otro especialista: perfil, trabajos realizados, cotización clara y comuna de cobertura.",
    audience: "cliente",
    funnelStage: "awareness",
    intro:
      "Contratar a alguien para trabajar en tu casa es un acto de confianza. Estas señales te ayudan a elegir bien, ya sea en OficiosPro o fuera de la plataforma.",
    sections: [
      {
        heading: "Revisa trabajos anteriores",
        paragraphs: [
          "Un especialista serio puede mostrar trabajos terminados. Desconfía de perfiles sin ninguna evidencia de trabajo real.",
        ],
      },
      {
        heading: "Pide cotización clara antes de partir",
        paragraphs: [
          "La cotización debe indicar qué incluye, qué no incluye y qué pasa si aparecen trabajos adicionales. Los adicionales deben acordarse antes de ejecutarse.",
        ],
      },
      {
        heading: "Prefiere cobertura real en tu comuna",
        paragraphs: [
          "Un especialista que trabaja habitualmente en tu comuna llega más rápido y conoce el tipo de construcción local. En OficiosPro los perfiles indican sus comunas de cobertura.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿OficiosPro verifica a los especialistas?",
        answer: "Los perfiles pasan por revisión antes de publicarse y la plataforma acompaña la formalización de los especialistas. Revisa siempre el perfil y los trabajos publicados antes de contratar.",
      },
      {
        question: "¿Qué hago si mi comuna no tiene especialistas para lo que necesito?",
        answer: "Puedes dejar tu solicitud igualmente: esa demanda ayuda a priorizar la incorporación de especialistas en tu zona.",
      },
    ],
    ctaLabel: "Buscar especialistas en mi comuna",
    ctaTarget: "/especialistas",
    internalLinks: ["/especialistas", "/servicios", "/faq"],
    requiresTaxReview: false,
    requiresLegalReview: false,
    editorialStatus: "draft",
    reviewedBy: null,
    reviewedAt: null,
    lastUpdatedAt: "2026-07-02",
  },
  {
    slug: "como-formalizar-un-oficio",
    title: "Cómo formalizar un oficio en Chile: primeros pasos",
    metaTitle: "Cómo formalizar un oficio en Chile | OficiosPro",
    metaDescription:
      "Pasos generales para formalizar tu trabajo de oficio: inicio de actividades, boletas y cómo la formalización asistida de OficiosPro te acompaña.",
    audience: "especialista",
    funnelStage: "consideration",
    intro:
      "Formalizarte te permite emitir boletas, postular a más trabajos (incluyendo empresas y comunidades) y construir historial. Esta guía resume los pasos generales.",
    sections: [
      {
        heading: "Qué significa formalizarse",
        paragraphs: [
          "En términos simples, es registrar tu actividad ante el SII para poder emitir documentos tributarios por tus trabajos, como la boleta de honorarios.",
        ],
      },
      {
        heading: "Pasos generales",
        paragraphs: [
          "El detalle depende de tu situación personal, por eso OficiosPro ofrece formalización asistida: orientación y material de apoyo durante el proceso.",
        ],
        steps: [
          "Reúne tus datos personales y define tu actividad.",
          "Realiza el inicio de actividades en el sitio del SII.",
          "Aprende a emitir boleta de honorarios.",
          "Guarda un registro simple de tus trabajos e ingresos.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿OficiosPro reemplaza al contador?",
        answer: "No. OficiosPro entrega orientación general y acompañamiento, pero para decisiones tributarias específicas debes consultar al SII o a un contador.",
      },
      {
        question: "¿Necesito estar formalizado para crear mi perfil?",
        answer: "Puedes crear tu perfil y avanzar en la formalización con apoyo de la plataforma. Revisa las condiciones vigentes en /formalizacion.",
      },
    ],
    ctaLabel: "Conocer la formalización asistida",
    ctaTarget: "/formalizacion",
    internalLinks: ["/formalizacion", "/registro-especialista", "/faq"],
    disclaimer:
      "Esta guía es orientación general y no constituye asesoría tributaria. Para tu situación específica, consulta al SII o a un contador.",
    requiresTaxReview: true,
    requiresLegalReview: false,
    editorialStatus: "draft",
    reviewedBy: null,
    reviewedAt: null,
    lastUpdatedAt: "2026-07-02",
  },
  {
    slug: "boleta-honorarios-especialistas",
    title: "Boleta de honorarios para especialistas de oficio",
    metaTitle: "Boleta de honorarios para especialistas | OficiosPro",
    metaDescription:
      "Qué es la boleta de honorarios, cuándo se usa en trabajos de oficio y qué considerar sobre retención e impuestos, explicado en simple.",
    audience: "especialista",
    funnelStage: "consideration",
    intro:
      "La boleta de honorarios es el documento más común para cobrar trabajos como independiente. Aquí explicamos lo básico, en simple.",
    sections: [
      {
        heading: "Cuándo se usa",
        paragraphs: [
          "Se usa cuando prestas servicios como persona natural con inicio de actividades. Es habitual en trabajos para hogares, comunidades y empresas.",
        ],
      },
      {
        heading: "Retención e impuestos",
        paragraphs: [
          "Las boletas de honorarios están sujetas a retención, cuyo porcentaje ha ido cambiando por ley en los últimos años. Verifica siempre la tasa vigente en el sitio del SII antes de emitir.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿OficiosPro emite las boletas por mí?",
        answer: "No. La boleta la emites tú desde el sitio del SII. OficiosPro te orienta en el proceso a través de la formalización asistida.",
      },
      {
        question: "¿Dónde confirmo la tasa de retención vigente?",
        answer: "En el sitio oficial del SII (sii.cl) o con un contador. Esta guía no reemplaza esa verificación.",
      },
    ],
    ctaLabel: "Ver formalización asistida",
    ctaTarget: "/formalizacion",
    internalLinks: ["/formalizacion", "/registro-especialista"],
    disclaimer:
      "Esta guía es orientación general y no constituye asesoría tributaria. Los porcentajes y reglas cambian: confirma siempre la información vigente en sii.cl o con un contador.",
    requiresTaxReview: true,
    requiresLegalReview: false,
    editorialStatus: "draft",
    reviewedBy: null,
    reviewedAt: null,
    lastUpdatedAt: "2026-07-02",
  },
  {
    slug: "oficios-en-la-era-ia",
    title: "Oficios en la era de la IA: el trabajo en terreno sigue siendo esencial",
    metaTitle: "Oficios en la era de la IA | OficiosPro",
    metaDescription:
      "La IA no repara una filtración ni instala un calefont. Por qué los oficios esenciales ganan valor y cómo la tecnología puede apoyar a los especialistas.",
    audience: "especialista",
    funnelStage: "awareness",
    intro:
      "Mientras la inteligencia artificial transforma el trabajo de oficina, hay algo que no puede hacer: presentarse en tu casa a reparar una filtración. Los oficios en terreno son, y seguirán siendo, esenciales.",
    sections: [
      {
        heading: "Lo que la IA no puede automatizar",
        paragraphs: [
          "Diagnosticar una falla eléctrica en una casa antigua, soldar una estructura o mantener la sala de bombas de un edificio requiere presencia física, criterio y experiencia acumulada. Ese trabajo no se automatiza con software.",
        ],
      },
      {
        heading: "Lo que la tecnología sí puede hacer por los oficios",
        paragraphs: [
          "Darles visibilidad digital, ayudarles a mostrar su trabajo, ordenar sus solicitudes, acompañar su formalización y conectarlos con clientes que hoy no saben cómo encontrarlos. Esa es la tesis de OficiosPro.",
        ],
      },
      {
        heading: "Confianza local como activo",
        paragraphs: [
          "En un mundo con más contenido generado por máquinas, la confianza verificable —trabajos reales, clientes reales, comunas reales— se vuelve más valiosa, no menos.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿La IA va a reemplazar a los trabajadores de oficio?",
        answer: "El trabajo físico especializado en terreno está entre los menos automatizables. El desafío para los especialistas no es competir con la IA, sino usarla a su favor para conseguir visibilidad y clientes.",
      },
      {
        question: "¿Cómo me preparo como especialista?",
        answer: "Construye presencia digital verificable: perfil, trabajos realizados, cobertura clara y formalización. Son los activos que más pesan en la era digital.",
      },
    ],
    ctaLabel: "Sumarme como especialista",
    ctaTarget: "/registro-especialista",
    internalLinks: ["/registro-especialista", "/especialistas-fundadores", "/impacto"],
    requiresTaxReview: false,
    requiresLegalReview: false,
    editorialStatus: "draft",
    reviewedBy: null,
    reviewedAt: null,
    lastUpdatedAt: "2026-07-02",
  },
];

export const seoGuides: SeoGuide[] = seoGuidesContent.map(applyGuideStatus);

/** La ruta /guias/[slug] renderiza SOLO estas guias. */
export function getApprovedGuides(guides: SeoGuide[] = seoGuides): SeoGuide[] {
  return guides.filter((guide) => guide.editorialStatus === "approved" && guide.reviewedBy !== null);
}

export function getGuideBySlug(slug: string, guides: SeoGuide[] = seoGuides): SeoGuide | undefined {
  return getApprovedGuides(guides).find((guide) => guide.slug === slug);
}
