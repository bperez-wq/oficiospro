"use client";

import { useState } from "react";
import type { Specialist } from "@/data/mock";
import { createInstantContactRequest } from "@/lib/bookingStorage";
import { preserveSpecialistIntent } from "@/lib/intendedAction";
import { submitLead } from "@/lib/leadClient";

export function InstantContactPanel({ specialist, onOpenAgenda }: { specialist: Specialist; onOpenAgenda?: () => void }) {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function requestContact() {
    if (submitting) return;
    preserveSpecialistIntent({ specialist, intendedAction: "contactar", source: "InstantContactPanel" });
    setSubmitting(true);
    try {
      createInstantContactRequest(specialist);
      const result = await submitLead({
        leadType: "contact_message",
        fullName: "Cliente OficiosPro",
        service: `Contacto inmediato por ${specialist.specialty}`,
        regionName: specialist.region,
        communeName: specialist.commune ?? specialist.zone,
        specialistId: specialist.id,
        specialistName: specialist.name,
        creditsEstimate: specialist.credits,
        sourceComponent: "InstantContactPanel",
        sourceButton: "Contacto inmediato",
        consentContact: false,
      });
      setStatus(result.ok ? "Contacto solicitado. Revisaremos disponibilidad y próximo paso con el especialista." : result.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[24px] border border-brand/15 bg-brand-soft p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Contacto inmediato</p>
          <h3 className="text-xl font-black text-ink">¿Necesitas coordinar antes de reservar?</h3>
          <p className="mt-1 text-sm font-bold leading-6 text-brand-dark">La solicitud queda pendiente de confirmación. No bloquea un horario automático.</p>
        </div>
        <div className="flex flex-col gap-2 sm:min-w-52">
          <button className="btn-primary" type="button" data-event="request_instant_contact" disabled={submitting} onClick={requestContact}>
            {submitting ? "Enviando..." : "Contacto inmediato"}
          </button>
          {onOpenAgenda ? (
            <button className="btn-secondary" type="button" data-event="instant_contact_open_agenda" onClick={onOpenAgenda}>
              Ver agenda
            </button>
          ) : null}
        </div>
      </div>
      {status ? <p className="mt-3 rounded-2xl bg-white/80 p-3 text-sm font-black text-brand-dark">{status}</p> : null}
    </div>
  );
}
