"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { contactConfig, specialistWhatsappMessage, supportMailtoHref, whatsappHref } from "@/config/contactConfig";
import type { AcquisitionContext } from "@/data/specialistAcquisition";
import { getAttributionContext, trackEvent } from "@/lib/analytics";
import { DEFAULT_REGION_CODE, communeRegionCode, normalizeSearch, regionNameForCode, registrationServiceTypeOptions } from "@/lib/catalog";
import { submitLead } from "@/lib/leadClient";
import { saveSpecialistQuickDraft } from "@/lib/specialistDraft";

type SpecialistLeadKind = "founder_lead" | "specialist_lead" | "job_page_lead" | "specialist_referral_lead" | "draft_profile";

type SpecialistQuickLeadFormProps = {
  title?: string;
  text?: string;
  submitLabel?: string;
  defaultTrade?: string;
  defaultCommune?: string;
  context?: AcquisitionContext;
  sourceComponent?: string;
  sourceButton?: string;
  leadKind?: SpecialistLeadKind;
  saveDraft?: boolean;
  compact?: boolean;
};

const popularTrades = [
  "Gasfiteria",
  "Electricidad",
  "Construccion",
  "Terminaciones",
  "Carpinteria",
  "Metalmecanica",
  "Riego tecnificado",
  "Piscinas",
  "Climatizacion",
  "Mantencion industrial",
  "Aseo tecnico",
  "Control de plagas",
];

