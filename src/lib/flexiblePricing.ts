import {
  pricingModeLabels,
  type AdditionalRequest,
  type FlexibleService,
  type PricingMode,
  type QuoteAgreement,
} from "@/data/flexiblePricing";

export const DEFAULT_SUBSCRIBER_DISCOUNT_CREDITS = 2;
export const DEFAULT_CREDIT_VALUE_CLP = 1000;

export function evenCredits(value: number) {
  const rounded = Math.max(0, Math.round(Number(value) || 0));
  return rounded % 2 === 0 ? rounded : rounded + 1;
}

export function isEvenCreditValue(value: number) {
  return Number.isFinite(value) && value > 0 && Math.round(value) % 2 === 0;
}

export function formatCredits(value: number | undefined, suffix = "creditos") {
  if (value === undefined || value === null || !Number.isFinite(Number(value))) return "por confirmar";
  return `${Number(value)} ${suffix}`;
}

export function formatDurationRange(service: FlexibleService) {
  const min = service.estimatedDurationMinMinutes;
  const max = service.estimatedDurationMaxMinutes;
  if (!min && !max) return "Duracion por confirmar";
  if (min && max && min !== max) return `Duracion estimada: ${formatMinutes(min)} a ${formatMinutes(max)}`;
  return `Duracion estimada: ${formatMinutes(min ?? max ?? 0)}`;
}

export function pricingSummary(service: FlexibleService | undefined, isSubscriber = false) {
  if (!service) return "Precio por confirmar";
  const discount = isSubscriber ? service.clubDiscountCredits ?? DEFAULT_SUBSCRIBER_DISCOUNT_CREDITS : 0;

  if (service.pricingMode === "fixed") {
    const credits = Math.max(0, Number(service.fixedCredits ?? 0) - discount);
    return isSubscriber ? `Club Hogar: ${credits} creditos` : `Desde ${service.fixedCredits ?? 0} creditos`;
  }
  if (service.pricingMode === "hourly") {
    return `Desde ${service.hourlyCredits ?? 0} creditos/hora`;
  }
  if (service.pricingMode === "range") {
    return `Estimado: ${service.minCredits ?? 0} a ${service.maxCredits ?? 0} creditos`;
  }
  if (service.pricingMode === "visit_then_quote") {
    return `Visita tecnica: ${service.visitCredits ?? 0} creditos`;
  }
  if (service.pricingMode === "quote_required") {
    return "Requiere cotizacion";
  }
  return "Revision OficiosPro";
}

export function pricingDetail(service: FlexibleService | undefined) {
  if (!service) return "OficiosPro revisara disponibilidad y alcance.";
  if (service.pricingMode === "fixed") return "Credito exacto antes de reservar. Pago protegido hasta finalizar.";
  if (service.pricingMode === "hourly") {
    const min = service.minHours ?? 1;
    const max = service.maxHours ?? min;
    const hourly = service.hourlyCredits ?? 0;
    return `Este trabajo podria costar entre ${min * hourly} y ${max * hourly} creditos.`;
  }
  if (service.pricingMode === "range") return "Puedes solicitar cotizacion o reservar visita para cerrar alcance.";
  if (service.pricingMode === "visit_then_quote") return "Primero se paga diagnostico. Luego recibes propuesta formal.";
  if (service.pricingMode === "quote_required") return "Puedes solicitar evaluacion sin compromiso antes del pago final.";
  return "Un administrador revisara el caso antes de confirmar condiciones.";
}

export function bookingPrimaryAction(service: FlexibleService | undefined) {
  if (!service) return "Solicitar servicio";
  if (service.pricingMode === "quote_required" || service.pricingMode === "range") return "Solicitar cotizacion";
  if (service.pricingMode === "visit_then_quote") return "Reservar visita tecnica";
  return "Reservar horario";
}

export function getPrimaryFlexibleService(specialist: { servicePricing?: FlexibleService[]; credits?: number; specialty?: string; serviceTypeId?: string }) {
  if (specialist.servicePricing?.length) return specialist.servicePricing[0];
  return fallbackFlexibleService(specialist);
}

export function fallbackFlexibleService(specialist: { credits?: number; specialty?: string; serviceTypeId?: string }): FlexibleService {
  const credits = Number(specialist.credits ?? 0) || 20;
  return {
    id: "fallback-fixed-service",
    serviceTypeId: specialist.serviceTypeId ?? "hogar",
    specialty: specialist.specialty ?? "Servicio OficiosPro",
    name: specialist.specialty ?? "Servicio OficiosPro",
    description: "Servicio publicado con precio base revisable por OficiosPro.",
    pricingMode: "fixed",
    fixedCredits: credits,
    clubDiscountCredits: DEFAULT_SUBSCRIBER_DISCOUNT_CREDITS,
    estimatedDurationMinMinutes: 60,
    estimatedDurationMaxMinutes: 120,
    specialistPayoutCLP: Math.max(0, credits * DEFAULT_CREDIT_VALUE_CLP - 5000),
    materialsIncluded: false,
    materialsChargedSeparately: true,
    initialVisitFree: false,
    requiresPriorEvaluation: false,
    conditions: "La cantidad final puede cambiar por alcance, horario y zona.",
  };
}

export function creditsForInitialHold(service: FlexibleService, estimatedHours = service.minHours ?? 1, isSubscriber = false) {
  const discount = isSubscriber ? service.clubDiscountCredits ?? DEFAULT_SUBSCRIBER_DISCOUNT_CREDITS : 0;
  if (service.pricingMode === "fixed") return Math.max(0, Number(service.fixedCredits ?? 0) - discount);
  if (service.pricingMode === "hourly") return Math.max(0, Number(service.hourlyCredits ?? 0) * Math.max(1, estimatedHours) - discount);
  if (service.pricingMode === "visit_then_quote") return Math.max(0, Number(service.visitCredits ?? 0) - discount);
  if (service.pricingMode === "range") return Math.max(0, Number(service.visitCredits ?? service.minCredits ?? 0) - discount);
  return 0;
}

export function hourlyRange(service: FlexibleService) {
  const hourly = Number(service.hourlyCredits ?? 0);
  const min = Number(service.minHours ?? 1);
  const max = Number(service.maxHours ?? min);
  return { minCredits: hourly * min, maxCredits: hourly * max };
}

export function assessMargin({
  credits,
  specialistPayoutCLP,
  audience = "home",
  creditValueCLP = DEFAULT_CREDIT_VALUE_CLP,
  minHomeMarginCLP = 5000,
  minCompanyMarginCLP = 10000,
}: {
  credits: number;
  specialistPayoutCLP: number;
  audience?: "home" | "company" | "agricultural" | "industrial";
  creditValueCLP?: number;
  minHomeMarginCLP?: number;
  minCompanyMarginCLP?: number;
}) {
  const minMargin = audience === "home" ? minHomeMarginCLP : minCompanyMarginCLP;
  const marginCLP = credits * creditValueCLP - specialistPayoutCLP;
  return {
    marginCLP,
    minMargin,
    lowMargin: marginCLP < minMargin,
  };
}

export function quoteTotalCredits(quote: QuoteAgreement) {
  return quote.proposal?.totalCredits ?? quote.customerCounterofferCredits ?? 0;
}

export function additionalNeedsPayment(additional: AdditionalRequest, availableCredits: number) {
  return additional.requestedCredits > availableCredits;
}

export function pricingModeLabel(mode: PricingMode) {
  return pricingModeLabels[mode] ?? "Precio por revisar";
}

function formatMinutes(minutes: number) {
  if (!minutes) return "por confirmar";
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours} h`;
  return `${hours.toFixed(1)} h`;
}
