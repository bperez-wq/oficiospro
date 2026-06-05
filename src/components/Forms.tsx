"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { chileCommunes } from "@/data/chileCommunes";
import {
  calculateServiceEconomics,
  formatCLP,
  getPlanById,
  getServiceTypeById,
  getSpecialtiesByServiceType,
  serviceTypes,
  subscriptionPlans,
} from "@/data/marketplace";
import {
  appendStoredItem,
  getCommercialConfig,
  setMockSession,
  type CommercialConfig,
} from "@/lib/storage";

type ServiceDraft = {
  serviceTypeId: string;
  specialty: string;
  name: string;
  description: string;
  clientCredits: number;
  specialistPayoutCLP: number;
  initialVisitFree: boolean;
  visitCredits: number;
  duration: string;
  emergency: boolean;
};

type ReferenceDraft = {
  name: string;
  company: string;
  phone: string;
  email: string;
  work: string;
};

const emptyReference: ReferenceDraft = { name: "", company: "", phone: "", email: "", work: "" };

function createEmptyService(): ServiceDraft {
  const type = serviceTypes[0];
  return {
    serviceTypeId: type.id,
    specialty: type.specialties[0],
    name: "",
    description: "",
    clientCredits: 12,
    specialistPayoutCLP: 7000,
    initialVisitFree: true,
    visitCredits: 0,
    duration: "2 horas",
    emergency: false,
  };
}

export function LoginForm() {
  const [status, setStatus] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setMockSession({
      role: "client",
      name: "Cliente demo",
      email: String(data.get("email") ?? ""),
      createdAt: new Date().toISOString(),
    });
    setStatus("Sesión demo iniciada. Puedes entrar a cualquier dashboard o contratar planes.");
  }

  return (
    <FormShell title="Ingreso demo" text="Accede con cualquier email para revisar dashboards mock. No se conecta a Supabase todavía.">
      <form className="grid gap-4" onSubmit={submit}>
        <label className="field">
          Email
          <input name="email" type="email" placeholder="tu@email.cl" required />
        </label>
        <label className="field">
          Contraseña
          <input name="password" type="password" minLength={4} placeholder="Clave demo" required />
        </label>
        <button className="btn-primary" type="submit">
          Ingresar
        </button>
        {status ? <SuccessMessage>{status}</SuccessMessage> : null}
      </form>
    </FormShell>
  );
}

export function ClientRegisterForm() {
  const [status, setStatus] = useState("");
  const [planId, setPlanId] = useState("plus");
  const selectedPlan = getPlanById(planId);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPlan = params.get("plan");
    if (requestedPlan) setPlanId(requestedPlan);
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    appendStoredItem("users", {
      role: "client",
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      commune: data.get("commune"),
      plan: planId,
      referralCode: data.get("referralCode"),
      createdAt: new Date().toISOString(),
    });
    setMockSession({
      role: "client",
      name: String(data.get("name") ?? "Cliente demo"),
      email: String(data.get("email") ?? ""),
      planId,
      createdAt: new Date().toISOString(),
    });
    setStatus(planId ? "Cuenta creada. Te llevaremos al checkout para activar tu plan." : "Cuenta cliente creada en localStorage.");
    window.setTimeout(() => {
      window.location.href = planId ? `/checkout?plan=${planId}` : "/dashboard-cliente";
    }, 650);
  }

  return (
    <FormShell title="Registro cliente" text="Crea una cuenta demo para reservar especialistas, activar créditos y probar referidos.">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <label className="field">
          Nombre completo
          <input name="name" placeholder="Ej: Benjamín Pérez" required />
        </label>
        <label className="field">
          Email
          <input name="email" type="email" placeholder="nombre@email.cl" required />
        </label>
        <label className="field">
          Teléfono
          <input name="phone" type="tel" placeholder="+56 9 1234 5678" required />
        </label>
        <label className="field">
          Comuna
          <select name="commune" defaultValue="Las Condes">
            {chileCommunes.map((commune) => (
              <option key={commune.code} value={commune.name}>
                {commune.name} · {commune.regionName}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Plan
          <select value={planId} onChange={(event) => setPlanId(event.target.value)}>
            {subscriptionPlans
              .filter((plan) => plan.audience === "cliente")
              .map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} · {plan.monthlyCredits} créditos
                </option>
              ))}
          </select>
        </label>
        <label className="field">
          Código referido
          <input name="referralCode" placeholder="Ej: OP-CLIENTE-10" />
        </label>
        <div className="rounded-2xl border border-brand/10 bg-brand-soft p-4 text-sm font-bold text-brand-dark md:col-span-2">
          Seleccionaste {selectedPlan.name}: {formatCLP(selectedPlan.priceCLP)}/mes, {selectedPlan.monthlyCredits} créditos mensuales acumulables hasta {selectedPlan.accumulatesMonths} meses.
        </div>
        <button className="btn-primary md:col-span-2" type="submit">
          Crear cuenta y continuar
        </button>
        {status ? <SuccessMessage className="md:col-span-2">{status}</SuccessMessage> : null}
      </form>
    </FormShell>
  );
}

