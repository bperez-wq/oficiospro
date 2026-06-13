"use client";

import { cartItemDedupeKey, cartItemStableId } from "@/lib/payments/cart";
import type { CartItem, CartItemType } from "@/lib/payments/types";

export type { CartItemType };
export type OficiosProCartItem = CartItem;
type CartItemDraft = Omit<OficiosProCartItem, "id" | "createdAt"> & { id?: string; createdAt?: string; updatedAt?: string };

const cartKey = "oficiospro.cart";
const sessionKey = "oficiospro.session";
const cartEventName = "oficiospro-cart-updated";

export function getCartItems() {
  if (typeof window === "undefined") return [] as OficiosProCartItem[];
  const sessionItems = safeReadCart(window.sessionStorage);
  const localItems = hasSession() ? safeReadCart(window.localStorage) : [];
  return uniqueCartItems(hasSession() ? [...localItems, ...sessionItems] : sessionItems);
}

export function saveCartItems(items: OficiosProCartItem[]) {
  if (typeof window === "undefined") return;
  const next = uniqueCartItems(items);
  if (hasSession()) {
    safeWriteCart(window.localStorage, next);
    window.sessionStorage.removeItem(cartKey);
  } else {
    safeWriteCart(window.sessionStorage, next);
  }
  window.dispatchEvent(new CustomEvent(cartEventName));
}

export function addCartItem(item: CartItemDraft) {
  return upsertCartItem(item);
}

export function upsertCartItem(item: CartItemDraft) {
  const existing = getCartItems();
  const now = new Date().toISOString();
  const incoming = normalizeCartItem({
    ...item,
    id: item.id ?? cartItemStableId(item),
    createdAt: item.createdAt ?? now,
    updatedAt: now,
  });
  const incomingKey = cartItemDedupeKey(incoming);
  const duplicate = existing.find((current) => current.id === incoming.id || cartItemDedupeKey(current) === incomingKey);
  const nextItem: OficiosProCartItem = {
    ...duplicate,
    ...incoming,
    id: item.id ?? duplicate?.id ?? incoming.id,
    createdAt: duplicate?.createdAt ?? incoming.createdAt,
    updatedAt: now,
  };
  const nextKey = cartItemDedupeKey(nextItem);
  const next = [nextItem, ...existing.filter((current) => current.id !== nextItem.id && cartItemDedupeKey(current) !== nextKey)];
  saveCartItems(next);
  return nextItem;
}

export function removeCartItem(id: string) {
  saveCartItems(getCartItems().filter((item) => item.id !== id));
}

export function getCartItemById(id: string) {
  return getCartItems().find((item) => item.id === id) ?? null;
}

export function getSpecialistProfileUrl(item: Pick<OficiosProCartItem, "specialistSlug" | "specialistId">) {
  const id = item.specialistSlug ?? item.specialistId ?? "";
  return `/especialistas/perfil?id=${encodeURIComponent(id)}`;
}

export function clearCart() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(cartKey);
  window.sessionStorage.removeItem(cartKey);
  window.dispatchEvent(new CustomEvent(cartEventName));
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

export function safeReadCart(storage: Storage) {
  try {
    const raw = storage.getItem(cartKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeCartItem).filter(Boolean) : [];
  } catch {
    return [] as OficiosProCartItem[];
  }
}

export function safeWriteCart(storage: Storage, items: OficiosProCartItem[]) {
  try {
    storage.setItem(cartKey, JSON.stringify(uniqueCartItems(items).slice(0, 50)));
  } catch {
    // Storage can be unavailable in private mode; the UI keeps its in-memory state.
  }
}

function hasSession() {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(sessionKey));
}

function uniqueCartItems(items: OficiosProCartItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item?.id) return false;
    const key = cartItemDedupeKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeCartItem(item: Partial<OficiosProCartItem>): OficiosProCartItem {
  const now = new Date().toISOString();
  const intendedAction = item.intendedAction ?? inferIntendedAction(item);
  const normalized: OficiosProCartItem = {
    type: item.type ?? "service_request",
    title: item.title ?? item.serviceName ?? "Solicitud OficiosPro",
    credits: item.credits,
    amountCLP: item.amountCLP,
    priceCLP: item.priceCLP,
    planId: item.planId,
    specialistId: item.specialistId,
    specialistName: item.specialistName,
    specialistSlug: item.specialistSlug ?? item.specialistId,
    specialistImage: item.specialistImage,
    specialistRating: item.specialistRating,
    specialistLevel: item.specialistLevel,
    specialistCommune: item.specialistCommune,
    specialistDistance: item.specialistDistance,
    serviceId: item.serviceId,
    serviceName: item.serviceName,
    category: item.category,
    categoryId: item.categoryId,
    pricingMode: item.pricingMode,
    intendedAction,
    source: item.source,
    sourceSection: item.sourceSection,
    virtualQuoteId: item.virtualQuoteId,
    status: item.status ?? initialStatusFor(item, intendedAction),
    creditPrice: item.creditPrice,
    minCredits: item.minCredits,
    maxCredits: item.maxCredits,
    id: item.id ?? cartItemStableId({ ...item, intendedAction } as Omit<OficiosProCartItem, "id" | "createdAt">),
    createdAt: item.createdAt ?? now,
    updatedAt: item.updatedAt ?? item.createdAt ?? now,
  };
  if (isPendingQuote(normalized)) {
    normalized.credits = 0;
    normalized.amountCLP = 0;
    normalized.priceCLP = 0;
  }
  return normalized;
}

function inferIntendedAction(item: Partial<OficiosProCartItem>): OficiosProCartItem["intendedAction"] {
  if (item.pricingMode === "virtual_diagnosis") return "virtual_quote";
  if (item.type === "quote_request" || item.pricingMode === "quote_required" || item.pricingMode === "range" || item.pricingMode === "custom") return "quote";
  if (item.type === "credit_pack" || item.type === "subscription_plan" || item.type === "additional_charge") return "checkout";
  return "reserve";
}

function initialStatusFor(item: Partial<OficiosProCartItem>, intendedAction: OficiosProCartItem["intendedAction"]) {
  if (intendedAction === "virtual_quote") return "virtual_quote_pending";
  if (intendedAction === "quote") return "quote_pending";
  if (item.type === "visit") return "visit_pending";
  return "ready";
}

function isPendingQuote(item: OficiosProCartItem) {
  const quoteLike =
    item.type === "quote_request" ||
    item.pricingMode === "quote_required" ||
    item.pricingMode === "virtual_diagnosis" ||
    item.pricingMode === "range" ||
    item.pricingMode === "custom";
  return quoteLike && !["quote_approved", "virtual_quote_approved", "checkout_ready", "approved"].includes(String(item.status ?? ""));
}
