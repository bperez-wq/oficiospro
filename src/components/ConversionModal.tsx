"use client";

import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import type { Specialist } from "@/data/mock";
import { formatCLP, getPlanById, getServiceTypeById, serviceTypes, subscriptionPlans } from "@/data/marketplace";
import {
  allSpecialtyOptions,
  communeOptions,
  OTHER_SERVICE_VALUE,
  regionOptions,
  serviceTypeOptions,
  specialtyOptionsForType,
} from "@/lib/catalog";
import {
  appendConversionEvent,
  appendEnterpriseLead,
  appendHomeLead,
  appendQuickSearchLead,
  appendServiceRequestLead,
  appendSpecialistLead,
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
  region: "Metropolitana de Santiago",
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
  region: "Metropolitana de Santiago",
  commune: "Las Condes",
  need: "Mantención recurrente",
  serviceType: "Mantención recurrente",
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
  commune: "Santiago",
  years: "3",
};

const defaultReservation = {
  firstNames: "",
  lastNames: "",
  rut: "",
  email: "",
  whatsapp: "",
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
  commune: "Las Condes",
  urgency: "Hoy",
};

const otherServicePlaceholder =
  "Ejemplo: necesito reparar una bomba de agua en una parcela, instalar un equipo especial o coordinar una mantención que no aparece en la lista.";

