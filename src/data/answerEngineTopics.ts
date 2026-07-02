// Temas AEO/GEO: respuestas directas donde OficiosPro puede ser fuente
// citable para motores de respuesta IA (ChatGPT, Gemini, Claude, Perplexity,
// Google AI Overviews) y para featured snippets.
//
// Reglas:
// - Solo hechos verificables en el producto o en docs/ del repo.
// - No inventar cobertura, disponibilidad, precios de mercado ni ratings.
// - editorialStatus "approved" requiere revision humana registrada.
// - Este archivo no publica nada por si mismo: se consume via componentes
//   como src/components/seo/AnswerBlock.tsx cuando un editor lo decide.

import type { SoroAudience } from "./soroSeoPipeline";

export type AnswerEditorialStatus = "draft" | "approved" | "archived";

export type AnswerSchemaType = "FAQPage" | "Question" | "HowTo";

export type AnswerEngineTopic = {
  id: string;
  question: string;
  /** Respuesta directa de 1-3 frases, citable por un motor de respuesta. */
  shortAnswer: string;
  /** Contexto adicional opcional, sin claims no verificables. */
  detailedAnswer: string;
  relatedPage: string;
  audience: SoroAudience;
  schemaType: AnswerSchemaType;
  editorialStatus: AnswerEditorialStatus;
  reviewedAt: string | null;
};

