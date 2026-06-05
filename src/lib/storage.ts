"use client";

import { defaultBookings, defaultTransactions, type Booking, type CreditTransaction, type Specialist } from "@/data/mock";
import { defaultCommercialConfig, getServiceTypeById, serviceTypes, type CommercialConfig, type SubscriptionPlan } from "@/data/marketplace";

const keys = {
  wallet: "oficiospro.creditsWallet",
  bookings: "oficiospro.bookings",
  transactions: "oficiospro.creditTransactions",
  users: "oficiospro.users",
  specialists: "oficiospro.specialistRequests",
  pendingSpecialists: "oficiospro.pendingSpecialists",
  publishedSpecialists: "oficiospro.publishedSpecialists",
  companies: "oficiospro.companyRequests",
  commercialConfig: "oficiospro.commercialConfig",
  subscription: "oficiospro.subscription",
  session: "oficiospro.session",
  clientProfile: "oficiospro.clientProfile",
  referrals: "oficiospro.referrals",
  homeLeads: "oficiospro.homeLeads",
  enterpriseLeads: "oficiospro.enterpriseLeads",
  specialistLeads: "oficiospro.specialistLeads",
  pendingServiceRequests: "oficiospro.pendingServiceRequests",
  quickSearches: "oficiospro.quickSearches",
  conversionEvents: "oficiospro.conversionEvents",
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

export type ClientProfile = {
  name: string;
  firstNames?: string;
  lastNames?: string;
  rut?: string;
  email: string;
  phone: string;
  region?: string;
  commune: string;
  address: string;
  lat: number | null;
  lng: number | null;
  planId?: string;
  referralCode?: string;
  createdAt: string;
};

export type PendingSpecialistService = {
  serviceTypeId: string;
  specialty: string;
  isOtherService?: boolean;
  otherServiceDescription?: string;
  name: string;
  description: string;
  specialistComments?: string;
  clientCredits: number;
  specialistPayoutCLP: number;
  initialVisitFree: boolean;
  visitCredits: number;
  duration: string;
  emergency: boolean;
  economics?: {
    incomeCLP: number;
    specialistPayoutCLP: number;
    marginCLP: number;
    minMarginCLP: number;
    status: string;
  };
};

export type PendingSpecialistReference = {
  name: string;
  company: string;
  phone: string;
  email: string;
  work: string;
};

export type PendingSpecialistProfile = {
  id?: string;
  status: "pendiente" | "aprobado" | "rechazado" | "info solicitada";
  name: string;
  firstNames?: string;
  lastNames?: string;
  rut: string;
  phone: string;
  email: string;
  profilePhoto: string;
  address: string;
  commune: string;
  region: string;
  lat: number;
  lng: number;
  coverageRadiusKm: number;
  typeServicio: string;
  specialty: string;
  services: PendingSpecialistService[];
  references: PendingSpecialistReference[];
  portfolioPhotos: string[];
  certifications: string[];
  submittedAt: string;
  reviewedAt?: string;
};

export type ConversionModalType =
  | "lead_cliente"
  | "plan_hogar"
  | "plan_empresa"
  | "reserva_especialista"
  | "registro_especialista"
  | "contacto_empresa"
  | "referido"
  | "consulta_general";

export type ConversionLeadStatus = "Nuevo" | "Contactado" | "En proceso" | "Cerrado" | "Convertido" | "Perdido";

export type ConversionEvent = {
  id: string;
  type:
    | "modal_opened"
    | "lead_submitted"
    | "plan_selected"
    | "specialist_reserved"
    | "company_lead_created"
    | "specialist_lead_created";
  sourceButton: string;
  page: string;
  timestamp: string;
  data: Record<string, unknown>;
};

export type HomeLead = {
  id: string;
  createdAt: string;
  status: ConversionLeadStatus;
  sourceButton: string;
  name: string;
  firstNames?: string;
  lastNames?: string;
  rut?: string;
  email: string;
  whatsapp: string;
  region?: string;
  commune: string;
  planId?: string;
  planName?: string;
  interest: string;
};

export type EnterpriseLead = {
  id: string;
  createdAt: string;
  status: ConversionLeadStatus;
  sourceButton: string;
  name: string;
  firstNames?: string;
  lastNames?: string;
  businessName?: string;
  companyRut?: string;
  companyLine?: string;
  company: string;
  email: string;
  whatsapp: string;
  industry?: string;
  branches: number;
  region?: string;
  commune: string;
  need: string;
  serviceType?: string;
  isOtherService?: boolean;
  otherServiceDescription?: string;
  additionalComments?: string;
  planId?: string;
  interest: string;
};

export type SpecialistLead = {
  id: string;
  createdAt: string;
  status: ConversionLeadStatus;
  sourceButton: string;
  name: string;
  firstNames?: string;
  lastNames?: string;
  rut?: string;
  phone: string;
  email: string;
  serviceTypeId: string;
  serviceTypeName: string;
  commune: string;
  years: number;
  interest: string;
};

export type ServiceRequestLead = {
  id: string;
  createdAt: string;
  status: ConversionLeadStatus;
  sourceButton: string;
  name: string;
  firstNames?: string;
  lastNames?: string;
  rut?: string;
  email: string;
  whatsapp: string;
  commune: string;
  address: string;
  service: string;
  isOtherService?: boolean;
  otherServiceDescription?: string;
  additionalComments?: string;
  urgency: string;
  specialistId?: string;
  specialistName?: string;
  estimatedCredits?: number;
  coverageZone?: string;
  interest: string;
};

export type QuickSearchLead = {
  id: string;
  createdAt: string;
  sourceButton: string;
  need: string;
  serviceTypeId: string;
  specialty: string;
  isOtherService?: boolean;
  otherServiceDescription?: string;
  additionalComments?: string;
  commune: string;
  urgency: string;
  lat?: number | null;
  lng?: number | null;
};

export type ConversionLeadKind = "home" | "enterprise" | "specialist" | "serviceRequest";

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

function remove(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
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

function currentPage() {
  if (typeof window === "undefined") return "server";
  return `${window.location.pathname}${window.location.search}`;
}

function makeStoredItem<T extends object>(prefix: string, item: T) {
  return { ...item, id: `${prefix}-${Date.now()}`, createdAt: new Date().toISOString() };
}

export function appendConversionEvent(event: Omit<ConversionEvent, "id" | "timestamp" | "page"> & { page?: string }) {
  const existing = read<ConversionEvent[]>(keys.conversionEvents, []);
  const stored: ConversionEvent = {
    ...event,
    id: `conversion-event-${Date.now()}`,
    page: event.page ?? currentPage(),
    timestamp: new Date().toISOString(),
  };
  write(keys.conversionEvents, [stored, ...existing]);
  return stored;
}

export function getConversionEvents() {
  return read<ConversionEvent[]>(keys.conversionEvents, []);
}

export function appendHomeLead(item: Omit<HomeLead, "id" | "createdAt" | "status"> & { status?: ConversionLeadStatus }) {
  const existing = read<HomeLead[]>(keys.homeLeads, []);
  const stored = makeStoredItem("home-lead", { ...item, status: item.status ?? "Nuevo" }) as HomeLead;
  write(keys.homeLeads, [stored, ...existing]);
  return stored;
}

export function getHomeLeads() {
  return read<HomeLead[]>(keys.homeLeads, []);
}

export function appendEnterpriseLead(item: Omit<EnterpriseLead, "id" | "createdAt" | "status"> & { status?: ConversionLeadStatus }) {
  const existing = read<EnterpriseLead[]>(keys.enterpriseLeads, []);
  const stored = makeStoredItem("enterprise-lead", { ...item, status: item.status ?? "Nuevo" }) as EnterpriseLead;
  write(keys.enterpriseLeads, [stored, ...existing]);
  return stored;
}

export function getEnterpriseLeads() {
  return read<EnterpriseLead[]>(keys.enterpriseLeads, []);
}

export function appendSpecialistLead(item: Omit<SpecialistLead, "id" | "createdAt" | "status"> & { status?: ConversionLeadStatus }) {
  const existing = read<SpecialistLead[]>(keys.specialistLeads, []);
  const stored = makeStoredItem("specialist-lead", { ...item, status: item.status ?? "Nuevo" }) as SpecialistLead;
  write(keys.specialistLeads, [stored, ...existing]);
  return stored;
}

export function getSpecialistLeads() {
  return read<SpecialistLead[]>(keys.specialistLeads, []);
}

export function appendServiceRequestLead(item: Omit<ServiceRequestLead, "id" | "createdAt" | "status"> & { status?: ConversionLeadStatus }) {
  const existing = read<ServiceRequestLead[]>(keys.pendingServiceRequests, []);
  const stored = makeStoredItem("service-request", { ...item, status: item.status ?? "Nuevo" }) as ServiceRequestLead;
  write(keys.pendingServiceRequests, [stored, ...existing]);
  return stored;
}

export function getServiceRequestLeads() {
  return read<ServiceRequestLead[]>(keys.pendingServiceRequests, []);
}

export function appendQuickSearchLead(item: Omit<QuickSearchLead, "id" | "createdAt">) {
  const existing = read<QuickSearchLead[]>(keys.quickSearches, []);
  const stored = makeStoredItem("quick-search", item) as QuickSearchLead;
  write(keys.quickSearches, [stored, ...existing]);
  return stored;
}

export function getQuickSearchLeads() {
  return read<QuickSearchLead[]>(keys.quickSearches, []);
}

export function updateConversionLeadStatus(kind: ConversionLeadKind, id: string, status: ConversionLeadStatus) {
  const config = {
    home: keys.homeLeads,
    enterprise: keys.enterpriseLeads,
    specialist: keys.specialistLeads,
    serviceRequest: keys.pendingServiceRequests,
  } satisfies Record<ConversionLeadKind, string>;
  const key = config[kind];
  const items = read<Array<{ id: string; status: ConversionLeadStatus }>>(key, []);
  write(
    key,
    items.map((item) => (item.id === id ? { ...item, status } : item)),
  );
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

export function getClientProfile() {
  return read<ClientProfile | null>(keys.clientProfile, null);
}

export function saveClientProfile(profile: ClientProfile) {
  write(keys.clientProfile, profile);
}

export function getPendingSpecialists() {
  const current = read<PendingSpecialistProfile[]>(keys.pendingSpecialists, []);
  const legacy = read<PendingSpecialistProfile[]>(keys.specialists, []);
  const merged = [...current, ...legacy.filter((item) => !current.some((existing) => existing.id === item.id))];
  return merged;
}

export function savePendingSpecialists(items: PendingSpecialistProfile[]) {
  write(keys.pendingSpecialists, items);
}

export function appendPendingSpecialist(item: Omit<PendingSpecialistProfile, "id">) {
  const existing = getPendingSpecialists();
  const storedItem: PendingSpecialistProfile = { ...item, id: `pending-specialist-${Date.now()}` };
  savePendingSpecialists([storedItem, ...existing]);
  return storedItem;
}

export function getPublishedSpecialists() {
  return read<Specialist[]>(keys.publishedSpecialists, []);
}

export function savePublishedSpecialists(items: Specialist[]) {
  write(keys.publishedSpecialists, items);
}

export function approveAndPublishSpecialist(id: string) {
  const pending = getPendingSpecialists();
  const request = pending.find((item) => item.id === id);
  if (!request) return null;

  savePendingSpecialists(pending.filter((item) => item.id !== id));

  const published = getPublishedSpecialists();
  const specialist = toPublishedSpecialist(request);
  savePublishedSpecialists([specialist, ...published.filter((item) => item.id !== specialist.id)]);
  return specialist;
}

export function rejectPendingSpecialist(id: string) {
  const pending = getPendingSpecialists();
  const updatedPending = pending.map((item) =>
    item.id === id ? { ...item, status: "rechazado" as const, reviewedAt: new Date().toISOString() } : item,
  );
  savePendingSpecialists(updatedPending);
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

export function clearMockSession() {
  remove(keys.session);
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

function toPublishedSpecialist(request: PendingSpecialistProfile): Specialist {
  const requestServices = request.services?.length
    ? request.services
    : [
        {
          serviceTypeId: "hogar",
          specialty: request.specialty ?? "Servicio hogar",
          name: request.specialty ?? "Servicio hogar",
          description: "",
          clientCredits: 20,
          specialistPayoutCLP: 12000,
          initialVisitFree: true,
          visitCredits: 0,
          duration: "2 horas",
          emergency: false,
        },
      ];
  const primaryService = requestServices[0];
  const displaySpecialty = (service?: PendingSpecialistService) =>
    service?.isOtherService && service.otherServiceDescription ? service.otherServiceDescription : service?.specialty ?? request.specialty;
  const certifications = request.certifications ?? [];
  const portfolioPhotos = request.portfolioPhotos ?? [];
  const references = request.references ?? [];
  const serviceType = getServiceTypeById(primaryService?.serviceTypeId ?? "hogar") ?? serviceTypes[0];
  const publicId = `aprobado-${(request.id ?? request.name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
  const initials = (request.name ?? "Especialista OficiosPro")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: publicId,
    name: request.name ?? "Especialista OficiosPro",
    initials,
    specialty: displaySpecialty(primaryService),
    category: serviceType.name,
    serviceTypeId: serviceType.id,
    serviceType: serviceType.name,
    specialties: requestServices.map((service) => displaySpecialty(service)),
    zone: request.commune ?? "Santiago",
    commune: request.commune ?? "Santiago",
    region: request.region ?? "Metropolitana de Santiago",
    availability: "today",
    rating: 4.6,
    jobs: 0,
    trabajosCompletados: 0,
    recommendation: 0,
    credits: Number(primaryService?.clientCredits ?? 20),
    precioDesdeCreditos: Number(primaryService?.clientCredits ?? 20),
    demand: "Nuevo especialista",
    responseTime: "2.0 h",
    years: 1,
    top: false,
    badges: ["Verificado", "Aprobado", certifications.length ? "Certificado" : "Nuevo"],
    image: "/assets/hero-hogar.webp",
    foto: request.profilePhoto,
    gallery: portfolioPhotos.length ? portfolioPhotos : ["Portafolio recibido"],
    galleryImages: ["/assets/work-bathroom.webp", "/assets/work-electrical.webp", "/assets/work-hvac.webp"],
    distance: 0,
    verified: true,
    photos: portfolioPhotos.length > 0,
    certifications,
    servicesOffered: requestServices.map((service) => service.name || displaySpecialty(service)),
    workHistory: [],
    reviews: [],
    description: `${displaySpecialty(primaryService)} con cobertura en ${request.commune ?? "Santiago"} y radio de ${request.coverageRadiusKm ?? 18} km.`,
    lat: request.lat ?? -33.4489,
    lng: request.lng ?? -70.6693,
    geo: { lat: request.lat ?? -33.4489, lng: request.lng ?? -70.6693 },
    coverageRadiusKm: request.coverageRadiusKm ?? 18,
    radioCoberturaKm: request.coverageRadiusKm ?? 18,
    rank: "Fundador",
    validation: {
      rut: "approved",
      identityDocument: "pending",
      selfie: "pending",
      certifications: certifications.length ? "approved" : "pending",
      references: references.length,
      portfolioPhotos: portfolioPhotos.length,
    },
    publishedFromAdmin: true,
  };
}
