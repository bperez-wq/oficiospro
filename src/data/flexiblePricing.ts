export type PricingMode = "fixed" | "hourly" | "quote_required" | "visit_then_quote" | "range" | "custom";

export type QuoteStatus =
  | "quote_requested"
  | "specialist_reviewing"
  | "proposal_sent"
  | "customer_counteroffer"
  | "platform_review"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted_to_service";

export type AdditionalStatus = "pending_customer_approval" | "approved" | "rejected" | "clarification_requested";

export type AdditionalType =
  | "materials"
  | "spare_parts"
  | "additional_labor"
  | "additional_hours"
  | "extended_diagnosis"
  | "emergency"
  | "other";

export type FlexibleService = {
  id: string;
  serviceId?: string;
  serviceTypeId: string;
  categoryId?: string;
  specialty: string;
  name: string;
  description: string;
  pricingMode: PricingMode;
  creditPrice?: number;
  fixedCredits?: number;
  hourlyCredits?: number;
  minHours?: number;
  maxHours?: number;
  minCredits?: number;
  maxCredits?: number;
  visitCredits?: number;
  emergencyCredits?: number;
  clubDiscountCredits?: number;
  estimatedDuration?: string;
  estimatedDurationMinMinutes?: number;
  estimatedDurationMaxMinutes?: number;
  specialistPayoutCLP?: number;
  specialistExpectedPayoutCLP?: number;
  platformMarginCredits?: number;
  materialsIncluded: boolean;
  materialsChargedSeparately: boolean;
  initialVisitFree: boolean;
  requiresPriorEvaluation: boolean;
  emergency?: boolean;
  active?: boolean;
  conditions: string;
  adminReviewStatus?: "pending_review" | "approved" | "needs_adjustment";
  marginWarning?: boolean;
};

export type QuoteProposal = {
  description: string;
  laborCredits: number;
  materialCredits: number;
  visitCredits: number;
  totalCredits: number;
  estimatedDuration: string;
  tentativeDate: string;
  conditions: string;
  materialsIncluded: boolean;
  comments: string;
  specialistPayoutCredits: number;
  platformMarginCredits: number;
};

export type QuoteAgreement = {
  id: string;
  specialistId: string;
  specialistName: string;
  customerName: string;
  serviceName: string;
  commune: string;
  status: QuoteStatus;
  originalRequest: string;
  proposal?: QuoteProposal;
  customerCounterofferCredits?: number;
  customerComment?: string;
  platformNote?: string;
  history: string[];
  createdAt: string;
  updatedAt: string;
};

export type AdditionalRequest = {
  id: string;
  serviceRequestId: string;
  specialistName: string;
  customerName: string;
  type: AdditionalType;
  description: string;
  requestedCredits: number;
  equivalentCLP: number;
  reason: string;
  status: AdditionalStatus;
  photoName?: string;
  receiptName?: string;
  comment?: string;
  createdAt: string;
};

export const pricingModeLabels: Record<PricingMode, string> = {
  fixed: "Precio fijo",
  hourly: "Por hora",
  quote_required: "Requiere cotizacion",
  visit_then_quote: "Visita tecnica + cotizacion",
  range: "Rango estimado",
  custom: "Revision especial",
};

export const pricingModeOptions: { value: PricingMode; label: string; helper: string }[] = [
  { value: "fixed", label: "Precio fijo", helper: "El cliente ve creditos exactos antes de reservar." },
  { value: "hourly", label: "Por hora", helper: "El cliente confirma horas iniciales o solicita evaluacion." },
  { value: "quote_required", label: "Requiere cotizacion", helper: "Se crea solicitud y propuesta antes del pago final." },
  { value: "visit_then_quote", label: "Visita + cotizacion", helper: "Se cobra diagnostico y luego se envia propuesta." },
  { value: "range", label: "Rango estimado", helper: "El cliente ve un rango y puede pedir ajuste." },
  { value: "custom", label: "Revision especial", helper: "OficiosPro revisa el caso antes de publicarlo." },
];

