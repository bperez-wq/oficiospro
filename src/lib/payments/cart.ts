import type { CartItem } from "@/lib/payments/types";

export function itemAmountCLP(item: Pick<CartItem, "amountCLP" | "priceCLP">) {
  return Number(item.amountCLP ?? item.priceCLP ?? 0);
}

export function cartTotals(items: CartItem[]) {
  const checkoutScopedItems = items.map((item) =>
    isPendingQuoteItem(item)
      ? {
          ...item,
          credits: 0,
          amountCLP: 0,
          priceCLP: 0,
        }
      : item,
  );
  return {
    credits: checkoutScopedItems.reduce((sum, item) => sum + Number(item.credits ?? 0), 0),
    amountCLP: checkoutScopedItems.reduce((sum, item) => sum + itemAmountCLP(item), 0),
  };
}

export function checkoutModeForCart(items: CartItem[]) {
  const checkoutReadyItems = items.filter(isCartItemCheckoutReady);
  const plan = checkoutReadyItems.find((item) => item.type === "subscription_plan" && item.planId);
  if (plan?.planId) return { planId: plan.planId, mode: "subscription_plan" as const };
  const creditPack = checkoutReadyItems.find((item) => item.type === "credit_pack");
  if (creditPack) return { creditPackId: creditPack.id, mode: "credit_pack" as const };
  const service = checkoutReadyItems.find((item) => ["service_request", "quote_request", "visit", "additional_charge"].includes(item.type));
  if (!service) return { mode: "empty" as const };
  if (service.type === "additional_charge") return { mode: "additional_charge" as const, cartItemId: service.id };
  if (service.pricingMode === "visit_then_quote" || service.type === "visit") return { mode: "visit_fee" as const, cartItemId: service.id };
  if (service.pricingMode === "quote_required" || service.pricingMode === "virtual_diagnosis" || service.pricingMode === "range" || service.type === "quote_request") {
    return { mode: "quote_acceptance" as const, cartItemId: service.id };
  }
  return { mode: "service_reservation" as const, cartItemId: service.id };
}

export function cartItemStableId(item: Omit<CartItem, "id" | "createdAt">) {
  const specialistKey = item.specialistId ?? item.specialistSlug;
  if (specialistKey) {
    return slugifyCartKey([
      "specialist",
      specialistKey,
      item.serviceId ?? item.serviceName ?? item.title,
      item.intendedAction ?? inferredCartAction(item),
    ]);
  }
  if (item.type === "subscription_plan") return slugifyCartKey(["subscription", item.planId ?? item.title]);
  if (item.type === "credit_pack") return slugifyCartKey(["credit-pack", item.planId ?? item.title, item.credits]);
  return slugifyCartKey([item.type, item.planId, item.serviceId, item.title]);
}

export function cartItemDedupeKey(item: Pick<CartItem, "id" | "type" | "planId" | "specialistId" | "specialistSlug" | "serviceId" | "serviceName" | "title" | "intendedAction" | "pricingMode" | "credits">) {
  const specialistKey = item.specialistId ?? item.specialistSlug;
  if (specialistKey) {
    return slugifyCartKey([
      "specialist",
      specialistKey,
      item.serviceId ?? item.serviceName ?? item.title,
      item.intendedAction ?? inferredCartAction(item),
    ]);
  }
  if (item.type === "subscription_plan") return slugifyCartKey(["subscription", item.planId ?? item.title]);
  if (item.type === "credit_pack") return slugifyCartKey(["credit-pack", item.planId ?? item.title, item.credits]);
  return item.id || slugifyCartKey([item.type, item.planId, item.serviceId, item.title]);
}

export function isCartItemCheckoutReady(item: CartItem) {
  if (isPendingQuoteItem(item)) return false;
  return true;
}

function isPendingQuoteItem(item: CartItem) {
  const quoteLike =
    item.type === "quote_request" ||
    item.pricingMode === "quote_required" ||
    item.pricingMode === "virtual_diagnosis" ||
    item.pricingMode === "range" ||
    item.pricingMode === "custom";
  if (!quoteLike) return false;
  return !["quote_approved", "virtual_quote_approved", "checkout_ready", "approved"].includes(String(item.status ?? ""));
}

function inferredCartAction(item: Pick<CartItem, "type" | "pricingMode" | "intendedAction">) {
  if (item.intendedAction) return item.intendedAction;
  if (item.pricingMode === "virtual_diagnosis") return "virtual_quote";
  if (item.type === "quote_request" || item.pricingMode === "quote_required" || item.pricingMode === "range" || item.pricingMode === "custom") return "quote";
  if (item.type === "credit_pack" || item.type === "subscription_plan" || item.type === "additional_charge") return "checkout";
  return "reserve";
}

function slugifyCartKey(parts: unknown[]) {
  return parts
    .filter((part) => part !== undefined && part !== null && String(part).trim() !== "")
    .join(":")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9:.-]+/g, "-")
    .replace(/^-|-$/g, "");
}
