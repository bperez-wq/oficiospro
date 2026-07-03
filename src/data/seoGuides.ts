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
  {
    slug: "donde-encontrar-pega-gasfiteria",
    title: "Dónde encontrar pega de gasfitería en Chile",
    metaTitle: "Dónde encontrar pega de gasfitería | OficiosPro",
    metaDescription:
      "Canales reales para conseguir trabajos de gasfitería: del boca a boca a las plataformas digitales, y cómo construir pega recurrente en vez de pitutos sueltos.",
    audience: "especialista",
    funnelStage: "consideration",
    intro:
      "Si eres gásfiter, sabes que la pega llega irregular: semanas llenas y semanas muertas. La diferencia entre vivir de pitutos sueltos y tener trabajo constante está en los canales que usas y en el rastro que dejas con cada trabajo bien hecho.",
    sections: [
      {
        heading: "Los canales de siempre (y su límite)",
        paragraphs: [
          "El boca a boca, el dato de la ferretería y los grupos de WhatsApp o Facebook del barrio funcionan, y no hay que abandonarlos. Su problema es que no dejan rastro: cada trabajo termina y la recomendación queda en la memoria de un solo cliente.",
          "Cuando ese cliente se cambia de casa o pierde tu número, esa pega se perdió. Lo que necesitas es que cada trabajo bien hecho sume a un historial que cualquier cliente nuevo pueda ver.",
        ],
      },
      {
        heading: "Qué mirar en una plataforma digital",
        paragraphs: [
          "Antes de sumarte a cualquier plataforma revisa tres cosas: que el perfil sea tuyo y muestre tu trabajo, que la comisión sea clara y se cobre solo cuando hay servicio real, y que no te prometa un volumen de clientes que nadie puede garantizar.",
          "En OficiosPro crear el perfil es gratuito y la comisión es 9,5% + IVA solo sobre servicios gestionados por la plataforma. La pega depende de tu comuna y de la demanda real: lo honesto es decirlo así.",
        ],
      },
      {
        heading: "Lo que hace la diferencia real",
        paragraphs: [
          "Con canal digital o sin él, la pega recurrente se construye igual: fotos de trabajos terminados, cobertura honesta de comunas, respuesta rápida y cotización clara. Un perfil con evidencia siempre le gana a un aviso genérico.",
        ],
        steps: [
          "Junta fotos de tus mejores trabajos terminados.",
          "Define las comunas donde realmente puedes llegar.",
          "Crea tu perfil en /registro-especialista (gratis).",
          "Responde rápido las primeras solicitudes: el comienzo define tu reputación.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿OficiosPro me garantiza pega?",
        answer: "No, y desconfía de quien te lo garantice. La demanda depende de tu oficio y comuna. Lo que sí obtienes es visibilidad, un perfil verificable y solicitudes ordenadas cuando hay demanda en tu zona.",
      },
      {
        question: "¿Cuánto cuesta usar la plataforma?",
        answer: "Crear y mantener tu perfil no cuesta nada. OficiosPro cobra 9,5% + IVA solo sobre servicios gestionados a través de la plataforma.",
      },
      {
        question: "¿Tengo que dejar mis canales de siempre?",
        answer: "No. El perfil digital se suma a tu boca a boca: mismo trabajo, más puertas.",
      },
    ],
    ctaLabel: "Ver trabajos de gasfitería",
    ctaTarget: "/trabajos/gasfiteria",
    internalLinks: ["/trabajos/gasfiteria", "/registro-especialista", "/guias/como-ofrecer-mis-servicios"],
    requiresTaxReview: false,
    requiresLegalReview: false,
    editorialStatus: "draft",
    reviewedBy: null,
    reviewedAt: null,
    lastUpdatedAt: "2026-07-02",
  },
  {
    slug: "del-pituto-al-negocio",
    title: "Del pituto al negocio: ordena tu oficio sin perder clientes",
    metaTitle: "Del pituto al negocio en tu oficio | OficiosPro",
    metaDescription:
      "El pituto paga el mes, pero no construye futuro. Cómo pasar del trabajo informal a un oficio ordenado con historial, clientes recurrentes y respaldo.",
    audience: "especialista",
    funnelStage: "awareness",
    intro:
      "El pituto tiene algo bueno: es plata rápida y sin trámites. Y algo malo: al terminar no queda nada — ni historial, ni recomendación acumulada, ni respaldo si algo sale mal. Ordenar tu oficio no significa perder esa flexibilidad; significa que cada trabajo empiece a sumar.",
    sections: [
      {
        heading: "Por qué el pituto no escala",
        paragraphs: [
          "Trabajando a puro pituto, tu ingreso depende de que te llamen justo cuando estás disponible. No hay forma de mostrar tus 200 trabajos anteriores, así que cada cliente nuevo parte de cero confianza y negocia el precio como si fueras un desconocido.",
        ],
      },
      {
        heading: "Qué cambia con historial verificable",
        paragraphs: [
          "Cuando tus trabajos quedan registrados con fotos y clientes reales, dejas de ser \u201cun maestro que me dató alguien\u201d y pasas a ser un especialista con evidencia. Eso se traduce en menos regateo, clientes que llegan solos y acceso a trabajos más grandes: comunidades y empresas contratan solo con respaldo.",
        ],
      },
      {
        heading: "El paso a paso, sin apuro",
        paragraphs: [
          "No tienes que formalizarte mañana ni abandonar a tus caseros. El orden razonable es este:",
        ],
        steps: [
          "Empieza a registrar tus trabajos: foto del antes y después, comuna y qué hiciste.",
          "Crea tu perfil de especialista gratuito y súbelos.",
          "Cotiza por escrito, aunque sea por WhatsApp: qué incluye y qué no.",
          "Cuando el flujo lo justifique, avanza en la formalización con apoyo (no estás solo en eso).",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Voy a perder a mis clientes de siempre?",
        answer: "No. Tus caseros siguen llamándote igual. La diferencia es que ahora también te encuentran clientes nuevos que no te conocían.",
      },
      {
        question: "¿Tengo que formalizarme de inmediato?",
        answer: "No. Puedes crear tu perfil y partir. La formalización asistida de OficiosPro te acompaña cuando decidas dar ese paso.",
      },
    ],
    ctaLabel: "Crear mi perfil gratis",
    ctaTarget: "/registro-especialista",
    internalLinks: ["/registro-especialista", "/formalizacion", "/guias/donde-encontrar-pega-gasfiteria"],
    requiresTaxReview: false,
    requiresLegalReview: false,
    editorialStatus: "draft",
    reviewedBy: null,
    reviewedAt: null,
    lastUpdatedAt: "2026-07-02",
  },
  {
    slug: "como-hacer-un-presupuesto",
    title: "Cómo hacer un presupuesto que el cliente entienda y acepte",
    metaTitle: "Cómo hacer un presupuesto de oficio | OficiosPro",
    metaDescription:
      "Estructura de un presupuesto serio para trabajos de oficio: alcance claro, materiales separados, adicionales acordados antes y presentación que genera confianza.",
    audience: "especialista",
    funnelStage: "consideration",
    intro:
      "La mitad de las pegas no se pierden por precio: se pierden porque el cliente no entendió qué estaba comprando. Un presupuesto claro te diferencia de inmediato y evita las peleas de después.",
    sections: [
      {
        heading: "Lo que todo presupuesto debe tener",
        paragraphs: [
          "Alcance: qué incluye y — igual de importante — qué NO incluye. Materiales separados de la mano de obra, para que el cliente vea dónde está el valor de tu trabajo. Plazo estimado y qué pasa si aparece algo imprevisto. Y tu garantía: qué respondes y por cuánto tiempo.",
        ],
      },
      {
        heading: "Los adicionales: la regla de oro",
        paragraphs: [
          "Ningún trabajo adicional se ejecuta sin acordarlo antes con el cliente. Al abrir una pared puede aparecer cualquier cosa; lo profesional es parar, mostrar, cotizar el adicional y seguir solo con el visto bueno. Eso te protege a ti y al cliente.",
        ],
      },
      {
        heading: "Cómo presentarlo",
        paragraphs: [
          "Por escrito siempre, aunque sea un mensaje de WhatsApp ordenado. Un presupuesto hablado no existe cuando hay desacuerdo.",
        ],
        steps: [
          "Visita o revisa fotos/videos antes de dar cifras definitivas.",
          "Desglosa: mano de obra, materiales, traslado si aplica.",
          "Escribe qué incluye, qué no, plazo y garantía.",
          "Define cómo se acordarán los adicionales.",
          "Envíalo por escrito y guarda copia.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Doy precio por teléfono sin ver el trabajo?",
        answer: "Es riesgoso: sin ver el problema, la cifra es adivinanza y suele jugar en tu contra. Puedes dar un rango preliminar dejando claro que el precio final requiere ver el trabajo.",
      },
      {
        question: "¿Cobro por ir a cotizar?",
        answer: "Depende de tu rubro, la distancia y la complejidad del diagnóstico. Sea cual sea tu política, dila antes de ir: las sorpresas destruyen confianza.",
      },
    ],
    ctaLabel: "Crear mi perfil de especialista",
    ctaTarget: "/registro-especialista",
    internalLinks: ["/registro-especialista", "/guias/del-pituto-al-negocio", "/guias/como-ofrecer-mis-servicios"],
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
