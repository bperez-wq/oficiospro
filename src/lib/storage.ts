"use client";

import { defaultBookings, defaultTransactions, specialists as baseSpecialists, type Booking, type CreditTransaction, type Specialist } from "@/data/mock";
import {
  defaultAdditionalRequests,
  defaultQuoteAgreements,
  type AdditionalRequest,
  type AdditionalStatus,
  type FlexibleService,
  type PricingMode,
  type QuoteAgreement,
  type QuoteStatus,
} from "@/data/flexiblePricing";
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
  payments: "oficiospro.payments",
  paymentSubscriptions: "oficiospro.paymentSubscriptions",
  paymentWallet: "oficiospro.paymentWallet",
  paymentCreditTransactions: "oficiospro.paymentCreditTransactions",
  specialistPayouts: "oficiospro.specialistPayouts",
  quoteAgreements: "oficiospro.quoteAgreements",
  additionalRequests: "oficiospro.additionalRequests",
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
  expiresAt?: string;
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

export type PaymentStatus = "pending" | "approved" | "rejected" | "failed" | "refunded" | "chargeback" | "preparing";

export type PaymentRecord = {
  id: string;
  provider: "mercadopago";
  type: "checkout" | "subscription" | "credits_purchase";
  planId?: string;
  planName?: string;
  userId: string;
  payerEmail: string;
  amountCLP: number;
  credits: number;
  status: PaymentStatus;
  mercadoPagoPreferenceId?: string;
  mercadoPagoPreapprovalId?: string;
  mercadoPagoPaymentId?: string;
  initPoint?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentSubscriptionStatus = "pending" | "active" | "paused" | "cancelled" | "failed_payment";

export type PaymentSubscriptionRecord = {
  id: string;
  provider: "mercadopago";
  userId: string;
  planId: string;
  planName: string;
  amountCLP: number;
  creditsPerMonth: number;
  status: PaymentSubscriptionStatus;
  mercadoPagoPreapprovalId?: string;
  nextBillingDate: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentCreditWallet = {
  userId: string;
  currentBalance: number;
  heldCredits?: number;
  expiringCreditsTotal?: number;
  quoteHeldCredits?: number;
  additionalHeldCredits?: number;
  expiringCredits: { amount: number; expiresAt: string }[];
  updatedAt: string;
};

export type PaymentCreditTransactionType =
  | "subscription_credit"
  | "purchase_credit"
  | "referral_bonus"
  | "service_hold"
  | "service_capture"
  | "service_fixed_hold"
  | "service_hourly_hold"
  | "quote_acceptance_hold"
  | "quote_acceptance_capture"
  | "visit_hold"
  | "visit_capture"
  | "additional_work_hold"
  | "additional_work_capture"
  | "materials_hold"
  | "materials_capture"
  | "refund"
  | "expiration"
  | "admin_adjustment";

export type PaymentCreditTransaction = {
  id: string;
  userId: string;
  type: PaymentCreditTransactionType;
  amount: number;
  expiresAt?: string | null;
  relatedPaymentId?: string;
  relatedServiceRequestId?: string;
  detail: string;
  createdAt: string;
};

export type SpecialistPayoutStatus = "pendiente" | "aprobado" | "pagado";

export type SpecialistPayout = {
  id: string;
  specialistName: string;
  serviceName: string;
  customerCredits: number;
  creditValueCLP: number;
  customerChargeCLP: number;
  specialistPayoutCLP: number;
  platformMarginCLP: number;
  status: SpecialistPayoutStatus;
  completedAt: string;
  paidAt?: string;
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
  pricingMode?: PricingMode;
  fixedCredits?: number;
  hourlyCredits?: number;
  minHours?: number;
  maxHours?: number;
  minCredits?: number;
  maxCredits?: number;
  specialistComments?: string;
  specialistExpectedPayoutCLP?: number;
  specialistApprovedPayoutCLP?: number;
  clientCredits: number;
  specialistPayoutCLP: number;
  pricingStatus?: "pending_review" | "approved" | "adjusted_by_oficiospro";
  pricingNotesInternal?: string;
  active?: boolean;
  creditPrice?: number;
  emergencyCredits?: number;
  initialVisitFree: boolean;
  visitCredits: number;
  duration: string;
  estimatedDurationMinMinutes?: number;
  estimatedDurationMaxMinutes?: number;
  estimatedDurationMinutes?: number;
  materialsIncluded?: string;
  materialsIncludedBoolean?: boolean;
  materialsChargedSeparately?: boolean;
  conditions?: string;
  serviceCommunes?: string;
  requiresPriorEvaluation?: boolean;
  emergencyAvailable?: boolean;
  emergency: boolean;
  certificationRequired?: boolean;
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
  year?: string;
};

export type SpecialistPublicationStatus =
  | "pending_review"
  | "approved"
  | "published"
  | "unpublished"
  | "suspended"
  | "rejected"
  | "deleted";

export type IdentityReviewStatus = "pending" | "approved" | "rejected" | "needs_review";

export type SpecialistIdentityVerification = {
  profilePhotoUrl: string;
  idFrontUrl: string;
  idBackUrl: string;
  selfieUrl: string;
  profilePhotoName?: string;
  idFrontName?: string;
  idBackName?: string;
  selfieName?: string;
  verificationStatus: IdentityReviewStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  notes: string;
  secureStorageConfigured?: boolean;
  identityStorageStatus?: "pending_secure_storage" | "stored_private" | "not_submitted";
};

export type PendingSpecialistProfile = {
  id?: string;
  status: "pendiente" | "aprobado" | "rechazado" | "info solicitada";
  publicationStatus?: SpecialistPublicationStatus;
  slug?: string;
  approvedAt?: string;
  publishedAt?: string;
  unpublishedAt?: string;
  suspendedAt?: string;
  deletedAt?: string;
  name: string;
  firstNames?: string;
  lastNames?: string;
  rut: string;
  phone: string;
  email: string;
  profilePhoto: string;
  identityVerification?: SpecialistIdentityVerification;
  address: string;
  commune: string;
  region: string;
  lat: number;
  lng: number;
  coverageRadiusKm: number;
  coverageCommunes?: string[];
  typeServicio: string;
  specialty: string;
  services: PendingSpecialistService[];
  references: PendingSpecialistReference[];
  portfolioPhotos: string[];
  certifications: string[];
  hasNoFormalCertifications?: boolean;
  otherCertificationText?: string;
  reviewStatus?: "pendiente_revision" | "info_solicitada" | "aprobado" | "rechazado";
  certificationStatus?: "sin_certificacion_declarada" | "certificacion_declarada_pendiente_revision";
  submittedAt: string;
  reviewedAt?: string;
  duplicateUpdated?: boolean;
};

export type ConversionModalType =
  | "lead_cliente"
  | "plan_hogar"
  | "plan_empresa"
  | "reserva_especialista"
  | "registro_especialista"
  | "contacto_empresa"
  | "referido"
  | "busqueda_rapida"
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
    | "specialist_lead_created"
    | "specialist_quick_intent";
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
  region?: string;
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
  region?: string;
  commune: string;
  address: string;
  service: string;
  isOtherService?: boolean;
  otherServiceDescription?: string;
  additionalComments?: string;
  urgency: string;
  specialistId?: string;
  specialistName?: string;
  servicePricingId?: string;
  pricingMode?: PricingMode;
  quoteId?: string;
  heldCredits?: number;
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
  region?: string;
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
  seedSpecialistIntakeState();
  seedOtherServiceRequests();
  seedPaymentState();
  seedNegotiationState();
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

function seedNegotiationState() {
  if (typeof window === "undefined") return;
  if (!window.localStorage.getItem(keys.quoteAgreements)) write(keys.quoteAgreements, defaultQuoteAgreements);
  if (!window.localStorage.getItem(keys.additionalRequests)) write(keys.additionalRequests, defaultAdditionalRequests);
}

function seedSpecialistIntakeState() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(keys.pendingSpecialists)) return;
  const now = new Date().toISOString();
  const seeds = [
    ["Claudio Rivera", "Riego Agrícola", "Técnico riego tecnificado", "Talca", "Maule", "riego-agricola", "Técnico riego tecnificado"],
    ["María Paz Araya", "Agroindustria", "Frigorista agrícola", "Curicó", "Maule", "agroindustria", "Frigorista agrícola"],
    ["Hernán Soto", "Maquinaria Agrícola", "Mecánico tractores", "Los Ángeles", "Biobío", "maquinaria-agricola", "Mecánico tractores"],
    ["Camila Pizarro", "Contratistas Agrícolas", "Contratista de cosecha", "Chillán", "Ñuble", "contratistas-agricolas", "Contratista de cosecha"],
    ["Rodrigo Velásquez", "Industria y Mantención", "Técnico PLC", "Concepción", "Biobío", "industria", "Técnico PLC"],
    ["Valentina Mora", "Comunidades y Edificios", "Mantención sala de bombas", "Providencia", "Metropolitana de Santiago", "comunidades-edificios", "Mantención sala de bombas"],
    ["Jorge Molina", "Climatización y Refrigeración", "Técnico cámaras frigoríficas", "Puerto Montt", "Los Lagos", "climatizacion-refrigeracion", "Técnico cámaras frigoríficas"],
    ["Fernanda Lagos", "Seguridad y Tecnología", "Técnico BMS", "Las Condes", "Metropolitana de Santiago", "seguridad-tecnologia", "Técnico BMS"],
    ["Mauricio Peña", "Servicios para Campos", "Instalador cercos agrícolas", "Osorno", "Los Lagos", "servicios-campos", "Instalador cercos agrícolas"],
    ["Paula Cortés", "Energía y Sustentabilidad", "Técnico bombas solares", "Rancagua", "O'Higgins", "energia-sustentabilidad", "Técnico bombas solares"],
    ["Iván Figueroa", "Hogar", "Otro servicio técnico", "Ñuñoa", "Metropolitana de Santiago", "hogar", "Otro servicio de hogar"],
    ["Natalia Seguel", "Agricultura y Campos", "Otro servicio agrícola", "Curicó", "Maule", "agricultura-campos", "Otro servicio agrícola"],
    ["Pedro Ulloa", "Industria y Mantención", "Soldador TIG", "Antofagasta", "Antofagasta", "industria", "Soldador TIG"],
    ["Daniela Bravo", "Limpieza y Sanitización", "Limpieza altura", "Santiago", "Metropolitana de Santiago", "limpieza-sanitizacion", "Limpieza altura"],
    ["Tomás Rivas", "Transporte y Logística", "Servicio camión pluma", "Valparaíso", "Valparaíso", "transporte-logistica", "Servicio camión pluma"],
  ] as const;
  const pending: PendingSpecialistProfile[] = seeds.map(([name, typeServicio, specialty, commune, region, serviceTypeId, serviceName], index) => ({
    id: `seed-specialist-${index + 1}`,
    status: index < 10 ? "pendiente" : "rechazado",
    name,
    firstNames: name.split(" ")[0],
    lastNames: name.split(" ").slice(1).join(" "),
    rut: `12.345.${String(670 + index).padStart(3, "0")}-${index % 10}`,
    phone: `+56 9 7000 ${String(1000 + index)}`,
    email: `${name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, ".")}@oficiospro.cl`,
    profilePhoto: `perfil-${index + 1}.jpg`,
    address: `Base operativa ${commune}`,
    commune,
    region,
    lat: -33.45 - index * 0.08,
    lng: -70.66 - index * 0.04,
    coverageRadiusKm: index < 8 ? 45 : 25,
    coverageCommunes: [commune, "Comuna vecina", "Zona rural cercana"],
    typeServicio,
    specialty,
    services: [
      {
        serviceTypeId,
        specialty,
        isOtherService: specialty.startsWith("Otro"),
        otherServiceDescription: specialty.startsWith("Otro") ? `Servicio no encontrado declarado por ${name}` : "",
        name: serviceName,
        description: `Servicio declarado para ${typeServicio} con cobertura en ${commune}.`,
        specialistComments: "Cuenta con herramientas propias y referencias verificables.",
        clientCredits: index < 5 ? 80 : 40,
        specialistPayoutCLP: index < 5 ? 60000 : 28000,
        initialVisitFree: index % 2 === 0,
        visitCredits: index % 2 === 0 ? 0 : 20,
        duration: index < 5 ? "Jornada técnica" : "3 horas",
        emergency: index % 3 === 0,
      },
    ],
    references: [0, 1, 2].map((referenceIndex) => ({
      name: `Referencia ${referenceIndex + 1}`,
      company: referenceIndex === 0 ? "Cliente empresa" : "Cliente particular",
      phone: `+56 9 8000 ${String(index * 10 + referenceIndex).padStart(4, "0")}`,
      email: `referencia${referenceIndex + 1}@cliente.cl`,
      work: `${serviceName} realizado`,
    })),
    portfolioPhotos: [`trabajo-${index + 1}-1.jpg`, `trabajo-${index + 1}-2.jpg`, `trabajo-${index + 1}-3.jpg`],
    certifications: index % 2 === 0 ? ["Certificación oficio", "Seguridad en terreno"] : ["Experiencia verificable"],
    submittedAt: now,
    reviewedAt: index >= 10 ? now : undefined,
  }));
  write(keys.pendingSpecialists, pending);
}

