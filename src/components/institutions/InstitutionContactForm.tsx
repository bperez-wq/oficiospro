"use client";

import { useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import { submitLead } from "@/lib/leadClient";

const allianceTypes = [
  "Difusion / derivacion",
  "Taller de perfil digital",
  "Piloto comunal",
  "Formalizacion asistida",
  "Reportes agregados",
  "Otra colaboracion",
];

export function InstitutionContactForm() {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const institution = String(data.get("institution") ?? "");
    const commune = String(data.get("commune") ?? "");
    const alliance = String(data.get("alliance") ?? "");
    setSubmitting(true);
    const result = await submitLead({
      leadType: "contact_message",
      fullName: String(data.get("fullName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      applicantType: "Institucion",
      service: alliance,
      problemDescription: `Institucion: ${institution} | Comuna: ${commune} | Tipo de alianza: ${alliance}`,
      sourceComponent: "InstitutionContactForm",
      sourceButton: "Solicitar reunion institucional",
      honeypot: String(data.get("companyWebsite") ?? ""),
    });
    setStatus(result.message);
    setSubmitting(false);
    if (result.ok) {
      void trackEvent({
        eventName: "institution_contact_submitted",
        source: "omil",
        campaign: "institutional_partnerships",
        sourceComponent: "InstitutionContactForm",
        sourceButton: "Solicitar reunion institucional",
        metadata: {
          leadId: result.id,
          stored: result.stored,
          commune,
          alliance,
          hasInstitutionName: Boolean(institution.trim()),
        },
      });
      event.currentTarget.reset();
    }
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
      <label className="hidden" aria-hidden="true">
        Sitio web
        <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="field md:col-span-2">
        Institucion
        <input name="institution" placeholder="Ej: Municipalidad de Maipu / OMIL / CFT" required />
      </label>
      <label className="field">
        Comuna
        <input name="commune" placeholder="Ej: Maipu" required />
      </label>
      <label className="field">
        Tipo de alianza
        <select name="alliance" defaultValue={allianceTypes[0]}>
          {allianceTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Contacto
        <input name="fullName" placeholder="Nombre y cargo" required />
      </label>
      <label className="field">
        Email institucional
        <input name="email" type="email" placeholder="contacto@municipio.cl" required />
      </label>
      <label className="field md:col-span-2">
        Telefono (opcional)
        <input name="phone" type="tel" placeholder="+56 9 1234 5678" />
      </label>
      <button className="btn-primary md:col-span-2" type="submit" disabled={submitting}>
        {submitting ? "Enviando..." : "Solicitar reunion"}
      </button>
      {status ? (
        <p className="rounded-2xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark md:col-span-2">{status}</p>
      ) : null}
    </form>
  );
}
