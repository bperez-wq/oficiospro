import { submitConversionEvent, submitLead } from "@/lib/leadClient";

/**
 * Taxonomía unificada de leads/eventos de Market Lab.
 *
 * Clasificación (decisión Benjamín):
 * - clientes/empresas  -> market_lab_demand_lead
 * - especialistas      -> market_lab_supply_lead
 * - `global_waitlist`  -> queda como `source`/`campaign`, NO como modelo separado.
 *
 * No toca Worker/D1: persiste el contacto por el endpoint genérico de leads y emite un evento de
 * conversión con el `type` de clasificación. Así el CRM ve demand/supply sin nuevos tipos en el Worker.
 */
export type MarketLabRole = "client" | "company" | "specialist";

export const MARKET_LAB_DEMAND_LEAD = "market_lab_demand_lead";
export const MARKET_LAB_SUPPLY_LEAD = "market_lab_supply_lead";

export function marketLabClassification(role: MarketLabRole): string {
  return role === "specialist" ? MARKET_LAB_SUPPLY_LEAD : MARKET_LAB_DEMAND_LEAD;
}

export type MarketLabInterestInput = {
  role: MarketLabRole;
  country: string;
  city: string;
  trade: string;
  name?: string;
  email?: string;
  locale?: string;
  /** Origen: "global_waitlist" (landing /global) o "market_lab_landing" (rutas /market-lab/...). */
  source?: string;
  campaign?: string;
  honeypot?: string;
};

export async function submitMarketLabInterest(input: MarketLabInterestInput) {
  if (input.honeypot) return { ok: false, message: "" };

  const classification = marketLabClassification(input.role);
  const source = input.source ?? "global_waitlist";
  const campaign = input.campaign ?? "global_prototype";
  const payload = {
    kind: "market_lab",
    classification,
    role: input.role,
    country: input.country,
    city: input.city,
    trade: input.trade,
    locale: input.locale,
    source,
  };

  const lead = await submitLead({
    leadType: "payment_interest",
    fullName: input.name,
    email: input.email,
    trade: input.trade,
    communeName: input.city,
    source,
    campaign,
    problemDescription: `[${classification}] country=${input.country} city=${input.city} trade=${input.trade} role=${input.role}`,
    payload,
    website: input.honeypot,
  });

  void submitConversionEvent({
    type: classification,
    source,
    campaign,
    sourceComponent: "MarketLab",
    sourceButton: source,
    payload,
  });

  return lead;
}