export function ConversionModalProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<OpenConversionModalOptions | null>(null);

  function openModal(nextOptions: OpenConversionModalOptions) {
    setOptions(nextOptions);
    appendConversionEvent({
      type: "modal_opened",
      sourceButton: nextOptions.sourceButton,
      data: {
        modalType: nextOptions.type,
        planId: nextOptions.planId,
        specialistId: nextOptions.specialist?.id,
      },
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
    <button className={className} type="button" onClick={() => openModal({ type, sourceButton, planId, specialist })}>
      {children}
    </button>
  );
}

function ConversionModal({ options, onClose }: { options: OpenConversionModalOptions | null; onClose: () => void }) {
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

  useEffect(() => {
    if (!options) return;
    setStep(1);
    setLead(defaultLead);
    setEnterprise(defaultEnterprise);
    setSpecialistLead(defaultSpecialist);
    setReservation({
      ...defaultReservation,
      service: options.specialist?.specialty ?? "",
      commune: options.specialist?.commune ?? options.specialist?.zone ?? "Las Condes",
    });
    setSearch(defaultSearch);
    setLocationStatus("");
    setSearchGeo({ lat: null, lng: null });
    setSuccess("");
    setSelectedPlanId(options.planId ?? (options.type === "plan_empresa" ? "empresa" : "plus"));
  }, [options]);

  const selectedPlan = useMemo(() => getPlanById(selectedPlanId), [selectedPlanId]);
  const clientPlans = subscriptionPlans.filter((plan) => plan.audience === "cliente");
  const enterprisePlans = subscriptionPlans.filter((plan) => plan.audience === "empresa");

  if (!options) return null;

  function closeModal() {
    onClose();
  }

  function submitHomeLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    const saved = appendHomeLead({
      ...lead,
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
    setSuccess("Datos recibidos. Continuaremos con la activación.");
    window.setTimeout(() => {
      window.location.href = options?.planId ? `/checkout?plan=${selectedPlan.id}` : "/club-hogar";
    }, 700);
  }

  function submitEnterpriseLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = appendEnterpriseLead({
      ...enterprise,
      name: `${enterprise.firstNames} ${enterprise.lastNames}`.trim(),
      company: enterprise.businessName,
      branches: Number(enterprise.branches),
      planId: options?.planId ? selectedPlan.id : undefined,
      sourceButton: options?.sourceButton ?? "Empresas",
      interest: options?.planId ? `Plan empresa ${selectedPlan.name}` : enterprise.serviceType,
    });
    appendConversionEvent({
      type: "company_lead_created",
      sourceButton: options?.sourceButton ?? "Empresas",
      data: { leadId: saved.id, company: enterprise.businessName, commune: enterprise.commune, need: enterprise.serviceType },
    });
    setSuccess("Recibimos tu solicitud. Un ejecutivo revisará tu caso.");
  }

  function submitSpecialistLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const serviceType = getServiceTypeById(specialistLead.serviceTypeId) ?? serviceTypes[0];
    const saved = appendSpecialistLead({
      ...specialistLead,
      name: `${specialistLead.firstNames} ${specialistLead.lastNames}`.trim(),
      years: Number(specialistLead.years),
      serviceTypeName: serviceType.name,
      sourceButton: options?.sourceButton ?? "Trabaja con nosotros",
      interest: "Postulación especialista verificado",
    });
    appendConversionEvent({
      type: "specialist_lead_created",
      sourceButton: options?.sourceButton ?? "Trabaja con nosotros",
      data: { leadId: saved.id, serviceType: serviceType.name, commune: specialistLead.commune },
    });
    setSuccess("Perfecto. Ahora completa referencias, precios y cobertura para validar tu perfil.");
    window.setTimeout(() => {
      window.location.href = `/registro-especialista?lead=${saved.id}`;
    }, 850);
  }

  function submitReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    const specialist = options?.specialist;
    const saved = appendServiceRequestLead({
      ...reservation,
      name: `${reservation.firstNames} ${reservation.lastNames}`.trim(),
      service: reservation.service === OTHER_SERVICE_VALUE ? reservation.otherServiceDescription : reservation.service,
      isOtherService: reservation.service === OTHER_SERVICE_VALUE,
      sourceButton: options?.sourceButton ?? "Reservar",
      specialistId: specialist?.id,
      specialistName: specialist?.name,
      estimatedCredits: specialist?.credits,
      coverageZone: specialist?.commune ?? specialist?.zone,
      interest: specialist ? `Reserva con ${specialist.name}` : "Solicitud de servicio",
    });
    appendConversionEvent({
      type: "specialist_reserved",
      sourceButton: options?.sourceButton ?? "Reservar",
      data: { requestId: saved.id, specialistId: specialist?.id, service: reservation.service, commune: reservation.commune },
    });
    setSuccess("Solicitud creada. La guardamos para coordinar el siguiente paso.");
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = appendQuickSearchLead({
      ...search,
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
    const params = new URLSearchParams({
      tipo: search.serviceTypeId,
      comuna: search.commune,
      especialidad: search.specialty === OTHER_SERVICE_VALUE ? search.otherServiceDescription : search.specialty,
    });
    window.location.href = `/especialistas?${params.toString()}`;
  }

  function useSearchLocation() {
    setLocationStatus("Solicitando ubicación...");
    if (!("geolocation" in navigator)) {
      setLocationStatus("No pudimos acceder a tu ubicación. Puedes buscar por comuna.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSearchGeo({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus("Ubicación capturada para ordenar resultados cercanos.");
      },
      () => setLocationStatus("No se pudo obtener permiso. Seguiremos con la comuna seleccionada."),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  const isPlanModal = options.type === "plan_hogar" || options.type === "lead_cliente";
  const isEnterpriseModal = options.type === "plan_empresa" || options.type === "contacto_empresa";
  const isSpecialistModal = options.type === "registro_especialista";
  const isReservationModal = options.type === "reserva_especialista";
  const isSearchModal = options.type === "consulta_general";

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-white/20 bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="hidden bg-enterprise p-7 text-white lg:block">
            <p className="eyebrow text-teal-200">OficiosPro</p>
            <h2 className="mt-4 text-3xl font-black leading-tight">{modalTitle(options.type)}</h2>
            <p className="mt-4 text-sm font-semibold leading-6 text-white/75">{modalSubtitle(options.type)}</p>
            <div className="mt-8 grid gap-3">
              {["Técnicos verificados", "Pago protegido", "Créditos acumulables", "Respuesta rápida"].map((item) => (
                <span key={item} className="rounded-2xl bg-white/10 p-4 text-sm font-black">
                  {item}
                </span>
              ))}
            </div>
          </aside>
          <section className="p-5 md:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Paso {step} de {isEnterpriseModal || isSpecialistModal || isSearchModal ? 1 : 2}</p>
                <h2 className="text-3xl font-black text-ink">{modalTitle(options.type)}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">{modalSubtitle(options.type)}</p>
              </div>
              <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-white text-xl font-black text-muted transition hover:bg-slate-50 hover:text-ink" type="button" onClick={closeModal} aria-label="Cerrar">
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
                <button className="btn-primary w-full" type="submit">
                  {step === 1 ? "Continuar" : "Continuar a activación"}
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
                <button className="btn-primary w-full" type="submit">
                  Solicitar contacto
                </button>
              </form>
            ) : null}

            {!success && isSpecialistModal ? (
              <form className="mt-5 grid gap-4" onSubmit={submitSpecialistLead}>
                <SpecialistLeadFields specialistLead={specialistLead} onChange={setSpecialistLead} />
                <p className="rounded-2xl bg-brand-soft p-4 text-sm font-black text-brand-dark">
                  Luego te pediremos tus referencias, precios y cobertura para validar tu perfil.
                </p>
                <PrivacyText />
                <button className="btn-primary w-full" type="submit">
                  Comenzar postulación
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
                <button className="btn-primary w-full" type="submit">
                  {step === 1 ? "Continuar" : "Crear solicitud"}
                </button>
              </form>
            ) : null}

            {!success && isSearchModal ? (
              <form className="mt-5 grid gap-4" onSubmit={submitSearch}>
                <label className="field">
                  ¿Qué necesitas?
                  <input value={search.need} onChange={(event) => setSearch({ ...search, need: event.target.value })} placeholder="Ej: reparar filtración, instalar aire acondicionado" required />
                </label>
                <SearchableSelect
                  label="Tipo de servicio"
                  value={search.serviceTypeId}
                  options={serviceTypeOptions}
                  onChange={(serviceTypeId) => {
                    const nextSpecialty = specialtyOptionsForType(serviceTypeId)[0]?.value ?? "";
                    setSearch({ ...search, serviceTypeId, specialty: nextSpecialty, otherServiceDescription: "" });
                  }}
                  required
                />
                <SearchableSelect
                  label="Especialidad"
                  value={search.specialty}
                  options={specialtyOptionsForType(search.serviceTypeId)}
                  onChange={(specialty) => setSearch({ ...search, specialty, otherServiceDescription: "" })}
                  placeholder="Busca gasfitería, aire, SEC..."
                  required
                />
                {search.specialty === OTHER_SERVICE_VALUE ? (
                  <label className="field">
                    Describe qué necesitas
                    <textarea
                      value={search.otherServiceDescription}
                      onChange={(event) => setSearch({ ...search, otherServiceDescription: event.target.value })}
                      placeholder={otherServicePlaceholder}
                      required
                    />
                  </label>
                ) : null}
                <label className="field">
                  Comentarios adicionales
                  <textarea
                    value={search.additionalComments}
                    onChange={(event) => setSearch({ ...search, additionalComments: event.target.value })}
                    placeholder="Cuéntanos horarios, condiciones del lugar o datos importantes para coordinar."
                  />
                </label>
                <CommuneSelect value={search.commune} onChange={(commune) => setSearch({ ...search, commune })} />
                <label className="field">
                  Urgencia
                  <select value={search.urgency} onChange={(event) => setSearch({ ...search, urgency: event.target.value })}>
                    <option>Hoy</option>
                    <option>Esta semana</option>
                    <option>Sin urgencia</option>
                  </select>
                </label>
                <button className="btn-secondary w-full" type="button" onClick={useSearchLocation}>
                  Usar mi ubicación
                </button>
                {locationStatus ? <p className="text-sm font-black text-brand-dark">{locationStatus}</p> : null}
                <PrivacyText />
                <button className="btn-primary w-full" type="submit">
                  Ver especialistas disponibles
                </button>
              </form>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

function modalTitle(type: ConversionModalType) {
  const titles: Record<ConversionModalType, string> = {
    lead_cliente: "Activa tu Club Hogar",
    plan_hogar: "Activa tu Club Hogar",
    plan_empresa: "Centraliza tus mantenciones con OficiosPro Empresas",
    reserva_especialista: "Cuéntanos qué necesitas",
    registro_especialista: "Postula como especialista verificado",
    contacto_empresa: "Centraliza tus mantenciones con OficiosPro Empresas",
    referido: "Invita y gana créditos",
    consulta_general: "Busca especialistas disponibles",
  };
  return titles[type];
}

function modalSubtitle(type: ConversionModalType) {
  const subtitles: Record<ConversionModalType, string> = {
    lead_cliente: "Déjanos tus datos y te mostramos el mejor camino para activar créditos acumulables.",
    plan_hogar: "Primero capturamos tus datos y luego avanzas a la activación del plan seleccionado.",
    plan_empresa: "Cuéntanos tu operación para recomendar un plan, créditos corporativos y tiempos de respuesta.",
    reserva_especialista: "Creamos una solicitud con servicio, comuna, urgencia y especialista seleccionado.",
    registro_especialista: "Captura rápida antes del formulario completo de validación, referencias y precios.",
    contacto_empresa: "Un ejecutivo revisará tu caso y la necesidad operacional de tu empresa.",
    referido: "Registra un referido y acumula beneficios en la plataforma.",
    consulta_general: "Filtra por tipo, especialidad, comuna y urgencia antes de ver resultados.",
  };
  return subtitles[type];
}

function LeadFields({
  lead,
  onChange,
}: {
  lead: typeof defaultLead;
  onChange: (lead: typeof defaultLead) => void;
}) {
  return (
    <>
      <label className="field">
        Nombres
        <input value={lead.firstNames} onChange={(event) => onChange({ ...lead, firstNames: event.target.value })} placeholder="Ej: Benjamín" required />
      </label>
      <label className="field">
        Apellidos
        <input value={lead.lastNames} onChange={(event) => onChange({ ...lead, lastNames: event.target.value })} placeholder="Ej: Pérez Peric" required />
      </label>
      <label className="field">
        RUT
        <input value={lead.rut} onChange={(event) => onChange({ ...lead, rut: event.target.value })} placeholder="12.345.678-9" required />
        <span className="text-xs font-bold text-muted">RUT para boleta, facturación y validación de cuenta.</span>
      </label>
      <label className="field">
        Email
        <input value={lead.email} onChange={(event) => onChange({ ...lead, email: event.target.value })} type="email" placeholder="nombre@email.cl" required />
      </label>
      <label className="field">
        WhatsApp
        <input value={lead.whatsapp} onChange={(event) => onChange({ ...lead, whatsapp: event.target.value })} type="tel" placeholder="+56 9 1234 5678" required />
      </label>
      <SearchableSelect label="Región" value={lead.region} options={regionOptions} onChange={(region) => onChange({ ...lead, region })} required />
      <CommuneSelect value={lead.commune} onChange={(commune) => onChange({ ...lead, commune })} />
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
  return (
    <div className="grid gap-4">
      {!lockPlan ? (
        <label className="field">
          Plan de interés
          <select value={plan.id} onChange={(event) => onPlanChange(event.target.value)}>
            {plans.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="rounded-[24px] border border-brand/20 bg-brand-soft p-5">
        <span className="text-sm font-black uppercase text-brand-dark">Plan seleccionado</span>
        <strong className="mt-2 block text-3xl font-black text-ink">{plan.name}</strong>
        <div className="mt-4 grid gap-3 text-sm font-black text-muted sm:grid-cols-2">
          <span>{formatCLP(plan.priceCLP)}/mes</span>
          <span>{plan.monthlyCredits} créditos mensuales</span>
          <span>Acumulables {plan.accumulatesMonths} meses</span>
          <span>Renovación automática mensual</span>
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
  const enterpriseServiceOptions = [
    { value: "Mantención recurrente", label: "Mantención recurrente" },
    { value: "Emergencias", label: "Emergencias" },
    { value: "Bolsa de créditos", label: "Bolsa de créditos" },
    { value: "Proveedores técnicos", label: "Proveedores técnicos" },
    { value: OTHER_SERVICE_VALUE, label: "Otro / No encontré mi servicio" },
  ];

  return (
    <>
      <label className="field">
        Razón social
        <input value={enterprise.businessName} onChange={(event) => onChange({ ...enterprise, businessName: event.target.value })} placeholder="Ej: Operadora Oficinas SpA" required />
      </label>
      <label className="field">
        RUT empresa
        <input value={enterprise.companyRut} onChange={(event) => onChange({ ...enterprise, companyRut: event.target.value })} placeholder="76.123.456-7" required />
      </label>
      <label className="field">
        Giro
        <input value={enterprise.companyLine} onChange={(event) => onChange({ ...enterprise, companyLine: event.target.value })} placeholder="Retail, restaurante, comunidad, planta" required />
      </label>
      <label className="field">
        Nombres contacto
        <input value={enterprise.firstNames} onChange={(event) => onChange({ ...enterprise, firstNames: event.target.value })} required />
      </label>
      <label className="field">
        Apellidos contacto
        <input value={enterprise.lastNames} onChange={(event) => onChange({ ...enterprise, lastNames: event.target.value })} required />
      </label>
      <label className="field">
        Email corporativo
        <input value={enterprise.email} onChange={(event) => onChange({ ...enterprise, email: event.target.value })} type="email" required />
      </label>
      <label className="field">
        WhatsApp
        <input value={enterprise.whatsapp} onChange={(event) => onChange({ ...enterprise, whatsapp: event.target.value })} type="tel" required />
      </label>
      <label className="field">
        Número de sucursales
        <input value={enterprise.branches} onChange={(event) => onChange({ ...enterprise, branches: event.target.value })} type="number" min="1" required />
      </label>
      <SearchableSelect label="Región" value={enterprise.region} options={regionOptions} onChange={(region) => onChange({ ...enterprise, region })} required />
      <CommuneSelect value={enterprise.commune} onChange={(commune) => onChange({ ...enterprise, commune })} label="Comuna principal" />
      <SearchableSelect
        label="Tipo de servicios requeridos"
        value={enterprise.serviceType}
        options={enterpriseServiceOptions}
        onChange={(serviceType) => onChange({ ...enterprise, serviceType, need: serviceType, otherServiceDescription: "" })}
        required
      />
      {enterprise.serviceType === OTHER_SERVICE_VALUE ? (
        <label className="field">
          Describe qué necesitas
          <textarea
            value={enterprise.otherServiceDescription}
            onChange={(event) => onChange({ ...enterprise, otherServiceDescription: event.target.value })}
            placeholder={otherServicePlaceholder}
            required
          />
        </label>
      ) : null}
      <label className="field">
        Comentarios adicionales
        <textarea
          value={enterprise.additionalComments}
          onChange={(event) => onChange({ ...enterprise, additionalComments: event.target.value })}
          placeholder="Ej: horarios de atención, cantidad de locales, urgencias frecuentes o proveedor actual."
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
  return (
    <>
      <label className="field">
        Nombres
        <input value={specialistLead.firstNames} onChange={(event) => onChange({ ...specialistLead, firstNames: event.target.value })} required />
      </label>
      <label className="field">
        Apellidos
        <input value={specialistLead.lastNames} onChange={(event) => onChange({ ...specialistLead, lastNames: event.target.value })} required />
      </label>
      <label className="field">
        RUT
        <input value={specialistLead.rut} onChange={(event) => onChange({ ...specialistLead, rut: event.target.value })} placeholder="12.345.678-9" required />
      </label>
      <label className="field">
        WhatsApp
        <input value={specialistLead.phone} onChange={(event) => onChange({ ...specialistLead, phone: event.target.value })} type="tel" required />
      </label>
      <label className="field">
        Email
        <input value={specialistLead.email} onChange={(event) => onChange({ ...specialistLead, email: event.target.value })} type="email" required />
      </label>
      <SearchableSelect
        label="Tipo de servicio principal"
        value={specialistLead.serviceTypeId}
        options={serviceTypeOptions}
        onChange={(serviceTypeId) => onChange({ ...specialistLead, serviceTypeId })}
        required
      />
      <CommuneSelect value={specialistLead.commune} onChange={(commune) => onChange({ ...specialistLead, commune })} label="Comuna base" />
      <label className="field">
        Años de experiencia
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
  return (
    <>
      <label className="field">
        Nombres
        <input value={reservation.firstNames} onChange={(event) => onChange({ ...reservation, firstNames: event.target.value })} required />
      </label>
      <label className="field">
        Apellidos
        <input value={reservation.lastNames} onChange={(event) => onChange({ ...reservation, lastNames: event.target.value })} required />
      </label>
      <label className="field">
        RUT
        <input value={reservation.rut} onChange={(event) => onChange({ ...reservation, rut: event.target.value })} placeholder="12.345.678-9" required />
      </label>
      <label className="field">
        Email
        <input value={reservation.email} onChange={(event) => onChange({ ...reservation, email: event.target.value })} type="email" required />
      </label>
      <label className="field">
        WhatsApp
        <input value={reservation.whatsapp} onChange={(event) => onChange({ ...reservation, whatsapp: event.target.value })} type="tel" required />
      </label>
      <CommuneSelect value={reservation.commune} onChange={(commune) => onChange({ ...reservation, commune })} />
      <label className="field">
        Dirección aproximada
        <input value={reservation.address} onChange={(event) => onChange({ ...reservation, address: event.target.value })} placeholder="Sector o referencia" required />
      </label>
      <SearchableSelect
        label="Servicio requerido"
        value={reservation.service}
        options={allSpecialtyOptions}
        onChange={(service) => onChange({ ...reservation, service, otherServiceDescription: "" })}
        placeholder="Busca gasfitería, electricidad, aire..."
        required
      />
      {reservation.service === OTHER_SERVICE_VALUE ? (
        <label className="field">
          Describe qué necesitas
          <textarea
            value={reservation.otherServiceDescription}
            onChange={(event) => onChange({ ...reservation, otherServiceDescription: event.target.value })}
            placeholder={otherServicePlaceholder}
            required
          />
        </label>
      ) : null}
      <label className="field">
        Comentarios adicionales
        <textarea
          value={reservation.additionalComments}
          onChange={(event) => onChange({ ...reservation, additionalComments: event.target.value })}
          placeholder="Ej: disponibilidad horaria, referencias de acceso, fotos disponibles o urgencia real."
        />
      </label>
      <label className="field">
        Urgencia
        <select value={reservation.urgency} onChange={(event) => onChange({ ...reservation, urgency: event.target.value })}>
          <option>Hoy</option>
          <option>Esta semana</option>
          <option>Sin urgencia</option>
        </select>
      </label>
    </>
  );
}

function ReservationSummary({ specialist, reservation }: { specialist?: Specialist; reservation: typeof defaultReservation }) {
  const serviceLabel = reservation.service === OTHER_SERVICE_VALUE ? reservation.otherServiceDescription : reservation.service;

  return (
    <div className="grid gap-4">
      <div className="rounded-[24px] border border-brand/20 bg-brand-soft p-5">
        <span className="text-sm font-black uppercase text-brand-dark">Especialista seleccionado</span>
        <strong className="mt-2 block text-3xl font-black text-ink">{specialist?.name ?? "Red OficiosPro"}</strong>
        <div className="mt-4 grid gap-3 text-sm font-black text-muted sm:grid-cols-2">
          <span>Servicio: {serviceLabel || "Por confirmar"}</span>
          <span>Créditos estimados: {specialist?.credits ?? "por confirmar"}</span>
          <span>Zona de cobertura: {specialist?.commune ?? specialist?.zone ?? reservation.commune}</span>
          <span>Próximo paso: coordinación y validación de disponibilidad</span>
        </div>
        {reservation.additionalComments ? (
          <p className="mt-4 rounded-2xl bg-white/80 p-3 text-sm font-bold text-muted">
            Comentarios: {reservation.additionalComments}
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
  const session = getMockSession();

  return (
    <div className="mt-5 rounded-[24px] border border-brand/20 bg-brand-soft p-5">
      <strong className="block text-2xl font-black text-ink">Listo</strong>
      <p className="mt-2 font-semibold leading-7 text-brand-dark">{text}</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {isReservation ? (
          session ? (
            <a className="btn-primary flex-1" href="/dashboard-cliente">
              Ir a mi dashboard
            </a>
          ) : (
            <a className="btn-primary flex-1" href={`/registro-cliente${specialistId ? `?reserve=${specialistId}` : ""}`}>
              Crear cuenta rápida
            </a>
          )
        ) : null}
        {isEnterprise ? (
          <a className="btn-primary flex-1" href="/empresas">
            Ver planes empresa
          </a>
        ) : null}
        <button className="btn-secondary flex-1" type="button" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

function CommuneSelect({ value, onChange, label = "Comuna" }: { value: string; onChange: (commune: string) => void; label?: string }) {
  return <SearchableSelect label={label} value={value} options={communeOptions} onChange={onChange} required />;
}

function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div className="grid gap-2">
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(step / total) * 100}%` }} />
      </div>
      <span className="text-xs font-black uppercase text-muted">{total === 1 ? "Formulario corto" : `Paso ${step} de ${total}`}</span>
    </div>
  );
}

function PrivacyText() {
  return (
    <p className="rounded-2xl bg-slate-50 p-3 text-xs font-bold leading-5 text-muted">
      Tus datos se usan solo para coordinar servicios OficiosPro.
    </p>
  );
}
