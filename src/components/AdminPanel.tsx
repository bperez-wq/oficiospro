"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { AdminCreditLedgerPreview } from "@/components/AdminCreditLedgerPreview";
import { AdminFinancePanel } from "@/components/AdminFinancePanel";
import { AdminPricingPanel } from "@/components/AdminPricingPanel";
import { chileTaxConfig2026 } from "@/config/taxConfig";
import { specialists } from "@/data/mock";
import { additionalTypeLabels, quoteStatusLabels, type AdditionalRequest, type QuoteAgreement } from "@/data/flexiblePricing";
import {
  calculateServiceEconomics,
  defaultCommercialConfig as marketplaceDefaultConfig,
  formatCLP,
  serviceTypes,
  subscriptionPlans,
  type CommercialConfig,
  type SubscriptionPlan,
} from "@/data/marketplace";
import { calculateClientCreditsFromSpecialistPayout, estimateClientPriceCLP, estimatePlatformMarginCLP, formatCLP as formatPricingCLP } from "@/lib/pricing";
import { quoteTotalCredits } from "@/lib/flexiblePricing";
import { oficiosProMerchant, paymentProviders } from "@/lib/payments/paymentProvider";
import { getSpecialistReviews, type SpecialistReview } from "@/lib/trust";
import { defaultCommercialConfig as defaultPricingConfig } from "@/data/commercialConfig";
import { communeOptions } from "@/lib/catalog";
import { canAccess } from "@/lib/security";
import { adminRequestHeaders, adminSessionToken, hasAdminBrowserSession, initialAdminToken } from "@/lib/adminAuth";
import { shouldShowDemoData } from "@/lib/demoData";
import {
  addPaymentCredits,
  approveAndPublishSpecialist,
  clearMockSession,
  getCommercialConfig,
  getAdditionalRequests,
  getEnterpriseLeads,
  getHomeLeads,
  getMockSession,
  getPaymentCreditTransactions,
  getPaymentCreditWallet,
  getPaymentRecords,
  getPaymentSubscriptions,
  getAllAdminSpecialists,
  getPendingSpecialists,
  getQuickSearchLeads,
  getQuoteAgreements,
  getServiceRequestLeads,
  getSpecialistPayouts,
  getSpecialistLeads,
  getStoredItems,
  markSpecialistPayoutPaid,
  rejectPendingSpecialist,
  saveCommercialConfig,
  savePendingSpecialists,
  saveStoredItems,
  seedMockState,
  specialistPublicationReadiness,
  updateAdditionalRequestStatus,
  updateQuoteAgreement,
  updateQuoteAgreementStatus,
  updatePaymentSubscriptionStatus,
  usePaymentCredits,
  updateConversionLeadStatus,
  updatePendingSpecialistIdentity,
  updatePublishedSpecialistProfile,
  updatePublishedSpecialistStatus,
  type ConversionLeadKind,
  type ConversionLeadStatus,
  type EnterpriseLead,
  type HomeLead,
  type PaymentCreditTransaction,
  type PaymentCreditWallet,
  type PaymentRecord,
  type PaymentSubscriptionRecord,
  type PaymentSubscriptionStatus,
  type PendingSpecialistProfile,
  type PendingSpecialistService,
  type SpecialistPublicationStatus,
  type QuickSearchLead,
  type ServiceRequestLead,
  type SpecialistPayout,
  type SpecialistLead,
  type MockSession,
} from "@/lib/storage";

type AdminSection =
  | "resumen"
  | "pendientes"
  | "publicados"
  | "solicitudes"
  | "cotizaciones-virtuales"
  | "reviews"
  | "leads-hogar"
  | "leads-empresas"
  | "pagos"
  | "finanzas"
  | "negociacion"
  | "catalogo"
  | "comunas"
  | "creditos"
  | "planes"
  | "referidos"
  | "seguridad"
  | "configuracion";

type CompanyRequest = {
  id?: string;
  company?: string;
  businessName?: string;
  companyRut?: string;
  companyLine?: string;
  contact?: string;
  email?: string;
  whatsapp?: string;
  commune?: string;
  region?: string;
  branches?: number;
  serviceType?: string;
  otherServiceDescription?: string;
  additionalComments?: string;
  plan?: string;
  status?: string;
  createdAt?: string;
};

type LiveAdminLead = {
  id: string;
  created_at?: string;
  createdAt?: string;
  lead_type?: string;
  leadType?: string;
  status?: string;
  priority?: string;
  full_name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  companyName?: string;
  service?: string;
  trade?: string;
  region_name?: string;
  regionName?: string;
  commune_name?: string;
  communeName?: string;
  source_component?: string;
  sourceComponent?: string;
  source_button?: string;
  sourceButton?: string;
  payload_json?: string;
  payloadJson?: string;
};

type LiveCrmOverview = {
  newLeads?: number;
  pendingSpecialists?: number;
  pendingVirtualQuotes?: number;
  overdueTasks?: number;
  newCompanies?: number;
  paymentIssues?: number;
  openOpportunities?: number;
};

type LiveAdminDataState = {
  status: "idle" | "loading" | "loaded" | "unauthorized" | "error";
  leads: LiveAdminLead[];
  overview: LiveCrmOverview | null;
  message: string;
  updatedAt?: string;
};

type AdminPlan = SubscriptionPlan & { active: boolean };
type EditableSpecialty = {
  id: string;
  name: string;
  active: boolean;
  requiresCertification: boolean;
  suggestedCredits: number;
  suggestedMinMarginCLP: number;
  appliesTo: string;
};
type EditableServiceType = { id: string; name: string; description: string; active: boolean; specialties: EditableSpecialty[] };
type CoverageCommune = { name: string; region: string; active: boolean; priority: boolean };
type LeadNoteMap = Record<string, string>;
type NumericConfigKey = Exclude<keyof CommercialConfig, "specialistReferralBonus">;
type AdminReviewRow = SpecialistReview & { specialistName: string; hidden: boolean; reviewedByAdmin: boolean };

const adminSections: { id: AdminSection; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "pendientes", label: "Especialistas pendientes" },
  { id: "publicados", label: "Especialistas publicados" },
  { id: "solicitudes", label: "Solicitudes de clientes" },
  { id: "cotizaciones-virtuales", label: "Cotizaciones virtuales" },
  { id: "reviews", label: "Reviews" },
  { id: "leads-hogar", label: "Leads Club Hogar" },
  { id: "leads-empresas", label: "Leads Empresas" },
  { id: "pagos", label: "Pagos y créditos" },
  { id: "finanzas", label: "Finanzas y tributación" },
  { id: "negociacion", label: "Tarifas, cotizaciones y negociación" },
  { id: "catalogo", label: "Catálogo de servicios" },
  { id: "comunas", label: "Comunas y cobertura" },
  { id: "creditos", label: "Créditos y comisiones" },
  { id: "planes", label: "Planes" },
  { id: "referidos", label: "Referidos" },
  { id: "seguridad", label: "Checklist de seguridad" },
  { id: "configuracion", label: "Configuración" },
];

const adminKeys = {
  plans: "oficiospro.adminPlans",
  catalog: "oficiospro.adminCatalog",
  communes: "oficiospro.adminCommunes",
  leadNotes: "oficiospro.adminLeadNotes",
};
const fallbackDate = "1970-01-01T00:00:00.000Z";
const adminBackofficeTokenStorageKey = "oficiospro.adminBackofficeToken";

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function defaultPlans(): AdminPlan[] {
  return subscriptionPlans.map((plan) => ({ ...plan, active: true }));
}

