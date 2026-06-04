import Link from "next/link";
import { availabilityLabels, type Specialist } from "@/data/mock";

export function SpecialistCard({
  specialist,
  onReserve,
}: {
  specialist: Specialist;
  onReserve?: (id: string) => void;
}) {
  const trustBadges = [
    specialist.verified ? "Verificado" : null,
    specialist.top ? "Top especialista" : null,
    specialist.certifications.length ? "Certificado" : null,
  ].filter(Boolean);

  const badges = [...new Set([...trustBadges, ...specialist.badges])];

  return (
    <article className="group overflow-hidden rounded-panel border border-line bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <div className="relative h-60 overflow-hidden bg-brand-soft">
        <img
          src={specialist.image}
          alt={`${specialist.name}, ${specialist.specialty} en ${specialist.zone}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {specialist.top ? (
          <span className="absolute left-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-black text-brand-dark shadow-soft">
            Top especialista
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 p-5">
        <div>
          <h3 className="text-2xl font-black">{specialist.name}</h3>
          <p className="font-bold text-muted">
            {specialist.specialty} · {specialist.zone}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <strong className="text-gold">{specialist.rating.toFixed(1)}/5</strong>
          <span className="text-muted">{specialist.jobs} trabajos completados</span>
          <span className="text-muted">{specialist.responseTime} respuesta</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="chip bg-brand-soft text-brand-dark">{availabilityLabels[specialist.availability]}</span>
          {badges.map((badge) => (
            <span key={badge} className="chip bg-slate-100 text-slate-700">
              {badge}
            </span>
          ))}
        </div>

        <p className="text-sm text-muted">{specialist.description}</p>

        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <Metric value={specialist.rating.toFixed(1)} label="calidad" />
          <Metric value={specialist.jobs.toString()} label="trabajos" />
          <Metric value={`${specialist.recommendation}%`} label="recomienda" />
          <Metric value={specialist.responseTime} label="respuesta" />
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-brand-soft to-white p-4">
          <strong className="text-lg">Desde {specialist.credits} créditos</strong>
          <p className="text-sm font-bold text-muted">{specialist.demand}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <div>
            <strong>Tarifa dinámica</strong>
            <p className="text-sm text-muted">según demanda y disponibilidad</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/especialistas/${specialist.id}`} className="btn-secondary">
              Ver perfil
            </Link>
            {onReserve ? (
              <button className="btn-primary" type="button" onClick={() => onReserve(specialist.id)}>
                Reservar
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <span className="rounded-xl bg-slate-50 p-3">
      <strong className="block text-ink">{value}</strong>
      <span className="text-xs font-bold text-muted">{label}</span>
    </span>
  );
}
