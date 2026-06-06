"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { defaultBookings, specialists } from "@/data/mock";
import {
  calculateServiceEconomics,
  formatCLP,
  serviceTypes,
  subscriptionPlans,
  type CommercialConfig,
  type SubscriptionPlan,
} from "@/data/marketplace";
import { communeOptions } from "@/lib/catalog";
import {
  addPaymentCredits,
  approveAndPublishSpecialist,
  clearMockSession,
  getCommercialConfig,
  getEnterpriseLeads,
  getHomeLeads,
  getMockSession,
  getPaymentCreditTransactions,
  getPaymentCreditWallet,
  getPaymentRecords,
  getPaymentSubscriptions,
  getPendingSpecialists,
  getPublishedSpecialists,
  getQuickSearchLeads,
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
  updatePaymentSubscriptionStatus,
  usePaymentCredits,
  updateConversionLeadStatus,
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
  | "leads-hogar"
  | "leads-empresas"
  | "pagos"
  | "catalogo"
  | "comunas"
  | "creditos"
  | "planes"
  | "referidos"
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

const adminSections: { id: AdminSection; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "pendientes", label: "Especialistas pendientes" },
  { id: "publicados", label: "Especialistas publicados" },
  { id: "solicitudes", label: "Solicitudes de clientes" },
  { id: "leads-hogar", label: "Leads Club Hogar" },
  { id: "leads-empresas", label: "Leads Empresas" },
  { id: "pagos", label: "Pagos y créditos" },
  { id: "catalogo", label: "Catálogo de servicios" },
  { id: "comunas", label: "Comunas y cobertura" },
  { id: "creditos", label: "Créditos y márgenes" },
  { id: "planes", label: "Planes" },
  { id: "referidos", label: "Referidos" },
  { id: "configuracion", label: "Configuración" },
];

