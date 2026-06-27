// Single source of truth for explaining credits to users.
//
// Pulls real values from the project config so the explanation never drifts from
// what the platform actually charges. Pure functions + plain data, with no React
// or browser dependency, so this module is reused as-is by the future mobile app.

import { defaultCommercialConfig } from "@/data/commercialConfig";
import { chileTaxConfig2026 } from "@/config/taxConfig";

/** Value of one credit in CLP (from commercial config). */
export const CREDIT_VALUE_CLP = defaultCommercialConfig.customerCreditValueCLP;

/** Club Hogar discount per request, in credits. */
export const SUBSCRIBER_DISCOUNT_CREDITS = defaultCommercialConfig.subscriberDiscountCredits;

/** Credits retained for an initial visit (visit-then-quote pricing). */
export const INITIAL_VISIT_FEE_CREDITS = defaultCommercialConfig.initialVisitFeeCredits;

const commission = chileTaxConfig2026.platformCommission;
const ivaRate = chileTaxConfig2026.ivaRate;

/** Short, human label for the platform commission, e.g. "9,5% + IVA". */
export const COMMISSION_SHORT_LABEL = commission.shortLabel;

/** Convert a credit amount to CLP. */
export function creditsToCLP(credits: number): number {
  return Math.round(credits * CREDIT_VALUE_CLP);
}

/** Format a CLP amount in Chilean style, e.g. 88700 -> "$88.700". */
export function formatCLP(value: number): string {
  return `$${Math.round(value).toLocaleString("es-CL")}`;
}

/** Shorthand: a credit amount formatted as "~$X" in CLP. */
export function creditsToCLPLabel(credits: number, approx = true): string {
  return `${approx ? "~" : ""}${formatCLP(creditsToCLP(credits))}`;
}

export type SpecialistPayout = {
  grossCLP: number;
  commissionNetCLP: number;
  commissionIvaCLP: number;
  commissionTotalCLP: number;
  specialistCLP: number;
};

/**
 * What the specialist receives for a job, given the gross amount in CLP.
 * Commission = max(gross * rate, minimum); IVA added on top when it applies.
 * Reference model; final taxes/retention are validated by accountant/SII.
 */
export function computeSpecialistPayout(grossCLP: number): SpecialistPayout {
  const minimum = commission.minimumCommissionCLP ?? 0;
  let commissionNetCLP = Math.max(grossCLP * commission.standardRate, minimum);
  if (commission.maximumCommissionCLP) {
    commissionNetCLP = Math.min(commissionNetCLP, commission.maximumCommissionCLP);
  }
  commissionNetCLP = Math.round(commissionNetCLP);
  const commissionIvaCLP = commission.ivaApplies ? Math.round(commissionNetCLP * ivaRate) : 0;
  const commissionTotalCLP = commissionNetCLP + commissionIvaCLP;
  const specialistCLP = Math.max(0, grossCLP - commissionTotalCLP);
  return { grossCLP, commissionNetCLP, commissionIvaCLP, commissionTotalCLP, specialistCLP };
}

export type CreditExample = {
  service: string;
  credits: number;
};

/**
 * Realistic, REFERENTIAL service examples (not fixed prices). Final price depends
 * on the specialist, the job and the commune; shown only to give a sense of scale.
 */
export const CREDIT_EXAMPLES: CreditExample[] = [
  { service: "Visita de diagnostico", credits: INITIAL_VISIT_FEE_CREDITS },
  { service: "Armado de mueble", credits: 6 },
  { service: "Reparacion de punto electrico", credits: 8 },
  { service: "Destape de lavaplatos", credits: 10 },
  { service: "Mantencion de aire acondicionado", credits: 14 },
  { service: "Instalacion de calefont", credits: 18 },
];

/** The headline example used to show what the specialist receives. */
export const PAYOUT_EXAMPLE_CREDITS = 100;