function seedOtherServiceRequests() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(keys.quickSearches)) return;
  const now = new Date().toISOString();
  const requests: QuickSearchLead[] = [
    ["Curicó", "agroindustria", "Necesito técnico para calibradora de cerezas marca específica"],
    ["Talca", "riego-agricola", "Busco reparación de tablero de riego con telemetría antigua"],
    ["Osorno", "agricultura-campos", "Servicio rural para mangas ganaderas y bebederos"],
    ["Puerto Varas", "climatizacion-refrigeracion", "Frío alimentario para cámara pequeña de lácteos"],
    ["Los Ángeles", "maquinaria-agricola", "Mecánico para implemento agrícola importado"],
    ["Chillán", "contratistas-agricolas", "Cuadrilla para cosecha de arándanos con supervisor"],
    ["Providencia", "comunidades-edificios", "Mantención especial de sala presurizada"],
    ["Antofagasta", "industria", "Revisión de compresor industrial de alta presión"],
    ["Las Condes", "seguridad-tecnologia", "Integrar cámaras existentes con control de acceso"],
    ["Rancagua", "energia-sustentabilidad", "Diagnóstico de bombas solares de pozo"],
  ].map(([commune, serviceTypeId, description], index) => ({
    id: `other-service-${index + 1}`,
    createdAt: now,
    sourceButton: "Solicitud de servicio no encontrado",
    need: description,
    serviceTypeId,
    specialty: description,
    isOtherService: true,
    otherServiceDescription: description,
    additionalComments: "Solicitud pendiente de evaluación para convertir en especialidad oficial.",
    commune,
    urgency: index % 2 === 0 ? "Esta semana" : "Sin urgencia",
  }));
  write(keys.quickSearches, requests);
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
  const duplicate = existing.find((profile) => samePendingSpecialistIdentity(profile, item));
  if (duplicate) {
    const mergedServices = mergePendingSpecialistServices(duplicate.services ?? [], item.services ?? []);
    const updated: PendingSpecialistProfile = {
      ...duplicate,
      ...item,
      id: duplicate.id,
      slug: duplicate.slug ?? item.slug ?? specialistSlug(item.name, item.specialty, item.commune, duplicate.id),
      services: mergedServices,
      references: mergePendingReferences(duplicate.references ?? [], item.references ?? []),
      portfolioPhotos: Array.from(new Set([...(duplicate.portfolioPhotos ?? []), ...(item.portfolioPhotos ?? [])])),
      certifications: Array.from(new Set([...(duplicate.certifications ?? []), ...(item.certifications ?? [])])),
      publicationStatus: duplicate.publicationStatus ?? item.publicationStatus ?? "pending_review",
      reviewedAt: new Date().toISOString(),
      duplicateUpdated: true,
    };
    savePendingSpecialists([updated, ...existing.filter((profile) => profile.id !== duplicate.id)]);
    return updated;
  }
  const id = `pending-specialist-${Date.now()}`;
  const storedItem: PendingSpecialistProfile = {
    ...item,
    id,
    slug: item.slug ?? specialistSlug(item.name, item.specialty, item.commune, id),
    publicationStatus: item.publicationStatus ?? "pending_review",
  };
  savePendingSpecialists([storedItem, ...existing]);
  return storedItem;
}