const adminKeys = {
  plans: "oficiospro.adminPlans",
  catalog: "oficiospro.adminCatalog",
  communes: "oficiospro.adminCommunes",
  leadNotes: "oficiospro.adminLeadNotes",
};
const fallbackDate = "1970-01-01T00:00:00.000Z";

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
  const [publishedSpecialists, setPublishedSpecialists] = useState(getPublishedSpecialists());
  const [companyRequests, setCompanyRequests] = useState<CompanyRequest[]>([]);
  const [homeLeads, setHomeLeads] = useState<HomeLead[]>([]);
  const [enterpriseLeads, setEnterpriseLeads] = useState<EnterpriseLead[]>([]);
  const [specialistLeads, setSpecialistLeads] = useState<SpecialistLead[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestLead[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentSubscriptions, setPaymentSubscriptions] = useState<PaymentSubscriptionRecord[]>([]);
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentCreditTransaction[]>([]);
  const [paymentWallet, setPaymentWallet] = useState<PaymentCreditWallet>(getPaymentCreditWallet());
  const [payouts, setPayouts] = useState<SpecialistPayout[]>([]);
  const [creditAdjustment, setCreditAdjustment] = useState(10);
  const [otherServiceRequests, setOtherServiceRequests] = useState<QuickSearchLead[]>([]);
  const [config, setConfig] = useState<CommercialConfig>(getCommercialConfig());
  const [plans, setPlans] = useState<AdminPlan[]>(defaultPlans());
  const [catalog, setCatalog] = useState<EditableServiceType[]>(defaultCatalog());
  const [coverage, setCoverage] = useState<CoverageCommune[]>(defaultCommunes());
  const [notes, setNotes] = useState<LeadNoteMap>({});
  const [selectedSpecialist, setSelectedSpecialist] = useState<PendingSpecialistProfile | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestLead | null>(null);
  const [notice, setNotice] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSession, setAdminSession] = useState<MockSession | null>(null);

  useEffect(() => {
    seedMockState();
    const session = getMockSession();
    setAdminSession(session);
    setIsAdmin(session?.role === "admin");
    refresh();
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
      };
      if (map[hash]) setActiveSection(map[hash]);
    }

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  function refresh() {
    setPendingSpecialists(getPendingSpecialists());
    setPublishedSpecialists(getPublishedSpecialists());
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
    setOtherServiceRequests(getQuickSearchLeads().filter((request) => request.isOtherService));
    setConfig(getCommercialConfig());
  }

  const approvedBase = specialists.filter((specialist) => specialist.verified !== false);
  const visiblePublished = [...approvedBase, ...publishedSpecialists];
  const pendingOnly = pendingSpecialists.filter((item) => item.status === "pendiente" || item.status === "info solicitada");
  const rejectedOnly = pendingSpecialists.filter((item) => item.status === "rechazado");
  const estimatedMargin = serviceRequests.reduce((sum, request) => sum + (request.estimatedCredits ?? 0) * config.creditValueCLP * 0.35, 0);
  const kpis = [
    { label: "Especialistas pendientes", value: pendingOnly.length.toString() },
    { label: "Especialistas aprobados", value: visiblePublished.length.toString() },
    { label: "Solicitudes nuevas", value: serviceRequests.filter((item) => item.status === "Nuevo").length.toString() },
    { label: "Leads hogar", value: homeLeads.length.toString() },
    { label: "Leads empresa", value: (enterpriseLeads.length + companyRequests.length).toString() },
    { label: "Pagos recientes", value: payments.length.toString() },
    { label: "Liquidaciones pendientes", value: payouts.filter((item) => item.status !== "pagado").length.toString() },
    { label: "Créditos vendidos", value: String(defaultBookings.reduce((sum, booking) => sum + booking.credits, 0)) },
    { label: "Margen estimado", value: formatCLP(Math.round(estimatedMargin)) },
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
    approveAndPublishSpecialist(id);
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

  function paySpecialistPayout(id: string) {
    markSpecialistPayoutPaid(id);
    refreshPaymentState();
    setNotice("Liquidación marcada como pagada.");
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
    return (
      <section className="panel">
        <p className="eyebrow">Acceso administrador</p>
        <h2 className="text-3xl font-black">Inicia sesión para gestionar OficiosPro.</h2>
        <p className="mt-3 font-semibold leading-7 text-muted">El panel administra especialistas, márgenes, créditos y publicación en marketplace.</p>
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
            <p className="mt-1 text-sm font-black text-white">{adminSession?.email ?? "admin@oficiospro.cl"}</p>
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi) => (
                <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} />
              ))}
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <Panel title="Actividad crítica" eyebrow="Hoy">
                <div className="grid gap-3">
                  <SummaryRow label="Especialistas pendientes" value={pendingOnly.length} action={() => setActiveSection("pendientes")} />
                  <SummaryRow label="Solicitudes de clientes" value={serviceRequests.length} action={() => setActiveSection("solicitudes")} />
                  <SummaryRow label="Leads comerciales" value={allLeads.length} action={() => setActiveSection("leads-hogar")} />
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
              )) : <EmptyState text="No hay especialistas pendientes por revisar." />}
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
              {visiblePublished.map((specialist) => (
                <article key={specialist.id} className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 md:grid-cols-[1fr_auto]">
                  <div>
                    <strong>{specialist.name}</strong>
                    <p className="mt-1 text-sm font-bold text-muted">{specialist.specialty} · {specialist.commune ?? specialist.zone} · {specialist.rating}/5 · {specialist.credits} créditos</p>
                  </div>
                  <Link className="btn-secondary" href={`/especialistas/${specialist.id}`}>Ver perfil</Link>
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
          />
        ) : null}

        {activeSection === "creditos" || activeSection === "configuracion" ? (
          <Panel title="Créditos y márgenes" eyebrow="Configuración comercial">
            <div className="grid gap-4 md:grid-cols-3">
              <NumberField label="Valor de 1 crédito en CLP" name="creditValueCLP" value={config.creditValueCLP} onChange={updateConfig} />
              <NumberField label="Margen mínimo hogar" name="minHomeMarginCLP" value={config.minHomeMarginCLP} onChange={updateConfig} />
              <NumberField label="Margen mínimo empresa" name="minCompanyMarginCLP" value={config.minCompanyMarginCLP} onChange={updateConfig} />
              <NumberField label="Fee visita inicial hogar" name="homeVisitFeeCLP" value={config.homeVisitFeeCLP} onChange={updateConfig} />
              <NumberField label="Fee visita inicial empresa" name="companyVisitFeeCLP" value={config.companyVisitFeeCLP} onChange={updateConfig} />
              <NumberField label="Vencimiento créditos en meses" name="creditExpirationMonths" value={config.creditExpirationMonths} onChange={updateConfig} />
              <NumberField label="Bonificación referido cliente" name="clientReferralBonusCredits" value={config.clientReferralBonusCredits} onChange={updateConfig} />
              <label className="field md:col-span-2">
                Bonificación referido especialista
                <input value={config.specialistReferralBonus} onChange={(event) => updateReferralBonus(event.target.value)} />
              </label>
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
                          Créditos sugeridos
                          <input type="number" value={specialty.suggestedCredits} onChange={(event) => updateSpecialty(type.id, specialty.id, { suggestedCredits: Number(event.target.value) })} />
                        </label>
                        <label className="field">
                          Margen mínimo
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

        {selectedSpecialist ? (
          <SpecialistDetailPanel
            specialist={selectedSpecialist}
            config={config}
            onClose={() => setSelectedSpecialist(null)}
            onApprove={() => approveRequest(selectedSpecialist.id)}
            onReject={() => rejectRequest(selectedSpecialist.id)}
            onMoreInfo={() => requestMoreInfo(selectedSpecialist.id)}
            onUpdateService={updatePendingService}
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
          {margin ? <span className={`chip ${margin.status === "OK" ? "bg-brand-soft text-brand-dark" : "bg-amber-50 text-amber-800"}`}>Margen {margin.status}</span> : null}
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
}) {
  const approvedPayments = payments.filter((payment) => payment.status === "approved");
  const failedSubscriptions = subscriptions.filter((subscription) => subscription.status === "failed_payment");
  const issuedCredits = transactions.filter((transaction) => transaction.amount > 0).reduce((sum, transaction) => sum + transaction.amount, 0);
  const usedCredits = transactions.filter((transaction) => transaction.amount < 0).reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const pendingPayouts = payouts.filter((payout) => payout.status !== "pagado");
  const estimatedMargin = payouts.reduce((sum, payout) => sum + payout.platformMarginCLP, 0);

  return (
    <Panel title="Pagos y créditos" eyebrow="Mercado Pago">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="Pagos recientes" value={payments.length.toString()} />
        <MiniMetric label="Pagos aprobados" value={approvedPayments.length.toString()} />
        <MiniMetric label="Suscripciones fallidas" value={failedSubscriptions.length.toString()} />
        <MiniMetric label="Margen estimado" value={formatCLP(estimatedMargin)} />
        <MiniMetric label="Créditos emitidos" value={issuedCredits.toString()} />
        <MiniMetric label="Créditos usados" value={usedCredits.toString()} />
        <MiniMetric label="Saldo usuario" value={`${wallet.currentBalance} créditos`} />
        <MiniMetric label="Liquidaciones pendientes" value={pendingPayouts.length.toString()} />
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
                  {payout.serviceName} · cliente {formatCLP(payout.customerChargeCLP)} · especialista {formatCLP(payout.specialistPayoutCLP)} · margen {formatCLP(payout.platformMarginCLP)}
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
}: {
  specialist: PendingSpecialistProfile;
  config: CommercialConfig;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onMoreInfo: () => void;
  onUpdateService: (index: number, patch: Partial<PendingSpecialistService>) => void;
}) {
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
        <div className="mt-5 grid gap-4">
          <h3 className="text-xl font-black">Servicios ofrecidos</h3>
          {(specialist.services ?? []).map((service, index) => {
            const economics = calculateServiceEconomics({
              clientCredits: Number(service.clientCredits),
              specialistPayoutCLP: Number(service.specialistPayoutCLP),
              serviceTypeId: service.serviceTypeId,
              config,
            });
            return (
              <article key={`${service.name}-${index}`} className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 md:grid-cols-2">
                <InfoBox label="Servicio" value={service.name || service.specialty} />
                <InfoBox label="Margen" value={`${formatCLP(economics.marginCLP)} · ${economics.status}`} />
                <label className="field">
                  Precio cliente en créditos
                  <input type="number" value={service.clientCredits} onChange={(event) => onUpdateService(index, { clientCredits: Number(event.target.value) })} />
                </label>
                <label className="field">
                  Pago especialista CLP
                  <input type="number" value={service.specialistPayoutCLP} onChange={(event) => onUpdateService(index, { specialistPayoutCLP: Number(event.target.value) })} />
                </label>
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
