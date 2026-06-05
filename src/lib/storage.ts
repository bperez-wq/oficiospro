"use client";

import { defaultBookings, defaultTransactions, type Booking, type CreditTransaction } from "@/data/mock";
import { defaultCommercialConfig, type CommercialConfig, type SubscriptionPlan } from "@/data/marketplace";

const keys = {
  wallet: "oficiospro.creditsWallet",
  bookings: "oficiospro.bookings",
  transactions: "oficiospro.creditTransactions",
  users: "oficiospro.users",
  specialists: "oficiospro.specialistRequests",
  companies: "oficiospro.companyRequests",
  commercialConfig: "oficiospro.commercialConfig",
  subscription: "oficiospro.subscription",
  session: "oficiospro.session",
  referrals: "oficiospro.referrals",
};

export type Wallet = {
  balance: number;
  expiresInMonths: number;
};

export type MockSession = {
  role: "client" | "specialist" | "company" | "admin";
  name: string;
  email?: string;
  planId?: string;
  createdAt: string;
};

export type MockSubscription = {
  planId: string;
  planName: string;
  priceCLP: number;
  monthlyCredits: number;
  accumulatesMonths: number;
  status: "activa" | "pausada";
  paymentMethod: string;
  renewal: "mensual automática";
  activatedAt: string;
};

export type ReferralState = {
  clientCode: string;
  clientCreditsEarned: number;
  clientInvitations: number;
  specialistCode: string;
  specialistInvitations: number;
  specialistBenefit: string;
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
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function seedMockState() {
  if (typeof window === "undefined") return;
  if (!window.localStorage.getItem(keys.wallet)) write(keys.wallet, { balance: 135, expiresInMonths: 24 });
  if (!window.localStorage.getItem(keys.bookings)) write(keys.bookings, defaultBookings);
  if (!window.localStorage.getItem(keys.transactions)) write(keys.transactions, defaultTransactions);
  if (!window.localStorage.getItem(keys.commercialConfig)) write(keys.commercialConfig, defaultCommercialConfig);
  if (!window.localStorage.getItem(keys.referrals)) {
    write<ReferralState>(keys.referrals, {
      clientCode: "OP-CLIENTE-10",
      clientCreditsEarned: 0,
      clientInvitations: 0,
      specialistCode: "OP-FUNDADOR",
      specialistInvitations: 0,
      specialistBenefit: "Badge Fundador disponible al aprobar referidos",
    });
  }
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
  const storedItem = { ...item, id: `${key}-${Date.now()}` } as T & { id: string };
  write(keys[key], [storedItem as T, ...existing]);
  return storedItem;
}

export function getStoredItems<T>(key: "users" | "specialists" | "companies") {
  return read<T[]>(keys[key], []);
}

export function saveStoredItems<T>(key: "users" | "specialists" | "companies", items: T[]) {
  write(keys[key], items);
}

export function getCommercialConfig() {
  return read<CommercialConfig>(keys.commercialConfig, defaultCommercialConfig);
}

export function saveCommercialConfig(config: CommercialConfig) {
  write(keys.commercialConfig, config);
}

export function getMockSession() {
  return read<MockSession | null>(keys.session, null);
}

export function setMockSession(session: MockSession) {
  write(keys.session, session);
}

export function isClientLoggedIn() {
  return Boolean(getMockSession());
}

export function saveSubscription(plan: SubscriptionPlan, paymentMethod = "Tarjeta terminada en 4242") {
  const subscription: MockSubscription = {
    planId: plan.id,
    planName: plan.name,
    priceCLP: plan.priceCLP,
    monthlyCredits: plan.monthlyCredits,
    accumulatesMonths: plan.accumulatesMonths,
    status: "activa",
    paymentMethod,
    renewal: "mensual automática",
    activatedAt: new Date().toISOString(),
  };

  write(keys.subscription, subscription);
  return subscription;
}

export function getSubscription() {
  return read<MockSubscription | null>(keys.subscription, null);
}

export function getReferralState() {
  return read<ReferralState>(keys.referrals, {
    clientCode: "OP-CLIENTE-10",
    clientCreditsEarned: 0,
    clientInvitations: 0,
    specialistCode: "OP-FUNDADOR",
    specialistInvitations: 0,
    specialistBenefit: "Badge Fundador disponible al aprobar referidos",
  });
}

export function saveReferralState(referrals: ReferralState) {
  write(keys.referrals, referrals);
}

export function simulateAcceptedClientReferral() {
  const referrals = getReferralState();
  const wallet = getWallet();
  const updated = {
    ...referrals,
    clientInvitations: referrals.clientInvitations + 1,
    clientCreditsEarned: referrals.clientCreditsEarned + 10,
  };
  saveReferralState(updated);
  saveWallet({ ...wallet, balance: wallet.balance + 10 });
  saveTransactions([
    {
      id: `tx-ref-${Date.now()}`,
      type: "Referido",
      detail: "Amigo registrado con código cliente",
      amount: 10,
      date: new Date().toISOString().slice(0, 10),
    },
    ...getTransactions(),
  ]);
  return updated;
}

export function simulateAcceptedSpecialistReferral() {
  const referrals = getReferralState();
  const updated = {
    ...referrals,
    specialistInvitations: referrals.specialistInvitations + 1,
    specialistBenefit: "Badge Fundador activado para referidos aprobados",
  };
  saveReferralState(updated);
  return updated;
}
