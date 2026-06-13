"use client";

import type { Specialist } from "@/data/mock";
import type { FlexibleService } from "@/data/flexiblePricing";

export type IntendedAction = "reservar" | "contactar" | "solicitar";

export function preserveSpecialistIntent({
  specialist,
  service,
  intendedAction,
  category,
  specialty,
  commune,
  source,
  sourceSection,
}: {
  specialist?: Specialist | null;
  service?: FlexibleService | null;
  intendedAction: IntendedAction;
  category?: string;
  specialty?: string;
  commune?: string;
  source?: string;
  sourceSection?: string;
}) {
  if (typeof window === "undefined") return;

  const payload = {
    specialistId: specialist?.id,
    specialistSlug: specialist?.slug ?? specialist?.id,
    serviceId: service?.id,
    serviceName: service?.name,
    creditPrice: serviceCreditPrice(service),
    pricingMode: service?.pricingMode,
    categoria: category ?? specialist?.serviceTypeId ?? specialist?.category,
    especialidad: specialty ?? service?.specialty ?? specialist?.specialty,
    comuna: commune ?? specialist?.commune ?? specialist?.zone,
    intendedAction,
    source,
    sourceSection,
    timestamp: new Date().toISOString(),
  };

  try {
    window.sessionStorage.setItem("oficiospro.intendedSpecialistAction", JSON.stringify(payload));
  } catch {
    // The user should still continue if browser storage is unavailable.
  }
}

function serviceCreditPrice(service?: FlexibleService | null) {
  if (!service) return undefined;
  if (service.creditPrice) return service.creditPrice;
  if (service.pricingMode === "fixed") return service.fixedCredits;
  if (service.pricingMode === "hourly") return service.hourlyCredits;
  if (service.pricingMode === "range") return service.minCredits;
  if (service.pricingMode === "virtual_diagnosis") return service.minCredits ?? service.visitCredits;
  if (service.pricingMode === "visit_then_quote") return service.visitCredits;
  return service.minCredits;
}
