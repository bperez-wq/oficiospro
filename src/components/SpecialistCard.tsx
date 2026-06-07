import Link from "next/link";
import { ConversionButton } from "@/components/ConversionModal";
import { availabilityLabels, type Specialist } from "@/data/mock";

export function SpecialistCard({
  specialist,
  onReserve,
}: {
  specialist: Specialist;
  onReserve?: (id: string) => void;
}) {
  const badges = [
    specialist.verified ? "Verificado" : null,
    specialist.top ? "Top especialista" : null,
    specialist.certifications.length ? "Certificado" : null,
  ].filter(Boolean) as string[];
  const coverageStatus =
    specialist.coverageRadiusKm && specialist.distance <= specialist.coverageRadiusKm
      ? "Dentro de tu zona"
      : specialist.coverageRadiusKm
        ? "Fuera de cobertura"
        : "Cobertura por confirmar";

  return (
    <article className="group overflow-hidden rounded-card border border-line bg-white shadow-sm transition duration-200 hover:-translate-y-1.5 hover:border-brand/30 hover:shadow-lift">
      <div className="relative h-64 overflow-hidden bg-brand-soft">
        <img
          src={specialist.image}
          alt={`${specialist.name}, ${specialist.specialty} en ${specialist.zone}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/75 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-brand-dark shadow-soft backdrop-blur">
          {availabilityLabels[specialist.availability]}
        </span>
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-ink/80 px-3 py-2 text-xs font-black text-white shadow-soft backdrop-blur">
          <span className="text-gold">★</span> {specialist.rating.toFixed(1)}
        </span>
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-lg font-black text-white shadow-lg shadow-brand/30">
            {specialist.initials}
          </span>
          <div className="text-white">
            <strong className="block text-xl">{specialist.name}</strong>
            <span className="text-sm font-bold text-white/80">{specialist.zone}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5">
        <div>
          <p className="font-black text-ink">{specialist.specialty}</p>
          <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-muted">{specialist.description}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Metric value={`${specialist.rating.toFixed(1)}★`} label="calificación" />
          <Metric value={specialist.jobs.toString()} label="trabajos" />
          <Metric value={specialist.responseTime} label="respuesta" />
        </div>

        <div className="flex flex-wrap gap-2">
          {specialist.rank ? <span className="chip bg-gold/15 text-gold">{specialist.rank}</span> : null}
          {badges.map((badge) => (
            <span key={badge} className={badgeClass(badge)}>
              {badge}
            </span>
          ))}
          <span className="chip-sun">{specialist.recommendation}% recomienda</span>
        </div>

        <div className="rounded-2xl border border-brand/10 bg-gradient-to-br from-brand-soft to-white p-4">
          <span className="text-sm font-black uppercase text-muted">Precio desde</span>
          <strong className="block text-2xl font-black text-ink">{specialist.credits} créditos</strong>
          <p className="text-sm font-bold text-muted">Tarifa dinámica por demanda y disponibilidad.</p>
          {specialist.coverageRadiusKm ? (
            <p className="mt-2 text-sm font-bold text-muted">
              A {specialist.distance} km · {coverageStatus} · radio {specialist.coverageRadiusKm} km
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row">
          {specialist.publishedFromAdmin ? (
            <button className="btn-secondary flex-1" type="button" onClick={() => onReserve?.(specialist.id)}>
              Ver perfil
            </button>
          ) : (
            <Link href={`/especialistas/${specialist.id}`} className="btn-secondary flex-1">
              Ver perfil
            </Link>
          )}
          {onReserve ? (
            <button className="btn-primary flex-1" type="button" onClick={() => onReserve(specialist.id)}>
              Reservar
            </button>
          ) : (
            <ConversionButton type="reserva_especialista" sourceButton="Reservar especialista" specialist={specialist} className="btn-primary flex-1">
              Reservar
            </ConversionButton>
          )}
        </div>
      </div>
    </article>
  );
}

function badgeClass(badge: string) {
  if (badge === "Verificado") return "chip-emerald";
  if (badge === "Top especialista") return "chip-sun";
  if (badge === "Certificado") return "chip-accent";
  return "chip-brand";
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <span className="rounded-2xl bg-slate-50 p-3">
      <strong className="block text-sm text-ink md:text-base">{value}</strong>
      <span className="text-[11px] font-black uppercase text-muted">{label}</span>
    </span>
  );
}
