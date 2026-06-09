import type { FlexibleService } from "@/data/flexiblePricing";
import type { Specialist } from "@/data/mock";
import { DEFAULT_SUBSCRIBER_DISCOUNT_CREDITS, creditsForInitialHold } from "@/lib/flexiblePricing";

export type SpecialistLevel = "Fundador" | "Bronce" | "Plata" | "Oro" | "Platino";

export type SpecialistReview = {
  id: string;
  specialistId: string;
  customerName: string;
  ratingGeneral: number;
  ratingPuntualidad: number;
  ratingCalidad: number;
  ratingComunicacion: number;
  ratingPrecio: number;
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
  if (specialist.rank) return specialist.rank as SpecialistLevel;
  if (jobs >= 420 || specialist.rating >= 4.95) return "Platino";
  if (jobs >= 250 || specialist.rating >= 4.9) return "Oro";
  if (jobs >= 120 || specialist.rating >= 4.75) return "Plata";
  if (jobs >= 40 || specialist.rating >= 4.55) return "Bronce";
  return "Fundador";
}

export function getTrustBadges(specialist: Specialist) {
  return [
    specialist.verified ? "Identidad verificada" : null,
    (specialist.validation?.references ?? 0) > 0 ? "Referencias revisadas" : null,
    specialist.certifications.length || specialist.validation?.certifications === "approved" ? "Certificacion cargada" : null,
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
      ratingPuntualidad: clampRating(review.ratingPuntualidad ?? rating - (index % 3 === 0 ? 0.2 : 0)),
      ratingCalidad: clampRating(review.ratingCalidad ?? rating + (index % 2 === 0 ? 0.1 : 0)),
      ratingComunicacion: clampRating(review.ratingComunicacion ?? rating - (index % 4 === 0 ? 0.1 : 0)),
      ratingPrecio: clampRating(review.ratingPrecio ?? rating - (index % 5 === 0 ? 0.2 : 0)),
      comment: review.comment ?? review.text,
      serviceName: review.serviceName ?? fallbackServices[index % fallbackServices.length] ?? specialist.specialty,
      comuna: review.comuna ?? specialist.commune ?? specialist.zone,
      date: review.date,
      verifiedService: review.verifiedService ?? index % 3 !== 2,
      hidden: review.hidden,
      reviewedByAdmin: review.reviewedByAdmin ?? index % 4 !== 0,
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
      acc.punctuality += review.ratingPuntualidad;
      acc.quality += review.ratingCalidad;
      acc.communication += review.ratingComunicacion;
      acc.price += review.ratingPrecio;
      return acc;
    },
    { distribution: { ...emptyDistribution }, general: 0, punctuality: 0, quality: 0, communication: 0, price: 0 },
  );

  return {
    average: roundOne(sums.general / total),
    total,
    verifiedTotal: visibleReviews.filter((review) => review.verifiedService).length,
    distribution: sums.distribution,
    punctuality: roundOne(sums.punctuality / total),
    quality: roundOne(sums.quality / total),
    communication: roundOne(sums.communication / total),
    price: roundOne(sums.price / total),
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
