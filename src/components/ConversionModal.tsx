"use client";

import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { RegionCommuneSelect } from "@/components/RegionCommuneSelect";
import { SearchableSelect } from "@/components/SearchableSelect";
import type { Specialist } from "@/data/mock";
import { formatCLP, getPlanById, getServiceTypeById, serviceTypes, subscriptionPlans } from "@/data/marketplace";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  communeRegionCode,
  DEFAULT_REGION_CODE,
  OTHER_SERVICE_VALUE,
  regionNameForCode,
  serviceTypeOptions,
  specialtyOptionsForType,
} from "@/lib/catalog";
import { submitConversionEvent, submitLead } from "@/lib/leadClient";
import { preserveSpecialistIntent } from "@/lib/intendedAction";
import {
  clearSpecialistQuickDraft,
  mergeSpecialistDraft,
  readSpecialistQuickDraft,
  saveSpecialistQuickDraft,
  type SpecialistQuickDraft,
} from "@/lib/specialistDraft";
import { getPrimaryFlexibleService, pricingDetail, pricingModeLabel, pricingSummary } from "@/lib/flexiblePricing";
import {
  appendConversionEvent as appendLocalConversionEvent,
  appendEnterpriseLead,
  appendHomeLead,
  appendQuickSearchLead,
  appendServiceRequestLead,
  createQuoteAgreement,
  getMockSession,
  type ConversionModalType,
} from "@/lib/storage";

export type OpenConversionModalOptions = {
  type: ConversionModalType;
  sourceButton: string;
  planId?: string;
  specialist?: Specialist;
};

type ConversionModalContextValue = {
  openModal: (options: OpenConversionModalOptions) => void;
};

const ConversionModalContext = createContext<ConversionModalContextValue | null>(null);

const defaultLead = {
  firstNames: "",
  lastNames: "",
  rut: "",
  email: "",
  whatsapp: "",
  region: DEFAULT_REGION_CODE,
  commune: "Las Condes",
};

const defaultEnterprise = {
  businessName: "",
  companyRut: "",
  companyLine: "",
  firstNames: "",
  lastNames: "",
  email: "",
  whatsapp: "",
  branches: "1",
  region: DEFAULT_REGION_CODE,
  commune: "Las Condes",
  need: "Mantención recurrente",
  serviceType: "empresas",
  otherServiceDescription: "",
  additionalComments: "",
};

const defaultSpecialist = {
  firstNames: "",
  lastNames: "",
  rut: "",
  phone: "",
  email: "",
  serviceTypeId: "hogar",
  region: DEFAULT_REGION_CODE,
  commune: "Santiago",
  years: "3",
};

const defaultReservation = {
  firstNames: "",
  lastNames: "",
  rut: "",
  email: "",
  whatsapp: "",
  serviceTypeId: "hogar",
  region: DEFAULT_REGION_CODE,
  commune: "Las Condes",
  address: "",
  service: "",
  otherServiceDescription: "",
  additionalComments: "",
  urgency: "Hoy",
};

const defaultSearch = {
  need: "",
  serviceTypeId: "hogar",
  specialty: "Gasfitería domiciliaria",
  otherServiceDescription: "",
  additionalComments: "",
  region: DEFAULT_REGION_CODE,
  commune: "Las Condes",
  urgency: "Hoy",
};

export function ConversionModalProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<OpenConversionModalOptions | null>(null);

  function openModal(nextOptions: OpenConversionModalOptions) {
    setOptions(nextOptions);
    const event = {
      type: "modal_opened",
      sourceButton: nextOptions.sourceButton,
      data: {
        modalType: nextOptions.type,
        planId: nextOptions.planId,
        specialistId: nextOptions.specialist?.id,
      },
    } as const;
    appendLocalConversionEvent(event);
    void submitConversionEvent({
      type: event.type,
      sourceButton: event.sourceButton,
      data: event.data,
    });
  }

  return (
    <ConversionModalContext.Provider value={{ openModal }}>
      {children}
      <ConversionModal options={options} onClose={() => setOptions(null)} />
    </ConversionModalContext.Provider>
  );
}

export function useConversionModal() {
  const context = useContext(ConversionModalContext);
  if (!context) throw new Error("useConversionModal must be used inside ConversionModalProvider");
  return context;
}

export function ConversionButton({
  type,
  sourceButton,
  planId,
  specialist,
  className,
  children,
}: OpenConversionModalOptions & {
  className?: string;
  children: ReactNode;
}) {
  const { openModal } = useConversionModal();

  return (
    <button
      className={className}
      type="button"
      onClick={() => {
        if (specialist && type === "reserva_especialista") {
          preserveSpecialistIntent({ specialist, intendedAction: "solicitar", source: sourceButton });
        }
        openModal({ type, sourceButton, planId, specialist });
      }}
    >
      {children}
    </button>
  );
}

