"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import {
  calculateServiceEconomics,
  formatCLP,
  getPlanById,
  getServiceTypeById,
  serviceTypes,
  subscriptionPlans,
  type CommercialConfig,
} from "@/data/marketplace";
import {
  appendPendingSpecialist,
  appendStoredItem,
  getCommercialConfig,
  saveClientProfile,
  setMockSession,
  type PendingSpecialistProfile,
} from "@/lib/storage";
import {
  communesForRegion,
  OTHER_SERVICE_VALUE,
  regionOptions,
  serviceTypeOptions,
  specialtyOptionsForType,
} from "@/lib/catalog";

type ServiceDraft = {
  serviceTypeId: string;
  specialty: string;
  isOtherService: boolean;
  otherServiceDescription: string;
  name: string;
  description: string;
  clientCredits: number;
  specialistPayoutCLP: number;
  initialVisitFree: boolean;
  visitCredits: number;
  duration: string;
  emergency: boolean;
  specialistComments: string;
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
    isOtherService: false,
    otherServiceDescription: "",
    name: "",
    description: "",
    clientCredits: 12,
    specialistPayoutCLP: 7000,
    initialVisitFree: true,
    visitCredits: 0,
    duration: "2 horas",
    emergency: false,
    specialistComments: "",
  };
}

export function LoginForm() {
  const [status, setStatus] = useState("");
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    setIsLocal(["localhost", "127.0.0.1"].includes(window.location.hostname));
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");
    const credentials = {
      "admin@oficiospro.cl": { password: "Admin1234!", role: "admin" as const, name: "Administrador OficiosPro", path: "/admin" },
      "cliente@oficiospro.cl": { password: "Cliente1234!", role: "client" as const, name: "Cliente OficiosPro", path: "/dashboard-cliente" },
      "especialista@oficiospro.cl": { password: "Especialista1234!", role: "specialist" as const, name: "Especialista OficiosPro", path: "/dashboard-especialista" },
      "empresa@oficiospro.cl": { password: "Empresa1234!", role: "company" as const, name: "Empresa OficiosPro", path: "/dashboard-empresa" },
    };
    const account = credentials[email as keyof typeof credentials];

    if (!account || account.password !== password) {
      setStatus("Email o contraseña incorrectos.");
      return;
    }

    setMockSession({ role: account.role, name: account.name, email, createdAt: new Date().toISOString() });
    setStatus("Acceso correcto. Redirigiendo...");
    window.setTimeout(() => {
      window.location.href = account.path;
    }, 500);
  }

  return (
    <FormShell title="Ingresa a OficiosPro" text="Accede a tu cuenta para gestionar reservas, créditos, especialistas o solicitudes de empresa.">
      <form className="grid gap-4" onSubmit={submit}>
        <label className="field">
          Email
          <input name="email" type="email" placeholder="tu@email.cl" autoComplete="email" required />
        </label>
        <label className="field">
          Contraseña
          <input name="password" type="password" minLength={8} placeholder="Tu contraseña" autoComplete="current-password" required />
        </label>
        <button className="btn-primary" type="submit">
          Ingresar
        </button>
        {status ? <SuccessMessage>{status}</SuccessMessage> : null}
        {isLocal ? (
          <details className="rounded-2xl border border-line bg-slate-50 p-4 text-sm font-bold text-muted">
            <summary className="cursor-pointer font-black text-ink">Accesos internos</summary>
            <div className="mt-3 grid gap-2">
              <span>admin@oficiospro.cl / Admin1234!</span>
              <span>cliente@oficiospro.cl / Cliente1234!</span>
              <span>especialista@oficiospro.cl / Especialista1234!</span>
              <span>empresa@oficiospro.cl / Empresa1234!</span>
            </div>
          </details>
        ) : null}
      </form>
    </FormShell>
  );
}