export function SpecialistRegisterForm() {
  const [status, setStatus] = useState("");
  const [config, setConfig] = useState<CommercialConfig | null>(null);
  const [services, setServices] = useState<ServiceDraft[]>([createEmptyService()]);
  const [references, setReferences] = useState<ReferenceDraft[]>([{ ...emptyReference }, { ...emptyReference }, { ...emptyReference }]);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);
  const [geo, setGeo] = useState({ lat: -33.4489, lng: -70.6693 });
  const [baseCommune, setBaseCommune] = useState("Santiago");
  const [baseRegion, setBaseRegion] = useState("Metropolitana de Santiago");

  useEffect(() => {
    setConfig(getCommercialConfig());
  }, []);

  const completedReferences = references.filter((reference) => reference.name && reference.phone && reference.work);
  const hasEvenCredits = services.every((service) => Number(service.clientCredits) % 2 === 0);
  const hasLowMargin = services.some((service) => {
    if (!config) return false;
    return calculateServiceEconomics({
      clientCredits: Number(service.clientCredits),
      specialistPayoutCLP: Number(service.specialistPayoutCLP),
      serviceTypeId: service.serviceTypeId,
      config,
    }).status === "Revisar";
  });

  function updateService(index: number, patch: Partial<ServiceDraft>) {
    setServices((current) =>
      current.map((service, serviceIndex) => {
        if (serviceIndex !== index) return service;
        const next = { ...service, ...patch };
        if (patch.serviceTypeId) {
          const nextSpecialties = getSpecialtiesByServiceType(patch.serviceTypeId);
          next.specialty = nextSpecialties[0] ?? "";
        }
        return next;
      }),
    );
  }

  function updateReference(index: number, patch: Partial<ReferenceDraft>) {
    setReferences((current) => current.map((reference, referenceIndex) => (referenceIndex === index ? { ...reference, ...patch } : reference)));
  }

  function useMockLocation() {
    setGeo({ lat: -33.4088, lng: -70.5673 });
    setBaseCommune("Las Condes");
    setBaseRegion("Metropolitana de Santiago");
    setStatus("Ubicación mock aplicada: Las Condes.");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!config) return;
    if (!hasEvenCredits) {
      setStatus("Revisa tus servicios: los créditos del cliente deben ser números pares.");
      return;
    }
    if (completedReferences.length < 3) {
      setStatus("Debes completar al menos 3 referencias laborales con nombre, teléfono y trabajo realizado.");
      return;
    }

    const data = new FormData(event.currentTarget);
    const mainType = getServiceTypeById(services[0].serviceTypeId);
    const request = appendStoredItem("specialists", {
      status: "pendiente",
      name: data.get("name"),
      rut: data.get("rut"),
      phone: data.get("phone"),
      email: data.get("email"),
      profilePhoto,
      address: data.get("address"),
      commune: baseCommune,
      region: baseRegion,
      lat: geo.lat,
      lng: geo.lng,
      coverageRadiusKm: Number(data.get("coverageRadiusKm")),
      typeServicio: mainType?.name,
      specialty: services[0].specialty,
      services: services.map((service) => ({
        ...service,
        economics: calculateServiceEconomics({
          clientCredits: Number(service.clientCredits),
          specialistPayoutCLP: Number(service.specialistPayoutCLP),
          serviceTypeId: service.serviceTypeId,
          config,
        }),
      })),
      references: completedReferences,
      portfolioPhotos,
      certifications: data.getAll("certifications"),
      submittedAt: new Date().toISOString(),
    });
    setMockSession({
      role: "specialist",
      name: String(data.get("name") ?? "Especialista demo"),
      email: String(data.get("email") ?? ""),
      createdAt: new Date().toISOString(),
    });
    setStatus(`Tu perfil fue enviado para revisión. Solicitud ${"id" in request ? request.id : "mock"} creada.`);
    window.setTimeout(() => {
      window.location.href = "/dashboard-especialista?submitted=1";
    }, 900);
  }

  return (
    <FormShell title="Postulación especialista" text="Crea tu perfil profesional, declara servicios en créditos y deja la solicitud lista para revisión admin.">
      <form className="grid gap-6" onSubmit={submit}>
        <section className="grid gap-4 md:grid-cols-2">
          <label className="field">
            Nombre completo
            <input name="name" placeholder="Ej: Juan Pérez" required />
          </label>
          <label className="field">
            RUT
            <input name="rut" placeholder="12.345.678-9" required />
          </label>
          <label className="field">
            Teléfono
            <input name="phone" type="tel" placeholder="+56 9 1234 5678" required />
          </label>
          <label className="field">
            Email
            <input name="email" type="email" placeholder="especialista@email.cl" required />
          </label>
          <label className="field">
            Foto de perfil
            <input type="file" accept="image/*" onChange={(event) => setProfilePhoto(event.currentTarget.files?.[0]?.name ?? "")} />
          </label>
          <label className="field">
            Dirección base
            <input name="address" placeholder="Dirección de referencia" required />
          </label>
          <label className="field">
            Comuna base
            <select
              value={`${baseCommune}|${baseRegion}`}
              onChange={(event) => {
                const [commune, region] = event.target.value.split("|");
                setBaseCommune(commune);
                setBaseRegion(region);
              }}
            >
              {chileCommunes.map((commune) => (
                <option key={commune.code} value={`${commune.name}|${commune.regionName}`}>
                  {commune.name} · {commune.regionName}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Radio de cobertura en km
            <input name="coverageRadiusKm" type="number" min="1" max="120" defaultValue="18" required />
          </label>
          <div className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <strong>Geolocalización mock</strong>
              <button className="btn-secondary" type="button" onClick={useMockLocation}>
                Usar mi ubicación
              </button>
            </div>
            <span className="text-sm font-bold text-muted">Lat {geo.lat.toFixed(4)} · Lng {geo.lng.toFixed(4)} · {baseCommune}</span>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Servicios ofrecidos</p>
              <h3 className="text-2xl font-black">Precio en créditos y pago especialista</h3>
            </div>
            <button className="btn-secondary" type="button" onClick={() => setServices((current) => [...current, createEmptyService()])}>
              Agregar servicio
            </button>
          </div>

          {services.map((service, index) => (
            <ServiceEditor key={index} service={service} index={index} config={config ?? getCommercialConfig()} onChange={(patch) => updateService(index, patch)} />
          ))}

          {!hasEvenCredits ? <Warning>Los créditos del servicio deben ser números pares.</Warning> : null}
          {hasLowMargin ? <Warning>Hay servicios con margen menor al mínimo configurado. Admin podrá revisarlos antes de aprobar.</Warning> : null}
        </section>

        <section className="grid gap-4">
          <div>
            <p className="eyebrow">Referencias laborales</p>
            <h3 className="text-2xl font-black">Mínimo 3 referencias verificables</h3>
          </div>
          <div className="grid gap-4">
            {references.map((reference, index) => (
              <article key={index} className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 md:grid-cols-5">
                <label className="field">
                  Nombre
                  <input value={reference.name} onChange={(event) => updateReference(index, { name: event.target.value })} required />
                </label>
                <label className="field">
                  Empresa/persona
                  <input value={reference.company} onChange={(event) => updateReference(index, { company: event.target.value })} required />
                </label>
                <label className="field">
                  Teléfono
                  <input value={reference.phone} onChange={(event) => updateReference(index, { phone: event.target.value })} required />
                </label>
                <label className="field">
                  Email
                  <input type="email" value={reference.email} onChange={(event) => updateReference(index, { email: event.target.value })} />
                </label>
                <label className="field">
                  Trabajo realizado
                  <input value={reference.work} onChange={(event) => updateReference(index, { work: event.target.value })} required />
                </label>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <label className="field">
            Portafolio fotográfico
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setPortfolioPhotos(Array.from(event.currentTarget.files ?? []).map((file) => file.name))}
            />
          </label>
          <div className="rounded-2xl border border-line bg-slate-50 p-4 text-sm font-bold text-muted">
            Sugerencia: carga al menos 3 imágenes de antes/después, instalaciones o mantenciones realizadas. Archivos seleccionados: {portfolioPhotos.length}.
          </div>
          <fieldset className="grid gap-3 rounded-2xl border border-line bg-white p-4 md:col-span-2">
            <legend className="px-2 text-sm font-black text-ink">Certificaciones</legend>
            {["SEC", "HVAC", "Gas", "Soldadura", "Otro"].map((certification) => (
              <label key={certification} className="flex items-center gap-3 text-sm font-bold text-muted">
                <input name="certifications" type="checkbox" value={certification} /> {certification}
              </label>
            ))}
          </fieldset>
        </section>

        <button className="btn-primary" type="submit">
          Enviar perfil para revisión
        </button>
        {status ? <SuccessMessage>{status}</SuccessMessage> : null}
      </form>
    </FormShell>
  );
}

function ServiceEditor({
  service,
  index,
  config,
  onChange,
}: {
  service: ServiceDraft;
  index: number;
  config: CommercialConfig;
  onChange: (patch: Partial<ServiceDraft>) => void;
}) {
  const serviceType = getServiceTypeById(service.serviceTypeId) ?? serviceTypes[0];
  const economics = calculateServiceEconomics({
    clientCredits: Number(service.clientCredits),
    specialistPayoutCLP: Number(service.specialistPayoutCLP),
    serviceTypeId: service.serviceTypeId,
    config,
  });

  return (
    <article className="grid gap-4 rounded-[24px] border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <strong>Servicio {index + 1}</strong>
        <span className={`chip ${economics.status === "OK" ? "bg-brand-soft text-brand-dark" : "bg-amber-50 text-amber-800"}`}>
          Margen {economics.status}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="field">
          Tipo de servicio
          <select value={service.serviceTypeId} onChange={(event) => onChange({ serviceTypeId: event.target.value })}>
            {serviceTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Especialidad
          <select value={service.specialty} onChange={(event) => onChange({ specialty: event.target.value })}>
            {serviceType.specialties.map((specialty) => (
              <option key={specialty}>{specialty}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Nombre del servicio
          <input value={service.name} onChange={(event) => onChange({ name: event.target.value })} placeholder="Ej: Reparación de filtración" required />
        </label>
        <label className="field">
          Duración estimada
          <input value={service.duration} onChange={(event) => onChange({ duration: event.target.value })} placeholder="Ej: 2 horas" required />
        </label>
        <label className="field md:col-span-2">
          Descripción
          <textarea value={service.description} onChange={(event) => onChange({ description: event.target.value })} placeholder="Qué incluye, condiciones y materiales excluidos" required />
        </label>
        <label className="field">
          Precio cliente en créditos
          <input type="number" min="2" step="2" value={service.clientCredits} onChange={(event) => onChange({ clientCredits: Number(event.target.value) })} required />
        </label>
        <label className="field">
          Monto que cobra especialista CLP
          <input type="number" min="0" step="1000" value={service.specialistPayoutCLP} onChange={(event) => onChange({ specialistPayoutCLP: Number(event.target.value) })} required />
        </label>
        <label className="field">
          Visita inicial gratis
          <select value={service.initialVisitFree ? "yes" : "no"} onChange={(event) => onChange({ initialVisitFree: event.target.value === "yes" })}>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </select>
        </label>
        <label className="field">
          Precio visita en créditos
          <input type="number" min="0" step="2" value={service.visitCredits} disabled={service.initialVisitFree} onChange={(event) => onChange({ visitCredits: Number(event.target.value) })} />
        </label>
        <label className="field">
          Disponible emergencia
          <select value={service.emergency ? "yes" : "no"} onChange={(event) => onChange({ emergency: event.target.value === "yes" })}>
            <option value="no">No</option>
            <option value="yes">Sí</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-muted md:grid-cols-5">
        <span>Ingreso cliente: {formatCLP(economics.incomeCLP)}</span>
        <span>Pago especialista: {formatCLP(economics.specialistPayoutCLP)}</span>
        <span>Margen plataforma: {formatCLP(economics.marginCLP)}</span>
        <span>Mínimo: {formatCLP(economics.minMarginCLP)}</span>
        <span>Estado margen: {economics.status}</span>
      </div>
    </article>
  );
}

export function CompanyRequestForm() {
  const [status, setStatus] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    appendStoredItem("companies", {
      company: data.get("company"),
      rut: data.get("rut"),
      contact: data.get("contact"),
      email: data.get("email"),
      branches: data.get("branches"),
      plan: data.get("plan"),
      status: "Pendiente",
      createdAt: new Date().toISOString(),
    });
    setMockSession({
      role: "company",
      name: String(data.get("company") ?? "Empresa demo"),
      email: String(data.get("email") ?? ""),
      createdAt: new Date().toISOString(),
    });
    event.currentTarget.reset();
    setStatus("Solicitud empresa guardada. Quedó visible en admin.");
  }

  return (
    <FormShell title="Solicitud empresa" text="Cuéntanos el tamaño de tu operación para simular una cuenta corporativa.">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <label className="field">
          Empresa
          <input name="company" placeholder="Nombre empresa" required />
        </label>
        <label className="field">
          RUT
          <input name="rut" placeholder="76.123.456-7" />
        </label>
        <label className="field">
          Contacto
          <input name="contact" placeholder="Nombre contacto" required />
        </label>
        <label className="field">
          Email
          <input name="email" type="email" placeholder="operaciones@empresa.cl" required />
        </label>
        <label className="field">
          Sucursales
          <input name="branches" type="number" min="1" defaultValue="1" />
        </label>
        <label className="field">
          Plan
          <select name="plan">
            <option>Pyme</option>
            <option>Empresa</option>
            <option>Corporativo</option>
          </select>
        </label>
        <button className="btn-primary md:col-span-2" type="submit">
          Enviar solicitud
        </button>
        {status ? <SuccessMessage className="md:col-span-2">{status}</SuccessMessage> : null}
      </form>
    </FormShell>
  );
}

function FormShell({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-line bg-white p-6 shadow-soft">
      <div className="mb-6">
        <p className="eyebrow">Formulario seguro</p>
        <h2 className="text-3xl font-black">{title}</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-muted">{text}</p>
      </div>
      {children}
    </section>
  );
}

function SuccessMessage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`rounded-2xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark ${className}`}>
      {children}
    </p>
  );
}

function Warning({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 font-black text-amber-800">{children}</p>;
}
