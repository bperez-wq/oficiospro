import type { BusinessHealthResult, BusinessHealthSnapshot, ModelRecommendation } from "./types";

export function buildModelRecommendations(result: BusinessHealthResult, snapshot: BusinessHealthSnapshot): ModelRecommendation[] {
  const recommendations: ModelRecommendation[] = [];
  const alertIds = new Set(result.alerts.map((alert) => alert.id));
  const metric = snapshot.metrics;

  if (alertIds.has("demand_gap")) {
    recommendations.push({
      id: "increase-customer-demand",
      title: "Reforzar adquisicion cliente antes de seguir captando oferta saturada",
      evidence: "Hay especialistas publicados sin solicitudes suficientes.",
      hypothesis: "La oferta existe, pero la demanda por esos rubros/comunas aun no llega con intensidad.",
      risk: "Seguir captando especialistas puede deteriorar confianza y retencion del supply.",
      experiment: "Campana SEO/local por rubro con CTA a Bolsa y seguimiento CRM por 14 dias.",
      metric: "requestsSent por especialista publicado",
      durationDays: 14,
      authorityRequired: "ai_can_prepare",
    });
  }

  if (alertIds.has("supply_gap")) {
    recommendations.push({
      id: "fill-supply-gap",
      title: "Captar especialistas por oficio/comuna con demanda sin cobertura",
      evidence: "Hay busquedas o solicitudes sin especialista disponible.",
      hypothesis: "La demanda esta antes que la oferta en comunas/rubros especificos.",
      risk: "Clientes abandonan si no encuentran respuesta real.",
      experiment: "Prospeccion por referidos, ferreterias, OMIL/CFT y waitlist honesta para el oficio/comuna.",
      metric: "searchesWithResultsRate",
      durationDays: 21,
      authorityRequired: "ai_can_prepare",
    });
  }

  if (alertIds.has("specialist_conversion") || alertIds.has("onboarding_friction")) {
    recommendations.push({
      id: "short-lead-assisted-onboarding",
      title: "Probar lead corto + WhatsApp asistido para postulantes",
      evidence: "Existe interes, pero la conversion o finalizacion de postulacion es baja.",
      hypothesis: "El formulario completo captura tarde; una captura corta permite operar el seguimiento.",
      risk: "Optimizar solo diseno puede no resolver barreras de confianza, formalizacion o tiempo.",
      experiment: "Captura nombre, telefono, comuna y oficio antes del formulario completo, con tarea CRM 24/48 h.",
      metric: "specialistApplicationsCompleted",
      durationDays: 14,
      authorityRequired: "ai_can_prepare",
    });
  }

  if (alertIds.has("unit_economics") || Number(metric.contributionMarginCLP ?? 0) < 0) {
    recommendations.push({
      id: "unit-economics-review",
      title: "Revisar costos variables antes de escalar transacciones",
      evidence: "La comision neta podria no cubrir el costo variable operacional.",
      hypothesis: "El modelo de comision necesita mas automatizacion, B2B, SaaS o servicio gestionado para sostener margen.",
      risk: "Escalar servicios con margen negativo aumenta perdida operacional.",
      experiment: "Medir costo por servicio en 10 casos reales y comparar B2B, hogar y servicio gestionado.",
      metric: "contributionMarginCLP",
      durationDays: 30,
      authorityRequired: "benjamin_approval_required",
    });
  }

  if (alertIds.has("b2b_first") || Number(metric.b2bDemandShare ?? 0) >= 0.45) {
    recommendations.push({
      id: "b2b-first-pilot",
      title: "Evaluar piloto B2B-first sin abandonar hogar",
      evidence: "El interes B2B pesa mas que el hogar en la muestra disponible.",
      hypothesis: "Empresas y comunidades pueden tener mayor urgencia, ticket y recurrencia.",
      risk: "Cambiar foco sin experimento podria distraer la captacion hogar y SEO local.",
      experiment: "Landing y seguimiento para empresas/comunidades con criterios de exito definidos.",
      metric: "businessRevenueCLP o requestsSent B2B",
      durationDays: 30,
      authorityRequired: "benjamin_approval_required",
    });
  }

  if (recommendations.length === 0 && result.status === "insufficient_data") {
    recommendations.push({
      id: "measurement-first",
      title: "Completar medicion antes de recomendar pivot",
      evidence: "La muestra disponible no permite conclusiones fuertes.",
      hypothesis: "El mayor cuello de botella hoy es la observabilidad, no necesariamente el producto.",
      risk: "Tomar decisiones de modelo con muestra insuficiente puede desordenar el foco.",
      experiment: "Consolidar 7 dias de eventos, CRM y solicitudes antes de cambiar estrategia.",
      metric: result.nextMetric,
      durationDays: 7,
      authorityRequired: "ai_can_prepare",
    });
  }

  return recommendations.slice(0, 5);
}
