"use client";

import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { chileCommunes } from "@/data/chileCommunes";
import type { Specialist } from "@/data/mock";
import { formatCLP, getPlanById, getServiceTypeById, getSpecialtiesByServiceType, serviceTypes, subscriptionPlans } from "@/data/marketplace";
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
  name: "",
  email: "",
  whatsapp: "",
  commune: "Las Condes",
};

const defaultEnterprise = {
  name: "",
  company: "",
  email: "",
  whatsapp: "",
  industry: "",
  branches: "1",
  commune: "Las Condes",
  need: "Mantención recurrente",
};

const defaultSpecialist = {
  name: "",
  phone: "",
  email: "",
  serviceTypeId: "hogar",
  commune: "Santiago",
  years: "3",
};

const defaultReservation = {
  name: "",
  email: "",
  whatsapp: "",
  commune: "Las Condes",
  address: "",
  service: "",
  urgency: "Hoy",
};

const defaultSearch = {
  need: "",
  serviceTypeId: "hogar",
  specialty: "Gasfitería domiciliaria",
  commune: "Las Condes",
  urgency: "Hoy",
};

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
  const searchServiceType = getServiceTypeById(search.serviceTypeId) ?? serviceTypes[0];

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
      branches: Number(enterprise.branches),
      planId: options?.planId ? selectedPlan.id : undefined,
      sourceButton: options?.sourceButton ?? "Empresas",
      interest: options?.planId ? `Plan empresa ${selectedPlan.name}` : enterprise.need,
    });
    appendConversionEvent({
      type: "company_lead_created",
      sourceButton: options?.sourceButton ?? "Empresas",
      data: { leadId: saved.id, company: enterprise.company, commune: enterprise.commune, need: enterprise.need },
    });
    setSuccess("Recibimos tu solicitud. Un ejecutivo revisará tu caso.");
  }

  function submitSpecialistLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const serviceType = getServiceTypeById(specialistLead.serviceTypeId) ?? serviceTypes[0];
    const saved = appendSpecialistLead({
      ...specialistLead,
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
      especialidad: search.specialty,
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
                <label className="field">
                  Tipo de servicio
                  <select
                    value={search.serviceTypeId}
                    onChange={(event) => {
                      const serviceTypeId = event.target.value;
                      setSearch({ ...search, serviceTypeId, specialty: getSpecialtiesByServiceType(serviceTypeId)[0] ?? "" });
                    }}
                  >
                    {serviceTypes.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  Especialidad
                  <select value={search.specialty} onChange={(event) => setSearch({ ...search, specialty: event.target.value })}>
                    {searchServiceType.specialties.map((specialty) => (
                      <option key={specialty}>{specialty}</option>
                    ))}
                  </select>
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
        Nombre
        <input value={lead.name} onChange={(event) => onChange({ ...lead, name: event.target.value })} placeholder="Tu nombre" required />
      </label>
      <label className="field">
        Email
        <input value={lead.email} onChange={(event) => onChange({ ...lead, email: event.target.value })} type="email" placeholder="nombre@email.cl" required />
      </label>
      <label className="field">
        WhatsApp
        <input value={lead.whatsapp} onChange={(event) => onChange({ ...lead, whatsapp: event.target.value })} type="tel" placeholder="+56 9 1234 5678" required />
      </label>
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
  return (
    <>
      <label className="field">
        Nombre contacto
        <input value={enterprise.name} onChange={(event) => onChange({ ...enterprise, name: event.target.value })} required />
      </label>
      <label className="field">
        Empresa
        <input value={enterprise.company} onChange={(event) => onChange({ ...enterprise, company: event.target.value })} required />
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
        Rubro
        <input value={enterprise.industry} onChange={(event) => onChange({ ...enterprise, industry: event.target.value })} placeholder="Retail, restaurante, comunidad, planta" required />
      </label>
      <label className="field">
        Número de sucursales
        <input value={enterprise.branches} onChange={(event) => onChange({ ...enterprise, branches: event.target.value })} type="number" min="1" required />
      </label>
      <CommuneSelect value={enterprise.commune} onChange={(commune) => onChange({ ...enterprise, commune })} label="Comuna principal" />
      <label className="field">
        Necesidad
        <select value={enterprise.need} onChange={(event) => onChange({ ...enterprise, need: event.target.value })}>
          <option>Mantención recurrente</option>
          <option>Emergencias</option>
          <option>Bolsa de créditos</option>
          <option>Proveedores técnicos</option>
        </select>
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
        Nombre
        <input value={specialistLead.name} onChange={(event) => onChange({ ...specialistLead, name: event.target.value })} required />
      </label>
      <label className="field">
        Teléfono
        <input value={specialistLead.phone} onChange={(event) => onChange({ ...specialistLead, phone: event.target.value })} type="tel" required />
      </label>
      <label className="field">
        Email
        <input value={specialistLead.email} onChange={(event) => onChange({ ...specialistLead, email: event.target.value })} type="email" required />
      </label>
      <label className="field">
        Tipo de servicio principal
        <select value={specialistLead.serviceTypeId} onChange={(event) => onChange({ ...specialistLead, serviceTypeId: event.target.value })}>
          {serviceTypes.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </label>
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
        Nombre
        <input value={reservation.name} onChange={(event) => onChange({ ...reservation, name: event.target.value })} required />
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
      <label className="field">
        Servicio requerido
        <input value={reservation.service} onChange={(event) => onChange({ ...reservation, service: event.target.value })} required />
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
  return (
    <div className="grid gap-4">
      <div className="rounded-[24px] border border-brand/20 bg-brand-soft p-5">
        <span className="text-sm font-black uppercase text-brand-dark">Especialista seleccionado</span>
        <strong className="mt-2 block text-3xl font-black text-ink">{specialist?.name ?? "Red OficiosPro"}</strong>
        <div className="mt-4 grid gap-3 text-sm font-black text-muted sm:grid-cols-2">
          <span>Servicio: {reservation.service}</span>
          <span>Créditos estimados: {specialist?.credits ?? "por confirmar"}</span>
          <span>Zona de cobertura: {specialist?.commune ?? specialist?.zone ?? reservation.commune}</span>
          <span>Próximo paso: coordinación y validación de disponibilidad</span>
        </div>
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
  return (
    <label className="field">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {chileCommunes.map((commune) => (
          <option key={commune.code} value={commune.name}>{commune.name}</option>
        ))}
      </select>
    </label>
  );
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