export function SpecialistQuickLeadForm({
  title = "Tienes un oficio? Te ayudamos a crear tu perfil.",
  text = "Deja tus datos basicos y el equipo OficiosPro te contacta para orientar tu postulacion.",
  submitLabel = "Quiero que me contacten",
  defaultTrade = "",
  defaultCommune = "",
  context = {},
  sourceComponent = "SpecialistQuickLeadForm",
  sourceButton = "Quiero que me contacten",
  leadKind = "founder_lead",
  saveDraft = true,
  compact = false,
}: SpecialistQuickLeadFormProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [commune, setCommune] = useState(defaultCommune);
  const [trade, setTrade] = useState(defaultTrade);
  const [websiteTrap, setWebsiteTrap] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);
  const formId = useId();
  const channelHref = contactConfig.whatsappEnabled
    ? whatsappHref(specialistWhatsappMessage({ trade, commune }))
    : supportMailtoHref("Crear perfil especialista OficiosPro", specialistWhatsappMessage({ trade, commune }));

  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    const attribution = getAttributionContext();
    void trackEvent({
      eventName: "quick_lead_started",
      source: context.source ?? attribution.source,
      medium: context.utmMedium ?? attribution.utmMedium,
      campaign: context.campaign ?? context.utmCampaign ?? attribution.campaign,
      sourceComponent,
      sourceButton,
      metadata: {
        funnel: "specialist_acquisition",
        specialistLeadKind: leadKind,
        source: context.source ?? attribution.source,
        campaign: context.campaign ?? attribution.campaign,
        trade: trade || context.trade,
        commune: commune || context.commune,
      },
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    markStarted();
    if (websiteTrap) {
      setStatus("No pudimos guardar tus datos. Escribenos a bperez@oficiospro.cl.");
      return;
    }
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanCommune = commune.trim();
    const cleanTrade = trade.trim();
    if (!cleanName || !cleanPhone || !cleanCommune || !cleanTrade) {
      setStatus("Completa nombre, telefono, comuna y oficio para que podamos contactarte.");
      return;
    }

    setSubmitting(true);
    setStatus("Guardando...");
    const attribution = getAttributionContext();
    const matchedTrade = findTrade(cleanTrade);
    const regionCode = communeRegionCode(cleanCommune) || DEFAULT_REGION_CODE;
    const [firstNames, ...lastNameParts] = cleanName.split(/\s+/);
    const lastNames = lastNameParts.join(" ");
    const draft = saveDraft
      ? saveSpecialistQuickDraft({
          firstNames,
          lastNames,
          whatsapp: cleanPhone,
          primaryTrade: matchedTrade?.label ?? cleanTrade,
          serviceTypeId: matchedTrade?.value,
          region: regionCode,
          commune: cleanCommune,
          fromQuickSpecialist: true,
        })
      : null;
    const source = String(context.source ?? attribution.source ?? "direct");
    const campaign = context.campaign ?? attribution.campaign ?? attribution.utmCampaign ?? "founder_specialists";
    const eventName =
      leadKind === "specialist_referral_lead"
        ? "referral_lead_submitted"
        : leadKind === "job_page_lead"
          ? "job_page_quick_lead_submitted"
          : "quick_lead_submitted";

    const result = await submitLead({
      leadType: "specialist_application",
      fullName: cleanName,
      phone: cleanPhone,
      applicantType: "specialist",
      trade: matchedTrade?.label ?? cleanTrade,
      service: matchedTrade?.label ?? cleanTrade,
      regionCode,
      regionName: regionNameForCode(regionCode),
      communeName: cleanCommune,
      sourceComponent,
      sourceButton,
      referralCode: context.referralCode,
      consentContact: true,
      consentTerms: true,
      payload: {
        specialistLeadKind: leadKind,
        leadSubtype: leadKind,
        draftProfileCreated: Boolean(draft),
        draftProfileStatus: "incomplete",
        draftProfileStep: "quick_lead",
        founderStatus: "lead_capturado",
        status: "lead_capturado",
        source,
        campaign,
        utmSource: context.utmSource ?? attribution.utmSource,
        utmMedium: context.utmMedium ?? attribution.utmMedium,
        utmCampaign: context.utmCampaign ?? attribution.utmCampaign,
        utmContent: context.utmContent ?? attribution.utmContent,
        referralCode: context.referralCode ?? attribution.referralCode,
        acquisition: {
          ...context,
          source,
          campaign,
          trade: context.trade ?? matchedTrade?.value ?? cleanTrade,
          commune: context.commune ?? cleanCommune,
          referralCode: context.referralCode ?? attribution.referralCode,
        },
        customTrade: matchedTrade ? "" : cleanTrade,
        customTradeRequest: matchedTrade ? "" : cleanTrade,
        crm: {
          pipeline: "especialistas",
          stage: "lead_capturado",
          assignedTeam: "Operaciones",
          taskTitle: "Contactar especialista con perfil incompleto",
          slaHours: 48,
        },
      },
    });

    void trackEvent({
      eventName,
      source,
      campaign,
      sourceComponent,
      sourceButton,
      metadata: {
        funnel: "specialist_acquisition",
        specialistLeadKind: leadKind,
        stored: result.stored,
        leadId: result.id,
        draftProfileCreated: Boolean(draft),
        draftProfileStatus: "incomplete",
        trade: matchedTrade?.label ?? cleanTrade,
        customTrade: matchedTrade ? "" : cleanTrade,
        commune: cleanCommune,
      },
    });
    if (draft) {
      void trackEvent({
        eventName: "draft_profile_created",
        source,
        campaign,
        sourceComponent,
        sourceButton: "Perfil borrador creado",
        metadata: {
          funnel: "specialist_acquisition",
          draftProfileStatus: "incomplete",
          trade: matchedTrade?.label ?? cleanTrade,
          commune: cleanCommune,
        },
      });
    }

    setSubmitting(false);
    setStatus(
      result.stored
        ? "Ya guardamos tu avance. Puedes terminar tu perfil ahora o pedir ayuda."
        : result.message,
    );
  }

  function trackWhatsapp() {
    void trackEvent({
      eventName: "whatsapp_contact_clicked",
      source: context.source ?? "direct",
      campaign: context.campaign,
      sourceComponent,
      sourceButton: contactConfig.whatsappEnabled ? "Hablar por WhatsApp" : "Escribir por email",
      metadata: {
        specialistLeadKind: leadKind,
        trade,
        commune,
        channel: contactConfig.whatsappEnabled ? "whatsapp" : "email",
      },
    });
  }

  return (
    <section className={`rounded-[28px] border border-brand/15 bg-white p-5 shadow-soft ${compact ? "" : "md:p-6"}`}>
      <div className="grid gap-2">
        <p className="eyebrow">Captura rapida</p>
        <h2 className="text-2xl font-black leading-tight text-ink">{title}</h2>
        <p className="text-sm font-bold leading-6 text-muted">{text}</p>
      </div>
      <form className="mt-5 grid gap-3" onSubmit={submit} onFocus={markStarted}>
        <label className="hidden" aria-hidden="true">
          Sitio web
          <input value={websiteTrap} onChange={(event) => setWebsiteTrap(event.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="field">
            Nombre
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Ej: Juan Perez" autoComplete="name" />
          </label>
          <label className="field">
            Telefono
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+56 9 1234 5678" autoComplete="tel" />
          </label>
          <label className="field">
            Comuna
            <input value={commune} onChange={(event) => setCommune(event.target.value)} placeholder="Ej: Nunoa" autoComplete="address-level2" />
          </label>
          <label className="field">
            Oficio principal
            <input value={trade} onChange={(event) => setTrade(event.target.value)} list={formId} placeholder="Ej: Gasfiteria" />
          </label>
        </div>
        <datalist id={formId}>
          {[...popularTrades, ...registrationServiceTypeOptions.map((option) => option.label)].map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button className="btn-primary flex-1" type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : submitLabel}
          </button>
          <a className="btn-secondary flex-1 text-center" href={channelHref} onClick={trackWhatsapp} target={contactConfig.whatsappEnabled ? "_blank" : undefined} rel={contactConfig.whatsappEnabled ? "noopener noreferrer" : undefined}>
            {contactConfig.whatsappEnabled ? "Hablar por WhatsApp" : "Escribir por email"}
          </a>
        </div>
      </form>
      {status ? <p className="mt-3 rounded-2xl bg-brand-soft p-3 text-sm font-black leading-6 text-brand-dark">{status}</p> : null}
      <p className="mt-3 text-xs font-bold leading-5 text-muted">
        No necesitas tener todo resuelto para postular. Revision humana en 48 h y sin promesas de trabajos garantizados.
      </p>
    </section>
  );
}

function findTrade(value: string) {
  const normalized = normalizeSearch(value);
  return registrationServiceTypeOptions.find((option) => normalizeSearch(option.label) === normalized || normalizeSearch(option.value) === normalized);
}