export function ClientRegisterForm() {
  const [status, setStatus] = useState("");
  const [planId, setPlanId] = useState("plus");
  const [commune, setCommune] = useState("Las Condes");
  const [region, setRegion] = useState("Metropolitana de Santiago");
  const [geo, setGeo] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [geoStatus, setGeoStatus] = useState("");
  const [reserveId, setReserveId] = useState("");
  const selectedPlan = getPlanById(planId);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPlan = params.get("plan");
    const requestedReserve = params.get("reserve");
    if (requestedPlan) setPlanId(requestedPlan);
    if (requestedReserve) setReserveId(requestedReserve);
  }, []);

  function useClientLocation() {
    setGeoStatus("Solicitando ubicación...");
    if (!("geolocation" in navigator)) {
      setGeo({ lat: -33.4088, lng: -70.5673 });
      setGeoStatus("Tu navegador no entregó ubicación. Usamos una referencia en Las Condes.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeo({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeoStatus("Ubicación guardada de forma privada en tu perfil.");
      },
      () => {
        setGeo({ lat: -33.4088, lng: -70.5673 });
        setGeoStatus("No se pudo obtener permiso. Usamos una ubicación referencial.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const firstNames = String(data.get("firstNames") ?? "");
    const lastNames = String(data.get("lastNames") ?? "");
    const fullName = `${firstNames} ${lastNames}`.trim();
    appendStoredItem("users", {
      role: "client",
      firstNames,
      lastNames,
      rut: data.get("rut"),
      name: fullName,
      email: data.get("email"),
      phone: data.get("whatsapp"),
      whatsapp: data.get("whatsapp"),
      region,
      commune,
      address: data.get("address"),
      plan: planId,
      referralCode: data.get("referralCode"),
      lat: geo.lat,
      lng: geo.lng,
      createdAt: new Date().toISOString(),
    });
    saveClientProfile({
      firstNames,
      lastNames,
      rut: String(data.get("rut") ?? ""),
      name: fullName,
      email: String(data.get("email") ?? ""),
      phone: String(data.get("whatsapp") ?? ""),
      region,
      commune,
      address: String(data.get("address") ?? ""),
      lat: geo.lat,
      lng: geo.lng,
      planId,
      referralCode: String(data.get("referralCode") ?? ""),
      createdAt: new Date().toISOString(),
    });
    setMockSession({
      role: "client",
      name: fullName || "Cliente OficiosPro",
      email: String(data.get("email") ?? ""),
      planId,
      createdAt: new Date().toISOString(),
    });
    setStatus(reserveId ? "Cuenta creada. Te llevaremos a confirmar tu reserva." : "Cuenta creada. Te llevaremos al checkout para activar tu plan.");
    window.setTimeout(() => {
      window.location.href = reserveId ? `/especialistas?reserve=${reserveId}` : `/checkout?plan=${planId}`;
    }, 650);
  }

  return (
    <FormShell title="Registro cliente" text="Crea tu cuenta para reservar especialistas, activar créditos y encontrar técnicos cerca de ti.">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <label className="field">
          Nombres
          <input name="firstNames" placeholder="Ej: Benjamín" required />
        </label>
        <label className="field">
          Apellidos
          <input name="lastNames" placeholder="Ej: Pérez Peric" required />
        </label>
        <label className="field">
          RUT
          <input name="rut" placeholder="12.345.678-9" required />
          <span className="text-xs font-bold text-muted">RUT para boleta, facturación y validación de cuenta.</span>
        </label>
        <label className="field">
          Email
          <input name="email" type="email" placeholder="nombre@email.cl" required />
        </label>
        <label className="field">
          WhatsApp
          <input name="whatsapp" type="tel" placeholder="+56 9 1234 5678" required />
        </label>
        <SearchableSelect
          label="Región"
          value={region}
          options={regionOptions}
          onChange={(nextRegion) => {
            setRegion(nextRegion);
            setCommune(communesForRegion(nextRegion)[0]?.value ?? commune);
          }}
          required
        />
        <SearchableSelect
          label="Comuna"
          value={commune}
          options={communesForRegion(region)}
          onChange={setCommune}
          placeholder="Busca Vitacura, Ñuñoa, Puerto Varas..."
          required
        />
        <label className="field md:col-span-2">
          Dirección
          <input name="address" placeholder="Ej: Av. Apoquindo 3000, depto 1204" required />
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
        <div className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <strong>Ubicación privada del cliente</strong>
              <p className="mt-1 text-sm font-bold text-muted">Se usa solo para ordenar especialistas cercanos; no se muestra públicamente.</p>
            </div>
            <button className="btn-secondary" type="button" onClick={useClientLocation}>
              Usar mi ubicación
            </button>
          </div>
          <MockMapPin title="Tu ubicación privada" lat={geo.lat} lng={geo.lng} />
          {geoStatus ? <span className="text-sm font-black text-brand-dark">{geoStatus}</span> : null}
        </div>
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
  const [geoStatus, setGeoStatus] = useState("");
  const [baseCommune, setBaseCommune] = useState("Santiago");
  const [baseRegion, setBaseRegion] = useState("Metropolitana de Santiago");
  const [coverageCommunes, setCoverageCommunes] = useState("Santiago, Providencia, Ñuñoa");

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
          next.specialty = specialtyOptionsForType(patch.serviceTypeId)[0]?.value ?? "";
          next.isOtherService = false;
          next.otherServiceDescription = "";
        }
        if (patch.specialty) {
          next.isOtherService = patch.specialty === OTHER_SERVICE_VALUE;
          if (patch.specialty !== OTHER_SERVICE_VALUE) next.otherServiceDescription = "";
        }
        return next;
      }),
    );
  }

  function updateReference(index: number, patch: Partial<ReferenceDraft>) {
    setReferences((current) => current.map((reference, referenceIndex) => (referenceIndex === index ? { ...reference, ...patch } : reference)));
  }

  function useMockLocation() {
    setGeoStatus("Solicitando ubicación...");
    if (!("geolocation" in navigator)) {
      setGeo({ lat: -33.4088, lng: -70.5673 });
      setBaseCommune("Las Condes");
      setBaseRegion("Metropolitana de Santiago");
      setGeoStatus("Tu navegador no entregó ubicación. Usamos una referencia en Las Condes.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeo({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeoStatus("Ubicación capturada y lista para guardar con tu perfil.");
      },
      () => {
        setGeo({ lat: -33.4088, lng: -70.5673 });
        setBaseCommune("Las Condes");
        setBaseRegion("Metropolitana de Santiago");
        setGeoStatus("No se pudo obtener permiso. Usamos una ubicación referencial.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
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
    if (!profilePhoto) {
      setStatus("La foto de perfil es obligatoria.");
      return;
    }
    if (portfolioPhotos.length < 1) {
      setStatus("Debes cargar al menos una foto de portafolio. Recomendamos 3 o más.");
      return;
    }

    const data = new FormData(event.currentTarget);
    const firstNames = String(data.get("firstNames") ?? "");
    const lastNames = String(data.get("lastNames") ?? "");
    const fullName = `${firstNames} ${lastNames}`.trim();
    const mainType = getServiceTypeById(services[0].serviceTypeId);
    const request = appendPendingSpecialist({
      status: "pendiente",
      firstNames,
      lastNames,
      name: fullName,
      rut: String(data.get("rut") ?? ""),
      phone: String(data.get("whatsapp") ?? ""),
      email: String(data.get("email") ?? ""),
      profilePhoto,
      address: String(data.get("address") ?? ""),
      commune: baseCommune,
      region: baseRegion,
      lat: geo.lat,
      lng: geo.lng,
      coverageRadiusKm: Number(data.get("coverageRadiusKm")),
      coverageCommunes: coverageCommunes.split(",").map((item) => item.trim()).filter(Boolean),
      typeServicio: mainType?.name ?? "Hogar",
      specialty: services[0].isOtherService ? services[0].otherServiceDescription : services[0].specialty,
      services: services.map((service) => ({
        ...service,
        isOtherService: service.specialty === OTHER_SERVICE_VALUE,
        economics: calculateServiceEconomics({
          clientCredits: Number(service.clientCredits),
          specialistPayoutCLP: Number(service.specialistPayoutCLP),
          serviceTypeId: service.serviceTypeId,
          config,
        }),
      })),
      references: completedReferences,
      portfolioPhotos,
      certifications: data.getAll("certifications").map(String),
      submittedAt: new Date().toISOString(),
    } satisfies Omit<PendingSpecialistProfile, "id">);
    setMockSession({
      role: "specialist",
      name: fullName || "Especialista OficiosPro",
      email: String(data.get("email") ?? ""),
      createdAt: new Date().toISOString(),
    });
    setStatus(`Tu perfil fue enviado para revisión. Solicitud ${request.id} creada.`);
    window.setTimeout(() => {
      window.location.href = "/dashboard-especialista?submitted=1";
    }, 900);
  }

  return (
    <FormShell title="Postulación especialista" text="Crea tu perfil profesional, declara servicios en créditos y espera aprobación antes de aparecer en el marketplace.">
      <form className="grid gap-6" onSubmit={submit}>
        <section className="grid gap-4 md:grid-cols-2">
          <label className="field">
            Nombres
            <input name="firstNames" placeholder="Ej: Juan" required />
          </label>
          <label className="field">
            Apellidos
            <input name="lastNames" placeholder="Ej: Pérez" required />
          </label>
          <label className="field">
            RUT
            <input name="rut" placeholder="12.345.678-9" required />
          </label>
          <label className="field">
            WhatsApp
            <input name="whatsapp" type="tel" placeholder="+56 9 1234 5678" required />
          </label>
          <label className="field">
            Email
            <input name="email" type="email" placeholder="especialista@email.cl" required />
          </label>
          <label className="field">
            Foto de perfil
            <input type="file" accept="image/*" required onChange={(event) => setProfilePhoto(event.currentTarget.files?.[0]?.name ?? "")} />
          </label>
          <label className="field">
            Dirección base
            <input name="address" placeholder="Dirección de referencia" required />
          </label>
          <SearchableSelect
            label="Región base"
            value={baseRegion}
            options={regionOptions}
            onChange={(nextRegion) => {
              setBaseRegion(nextRegion);
              setBaseCommune(communesForRegion(nextRegion)[0]?.value ?? baseCommune);
            }}
            required
          />
          <SearchableSelect
            label="Comuna base"
            value={baseCommune}
            options={communesForRegion(baseRegion)}
            onChange={setBaseCommune}
            required
          />
          <label className="field">
            Radio de cobertura en km
            <input name="coverageRadiusKm" type="number" min="1" max="120" defaultValue="18" required />
          </label>
          <label className="field">
            Comunas de cobertura
            <input value={coverageCommunes} onChange={(event) => setCoverageCommunes(event.target.value)} placeholder="Ej: Curicó, Molina, Romeral" required />
            <span className="text-xs font-bold text-muted">Sepáralas por coma. Admin podrá revisarlas antes de publicar.</span>
          </label>
          <div className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <strong>Geolocalización del especialista</strong>
              <button className="btn-secondary" type="button" onClick={useMockLocation}>
                Usar mi ubicación
              </button>
            </div>
            <MockMapPin title="Base operativa del especialista" lat={geo.lat} lng={geo.lng} />
            <span className="text-sm font-bold text-muted">Lat {geo.lat.toFixed(4)} · Lng {geo.lng.toFixed(4)} · {baseCommune}</span>
            {geoStatus ? <span className="text-sm font-black text-brand-dark">{geoStatus}</span> : null}
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
              required
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
        <SearchableSelect
          label="Tipo de servicio"
          value={service.serviceTypeId}
          options={serviceTypeOptions}
          onChange={(serviceTypeId) => onChange({ serviceTypeId })}
          required
        />
        <SearchableSelect
          label="Especialidad"
          value={service.specialty}
          options={specialtyOptionsForType(service.serviceTypeId)}
          onChange={(specialty) => onChange({ specialty })}
          placeholder="Busca gasfitería, aire, refrigeración..."
          required
        />
        {service.specialty === OTHER_SERVICE_VALUE ? (
          <label className="field md:col-span-2">
            Describe qué necesitas ofrecer
            <textarea
              value={service.otherServiceDescription}
              onChange={(event) => onChange({ otherServiceDescription: event.target.value })}
              placeholder="Describe la especialidad o servicio que no aparece en el catálogo."
              required
            />
          </label>
        ) : null}
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
        <label className="field md:col-span-2">
          Comentarios del especialista
          <textarea
            value={service.specialistComments}
            onChange={(event) => onChange({ specialistComments: event.target.value })}
            placeholder="Condiciones, cobertura, materiales excluidos o requisitos para tomar el trabajo."
          />
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
  const [region, setRegion] = useState("Metropolitana de Santiago");
  const [commune, setCommune] = useState("Santiago");
  const [serviceType, setServiceType] = useState("empresas");
  const [otherServiceDescription, setOtherServiceDescription] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const enterpriseServiceOptions = [...serviceTypeOptions, { value: OTHER_SERVICE_VALUE, label: "Otro / No encontré mi servicio" }];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const businessName = String(data.get("businessName") ?? "");
    const firstNames = String(data.get("firstNames") ?? "");
    const lastNames = String(data.get("lastNames") ?? "");
    const serviceTypeLabel =
      serviceType === OTHER_SERVICE_VALUE
        ? otherServiceDescription
        : serviceTypeOptions.find((item) => item.value === serviceType)?.label ?? serviceType;
    appendStoredItem("companies", {
      company: businessName,
      businessName,
      companyRut: data.get("companyRut"),
      companyLine: data.get("companyLine"),
      firstNames,
      lastNames,
      contact: `${firstNames} ${lastNames}`.trim(),
      email: data.get("email"),
      whatsapp: data.get("whatsapp"),
      region,
      commune,
      branches: Number(data.get("branches") ?? 1),
      plan: data.get("plan"),
      serviceType: serviceTypeLabel,
      serviceTypeId: serviceType,
      isOtherService: serviceType === OTHER_SERVICE_VALUE,
      otherServiceDescription,
      additionalComments,
      status: "Pendiente",
      createdAt: new Date().toISOString(),
    });
    setMockSession({
      role: "company",
      name: businessName || "Empresa OficiosPro",
      email: String(data.get("email") ?? ""),
      createdAt: new Date().toISOString(),
    });
    setStatus("Solicitud empresa enviada. Quedó visible para revisión comercial.");
  }

  return (
    <FormShell title="Solicitud empresa" text="Cuéntanos el tamaño de tu operación para preparar una cuenta corporativa con créditos, sucursales y facturación mensual.">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <label className="field">
          Razón social
          <input name="businessName" placeholder="Nombre empresa" required />
        </label>
        <label className="field">
          RUT empresa
          <input name="companyRut" placeholder="76.123.456-7" required />
        </label>
        <label className="field">
          Giro
          <input name="companyLine" placeholder="Retail, restaurante, comunidad, planta" required />
        </label>
        <label className="field">
          Nombres contacto
          <input name="firstNames" placeholder="Ej: Camila" required />
        </label>
        <label className="field">
          Apellidos contacto
          <input name="lastNames" placeholder="Ej: Rojas" required />
        </label>
        <label className="field">
          Email corporativo
          <input name="email" type="email" placeholder="operaciones@empresa.cl" required />
        </label>
        <label className="field">
          WhatsApp
          <input name="whatsapp" type="tel" placeholder="+56 9 1234 5678" required />
        </label>
        <SearchableSelect
          label="Región"
          value={region}
          options={regionOptions}
          onChange={(nextRegion) => {
            setRegion(nextRegion);
            setCommune(communesForRegion(nextRegion)[0]?.value ?? commune);
          }}
          required
        />
        <SearchableSelect label="Comuna principal" value={commune} options={communesForRegion(region)} onChange={setCommune} required />
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
        <SearchableSelect
          label="Tipo de servicios requeridos"
          value={serviceType}
          options={enterpriseServiceOptions}
          onChange={(nextServiceType) => {
            setServiceType(nextServiceType);
            setOtherServiceDescription("");
          }}
          required
        />
        {serviceType === OTHER_SERVICE_VALUE ? (
          <label className="field md:col-span-2">
            Describe qué necesitas
            <textarea
              value={otherServiceDescription}
              onChange={(event) => setOtherServiceDescription(event.target.value)}
              placeholder="Ej: mantenciones especiales por sucursal, equipos críticos o servicios que no aparecen en la lista."
              required
            />
          </label>
        ) : null}
        <label className="field md:col-span-2">
          Comentarios adicionales
          <textarea
            value={additionalComments}
            onChange={(event) => setAdditionalComments(event.target.value)}
            placeholder="Horarios, cantidad de locales, necesidades recurrentes, urgencias o contexto operacional."
          />
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

function MockMapPin({ title, lat, lng }: { title: string; lat: number | null; lng: number | null }) {
  const hasLocation = typeof lat === "number" && typeof lng === "number";

  return (
    <div className="relative min-h-44 overflow-hidden rounded-2xl border border-line bg-[linear-gradient(135deg,#e8f4f1_25%,#f8fbfa_25%,#f8fbfa_50%,#e8f4f1_50%,#e8f4f1_75%,#f8fbfa_75%)] bg-[length:32px_32px] p-4">
      <div className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand text-xl font-black text-white shadow-card">
        OP
      </div>
      <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 p-3 shadow-soft">
        <strong className="block text-sm text-ink">{title}</strong>
        <span className="text-xs font-bold text-muted">
          {hasLocation ? `Lat ${lat.toFixed(4)} · Lng ${lng.toFixed(4)}` : "Presiona “Usar mi ubicación” para guardar coordenadas."}
        </span>
      </div>
    </div>
  );
}