function samePendingSpecialistIdentity(profile: Pick<PendingSpecialistProfile, "rut" | "email" | "phone">, item: Pick<PendingSpecialistProfile, "rut" | "email" | "phone">) {
  const rut = normalizeIdentityValue(item.rut);
  const email = normalizeIdentityValue(item.email);
  const phone = normalizeIdentityValue(item.phone);
  return Boolean(
    (rut && normalizeIdentityValue(profile.rut) === rut) ||
      (email && normalizeIdentityValue(profile.email) === email) ||
      (phone && normalizeIdentityValue(profile.phone) === phone),
  );
}

function normalizeIdentityValue(value: string | undefined) {
  return String(value ?? "").toLowerCase().replace(/[^\da-z@.]/g, "");
}

function mergePendingSpecialistServices(current: PendingSpecialistService[], incoming: PendingSpecialistService[]) {
  const merged = [...current];
  for (const service of incoming) {
    const key = pendingServiceKey(service);
    const index = merged.findIndex((item) => pendingServiceKey(item) === key);
    if (index >= 0) {
      merged[index] = { ...merged[index], ...service, active: service.active ?? merged[index].active ?? true };
    } else {
      merged.push(service);
    }
  }
  return merged;
}

function pendingServiceKey(service: PendingSpecialistService) {
  return [service.serviceTypeId, service.specialty, service.name].map((value) => normalizeIdentityValue(value)).join("|");
}