export const additionalTypeLabels: Record<AdditionalType, string> = {
  materials: "Materiales",
  spare_parts: "Repuestos",
  additional_labor: "Mano de obra adicional",
  additional_hours: "Horas adicionales",
  extended_diagnosis: "Diagnostico extendido",
  emergency: "Emergencia",
  other: "Otro",
};

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  quote_requested: "Cotizacion solicitada",
  specialist_reviewing: "Especialista revisando",
  proposal_sent: "Propuesta enviada",
  customer_counteroffer: "Contraoferta del cliente",
  platform_review: "Revision OficiosPro",
  accepted: "Aceptada",
  rejected: "Rechazada",
  expired: "Vencida",
  converted_to_service: "Convertida en servicio",
};

export const defaultQuoteAgreements: QuoteAgreement[] = [
  {
    id: "quote-electrical-001",
    specialistId: "carolina-mendez",
    specialistName: "Carolina Mendez",
    customerName: "Familia Rojas",
    serviceName: "Instalacion electrica casa completa",
    commune: "Las Condes",
    status: "quote_requested",
    originalRequest: "Normalizacion completa de tablero, enchufes y luminarias para remodelacion de casa.",
    history: ["El cliente solicito cotizacion con fotos y descripcion del alcance."],
    createdAt: "2026-06-06T14:30:00.000Z",
    updatedAt: "2026-06-06T14:30:00.000Z",
  },
  {
    id: "quote-gate-accepted",
    specialistId: "patricio-herrera",
    specialistName: "Patricio Herrera",
    customerName: "Comunidad Los Pinos",
    serviceName: "Reparacion porton electrico",
    commune: "Maipu",
    status: "accepted",
    originalRequest: "Porton vehicular detenido con riel dañado y motor sin fuerza.",
    proposal: {
      description: "Reparar riel, ajustar motor y reemplazar piezas de arrastre.",
      laborCredits: 30,
      materialCredits: 18,
      visitCredits: 0,
      totalCredits: 48,
      estimatedDuration: "1 jornada",
      tentativeDate: "2026-06-12",
      conditions: "Materiales incluidos en propuesta. Garantia sujeta a uso normal del porton.",
      materialsIncluded: true,
      comments: "Se recomienda mantencion preventiva cada seis meses.",
      specialistPayoutCredits: 34,
      platformMarginCredits: 14,
    },
    customerComment: "Aceptado por administracion de comunidad.",
    platformNote: "Margen revisado y propuesta aprobada.",
    history: [
      "El especialista envio una propuesta.",
      "OficiosPro reviso margen y condiciones.",
      "Propuesta aceptada. Se retendran los creditos.",
    ],
    createdAt: "2026-06-04T10:00:00.000Z",
    updatedAt: "2026-06-05T16:10:00.000Z",
  },
  {
    id: "quote-irrigation-visit",
    specialistId: "claudio-rivera",
    specialistName: "Claudio Rivera",
    customerName: "Agricola Santa Ana",
    serviceName: "Tecnico riego agricola",
    commune: "Talca",
    status: "specialist_reviewing",
    originalRequest: "Diagnostico de baja presion en sector de riego tecnificado.",
    proposal: {
      description: "Visita tecnica para diagnostico y levantamiento de propuesta.",
      laborCredits: 0,
      materialCredits: 0,
      visitCredits: 20,
      totalCredits: 20,
      estimatedDuration: "2 a 3 horas",
      tentativeDate: "2026-06-11",
      conditions: "La visita puede descontarse si se acepta la reparacion completa.",
      materialsIncluded: false,
      comments: "Requiere acceso a tablero y sector de bombas.",
      specialistPayoutCredits: 14,
      platformMarginCredits: 6,
    },
    history: ["OficiosPro asigno revision tecnica antes de cotizar el trabajo completo."],
    createdAt: "2026-06-05T09:15:00.000Z",
    updatedAt: "2026-06-05T12:20:00.000Z",
  },
];

export const defaultAdditionalRequests: AdditionalRequest[] = [
  {
    id: "additional-gas-001",
    serviceRequestId: "bk-1002",
    specialistName: "Miguel Soto",
    customerName: "Cliente OficiosPro",
    type: "materials",
    description: "Materiales gasfiteria para reemplazo de flexible y sello.",
    requestedCredits: 8,
    equivalentCLP: 8000,
    reason: "El flexible existente esta dañado y no es reutilizable.",
    status: "pending_customer_approval",
    comment: "El cobro adicional requiere aprobacion del cliente antes de descontar creditos.",
    createdAt: "2026-06-06T12:00:00.000Z",
  },
  {
    id: "additional-hours-001",
    serviceRequestId: "quote-gate-accepted",
    specialistName: "Patricio Herrera",
    customerName: "Comunidad Los Pinos",
    type: "additional_hours",
    description: "Horas adicionales por alineacion extendida de porton.",
    requestedCredits: 10,
    equivalentCLP: 10000,
    reason: "El riel tenia deformacion mayor a la visible en la evaluacion inicial.",
    status: "clarification_requested",
    createdAt: "2026-06-06T17:30:00.000Z",
  },
];

