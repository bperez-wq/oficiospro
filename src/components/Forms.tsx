"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { RegionCommuneSelect } from "@/components/RegionCommuneSelect";
import { SearchableSelect } from "@/components/SearchableSelect";
import {
  formatCLP,
  getPlanById,
  getServiceTypeById,
  serviceTypes,
  subscriptionPlans,
} from "@/data/marketplace";
import { pricingModeLabels, pricingModeOptions, type PricingMode } from "@/data/flexiblePricing";
import {
  appendPendingSpecialist,
  appendStoredItem,
  saveClientProfile,
  setMockSession,
  type PendingSpecialistProfile,
} from "@/lib/storage";
import {
  DEFAULT_REGION_CODE,
  OTHER_SERVICE_VALUE,
  regionNameForCode,
  serviceTypeOptions,
  specialtyOptionsForType,
} from "@/lib/catalog";
import { calculateClientCreditsFromSpecialistPayout, estimatePlatformMarginCLP } from "@/lib/pricing";
import { submitLead } from "@/lib/leadClient";

type ServiceDraft = {
  serviceTypeId: string;
  specialty: string;
  isOtherService: boolean;
  otherServiceDescription: string;
  name: string;
  description: string;
  pricingMode: PricingMode;
  fixedCredits: number;
  hourlyCredits: number;
  minHours: number;
  maxHours: number;
  minCredits: number;
  maxCredits: number;
  specialistExpectedPayoutCLP: number;
  clientCredits: number;
  specialistPayoutCLP: number;
  initialVisitFree: boolean;
  visitCredits: number;
  materialsIncludedBoolean: boolean;
  materialsChargedSeparately: boolean;
  requiresPriorEvaluation: boolean;
  duration: string;
  estimatedDurationMinMinutes: number;
  estimatedDurationMaxMinutes: number;
  estimatedDurationMinutes: number;
  materialsIncluded: string;
  conditions: string;
  serviceCommunes: string;
  emergency: boolean;
  certificationRequired: boolean;
  specialistComments: string;
};

type ReferenceDraft = {
  name: string;
  company: string;
  phone: string;
  email: string;
  work: string;
  year: string;
};

const emptyReference: ReferenceDraft = { name: "", company: "", phone: "", email: "", work: "", year: "" };
const noFormalCertificationLabel = "No tengo certificaciones formales";
const certificationOptions = ["SEC", "HVAC", "Gas", "Soldadura", "Otro"];
const specialistSuccessMessage =
  "Recibimos tu postulación. El equipo OficiosPro revisará tus datos y te contactará para avanzar con la verificación.";
const specialistDbFallbackMessage =
  "Recibimos tu intención de postular. Si no recibes contacto pronto, escríbenos a bperez@oficiospro.cl.";

function createEmptyService(): ServiceDraft {
  const type = serviceTypes[0];
  return {
    serviceTypeId: type.id,
    specialty: type.specialties[0],
    isOtherService: false,
    otherServiceDescription: "",
    name: "",
    description: "",
    pricingMode: "fixed",
    fixedCredits: 12,
    hourlyCredits: 8,
    minHours: 2,
    maxHours: 4,
    minCredits: 12,
    maxCredits: 30,
    specialistExpectedPayoutCLP: 25000,
    clientCredits: 0,
    specialistPayoutCLP: 25000,
    initialVisitFree: true,
    visitCredits: 6,
    materialsIncludedBoolean: false,
    materialsChargedSeparately: true,
    requiresPriorEvaluation: false,
    duration: "2 horas",
    estimatedDurationMinMinutes: 120,
    estimatedDurationMaxMinutes: 240,
    estimatedDurationMinutes: 120,
    materialsIncluded: "",
    conditions: "",
    serviceCommunes: "",
    emergency: false,
    certificationRequired: false,
    specialistComments: "",
  };
}

function normalizeSpecialistCLPInput(value: string | number) {
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/[^\d]/g, ""));
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.round(numeric);
}

function serviceHasPricingBasis(service: ServiceDraft) {
  if (service.pricingMode === "hourly") return Number(service.minHours) > 0 && Number(service.maxHours) >= Number(service.minHours);
  if (service.pricingMode === "quote_required") return true;
  return true;
}

function estimatedClientCreditsForService(service: ServiceDraft) {
  const payout = normalizeSpecialistCLPInput(service.specialistExpectedPayoutCLP);
  if (!payout) return 0;
  return calculateClientCreditsFromSpecialistPayout({
    specialistExpectedPayoutCLP: payout,
    categoryId: service.serviceTypeId,
    serviceId: service.serviceTypeId,
    emergency: service.emergency,
  });
}

