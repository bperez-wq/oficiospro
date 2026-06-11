"use client";

/**
 * Función central de conversión "Cotizar / Reservar / Solicitar visita" → Bolsa.
 *
 * Regla: cualquier CTA en cards de especialistas agrega primero la selección a la
 * Bolsa (sin exigir login) y recién después se piden datos en /bolsa o checkout.
 * No duplica lógica: usa cart.ts (dedupe por id estable), intendedAction y leadClient.
 */

import type { FlexibleService } from "@/data/flexiblePricing";
import type { Specialist } from "@/data/mock";
import { addCartItem, getCartItems } from "@/lib/cart";
import { creditsForInitialHold, getPrimaryFlexibleService } from "@/lib/flexiblePricing";
import { preserveSpecialistIntent } from "@/lib/intendedAction";
import { submitConversionEvent } from "@/lib/leadClient";
import { cartItemStableId } from "@/lib/payments/cart";
import { getSpecialistLevel } from "@/lib/trust";

export const openBagEventName = "oficiospro-open-bag";

/** Texto del CTA según modalidad de precio del servicio. */
export function bagActionLabel(pricingMode: string | undefined) {
  if (pricingMode === "quote_required" || pricingMode === "range" || pricingMode === "custom") return "Cotizar";
  if (pricingMode === "visit_then_quote") return "Solicitar visita";
  return "Reservar";
}

export function bagIntentFor(pricingMode: string | undefined): "cotizar" | "visita" | "reservar" {
  if (pricingMode === "quote_required" || pricingMode === "range" || pricingMode === "custom") return "cotizar";
  if (pricingMode === "visit_then_quote") return "visita";
  return "reservar";
}

export type AddToBagResult = {
  added: boolean;
  alreadyInBag: boolean;
  itemId: string;
};

/**
 * Agrega especialista+servicio a la Bolsa y lleva al usuario a revisarla.
 * - Desktop: abre el drawer de Bolsa (evento que escucha el Header).
 * - Mobile: navega directo a /bolsa.
 * - Si el mismo especialista+servicio ya estaba, no duplica (id estable) y lo informa.
 */
export function addSpecialistToBagAndProceed({
  specialist,
  service,
  sourceSection,
  proceed = "auto",
}: {
  specialist: Specialist;
  service?: FlexibleService | null;
  sourceSection: string;
  proceed?: "auto" | "drawer" | "page" | "none";
}): AddToBagResult {
  const selectedService = service ?? getPrimaryFlexibleService(specialist);
  const intent = bagIntentFor(selectedService.pricingMode);
  const credits = creditsForInitialHold(selectedService, selectedService.minHours ?? 1, false);

  const draft = {
    type:
      selectedService.pricingMode === "visit_then_quote"
        ? ("visit" as const)
        : selectedService.pricingMode === "quote_required" || selectedService.pricingMode === "range" || selectedService.pricingMode === "custom"
          ? ("quote_request" as const)
          : ("service_request" as const),
    title: selectedService.name,
    credits,
    amountCLP: credits * 1000,
    specialistId: specialist.id,
    specialistName: specialist.name,
    specialistSlug: specialist.slug,
    specialistImage: specialist.image,
    specialistRating: specialist.rating,
    specialistLevel: getSpecialistLevel(specialist),
    specialistCommune: specialist.commune ?? specialist.zone,
    specialistDistance: specialist.distance,
    serviceId: selectedService.id,
    serviceName: selectedService.name,
    pricingMode: selectedService.pricingMode,
    sourceSection,
  };

  const stableId = cartItemStableId(draft);
  const alreadyInBag = getCartItems().some((item) => item.id === stableId);

  /* Contexto preservado aunque no haya sesión (la bolsa vive en storage del navegador). */
  preserveSpecialistIntent({
    specialist,
    service: selectedService,
    intendedAction: intent === "reservar" ? "reservar" : "solicitar",
    source: "addSpecialistToBagAndProceed",
    sourceSection,
  });

  const item = addCartItem(draft);

  /* Tracking de conversión; nunca rompe el flujo si no hay backend. */
  void submitConversionEvent({
    type: intent === "reservar" ? "specialist_reservation_added_to_bag" : "specialist_quote_added_to_bag",
    source: "bag",
    sourceComponent: sourceSection,
    payload: {
      specialistId: specialist.id,
      serviceId: selectedService.id,
      categoryId: selectedService.categoryId ?? selectedService.serviceTypeId,
      specialty: selectedService.specialty,
      pricingMode: selectedService.pricingMode,
      sourceSection,
      alreadyInBag,
      timestamp: new Date().toISOString(),
    },
  });

  proceedToBag(proceed);
  return { added: !alreadyInBag, alreadyInBag, itemId: item.id };
}

function proceedToBag(mode: "auto" | "drawer" | "page" | "none") {
  if (typeof window === "undefined" || mode === "none") return;
  const useDrawer = mode === "drawer" || (mode === "auto" && window.innerWidth >= 768);
  if (useDrawer) {
    window.dispatchEvent(new CustomEvent(openBagEventName));
  } else {
    window.location.assign("/bolsa");
  }
}