function ConversionModal({ options, onClose }: { options: OpenConversionModalOptions | null; onClose: () => void }) {
  const { t, tList } = useI18n();
  const [step, setStep] = useState(1);
  const [lead, setLead] = useState(defaultLead);
  const [enterprise, setEnterprise] = useState(defaultEnterprise);
  const [specialistLead, setSpecialistLead] = useState(defaultSpecialist);
  const [reservation, setReservation] = useState(defaultReservation);
  const [search, setSearch] = useState(defaultSearch);
  const [selectedPlanId, setSelectedPlanId] = useState("plus");
  const [locationStatus, setLocationStatus] = useState("");
  const [searchGeo, setSearchGeo] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [specialistDraft, setSpecialistDraft] = useState<SpecialistQuickDraft | null>(null);
  const [specialistNotice, setSpecialistNotice] = useState("");

  useEffect(() => {
    if (!options) return;
    setStep(1);
    setLead(defaultLead);
    setEnterprise(defaultEnterprise);
    const quickDraft = readSpecialistQuickDraft();
    setSpecialistDraft(quickDraft);
    setSpecialistLead((quickDraft ? mergeSpecialistDraft(defaultSpecialist, quickDraft) : defaultSpecialist) as typeof defaultSpecialist);
    setReservation({
      ...defaultReservation,
      serviceTypeId: options.specialist?.serviceTypeId ?? "hogar",
      service: options.specialist?.specialty ?? "",
      region: options.specialist?.region ? communeRegionCode(options.specialist?.commune ?? options.specialist?.zone ?? "") || DEFAULT_REGION_CODE : DEFAULT_REGION_CODE,
      commune: options.specialist?.commune ?? options.specialist?.zone ?? "Las Condes",
    });
    setSearch(defaultSearch);
    setLocationStatus("");
    setSearchGeo({ lat: null, lng: null });
    setSuccess("");
    setSubmitting(false);
    setSpecialistNotice("");
    setSelectedPlanId(options.planId ?? (options.type === "plan_empresa" ? "empresa" : "plus"));
  }, [options]);

  useEffect(() => {
    if (!options || options.type !== "registro_especialista") return;
    const hasMeaningfulDraft =
      specialistLead.firstNames ||
      specialistLead.lastNames ||
      specialistLead.rut ||
      specialistLead.phone ||
      specialistLead.email ||
      specialistLead.serviceTypeId !== defaultSpecialist.serviceTypeId ||
      specialistLead.region !== defaultSpecialist.region ||
      specialistLead.commune !== defaultSpecialist.commune;
    if (!hasMeaningfulDraft) return;
    const draft = saveSpecialistQuickDraft({
      firstNames: specialistLead.firstNames,
      lastNames: specialistLead.lastNames,
      rut: specialistLead.rut,
      whatsapp: specialistLead.phone,
      email: specialistLead.email,
      serviceTypeId: specialistLead.serviceTypeId,
      region: specialistLead.region,
      commune: specialistLead.commune,
      fromQuickSpecialist: true,
    });
    if (draft) setSpecialistDraft(draft);
  }, [options, specialistLead]);

  const selectedPlan = useMemo(() => getPlanById(selectedPlanId), [selectedPlanId]);
  const clientPlans = subscriptionPlans.filter((plan) => plan.audience === "cliente");
  const enterprisePlans = subscriptionPlans.filter((plan) => plan.audience === "empresa");

  if (!options) return null;

  function appendConversionEvent(event: Parameters<typeof appendLocalConversionEvent>[0]) {
    appendLocalConversionEvent(event);
    void submitConversionEvent({
      type: event.type,
      sourceButton: event.sourceButton,
      page: event.page,
      data: event.data,
    });
  }

  function closeModal() {
    onClose();
  }

  async function submitHomeLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setSubmitting(true);
    const saved = appendHomeLead({
      ...lead,
      region: regionNameForCode(lead.region),
      name: `${lead.firstNames} ${lead.lastNames}`.trim(),
      planId: options?.planId ? selectedPlan.id : undefined,
      planName: options?.planId ? selectedPlan.name : undefined,
      sourceButton: options?.sourceButton ?? "Plan Club Hogar",
      interest: options?.planId ? `Plan ${selectedPlan.name}` : "Comparar planes Club Hogar",
    });
    appendConversionEvent({
      type: "lead_submitted",
      sourceButton: options?.sourceButton ?? "Plan Club Hogar",
      data: { leadId: saved.id, planId: selectedPlan.id, modalType: options?.type },
    });
    if (options?.planId) {
      appendConversionEvent({
        type: "plan_selected",
        sourceButton: options.sourceButton,
        data: { planId: selectedPlan.id, planName: selectedPlan.name, leadId: saved.id },
      });
    }
    setSuccess(t("modal.notices.homeReceived"));
    const result = await submitLead({
      leadType: options?.planId ? "payment_interest" : "club_hogar_interest",
      fullName: `${lead.firstNames} ${lead.lastNames}`.trim(),
      email: lead.email,
      phone: lead.whatsapp,
      service: options?.planId ? selectedPlan.name : "Club Hogar",
      regionCode: lead.region,
      regionName: regionNameForCode(lead.region),
      communeName: lead.commune,
      sourceComponent: "ConversionModal",
      sourceButton: options?.sourceButton ?? "Plan Club Hogar",
      payload: { localLeadId: saved.id, planId: selectedPlan.id, rut: lead.rut },
    });
    setSuccess(result.message);
    setSubmitting(false);
    window.setTimeout(() => {
      window.location.href = options?.planId ? `/checkout?plan=${selectedPlan.id}` : "/club-hogar";
    }, 700);
  }

  async function submitEnterpriseLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const enterpriseServiceLabel =
      enterprise.serviceType === OTHER_SERVICE_VALUE
        ? enterprise.otherServiceDescription
        : serviceTypeOptions.find((item) => item.value === enterprise.serviceType)?.label ?? enterprise.serviceType;
    const saved = appendEnterpriseLead({
      ...enterprise,
      region: regionNameForCode(enterprise.region),
      serviceType: enterpriseServiceLabel,
      name: `${enterprise.firstNames} ${enterprise.lastNames}`.trim(),
      company: enterprise.businessName,
      branches: Number(enterprise.branches),
      planId: options?.planId ? selectedPlan.id : undefined,
      sourceButton: options?.sourceButton ?? "Empresas",
      interest: options?.planId ? `Plan empresa ${selectedPlan.name}` : enterpriseServiceLabel,
    });
    appendConversionEvent({
      type: "company_lead_created",
      sourceButton: options?.sourceButton ?? "Empresas",
      data: { leadId: saved.id, company: enterprise.businessName, commune: enterprise.commune, need: enterpriseServiceLabel },
    });
    const result = await submitLead({
      leadType: "company_request",
      fullName: `${enterprise.firstNames} ${enterprise.lastNames}`.trim(),
      email: enterprise.email,
      phone: enterprise.whatsapp,
      companyName: enterprise.businessName,
      service: enterpriseServiceLabel,
      problemDescription: enterprise.additionalComments || enterprise.need,
      regionCode: enterprise.region,
      regionName: regionNameForCode(enterprise.region),
      communeName: enterprise.commune,
      sourceComponent: "ConversionModal",
      sourceButton: options?.sourceButton ?? "Empresas",
      payload: { localLeadId: saved.id, companyRut: enterprise.companyRut, branches: enterprise.branches, planId: options?.planId ? selectedPlan.id : undefined },
    });
    setSuccess(result.message);
    setSubmitting(false);
  }

  async function submitSpecialistLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fullName = `${specialistLead.firstNames} ${specialistLead.lastNames}`.trim();
    const hasBasicFields = fullName.length > 1 && specialistLead.phone.trim() && specialistLead.email.trim() && specialistLead.serviceTypeId;
    if (!hasBasicFields) {
      setSpecialistNotice(t("modal.notices.specialistMissing"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(specialistLead.email.trim())) {
      setSpecialistNotice(t("modal.notices.specialistEmail"));
      return;
    }

    setSubmitting(true);
    const serviceType = getServiceTypeById(specialistLead.serviceTypeId) ?? serviceTypes[0];
    const draft = saveSpecialistQuickDraft({
      ...specialistLead,
      whatsapp: specialistLead.phone,
      primaryTrade: serviceType.name,
      fromQuickSpecialist: true,
    });
    appendConversionEvent({
      type: "specialist_quick_intent",
      sourceButton: options?.sourceButton ?? "Trabaja con nosotros",
      data: { status: "borrador", serviceType: serviceType.name, commune: specialistLead.commune, hasDraft: Boolean(draft), specialistLeadKind: "draft_profile" },
    });
    void submitConversionEvent({
      type: "quick_lead_submitted",
      source: "conversion_modal",
      campaign: "founder_specialists",
      sourceComponent: "ConversionModal",
      sourceButton: options?.sourceButton ?? "Trabaja con nosotros",
      payload: { status: "borrador", serviceType: serviceType.name, commune: specialistLead.commune, hasDraft: Boolean(draft), specialistLeadKind: "draft_profile" },
    });
    const result = await submitLead({
      leadType: "specialist_application",
      fullName,
      email: specialistLead.email,
      phone: specialistLead.phone,
      applicantType: "specialist",
      trade: serviceType.name,
      service: serviceType.name,
      regionCode: specialistLead.region,
      regionName: regionNameForCode(specialistLead.region),
      communeName: specialistLead.commune,
      sourceComponent: "ConversionModal",
      sourceButton: options?.sourceButton ?? "Trabaja con nosotros",
      consentContact: true,
      consentTerms: true,
      payload: {
        specialistLeadKind: "draft_profile",
        leadSubtype: "draft_profile",
        draftProfileCreated: Boolean(draft),
        draftProfileStatus: "incomplete",
        draftProfileStep: "conversion_modal",
        founderStatus: "lead_capturado",
        source: "conversion_modal",
        campaign: "founder_specialists",
        commune: specialistLead.commune,
        trade: serviceType.id,
        crm: {
          pipeline: "especialistas",
          stage: "lead_capturado",
          assignedTeam: "Operaciones",
          taskTitle: "Contactar especialista con perfil incompleto",
          slaHours: 48,
        },
      },
    });
    setSpecialistNotice(t("modal.notices.specialistPrefill"));
    if (!result.stored) setSpecialistNotice(result.message);
    setSubmitting(false);
    window.setTimeout(() => {
      window.location.href = "/registro-especialista?from=quick-specialist";
    }, 450);
  }

  async function submitReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setSubmitting(true);
    const specialist = options?.specialist;
    const selectedFlexibleService = specialist ? getPrimaryFlexibleService(specialist) : null;
    const quoteMode =
      selectedFlexibleService?.pricingMode === "quote_required" ||
      selectedFlexibleService?.pricingMode === "virtual_diagnosis" ||
      selectedFlexibleService?.pricingMode === "range" ||
      selectedFlexibleService?.pricingMode === "custom";
    const serviceLabel = reservation.service === OTHER_SERVICE_VALUE ? reservation.otherServiceDescription : reservation.service;
    const quote = quoteMode && specialist && selectedFlexibleService
      ? createQuoteAgreement({
          specialistId: specialist.id,
          specialistName: specialist.name,
          customerName: `${reservation.firstNames} ${reservation.lastNames}`.trim() || "Cliente OficiosPro",
          serviceName: selectedFlexibleService.name,
          commune: reservation.commune,
          status: "quote_requested",
          originalRequest: reservation.additionalComments || serviceLabel || selectedFlexibleService.description,
          history: ["El cliente solicito cotizacion desde el perfil publico."],
        })
      : null;
    const saved = appendServiceRequestLead({
      ...reservation,
      region: regionNameForCode(reservation.region),
      name: `${reservation.firstNames} ${reservation.lastNames}`.trim(),
      service: quoteMode && selectedFlexibleService ? selectedFlexibleService.name : serviceLabel,
      isOtherService: reservation.service === OTHER_SERVICE_VALUE,
      sourceButton: options?.sourceButton ?? "Reservar",
      specialistId: specialist?.id,
      specialistName: specialist?.name,
      servicePricingId: selectedFlexibleService?.id,
      pricingMode: selectedFlexibleService?.pricingMode,
      quoteId: quote?.id,
      estimatedCredits: selectedFlexibleService?.fixedCredits ?? selectedFlexibleService?.minCredits ?? selectedFlexibleService?.visitCredits ?? specialist?.credits,
      coverageZone: specialist?.commune ?? specialist?.zone,
      interest: quoteMode && specialist ? `Cotizacion con ${specialist.name}` : specialist ? `Reserva con ${specialist.name}` : "Solicitud de servicio",
    });
    appendConversionEvent({
      type: "specialist_reserved",
      sourceButton: options?.sourceButton ?? "Reservar",
      data: { requestId: saved.id, specialistId: specialist?.id, service: reservation.service, commune: reservation.commune },
    });
    setSuccess(quoteMode ? t("modal.notices.quoteCreated") : t("modal.notices.reservationCreated"));
    const bookingLeadResult = await submitLead({
      leadType: "booking_request",
      fullName: `${reservation.firstNames} ${reservation.lastNames}`.trim(),
      email: reservation.email,
      phone: reservation.whatsapp,
      service: quoteMode && selectedFlexibleService ? selectedFlexibleService.name : serviceLabel,
      problemDescription: reservation.additionalComments,
      urgency: reservation.urgency,
      regionCode: reservation.region,
      regionName: regionNameForCode(reservation.region),
      communeName: reservation.commune,
      specialistId: specialist?.id,
      specialistName: specialist?.name,
      creditsEstimate: selectedFlexibleService?.fixedCredits ?? selectedFlexibleService?.minCredits ?? selectedFlexibleService?.visitCredits ?? specialist?.credits,
      sourceComponent: "ConversionModal",
      sourceButton: options?.sourceButton ?? "Reservar",
      payload: { localLeadId: saved.id, quoteId: quote?.id, rut: reservation.rut, address: reservation.address, pricingMode: selectedFlexibleService?.pricingMode, servicePricingId: selectedFlexibleService?.id },
    });
    setSuccess(quoteMode && bookingLeadResult.ok ? t("modal.notices.quoteRequested") : bookingLeadResult.message);
    setSubmitting(false);
  }

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!search.region || !search.commune) {
      setLocationStatus(t("modal.notices.searchLocation"));
      return;
    }
    setSubmitting(true);
    const saved = appendQuickSearchLead({
      ...search,
      region: regionNameForCode(search.region),
      specialty: search.specialty === OTHER_SERVICE_VALUE ? search.otherServiceDescription : search.specialty,
      isOtherService: search.specialty === OTHER_SERVICE_VALUE,
      sourceButton: options?.sourceButton ?? "Buscar especialista",
      lat: searchGeo.lat,
      lng: searchGeo.lng,
    });
    appendConversionEvent({
      type: "lead_submitted",
      sourceButton: options?.sourceButton ?? "Buscar especialista",
      data: { searchId: saved.id, serviceTypeId: search.serviceTypeId, specialty: search.specialty, commune: search.commune },
    });
    await submitLead({
      leadType: "customer_request",
      fullName: "Cliente OficiosPro",
      service: search.specialty === OTHER_SERVICE_VALUE ? search.otherServiceDescription : search.specialty,
      trade: serviceTypeOptions.find((item) => item.value === search.serviceTypeId)?.label ?? search.serviceTypeId,
      problemDescription: [search.need, search.additionalComments].filter(Boolean).join(" · "),
      urgency: search.urgency,
      regionCode: search.region,
      regionName: regionNameForCode(search.region),
      communeName: search.commune,
      sourceComponent: "ConversionModal",
      sourceButton: options?.sourceButton ?? "Buscar especialista",
      consentContact: false,
      payload: { localLeadId: saved.id, lat: searchGeo.lat, lng: searchGeo.lng },
    });
    setSubmitting(false);
    const params = new URLSearchParams({
      tipo: search.serviceTypeId,
      region: search.region,
      comuna: search.commune,
      especialidad: search.specialty === OTHER_SERVICE_VALUE ? search.otherServiceDescription : search.specialty,
    });
    window.location.href = `/especialistas?${params.toString()}`;
  }

  function useSearchLocation() {
    setLocationStatus(t("modal.notices.geoRequesting"));
    if (!("geolocation" in navigator)) {
      setLocationStatus(t("modal.notices.geoUnavailable"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSearchGeo({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus(t("modal.notices.geoCaptured"));
      },
      () => setLocationStatus(t("modal.notices.geoDenied")),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  const isPlanModal = options.type === "plan_hogar" || options.type === "lead_cliente" || options.type === "referido";
  const isEnterpriseModal = options.type === "plan_empresa" || options.type === "contacto_empresa";
  const isSpecialistModal = options.type === "registro_especialista";
  const isReservationModal = options.type === "reserva_especialista";
  const isSearchModal = options.type === "consulta_general" || options.type === "busqueda_rapida";

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-white/20 bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="hidden bg-enterprise p-7 text-white lg:block">
            <p className="eyebrow text-teal-200">OficiosPro</p>
            <h2 className="mt-4 text-3xl font-black leading-tight">{t(`modal.titles.${options.type}`)}</h2>
            <p className="mt-4 text-sm font-semibold leading-6 text-white/75">{t(`modal.subtitles.${options.type}`)}</p>
            <div className="mt-8 grid gap-3">
              {tList("modal.aside.chips").map((item) => (
                <span key={item} className="rounded-2xl bg-white/10 p-4 text-sm font-black">
                  {item}
                </span>
              ))}
            </div>
          </aside>
          <section className="p-5 md:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{t("modal.ui.step")} {step} {t("modal.ui.of")} {isEnterpriseModal || isSpecialistModal || isSearchModal ? 1 : 2}</p>
                <h2 className="text-3xl font-black text-ink">{t(`modal.titles.${options.type}`)}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">{t(`modal.subtitles.${options.type}`)}</p>
              </div>
              <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-white text-xl font-black text-muted transition hover:bg-slate-50 hover:text-ink" type="button" onClick={closeModal} aria-label={t("modal.close")}>
                ×
              </button>
            </div>

            <Progress step={step} total={isEnterpriseModal || isSpecialistModal || isSearchModal ? 1 : 2} />

            {success ? (
              <SuccessState
                text={success}
                isReservation={isReservationModal}
                isEnterprise={isEnterpriseModal}
                specialistId={options.specialist?.id}
                onClose={closeModal}
              />
            ) : null}

            {!success && isPlanModal ? (
              <form className="mt-5 grid gap-4" onSubmit={submitHomeLead}>
                {step === 1 ? (
                  <LeadFields lead={lead} onChange={setLead} />
                ) : (
                  <PlanSummary
                    plan={selectedPlan}
                    plans={clientPlans}
                    lockPlan={Boolean(options.planId)}
                    onPlanChange={setSelectedPlanId}
                  />
                )}
                <PrivacyText />
                <button className="btn-primary w-full" type="submit" disabled={submitting}>
                  {submitting ? t("modal.buttons.sending") : step === 1 ? t("modal.buttons.continue") : t("modal.buttons.continueActivation")}
                </button>
              </form>
            ) : null}

            {!success && isEnterpriseModal ? (
              <form className="mt-5 grid gap-4" onSubmit={submitEnterpriseLead}>
                <EnterpriseFields enterprise={enterprise} onChange={setEnterprise} />
                {options.planId ? (
                  <PlanSummary plan={selectedPlan} plans={enterprisePlans} lockPlan={false} onPlanChange={setSelectedPlanId} />
                ) : null}
                <PrivacyText />
                <button className="btn-primary w-full" type="submit" disabled={submitting}>
                  {submitting ? t("modal.buttons.sending") : t("modal.buttons.requestContact")}
                </button>
              </form>
            ) : null}

            {!success && isSpecialistModal ? (
              <form className="mt-5 grid gap-4" onSubmit={submitSpecialistLead}>
                <SpecialistLeadFields specialistLead={specialistLead} onChange={setSpecialistLead} />
                <p className="rounded-2xl bg-brand-soft p-4 text-sm font-black text-brand-dark">
                  {t("modal.specialist.note")}
                </p>
                {specialistDraft ? (
                  <button
                    className="justify-self-start text-sm font-black text-muted underline-offset-4 transition hover:text-brand hover:underline"
                    type="button"
                    onClick={() => {
                      clearSpecialistQuickDraft();
                      setSpecialistDraft(null);
                      setSpecialistLead(defaultSpecialist);
                      setSpecialistNotice(t("modal.notices.specialistCleared"));
                    }}
                  >
                    {t("modal.specialist.clear")}
                  </button>
                ) : null}
                {specialistNotice ? <p className="rounded-2xl bg-slate-50 p-3 text-sm font-black text-brand-dark">{specialistNotice}</p> : null}
                <PrivacyText />
                <button className="btn-primary w-full" type="submit" disabled={submitting}>
                  {submitting ? t("modal.buttons.sending") : t("modal.buttons.startApplication")}
                </button>
              </form>
            ) : null}

            {!success && isReservationModal ? (
              <form className="mt-5 grid gap-4" onSubmit={submitReservation}>
                {step === 1 ? (
                  <ReservationFields reservation={reservation} onChange={setReservation} />
                ) : (
                  <ReservationSummary specialist={options.specialist} reservation={reservation} />
                )}
                <PrivacyText />
                <button className="btn-primary w-full" type="submit" disabled={submitting}>
                  {submitting ? t("modal.buttons.sending") : step === 1 ? t("modal.buttons.continue") : t("modal.buttons.createRequest")}
                </button>
              </form>
            ) : null}

            {!success && isSearchModal ? (
              <form className="mt-5 grid gap-4" onSubmit={submitSearch}>
                <label className="field">
                  {t("modal.search.need")}
                  <input value={search.need} onChange={(event) => setSearch({ ...search, need: event.target.value })} placeholder={t("modal.search.needPh")} required />
                </label>
                <SearchableSelect
                  label={t("modal.search.serviceType")}
                  value={search.serviceTypeId}
                  options={serviceTypeOptions}
                  onChange={(serviceTypeId) => {
                    const nextSpecialty = specialtyOptionsForType(serviceTypeId)[0]?.value ?? "";
                    setSearch({ ...search, serviceTypeId, specialty: nextSpecialty, otherServiceDescription: "" });
                  }}
                  required
                />
                <SearchableSelect
                  label={t("modal.search.specialty")}
                  value={search.specialty}
                  options={specialtyOptionsForType(search.serviceTypeId)}
                  onChange={(specialty) => setSearch({ ...search, specialty, otherServiceDescription: "" })}
                  placeholder={t("modal.search.specialtyPh")}
                  required
                />
                {search.specialty === OTHER_SERVICE_VALUE ? (
                  <label className="field">
                    {t("modal.fields.describeNeed")}
                    <textarea
                      value={search.otherServiceDescription}
                      onChange={(event) => setSearch({ ...search, otherServiceDescription: event.target.value })}
                      placeholder={t("modal.fields.otherPlaceholder")}
                      required
                    />
                  </label>
                ) : null}
                <label className="field">
                  {t("modal.fields.additionalComments")}
                  <textarea
                    value={search.additionalComments}
                    onChange={(event) => setSearch({ ...search, additionalComments: event.target.value })}
                    placeholder={t("modal.search.commentsPh")}
                  />
                </label>
                <RegionCommuneSelect
                  region={search.region}
                  commune={search.commune}
                  onRegionChange={(region) => {
                    setSearch({ ...search, region, commune: "" });
                    setLocationStatus("");
                  }}
                  onCommuneChange={(commune) => {
                    setSearch({ ...search, commune });
                    setLocationStatus("");
                  }}
                  communePlaceholder={t("modal.search.communePh")}
                  required
                />
                <label className="field">
                  {t("modal.fields.urgency")}
                  <select value={search.urgency} onChange={(event) => setSearch({ ...search, urgency: event.target.value })}>
                    <option value="Hoy">{t("modal.fields.urgencyToday")}</option>
                    <option value="Esta semana">{t("modal.fields.urgencyWeek")}</option>
                    <option value="Sin urgencia">{t("modal.fields.urgencyNone")}</option>
                  </select>
                </label>
                <button className="btn-secondary w-full" type="button" onClick={useSearchLocation}>
                  {t("modal.buttons.useLocation")}
                </button>
                {locationStatus ? <p className="text-sm font-black text-brand-dark">{locationStatus}</p> : null}
                <PrivacyText />
                <button className="btn-primary w-full" type="submit" disabled={submitting}>
                  {submitting ? t("modal.buttons.sending") : t("modal.buttons.viewAvailable")}
                </button>
              </form>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

// modalTitle/modalSubtitle migrados a i18n (modal.titles / modal.subtitles).

function LeadFields({
  lead,
  onChange,
}: {
  lead: typeof defaultLead;
  onChange: (lead: typeof defaultLead) => void;
}) {
  const { t } = useI18n();
  return (
    <>
      <label className="field">
        {t("modal.fields.firstNames")}
        <input value={lead.firstNames} onChange={(event) => onChange({ ...lead, firstNames: event.target.value })} placeholder={t("modal.fields.firstNamesPh")} required />
      </label>
      <label className="field">
        {t("modal.fields.lastNames")}
        <input value={lead.lastNames} onChange={(event) => onChange({ ...lead, lastNames: event.target.value })} placeholder={t("modal.fields.lastNamesPh")} required />
      </label>
      <label className="field">
        {t("modal.fields.rut")}
        <input value={lead.rut} onChange={(event) => onChange({ ...lead, rut: event.target.value })} placeholder={t("modal.fields.rutPh")} required />
        <span className="text-xs font-bold text-muted">{t("modal.fields.rutHint")}</span>
      </label>
      <label className="field">
        {t("modal.fields.email")}
        <input value={lead.email} onChange={(event) => onChange({ ...lead, email: event.target.value })} type="email" placeholder={t("modal.fields.emailPh")} required />
      </label>
      <label className="field">
        {t("modal.fields.whatsapp")}
        <input value={lead.whatsapp} onChange={(event) => onChange({ ...lead, whatsapp: event.target.value })} type="tel" placeholder={t("modal.fields.whatsappPh")} required />
      </label>
      <RegionCommuneSelect
        region={lead.region}
        commune={lead.commune}
        onRegionChange={(region) => onChange({ ...lead, region, commune: "" })}
        onCommuneChange={(commune) => onChange({ ...lead, commune })}
        communePlaceholder={t("modal.fields.communePh")}
        required
      />
    </>
  );
}

function PlanSummary({
  plan,
  plans,
  lockPlan,
  onPlanChange,
}: {
  plan: ReturnType<typeof getPlanById>;
  plans: typeof subscriptionPlans;
  lockPlan: boolean;
  onPlanChange: (planId: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="grid gap-4">
      {!lockPlan ? (
        <label className="field">
          {t("modal.plan.interest")}
          <select value={plan.id} onChange={(event) => onPlanChange(event.target.value)}>
            {plans.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="rounded-[24px] border border-brand/20 bg-brand-soft p-5">
        <span className="text-sm font-black uppercase text-brand-dark">{t("modal.plan.selected")}</span>
        <strong className="mt-2 block text-3xl font-black text-ink">{plan.name}</strong>
        <div className="mt-4 grid gap-3 text-sm font-black text-muted sm:grid-cols-2">
          <span>{formatCLP(plan.priceCLP)}{t("modal.plan.perMonth")}</span>
          <span>{plan.monthlyCredits} {t("modal.plan.monthlyCredits")}</span>
          <span>{t("modal.plan.accumulates").replace("{months}", String(plan.accumulatesMonths))}</span>
          <span>{t("modal.plan.autoRenew")}</span>
        </div>
      </div>
    </div>
  );
}

function EnterpriseFields({
  enterprise,
  onChange,
}: {
  enterprise: typeof defaultEnterprise;
  onChange: (enterprise: typeof defaultEnterprise) => void;
}) {
  const { t } = useI18n();
  const enterpriseServiceOptions = [...serviceTypeOptions, { value: OTHER_SERVICE_VALUE, label: t("modal.enterprise.otherOption") }];

  return (
    <>
      <label className="field">
        {t("modal.enterprise.businessName")}
        <input value={enterprise.businessName} onChange={(event) => onChange({ ...enterprise, businessName: event.target.value })} placeholder={t("modal.enterprise.businessNamePh")} required />
      </label>
      <label className="field">
        {t("modal.enterprise.companyRut")}
        <input value={enterprise.companyRut} onChange={(event) => onChange({ ...enterprise, companyRut: event.target.value })} placeholder={t("modal.enterprise.companyRutPh")} required />
      </label>
      <label className="field">
        {t("modal.enterprise.companyLine")}
        <input value={enterprise.companyLine} onChange={(event) => onChange({ ...enterprise, companyLine: event.target.value })} placeholder={t("modal.enterprise.companyLinePh")} required />
      </label>
      <label className="field">
        {t("modal.enterprise.contactFirstNames")}
        <input value={enterprise.firstNames} onChange={(event) => onChange({ ...enterprise, firstNames: event.target.value })} required />
      </label>
      <label className="field">
        {t("modal.enterprise.contactLastNames")}
        <input value={enterprise.lastNames} onChange={(event) => onChange({ ...enterprise, lastNames: event.target.value })} required />
      </label>
      <label className="field">
        {t("modal.enterprise.corporateEmail")}
        <input value={enterprise.email} onChange={(event) => onChange({ ...enterprise, email: event.target.value })} type="email" required />
      </label>
      <label className="field">
        {t("modal.fields.whatsapp")}
        <input value={enterprise.whatsapp} onChange={(event) => onChange({ ...enterprise, whatsapp: event.target.value })} type="tel" required />
      </label>
      <label className="field">
        {t("modal.enterprise.branches")}
        <input value={enterprise.branches} onChange={(event) => onChange({ ...enterprise, branches: event.target.value })} type="number" min="1" required />
      </label>
      <RegionCommuneSelect
        region={enterprise.region}
        commune={enterprise.commune}
        onRegionChange={(region) => onChange({ ...enterprise, region, commune: "" })}
        onCommuneChange={(commune) => onChange({ ...enterprise, commune })}
        communeLabel={t("modal.enterprise.mainCommune")}
        communePlaceholder={t("modal.enterprise.mainCommunePh")}
        required
      />
      <SearchableSelect
        label={t("modal.enterprise.serviceType")}
        value={enterprise.serviceType}
        options={enterpriseServiceOptions}
        onChange={(serviceType) => onChange({ ...enterprise, serviceType, need: serviceType, otherServiceDescription: "" })}
        required
      />
      {enterprise.serviceType === OTHER_SERVICE_VALUE ? (
        <label className="field">
          {t("modal.fields.describeNeed")}
          <textarea
            value={enterprise.otherServiceDescription}
            onChange={(event) => onChange({ ...enterprise, otherServiceDescription: event.target.value })}
            placeholder={t("modal.fields.otherPlaceholder")}
            required
          />
        </label>
      ) : null}
      <label className="field">
        {t("modal.fields.additionalComments")}
        <textarea
          value={enterprise.additionalComments}
          onChange={(event) => onChange({ ...enterprise, additionalComments: event.target.value })}
          placeholder={t("modal.enterprise.commentsPh")}
        />
      </label>
    </>
  );
}

function SpecialistLeadFields({
  specialistLead,
  onChange,
}: {
  specialistLead: typeof defaultSpecialist;
  onChange: (specialistLead: typeof defaultSpecialist) => void;
}) {
  const { t } = useI18n();
  return (
    <>
      <label className="field">
        {t("modal.fields.firstNames")}
        <input value={specialistLead.firstNames} onChange={(event) => onChange({ ...specialistLead, firstNames: event.target.value })} required />
      </label>
      <label className="field">
        {t("modal.fields.lastNames")}
        <input value={specialistLead.lastNames} onChange={(event) => onChange({ ...specialistLead, lastNames: event.target.value })} required />
      </label>
      <label className="field">
        {t("modal.fields.rut")}
        <input value={specialistLead.rut} onChange={(event) => onChange({ ...specialistLead, rut: event.target.value })} placeholder={t("modal.fields.rutPh")} required />
      </label>
      <label className="field">
        {t("modal.fields.whatsapp")}
        <input value={specialistLead.phone} onChange={(event) => onChange({ ...specialistLead, phone: event.target.value })} type="tel" required />
      </label>
      <label className="field">
        {t("modal.fields.email")}
        <input value={specialistLead.email} onChange={(event) => onChange({ ...specialistLead, email: event.target.value })} type="email" required />
      </label>
      <SearchableSelect
        label={t("modal.specialist.mainServiceType")}
        value={specialistLead.serviceTypeId}
        options={serviceTypeOptions}
        onChange={(serviceTypeId) => onChange({ ...specialistLead, serviceTypeId })}
        required
      />
      <RegionCommuneSelect
        region={specialistLead.region}
        commune={specialistLead.commune}
        onRegionChange={(region) => onChange({ ...specialistLead, region, commune: "" })}
        onCommuneChange={(commune) => onChange({ ...specialistLead, commune })}
        communeLabel={t("modal.specialist.baseCommune")}
        communePlaceholder={t("modal.specialist.baseCommunePh")}
        required
      />
      <label className="field">
        {t("modal.specialist.years")}
        <input value={specialistLead.years} onChange={(event) => onChange({ ...specialistLead, years: event.target.value })} type="number" min="0" required />
      </label>
    </>
  );
}

function ReservationFields({
  reservation,
  onChange,
}: {
  reservation: typeof defaultReservation;
  onChange: (reservation: typeof defaultReservation) => void;
}) {
  const { t } = useI18n();
  return (
    <>
      <label className="field">
        {t("modal.fields.firstNames")}
        <input value={reservation.firstNames} onChange={(event) => onChange({ ...reservation, firstNames: event.target.value })} required />
      </label>
      <label className="field">
        {t("modal.fields.lastNames")}
        <input value={reservation.lastNames} onChange={(event) => onChange({ ...reservation, lastNames: event.target.value })} required />
      </label>
      <label className="field">
        {t("modal.fields.rut")}
        <input value={reservation.rut} onChange={(event) => onChange({ ...reservation, rut: event.target.value })} placeholder={t("modal.fields.rutPh")} required />
      </label>
      <label className="field">
        {t("modal.fields.email")}
        <input value={reservation.email} onChange={(event) => onChange({ ...reservation, email: event.target.value })} type="email" required />
      </label>
      <label className="field">
        {t("modal.fields.whatsapp")}
        <input value={reservation.whatsapp} onChange={(event) => onChange({ ...reservation, whatsapp: event.target.value })} type="tel" required />
      </label>
      <RegionCommuneSelect
        region={reservation.region}
        commune={reservation.commune}
        onRegionChange={(region) => onChange({ ...reservation, region, commune: "" })}
        onCommuneChange={(commune) => onChange({ ...reservation, commune })}
        communePlaceholder={t("modal.reservation.communePh")}
        required
      />
      <label className="field">
        {t("modal.reservation.address")}
        <input value={reservation.address} onChange={(event) => onChange({ ...reservation, address: event.target.value })} placeholder={t("modal.reservation.addressPh")} required />
      </label>
      <SearchableSelect
        label={t("modal.reservation.serviceType")}
        value={reservation.serviceTypeId}
        options={serviceTypeOptions}
        onChange={(serviceTypeId) => {
          const nextService = specialtyOptionsForType(serviceTypeId)[0]?.value ?? "";
          onChange({ ...reservation, serviceTypeId, service: nextService, otherServiceDescription: "" });
        }}
        placeholder={t("modal.reservation.serviceTypePh")}
        required
      />
      <SearchableSelect
        label={t("modal.reservation.serviceRequired")}
        value={reservation.service}
        options={specialtyOptionsForType(reservation.serviceTypeId)}
        onChange={(service) => onChange({ ...reservation, service, otherServiceDescription: "" })}
        placeholder={t("modal.reservation.serviceRequiredPh")}
        required
      />
      {reservation.service === OTHER_SERVICE_VALUE ? (
        <label className="field">
          {t("modal.fields.describeNeed")}
          <textarea
            value={reservation.otherServiceDescription}
            onChange={(event) => onChange({ ...reservation, otherServiceDescription: event.target.value })}
            placeholder={t("modal.fields.otherPlaceholder")}
            required
          />
        </label>
      ) : null}
      <label className="field">
        {t("modal.fields.additionalComments")}
        <textarea
          value={reservation.additionalComments}
          onChange={(event) => onChange({ ...reservation, additionalComments: event.target.value })}
          placeholder={t("modal.reservation.commentsPh")}
        />
      </label>
      <label className="field">
        {t("modal.fields.urgency")}
        <select value={reservation.urgency} onChange={(event) => onChange({ ...reservation, urgency: event.target.value })}>
          <option value="Hoy">{t("modal.fields.urgencyToday")}</option>
          <option value="Esta semana">{t("modal.fields.urgencyWeek")}</option>
          <option value="Sin urgencia">{t("modal.fields.urgencyNone")}</option>
        </select>
      </label>
    </>
  );
}

function ReservationSummary({ specialist, reservation }: { specialist?: Specialist; reservation: typeof defaultReservation }) {
  const { t } = useI18n();
  const serviceLabel = reservation.service === OTHER_SERVICE_VALUE ? reservation.otherServiceDescription : reservation.service;
  const flexibleService = specialist ? getPrimaryFlexibleService(specialist) : null;

  return (
    <div className="grid gap-4">
      <div className="rounded-[24px] border border-brand/20 bg-brand-soft p-5">
        <span className="text-sm font-black uppercase text-brand-dark">{t("modal.reservationSummary.selected")}</span>
        <strong className="mt-2 block text-3xl font-black text-ink">{specialist?.name ?? t("modal.reservationSummary.network")}</strong>
        <div className="mt-4 grid gap-3 text-sm font-black text-muted sm:grid-cols-2">
          <span>{t("modal.reservationSummary.service")}: {serviceLabel || t("modal.reservationSummary.toConfirm")}</span>
          <span>{t("modal.reservationSummary.price")}: {flexibleService ? pricingSummary(flexibleService) : specialist?.credits ? `${specialist.credits} ${t("modal.reservationSummary.credits")}` : t("modal.reservationSummary.priceToConfirm")}</span>
          <span>{t("modal.reservationSummary.mode")}: {flexibleService ? pricingModeLabel(flexibleService.pricingMode) : t("modal.reservationSummary.toConfirm")}</span>
          <span>{t("modal.reservationSummary.coverage")}: {specialist?.commune ?? specialist?.zone ?? reservation.commune}</span>
          <span>{t("modal.reservationSummary.nextStep")}: {t("modal.reservationSummary.nextStepValue")}</span>
        </div>
        {flexibleService ? <p className="mt-4 rounded-2xl bg-white/80 p-3 text-sm font-bold text-muted">{pricingDetail(flexibleService)}</p> : null}
        {reservation.additionalComments ? (
          <p className="mt-4 rounded-2xl bg-white/80 p-3 text-sm font-bold text-muted">
            {t("modal.reservationSummary.comments")}: {reservation.additionalComments}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SuccessState({
  text,
  isReservation,
  isEnterprise,
  specialistId,
  onClose,
}: {
  text: string;
  isReservation: boolean;
  isEnterprise: boolean;
  specialistId?: string;
  onClose: () => void;
}) {
  const { t, tList } = useI18n();
  const session = getMockSession();

  const nextSteps = tList(
    isEnterprise ? "modal.success.stepsEnterprise" : isReservation ? "modal.success.stepsReservation" : "modal.success.stepsGeneral",
  );

  return (
    <div className="mt-5 rounded-[24px] border border-brand/20 bg-brand-soft p-5">
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-900">
        <span aria-hidden>✓</span> {t("modal.success.received")}
      </span>
      <strong className="mt-3 block text-2xl font-black text-ink">{t("modal.success.title")}</strong>
      <p className="mt-2 font-semibold leading-7 text-brand-dark">{text}</p>
      <div className="mt-4 rounded-2xl bg-white/80 p-4">
        <p className="text-xs font-black uppercase text-brand-dark">{t("modal.success.whatNext")}</p>
        <ol className="mt-3 grid gap-3">
          {nextSteps.map((stepText, index) => (
            <li key={stepText} className="flex items-start gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-black text-white">{index + 1}</span>
              <span className="text-sm font-semibold leading-6 text-muted">{stepText}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {isReservation ? (
          session ? (
            <a className="btn-primary flex-1" href="/dashboard-cliente">
              {t("modal.success.goDashboard")}
            </a>
          ) : (
            <a className="btn-primary flex-1" href={`/registro-cliente${specialistId ? `?reserve=${specialistId}` : ""}`}>
              {t("modal.success.createAccount")}
            </a>
          )
        ) : null}
        {isEnterprise ? (
          <a className="btn-primary flex-1" href="/empresas">
            {t("modal.success.viewPlans")}
          </a>
        ) : null}
        <button className="btn-secondary flex-1" type="button" onClick={onClose}>
          {t("modal.success.close")}
        </button>
      </div>
    </div>
  );
}

function Progress({ step, total }: { step: number; total: number }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-2">
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(step / total) * 100}%` }} />
      </div>
      <span className="text-xs font-black uppercase text-muted">{total === 1 ? t("modal.ui.shortForm") : `${t("modal.ui.step")} ${step} ${t("modal.ui.of")} ${total}`}</span>
    </div>
  );
}

function PrivacyText() {
  const { t } = useI18n();
  return (
    <>
      <label className="hidden" aria-hidden="true">
        Sitio web
        <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
      </label>
      <p className="rounded-2xl bg-slate-50 p-3 text-xs font-bold leading-5 text-muted">
        {t("modal.ui.privacy")}
      </p>
    </>
  );
}