function estimatedMarginForService(service: ServiceDraft) {
  const payout = normalizeSpecialistCLPInput(service.specialistExpectedPayoutCLP);
  if (!payout) return 0;
  return estimatePlatformMarginCLP({
    specialistExpectedPayoutCLP: payout,
    categoryId: service.serviceTypeId,
    serviceId: service.serviceTypeId,
    emergency: service.emergency,
  });
}

function marginWarningForService(service: ServiceDraft) {
  const marginCLP = estimatedMarginForService(service);
  return service.specialistExpectedPayoutCLP > 0 && marginCLP < 5000;
}

export function LoginForm() {
  const [status, setStatus] = useState("");
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    setIsLocal(["localhost", "127.0.0.1"].includes(window.location.hostname));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
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
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-muted">
          <label className="flex items-center gap-2">
            <input name="remember" type="checkbox" />
            Recordarme
          </label>
          <Link className="font-black text-brand-dark transition hover:text-brand" href="/registro-cliente">
            Olvidé mi contraseña
          </Link>
        </div>
        <button className="btn-primary" type="submit">
          Ingresar
        </button>
        <div className="grid gap-2 rounded-2xl border border-line bg-slate-50 p-4 text-sm font-bold text-muted sm:grid-cols-3">
          <Link className="font-black text-brand-dark transition hover:text-brand" href="/registro-cliente">
            Crear cuenta
          </Link>
          <Link className="font-black text-brand-dark transition hover:text-brand" href="/registro-especialista">
            Soy especialista
          </Link>
          <Link className="font-black text-brand-dark transition hover:text-brand" href="/empresas">
            Soy empresa
          </Link>
        </div>
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
  const [region, setRegion] = useState(DEFAULT_REGION_CODE);
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

  async function submit(event: FormEvent<HTMLFormElement>) {
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
      region: regionNameForCode(region),
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
      region: regionNameForCode(region),
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
    await submitLead({
      leadType: "club_hogar_interest",
      fullName: fullName || "Cliente OficiosPro",
      email: String(data.get("email") ?? ""),
      phone: String(data.get("whatsapp") ?? ""),
      service: selectedPlan.name,
      regionCode: region,
      regionName: regionNameForCode(region),
      communeName: commune,
      sourceComponent: "ClientRegisterForm",
      sourceButton: "Crear cuenta y continuar",
      referralCode: String(data.get("referralCode") ?? ""),
      payload: { planId, rut: data.get("rut"), address: data.get("address"), reserveId },
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
          <input name="firstNames" placeholder="Ej: Juan" required />
        </label>
        <label className="field">
          Apellidos
          <input name="lastNames" placeholder="Ej: Pérez" required />
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
        <RegionCommuneSelect
          region={region}
          commune={commune}
          onRegionChange={(nextRegion) => {
            setRegion(nextRegion);
            setCommune("");
          }}
          onCommuneChange={setCommune}
          communePlaceholder="Busca Vitacura, Ñuñoa, Puerto Varas..."
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
  const [step, setStep] = useState(1);
  const [identity, setIdentity] = useState({
    firstNames: "",
    lastNames: "",
    rut: "",
    whatsapp: "",
    email: "",
  });
  const [services, setServices] = useState<ServiceDraft[]>([createEmptyService()]);
  const [references, setReferences] = useState<ReferenceDraft[]>([{ ...emptyReference }, { ...emptyReference }, { ...emptyReference }]);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [hasNoFormalCertifications, setHasNoFormalCertifications] = useState(false);
  const [otherCertificationText, setOtherCertificationText] = useState("");
  const [consentContact, setConsentContact] = useState(false);
  const [consentVerification, setConsentVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [geo, setGeo] = useState({ lat: -33.4489, lng: -70.6693 });
  const [geoStatus, setGeoStatus] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [coverageRadiusKm, setCoverageRadiusKm] = useState(18);
  const [baseCommune, setBaseCommune] = useState("Santiago");
  const [baseRegion, setBaseRegion] = useState(DEFAULT_REGION_CODE);
  const [coverageCommunes, setCoverageCommunes] = useState("Santiago, Providencia, Ñuñoa");

  const completedReferences = references.filter((reference) => reference.name && reference.phone && reference.work);

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
      setBaseRegion(DEFAULT_REGION_CODE);
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
        setBaseRegion(DEFAULT_REGION_CODE);
        setGeoStatus("No se pudo obtener permiso. Usamos una ubicación referencial.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function validateStep(currentStep = step) {
    if (currentStep === 1) {
      const hasName = `${identity.firstNames} ${identity.lastNames}`.trim().length > 1;
      if (!hasName || !identity.whatsapp || !identity.email) {
        setStatus("Completa nombre completo o nombre comercial, WhatsApp o telefono y email para continuar.");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!baseRegion || !baseCommune) {
        setStatus("Selecciona region y comuna principal para revisar cobertura real.");
        return false;
      }
    }
    if (currentStep === 3) {
      if (!services.length) {
        setStatus("Agrega al menos un servicio principal.");
        return false;
      }
      if (services.some((service) => !service.name.trim() || !service.description.trim() || !service.duration.trim())) {
        setStatus("Completa nombre, descripcion breve y duracion estimada de cada servicio.");
        return false;
      }
      if (services.some((service) => service.pricingMode !== "quote_required" && Number(service.specialistExpectedPayoutCLP) <= 0)) {
        setStatus("Completa el monto esperado en CLP cuando el servicio tenga precio fijo, por hora, rango o visita tecnica.");
        return false;
      }
      if (services.some((service) => !serviceHasPricingBasis(service))) {
        setStatus("Completa horas, duracion y tarifa esperada segun la modalidad seleccionada. OficiosPro calculara los creditos cliente.");
        return false;
      }
      if (services.some((service) => service.specialty === OTHER_SERVICE_VALUE && !service.otherServiceDescription.trim())) {
        setStatus("Describe el servicio cuando selecciones Otro servicio.");
        return false;
      }
    }
    if (currentStep === 5 && (!consentContact || !consentVerification)) {
      setStatus("Autoriza el contacto y la revision de antecedentes para enviar tu postulacion.");
      return false;
    }
    setStatus("");
    return true;
  }

  function nextStep() {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(5, current + 1));
  }

  function previousStep() {
    setStatus("");
    setStep((current) => Math.max(1, current - 1));
  }

  function toggleCertification(certification: string) {
    if (certification === noFormalCertificationLabel) {
      const nextNoFormal = !hasNoFormalCertifications;
      setHasNoFormalCertifications(nextNoFormal);
      if (nextNoFormal) {
        setSelectedCertifications([]);
        setOtherCertificationText("");
      }
      return;
    }
    setHasNoFormalCertifications(false);
    setSelectedCertifications((current) =>
      current.includes(certification) ? current.filter((item) => item !== certification) : [...current, certification],
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    for (const currentStep of [1, 2, 3, 4, 5]) {
      if (!validateStep(currentStep)) {
        setStep(currentStep);
        return;
      }
    }
    setIsSubmitting(true);
    setStatus("Enviando...");

    try {
    const firstNames = identity.firstNames;
    const lastNames = identity.lastNames;
    const fullName = `${firstNames} ${lastNames}`.trim();
    const mainType = getServiceTypeById(services[0].serviceTypeId);
    const primaryService = services[0];
    const now = new Date().toISOString();
    const normalizedServices = services.map((service) => {
      const calculatedClientCredits = estimatedClientCreditsForService(service);
      const rangeMaxCredits = calculatedClientCredits ? calculatedClientCredits + 10 : 0;
      return {
        ...service,
        isOtherService: service.specialty === OTHER_SERVICE_VALUE,
        specialistExpectedPayoutCLP: normalizeSpecialistCLPInput(service.specialistExpectedPayoutCLP),
        specialistPayoutCLP: normalizeSpecialistCLPInput(service.specialistExpectedPayoutCLP),
        fixedCredits: service.pricingMode === "fixed" ? calculatedClientCredits : 0,
        hourlyCredits: service.pricingMode === "hourly" ? calculatedClientCredits : 0,
        minHours: Number(service.minHours || 0),
        maxHours: Number(service.maxHours || 0),
        minCredits: ["range", "custom", "quote_required"].includes(service.pricingMode) ? calculatedClientCredits : 0,
        maxCredits: ["range", "custom", "quote_required"].includes(service.pricingMode) ? rangeMaxCredits : 0,
        visitCredits: ["visit_then_quote", "quote_required"].includes(service.pricingMode) ? calculatedClientCredits : 0,
        clientCredits: service.pricingMode === "fixed" ? calculatedClientCredits : 0,
        pricingStatus: marginWarningForService(service) ? "pending_review" as const : "approved" as const,
        pricingNotesInternal: marginWarningForService(service)
          ? "Margen bajo detectado. OficiosPro debe revisar antes de publicar."
          : "Tarifa declarada por especialista. OficiosPro calcula creditos cliente antes de publicar.",
        emergencyAvailable: service.emergency,
      };
    });
    const request = appendPendingSpecialist({
      status: "pendiente",
      reviewStatus: "pendiente_revision",
      certificationStatus: hasNoFormalCertifications || selectedCertifications.length === 0 ? "sin_certificacion_declarada" : "certificacion_declarada_pendiente_revision",
      firstNames,
      lastNames,
      name: fullName,
      rut: identity.rut,
      phone: identity.whatsapp,
      email: identity.email,
      profilePhoto,
      address: baseAddress,
      commune: baseCommune,
      region: regionNameForCode(baseRegion),
      lat: geo.lat,
      lng: geo.lng,
      coverageRadiusKm,
      coverageCommunes: coverageCommunes.split(",").map((item) => item.trim()).filter(Boolean),
      typeServicio: mainType?.name ?? "Hogar",
      specialty: primaryService.isOtherService ? primaryService.otherServiceDescription : primaryService.specialty,
      services: normalizedServices,
      references: completedReferences,
      portfolioPhotos,
      certifications: selectedCertifications,
      hasNoFormalCertifications,
      otherCertificationText,
      submittedAt: now,
    } satisfies Omit<PendingSpecialistProfile, "id">);
    setMockSession({
      role: "specialist",
      name: fullName || "Especialista OficiosPro",
      email: identity.email,
      createdAt: now,
    });
    const servicesPayload = normalizedServices.map((service) => ({
      serviceTypeId: service.serviceTypeId,
      serviceName: service.name,
      serviceDescription: service.description,
      specialty: service.isOtherService ? service.otherServiceDescription : service.specialty,
      pricingMode: service.pricingMode,
      fixedCredits: service.fixedCredits,
      hourlyCredits: service.hourlyCredits,
      minHours: service.minHours,
      maxHours: service.maxHours,
      minCredits: service.minCredits,
      maxCredits: service.maxCredits,
      visitCredits: service.visitCredits,
      specialistExpectedPayoutCLP: service.specialistExpectedPayoutCLP,
      materialsIncludedBoolean: service.materialsIncludedBoolean,
      materialsChargedSeparately: service.materialsChargedSeparately,
      requiresPriorEvaluation: service.requiresPriorEvaluation,
      estimatedDurationMinMinutes: service.estimatedDurationMinMinutes,
      estimatedDurationMaxMinutes: service.estimatedDurationMaxMinutes,
      estimatedDurationMinutes: service.estimatedDurationMinutes,
      duration: service.duration,
      materialsIncluded: service.materialsIncluded,
      conditions: service.conditions,
      emergencyAvailable: service.emergency,
      serviceCommunes: service.serviceCommunes,
      pricingStatus: "pending_review",
    }));
    const leadResult = await submitLead({
      leadType: "specialist_application",
      fullName: fullName || "Especialista OficiosPro",
      email: identity.email,
      phone: identity.whatsapp,
      applicantType: "specialist",
      trade: mainType?.name ?? "Hogar",
      service: primaryService.isOtherService ? primaryService.otherServiceDescription : primaryService.specialty,
      regionCode: baseRegion,
      regionName: regionNameForCode(baseRegion),
      communeName: baseCommune,
      sourceComponent: "SpecialistRegisterForm",
      sourceButton: "Enviar perfil para revisión",
      consentContact,
      consentTerms: consentVerification,
      payload: {
        localRequestId: request.id,
        fullName,
        email: identity.email,
        phone: identity.whatsapp,
        applicantType: "specialist",
        primaryTrade: mainType?.name ?? "Hogar",
        services: servicesPayload,
        yearsExperience: "",
        availability: "Pendiente de coordinar",
        regionCode: baseRegion,
        regionName: regionNameForCode(baseRegion),
        communeName: baseCommune,
        additionalCommunes: coverageCommunes.split(",").map((item) => item.trim()).filter(Boolean),
        handlesEmergencies: services.some((service) => service.emergency),
        servesBusinesses: mainType?.marginType === "company",
        certifications: selectedCertifications,
        otherCertificationText,
        hasNoFormalCertifications,
        referencesText: completedReferences.map((reference) => `${reference.name} - ${reference.phone} - ${reference.work}`).join("\n"),
        portfolioUrl: portfolioPhotos.join(", "),
        notes: services.map((service) => service.specialistComments).filter(Boolean).join("\n"),
        consentContact,
        consentVerification,
        sourcePage: "/registro-especialista",
        sourceComponent: "SpecialistRegisterForm",
        sourceButton: "Enviar perfil para revisión",
        createdAt: now,
        userAgent: window.navigator.userAgent,
        status: "postulado",
        reviewStatus: "pendiente_revision",
        certificationStatus: hasNoFormalCertifications || selectedCertifications.length === 0 ? "sin_certificacion_declarada" : "certificacion_declarada_pendiente_revision",
      },
    });
    if (!leadResult.ok && leadResult.error !== "database_not_configured") {
      setStatus(leadResult.message);
      return;
    }
    setSubmitted(true);
    setStatus(leadResult.error === "database_not_configured" ? specialistDbFallbackMessage : specialistSuccessMessage);
    window.setTimeout(() => {
      window.location.href = "/?postulacion=recibida";
    }, 2500);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error(error);
      setStatus("No pudimos completar el envio ahora. Escribenos a bperez@oficiospro.cl y revisaremos tu postulacion.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormShell title="Postulación especialista" text="Tu oficio merece visibilidad, confianza y mejores oportunidades. Completa este onboarding para construir reputación desde el primer trabajo.">
      <form className="grid gap-6" onSubmit={submit}>
        <div className="grid gap-3 md:grid-cols-5">
          {[
            ["Identidad", "Datos y contacto"],
            ["Cobertura", "Comuna y radio"],
            ["Servicios", "Tarifa esperada"],
            ["Referencias", "Opcional"],
            ["Revision", "Envio final"],
          ].map(([title, text], index) => (
            <button
              key={title}
              className={`rounded-2xl border p-4 text-left transition ${
                step === index + 1 ? "border-brand bg-brand text-white shadow-lg shadow-brand/20" : "border-line bg-slate-50 text-ink hover:border-brand/40"
              }`}
              type="button"
              onClick={() => setStep(index + 1)}
            >
              <span className="text-xs font-black uppercase">Paso {index + 1}</span>
              <strong className="mt-1 block">{title}</strong>
              <span className={`mt-1 block text-xs font-bold ${step === index + 1 ? "text-white/75" : "text-muted"}`}>{text}</span>
            </button>
          ))}
        </div>
        <div className="rounded-3xl border border-brand/15 bg-brand-soft p-5">
          <p className="text-sm font-black uppercase text-brand">Empoderamos el oficio. Empoderamos al trabajador.</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-brand-dark">
            Cada trabajo bien hecho construye tu reputación. OficiosPro muestra tu experiencia, certificaciones y portafolio para que buenos especialistas sean encontrados y recomendados.
          </p>
        </div>
        <section className={step <= 2 ? "grid gap-4 md:grid-cols-2" : "hidden"}>
          <label className="field">
            Nombres
            <input value={identity.firstNames} onChange={(event) => setIdentity({ ...identity, firstNames: event.target.value })} placeholder="Ej: Juan" />
          </label>
          <label className="field">
            Apellidos
            <input value={identity.lastNames} onChange={(event) => setIdentity({ ...identity, lastNames: event.target.value })} placeholder="Ej: Pérez" />
          </label>
          <label className="field">
            RUT
            <input value={identity.rut} onChange={(event) => setIdentity({ ...identity, rut: event.target.value })} placeholder="12.345.678-9" />
          </label>
          <label className="field">
            WhatsApp
            <input value={identity.whatsapp} onChange={(event) => setIdentity({ ...identity, whatsapp: event.target.value })} type="tel" placeholder="+56 9 1234 5678" />
          </label>
          <label className="field">
            Email
            <input value={identity.email} onChange={(event) => setIdentity({ ...identity, email: event.target.value })} type="email" placeholder="especialista@email.cl" />
          </label>
          <label className="field">
            Foto de perfil
            <input type="file" accept="image/*" onChange={(event) => setProfilePhoto(event.currentTarget.files?.[0]?.name ?? "")} />
            <span className="text-xs font-bold text-muted">{profilePhoto ? `Archivo seleccionado: ${profilePhoto}` : "Opcional ahora. OficiosPro puede solicitarla antes de activar el perfil."}</span>
          </label>
          <label className="field">
            Dirección base
            <input value={baseAddress} onChange={(event) => setBaseAddress(event.target.value)} placeholder="Dirección de referencia" />
            <span className="text-xs font-bold text-muted">No mostraremos tu dirección exacta públicamente.</span>
          </label>
          <RegionCommuneSelect
            region={baseRegion}
            commune={baseCommune}
            onRegionChange={(nextRegion) => {
              setBaseRegion(nextRegion);
              setBaseCommune("");
            }}
            onCommuneChange={setBaseCommune}
            regionLabel="Región base"
            communeLabel="Comuna base"
            communePlaceholder="Busca Santiago, Providencia, Ñuñoa..."
            required
          />
          <label className="field">
            Radio de cobertura en km
            <input type="number" min="1" max="120" value={coverageRadiusKm} onChange={(event) => setCoverageRadiusKm(Number(event.target.value))} />
          </label>
          <label className="field">
            Comunas de cobertura
            <input value={coverageCommunes} onChange={(event) => setCoverageCommunes(event.target.value)} placeholder="Ej: Curicó, Molina, Romeral" />
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

        <section className={step === 3 ? "grid gap-4" : "hidden"}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Servicios ofrecidos</p>
              <h3 className="text-2xl font-black">Servicios y tarifa esperada</h3>
              <p className="mt-2 text-sm font-bold text-muted">Indica lo que esperas recibir en CLP. OficiosPro revisara la tarifa y definira los creditos finales para el cliente.</p>
            </div>
            <button className="btn-secondary" type="button" onClick={() => setServices((current) => [...current, createEmptyService()])}>
              Agregar servicio
            </button>
          </div>

          {services.map((service, index) => (
            <ServiceEditor key={index} service={service} index={index} onChange={(patch) => updateService(index, patch)} />
          ))}
        </section>

        <section className={step === 4 ? "grid gap-4" : "hidden"}>
          <div>
            <p className="eyebrow">Referencias laborales</p>
            <h3 className="text-2xl font-black">Referencias opcionales para acelerar la revisión</h3>
            <p className="mt-2 text-sm font-bold text-muted">Completa lo que tengas disponible. OficiosPro revisara tu informacion y podra solicitar antecedentes adicionales.</p>
          </div>
          <div className="grid gap-4">
            {references.map((reference, index) => (
              <article key={index} className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 md:grid-cols-6">
                <label className="field">
                  Nombre
                  <input value={reference.name} onChange={(event) => updateReference(index, { name: event.target.value })} />
                </label>
                <label className="field">
                  Empresa/persona
                  <input value={reference.company} onChange={(event) => updateReference(index, { company: event.target.value })} />
                </label>
                <label className="field">
                  Teléfono
                  <input value={reference.phone} onChange={(event) => updateReference(index, { phone: event.target.value })} />
                </label>
                <label className="field">
                  Email
                  <input type="email" value={reference.email} onChange={(event) => updateReference(index, { email: event.target.value })} />
                </label>
                <label className="field">
                  Trabajo realizado
                  <input value={reference.work} onChange={(event) => updateReference(index, { work: event.target.value })} />
                </label>
                <label className="field">
                  Año aproximado
                  <input value={reference.year} onChange={(event) => updateReference(index, { year: event.target.value })} placeholder="2025" />
                </label>
              </article>
            ))}
          </div>
        </section>

        <section className={step === 5 ? "grid gap-4 md:grid-cols-2" : "hidden"}>
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
            Portafolio opcional. Puedes enviarlo ahora o agregarlo cuando OficiosPro revise tu perfil. Archivos seleccionados: {portfolioPhotos.length}.
          </div>
          <fieldset className="grid gap-3 rounded-2xl border border-line bg-white p-4 md:col-span-2">
            <legend className="px-2 text-sm font-black text-ink">Certificaciones</legend>
            <p className="text-sm font-bold text-muted">
              Si tu oficio requiere certificacion, OficiosPro podra solicitar respaldo antes de activar el perfil.
            </p>
            <label className="flex items-center gap-3 text-sm font-bold text-muted">
              <input type="checkbox" checked={hasNoFormalCertifications} onChange={() => toggleCertification(noFormalCertificationLabel)} /> {noFormalCertificationLabel}
            </label>
            {certificationOptions.map((certification) => (
              <label key={certification} className="flex items-center gap-3 text-sm font-bold text-muted">
                <input type="checkbox" checked={selectedCertifications.includes(certification)} disabled={hasNoFormalCertifications} onChange={() => toggleCertification(certification)} /> {certification}
              </label>
            ))}
            {selectedCertifications.includes("Otro") ? (
              <label className="field">
                Indica cuál certificación o respaldo tienes
                <input value={otherCertificationText} onChange={(event) => setOtherCertificationText(event.target.value)} placeholder="Ej: curso, credencial, respaldo laboral o experiencia verificable" />
              </label>
            ) : null}
          </fieldset>
          <fieldset className="grid gap-3 rounded-2xl border border-brand/20 bg-brand-soft p-4 md:col-span-2">
            <legend className="px-2 text-sm font-black text-brand-dark">Consentimiento</legend>
            <label className="flex items-start gap-3 text-sm font-bold text-brand-dark">
              <input type="checkbox" checked={consentContact} onChange={(event) => setConsentContact(event.target.checked)} required />
              Acepto que OficiosPro me contacte para revisar mi postulacion.
            </label>
            <label className="flex items-start gap-3 text-sm font-bold text-brand-dark">
              <input type="checkbox" checked={consentVerification} onChange={(event) => setConsentVerification(event.target.checked)} required />
              Acepto que OficiosPro revise la informacion enviada y pueda solicitar antecedentes adicionales.
            </label>
          </fieldset>
        </section>

        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <button className="btn-secondary" type="button" onClick={previousStep} disabled={step === 1 || isSubmitting}>
            Volver
          </button>
          <span className="text-sm font-black text-muted">Paso {step} de 5 · completa lo que tengas disponible.</span>
          <button className="btn-secondary" type="button" onClick={nextStep} disabled={step === 5 || isSubmitting}>
            Continuar paso
          </button>
        </div>

        <button className="btn-primary" type="submit" disabled={isSubmitting || submitted} data-event="specialist_application_submit">
          {isSubmitting ? "Enviando..." : "Enviar perfil para revisión"}
        </button>
        {submitted ? (
          <Link className="btn-secondary text-center" href="/?postulacion=recibida">
            Volver al inicio
          </Link>
        ) : null}
        {status ? <SuccessMessage>{status}</SuccessMessage> : null}
      </form>
    </FormShell>
  );
}

function ServiceEditor({
  service,
  index,
  onChange,
}: {
  service: ServiceDraft;
  index: number;
  onChange: (patch: Partial<ServiceDraft>) => void;
}) {
  const selectedPricing = pricingModeOptions.find((option) => option.value === service.pricingMode);
  const hasLowMargin = marginWarningForService(service);
  const estimatedClientCredits = estimatedClientCreditsForService(service);
  const estimatedMarginCLP = estimatedMarginForService(service);
  const pricingReviewLabel = estimatedClientCredits ? `${estimatedClientCredits} créditos estimados` : "Créditos por revisar";
  return (
    <article className="grid gap-4 rounded-[24px] border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <strong>Servicio {index + 1}</strong>
        <span className="chip bg-brand-soft text-brand-dark">{pricingModeLabels[service.pricingMode]} sujeto a revision</span>
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
            />
          </label>
        ) : null}
        <label className="field">
          Nombre del servicio
          <input value={service.name} onChange={(event) => onChange({ name: event.target.value })} placeholder="Ej: Reparación de filtración" />
        </label>
        <label className="field">
          Modalidad de precio
          <select value={service.pricingMode} onChange={(event) => onChange({ pricingMode: event.target.value as PricingMode })}>
            {pricingModeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-xs font-bold text-muted">{selectedPricing?.helper}</span>
        </label>
        <label className="field">
          Duración estimada
          <input value={service.duration} onChange={(event) => onChange({ duration: event.target.value })} placeholder="Ej: 2 horas" />
        </label>
        <label className="field">
          Duracion minima en minutos
          <input type="number" min="15" step="15" value={service.estimatedDurationMinMinutes} onChange={(event) => onChange({ estimatedDurationMinMinutes: Number(event.target.value), estimatedDurationMinutes: Number(event.target.value) })} />
        </label>
        <label className="field">
          Duracion maxima en minutos
          <input type="number" min="15" step="15" value={service.estimatedDurationMaxMinutes} onChange={(event) => onChange({ estimatedDurationMaxMinutes: Number(event.target.value) })} />
        </label>
        <label className="field md:col-span-2">
          Descripción
          <textarea value={service.description} onChange={(event) => onChange({ description: event.target.value })} placeholder="Qué incluye, condiciones y materiales excluidos" />
        </label>
        {service.pricingMode === "hourly" ? (
          <>
            <label className="field">
              Horas minimas
              <input type="number" min="1" step="1" value={service.minHours} onChange={(event) => onChange({ minHours: Number(event.target.value) })} />
            </label>
            <label className="field">
              Horas maximas
              <input type="number" min="1" step="1" value={service.maxHours} onChange={(event) => onChange({ maxHours: Number(event.target.value) })} />
            </label>
          </>
        ) : null}
        <label className="field">
          Tarifa esperada por servicio
          <input
            type="number"
            min="0"
            step="1000"
            value={service.specialistExpectedPayoutCLP}
            onChange={(event) => onChange({ specialistExpectedPayoutCLP: normalizeSpecialistCLPInput(event.target.value), specialistPayoutCLP: normalizeSpecialistCLPInput(event.target.value) })}
            placeholder="Ej: 25000"
          />
          <span className="text-xs font-bold text-muted">
            Indica el monto esperado especialista en CLP. Para cotizaciones puede quedar en 0 hasta que envies propuesta. Ejemplo: {formatCLP(25000)}.
          </span>
        </label>
        <div className="rounded-2xl border border-brand/15 bg-brand-soft p-4 md:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-xs font-black uppercase text-brand-dark">Cálculo interno OficiosPro</span>
              <strong className="mt-1 block text-xl text-ink">{pricingReviewLabel}</strong>
              <p className="mt-2 text-sm font-bold leading-6 text-brand-dark">
                El especialista declara CLP. OficiosPro calcula créditos cliente, margen y condiciones antes de publicar el servicio.
              </p>
            </div>
            <span className={`chip ${hasLowMargin ? "bg-amber-50 text-amber-800" : "bg-white text-brand-dark"}`}>
              Margen estimado {formatCLP(estimatedMarginCLP)}
            </span>
          </div>
        </div>
        <label className="field">
          Visita inicial gratis
          <select value={service.initialVisitFree ? "yes" : "no"} onChange={(event) => onChange({ initialVisitFree: event.target.value === "yes" })}>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </select>
        </label>
        <label className="field">
          Disponible emergencia
          <select value={service.emergency ? "yes" : "no"} onChange={(event) => onChange({ emergency: event.target.value === "yes" })}>
            <option value="no">No</option>
            <option value="yes">Sí</option>
          </select>
        </label>
        <label className="field">
          Comunas donde aplica
          <input value={service.serviceCommunes} onChange={(event) => onChange({ serviceCommunes: event.target.value })} placeholder="Ej: Santiago, Providencia, Ñuñoa" />
        </label>
        <label className="field">
          Materiales incluidos
          <select value={service.materialsIncludedBoolean ? "yes" : "no"} onChange={(event) => onChange({ materialsIncludedBoolean: event.target.value === "yes" })}>
            <option value="no">No</option>
            <option value="yes">Si</option>
          </select>
        </label>
        <label className="field">
          Materiales se cobran aparte
          <select value={service.materialsChargedSeparately ? "yes" : "no"} onChange={(event) => onChange({ materialsChargedSeparately: event.target.value === "yes" })}>
            <option value="yes">Si</option>
            <option value="no">No</option>
          </select>
        </label>
        <label className="field">
          Requiere evaluacion previa
          <select value={service.requiresPriorEvaluation ? "yes" : "no"} onChange={(event) => onChange({ requiresPriorEvaluation: event.target.value === "yes" })}>
            <option value="no">No</option>
            <option value="yes">Si</option>
          </select>
        </label>
        <label className="field md:col-span-2">
          Materiales incluidos o excluidos
          <textarea value={service.materialsIncluded} onChange={(event) => onChange({ materialsIncluded: event.target.value })} placeholder="Ej: mano de obra incluida, materiales se cotizan aparte." />
        </label>
        <label className="field md:col-span-2">
          Condiciones del servicio
          <textarea value={service.conditions} onChange={(event) => onChange({ conditions: event.target.value })} placeholder="Horarios, requisitos previos o condiciones para tomar el trabajo." />
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
      <div className={`rounded-2xl p-4 text-sm font-bold ${hasLowMargin ? "border border-amber-200 bg-amber-50 text-amber-900" : "bg-slate-50 text-muted"}`}>
        {hasLowMargin
          ? "Advertencia: el margen estimado queda bajo el minimo hogar. OficiosPro dejara este servicio en revision antes de publicarlo."
          : "OficiosPro revisara la modalidad, creditos, margen y condiciones antes de publicar el servicio."}
      </div>
    </article>
  );
}

export function CompanyRequestForm() {
  const [status, setStatus] = useState("");
  const [region, setRegion] = useState(DEFAULT_REGION_CODE);
  const [commune, setCommune] = useState("Santiago");
  const [serviceType, setServiceType] = useState("empresas");
  const [otherServiceDescription, setOtherServiceDescription] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const enterpriseServiceOptions = [...serviceTypeOptions, { value: OTHER_SERVICE_VALUE, label: "Otro / No encontré mi servicio" }];

  async function submit(event: FormEvent<HTMLFormElement>) {
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
      region: regionNameForCode(region),
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
    const leadResult = await submitLead({
      leadType: "company_request",
      fullName: `${firstNames} ${lastNames}`.trim(),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("whatsapp") ?? ""),
      companyName: businessName,
      service: serviceTypeLabel,
      problemDescription: additionalComments,
      regionCode: region,
      regionName: regionNameForCode(region),
      communeName: commune,
      sourceComponent: "CompanyRequestForm",
      sourceButton: "Enviar solicitud",
      payload: { companyRut: data.get("companyRut"), companyLine: data.get("companyLine"), branches: data.get("branches"), plan: data.get("plan") },
    });
    setStatus(leadResult.ok ? "Solicitud empresa enviada. Quedó visible para revisión comercial." : leadResult.message);
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
        <RegionCommuneSelect
          region={region}
          commune={commune}
          onRegionChange={(nextRegion) => {
            setRegion(nextRegion);
            setCommune("");
          }}
          onCommuneChange={setCommune}
          communeLabel="Comuna principal"
          communePlaceholder="Busca comuna de la operación"
          required
        />
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
        <BrandLogo variant="white" size="sm" showWordmark={false} />
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
