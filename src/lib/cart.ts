"use client";

export type CartItemType = "credit_pack" | "subscription_plan" | "service_request" | "quote_request" | "visit";

export type OficiosProCartItem = {
  id: string;
  type: CartItemType;
  title: string;
  credits?: number;
  priceCLP?: number;
  planId?: string;
  specialistId?: string;
  specialistName?: string;
  serviceId?: string;
  serviceName?: string;
  pricingMode?: string;
  createdAt: string;
};

const cartKey = "oficiospro.cart";
const cartEventName = "oficiospro-cart-updated";

export function getCartItems() {
  if (typeof window === "undefined") return [] as OficiosProCartItem[];
  try {
    const raw = window.localStorage.getItem(cartKey) ?? window.sessionStorage.getItem(cartKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as OficiosProCartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items: OficiosProCartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(cartKey, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(cartEventName));
}

export function addCartItem(item: Omit<OficiosProCartItem, "id" | "createdAt"> & { id?: string; createdAt?: string }) {
  const id = item.id ?? cartItemStableId(item);
  const nextItem: OficiosProCartItem = {
    ...item,
    id,
    createdAt: item.createdAt ?? new Date().toISOString(),
  };
  const existing = getCartItems();
  const next = [nextItem, ...existing.filter((current) => current.id !== id)];
  saveCartItems(next);
  return nextItem;
}

export function removeCartItem(id: string) {
  saveCartItems(getCartItems().filter((item) => item.id !== id));
}

export function clearCart() {
  saveCartItems([]);
}

export function onCartChange(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(cartEventName, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(cartEventName, callback);
    window.removeEventListener("storage", callback);
  };
}

function cartItemStableId(item: Omit<OficiosProCartItem, "id" | "createdAt">) {
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