function mergePendingReferences(current: PendingSpecialistReference[], incoming: PendingSpecialistReference[]) {
  const merged = [...current];
  for (const reference of incoming) {
    const key = `${normalizeIdentityValue(reference.phone)}|${normalizeIdentityValue(reference.email)}|${normalizeIdentityValue(reference.work)}`;
    if (!key.replace(/\|/g, "")) continue;
    if (!merged.some((item) => `${normalizeIdentityValue(item.phone)}|${normalizeIdentityValue(item.email)}|${normalizeIdentityValue(item.work)}` === key)) {
      merged.push(reference);
    }
  }
  return merged;
}

export function getPublishedSpecialists() {
  return read<Specialist[]>(keys.publishedSpecialists, []).filter((specialist) => isPublicSpecialistStatus(specialist.publicationStatus ?? specialist.status));
}

export function savePublishedSpecialists(items: Specialist[]) {
  write(keys.publishedSpecialists, items);
}

export function getAllAdminSpecialists() {
  return read<Specialist[]>(keys.publishedSpecialists, []);
}

export function approveAndPublishSpecialist(id: string) {
  const pending = getPendingSpecialists();
  const request = pending.find((item) => item.id === id);
  if (!request) return null;
  const readiness = specialistPublicationReadiness(request);
  if (!readiness.ok) return { ok: false as const, missing: readiness.missing, specialist: null };

  savePendingSpecialists(pending.filter((item) => item.id !== id));

  const published = getAllAdminSpecialists();
  const slug = uniqueSpecialistSlug(
    request.slug ?? specialistSlug(request.name, request.specialty, request.commune, request.id),
    published.map((item) => item.slug ?? item.id),
  );
  const specialist = toPublishedSpecialist({
    ...request,
    slug,
    status: "aprobado",
    publicationStatus: "published",
    approvedAt: request.approvedAt ?? new Date().toISOString(),
    publishedAt: request.publishedAt ?? new Date().toISOString(),
  });
  savePublishedSpecialists([specialist, ...published.filter((item) => item.id !== specialist.id)]);
  return { ok: true as const, missing: [], specialist };
}

export function rejectPendingSpecialist(id: string) {
  const pending = getPendingSpecialists();
  const updatedPending = pending.map((item) =>
    item.id === id ? { ...item, status: "rechazado" as const, reviewedAt: new Date().toISOString() } : item,
  );
  savePendingSpecialists(updatedPending);
}

export function updatePublishedSpecialistStatus(id: string, publicationStatus: SpecialistPublicationStatus) {
  const all = getAllAdminSpecialists();
  const now = new Date().toISOString();
  const updated = all.map((specialist) =>
    specialist.id === id
      ? {
          ...specialist,
          status: publicationStatus,
          publicationStatus,
          publishedFromAdmin: true,
          ...(publicationStatus === "published" ? { publishedAt: specialist.publishedAt ?? now } : {}),
          ...(publicationStatus === "unpublished" ? { unpublishedAt: now } : {}),
          ...(publicationStatus === "suspended" ? { suspendedAt: now } : {}),
          ...(publicationStatus === "deleted" ? { deletedAt: now } : {}),
        }
      : specialist,
  );
  savePublishedSpecialists(updated);
  return updated.find((specialist) => specialist.id === id) ?? null;
}

export function updatePublishedSpecialistProfile(id: string, patch: Partial<Pick<Specialist, "name" | "specialty" | "description">>) {
  const all = getAllAdminSpecialists();
  const updated = all.map((specialist) => (specialist.id === id ? { ...specialist, ...patch } : specialist));
  savePublishedSpecialists(updated);
  return updated.find((specialist) => specialist.id === id) ?? null;
}

