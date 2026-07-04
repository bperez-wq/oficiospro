import Link from "next/link";
import { MarketplaceCard } from "@/components/DesignSystem";
import {
  externalCertifiedProviderTypeLabels,
  externalCertifiedSpecialistStatusLabels,
  type ExternalCertifiedSpecialist,
} from "@/data/externalCertifiedSpecialists";

export function ExternalCertifiedSpecialistCard({ specialist }: { specialist: ExternalCertifiedSpecialist }) {
  const statusLabel = externalCertifiedSpecialistStatusLabels[specialist.status];
  const activationHref = `/registro-especialista?source=external_public_registry&registry=sec&externalRef=${specialist.id}`;
  const updateHref = `/contacto?source=external_public_registry_update&registry=sec&externalRef=${specialist.id}`;

  return (
    <MarketplaceCard hover={false} className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black uppercase text-sky-900">
          Registro publico externo
        </span>
        <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black uppercase text-amber-900">
          Datos ficticios de prototipo
        </span>
      </div>

      <div>
        <h2 className="text-2xl font-black leading-tight text-ink">{specialist.displayName}</h2>
        <p className="mt-2 text-sm font-bold leading-6 text-muted">
          {specialist.certificationName} · {specialist.specialty}
        </p>
        <p className="mt-1 text-sm font-bold text-muted">
          {specialist.commune}, {specialist.region}
        </p>
        <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-muted">
          {externalCertifiedProviderTypeLabels[specialist.providerType]}
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-slate-50 p-4">
        <p className="text-xs font-black uppercase text-muted">Estado</p>
        <p className="mt-1 text-lg font-black text-ink">{statusLabel}</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-muted">
          Esta ficha es una referencia de fuente publica externa. No es un perfil activo, no permite cotizar o
          reservar, y no implica validacion operacional de OficiosPro. Si corresponde a una empresa, la activacion debe
          revisar representante, razon social y permisos de publicacion antes de aparecer como prestador activo.
        </p>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-brand-soft p-4">
          <dt className="font-black uppercase text-brand-dark">Fuente</dt>
          <dd className="mt-1 font-bold text-ink">{specialist.sourceName}</dd>
        </div>
        <div className="rounded-2xl bg-brand-soft p-4">
          <dt className="font-black uppercase text-brand-dark">Contacto</dt>
          <dd className="mt-1 font-bold text-ink">No publicado por OficiosPro</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        <a
          href={specialist.officialSourceUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-sm transition hover:border-brand/40 hover:text-brand"
        >
          Validar en fuente oficial
        </a>
        <Link
          href={activationHref}
          className="rounded-full bg-brand px-4 py-3 text-sm font-black text-white shadow-soft transition hover:bg-brand-dark"
        >
          Soy este especialista
        </Link>
        <Link
          href={updateHref}
          className="rounded-full border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black text-amber-950 transition hover:border-amber-300"
        >
          Solicitar actualizacion o retiro
        </Link>
      </div>
    </MarketplaceCard>
  );
}
