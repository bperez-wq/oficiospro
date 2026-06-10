"use client";

import { cartItemStableId } from "@/lib/payments/cart";
import type { CartItem, CartItemType } from "@/lib/payments/types";

export type { CartItemType };
export type OficiosProCartItem = CartItem;

const cartKey = "oficiospro.cart";
const sessionKey = "oficiospro.session";
const cartEventName = "oficiospro-cart-updated";

export function getCartItems() {
  if (typeof window === "undefined") return [] as OficiosProCartItem[];
  const sessionItems = readCartStorage(window.sessionStorage);
  const localItems = hasSession() ? readCartStorage(window.localStorage) : [];
  const seen = new Set<string>();
  return [...sessionItems, ...localItems].filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function saveCartItems(items: OficiosProCartItem[]) {
  if (typeof window === "undefined") return;
  if (hasSession()) {
    window.localStorage.setItem(cartKey, JSON.stringify(items));
  } else {
    window.sessionStorage.setItem(cartKey, JSON.stringify(items));
  }
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

function hasSession() {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(sessionKey));
}

function readCartStorage(storage: Storage) {
  try {
    const raw = storage.getItem(cartKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as OficiosProCartItem[]) : [];
  } catch {
    return [];
  }
}
