import type { FlexibleService } from "@/data/flexiblePricing";
import type { Specialist } from "@/data/mock";
import { DEFAULT_SUBSCRIBER_DISCOUNT_CREDITS, creditsForInitialHold } from "@/lib/flexiblePricing";
import { specialistRanks } from "@/data/marketplace";
import { isDemoSpecialist } from "@/lib/specialists/demoProfile";

export type SpecialistLevel = "Fundador" | "Bronce" | "Plata" | "Oro" | "Platino";

const LEVEL_ORDER: SpecialistLevel[] = ["Fundador", "Bronce", "Plata", "Oro", "Platino"];

// Nivel máximo que la evidencia (trabajos + rating) justifica, según specialistRanks.
// Exige AMBOS umbrales (trabajos y rating) para subir de tramo.
function evidenceLevel(jobs: number, rating: number): SpecialistLevel {
  let level: SpecialistLevel = "Fundador";
  for (const rule of specialistRanks) {
    if (jobs >= rule.minJobs && rating >= rule.minRating) level = rule.rank as SpecialistLevel;
  }
  return level;
}

export type SpecialistReview = {
  id: string;
  specialistId: string;
  customerName: string;
  ratingGeneral: number;
  // Sub-ratings solo existen si la fuente los declaró; nunca se derivan.
  ratingPuntualidad?: number;
  ratingCalidad?: number;
  ratingComunicacion?: number;
  ratingPrecio?: number;
  comment: string;
  serviceName: string;
  comuna: string;
  date: string;
  verifiedService: boolean;
  hidden?: boolean;
  reviewedByAdmin?: boolean;
};

export type ReviewStats = {
  average: number;
  total: number;
  verifiedTotal: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  punctuality: number;
  quality: number;
  communication: number;
  price: number;
};

export function getSpecialistLevel(specialist: Specialist): SpecialistLevel {
  const jobs = specialist.trabajosCompletados ?? specialist.jobs;
  const evidence = evidenceLevel(jobs, specialist.rating);
  // El seed puede fijar un rank, pero nunca por encima de lo que la evidencia
  // soporta: se clampa al mínimo entre el rank declarado y el nivel por evidencia.
  // Así no aparece "Nivel Oro" con 88 trabajos ni Platino sin volumen real.
  if (specialist.rank) {
    const seedIdx = LEVEL_ORDER.indexOf(specialist.rank as SpecialistLevel);
    const evidenceIdx = LEVEL_ORDER.indexOf(evidence);
    if (seedIdx >= 0) return LEVEL_ORDER[Math.min(seedIdx, evidenceIdx)];
  }
  return evidence;
}

export function getTrustBadges(specialist: Specialist) {
  // Los perfiles referenciales (catálogo demo) no muestran badges que afirman
  // verificación documental: esa promesa aplica solo a especialistas reales.
  const demo = isDemoSpecialist(specialist);
  return [
    !demo && specialist.verified ? "Identidad verificada" : null,
    !demo && (specialist.validation?.references ?? 0) > 0 ? "Referencias revisadas" : null,
    !demo && (specialist.certifications.length || specialist.validation?.certifications === "approved") ? "Certificación cargada" : null,
    responseMinutes(specialist.responseTime) <= 60 ? "Respuesta rapida" : null,
    specialist.top || specialist.recommendation >= 95 ? "Top especialista" : null,
  ].filter(Boolean) as string[];
}

export function getServiceCreditPair(service: FlexibleService | undefined, fallbackCredits: number) {
  const base = service ? creditsForInitialHold(service, service.minHours ?? 1, false) : fallbackCredits;
  const club = service ? creditsForInitialHold(service, service.minHours ?? 1, true) : Math.max(0, fallbackCredits - DEFAULT_SUBSCRIBER_DISCOUNT_CREDITS);
  return {
    baseCredits: base || fallbackCredits,
    clubCredits: club || Math.max(0, fallbackCredits - DEFAULT_SUBSCRIBER_DISCOUNT_CREDITS),
    savingsCredits: Math.max(0, (base || fallbackCredits) - (club || fallbackCredits)),
  };
}