function defaultCatalog(): EditableServiceType[] {
  return serviceTypes.map((type) => ({
    id: type.id,
    name: type.name,
    description: type.description,
    active: true,
    specialties: type.specialties.map((specialty) => ({
      ...(type.specialtyDetails?.find((detail) => detail.name === specialty)
        ? {
            suggestedCredits: type.specialtyDetails.find((detail) => detail.name === specialty)?.suggestedCredits.min ?? 20,
            suggestedMinMarginCLP: type.specialtyDetails.find((detail) => detail.name === specialty)?.suggestedMinMarginCLP ?? 5000,
            requiresCertification: type.specialtyDetails.find((detail) => detail.name === specialty)?.certificationRequired !== "No obligatoria",
            appliesTo: type.specialtyDetails.find((detail) => detail.name === specialty)?.appliesTo.join(", ") ?? "hogar",
          }
        : {}),
      id: `${type.id}-${specialty.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: specialty,
      active: true,
      suggestedCredits: type.specialtyDetails?.find((detail) => detail.name === specialty)?.suggestedCredits.min ?? 20,
      suggestedMinMarginCLP: type.specialtyDetails?.find((detail) => detail.name === specialty)?.suggestedMinMarginCLP ?? 5000,
      requiresCertification: type.specialtyDetails?.find((detail) => detail.name === specialty)?.certificationRequired !== "No obligatoria",
      appliesTo: type.specialtyDetails?.find((detail) => detail.name === specialty)?.appliesTo.join(", ") ?? "hogar",
    })),
  }));
}

function defaultCommunes(): CoverageCommune[] {
  return communeOptions.map((commune, index) => ({
    name: commune.value,
    region: commune.meta ?? "Chile",
    active: index < 80,
    priority: ["Las Condes", "Vitacura", "Providencia", "Santiago", "Ñuñoa"].includes(commune.value),
  }));
}

export function AdminPanel() {
  const [activeSection, setActiveSection] = useState<AdminSection>("resumen");
  const [pendingSpecialists, setPendingSpecialists] = useState<PendingSpecialistProfile[]>([]);
  const [publishedSpecialists, setPublishedSpecialists] = useState<ReturnType<typeof getAllAdminSpecialists>>([]);
  const [companyRequests, setCompanyRequests] = useState<CompanyRequest[]>([]);
  const [homeLeads, setHomeLeads] = useState<HomeLead[]>([]);
  const [enterpriseLeads, setEnterpriseLeads] = useState<EnterpriseLead[]>([]);
  const [specialistLeads, setSpecialistLeads] = useState<SpecialistLead[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestLead[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentSubscriptions, setPaymentSubscriptions] = useState<PaymentSubscriptionRecord[]>([]);
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentCreditTransaction[]>([]);
  const [paymentWallet, setPaymentWallet] = useState<PaymentCreditWallet>({
    userId: "",
    currentBalance: 0,
    expiringCredits: [],
    updatedAt: "",
  });
  const [payouts, setPayouts] = useState<SpecialistPayout[]>([]);
  const [quoteAgreements, setQuoteAgreements] = useState<QuoteAgreement[]>([]);
  const [additionalRequests, setAdditionalRequests] = useState<AdditionalRequest[]>([]);
  const [creditAdjustment, setCreditAdjustment] = useState(10);
  const [otherServiceRequests, setOtherServiceRequests] = useState<QuickSearchLead[]>([]);
  const [config, setConfig] = useState<CommercialConfig>(marketplaceDefaultConfig);
  const [plans, setPlans] = useState<AdminPlan[]>(defaultPlans());
  const [catalog, setCatalog] = useState<EditableServiceType[]>(defaultCatalog());
  const [coverage, setCoverage] = useState<CoverageCommune[]>(defaultCommunes());
  const [notes, setNotes] = useState<LeadNoteMap>({});
  const [selectedSpecialist, setSelectedSpecialist] = useState<PendingSpecialistProfile | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestLead | null>(null);
  const [publishedFilter, setPublishedFilter] = useState<SpecialistPublicationStatus | "all">("all");
  const [reviewRatingFilter, setReviewRatingFilter] = useState("all");
  const [hiddenReviewIds, setHiddenReviewIds] = useState<Record<string, boolean>>({});
  const [reviewedReviewIds, setReviewedReviewIds] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [authState, setAuthState] = useState<"checking" | "authenticated" | "unauthenticated" | "forbidden">("checking");
  const [adminSession, setAdminSession] = useState<MockSession | null>(null);
  const [liveAdminData, setLiveAdminData] = useState<LiveAdminDataState>({
    status: "idle",
    leads: [],
    overview: null,
    message: "Pendiente de conectar datos D1.",
  });

  useEffect(() => {
    const session = getMockSession();
    setAdminSession(session);
    if (!session) {
      setAuthState("unauthenticated");
      setIsAdmin(false);
      window.location.replace("/login?next=/admin");
      return;
    }
    if (!canAccess(session.role, "admin", "read")) {
      setAuthState("forbidden");
      setIsAdmin(false);
      return;
    }
    setAuthState("authenticated");
    setIsAdmin(true);
    seedMockState();
    refresh();
    void refreshLiveAdminData();
    setPlans(readLocal(adminKeys.plans, defaultPlans()));
    setCatalog(readLocal(adminKeys.catalog, defaultCatalog()));
    setCoverage(readLocal(adminKeys.communes, defaultCommunes()));
    setNotes(readLocal(adminKeys.leadNotes, {}));

    function applyHash() {
      const hash = window.location.hash.replace("#", "");
      const map: Record<string, AdminSection> = {
        "especialistas-pendientes": "pendientes",
        leads: "leads-hogar",
        "configuracion-comercial": "creditos",
        "cotizaciones-virtuales": "cotizaciones-virtuales",
      };
      if (map[hash]) setActiveSection(map[hash]);
    }

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  function refresh() {
    setPendingSpecialists(getPendingSpecialists());
    setPublishedSpecialists(getAllAdminSpecialists());
    setCompanyRequests(getStoredItems<CompanyRequest>("companies"));
    setHomeLeads(getHomeLeads());
    setEnterpriseLeads(getEnterpriseLeads());
    setSpecialistLeads(getSpecialistLeads());
    setServiceRequests(getServiceRequestLeads());
    setPayments(getPaymentRecords());
    setPaymentSubscriptions(getPaymentSubscriptions());
    setPaymentTransactions(getPaymentCreditTransactions());
    setPaymentWallet(getPaymentCreditWallet());
    setPayouts(getSpecialistPayouts());
    setQuoteAgreements(getQuoteAgreements());
    setAdditionalRequests(getAdditionalRequests());
    setOtherServiceRequests(getQuickSearchLeads().filter((request) => request.isOtherService));
    setConfig(getCommercialConfig());
  }

  function currentAdminToken() {
    if (typeof window === "undefined") return "";
    return (
      initialAdminToken(adminBackofficeTokenStorageKey) ||
      window.sessionStorage.getItem("oficiospro.adminLeadToken") ||
      window.sessionStorage.getItem("oficiospro.adminCrmToken") ||
      (hasAdminBrowserSession() ? adminSessionToken : "")
    );
  }

  async function refreshLiveAdminData() {
    const activeToken = currentAdminToken();
    if (!activeToken) {
      setLiveAdminData({
        status: "unauthorized",
        leads: [],
        overview: null,
        message: "Inicia sesion admin real o guarda ADMIN_TOKEN en Leads/CRM para ver datos D1.",
      });
      return;
    }

    setLiveAdminData((current) => ({ ...current, status: "loading", message: "Consultando D1..." }));
    try {
      const [leadsResponse, overviewResponse] = await Promise.all([
        fetch("/api/admin/leads?limit=100", {
          credentials: "include",
          headers: adminRequestHeaders(activeToken),
        }),
        fetch("/api/admin/crm/overview", {
          credentials: "include",
          headers: adminRequestHeaders(activeToken),
        }),
      ]);
      const leadsData = (await leadsResponse.json().catch(() => ({}))) as { ok?: boolean; leads?: LiveAdminLead[]; error?: string };
      const overviewData = (await overviewResponse.json().catch(() => ({}))) as { ok?: boolean; overview?: LiveCrmOverview; error?: string };

      if (!leadsResponse.ok || !leadsData.ok) {
        const error = leadsData.error ?? `http_${leadsResponse.status}`;
        setLiveAdminData({
          status: error === "unauthorized" ? "unauthorized" : "error",
          leads: [],
          overview: null,
          message: liveAdminErrorMessage(error),
        });
        return;
      }

      setLiveAdminData({
        status: "loaded",
        leads: leadsData.leads ?? [],
        overview: overviewResponse.ok && overviewData.ok ? overviewData.overview ?? null : null,
        message: `${leadsData.leads?.length ?? 0} leads reales cargados desde D1.`,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      setLiveAdminData({
        status: "error",
        leads: [],
        overview: null,
        message: "No pudimos conectar el panel con D1. Revisa sesion admin, Worker o conexion.",
      });
    }
  }

  const demoDataEnabled = shouldShowDemoData();
  const approvedBase = demoDataEnabled ? specialists.filter((specialist) => specialist.verified !== false) : [];
  const managedPublished = publishedSpecialists.filter((specialist) =>
    publishedFilter === "all"
      ? (specialist.publicationStatus ?? specialist.status) !== "deleted"
      : (specialist.publicationStatus ?? specialist.status) === publishedFilter,
  );
  const visiblePublished = publishedFilter === "all" ? [...approvedBase, ...managedPublished] : managedPublished;
  const pendingOnly = pendingSpecialists.filter((item) => item.status === "pendiente" || item.status === "info solicitada");
  const rejectedOnly = pendingSpecialists.filter((item) => item.status === "rechazado");
  const liveDataLoaded = liveAdminData.status === "loaded";
  const liveSpecialistLeads = liveAdminData.leads.filter((lead) => liveLeadType(lead) === "specialist_application");
  const livePendingSpecialistLeads = liveSpecialistLeads.filter(isLiveOpenLead);
  const liveCustomerLeads = liveAdminData.leads.filter((lead) => ["customer_request", "booking_request", "club_hogar_interest", "contact_message", "payment_interest"].includes(liveLeadType(lead)));
  const liveCompanyLeads = liveAdminData.leads.filter((lead) => liveLeadType(lead) === "company_request");
  const liveServiceRequests = liveAdminData.leads.filter((lead) => ["customer_request", "booking_request"].includes(liveLeadType(lead)));
  const commissionGrossRate = chileTaxConfig2026.platformCommission.standardRate * (chileTaxConfig2026.platformCommission.ivaApplies ? 1 + chileTaxConfig2026.ivaRate : 1);
  const estimatedCommission = serviceRequests.reduce((sum, request) => sum + (request.estimatedCredits ?? 0) * config.creditValueCLP * commissionGrossRate, 0);
  const reviewRows = useMemo<AdminReviewRow[]>(
    () =>
      [...(demoDataEnabled ? specialists : []), ...publishedSpecialists].flatMap((specialist) =>
        getSpecialistReviews(specialist).map((review) => ({
          ...review,
          specialistName: specialist.name,
          hidden: Boolean(hiddenReviewIds[review.id] ?? review.hidden),
          reviewedByAdmin: Boolean(reviewedReviewIds[review.id] ?? review.reviewedByAdmin),
        })),
      ),
    [demoDataEnabled, hiddenReviewIds, publishedSpecialists, reviewedReviewIds],
  );
  const filteredReviewRows = reviewRows.filter((review) => reviewRatingFilter === "all" || Math.round(review.ratingGeneral).toString() === reviewRatingFilter);
  const kpis = [
    { label: "Especialistas pendientes", value: (liveDataLoaded ? livePendingSpecialistLeads.length : pendingOnly.length).toString() },
    { label: "Especialistas aprobados", value: visiblePublished.length.toString() },
    { label: "Solicitudes nuevas", value: (liveDataLoaded ? liveServiceRequests.length : serviceRequests.filter((item) => item.status === "Nuevo").length).toString() },
    { label: "Leads hogar", value: (liveDataLoaded ? liveCustomerLeads.length : homeLeads.length).toString() },
    { label: "Leads empresa", value: (liveDataLoaded ? liveCompanyLeads.length : enterpriseLeads.length + companyRequests.length).toString() },
    { label: "Pagos recientes", value: payments.length.toString() },
    { label: "Propuestas pendientes", value: quoteAgreements.filter((item) => ["quote_requested", "proposal_sent", "platform_review", "customer_counteroffer"].includes(item.status)).length.toString() },
    { label: "Adicionales pendientes", value: additionalRequests.filter((item) => item.status === "pending_customer_approval" || item.status === "clarification_requested").length.toString() },
    { label: "Reviews nuevas", value: reviewRows.filter((review) => !review.reviewedByAdmin).length.toString() },
    { label: "Liquidaciones pendientes", value: payouts.filter((item) => item.status !== "pagado").length.toString() },
    { label: "Créditos vendidos", value: String(paymentTransactions.filter((transaction) => transaction.amount > 0).reduce((sum, transaction) => sum + transaction.amount, 0)) },
    { label: "Comisión OficiosPro", value: formatCLP(Math.round(estimatedCommission)) },
    { label: "Comunas cubiertas", value: coverage.filter((item) => item.active).length.toString() },
  ];

  function updateConfig(event: ChangeEvent<HTMLInputElement>) {
    const name = event.target.name as NumericConfigKey;
    const next: CommercialConfig = { ...config, [name]: Number(event.target.value) };
    setConfig(next);
    saveCommercialConfig(next);
    setNotice("Configuración comercial guardada.");
  }

  function updateReferralBonus(value: string) {
    const next = { ...config, specialistReferralBonus: value };
    setConfig(next);
    saveCommercialConfig(next);
    setNotice("Bonificación de especialistas guardada.");
  }

  function approveRequest(id: string | undefined) {
    if (!id) return;
    const result = approveAndPublishSpecialist(id);
    if (!result?.ok) {
      setNotice(`No se puede publicar este especialista hasta completar verificación de identidad y referencias. Faltan: ${(result?.missing ?? []).join(", ")}`);
      return;
    }
    refresh();
    setSelectedSpecialist(null);
    setNotice("Especialista aprobado y publicado en el marketplace.");
  }

  function rejectRequest(id: string | undefined) {
    if (!id) return;
    rejectPendingSpecialist(id);
    refresh();
    setSelectedSpecialist(null);
    setNotice("Especialista rechazado. No aparecerá públicamente.");
  }

  function requestMoreInfo(id: string | undefined) {
    if (!id) return;
    const next = getPendingSpecialists().map((item) =>
      item.id === id ? { ...item, status: "info solicitada" as const, reviewedAt: new Date().toISOString() } : item,
    );
    savePendingSpecialists(next);
    refresh();
    setSelectedSpecialist((current) => (current?.id === id ? { ...current, status: "info solicitada" } : current));
    setNotice("Solicitud marcada como requiere más información.");
  }

  function updatePendingService(index: number, patch: Partial<PendingSpecialistService>) {
    if (!selectedSpecialist) return;
    const services = (selectedSpecialist.services ?? []).map((service, serviceIndex) => (serviceIndex === index ? { ...service, ...patch } : service));
    const updated = { ...selectedSpecialist, services };
    setSelectedSpecialist(updated);
    const next = getPendingSpecialists().map((item) => (item.id === updated.id ? updated : item));
    savePendingSpecialists(next);
    setPendingSpecialists(next);
    setNotice("Servicio del especialista actualizado.");
  }

  function updateIdentityReview(status: "approved" | "rejected" | "needs_review", note?: string) {
    if (!selectedSpecialist?.id) return;
    const updated = updatePendingSpecialistIdentity(selectedSpecialist.id, {
      verificationStatus: status,
      reviewedBy: adminSession?.email ?? "admin",
      notes: note ?? selectedSpecialist.identityVerification?.notes ?? "",
    });
    refresh();
    if (updated) setSelectedSpecialist(updated);
    setNotice(`Verificación de identidad actualizada a ${status}.`);
  }

  function saveIdentityNote(note: string) {
    if (!selectedSpecialist?.id) return;
    const updated = updatePendingSpecialistIdentity(selectedSpecialist.id, { notes: note });
    refresh();
    if (updated) setSelectedSpecialist(updated);
    setNotice("Nota interna de identidad guardada.");
  }

  function changePublishedStatus(id: string, status: SpecialistPublicationStatus) {
    if (status === "deleted" && !window.confirm("¿Seguro que quieres eliminar este especialista? No aparecerá públicamente.")) return;
    if (status === "suspended" && !window.confirm("Este especialista dejará de aparecer en búsquedas hasta que lo reactives.")) return;
    updatePublishedSpecialistStatus(id, status);
    refresh();
    setNotice(`Especialista actualizado a ${status}.`);
  }

  function editPublishedSpecialist(specialist: (typeof publishedSpecialists)[number]) {
    const name = window.prompt("Nombre público del especialista", specialist.name);
    if (name === null) return;
    const specialty = window.prompt("Especialidad pública", specialist.specialty);
    if (specialty === null) return;
    updatePublishedSpecialistProfile(specialist.id, { name: name.trim() || specialist.name, specialty: specialty.trim() || specialist.specialty });
    refresh();
    setNotice("Especialista actualizado.");
  }

  function updateLeadStatus(kind: ConversionLeadKind, id: string, status: ConversionLeadStatus) {
    updateConversionLeadStatus(kind, id, status);
    refresh();
    setNotice(`Estado actualizado a ${status}.`);
  }

  function closeAdminSession() {
    clearMockSession();
    setAdminSession(null);
    setIsAdmin(false);
    window.location.href = "/";
  }

  function updateEnterprisePipeline(id: string, status: ConversionLeadStatus) {
    if (enterpriseLeads.some((lead) => lead.id === id)) {
      updateLeadStatus("enterprise", id, status);
      return;
    }
    const next = companyRequests.map((company) => ((company.id ?? `${company.company}-${company.email}`) === id ? { ...company, status } : company));
    setCompanyRequests(next);
    saveStoredItems("companies", next);
    setNotice(`Lead empresa marcado como ${status}.`);
  }

  function refreshPaymentState() {
    setPayments(getPaymentRecords());
    setPaymentSubscriptions(getPaymentSubscriptions());
    setPaymentTransactions(getPaymentCreditTransactions());
    setPaymentWallet(getPaymentCreditWallet());
    setPayouts(getSpecialistPayouts());
  }

  function addAdminCredits() {
    addPaymentCredits({
      amount: Number(creditAdjustment),
      type: "admin_adjustment",
      detail: "Ajuste manual desde administración",
    });
    refreshPaymentState();
    setNotice("Saldo de créditos ajustado.");
  }

  function refundCredits() {
    usePaymentCredits({
      amount: Number(creditAdjustment),
      type: "refund",
      detail: "Reembolso de créditos desde administración",
    });
    refreshPaymentState();
    setNotice("Reembolso de créditos registrado.");
  }

  function changeSubscriptionStatus(id: string, status: PaymentSubscriptionStatus) {
    updatePaymentSubscriptionStatus(id, status);
    refreshPaymentState();
    setNotice(`Suscripción marcada como ${status}.`);
  }

  function retryPaymentReconciliation() {
    refreshPaymentState();
    setNotice("Conciliación manual solicitada. Revisa proveedor, webhook y ledger antes de emitir créditos reales.");
  }

  function markPaymentsReviewed() {
    setNotice("Pagos y créditos marcados como revisados en esta sesión interna.");
  }

  function markReviewReviewed(id: string) {
    setReviewedReviewIds((current) => ({ ...current, [id]: true }));
    setNotice("Review marcada como revisada.");
  }

  function toggleReviewHidden(id: string) {
    setHiddenReviewIds((current) => ({ ...current, [id]: !current[id] }));
    setNotice("Visibilidad de review actualizada.");
  }

  function paySpecialistPayout(id: string) {
    markSpecialistPayoutPaid(id);
    refreshPaymentState();
    setNotice("Liquidación marcada como pagada.");
  }

  function updateQuoteStatus(id: string, status: QuoteAgreement["status"], message: string) {
    updateQuoteAgreementStatus(id, status, message);
    refresh();
    setNotice(message);
  }

  function editQuoteMargin(id: string, platformNote: string) {
    updateQuoteAgreement(id, { platformNote, status: "platform_review" }, "OficiosPro esta revisando esta propuesta.");
    refresh();
    setNotice("Nota de comisión guardada y propuesta marcada para revision.");
  }

  function updateAdditionalStatus(id: string, status: AdditionalRequest["status"], message: string) {
    updateAdditionalRequestStatus(id, status, message);
    refresh();
    setNotice(message);
  }

  function saveNote(id: string, note: string) {
    const next = { ...notes, [id]: note };
    setNotes(next);
    writeLocal(adminKeys.leadNotes, next);
    setNotice("Nota interna guardada.");
  }

  function updatePlan(id: string, patch: Partial<AdminPlan>) {
    const next = plans.map((plan) => (plan.id === id ? { ...plan, ...patch } : plan));
    setPlans(next);
    writeLocal(adminKeys.plans, next);
    setNotice("Plan actualizado.");
  }

  function addServiceType() {
    const id = `tipo-${Date.now()}`;
    const next = [{ id, name: "Nuevo tipo de servicio", description: "Describe el tipo de servicio.", active: true, specialties: [] }, ...catalog];
    setCatalog(next);
    writeLocal(adminKeys.catalog, next);
    setNotice("Tipo de servicio creado.");
  }

  function updateServiceType(id: string, patch: Partial<EditableServiceType>) {
    const next = catalog.map((type) => (type.id === id ? { ...type, ...patch } : type));
    setCatalog(next);
    writeLocal(adminKeys.catalog, next);
  }

  function addSpecialty(typeId: string) {
    const next = catalog.map((type) =>
      type.id === typeId
        ? {
            ...type,
            specialties: [
              {
                id: `especialidad-${Date.now()}`,
                name: "Nueva especialidad",
                active: true,
                requiresCertification: false,
                suggestedCredits: 20,
                suggestedMinMarginCLP: 5000,
                appliesTo: "hogar",
              },
              ...type.specialties,
            ],
          }
        : type,
    );
    setCatalog(next);
    writeLocal(adminKeys.catalog, next);
    setNotice("Especialidad creada.");
  }

  function updateSpecialty(typeId: string, specialtyId: string, patch: Partial<EditableSpecialty>) {
    const next = catalog.map((type) =>
      type.id === typeId
        ? { ...type, specialties: type.specialties.map((specialty) => (specialty.id === specialtyId ? { ...specialty, ...patch } : specialty)) }
        : type,
    );
    setCatalog(next);
    writeLocal(adminKeys.catalog, next);
  }

  function convertOtherServiceToSpecialty(request: QuickSearchLead) {
    const next = catalog.map((type) =>
      type.id === request.serviceTypeId
        ? {
            ...type,
            specialties: [
              {
                id: `convertida-${Date.now()}`,
                name: request.otherServiceDescription || request.need,
                active: true,
                requiresCertification: false,
                suggestedCredits: 30,
                suggestedMinMarginCLP: 5000,
                appliesTo: type.name,
              },
              ...type.specialties,
            ],
          }
        : type,
    );
    setCatalog(next);
    writeLocal(adminKeys.catalog, next);
    setNotice("Solicitud convertida en especialidad oficial del catálogo administrable.");
  }

  function updateCommune(name: string, patch: Partial<CoverageCommune>) {
    const next = coverage.map((commune) => (commune.name === name ? { ...commune, ...patch } : commune));
    setCoverage(next);
    writeLocal(adminKeys.communes, next);
  }

  const allLeads = useMemo(
    () => [
      ...homeLeads.map((lead) => ({ kind: "home" as ConversionLeadKind, id: lead.id, createdAt: lead.createdAt, status: lead.status, name: lead.name, email: lead.email, whatsapp: lead.whatsapp, commune: lead.commune, interest: lead.interest })),
      ...enterpriseLeads.map((lead) => ({ kind: "enterprise" as ConversionLeadKind, id: lead.id, createdAt: lead.createdAt, status: lead.status, name: `${lead.name} · ${lead.company}`, email: lead.email, whatsapp: lead.whatsapp, commune: lead.commune, interest: lead.serviceType ?? lead.interest })),
      ...companyRequests.map((lead) => ({ kind: "enterprise" as ConversionLeadKind, id: lead.id ?? `${lead.company}-${lead.email}`, createdAt: lead.createdAt ?? fallbackDate, status: normalizeStatus(lead.status), name: `${lead.contact ?? "Contacto"} · ${lead.businessName ?? lead.company ?? "Empresa"}`, email: lead.email ?? "", whatsapp: lead.whatsapp ?? "", commune: lead.commune ?? "", interest: lead.serviceType ?? lead.plan ?? "Solicitud empresa" })),
      ...specialistLeads.map((lead) => ({ kind: "specialist" as ConversionLeadKind, id: lead.id, createdAt: lead.createdAt, status: lead.status, name: lead.name, email: lead.email, whatsapp: lead.phone, commune: lead.commune, interest: lead.serviceTypeName })),
    ],
    [companyRequests, enterpriseLeads, homeLeads, specialistLeads],
  );
  const securityChecklist = [
    {
      label: "Variables sensibles no expuestas",
      status: "OK",
      detail: ".env reales ignorados; .env.example solo debe contener placeholders.",
    },
    {
      label: "Admin protegido",
      status: "OK",
      detail: "/admin valida rol admin antes de cargar datos; /api/admin/* requiere token del Worker.",
    },
    {
      label: "Formularios validados",
      status: "OK",
      detail: "Worker valida JSON, tamaño, campos mínimos, email/teléfono/RUT y limpia HTML básico.",
    },
    {
      label: "Rate limit configurado",
      status: "Requiere atención",
      detail: "Activo con fallback en memoria; falta KV/D1 durable para producción con múltiples isolates.",
    },
    {
      label: "Email configurado",
      status: "Pendiente",
      detail: "Requiere RESEND_API_KEY y correos transaccionales en Cloudflare secrets.",
    },
    {
      label: "Storage identidad configurado",
      status: "Requiere atención",
      detail: "Cédula y selfie quedan marcadas como pendientes de storage privado R2/Supabase.",
    },
    {
      label: "Mercado Pago webhook configurado",
      status: "Requiere atención",
      detail: "Firma validada si existe MERCADOPAGO_WEBHOOK_SECRET; falta storage durable de eventos procesados.",
    },
    {
      label: "RLS configurado si aplica",
      status: "Pendiente",
      detail: "Supabase no es requisito de build; revisar docs/supabase-security-plan.md antes de producción real.",
    },
  ] as const;
  const companyLeadRows = [
    ...enterpriseLeads.map((lead) => toLeadRow({ ...lead, interest: lead.serviceType ?? lead.interest })),
    ...companyRequests.map((lead) => ({
      id: lead.id ?? `${lead.company}-${lead.email}`,
      createdAt: lead.createdAt ?? fallbackDate,
      status: normalizeStatus(lead.status),
      name: `${lead.contact ?? "Contacto"} · ${lead.businessName ?? lead.company ?? "Empresa"}`,
      email: lead.email ?? "",
      whatsapp: lead.whatsapp ?? "",
      commune: lead.commune ?? "",
      interest: lead.serviceType ?? lead.plan ?? "Solicitud empresa",
    })),
  ];

  if (!isAdmin) {
    if (authState === "checking" || authState === "unauthenticated") {
      return (
        <section className="panel">
          <p className="eyebrow">Acceso administrador</p>
          <h2 className="text-3xl font-black">Validando sesión...</h2>
          <p className="mt-3 font-semibold leading-7 text-muted">Te llevaremos al login si no hay una sesión activa.</p>
        </section>
      );
    }
    if (authState === "forbidden") {
      return (
        <section className="panel">
          <p className="eyebrow">Acceso administrador</p>
          <h2 className="text-3xl font-black">No autorizado</h2>
          <p className="mt-3 font-semibold leading-7 text-muted">Tu sesión no tiene rol admin. No se cargaron datos sensibles del panel.</p>
          <button className="btn-secondary mt-6" type="button" onClick={closeAdminSession}>
            Cerrar sesión
          </button>
        </section>
      );
    }
    return (
      <section className="panel">
        <p className="eyebrow">Acceso administrador</p>
        <h2 className="text-3xl font-black">Inicia sesión para gestionar OficiosPro.</h2>
        <p className="mt-3 font-semibold leading-7 text-muted">El panel administra especialistas, comisiones, créditos y publicación en marketplace.</p>
        <Link className="btn-primary mt-6" href="/login">
          Ir al login
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-[28px] border border-line bg-white p-4 shadow-soft">
          <div className="rounded-3xl bg-ink p-5 text-white">
            <span className="rounded-full bg-teal-300 px-3 py-1 text-xs font-black uppercase text-teal-950">Administrador</span>
            <h2 className="mt-4 text-2xl font-black">Backoffice OficiosPro</h2>
            <p className="mt-2 text-sm font-bold text-white/70">Panel admin</p>
            <p className="mt-1 text-sm font-black text-white">{adminSession?.email ?? "Administrador OficiosPro"}</p>
          </div>
          <nav className="mt-4 grid gap-1">
            {adminSections.map((section) => (
              <button
                key={section.id}
                id={section.id === "pendientes" ? "especialistas-pendientes" : section.id === "creditos" ? "configuracion-comercial" : section.id}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
                  activeSection === section.id ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-muted hover:bg-brand-soft hover:text-brand-dark"
                }`}
                type="button"
                aria-selected={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <section className="grid gap-5">
        {notice ? <div className="rounded-3xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark">{notice}</div> : null}

        <div className="rounded-[28px] border border-line bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Centro operativo</p>
              <h1 className="text-3xl font-black md:text-4xl">{sectionTitle(activeSection)}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary" type="button" onClick={() => void refreshLiveAdminData()}>
                Actualizar D1
              </button>
              <Link className="btn-secondary" href="/admin/leads">
                Leads D1
              </Link>
              <Link className="btn-secondary" href="/admin/crm">
                CRM D1
              </Link>
              <Link className="btn-secondary" href="/">
                Ver sitio público
              </Link>
              <Link className="btn-primary" href="/especialistas">
                Ver marketplace
              </Link>
              <button className="btn-dark" type="button" onClick={closeAdminSession}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {activeSection === "resumen" ? (
          <section className="grid gap-5">
            <LiveAdminStatusCard state={liveAdminData} />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi) => (
                <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} />
              ))}
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <Panel title="Actividad crítica" eyebrow="Hoy">
                <div className="grid gap-3">
                  <SummaryRow label="Especialistas pendientes" value={liveDataLoaded ? livePendingSpecialistLeads.length : pendingOnly.length} action={() => setActiveSection("pendientes")} />
                  <SummaryRow label="Solicitudes de clientes" value={liveDataLoaded ? liveServiceRequests.length : serviceRequests.length} action={() => setActiveSection("solicitudes")} />
                  <SummaryRow label="Cotizaciones virtuales" value={liveAdminData.overview?.pendingVirtualQuotes ?? 0} action={() => setActiveSection("cotizaciones-virtuales")} />
                  <SummaryRow label="Reviews nuevas" value={reviewRows.filter((review) => !review.reviewedByAdmin).length} action={() => setActiveSection("reviews")} />
                  <SummaryRow label="Leads comerciales" value={liveDataLoaded ? liveAdminData.leads.length : allLeads.length} action={() => setActiveSection("leads-hogar")} />
                </div>
              </Panel>
              <Panel title="Leads D1 recientes" eyebrow="Pipeline real">
                <div className="grid gap-3">
                  {liveDataLoaded && liveAdminData.leads.length ? liveAdminData.leads.slice(0, 5).map((lead) => (
                    <LiveLeadSummaryRow key={lead.id} lead={lead} />
                  )) : (
                    <EmptyState text={liveAdminData.status === "loaded" ? "No hay leads reales en D1." : "Conecta sesion admin para cargar leads reales desde D1."} />
                  )}
                  <Link className="btn-secondary justify-self-start" href="/admin/leads">
                    Abrir leads operativos
                  </Link>
                </div>
              </Panel>
              <Panel title="Cobertura nacional" eyebrow="Comunas">
                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniMetric label="Activas" value={coverage.filter((item) => item.active).length.toString()} />
                  <MiniMetric label="Prioritarias" value={coverage.filter((item) => item.priority).length.toString()} />
                  <MiniMetric label="Especialidades" value={catalog.reduce((sum, type) => sum + type.specialties.length, 0).toString()} />
                </div>
              </Panel>
            </div>
          </section>
        ) : null}

        {activeSection === "pendientes" ? (
          <Panel title="Especialistas pendientes" eyebrow="Validación">
            <div className="grid gap-3">
              {liveDataLoaded ? (
                <div className="rounded-2xl border border-brand/20 bg-brand-soft p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-brand-dark">Fuente real D1</p>
                      <p className="mt-1 text-sm font-bold text-muted">
                        {livePendingSpecialistLeads.length} postulaciones abiertas desde /api/admin/leads.
                      </p>
                    </div>
                    <Link className="btn-primary" href="/admin/leads">
                      Gestionar en Leads D1
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
                  {liveAdminData.message} Mientras tanto se muestra fallback local si existe.
                </div>
              )}
              {liveDataLoaded && livePendingSpecialistLeads.length ? livePendingSpecialistLeads.map((lead) => (
                <LiveSpecialistLeadRow key={lead.id} lead={lead} />
              )) : null}
              {pendingOnly.length ? pendingOnly.map((request) => (
                <SpecialistAdminRow
                  key={request.id ?? request.name}
                  request={request}
                  config={config}
                  onView={() => setSelectedSpecialist(request)}
                  onApprove={() => approveRequest(request.id)}
                  onReject={() => rejectRequest(request.id)}
                  onMoreInfo={() => requestMoreInfo(request.id)}
                />
              )) : <EmptyState text="Aún no hay especialistas pendientes reales. Las postulaciones aparecerán aquí cuando lleguen desde el formulario real." />}
              {rejectedOnly.length ? (
                <div className="mt-4 rounded-3xl border border-rose-100 bg-rose-50 p-4">
                  <h3 className="text-lg font-black text-rose-900">Rechazados</h3>
                  <div className="mt-3 grid gap-2">
                    {rejectedOnly.map((request) => (
                      <article key={request.id ?? request.name} className="rounded-2xl bg-white p-3 text-sm font-bold text-rose-800">
                        {request.name} · {request.commune} · {request.specialty}
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Panel>
        ) : null}

        {activeSection === "publicados" ? (
          <Panel title="Especialistas publicados" eyebrow="Marketplace">
            <div className="grid gap-3">
              <label className="field max-w-sm">
                Filtrar estado
                <select value={publishedFilter} onChange={(event) => setPublishedFilter(event.target.value as SpecialistPublicationStatus | "all")}>
                  <option value="all">Todos</option>
                  <option value="published">Publicados</option>
                  <option value="approved">Aprobados internos</option>
                  <option value="unpublished">Despublicados</option>
                  <option value="suspended">Suspendidos</option>
                  <option value="rejected">Rechazados</option>
                  <option value="deleted">Eliminados</option>
                </select>
              </label>
              {visiblePublished.map((specialist) => (
                <article key={specialist.id} className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 md:grid-cols-[1fr_auto]">
                  <div>
                    <strong>{specialist.name}</strong>
                    <p className="mt-1 text-sm font-bold text-muted">{specialist.specialty} · {specialist.commune ?? specialist.zone} · {specialist.rating}/5 · {specialist.credits} créditos</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link className="btn-secondary" href={`/especialistas/perfil?id=${encodeURIComponent(specialist.slug ?? specialist.id)}`}>Ver perfil</Link>
                    <button className="btn-secondary" type="button" onClick={() => setActiveSection("reviews")}>Ver reviews</button>
                    {specialist.publishedFromAdmin ? <button className="btn-secondary" type="button" onClick={() => editPublishedSpecialist(specialist)}>Editar</button> : null}
                    {specialist.publishedFromAdmin ? <button className="btn-secondary" type="button" onClick={() => changePublishedStatus(specialist.id, "unpublished")}>Despublicar</button> : null}
                    {specialist.publishedFromAdmin ? <button className="btn-secondary" type="button" onClick={() => changePublishedStatus(specialist.id, "suspended")}>Suspender</button> : null}
                    {specialist.publishedFromAdmin && (specialist.publicationStatus ?? specialist.status) !== "published" ? <button className="btn-secondary" type="button" onClick={() => changePublishedStatus(specialist.id, "published")}>Reactivar</button> : null}
                    {specialist.publishedFromAdmin ? <button className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-50" type="button" onClick={() => changePublishedStatus(specialist.id, "deleted")}>Eliminar</button> : null}
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        ) : null}

        {activeSection === "solicitudes" ? (
          <Panel title="Solicitudes de clientes" eyebrow="Reservas">
            <div className="grid gap-3">
              {serviceRequests.length ? serviceRequests.map((request) => (
                <ServiceRequestRow
                  key={request.id}
                  request={request}
                  note={notes[request.id] ?? ""}
                  onView={() => setSelectedRequest(request)}
                  onStatus={(status) => updateLeadStatus("serviceRequest", request.id, status)}
                  onNote={(note) => saveNote(request.id, note)}
                />
              )) : <EmptyState text="Aún no hay solicitudes de clientes." />}
            </div>
          </Panel>
        ) : null}

        {activeSection === "cotizaciones-virtuales" ? (
          <Panel title="Cotizaciones virtuales" eyebrow="Diagnostico previo">
            <div className="grid gap-4 rounded-2xl border border-brand/15 bg-brand-soft p-5">
              <div>
                <h3 className="text-xl font-black text-brand-dark">Panel interno OficiosPro</h3>
                <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-brand-dark/80">
                  Revisa solicitudes enviadas desde la bolsa, estados, urgencia, cantidad de referencias y seguimiento antes de convertirlas en reserva.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link className="btn-primary" href="/admin/virtual-quotes">
                  Abrir cotizaciones virtuales
                </Link>
                <button className="btn-secondary" type="button" onClick={() => setActiveSection("solicitudes")}>
                  Ver solicitudes de clientes
                </button>
              </div>
              <p className="text-xs font-bold leading-5 text-brand-dark/70">
                El listado real usa D1 y ADMIN_TOKEN. Este acceso no se enlaza desde navegacion publica.
              </p>
            </div>
          </Panel>
        ) : null}

        {activeSection === "reviews" ? (
          <ReviewsAdminPanel
            reviews={filteredReviewRows}
            ratingFilter={reviewRatingFilter}
            onRatingFilter={setReviewRatingFilter}
            onReviewed={markReviewReviewed}
            onHidden={toggleReviewHidden}
          />
        ) : null}

        {activeSection === "leads-hogar" ? (
          <LeadsPanel title="Leads Club Hogar" kind="home" leads={homeLeads.map(toLeadRow)} onStatus={updateLeadStatus} onExport={() => exportRows("leads-hogar.csv", homeLeads.map(toLeadRow))} />
        ) : null}

        {activeSection === "leads-empresas" ? (
          <LeadsPanel title="Leads Empresas" kind="enterprise" leads={companyLeadRows} onStatus={(_kind, id, status) => updateEnterprisePipeline(id, status)} onExport={() => exportRows("leads-empresas.csv", companyLeadRows)} />
        ) : null}

        {activeSection === "pagos" ? (
          <PaymentsAdminPanel
            payments={payments}
            subscriptions={paymentSubscriptions}
            wallet={paymentWallet}
            transactions={paymentTransactions}
            payouts={payouts}
            creditAdjustment={creditAdjustment}
            onCreditAdjustmentChange={setCreditAdjustment}
            onAddCredits={addAdminCredits}
            onRefundCredits={refundCredits}
            onSubscriptionStatus={changeSubscriptionStatus}
            onMarkPayoutPaid={paySpecialistPayout}
            onReconcile={retryPaymentReconciliation}
            onMarkReviewed={markPaymentsReviewed}
            onExportPayments={() => exportPaymentRows("pagos-creditos.csv", payments, paymentSubscriptions, paymentTransactions)}
          />
        ) : null}

        {activeSection === "finanzas" ? <AdminFinancePanel /> : null}

        {activeSection === "negociacion" ? (
          <NegotiationAdminPanel
            quotes={quoteAgreements}
            additionals={additionalRequests}
            onQuoteStatus={updateQuoteStatus}
            onQuoteNote={editQuoteMargin}
            onAdditionalStatus={updateAdditionalStatus}
          />
        ) : null}

        {activeSection === "creditos" || activeSection === "configuracion" ? (
          <Panel title="Créditos y comisiones" eyebrow="Configuración comercial">
            <div className="grid gap-4 md:grid-cols-3">
              <NumberField label="Valor de 1 crédito en CLP" name="creditValueCLP" value={config.creditValueCLP} onChange={updateConfig} />
              <NumberField label="Comisión mínima hogar futura" name="minHomeMarginCLP" value={config.minHomeMarginCLP} onChange={updateConfig} />
              <NumberField label="Comisión mínima empresa futura" name="minCompanyMarginCLP" value={config.minCompanyMarginCLP} onChange={updateConfig} />
              <NumberField label="Fee visita inicial hogar" name="homeVisitFeeCLP" value={config.homeVisitFeeCLP} onChange={updateConfig} />
              <NumberField label="Fee visita inicial empresa" name="companyVisitFeeCLP" value={config.companyVisitFeeCLP} onChange={updateConfig} />
              <NumberField label="Vencimiento créditos en meses" name="creditExpirationMonths" value={config.creditExpirationMonths} onChange={updateConfig} />
              <NumberField label="Bonificación referido cliente" name="clientReferralBonusCredits" value={config.clientReferralBonusCredits} onChange={updateConfig} />
              <label className="field md:col-span-2">
                Bonificación referido especialista
                <input value={config.specialistReferralBonus} onChange={(event) => updateReferralBonus(event.target.value)} />
              </label>
            </div>
            <div className="mt-6">
              <AdminPricingPanel />
            </div>
          </Panel>
        ) : null}

        {activeSection === "planes" ? (
          <Panel title="Planes" eyebrow="Suscripciones">
            <div className="grid gap-4">
              {plans.map((plan) => (
                <article key={plan.id} className="grid gap-4 rounded-2xl border border-line bg-slate-50 p-4 md:grid-cols-5">
                  <label className="field">
                    Nombre plan
                    <input value={plan.name} onChange={(event) => updatePlan(plan.id, { name: event.target.value })} />
                  </label>
                  <label className="field">
                    Precio mensual
                    <input type="number" value={plan.priceCLP} onChange={(event) => updatePlan(plan.id, { priceCLP: Number(event.target.value) })} />
                  </label>
                  <label className="field">
                    Créditos mensuales
                    <input type="number" value={plan.monthlyCredits} onChange={(event) => updatePlan(plan.id, { monthlyCredits: Number(event.target.value) })} />
                  </label>
                  <label className="field">
                    Descripción
                    <input value={plan.description} onChange={(event) => updatePlan(plan.id, { description: event.target.value })} />
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-sm font-black text-muted">
                    <input checked={plan.active} type="checkbox" onChange={(event) => updatePlan(plan.id, { active: event.target.checked })} />
                    Activo
                  </label>
                  <label className="field md:col-span-5">
                    Beneficios separados por coma
                    <input value={plan.benefits.join(", ")} onChange={(event) => updatePlan(plan.id, { benefits: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
                  </label>
                </article>
              ))}
            </div>
          </Panel>
        ) : null}

        {activeSection === "catalogo" ? (
          <Panel title="Catálogo de servicios" eyebrow="Tipos y especialidades" action={<button className="btn-primary" type="button" onClick={addServiceType}>Crear tipo</button>}>
            <div className="grid gap-4">
              {catalog.map((type) => (
                <article key={type.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
                    <label className="field">
                      Tipo de servicio
                      <input value={type.name} onChange={(event) => updateServiceType(type.id, { name: event.target.value })} />
                    </label>
                    <label className="field">
                      Descripción
                      <input value={type.description} onChange={(event) => updateServiceType(type.id, { description: event.target.value })} />
                    </label>
                    <label className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-sm font-black text-muted">
                      <input checked={type.active} type="checkbox" onChange={(event) => updateServiceType(type.id, { active: event.target.checked })} />
                      Activo
                    </label>
                    <button className="btn-secondary" type="button" onClick={() => addSpecialty(type.id)}>Crear especialidad</button>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {type.specialties.map((specialty) => (
                      <div key={specialty.id} className="grid gap-3 rounded-2xl bg-white p-3 xl:grid-cols-[1.2fr_0.65fr_0.65fr_0.75fr_auto]">
                        <label className="field">
                          Especialidad
                          <input value={specialty.name} onChange={(event) => updateSpecialty(type.id, specialty.id, { name: event.target.value })} />
                        </label>
                        <label className="field">
                          Créditos cliente base
                          <input type="number" value={specialty.suggestedCredits} onChange={(event) => updateSpecialty(type.id, specialty.id, { suggestedCredits: Number(event.target.value) })} />
                        </label>
                        <label className="field">
                          Comisión mínima futura
                          <input type="number" value={specialty.suggestedMinMarginCLP} onChange={(event) => updateSpecialty(type.id, specialty.id, { suggestedMinMarginCLP: Number(event.target.value) })} />
                        </label>
                        <label className="field">
                          Aplica a
                          <input value={specialty.appliesTo} onChange={(event) => updateSpecialty(type.id, specialty.id, { appliesTo: event.target.value })} />
                        </label>
                        <label className="flex items-center gap-2 text-xs font-black text-muted">
                          <input checked={specialty.active} type="checkbox" onChange={(event) => updateSpecialty(type.id, specialty.id, { active: event.target.checked })} />
                          Activa
                        </label>
                        <label className="flex items-center gap-2 text-xs font-black text-muted xl:col-span-5">
                          <input checked={specialty.requiresCertification} type="checkbox" onChange={(event) => updateSpecialty(type.id, specialty.id, { requiresCertification: event.target.checked })} />
                          Requiere certificación o validación documental
                        </label>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-6 rounded-[24px] border border-line bg-slate-50 p-5">
              <div className="mb-4">
                <p className="eyebrow">Servicios no encontrados</p>
                <h3 className="text-2xl font-black">Solicitudes para convertir en especialidad oficial</h3>
              </div>
              <div className="grid gap-3">
                {otherServiceRequests.length ? (
                  otherServiceRequests.map((request) => (
                    <article key={request.id} className="grid gap-3 rounded-2xl border border-line bg-white p-4 lg:grid-cols-[1fr_auto]">
                      <div>
                        <strong>{request.otherServiceDescription || request.need}</strong>
                        <p className="mt-2 text-sm font-bold text-muted">
                          {request.createdAt.slice(0, 10)} · {request.commune} · {serviceTypes.find((type) => type.id === request.serviceTypeId)?.name ?? request.serviceTypeId}
                        </p>
                        {request.additionalComments ? <p className="mt-2 text-sm font-semibold text-muted">{request.additionalComments}</p> : null}
                      </div>
                      <button className="btn-secondary" type="button" onClick={() => convertOtherServiceToSpecialty(request)}>
                        Convertir en especialidad
                      </button>
                    </article>
                  ))
                ) : (
                  <EmptyState text="No hay solicitudes de servicios no encontrados." />
                )}
              </div>
            </div>
          </Panel>
        ) : null}

        {activeSection === "comunas" ? (
          <Panel title="Comunas y cobertura" eyebrow="Chile">
            <div className="grid gap-2">
              {coverage.map((commune) => (
                <article key={commune.name} className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 md:grid-cols-[1fr_auto_auto]">
                  <div>
                    <strong>{commune.name}</strong>
                    <span className="ml-2 text-sm font-bold text-muted">{commune.region}</span>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-black text-muted">
                    <input checked={commune.active} type="checkbox" onChange={(event) => updateCommune(commune.name, { active: event.target.checked })} />
                    Activa
                  </label>
                  <label className="flex items-center gap-2 text-sm font-black text-muted">
                    <input checked={commune.priority} type="checkbox" onChange={(event) => updateCommune(commune.name, { priority: event.target.checked })} />
                    Prioritaria
                  </label>
                </article>
              ))}
            </div>
          </Panel>
        ) : null}

        {activeSection === "referidos" ? (
          <Panel title="Referidos" eyebrow="Crecimiento">
            <div className="grid gap-4 md:grid-cols-2">
              <MiniMetric label="Bono cliente" value={`${config.clientReferralBonusCredits} créditos`} />
              <MiniMetric label="Bono especialista" value={config.specialistReferralBonus} />
            </div>
          </Panel>
        ) : null}

        {activeSection === "seguridad" ? <SecurityChecklistPanel items={securityChecklist} /> : null}

        {selectedSpecialist ? (
          <SpecialistDetailPanel
            specialist={selectedSpecialist}
            config={config}
            onClose={() => setSelectedSpecialist(null)}
            onApprove={() => approveRequest(selectedSpecialist.id)}
            onReject={() => rejectRequest(selectedSpecialist.id)}
            onMoreInfo={() => requestMoreInfo(selectedSpecialist.id)}
            onUpdateService={updatePendingService}
            onIdentityStatus={updateIdentityReview}
            onIdentityNote={saveIdentityNote}
          />
        ) : null}

        {selectedRequest ? (
          <RequestDetailPanel
            request={selectedRequest}
            note={notes[selectedRequest.id] ?? ""}
            onClose={() => setSelectedRequest(null)}
            onStatus={(status) => updateLeadStatus("serviceRequest", selectedRequest.id, status)}
            onNote={(note) => saveNote(selectedRequest.id, note)}
          />
        ) : null}
      </section>
    </div>
  );
}

function sectionTitle(section: AdminSection) {
  return adminSections.find((item) => item.id === section)?.label ?? "Admin";
}

function normalizeStatus(status?: string): ConversionLeadStatus {
  const allowed: ConversionLeadStatus[] = ["Nuevo", "Contactado", "En proceso", "Cerrado", "Convertido", "Perdido"];
  return allowed.includes(status as ConversionLeadStatus) ? (status as ConversionLeadStatus) : "Nuevo";
}

function liveLeadValue(lead: LiveAdminLead, snakeKey: keyof LiveAdminLead, camelKey: keyof LiveAdminLead) {
  return String(lead[snakeKey] ?? lead[camelKey] ?? "").trim();
}

function liveLeadType(lead: LiveAdminLead) {
  return liveLeadValue(lead, "lead_type", "leadType");
}

function liveLeadName(lead: LiveAdminLead) {
  return liveLeadValue(lead, "full_name", "fullName") || liveLeadValue(lead, "company_name", "companyName") || "Contacto OficiosPro";
}

function liveLeadCommune(lead: LiveAdminLead) {
  return liveLeadValue(lead, "commune_name", "communeName") || "Comuna por confirmar";
}

function liveLeadCreatedAt(lead: LiveAdminLead) {
  return liveLeadValue(lead, "created_at", "createdAt");
}

function liveLeadInterest(lead: LiveAdminLead) {
  return lead.service || lead.trade || liveLeadTypeLabel(liveLeadType(lead));
}

function liveLeadTypeLabel(type: string) {
  const labels: Record<string, string> = {
    specialist_application: "Postulacion especialista",
    customer_request: "Solicitud cliente",
    booking_request: "Reserva",
    company_request: "Empresa",
    contact_message: "Contacto",
    club_hogar_interest: "Club Hogar",
    payment_interest: "Pago/creditos",
  };
  return labels[type] ?? (type || "Lead");
}

function isLiveOpenLead(lead: LiveAdminLead) {
  const status = String(lead.status ?? "").toLowerCase();
  return !["approved", "aprobado", "published", "rejected", "rechazado", "closed", "cerrado", "convertido", "perdido"].includes(status);
}

function liveAdminErrorMessage(error: string) {
  if (error === "unauthorized") return "Sesion admin no autorizada para D1. Inicia sesion real o usa ADMIN_TOKEN.";
  if (error === "admin_token_not_configured") return "ADMIN_TOKEN no esta configurado en Cloudflare.";
  if (error === "database_not_configured") return "Binding D1 DB no esta disponible en el Worker.";
  return `No pudimos leer D1: ${error}`;
}

function formatLiveLeadDate(value: string) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });
}

function LiveAdminStatusCard({ state }: { state: LiveAdminDataState }) {
  const tone =
    state.status === "loaded"
      ? "border-brand/20 bg-brand-soft text-brand-dark"
      : state.status === "loading"
        ? "border-sky-200 bg-sky-50 text-sky-900"
        : "border-amber-200 bg-amber-50 text-amber-900";
  return (
    <article className={`rounded-3xl border p-4 ${tone}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide">Fuente de datos backoffice</p>
          <p className="mt-1 text-sm font-bold">{state.message}</p>
          {state.updatedAt ? <p className="mt-1 text-xs font-bold opacity-80">Actualizado: {formatLiveLeadDate(state.updatedAt)}</p> : null}
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase shadow-sm">
          {state.status === "loaded" ? "D1 activo" : state.status === "loading" ? "Cargando" : "Fallback"}
        </span>
      </div>
    </article>
  );
}

function LiveLeadSummaryRow({ lead }: { lead: LiveAdminLead }) {
  return (
    <article className="rounded-2xl border border-line bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <strong>{liveLeadName(lead)}</strong>
        <span className="chip bg-white text-brand-dark">{liveLeadTypeLabel(liveLeadType(lead))}</span>
        <span className="chip bg-brand-soft text-brand-dark">{lead.status ?? "nuevo"}</span>
      </div>
      <p className="mt-2 text-sm font-bold text-muted">
        {liveLeadInterest(lead)} - {liveLeadCommune(lead)} - {formatLiveLeadDate(liveLeadCreatedAt(lead))}
      </p>
    </article>
  );
}

function LiveSpecialistLeadRow({ lead }: { lead: LiveAdminLead }) {
  return (
    <article className="grid gap-4 rounded-2xl border border-brand/20 bg-white p-4 xl:grid-cols-[1fr_auto]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <strong>{liveLeadName(lead)}</strong>
          <span className="chip bg-brand-soft text-brand-dark">{lead.status ?? "postulado"}</span>
          <span className="chip bg-white text-brand-dark">D1</span>
        </div>
        <p className="mt-2 text-sm font-bold text-muted">
          {lead.email || "Sin email"} - {lead.phone || "Sin telefono"} - {liveLeadCommune(lead)}
        </p>
        <p className="mt-2 text-sm font-bold text-muted">
          {liveLeadInterest(lead)} - {formatLiveLeadDate(liveLeadCreatedAt(lead))}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 xl:justify-end">
        <Link className="btn-primary" href="/admin/leads">
          Revisar en Leads D1
        </Link>
        <Link className="btn-secondary" href="/admin/crm/acquisition">
          Ver captacion
        </Link>
      </div>
    </article>
  );
}

function Panel({ eyebrow, title, action, children }: { eyebrow: string; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft" id={title.toLowerCase().replace(/\s+/g, "-")}>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="text-2xl font-black md:text-3xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
      <span className="text-sm font-black uppercase text-muted">{label}</span>
      <strong className="mt-3 block text-4xl font-black text-ink">{value}</strong>
    </article>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-line bg-slate-50 p-4">
      <span className="text-sm font-black text-muted">{label}</span>
      <strong className="mt-2 block text-xl font-black text-ink">{value}</strong>
    </article>
  );
}

function SummaryRow({ label, value, action }: { label: string; value: number; action: () => void }) {
  return (
    <button className="flex items-center justify-between rounded-2xl border border-line bg-slate-50 p-4 text-left transition hover:border-brand hover:bg-brand-soft" type="button" onClick={action}>
      <span className="font-black text-ink">{label}</span>
      <strong className="text-2xl font-black text-brand">{value}</strong>
    </button>
  );
}

function SpecialistAdminRow({
  request,
  config,
  onView,
  onApprove,
  onReject,
  onMoreInfo,
}: {
  request: PendingSpecialistProfile;
  config: CommercialConfig;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
  onMoreInfo: () => void;
}) {
  const services = request.services ?? [];
  const margin = services[0]
    ? calculateServiceEconomics({
        clientCredits: Number(services[0].clientCredits),
        specialistPayoutCLP: Number(services[0].specialistPayoutCLP),
        serviceTypeId: services[0].serviceTypeId,
        config,
      })
    : null;

  return (
    <article className="grid gap-4 rounded-2xl border border-line bg-slate-50 p-4 xl:grid-cols-[1fr_auto]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <strong>{request.name}</strong>
          <span className="chip bg-amber-50 text-amber-800">{request.status}</span>
          {margin ? <span className={`chip ${margin.status === "OK" ? "bg-brand-soft text-brand-dark" : "bg-amber-50 text-amber-800"}`}>Comisión {margin.status}</span> : null}
        </div>
        <p className="mt-2 text-sm font-bold text-muted">
          {request.rut} · {request.email} · {request.phone} · {request.commune} · {request.coverageRadiusKm} km
        </p>
        <p className="mt-2 text-sm font-bold text-muted">
          {request.typeServicio} · {request.specialty} · {services.length} servicios · {(request.references ?? []).length} referencias
        </p>
      </div>
      <div className="flex flex-wrap gap-2 xl:justify-end">
        <button className="btn-secondary" type="button" onClick={onView}>Ver detalle</button>
        <button className="btn-primary" type="button" onClick={onApprove}>Aprobar</button>
        <button className="btn-secondary" type="button" onClick={onMoreInfo}>Solicitar más información</button>
        <button className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-50" type="button" onClick={onReject}>Rechazar</button>
      </div>
    </article>
  );
}

function ServiceRequestRow({
  request,
  note,
  onView,
  onStatus,
  onNote,
}: {
  request: ServiceRequestLead;
  note: string;
  onView: () => void;
  onStatus: (status: ConversionLeadStatus) => void;
  onNote: (note: string) => void;
}) {
  return (
    <article className="grid gap-4 rounded-2xl border border-line bg-slate-50 p-4 xl:grid-cols-[1fr_auto]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <strong>{request.name}</strong>
          <span className="chip bg-brand-soft text-brand-dark">{request.status}</span>
        </div>
        <p className="mt-2 text-sm font-bold text-muted">{request.service} · {request.commune} · {request.urgency} · {request.whatsapp}</p>
        {request.additionalComments ? <p className="mt-2 rounded-2xl bg-white p-3 text-sm font-bold text-muted">Comentario: {request.additionalComments}</p> : null}
        <label className="field mt-3">
          Nota interna
          <input defaultValue={note} onBlur={(event) => onNote(event.target.value)} placeholder="Agregar nota para seguimiento" />
        </label>
      </div>
      <div className="flex flex-wrap gap-2 xl:justify-end">
        <button className="btn-secondary" type="button" onClick={onView}>Ver detalle</button>
        {(["Nuevo", "Contactado", "En proceso", "Cerrado", "Perdido"] as ConversionLeadStatus[]).map((status) => (
          <button key={status} className="rounded-2xl border border-line px-3 py-2 text-xs font-black text-muted transition hover:border-brand hover:text-brand" type="button" onClick={() => onStatus(status)}>
            {status}
          </button>
        ))}
      </div>
    </article>
  );
}

function LeadsPanel({
  title,
  kind,
  leads,
  onStatus,
  onExport,
}: {
  title: string;
  kind: ConversionLeadKind;
  leads: LeadRow[];
  onStatus: (kind: ConversionLeadKind, id: string, status: ConversionLeadStatus) => void;
  onExport: () => void;
}) {
  return (
    <Panel title={title} eyebrow="Pipeline comercial" action={<button className="btn-secondary" type="button" onClick={onExport}>Exportar CSV</button>}>
      <div className="grid gap-3">
        {leads.length ? leads.map((lead) => (
          <article key={lead.id} className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <strong>{lead.name}</strong>
                <span className="chip bg-white text-brand-dark">{lead.status}</span>
              </div>
              <p className="mt-2 text-sm font-bold text-muted">{lead.email} · {lead.whatsapp} · {lead.commune} · {lead.interest}</p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {(["Contactado", "Convertido", "Perdido"] as ConversionLeadStatus[]).map((status) => (
                <button key={status} className="rounded-2xl border border-line px-3 py-2 text-xs font-black text-muted transition hover:border-brand hover:text-brand" type="button" onClick={() => onStatus(kind, lead.id, status)}>
                  {status}
                </button>
              ))}
            </div>
          </article>
        )) : <EmptyState text="No hay leads para esta sección." />}
      </div>
    </Panel>
  );
}

function SecurityChecklistPanel({
  items,
}: {
  items: ReadonlyArray<{ label: string; status: "OK" | "Pendiente" | "Requiere atención"; detail: string }>;
}) {
  const toneByStatus = {
    OK: "bg-brand-soft text-brand-dark",
    Pendiente: "bg-amber-50 text-amber-800",
    "Requiere atención": "bg-rose-50 text-rose-800",
  };

  return (
    <Panel title="Checklist de seguridad" eyebrow="Panel interno OficiosPro">
      <div className="grid gap-3">
        {items.map((item) => (
          <article key={item.label} className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <strong>{item.label}</strong>
              <p className="mt-1 text-sm font-bold text-muted">{item.detail}</p>
            </div>
            <span className={`chip ${toneByStatus[item.status]}`}>{item.status}</span>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function ReviewsAdminPanel({
  reviews,
  ratingFilter,
  onRatingFilter,
  onReviewed,
  onHidden,
}: {
  reviews: AdminReviewRow[];
  ratingFilter: string;
  onRatingFilter: (value: string) => void;
  onReviewed: (id: string) => void;
  onHidden: (id: string) => void;
}) {
  const visibleCount = reviews.filter((review) => !review.hidden).length;
  const pendingCount = reviews.filter((review) => !review.reviewedByAdmin).length;

  return (
    <Panel title="Reviews" eyebrow="Reputacion y calidad">
      <div className="mb-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-3 sm:grid-cols-3">
          <MiniMetric label="Reviews visibles" value={visibleCount.toString()} />
          <MiniMetric label="Pendientes revision" value={pendingCount.toString()} />
          <MiniMetric label="Ocultas" value={reviews.filter((review) => review.hidden).length.toString()} />
        </div>
        <label className="field min-w-56">
          Filtrar rating
          <select value={ratingFilter} onChange={(event) => onRatingFilter(event.target.value)}>
            <option value="all">Todos</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3">
        {reviews.length ? reviews.map((review) => (
          <article key={review.id} className={`rounded-2xl border p-4 ${review.hidden ? "border-rose-100 bg-rose-50" : "border-line bg-slate-50"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <strong>{review.specialistName}</strong>
                <p className="mt-1 text-sm font-bold text-muted">{review.customerName} · {review.serviceName} · {review.comuna}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="chip bg-white text-brand-dark">{review.ratingGeneral}/5</span>
                {review.verifiedService ? <span className="chip bg-brand-soft text-brand-dark">Opinion verificada</span> : null}
                {review.reviewedByAdmin ? <span className="chip bg-white text-brand-dark">Revisada</span> : null}
                {review.hidden ? <span className="chip bg-rose-100 text-rose-800">Oculta</span> : null}
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-muted">{review.comment}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              <MiniMetric label="Puntualidad" value={review.ratingPuntualidad != null ? `${review.ratingPuntualidad}/5` : "Sin dato"} />
              <MiniMetric label="Calidad" value={review.ratingCalidad != null ? `${review.ratingCalidad}/5` : "Sin dato"} />
              <MiniMetric label="Comunicacion" value={review.ratingComunicacion != null ? `${review.ratingComunicacion}/5` : "Sin dato"} />
              <MiniMetric label="Precio" value={review.ratingPrecio != null ? `${review.ratingPrecio}/5` : "Sin dato"} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-secondary" type="button" onClick={() => onReviewed(review.id)}>
                Marcar revisada
              </button>
              <button className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-50" type="button" onClick={() => onHidden(review.id)}>
                {review.hidden ? "Mostrar review" : "Ocultar review"}
              </button>
            </div>
          </article>
        )) : <EmptyState text="No hay reviews con ese filtro." />}
      </div>
    </Panel>
  );
}

type LeadRow = {
  id: string;
  createdAt: string;
  status: ConversionLeadStatus;
  name: string;
  email: string;
  whatsapp: string;
  commune: string;
  interest: string;
};

function toLeadRow(lead: HomeLead | EnterpriseLead | SpecialistLead): LeadRow {
  return {
    id: lead.id,
    createdAt: lead.createdAt,
    status: lead.status,
    name: lead.name,
    email: lead.email,
    whatsapp: "whatsapp" in lead ? lead.whatsapp : lead.phone,
    commune: lead.commune,
    interest: lead.interest,
  };
}

function NegotiationAdminPanel({
  quotes,
  additionals,
  onQuoteStatus,
  onQuoteNote,
  onAdditionalStatus,
}: {
  quotes: QuoteAgreement[];
  additionals: AdditionalRequest[];
  onQuoteStatus: (id: string, status: QuoteAgreement["status"], message: string) => void;
  onQuoteNote: (id: string, note: string) => void;
  onAdditionalStatus: (id: string, status: AdditionalRequest["status"], message: string) => void;
}) {
  const lowCommissionQuotes = quotes.filter((quote) => (quote.proposal?.platformMarginCredits ?? 0) > 0 && (quote.proposal?.platformMarginCredits ?? 0) < 10);
  return (
    <Panel title="Tarifas, cotizaciones y negociación" eyebrow="Adicionales y acuerdo">
      <div className="grid gap-4 md:grid-cols-4">
        <MiniMetric label="Servicios precio fijo" value={specialists.flatMap((item) => item.servicePricing ?? []).filter((service) => service.pricingMode === "fixed").length.toString()} />
        <MiniMetric label="Servicios por hora" value={specialists.flatMap((item) => item.servicePricing ?? []).filter((service) => service.pricingMode === "hourly").length.toString()} />
        <MiniMetric label="Requieren cotización" value={specialists.flatMap((item) => item.servicePricing ?? []).filter((service) => service.pricingMode === "quote_required" || service.pricingMode === "visit_then_quote").length.toString()} />
        <MiniMetric label="Comisiones bajas" value={lowCommissionQuotes.length.toString()} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <article className="rounded-[24px] border border-line bg-slate-50 p-5">
          <h3 className="text-xl font-black">Propuestas pendientes</h3>
          <div className="mt-4 grid gap-3">
            {quotes.map((quote) => (
              <div key={quote.id} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{quote.serviceName}</strong>
                  <span className="chip bg-brand-soft text-brand-dark">{quoteStatusLabels[quote.status]}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-muted">{quote.customerName} · {quote.specialistName} · {quote.commune}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">{quote.proposal?.description ?? quote.originalRequest}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <InfoBox label="Total créditos" value={`${quoteTotalCredits(quote) || "por definir"}`} />
                  <InfoBox label="Pago especialista" value={`${quote.proposal?.specialistPayoutCredits ?? "pendiente"} cr`} />
                  <InfoBox label="Comisión OficiosPro" value={`${quote.proposal?.platformMarginCredits ?? "pendiente"} cr`} />
                </div>
                <label className="field mt-3">
                  Nota interna o ajuste recomendado
                  <input defaultValue={quote.platformNote ?? ""} onBlur={(event) => onQuoteNote(quote.id, event.target.value)} />
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-secondary" type="button" onClick={() => onQuoteStatus(quote.id, "accepted", "Propuesta aprobada por OficiosPro.")}>
                    Aprobar propuesta
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => onQuoteStatus(quote.id, "rejected", "Propuesta marcada como abusiva o rechazada.")}>
                    Rechazar propuesta
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => onQuoteStatus(quote.id, "specialist_reviewing", "OficiosPro solicito ajuste al especialista.")}>
                    Solicitar ajuste
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => onQuoteStatus(quote.id, "converted_to_service", "Cotización aceptada convertida en servicio activo.")}>
                    Convertir en servicio
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-line bg-white p-5 shadow-sm">
          <h3 className="text-xl font-black">Adicionales pendientes</h3>
          <div className="mt-4 grid gap-3">
            {additionals.map((additional) => (
              <div key={additional.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{additionalTypeLabels[additional.type]}</strong>
                  <span className="chip bg-white text-brand-dark">{additional.status}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-muted">{additional.customerName} · {additional.specialistName} · {additional.requestedCredits} créditos</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">{additional.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-secondary" type="button" onClick={() => onAdditionalStatus(additional.id, "approved", "Adicional aprobado por administracion.")}>
                    Aprobar
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => onAdditionalStatus(additional.id, "rejected", "Adicional rechazado por administracion.")}>
                    Rechazar
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => onAdditionalStatus(additional.id, "clarification_requested", "OficiosPro pidio aclaracion del adicional.")}>
                    Pedir aclaración
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </Panel>
  );
}

function PaymentsAdminPanel({
  payments,
  subscriptions,
  wallet,
  transactions,
  payouts,
  creditAdjustment,
  onCreditAdjustmentChange,
  onAddCredits,
  onRefundCredits,
  onSubscriptionStatus,
  onMarkPayoutPaid,
  onReconcile,
  onMarkReviewed,
  onExportPayments,
}: {
  payments: PaymentRecord[];
  subscriptions: PaymentSubscriptionRecord[];
  wallet: PaymentCreditWallet;
  transactions: PaymentCreditTransaction[];
  payouts: SpecialistPayout[];
  creditAdjustment: number;
  onCreditAdjustmentChange: (amount: number) => void;
  onAddCredits: () => void;
  onRefundCredits: () => void;
  onSubscriptionStatus: (id: string, status: PaymentSubscriptionStatus) => void;
  onMarkPayoutPaid: (id: string) => void;
  onReconcile: () => void;
  onMarkReviewed: () => void;
  onExportPayments: () => void;
}) {
  const approvedPayments = payments.filter((payment) => payment.status === "approved");
  const pendingPayments = payments.filter((payment) => payment.status === "pending" || payment.status === "preparing");
  const rejectedPayments = payments.filter((payment) => ["rejected", "failed", "chargeback"].includes(payment.status));
  const failedSubscriptions = subscriptions.filter((subscription) => subscription.status === "failed_payment");
  const issuedCredits = transactions.filter((transaction) => transaction.amount > 0).reduce((sum, transaction) => sum + transaction.amount, 0);
  const usedCredits = transactions.filter((transaction) => transaction.amount < 0).reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const heldCredits = transactions
    .filter((transaction) => transaction.type === "service_hold" || transaction.type.endsWith("_hold"))
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const releasedCredits = transactions
    .filter((transaction) => transaction.type === "service_capture" || transaction.type.endsWith("_capture") || transaction.type === "refund")
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const paymentsWithoutWebhook = payments.filter((payment) => (payment.status === "pending" || payment.status === "preparing") && !payment.mercadoPagoPaymentId).length;
  const providerErrors = rejectedPayments.length + failedSubscriptions.length;
  const usedProviders = Array.from(new Set(payments.map((payment) => normalizePaymentProviderName(payment.provider))));
  const pendingPayouts = payouts.filter((payout) => payout.status !== "pagado");
  const estimatedCommission = payouts.reduce((sum, payout) => sum + payout.platformMarginCLP, 0);

  return (
    <Panel title="Pagos y créditos" eyebrow="Operación global">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="Pagos pendientes" value={pendingPayments.length.toString()} />
        <MiniMetric label="Pagos aprobados" value={approvedPayments.length.toString()} />
        <MiniMetric label="Pagos rechazados" value={rejectedPayments.length.toString()} />
        <MiniMetric label="Errores proveedor" value={providerErrors.toString()} />
        <MiniMetric label="Créditos emitidos" value={issuedCredits.toString()} />
        <MiniMetric label="Créditos retenidos" value={(wallet.heldCredits ?? heldCredits).toString()} />
        <MiniMetric label="Créditos liberados" value={releasedCredits.toString()} />
        <MiniMetric label="Pagos sin webhook" value={paymentsWithoutWebhook.toString()} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[24px] border border-line bg-slate-50 p-5">
          <p className="eyebrow">Proveedor usado</p>
          <h3 className="text-xl font-black">{usedProviders.length ? usedProviders.join(" + ") : "Mercado Pago"}</h3>
          <p className="mt-2 text-sm font-bold text-muted">
            Comercio {oficiosProMerchant.tradeName} · RUT {oficiosProMerchant.rut}. Los montos se concilian contra PaymentIntent y catálogo interno antes de emitir créditos.
          </p>
          <div className="mt-4 grid gap-2">
            {paymentProviders.map((provider) => (
              <div key={provider.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-white p-3">
                <strong>{provider.label}</strong>
                <span className={`chip ${provider.enabled ? "bg-brand-soft text-brand-dark" : "bg-white text-muted"}`}>{provider.enabled ? "activo" : "preparado"}</span>
                <p className="w-full text-xs font-bold text-muted">{provider.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-line bg-white p-5 shadow-sm">
          <p className="eyebrow">Conciliación manual</p>
          <h3 className="text-xl font-black">Control operacional</h3>
          <div className="mt-4 grid gap-2">
            <MiniMetric label="Pagos recientes" value={payments.length.toString()} />
            <MiniMetric label="Créditos usados" value={usedCredits.toString()} />
            <MiniMetric label="Saldo usuario" value={`${wallet.currentBalance} créditos`} />
            <MiniMetric label="Liquidaciones pendientes" value={pendingPayouts.length.toString()} />
            <MiniMetric label="Comisión OficiosPro" value={formatCLP(estimatedCommission)} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-secondary" type="button" onClick={onReconcile}>
              Reintentar conciliación
            </button>
            <button className="btn-secondary" type="button" onClick={onMarkReviewed}>
              Marcar revisado
            </button>
            <button className="btn-secondary" type="button" onClick={onExportPayments}>
              Exportar CSV
            </button>
          </div>
        </article>
      </div>

      <div className="mt-5">
        <AdminCreditLedgerPreview />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-[24px] border border-line bg-slate-50 p-5">
          <h3 className="text-xl font-black">Ajuste de wallet</h3>
          <p className="mt-2 text-sm font-bold text-muted">Administra ajustes, reembolsos y correcciones de créditos.</p>
          <label className="field mt-4">
            Cantidad de créditos
            <input min="2" step="2" type="number" value={creditAdjustment} onChange={(event) => onCreditAdjustmentChange(Number(event.target.value))} />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary" type="button" onClick={onAddCredits}>
              Ajustar saldo
            </button>
            <button className="btn-secondary" type="button" onClick={onRefundCredits}>
              Reembolsar créditos
            </button>
          </div>
        </article>

        <article className="rounded-[24px] border border-line bg-white p-5 shadow-sm">
          <h3 className="text-xl font-black">Usuarios con saldo alto</h3>
          <div className="mt-4 rounded-2xl border border-line bg-slate-50 p-4">
            <strong>{wallet.userId}</strong>
            <p className="mt-1 text-sm font-bold text-muted">{wallet.currentBalance} créditos disponibles · actualización {new Date(wallet.updatedAt).toLocaleDateString("es-CL")}</p>
          </div>
        </article>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <article className="rounded-[24px] border border-line bg-white p-5 shadow-sm">
          <h3 className="text-xl font-black">Pagos recientes</h3>
          <div className="mt-4 grid gap-3">
            {payments.length ? (
              payments.map((payment) => (
                <div key={payment.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{payment.planName ?? payment.type}</strong>
                    <span className="chip bg-brand-soft text-brand-dark">{payment.status}</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-muted">
                    {payment.payerEmail} · {formatCLP(payment.amountCLP)} · {payment.credits} créditos
                  </p>
                  <p className="mt-2 text-xs font-bold text-muted">
                    Proveedor {normalizePaymentProviderName(payment.provider)} · {payment.mercadoPagoPaymentId ? `pago ${payment.mercadoPagoPaymentId}` : "webhook pendiente"} · intent {payment.mercadoPagoPreferenceId ?? payment.mercadoPagoPreapprovalId ?? payment.id}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState text="Aún no hay pagos registrados." />
            )}
          </div>
        </article>

        <article className="rounded-[24px] border border-line bg-white p-5 shadow-sm">
          <h3 className="text-xl font-black">Suscripciones</h3>
          <div className="mt-4 grid gap-3">
            {subscriptions.length ? (
              subscriptions.map((subscription) => (
                <div key={subscription.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{subscription.planName}</strong>
                    <span className="chip bg-white text-brand-dark">{subscription.status}</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-muted">
                    {formatCLP(subscription.amountCLP)} · {subscription.creditsPerMonth} créditos/mes · próximo cobro {new Date(subscription.nextBillingDate).toLocaleDateString("es-CL")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="rounded-2xl border border-line px-3 py-2 text-xs font-black text-muted transition hover:border-brand hover:text-brand" type="button" onClick={() => onSubscriptionStatus(subscription.id, "paused")}>
                      Pausar
                    </button>
                    <button className="rounded-2xl border border-line px-3 py-2 text-xs font-black text-muted transition hover:border-brand hover:text-brand" type="button" onClick={() => onSubscriptionStatus(subscription.id, "cancelled")}>
                      Cancelar
                    </button>
                    <button className="rounded-2xl border border-line px-3 py-2 text-xs font-black text-muted transition hover:border-brand hover:text-brand" type="button" onClick={() => onSubscriptionStatus(subscription.id, "active")}>
                      Activar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="Aún no hay suscripciones registradas." />
            )}
          </div>
        </article>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <article className="rounded-[24px] border border-line bg-white p-5 shadow-sm">
          <h3 className="text-xl font-black">Historial de créditos</h3>
          <div className="mt-4 grid gap-3">
            {transactions.slice(0, 8).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-slate-50 p-4">
                <div>
                  <strong>{transaction.detail}</strong>
                  <p className="mt-1 text-sm font-bold text-muted">{transaction.type} · {new Date(transaction.createdAt).toLocaleDateString("es-CL")}</p>
                </div>
                <span className={`text-lg font-black ${transaction.amount >= 0 ? "text-brand" : "text-rose-700"}`}>
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-line bg-white p-5 shadow-sm">
          <h3 className="text-xl font-black">Liquidaciones especialistas</h3>
          <div className="mt-4 grid gap-3">
            {payouts.map((payout) => (
              <div key={payout.id} className="rounded-2xl border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{payout.specialistName}</strong>
                  <span className="chip bg-white text-brand-dark">{payout.status}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-muted">
                  {payout.serviceName} - cliente {formatCLP(payout.customerChargeCLP)} - especialista {formatCLP(payout.specialistPayoutCLP)} - comisión {formatCLP(payout.platformMarginCLP)}
                </p>
                {payout.status !== "pagado" ? (
                  <button className="btn-secondary mt-3" type="button" onClick={() => onMarkPayoutPaid(payout.id)}>
                    Marcar como pagada
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      </div>
    </Panel>
  );
}

function SpecialistDetailPanel({
  specialist,
  config,
  onClose,
  onApprove,
  onReject,
  onMoreInfo,
  onUpdateService,
  onIdentityStatus,
  onIdentityNote,
}: {
  specialist: PendingSpecialistProfile;
  config: CommercialConfig;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onMoreInfo: () => void;
  onUpdateService: (index: number, patch: Partial<PendingSpecialistService>) => void;
  onIdentityStatus: (status: "approved" | "rejected" | "needs_review", note?: string) => void;
  onIdentityNote: (note: string) => void;
}) {
  const identity = specialist.identityVerification;
  const readiness = specialistPublicationReadiness(specialist);
  return (
    <div className="fixed inset-0 z-[90] bg-ink/60 p-4 backdrop-blur-sm">
      <aside className="ml-auto h-full max-w-3xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Detalle especialista</p>
            <h2 className="text-3xl font-black">{specialist.name}</h2>
            <p className="mt-2 text-sm font-bold text-muted">{specialist.rut} · {specialist.email} · {specialist.phone}</p>
          </div>
          <button className="btn-secondary" type="button" onClick={onClose}>Cerrar</button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <InfoBox label="Foto" value={specialist.profilePhoto || "pendiente"} />
          <InfoBox label="Comuna y radio" value={`${specialist.commune} · ${specialist.coverageRadiusKm} km`} />
          <InfoBox label="Dirección base" value={specialist.address} />
          <InfoBox label="Certificaciones" value={(specialist.certifications ?? []).join(", ") || "sin declarar"} />
        </div>
        <div className="mt-5 rounded-3xl border border-line bg-slate-50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Verificación de identidad</p>
              <h3 className="text-xl font-black">Documentos privados</h3>
              <p className="mt-2 text-sm font-bold text-muted">
                {identity?.identityStorageStatus === "stored_private"
                  ? "Documentos almacenados en storage privado."
                  : "Documentos pendientes de almacenamiento seguro. No se muestran imágenes sensibles en el panel."}
              </p>
            </div>
            <span className="chip bg-white text-brand-dark">{identity?.verificationStatus ?? "pending"}</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <IdentityDocumentBox label="Foto perfil" src={identity?.profilePhotoUrl || specialist.profilePhoto} name={identity?.profilePhotoName} />
            <IdentityDocumentBox label="Cédula frontal" src={identity?.idFrontUrl} name={identity?.idFrontName} privateDocument />
            <IdentityDocumentBox label="Cédula reverso" src={identity?.idBackUrl} name={identity?.idBackName} privateDocument />
            <IdentityDocumentBox label="Selfie" src={identity?.selfieUrl} name={identity?.selfieName} privateDocument />
          </div>
          <label className="field mt-4">
            Nota interna de identidad
            <textarea defaultValue={identity?.notes ?? ""} onBlur={(event) => onIdentityNote(event.target.value)} placeholder="Observaciones de revisión documental." />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-secondary" type="button" onClick={() => onIdentityStatus("approved")}>Aprobar identidad</button>
            <button className="btn-secondary" type="button" onClick={() => onIdentityStatus("needs_review")}>Solicitar nueva foto</button>
            <button className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-50" type="button" onClick={() => onIdentityStatus("rejected")}>Rechazar identidad</button>
          </div>
          {!readiness.ok ? <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-black text-amber-900">No se puede publicar este especialista hasta completar verificación de identidad y referencias. Faltan: {readiness.missing.join(", ")}</p> : null}
        </div>
        <div className="mt-5 grid gap-4">
          <h3 className="text-xl font-black">Servicios ofrecidos</h3>
          {(specialist.services ?? []).map((service, index) => {
            const expectedPayout = Number(service.specialistExpectedPayoutCLP ?? service.specialistPayoutCLP ?? 0);
            const calculatedClientCredits = Number(service.clientCredits || calculateClientCreditsFromSpecialistPayout({
              specialistExpectedPayoutCLP: expectedPayout,
              categoryId: service.serviceTypeId,
              emergency: service.emergency,
              config: defaultPricingConfig,
            }));
            const estimatedClientPrice = estimateClientPriceCLP({
              specialistExpectedPayoutCLP: expectedPayout,
              categoryId: service.serviceTypeId,
              emergency: service.emergency,
              config: defaultPricingConfig,
            });
            const estimatedCommission = estimatePlatformMarginCLP({
              specialistExpectedPayoutCLP: expectedPayout,
              categoryId: service.serviceTypeId,
              emergency: service.emergency,
              config: defaultPricingConfig,
            });
            const economics = calculateServiceEconomics({
              clientCredits: calculatedClientCredits,
              specialistPayoutCLP: expectedPayout,
              serviceTypeId: service.serviceTypeId,
              config,
            });
            return (
              <article key={`${service.name}-${index}`} className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 md:grid-cols-2">
                <InfoBox label="Servicio" value={service.name || service.specialty} />
                <InfoBox label="Categoria" value={service.serviceTypeId} />
                <InfoBox label="Especialidad" value={service.isOtherService ? service.otherServiceDescription ?? service.specialty : service.specialty} />
                <InfoBox label="Modalidad" value={service.pricingMode ?? "fixed"} />
                <InfoBox label="Estado servicio" value={service.active === false ? "Pausado" : service.pricingStatus ?? "pending_review"} />
                <InfoBox label="Cotización" value={service.pricingMode === "quote_required" || service.requiresPriorEvaluation ? "Requiere evaluacion" : "No requiere cotización previa"} />
                <InfoBox label="Tarifa esperada especialista CLP" value={formatPricingCLP(expectedPayout)} />
                <InfoBox label="Créditos cliente calculados" value={`${calculatedClientCredits} créditos`} />
                <InfoBox label="Precio cliente CLP estimado interno" value={formatPricingCLP(estimatedClientPrice)} />
                <InfoBox label="Comisión OficiosPro estimada" value={`${formatPricingCLP(estimatedCommission)} - ${economics.status}`} />
                <label className="field">
                  Créditos cliente
                  <input type="number" value={calculatedClientCredits} onChange={(event) => onUpdateService(index, { clientCredits: Number(event.target.value), pricingStatus: "adjusted_by_oficiospro" })} />
                </label>
                <label className="field">
                  Payout especialista aprobado CLP
                  <input type="number" value={Number(service.specialistApprovedPayoutCLP ?? expectedPayout)} onChange={(event) => onUpdateService(index, { specialistApprovedPayoutCLP: Number(event.target.value), specialistPayoutCLP: Number(event.target.value), pricingStatus: "adjusted_by_oficiospro" })} />
                </label>
                <div className="flex flex-wrap gap-2 md:col-span-2">
                  <button className="btn-secondary" type="button" onClick={() => onUpdateService(index, { pricingStatus: "approved", active: true })}>
                    Aprobar servicio
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => onUpdateService(index, { pricingStatus: "pending_review", active: true })}>
                    Dejar en revision
                  </button>
                  <button className="rounded-2xl border border-amber-200 px-4 py-3 text-sm font-black text-amber-800 transition hover:bg-amber-50" type="button" onClick={() => onUpdateService(index, { active: false, pricingStatus: "pending_review" })}>
                    Pausar servicio
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Panel title="Referencias laborales" eyebrow="Validación">
            <div className="grid gap-2">
              {(specialist.references ?? []).map((reference) => (
                <p key={`${reference.name}-${reference.phone}`} className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-muted">
                  {reference.name} · {reference.company} · {reference.phone} · {reference.work}
                </p>
              ))}
            </div>
          </Panel>
          <Panel title="Portafolio" eyebrow="Evidencia">
            <div className="grid gap-2">
              {(specialist.portfolioPhotos ?? []).map((photo) => (
                <span key={photo} className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-muted">{photo}</span>
              ))}
            </div>
          </Panel>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="btn-primary" type="button" onClick={onApprove}>Aprobar y publicar</button>
          <button className="btn-secondary" type="button" onClick={onMoreInfo}>Solicitar más información</button>
          <button className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-50" type="button" onClick={onReject}>Rechazar</button>
        </div>
      </aside>
    </div>
  );
}

function RequestDetailPanel({
  request,
  note,
  onClose,
  onStatus,
  onNote,
}: {
  request: ServiceRequestLead;
  note: string;
  onClose: () => void;
  onStatus: (status: ConversionLeadStatus) => void;
  onNote: (note: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] bg-ink/60 p-4 backdrop-blur-sm">
      <aside className="ml-auto h-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Solicitud cliente</p>
            <h2 className="text-3xl font-black">{request.name}</h2>
            <p className="mt-2 text-sm font-bold text-muted">{request.rut ?? "RUT sin informar"} · {request.email} · {request.whatsapp}</p>
          </div>
          <button className="btn-secondary" type="button" onClick={onClose}>Cerrar</button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <InfoBox label="Comuna" value={request.commune} />
          <InfoBox label="Servicio solicitado" value={request.service} />
          <InfoBox label="Urgencia" value={request.urgency} />
          <InfoBox label="Especialista" value={request.specialistName ?? "Red OficiosPro"} />
        </div>
        <div className="mt-5 rounded-2xl border border-line bg-slate-50 p-4">
          <strong>Comentario libre</strong>
          <p className="mt-2 text-sm font-bold text-muted">{request.additionalComments || request.otherServiceDescription || "Sin comentarios adicionales."}</p>
        </div>
        <label className="field mt-5">
          Nota interna
          <textarea defaultValue={note} onBlur={(event) => onNote(event.target.value)} placeholder="Seguimiento, coordinación o acuerdos internos." />
        </label>
        <div className="mt-5 flex flex-wrap gap-2">
          {(["Nuevo", "Contactado", "En proceso", "Cerrado", "Perdido"] as ConversionLeadStatus[]).map((status) => (
            <button key={status} className="rounded-2xl border border-line px-4 py-3 text-sm font-black text-muted transition hover:border-brand hover:text-brand" type="button" onClick={() => onStatus(status)}>
              {status}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-slate-50 p-4">
      <span className="text-xs font-black uppercase text-muted">{label}</span>
      <strong className="mt-2 block text-sm font-black text-ink">{value}</strong>
    </div>
  );
}

function IdentityDocumentBox({ label, src, name, privateDocument = false }: { label: string; src?: string; name?: string; privateDocument?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3">
      <span className="text-xs font-black uppercase text-muted">{label}</span>
      {src && !privateDocument ? (
        <img src={src} alt={label} className="mt-2 h-28 w-full rounded-xl object-cover" />
      ) : (
        <div className="mt-2 grid h-28 place-items-center rounded-xl bg-slate-100 p-2 text-center text-xs font-bold text-muted">
          {privateDocument ? "Privado: revisar solo en storage seguro" : "Pendiente"}
        </div>
      )}
      <strong className="mt-2 block break-words text-xs text-ink">{name || (src ? "Archivo cargado" : "Sin archivo")}</strong>
    </div>
  );
}

function NumberField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: NumericConfigKey;
  value: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="field">
      {label}
      <input name={name} type="number" value={value} onChange={onChange} />
    </label>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-2xl border border-line bg-slate-50 p-5 text-sm font-bold text-muted">{text}</p>;
}

function normalizePaymentProviderName(provider?: string) {
  const normalized = provider === "mercadopago" ? "mercado_pago" : provider;
  return paymentProviders.find((item) => item.id === normalized)?.label ?? provider ?? "Sin proveedor";
}

function exportRows(filename: string, rows: LeadRow[]) {
  if (typeof window === "undefined") return;
  const headers = ["Fecha", "Nombre", "Email", "WhatsApp", "Comuna", "Interés", "Estado"];
  const body = rows.map((row) =>
    [row.createdAt, row.name, row.email, row.whatsapp, row.commune, row.interest, row.status]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(","),
  );
  const blob = new Blob([[headers.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function exportPaymentRows(
  filename: string,
  payments: PaymentRecord[],
  subscriptions: PaymentSubscriptionRecord[],
  transactions: PaymentCreditTransaction[],
) {
  if (typeof window === "undefined") return;
  const rows = [
    ["tipo", "id", "fecha", "proveedor", "estado", "email_usuario", "monto_clp", "creditos", "detalle"],
    ...payments.map((payment) => [
      "pago",
      payment.id,
      payment.createdAt,
      normalizePaymentProviderName(payment.provider),
      payment.status,
      payment.payerEmail,
      String(payment.amountCLP),
      String(payment.credits),
      payment.planName ?? payment.type,
    ]),
    ...subscriptions.map((subscription) => [
      "suscripcion",
      subscription.id,
      subscription.createdAt,
      normalizePaymentProviderName(subscription.provider),
      subscription.status,
      subscription.userId,
      String(subscription.amountCLP),
      String(subscription.creditsPerMonth),
      subscription.planName,
    ]),
    ...transactions.map((transaction) => [
      "ledger",
      transaction.id,
      transaction.createdAt,
      "OficiosPro",
      transaction.type,
      transaction.userId,
      "",
      String(transaction.amount),
      transaction.detail,
    ]),
  ];
  const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
