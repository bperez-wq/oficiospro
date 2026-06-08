"use client";

import { useState, type FormEvent } from "react";
import { submitLead } from "@/lib/leadClient";

export function ContactForm() {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    const result = await submitLead({
      leadType: "contact_message",
      fullName: String(data.get("fullName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      applicantType: String(data.get("segment") ?? ""),
      service: String(data.get("subject") ?? ""),
      problemDescription: String(data.get("message") ?? ""),
      sourceComponent: "ContactForm",
      sourceButton: "Enviar mensaje",
      honeypot: String(data.get("companyWebsite") ?? ""),
    });
    setStatus(result.message);
    setSubmitting(false);
    if (result.ok) event.currentTarget.reset();
  }

  return (
    <form className="grid gap-4 rounded-[28px] border border-line bg-white p-6 shadow-soft md:grid-cols-2" onSubmit={submit}>
      <label className="hidden" aria-hidden="true">
        Sitio web
        <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="field">
        Nombre
        <input name="fullName" placeholder="Ej: Juan Pérez" required />
      </label>
      <label className="field">
        Email
        <input name="email" type="email" placeholder="nombre@email.cl" required />
      </label>
      <label className="field">
        WhatsApp
        <input name="phone" type="tel" placeholder="Ej: +56 9 1234 5678" />
      </label>
      <label className="field">
        Segmento
        <select name="segment" defaultValue="Hogar">
          <option>Hogar</option>
          <option>Empresa</option>
          <option>Especialista</option>
        </select>
      </label>
      <label className="field md:col-span-2">
        Asunto
        <input name="subject" placeholder="Ej: Mantención de aire acondicionado" required />
      </label>
      <label className="field md:col-span-2">
        Mensaje
        <textarea name="message" placeholder="Cuéntanos qué necesitas resolver y en qué comuna estás." required />
      </label>
      <button className="btn-primary md:col-span-2" type="submit" disabled={submitting}>
        {submitting ? "Enviando..." : "Enviar mensaje"}
      </button>
      {status ? <p className="rounded-2xl border border-brand/20 bg-brand-soft p-4 font-black text-brand-dark md:col-span-2">{status}</p> : null}
    </form>
  );
}