export function getSpecialistReviews(specialist: Specialist): SpecialistReview[] {
  const fallbackServices = specialist.servicesOffered.length ? specialist.servicesOffered : [specialist.specialty];

  return specialist.reviews.map((review, index) => {
    const rating = normalizeRating(review.ratingGeneral ?? review.rating);
    return {
      id: review.id ?? `${specialist.id}-review-${index + 1}`,
      specialistId: review.specialistId ?? specialist.id,
      customerName: review.customerName ?? review.author,
      ratingGeneral: rating,
      // Señales de confianza solo desde datos explícitos: si la fuente no
      // declara el sub-rating o la verificación, no se fabrica ni se asume.
      ratingPuntualidad: review.ratingPuntualidad != null ? clampRating(review.ratingPuntualidad) : undefined,
      ratingCalidad: review.ratingCalidad != null ? clampRating(review.ratingCalidad) : undefined,
      ratingComunicacion: review.ratingComunicacion != null ? clampRating(review.ratingComunicacion) : undefined,
      ratingPrecio: review.ratingPrecio != null ? clampRating(review.ratingPrecio) : undefined,
      comment: review.comment ?? review.text,
      serviceName: review.serviceName ?? fallbackServices[index % fallbackServices.length] ?? specialist.specialty,
      comuna: review.comuna ?? specialist.commune ?? specialist.zone,
      date: review.date,
      verifiedService: review.verifiedService === true,
      hidden: review.hidden,
      reviewedByAdmin: review.reviewedByAdmin === true,
    };
  });
}

export function getReviewStats(reviews: SpecialistReview[]): ReviewStats {
  const visibleReviews = reviews.filter((review) => !review.hidden);
  const total = visibleReviews.length;
  const emptyDistribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (!total) {
    return {
      average: 0,
      total: 0,
      verifiedTotal: 0,
      distribution: emptyDistribution,
      punctuality: 0,
      quality: 0,
      communication: 0,
      price: 0,
    };
  }

  const sums = visibleReviews.reduce(
    (acc, review) => {
      const bucket = Math.max(1, Math.min(5, Math.round(review.ratingGeneral))) as 1 | 2 | 3 | 4 | 5;
      acc.distribution[bucket] += 1;
      acc.general += review.ratingGeneral;
      if (review.ratingPuntualidad != null) {
        acc.punctuality += review.ratingPuntualidad;
        acc.punctualityCount += 1;
      }
      if (review.ratingCalidad != null) {
        acc.quality += review.ratingCalidad;
        acc.qualityCount += 1;
      }
      if (review.ratingComunicacion != null) {
        acc.communication += review.ratingComunicacion;
        acc.communicationCount += 1;
      }
      if (review.ratingPrecio != null) {
        acc.price += review.ratingPrecio;
        acc.priceCount += 1;
      }
      return acc;
    },
    {
      distribution: { ...emptyDistribution },
      general: 0,
      punctuality: 0,
      punctualityCount: 0,
      quality: 0,
      qualityCount: 0,
      communication: 0,
      communicationCount: 0,
      price: 0,
      priceCount: 0,
    },
  );

  // Promedios por dimensión solo sobre reseñas que traen esa dimensión; 0
  // significa "sin datos", y la UI no debe mostrar la fila en ese caso.
  return {
    average: roundOne(sums.general / total),
    total,
    verifiedTotal: visibleReviews.filter((review) => review.verifiedService).length,
    distribution: sums.distribution,
    punctuality: sums.punctualityCount ? roundOne(sums.punctuality / sums.punctualityCount) : 0,
    quality: sums.qualityCount ? roundOne(sums.quality / sums.qualityCount) : 0,
    communication: sums.communicationCount ? roundOne(sums.communication / sums.communicationCount) : 0,
    price: sums.priceCount ? roundOne(sums.price / sums.priceCount) : 0,
  };
}

export function recommendationScore(specialist: Specialist) {
  const jobs = specialist.trabajosCompletados ?? specialist.jobs;
  const levelWeight: Record<SpecialistLevel, number> = {
    Fundador: 5,
    Bronce: 10,
    Plata: 16,
    Oro: 22,
    Platino: 28,
  };
  return specialist.rating * 20 + Math.min(jobs, 500) / 12 + specialist.recommendation / 4 + levelWeight[getSpecialistLevel(specialist)];
}

function responseMinutes(value: string) {
  const lower = value.toLowerCase();
  const numeric = Number.parseFloat(lower.replace(",", "."));
  if (!Number.isFinite(numeric)) return 999;
  if (lower.includes("min")) return numeric;
  if (lower.includes("h")) return numeric * 60;
  return numeric;
}

function normalizeRating(value: number) {
  return clampRating(Number.isFinite(value) ? value : 0);
}

function clampRating(value: number) {
  return Math.min(5, Math.max(1, roundOne(value)));
}

function roundOne(value: number) {
  return Number(value.toFixed(1));
}