export function updatePendingSpecialistIdentity(id: string, patch: Partial<SpecialistIdentityVerification>) {
  const pending = getPendingSpecialists();
  const updated = pending.map((item) =>
    item.id === id
      ? {
          ...item,
          identityVerification: {
            ...defaultIdentityVerification(),
            ...(item.identityVerification ?? {}),
            ...patch,
            reviewedAt: patch.verificationStatus ? new Date().toISOString() : (patch.reviewedAt ?? item.identityVerification?.reviewedAt ?? null),
          },
        }
      : item,
  );
  savePendingSpecialists(updated);
  return updated.find((item) => item.id === id) ?? null;
}

export function getCommercialConfig() {
  return read<CommercialConfig>(keys.commercialConfig, defaultCommercialConfig);
}

export function saveCommercialConfig(config: CommercialConfig) {
  write(keys.commercialConfig, config);
}

export function getMockSession() {
  const session = read<MockSession | null>(keys.session, null);
  if (!session) return null;
  if (session.expiresAt && new Date(session.expiresAt).getTime() <= Date.now()) {
    remove(keys.session);
    return null;
  }
  return session;
}

export function setMockSession(session: MockSession) {
  const maxAgeMs = session.role === "admin" ? 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
  write(keys.session, {
    ...session,
    expiresAt: session.expiresAt ?? new Date(Date.now() + maxAgeMs).toISOString(),
  });
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

export function seedPaymentState() {
  if (typeof window === "undefined") return;
  const now = new Date().toISOString();
  if (!window.localStorage.getItem(keys.payments)) {
    write<PaymentRecord[]>(keys.payments, [
      {
        id: "pay-op-plus-001",
        provider: "mercadopago",
        type: "subscription",
        planId: "plus",
        planName: "Club Hogar Plus",
        userId: "cliente@oficiospro.cl",
        payerEmail: "cliente@oficiospro.cl",
        amountCLP: 59000,
        credits: 65,
        status: "approved",
        mercadoPagoPreapprovalId: "preapproval_pending_connection",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "pay-op-credits-001",
        provider: "mercadopago",
        type: "credits_purchase",
        userId: "empresa@oficiospro.cl",
        payerEmail: "empresa@oficiospro.cl",
        amountCLP: 120000,
        credits: 120,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }
  if (!window.localStorage.getItem(keys.paymentSubscriptions)) {
    write<PaymentSubscriptionRecord[]>(keys.paymentSubscriptions, [
      {
        id: "sub-op-plus-001",
        provider: "mercadopago",
        userId: "cliente@oficiospro.cl",
        planId: "plus",
        planName: "Club Hogar Plus",
        amountCLP: 59000,
        creditsPerMonth: 65,
        status: "active",
        mercadoPagoPreapprovalId: "preapproval_pending_connection",
        nextBillingDate: addMonthsLocal(new Date(), 1).toISOString(),
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }
  if (!window.localStorage.getItem(keys.paymentWallet)) {
    write<PaymentCreditWallet>(keys.paymentWallet, {
      userId: "cliente@oficiospro.cl",
      currentBalance: 135,
      heldCredits: 30,
      expiringCreditsTotal: 65,
      quoteHeldCredits: 20,
      additionalHeldCredits: 10,
      expiringCredits: [{ amount: 135, expiresAt: addMonthsLocal(new Date(), 24).toISOString() }],
      updatedAt: now,
    });
  }
  if (!window.localStorage.getItem(keys.paymentCreditTransactions)) {
    write<PaymentCreditTransaction[]>(keys.paymentCreditTransactions, [
      {
        id: "ctx-sub-001",
        userId: "cliente@oficiospro.cl",
        type: "subscription_credit",
        amount: 65,
        expiresAt: addMonthsLocal(new Date(), 24).toISOString(),
        relatedPaymentId: "pay-op-plus-001",
        detail: "Créditos mensuales Club Hogar Plus",
        createdAt: now,
      },
      {
        id: "ctx-hold-001",
        userId: "cliente@oficiospro.cl",
        type: "service_fixed_hold",
        amount: -30,
        relatedServiceRequestId: "service-op-001",
        detail: "Reserva gasfitería domiciliaria",
        createdAt: now,
      },
      {
        id: "ctx-quote-hold-001",
        userId: "cliente@oficiospro.cl",
        type: "quote_acceptance_hold",
        amount: -20,
        relatedServiceRequestId: "quote-irrigation-visit",
        detail: "Creditos retenidos por visita tecnica",
        createdAt: now,
      },
      {
        id: "ctx-additional-hold-001",
        userId: "cliente@oficiospro.cl",
        type: "additional_work_hold",
        amount: -10,
        relatedServiceRequestId: "additional-hours-001",
        detail: "Creditos retenidos por adicional aprobado",
        createdAt: now,
      },
    ]);
  }
  if (!window.localStorage.getItem(keys.specialistPayouts)) {
    write<SpecialistPayout[]>(keys.specialistPayouts, [
      {
        id: "payout-op-001",
        specialistName: "Victor Araya",
        serviceName: "Mantención HVAC",
        customerCredits: 40,
        creditValueCLP: 1000,
        customerChargeCLP: 40000,
        specialistPayoutCLP: 28000,
        platformMarginCLP: 12000,
        status: "pendiente",
        completedAt: now,
      },
      {
        id: "payout-op-002",
        specialistName: "Carolina Méndez",
        serviceName: "Electricidad domiciliaria",
        customerCredits: 12,
        creditValueCLP: 1000,
        customerChargeCLP: 12000,
        specialistPayoutCLP: 7000,
        platformMarginCLP: 5000,
        status: "aprobado",
        completedAt: now,
      },
    ]);
  }
}

export function getPaymentRecords() {
  return read<PaymentRecord[]>(keys.payments, []);
}

export function savePaymentRecords(items: PaymentRecord[]) {
  write(keys.payments, items);
}

export function appendPaymentRecord(record: Omit<PaymentRecord, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
  const now = new Date().toISOString();
  const stored: PaymentRecord = {
    ...record,
    id: record.id ?? `pay-op-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  savePaymentRecords([stored, ...getPaymentRecords()]);
  return stored;
}

export function updatePaymentRecord(id: string, patch: Partial<PaymentRecord>) {
  const now = new Date().toISOString();
  const next = getPaymentRecords().map((payment) => (payment.id === id ? { ...payment, ...patch, updatedAt: now } : payment));
  savePaymentRecords(next);
  return next.find((payment) => payment.id === id) ?? null;
}

export function getPaymentSubscriptions() {
  return read<PaymentSubscriptionRecord[]>(keys.paymentSubscriptions, []);
}

export function savePaymentSubscriptions(items: PaymentSubscriptionRecord[]) {
  write(keys.paymentSubscriptions, items);
}

export function upsertPaymentSubscription(subscription: Omit<PaymentSubscriptionRecord, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
  const now = new Date().toISOString();
  const stored: PaymentSubscriptionRecord = {
    ...subscription,
    id: subscription.id ?? `sub-op-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  const existing = getPaymentSubscriptions();
  savePaymentSubscriptions([stored, ...existing.filter((item) => item.id !== stored.id)]);
  return stored;
}

export function updatePaymentSubscriptionStatus(id: string, status: PaymentSubscriptionStatus) {
  const now = new Date().toISOString();
  const next = getPaymentSubscriptions().map((subscription) => (subscription.id === id ? { ...subscription, status, updatedAt: now } : subscription));
  savePaymentSubscriptions(next);
}

export function getPaymentCreditWallet() {
  return read<PaymentCreditWallet>(keys.paymentWallet, {
    userId: "cliente@oficiospro.cl",
    currentBalance: 0,
    expiringCredits: [],
    updatedAt: new Date().toISOString(),
  });
}

export function savePaymentCreditWallet(wallet: PaymentCreditWallet) {
  write(keys.paymentWallet, wallet);
}

export function getPaymentCreditTransactions() {
  return read<PaymentCreditTransaction[]>(keys.paymentCreditTransactions, []);
}

export function savePaymentCreditTransactions(items: PaymentCreditTransaction[]) {
  write(keys.paymentCreditTransactions, items);
}

export function addPaymentCredits({
  userId = "cliente@oficiospro.cl",
  amount,
  type = "admin_adjustment",
  detail,
  relatedPaymentId,
}: {
  userId?: string;
  amount: number;
  type?: PaymentCreditTransactionType;
  detail: string;
  relatedPaymentId?: string;
}) {
  const wallet = getPaymentCreditWallet();
  const expiresAt = addMonthsLocal(new Date(), getCommercialConfig().creditExpirationMonths).toISOString();
  const transaction: PaymentCreditTransaction = {
    id: `ctx-op-${Date.now()}`,
    userId,
    type,
    amount,
    expiresAt,
    relatedPaymentId,
    detail,
    createdAt: new Date().toISOString(),
  };
  savePaymentCreditWallet({
    userId,
    currentBalance: wallet.currentBalance + amount,
    expiringCredits: [...wallet.expiringCredits, { amount, expiresAt }],
    updatedAt: new Date().toISOString(),
  });
  savePaymentCreditTransactions([transaction, ...getPaymentCreditTransactions()]);
  return transaction;
}

export function usePaymentCredits({
  userId = "cliente@oficiospro.cl",
  amount,
  type = "service_hold",
  detail,
  relatedServiceRequestId,
}: {
  userId?: string;
  amount: number;
  type?: Extract<
    PaymentCreditTransactionType,
    | "service_hold"
    | "service_capture"
    | "service_fixed_hold"
    | "service_hourly_hold"
    | "quote_acceptance_hold"
    | "quote_acceptance_capture"
    | "visit_hold"
    | "visit_capture"
    | "additional_work_hold"
    | "additional_work_capture"
    | "materials_hold"
    | "materials_capture"
    | "refund"
    | "expiration"
  >;
  detail: string;
  relatedServiceRequestId?: string;
}) {
  const wallet = getPaymentCreditWallet();
  const signedAmount = type === "refund" ? Math.abs(amount) : -Math.abs(amount);
  const transaction: PaymentCreditTransaction = {
    id: `ctx-op-${Date.now()}`,
    userId,
    type,
    amount: signedAmount,
    relatedServiceRequestId,
    detail,
    createdAt: new Date().toISOString(),
  };
  savePaymentCreditWallet({
    ...wallet,
    currentBalance: Math.max(0, wallet.currentBalance + signedAmount),
    updatedAt: new Date().toISOString(),
  });
  savePaymentCreditTransactions([transaction, ...getPaymentCreditTransactions()]);
  return transaction;
}

export function getSpecialistPayouts() {
  return read<SpecialistPayout[]>(keys.specialistPayouts, []);
}

export function saveSpecialistPayouts(items: SpecialistPayout[]) {
  write(keys.specialistPayouts, items);
}

export function getQuoteAgreements() {
  return read<QuoteAgreement[]>(keys.quoteAgreements, defaultQuoteAgreements);
}

export function saveQuoteAgreements(items: QuoteAgreement[]) {
  write(keys.quoteAgreements, items);
}

export function createQuoteAgreement(input: Omit<QuoteAgreement, "id" | "createdAt" | "updatedAt" | "history"> & { history?: string[] }) {
  const now = new Date().toISOString();
  const quote: QuoteAgreement = {
    ...input,
    id: `quote-op-${Date.now()}`,
    history: input.history?.length ? input.history : ["El cliente solicito una cotizacion."],
    createdAt: now,
    updatedAt: now,
  };
  saveQuoteAgreements([quote, ...getQuoteAgreements()]);
  return quote;
}

export function updateQuoteAgreement(id: string, patch: Partial<QuoteAgreement>, historyEntry?: string) {
  const now = new Date().toISOString();
  const next = getQuoteAgreements().map((quote) =>
    quote.id === id
      ? {
          ...quote,
          ...patch,
          history: historyEntry ? [historyEntry, ...quote.history] : quote.history,
          updatedAt: now,
        }
      : quote,
  );
  saveQuoteAgreements(next);
  return next.find((quote) => quote.id === id) ?? null;
}

export function updateQuoteAgreementStatus(id: string, status: QuoteStatus, historyEntry?: string) {
  return updateQuoteAgreement(id, { status }, historyEntry ?? `Estado actualizado a ${status}.`);
}

export function getAdditionalRequests() {
  return read<AdditionalRequest[]>(keys.additionalRequests, defaultAdditionalRequests);
}

export function saveAdditionalRequests(items: AdditionalRequest[]) {
  write(keys.additionalRequests, items);
}

export function createAdditionalRequest(input: Omit<AdditionalRequest, "id" | "createdAt">) {
  const additional: AdditionalRequest = {
    ...input,
    id: `additional-op-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  saveAdditionalRequests([additional, ...getAdditionalRequests()]);
  return additional;
}

export function updateAdditionalRequestStatus(id: string, status: AdditionalStatus, comment?: string) {
  const next = getAdditionalRequests().map((additional) =>
    additional.id === id
      ? {
          ...additional,
          status,
          comment: comment ?? additional.comment,
        }
      : additional,
  );
  saveAdditionalRequests(next);
  return next.find((additional) => additional.id === id) ?? null;
}

export function markSpecialistPayoutPaid(id: string) {
  const now = new Date().toISOString();
  const next = getSpecialistPayouts().map((payout) => (payout.id === id ? { ...payout, status: "pagado" as const, paidAt: now } : payout));
  saveSpecialistPayouts(next);
}

function addMonthsLocal(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
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
  let requestServices = (request.services?.length ? request.services.filter((service) => service.active !== false) : []) as PendingSpecialistService[];
  if (!requestServices.length) {
    requestServices = [
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
  }
  const primaryService = requestServices[0];
  const displaySpecialty = (service?: PendingSpecialistService) =>
    service?.isOtherService && service.otherServiceDescription ? service.otherServiceDescription : service?.specialty ?? request.specialty;
  const certifications = request.certifications ?? [];
  const portfolioPhotos = request.portfolioPhotos ?? [];
  const references = request.references ?? [];
  const serviceType = getServiceTypeById(primaryService?.serviceTypeId ?? "hogar") ?? serviceTypes[0];
  const publicId = request.slug ?? specialistSlug(request.name, displaySpecialty(primaryService), request.commune, request.id);
  const initials = (request.name ?? "Especialista OficiosPro")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: publicId,
    slug: publicId,
    status: request.publicationStatus ?? "published",
    publicationStatus: request.publicationStatus ?? "published",
    approvedAt: request.approvedAt,
    publishedAt: request.publishedAt,
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
    credits: Number(primaryService?.clientCredits || 20),
    precioDesdeCreditos: Number(primaryService?.clientCredits || 20),
    demand: "Nuevo especialista",
    responseTime: "2.0 h",
    years: 1,
    top: false,
    badges: ["Verificado", "Aprobado", certifications.length ? "Certificado" : "Nuevo"],
    image: request.identityVerification?.profilePhotoUrl || request.profilePhoto || "/assets/hero-hogar.webp",
    foto: request.identityVerification?.profilePhotoUrl || request.profilePhoto,
    gallery: portfolioPhotos.length ? portfolioPhotos : ["Portafolio recibido"],
    galleryImages: ["/assets/work-bathroom.webp", "/assets/work-electrical.webp", "/assets/work-hvac.webp"],
    distance: 0,
    verified: true,
    photos: portfolioPhotos.length > 0,
    certifications,
    servicesOffered: requestServices.map((service) => service.name || displaySpecialty(service)),
    servicePricing: requestServices.map((service, index) => pendingServiceToFlexibleService(service, request, index)),
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
      identityDocument: request.identityVerification?.verificationStatus === "approved" ? "approved" : "pending",
      selfie: request.identityVerification?.verificationStatus === "approved" ? "approved" : "pending",
      certifications: certifications.length ? "approved" : "pending",
      references: references.length,
      portfolioPhotos: portfolioPhotos.length,
    },
    publishedFromAdmin: true,
  };
}

export function defaultIdentityVerification(): SpecialistIdentityVerification {
  return {
    profilePhotoUrl: "",
    idFrontUrl: "",
    idBackUrl: "",
    selfieUrl: "",
    verificationStatus: "pending",
    reviewedBy: null,
    reviewedAt: null,
    notes: "",
    secureStorageConfigured: false,
    identityStorageStatus: "pending_secure_storage",
  };
}

export function specialistSlug(name: string, specialty?: string, commune?: string, fallback?: string) {
  const base = [name, specialty, commune].filter(Boolean).join(" ");
  const slug = (base || fallback || `especialista-${Date.now()}`)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || fallback || `especialista-${Date.now()}`;
}

export function uniqueSpecialistSlug(baseSlug: string, existingSlugs: string[]) {
  const existing = new Set(existingSlugs.filter(Boolean));
  if (!existing.has(baseSlug)) return baseSlug;
  let suffix = 2;
  while (existing.has(`${baseSlug}-${suffix}`)) suffix += 1;
  return `${baseSlug}-${suffix}`;
}

export function getSpecialistBySlugOrId(idOrSlug: string, extraSpecialists: Specialist[] = []) {
  const needle = idOrSlug.trim();
  const publicPublished = getPublishedSpecialists();
  const combined = [...extraSpecialists, ...publicPublished, ...baseSpecialists];
  const seen = new Set<string>();
  const specialists = combined.filter((specialist) => {
    const key = specialist.slug ?? specialist.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const specialist =
    specialists.find((item) => item.slug === needle) ??
    specialists.find((item) => item.id === needle) ??
    specialists.find((item) => String((item as Specialist & { legacyId?: string }).legacyId ?? "") === needle) ??
    null;

  return {
    specialist,
    diagnostics: {
      searched: needle,
      sources: ["extraSpecialists", "publishedSpecialists", "baseSpecialists"],
      availableCount: specialists.length,
    },
  };
}

export function isPublicSpecialistStatus(status?: SpecialistPublicationStatus) {
  return status === undefined || status === "published";
}

export function specialistPublicationReadiness(request: PendingSpecialistProfile) {
  const identity = request.identityVerification;
  const completeReferences = (request.references ?? []).filter((reference) => reference.name && reference.phone && reference.work);
  const services = request.services ?? [];
  const missing = [
    identity?.verificationStatus === "approved" ? "" : "Identidad aprobada",
    completeReferences.length >= 3 ? "" : "3 referencias completas",
    request.profilePhoto || identity?.profilePhotoUrl ? "" : "Foto pública",
    identity?.idFrontUrl ? "" : "Cédula frontal",
    identity?.idBackUrl ? "" : "Cédula reverso",
    identity?.selfieUrl ? "" : "Selfie de verificación",
    services.length ? "" : "Servicios declarados",
    request.commune && request.coverageRadiusKm ? "" : "Comuna y cobertura",
    services.some((service) => service.pricingMode === "quote_required" || Number(service.specialistExpectedPayoutCLP ?? service.specialistPayoutCLP ?? service.clientCredits ?? 0) > 0)
      ? ""
      : "Precios o modalidad de cotización",
  ].filter(Boolean);
  return { ok: missing.length === 0, missing };
}

function pendingServiceToFlexibleService(service: PendingSpecialistService, request: PendingSpecialistProfile, index: number): FlexibleService {
  const pricingMode = service.pricingMode ?? "fixed";
  const clientCredits = Number(service.clientCredits || service.fixedCredits || service.visitCredits || service.minCredits || 20);
  return {
    id: `${request.id ?? request.name}-service-${index + 1}`,
    serviceId: `${request.id ?? request.name}-service-${index + 1}`,
    serviceTypeId: service.serviceTypeId,
    categoryId: service.serviceTypeId,
    specialty: service.specialty,
    name: service.name || service.specialty,
    description: service.description || service.conditions || "Servicio revisado por OficiosPro.",
    pricingMode,
    creditPrice: service.creditPrice ?? clientCredits,
    fixedCredits: service.fixedCredits ?? (pricingMode === "fixed" ? clientCredits : undefined),
    hourlyCredits: service.hourlyCredits,
    minHours: service.minHours,
    maxHours: service.maxHours,
    minCredits: service.minCredits,
    maxCredits: service.maxCredits,
    visitCredits: service.visitCredits,
    emergencyCredits: service.emergencyCredits,
    clubDiscountCredits: 2,
    estimatedDuration: service.duration,
    estimatedDurationMinMinutes: service.estimatedDurationMinMinutes ?? service.estimatedDurationMinutes,
    estimatedDurationMaxMinutes: service.estimatedDurationMaxMinutes ?? service.estimatedDurationMinutes,
    specialistPayoutCLP: Number(service.specialistApprovedPayoutCLP ?? service.specialistPayoutCLP ?? service.specialistExpectedPayoutCLP ?? 0),
    specialistExpectedPayoutCLP: Number(service.specialistExpectedPayoutCLP ?? service.specialistPayoutCLP ?? 0),
    platformMarginCredits: Math.max(0, clientCredits - Math.round(Number(service.specialistApprovedPayoutCLP ?? service.specialistPayoutCLP ?? service.specialistExpectedPayoutCLP ?? 0) / 1000)),
    materialsIncluded: service.materialsIncludedBoolean ?? String(service.materialsIncluded ?? "").toLowerCase().includes("incl"),
    materialsChargedSeparately: service.materialsChargedSeparately ?? String(service.materialsIncluded ?? "").toLowerCase().includes("aparte"),
    initialVisitFree: Boolean(service.initialVisitFree),
    requiresPriorEvaluation: Boolean(service.requiresPriorEvaluation),
    emergency: Boolean(service.emergencyAvailable ?? service.emergency),
    active: service.active !== false,
    conditions: service.conditions || service.specialistComments || "Condiciones sujetas a revision de alcance.",
    adminReviewStatus: service.pricingStatus === "approved" ? "approved" : "pending_review",
  };
}
