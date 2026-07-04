import Link from "next/link";
import { MarketplaceCard } from "@/components/DesignSystem";
import {
  externalCertificationStatusLabels,
  externalCertifiedProfileStatusLabels,
  externalCertifiedProviderTypeLabels,
  externalCertifiedRegistryPolicy,
  type ExternalCertifiedProfessional,
} from "@/data/externalCertifiedSpecialists";

export function ExternalCertifiedSpecialistCard({ specialist }: { specialist: ExternalCertifiedProfessional }) {
  const activationHref = `/registro-especialista?source=external_public_registry&registry=sec&externalRef=${specialist.id}`;
  const updateHref = `/privacidad/solicitudes?source=external_public_registry&registry=sec&professionalId=${specialist.id}`;

  return (
    <MarketplaceCard hover={false} className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black uppercase text-sky-900">
          Ficha informativa no reclamada
        </span>
        <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black uppercase text-amber-900">
          Fake data
        </span>
      </div>

      <div>
        <h2 className="text-2xl font-black leading-tight text-ink">{specialist.displayName}</h2>
        <p className="mt-2 text-sm font-bold leading-6 text-muted">
          {specialist.serviceType} · {specialist.licenseClass ?? "Licencia no declarada"}
        </p>
        <p className="mt-1 text-sm font-bold text-muted">
          {specialist.comuna}, {specialist.region}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-muted">
            {externalCertifiedProviderTypeLabels[specialist.providerType]}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-muted">
            {externalCertificationStatusLabels[specialist.certificationStatus]}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-slate-50 p-4">
        <p className="text-xs font-black uppercase text-muted">Estado</p>
        <p className="mt-1 text-lg font-black text-ink">{externalCertifiedProfileStatusLabels[specialist.profileStatus]}</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-muted">
          {externalCertifiedRegistryPolicy.legalDisclaimer}
        </p>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-brand-soft p-4">
          <dt className="font-black uppercase text-brand-dark">Fuente</dt>
          <dd className="mt-1 font-bold text-ink">{specialist.sourceName}</dd>
        </div>
        <div className="rounded-2xl bg-brand-soft p-4">
          <dt className="font-black uppercase text-brand-dark">Ultima verificacion</dt>
          <dd className="mt-1 font-bold text-ink">{specialist.lastVerifiedAt}</dd>
        </div>
      </dl>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <p className="text-sm font-black text-amber-950">Acciones comerciales bloqueadas</p>
        <p className="mt-1 text-sm font-bold leading-6 text-amber-950">
          Esta ficha no muestra contacto, direccion, disponibilidad, precios, resenas ni ranking. No permite cotizar ni reservar hasta que la persona titular active su perfil.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={specialist.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-sm transition hover:border-brand/40 hover:text-brand"
        >
          Verificar en SEC
        </a>
        <Link
          href={activationHref}
          className="rounded-full bg-brand px-4 py-3 text-sm font-black text-white shadow-soft transition hover:bg-brand-dark"
        >
          Activar/Reclamar perfil
        </Link>
        <Link
          href={updateHref}
          className="rounded-full border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black text-amber-950 transition hover:border-amber-300"
        >
          Reportar error o solicitar correccion/eliminacion
        </Link>
      </div>
    </MarketplaceCard>
  );
}
