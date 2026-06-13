import type { CartItem } from "@/lib/payments/types";

export function itemAmountCLP(item: Pick<CartItem, "amountCLP" | "priceCLP">) {
  return Number(item.amountCLP ?? item.priceCLP ?? 0);
}

export function cartTotals(items: CartItem[]) {
  return {
    credits: items.reduce((sum, item) => sum + Number(item.credits ?? 0), 0),
    amountCLP: items.reduce((sum, item) => sum + itemAmountCLP(item), 0),
  };
}

export function checkoutModeForCart(items: CartItem[]) {
  const plan = items.find((item) => item.type === "subscription_plan" && item.planId);
  if (plan?.planId) return { planId: plan.planId, mode: "subscription_plan" as const };
  const creditPack = items.find((item) => item.type === "credit_pack");
  if (creditPack) return { creditPackId: creditPack.id, mode: "credit_pack" as const };
  const service = items.find((item) => ["service_request", "quote_request", "visit", "additional_charge"].includes(item.type));
  if (!service) return { mode: "empty" as const };
  if (service.type === "additional_charge") return { mode: "additional_charge" as const, cartItemId: service.id };
  if (service.pricingMode === "visit_then_quote" || service.type === "visit") return { mode: "visit_fee" as const, cartItemId: service.id };
  if (service.pricingMode === "quote_required" || service.pricingMode === "virtual_diagnosis" || service.pricingMode === "range" || service.type === "quote_request") {
    return { mode: "quote_acceptance" as const, cartItemId: service.id };
  }
  return { mode: "service_reservation" as const, cartItemId: service.id };
}

export function cartItemStableId(item: Omit<CartItem, "id" | "createdAt">) {
  return [
    item.type,
    item.planId,
    item.specialistId,
    item.serviceId,
    item.pricingMode,
    item.credits,
    item.title,
  ]
    .filter(Boolean)
    .join(":")
    .toLowerCase()
    .replace(/[^a-z0-9:.-]+/g, "-");
}
