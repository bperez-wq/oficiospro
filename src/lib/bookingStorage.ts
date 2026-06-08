"use client";

import { availabilityProfiles, createDefaultAvailabilityProfile, type AvailabilityProfile, type BlockedSlot } from "@/data/availability";
import type { PricingMode } from "@/data/flexiblePricing";
import type { Specialist } from "@/data/mock";
import { addMinutesToTime, toDateKey } from "@/lib/availability";

export type BookingRequestStatus = "Solicitud pendiente de confirmación" | "Contacto solicitado" | "Confirmada" | "Cancelada";

export type BookingRequest = {
  id: string;
  specialistId: string;
  specialistName: string;
  service: string;
  servicePricingId?: string;
  pricingMode?: PricingMode;
  regionCode?: string;
  regionName?: string;
  communeCode?: string;
  communeName: string;
  date: string;
  startTime: string;
  endTime: string;
  creditsEstimate: number;
  heldCredits?: number;
  estimatedHours?: number;
  requestDescription?: string;
  status: BookingRequestStatus;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
};

const availabilityKey = "oficiospro.availabilityProfiles";
const bookingKey = "oficiospro.bookingRequests";

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

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nextQuarterHour(date: Date) {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const rounded = Math.ceil(minutes / 15) * 15;
  const next = new Date(date);
  next.setHours(Math.floor(rounded / 60) % 24, rounded % 60, 0, 0);
  if (rounded >= 24 * 60) next.setDate(next.getDate() + 1);

  return {
    date: toDateKey(next),
    time: `${String(next.getHours()).padStart(2, "0")}:${String(next.getMinutes()).padStart(2, "0")}`,
  };
}

export function getBookingRequests() {
  return read<BookingRequest[]>(bookingKey, []);
}

export function saveBookingRequest(request: Omit<BookingRequest, "id" | "createdAt" | "status"> & { status?: BookingRequestStatus }) {
  const next: BookingRequest = {
    ...request,
    id: id("booking"),
    status: request.status ?? "Solicitud pendiente de confirmación",
    createdAt: new Date().toISOString(),
  };
  write(bookingKey, [next, ...getBookingRequests()]);
  return next;
}

export function getSavedAvailabilityProfiles() {
  return read<AvailabilityProfile[]>(availabilityKey, []);
}

export function saveAvailabilityProfile(profile: AvailabilityProfile) {
  const existing = getSavedAvailabilityProfiles();
  const next = [profile, ...existing.filter((item) => item.specialistId !== profile.specialistId)];
  write(availabilityKey, next);
  return profile;
}

export function getSpecialistAvailabilityProfile(specialist: Pick<Specialist, "id" | "commune" | "zone">): AvailabilityProfile {
  const saved = getSavedAvailabilityProfiles().find((profile) => profile.specialistId === specialist.id);
  if (saved) return saved;
  const seeded = availabilityProfiles.find((profile) => profile.specialistId === specialist.id);
  if (seeded) return seeded;
  return createDefaultAvailabilityProfile(specialist.id, [specialist.commune ?? specialist.zone].filter(Boolean) as string[]);
}

export function addBlockedSlot(specialist: Pick<Specialist, "id" | "commune" | "zone">, block: Omit<BlockedSlot, "id" | "specialistId">) {
  const profile = getSpecialistAvailabilityProfile(specialist);
  const nextBlock: BlockedSlot = { ...block, id: id("block"), specialistId: specialist.id };
  const next = { ...profile, blockedSlots: [nextBlock, ...profile.blockedSlots] };
  saveAvailabilityProfile(next);
  return next;
}

export function removeBlockedSlot(specialist: Pick<Specialist, "id" | "commune" | "zone">, blockId: string) {
  const profile = getSpecialistAvailabilityProfile(specialist);
  const next = { ...profile, blockedSlots: profile.blockedSlots.filter((slot) => slot.id !== blockId) };
  saveAvailabilityProfile(next);
  return next;
}

export function createBookingRequest({
  specialist,
  date,
  startTime,
  endTime,
  service,
  servicePricingId,
  pricingMode,
  creditsEstimate,
  heldCredits,
  estimatedHours,
  requestDescription,
  communeName,
  regionName,
  regionCode,
}: {
  specialist: Pick<Specialist, "id" | "name" | "specialty" | "credits" | "commune" | "zone">;
  date: string;
  startTime: string;
  endTime: string;
  service?: string;
  servicePricingId?: string;
  pricingMode?: PricingMode;
  creditsEstimate?: number;
  heldCredits?: number;
  estimatedHours?: number;
  requestDescription?: string;
  communeName?: string;
  regionName?: string;
  regionCode?: string;
}) {
  return saveBookingRequest({
    specialistId: specialist.id,
    specialistName: specialist.name,
    service: service ?? specialist.specialty,
    servicePricingId,
    pricingMode,
    regionCode,
    regionName,
    communeName: communeName ?? specialist.commune ?? specialist.zone,
    date,
    startTime,
    endTime,
    creditsEstimate: creditsEstimate ?? specialist.credits,
    heldCredits,
    estimatedHours,
    requestDescription,
  });
}

export function createInstantContactRequest(specialist: Pick<Specialist, "id" | "name" | "specialty" | "credits" | "commune" | "zone">) {
  const now = new Date();
  const nextContact = nextQuarterHour(now);
  const startTime = nextContact.time;
  return saveBookingRequest({
    specialistId: specialist.id,
    specialistName: specialist.name,
    service: `Contacto inmediato por ${specialist.specialty}`,
    communeName: specialist.commune ?? specialist.zone,
    date: nextContact.date,
    startTime,
    endTime: addMinutesToTime(startTime, 30),
    creditsEstimate: specialist.credits,
    status: "Contacto solicitado",
  });
}
