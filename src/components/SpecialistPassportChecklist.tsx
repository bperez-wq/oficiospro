"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPendingSpecialists, type PendingSpecialistProfile } from "@/lib/storage";

type PassportItem = {
  key: string;
  label: string;
  benefit: string;
  done: boolean;
  detail?: string;
};

function latestPendingProfile(): PendingSpecialistProfile | null {
  const all = getPendingSpecialists();
  if (!all.length) return null;
  return [...all].sort((a, b) => String(b.submittedAt ?? "").localeCompare(String(a.submittedAt ?? "")))[0];
}

function buildItems(profile: PendingSpecialistProfile | null): PassportItem[] {
  const completeReferences = (profile?.references ?? []).filter((reference) => reference.name && reference.phone && reference.work);
  const identity = profile?.identityVerification;
  const identityApproved = identity?.verificationStatus === "approved";
  const published = profile?.publicationStatus === "published";
  const taxDeclared = Boolean(profile?.taxProfile?.taxType && profile.taxProfile.taxType !== "unknown");

  return [
    {
      key: "basico",
      label: "Perfil básico",
      benefit: "Tu nombre y contacto: la base para que el equipo y tus clientes te ubiquen.",
      done: Boolean(profile),
    },
    {
      key: "servicios",
      label: "Oficio y servicios",
      benefit: "Tus servicios permiten que te encuentren mejor.",
      done: (profile?.services?.length ?? 0) > 0,
    },
    {
      key: "cobertura",
      label: "Comuna y cobertura",
      benefit: "Ayuda a que tus clientes sepan dónde trabajas.",
      done: Boolean(profile?.commune && profile?.coverageRadiusKm),
    },
    {
      key: "fotos",
      label: "Fotos y portafolio",
      benefit: "Las fotos ayudan a mostrar la calidad de tu trabajo.",
      done: Boolean((profile?.portfolioPhotos?.length ?? 0) > 0 || profile?.profilePhoto),
    },
    {
      key: "referencias",
      label: "Referencias",
      benefit: "Respaldan tu experiencia frente a clientes que aún no te conocen.",
      done: completeReferences.length >= 1,
      detail: profile ? `${Math.min(completeReferences.length, 3)} de 3 recomendadas` : undefined,
    },
    {
      key: "formalizacion",
      label: "Formalización",
      benefit: "Puede ayudarte a cobrar mejor y acceder a mejores oportunidades.",
      done: taxDeclared,
      detail: taxDeclared ? undefined : "Opcional: el equipo te guía cuando quieras.",
    },
    {
      key: "verificacion",
      label: "Verificación de identidad",
      benefit: "El sello que más confianza genera en tu Pasaporte.",
      done: identityApproved,
      detail: identityApproved ? undefined : profile ? "En revisión por el equipo OficiosPro." : undefined,
    },
    {
      key: "compartible",
      label: "Perfil publicado y compartible",
      benefit: "Tu Pasaporte listo para mostrar a quien tú quieras.",
      done: published,
      detail: published ? undefined : profile ? "Se activa cuando el equipo publica tu perfil." : undefined,
    },
  ];
}

/* Checklist del Pasaporte Profesional: lee la postulación guardada en este
 * dispositivo (localStorage). El estado oficial de revisión vive con el equipo
 * OficiosPro, por eso se declara la fuente en el pie del bloque. */
export function SpecialistPassportChecklist() {
  const [profile, setProfile] = useState<PendingSpecialistProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setProfile(latestPendingProfile());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const items = buildItems(profile);
  const doneCount = items.filter((item) => item.done).length;
  const percent = Math.round((doneCount / items.length) * 100);
  const published = profile?.publicationStatus === "published";
  const publicHref = profile?.slug ? `/especialistas/perfil?id=${encodeURIComponent(profile.slug)}` : null;

  return (
    <section className="rounded-[28px] border border-line bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Pasaporte Profesional OficiosPro</p>
          <h2 className="text-2xl font-black text-ink">
            {profile ? "Completa tu Pasaporte Profesional" : "Construye tu Pasaporte Profesional"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">
            {profile
              ? "Tu perfil es tu respaldo profesional. Mientras más completo, más confianza genera y mejor te encuentran."
              : "Tu oficio merece verse bien. Un perfil completo muestra tus servicios, comunas, fotos y respaldo en un solo lugar."}
          </p>
        </div>
        <div className="min-w-40 text-right">
          <span className="text-3xl font-black text-brand-dark">{percent}%</span>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-2.5 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.key} className={`flex items-start gap-3 rounded-2xl border p-3.5 ${item.done ? "border-emerald-100 bg-emerald-50" : "border-line bg-slate-50"}`}>
            <span
              aria-hidden
              className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black ${item.done ? "bg-emerald-500 text-white" : "border-2 border-slate-300 bg-white text-transparent"}`}
            >
              ✓
            </span>
            <div className="min-w-0">
              <strong className={`block text-sm ${item.done ? "text-emerald-950" : "text-ink"}`}>{item.label}</strong>
              <span className="block text-xs font-bold leading-5 text-muted">{item.benefit}</span>
              {item.detail ? <span className="mt-0.5 block text-xs font-black text-brand-dark">{item.detail}</span> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Link className="btn-primary" href="/registro-especialista?source=dashboard_passport&intent=offer_services" data-event="click_offer_services">
          {profile ? "Completar mi Pasaporte" : "Construir mi perfil"}
        </Link>
        {published && publicHref ? (
          <Link className="btn-secondary" href={publicHref}>
            Ver mi perfil como cliente
          </Link>
        ) : null}
        {published && publicHref ? (
          <button
            className="btn-secondary"
            type="button"
            data-event="profile_share"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(`${window.location.origin}${publicHref}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              } catch {
                window.prompt("Copia el enlace de tu perfil:", `${window.location.origin}${publicHref}`);
              }
            }}
          >
            {copied ? "Enlace copiado ✓" : "Compartir mi perfil"}
          </button>
        ) : null}
      </div>

      <p className="mt-4 text-xs font-semibold leading-5 text-muted">
        Este avance se guarda en este dispositivo. El estado oficial de revisión y publicación te lo confirma el equipo OficiosPro.
      </p>
    </section>
  );
}