export const defaultFlexibleServices: FlexibleService[] = [
  {
    id: "fixed-calefont",
    serviceTypeId: "gasfiteria",
    specialty: "Mantencion calefont",
    name: "Mantencion calefont",
    description: "Revision, limpieza basica y prueba de funcionamiento.",
    pricingMode: "fixed",
    fixedCredits: 12,
    clubDiscountCredits: 2,
    estimatedDurationMinMinutes: 60,
    estimatedDurationMaxMinutes: 90,
    specialistPayoutCLP: 7000,
    materialsIncluded: false,
    materialsChargedSeparately: true,
    initialVisitFree: false,
    requiresPriorEvaluation: false,
    conditions: "Repuestos o certificaciones se cotizan aparte si son necesarios.",
  },
  {
    id: "hourly-garden",
    serviceTypeId: "jardineria",
    specialty: "Jardineria hogar",
    name: "Jardinero por hora",
    description: "Mantencion, poda liviana, limpieza de jardin y retiro menor.",
    pricingMode: "hourly",
    hourlyCredits: 8,
    minHours: 2,
    maxHours: 5,
    clubDiscountCredits: 2,
    estimatedDurationMinMinutes: 120,
    estimatedDurationMaxMinutes: 300,
    specialistPayoutCLP: 5500,
    materialsIncluded: false,
    materialsChargedSeparately: true,
    initialVisitFree: false,
    requiresPriorEvaluation: false,
    conditions: "Bolsas, plantas o insumos se cobran aparte previa aprobacion.",
  },
  {
    id: "quote-electrical-home",
    serviceTypeId: "electricidad",
    specialty: "Normalizacion electrica",
    name: "Instalacion electrica casa completa",
    description: "Trabajo de alcance variable que requiere levantamiento previo.",
    pricingMode: "quote_required",
    minCredits: 40,
    maxCredits: 160,
    estimatedDurationMinMinutes: 480,
    estimatedDurationMaxMinutes: 1920,
    specialistPayoutCLP: 0,
    materialsIncluded: false,
    materialsChargedSeparately: true,
    initialVisitFree: false,
    visitCredits: 8,
    requiresPriorEvaluation: true,
    conditions: "Se solicita descripcion, comuna y fotos antes de enviar propuesta.",
  },
  {
    id: "visit-irrigation",
    serviceTypeId: "agroindustria",
    specialty: "Riego tecnificado",
    name: "Tecnico riego agricola",
    description: "Diagnostico inicial en terreno y cotizacion posterior.",
    pricingMode: "visit_then_quote",
    visitCredits: 20,
    minCredits: 60,
    maxCredits: 180,
    estimatedDurationMinMinutes: 120,
    estimatedDurationMaxMinutes: 240,
    specialistPayoutCLP: 14000,
    materialsIncluded: false,
    materialsChargedSeparately: true,
    initialVisitFree: false,
    requiresPriorEvaluation: true,
    conditions: "La visita puede descontarse del total segun condiciones aprobadas.",
  },
  {
    id: "range-gate",
    serviceTypeId: "electricidad",
    specialty: "Portones electricos",
    name: "Reparacion porton electrico",
    description: "Diagnostico, ajuste mecanico y reparacion electrica segun falla.",
    pricingMode: "range",
    minCredits: 30,
    maxCredits: 80,
    visitCredits: 6,
    estimatedDurationMinMinutes: 120,
    estimatedDurationMaxMinutes: 480,
    specialistPayoutCLP: 24000,
    materialsIncluded: false,
    materialsChargedSeparately: true,
    initialVisitFree: false,
    requiresPriorEvaluation: true,
    conditions: "Materiales, motor o controles se aprueban antes de cobrarse.",
  },
];