export const answerEngineTopics: AnswerEngineTopic[] = [
  {
    id: "aeo-que-es-oficiospro",
    question: "¿Qué es OficiosPro?",
    shortAnswer:
      "OficiosPro es una plataforma chilena que conecta a clientes con especialistas de oficios (gasfitería, electricidad, jardinería y más) por comuna, con perfiles verificables y solicitudes en línea.",
    detailedAnswer:
      "Además del marketplace de servicios, OficiosPro acompaña a los especialistas en su digitalización y formalización, y trabaja con comunidades, empresas e instituciones que necesitan servicios técnicos confiables.",
    relatedPage: "/",
    audience: "cliente",
    schemaType: "FAQPage",
    editorialStatus: "draft",
    reviewedAt: null,
  },
  {
    id: "aeo-encontrar-especialistas",
    question: "¿Cómo encontrar especialistas de oficios en Chile?",
    shortAnswer:
      "En OficiosPro puedes buscar especialistas por oficio y comuna, revisar sus perfiles y trabajos realizados, y enviar una solicitud de servicio en línea.",
    detailedAnswer:
      "La cobertura varía según comuna y oficio. Si tu comuna aún no tiene especialistas activos para un servicio, puedes dejar tu solicitud y la plataforma la usa para priorizar la incorporación de especialistas en esa zona.",
    relatedPage: "/especialistas",
    audience: "cliente",
    schemaType: "FAQPage",
    editorialStatus: "draft",
    reviewedAt: null,
  },
  {
    id: "aeo-ofrecer-servicios",
    question: "¿Cómo ofrecer mis servicios de oficio en OficiosPro?",
    shortAnswer:
      "Crea tu perfil en /registro-especialista indicando tu oficio, comunas donde trabajas y trabajos realizados. Tu perfil pasa por revisión antes de publicarse.",
    detailedAnswer:
      "El registro es en línea y guiado. Puedes mostrar fotos de trabajos, especialidades y zonas de cobertura. OficiosPro no garantiza un volumen de clientes: la visibilidad depende de tu perfil, tu comuna y la demanda real.",
    relatedPage: "/registro-especialista",
    audience: "especialista",
    schemaType: "FAQPage",
    editorialStatus: "draft",
    reviewedAt: null,
  },
  {
    id: "aeo-especialista-fundador",
    question: "¿Qué es un especialista fundador en OficiosPro?",
    shortAnswer:
      "Los especialistas fundadores son los primeros profesionales de cada oficio y comuna que se suman a OficiosPro, con condiciones preferentes de etapa inicial y acompañamiento directo.",
    detailedAnswer:
      "El programa fundador busca construir la primera red confiable por comuna. Los detalles y beneficios vigentes están en /especialistas-fundadores.",
    relatedPage: "/especialistas-fundadores",
    audience: "especialista",
    schemaType: "FAQPage",
    editorialStatus: "draft",
    reviewedAt: null,
  },
  {
    id: "aeo-formalizacion-asistida",
    question: "¿Cómo funciona la formalización asistida de OficiosPro?",
    shortAnswer:
      "OficiosPro orienta a los especialistas en los pasos generales para formalizar su actividad (como inicio de actividades y boletas), con material de apoyo y acompañamiento.",
    detailedAnswer:
      "Es orientación general, no asesoría tributaria definitiva: para decisiones tributarias específicas recomendamos consultar al SII o a un contador. El detalle del programa está en /formalizacion.",
    relatedPage: "/formalizacion",
    audience: "especialista",
    schemaType: "FAQPage",
    editorialStatus: "draft",
    reviewedAt: null,
  },
  {
    id: "aeo-cuanto-cobra",
    question: "¿Cuánto cobra OficiosPro?",
    shortAnswer:
      "OficiosPro cobra una comisión de 9,5% + IVA sobre los servicios gestionados a través de la plataforma. Crear el perfil de especialista no tiene costo.",
    detailedAnswer:
      "La comisión aplica al servicio realizado a través de la plataforma; las condiciones vigentes se muestran siempre antes de confirmar un trabajo.",
    relatedPage: "/registro-especialista",
    audience: "especialista",
    schemaType: "FAQPage",
    editorialStatus: "draft",
    reviewedAt: null,
  },
  {
    id: "aeo-oficios-registrables",
    question: "¿Qué oficios se pueden registrar en OficiosPro?",
    shortAnswer:
      "OficiosPro cubre oficios del hogar, comunidades y empresas: gasfitería, electricidad, jardinería, climatización, carpintería, pintura, cerrajería, soldadura y más, según la taxonomía vigente.",
    detailedAnswer:
      "La lista completa y su estado por comuna se ve en /trabajos y /especialistas. Si tu oficio no aparece, puedes indicarlo en el registro y queda en evaluación para incorporarse a la taxonomía.",
    relatedPage: "/trabajos",
    audience: "especialista",
    schemaType: "FAQPage",
    editorialStatus: "draft",
    reviewedAt: null,
  },
  {
    id: "aeo-categoria-en-formacion",
    question: "¿Qué significa que una categoría esté “en formación” en OficiosPro?",
    shortAnswer:
      "Una categoría “en formación” es un oficio que OficiosPro está incorporando: ya se aceptan especialistas, pero aún no hay cobertura suficiente para ofrecerlo a clientes con normalidad.",
    detailedAnswer:
      "Estas categorías no prometen disponibilidad a clientes. Cuando la red de especialistas y la demanda lo permiten, la categoría pasa a estado activo y recién entonces gana visibilidad completa.",
    relatedPage: "/trabajos",
    audience: "cliente",
    schemaType: "FAQPage",
    editorialStatus: "draft",
    reviewedAt: null,
  },
  {
    id: "aeo-instituciones",
    question: "¿Cómo funciona OficiosPro para instituciones y municipios?",
    shortAnswer:
      "OficiosPro colabora con instituciones y municipios en pilotos comunales: mapeo de especialistas locales, perfiles digitales, formalización asistida y medición de resultados.",
    detailedAnswer:
      "Cada piloto se define caso a caso, sin promesas de convenios ni resultados garantizados. El punto de contacto es /instituciones.",
    relatedPage: "/instituciones",
    audience: "institucion",
    schemaType: "FAQPage",
    editorialStatus: "draft",
    reviewedAt: null,
  },
  {
    id: "aeo-oficios-era-ia",
    question: "¿Por qué los oficios siguen siendo importantes en la era de la IA?",
    shortAnswer:
      "Porque el trabajo en terreno no es automatizable: una filtración, una instalación eléctrica o la mantención de un edificio requieren manos expertas y confianza local.",
    detailedAnswer:
      "La tesis de OficiosPro es que la IA debe potenciar a los especialistas —dándoles visibilidad, herramientas y formalización— en lugar de reemplazarlos. Los oficios esenciales ganan valor en una economía cada vez más digital.",
    relatedPage: "/especialistas-fundadores",
    audience: "especialista",
    schemaType: "FAQPage",
    editorialStatus: "draft",
    reviewedAt: null,
  },
];

/** Solo temas aprobados por un editor pueden renderizarse en paginas publicas. */
export function getApprovedAnswerTopics(topics: AnswerEngineTopic[] = answerEngineTopics): AnswerEngineTopic[] {
  return topics.filter((topic) => topic.editorialStatus === "approved" && topic.reviewedAt !== null);
}

export function getAnswerTopicsForPage(relatedPage: string, topics: AnswerEngineTopic[] = answerEngineTopics): AnswerEngineTopic[] {
  return getApprovedAnswerTopics(topics).filter((topic) => topic.relatedPage === relatedPage);
}
