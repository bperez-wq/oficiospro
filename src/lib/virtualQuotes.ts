"use client";

import type { OficiosProCartItem } from "@/lib/cart";

export type VirtualQuoteStatus =
  | "pendiente_revision"
  | "necesita_mas_info"
  | "cotizacion_enviada"
  | "aprobada_cliente"
  | "rechazada_cliente"
  | "visita_recomendada"
  | "convertida_a_reserva"
  | "expirada";

export type VirtualQuoteUrgency = "hoy" | "esta_semana" | "flexible";

export type VirtualQuoteOffer = {
  pricingMode: "fixed" | "range" | "visit_then_quote" | "requires_more_info";
  creditPrice?: number;
  minCredits?: number;
  maxCredits?: number;
  estimatedDuration?: string;
  materialsIncluded?: string;
  materialsExcluded?: string;
  conditions?: string;
  comment?: string;
  requiresVisit?: boolean;
  createdAt: string;
  expiresAt?: string;
};

export type VirtualQuoteRequest = {
  id: string;
  remoteId?: string;
  stored: boolean;
  cartItemId: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  specialistId?: string;
  specialistName?: string;
  specialistSlug?: string;
  serviceId?: string;
  serviceName?: string;
  categoryId?: string;
  specialty?: string;
  problemTitle: string;
  description: string;
  locationDetail: string;
  commune: string;
  region?: string;
  urgency: VirtualQuoteUrgency;
  attachmentCount: number;
  videoReference?: string;
  additionalComments?: string;
  status: VirtualQuoteStatus;
  offer?: VirtualQuoteOffer;
  messages: { senderRole: "customer" | "specialist" | "admin"; message: string; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
};

export type VirtualQuoteCreateInput = {
  cartItem: OficiosProCartItem;
  problemTitle: string;
  description: string;
  locationDetail: string;
  commune: string;
  region?: string;
  urgency: VirtualQuoteUrgency;
  attachmentCount: number;
  videoReference?: string;
  additionalComments?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

const storageKey = "oficiospro.virtualQuoteRequests";

export const virtualQuoteStatusLabels: Record<VirtualQuoteStatus, string> = {
  pendiente_revision: "Cotización virtual pendiente",
  necesita_mas_info: "Especialista pidio mas informacion",
  cotizacion_enviada: "Revisar propuesta",
  aprobada_cliente: "Cotización aprobada",
  rechazada_cliente: "Cotización rechazada",
  visita_recomendada: "Visita técnica recomendada",
  convertida_a_reserva: "Convertida en reserva",
  expirada: "Cotización expirada",
};

export const virtualQuoteUrgencyLabels: Record<VirtualQuoteUrgency, string> = {
  hoy: "Hoy",
  esta_semana: "Esta semana",
  flexible: "Flexible",
};

export function getVirtualQuoteRequests() {
  if (typeof window === "undefined") return [] as VirtualQuoteRequest[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(parsed) ? (parsed as VirtualQuoteRequest[]) : [];
  } catch {
    return [];
  }
}

export function getVirtualQuoteForCartItem(cartItemId: string) {
  return getVirtualQuoteRequests().find((quote) => quote.cartItemId === cartItemId) ?? null;
}

export async function createVirtualQuote(input: VirtualQuoteCreateInput) {
  const existing = getVirtualQuoteForCartItem(input.cartItem.id);
  if (existing && !["rechazada_cliente", "expirada"].includes(existing.status)) {
    return {
      quote: existing,
      remote: {
        ok: true,
        id: existing.remoteId ?? existing.id,
        stored: existing.stored,
        error: undefined,
      },
    };
  }
  const now = new Date().toISOString();
  const localId = `vq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const base: VirtualQuoteRequest = {
    id: localId,
    stored: false,
    cartItemId: input.cartItem.id,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    specialistId: input.cartItem.specialistId,
    specialistName: input.cartItem.specialistName,
    specialistSlug: input.cartItem.specialistSlug,
    serviceId: input.cartItem.serviceId,
    serviceName: input.cartItem.serviceName ?? input.cartItem.title,
    specialty: input.cartItem.serviceName,
    problemTitle: input.problemTitle,
    description: input.description,
    locationDetail: input.locationDetail,
    commune: input.commune,
    region: input.region,
    urgency: input.urgency,
    attachmentCount: input.attachmentCount,
    videoReference: input.videoReference,
    additionalComments: input.additionalComments,
    status: "pendiente_revision",
    messages: [{ senderRole: "customer", message: input.description, createdAt: now }],
    createdAt: now,
    updatedAt: now,
  };

  const remote = await submitVirtualQuote(base);
  const quote = {
    ...base,
    remoteId: remote.id,
    stored: Boolean(remote.stored),
  };
  saveVirtualQuote(quote);
  return { quote, remote };
}

export async function submitVirtualQuote(quote: VirtualQuoteRequest) {
  try {
    const response = await fetch("/api/quotes/virtual/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartItemId: quote.cartItemId,
        customerId: quote.customerEmail,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        customerPhone: quote.customerPhone,
        specialistId: quote.specialistId,
        specialistName: quote.specialistName,
        serviceId: quote.serviceId,
        serviceName: quote.serviceName,
        categoryId: quote.categoryId,
        specialty: quote.specialty,
        problemTitle: quote.problemTitle,
        description: quote.description,
        locationDetail: quote.locationDetail,
        commune: quote.commune,
        region: quote.region,
        urgency: quote.urgency,
        attachmentCount: quote.attachmentCount,
        videoReference: quote.videoReference,
        additionalComments: quote.additionalComments,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; id?: string; stored?: boolean; error?: string };
    return { ok: Boolean(data.ok) && response.ok, id: data.id, stored: Boolean(data.stored), error: data.error ?? (!response.ok ? `http_${response.status}` : undefined) };
  } catch (error) {
    return { ok: false, stored: false, error: error instanceof Error ? error.message : "network_error" };
  }
}

export function updateVirtualQuoteStatus(id: string, status: VirtualQuoteStatus, message?: string) {
  const now = new Date().toISOString();
  const next = getVirtualQuoteRequests().map((quote) =>
    quote.id === id || quote.remoteId === id
      ? {
          ...quote,
          status,
          messages: message ? [{ senderRole: "admin" as const, message, createdAt: now }, ...quote.messages] : quote.messages,
          updatedAt: now,
        }
      : quote,
  );
  writeQuotes(next);
  return next.find((quote) => quote.id === id || quote.remoteId === id) ?? null;
}

export function addVirtualQuoteOffer(id: string, offer: Omit<VirtualQuoteOffer, "createdAt">) {
  const now = new Date().toISOString();
  const next = getVirtualQuoteRequests().map((quote) =>
    quote.id === id || quote.remoteId === id
      ? {
          ...quote,
          status: offer.pricingMode === "visit_then_quote" ? ("visita_recomendada" as const) : ("cotizacion_enviada" as const),
          offer: { ...offer, createdAt: now },
          messages: [{ senderRole: "specialist" as const, message: offer.comment ?? "Propuesta enviada.", createdAt: now }, ...quote.messages],
          updatedAt: now,
        }
      : quote,
  );
  writeQuotes(next);
  return next.find((quote) => quote.id === id || quote.remoteId === id) ?? null;
}

export function saveVirtualQuote(quote: VirtualQuoteRequest) {
  const current = getVirtualQuoteRequests();
  writeQuotes([quote, ...current.filter((item) => item.id !== quote.id && item.cartItemId !== quote.cartItemId)]);
}

function writeQuotes(items: VirtualQuoteRequest[]) {
  if (typeof window === "undefined") return;
  const seen = new Set<string>();
  const unique = items.filter((item) => {
    const key = item.cartItemId || item.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  window.localStorage.setItem(storageKey, JSON.stringify(unique.slice(0, 100)));
}
