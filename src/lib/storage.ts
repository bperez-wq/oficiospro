"use client";

import { defaultBookings, defaultTransactions, type Booking, type CreditTransaction } from "@/data/mock";

const keys = {
  wallet: "oficiospro.creditsWallet",
  bookings: "oficiospro.bookings",
  transactions: "oficiospro.creditTransactions",
  users: "oficiospro.users",
  specialists: "oficiospro.specialistRequests",
  companies: "oficiospro.companyRequests",
};

type Wallet = {
  balance: number;
  expiresInMonths: number;
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function seedMockState() {
  if (typeof window === "undefined") return;
  if (!window.localStorage.getItem(keys.wallet)) write(keys.wallet, { balance: 135, expiresInMonths: 24 });
  if (!window.localStorage.getItem(keys.bookings)) write(keys.bookings, defaultBookings);
  if (!window.localStorage.getItem(keys.transactions)) write(keys.transactions, defaultTransactions);
}

export function getWallet() {
  return read<Wallet>(keys.wallet, { balance: 135, expiresInMonths: 24 });
}

export function saveWallet(wallet: Wallet) {
  write(keys.wallet, wallet);
}

export function getBookings() {
  return read<Booking[]>(keys.bookings, defaultBookings);
}

export function saveBookings(bookings: Booking[]) {
  write(keys.bookings, bookings);
}

export function getTransactions() {
  return read<CreditTransaction[]>(keys.transactions, defaultTransactions);
}

export function saveTransactions(transactions: CreditTransaction[]) {
  write(keys.transactions, transactions);
}

export function appendStoredItem<T extends object>(key: "users" | "specialists" | "companies", item: T) {
  const existing = read<T[]>(keys[key], []);
  write(keys[key], [{ ...item, id: `${key}-${Date.now()}` }, ...existing]);
}

export function getStoredItems<T>(key: "users" | "specialists" | "companies") {
  return read<T[]>(keys[key], []);
}
