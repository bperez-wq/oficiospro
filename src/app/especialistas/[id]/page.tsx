import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { specialists } from "@/data/mock";

export const dynamicParams = false;

export function generateStaticParams() {
  return specialists.map((specialist) => ({ id: specialist.id }));
}

export default async function SpecialistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const specialist = specialists.find((item) => item.id === id);
  if (!specialist) notFound();

  return (
    <main className="section grid gap-6">
      <PlatformNav />
      <AppHero eyebrow={specialist.category} title={specialist.name} subtitle={`${specialist.specialty} en ${specialist.zone}. ${specialist.description}`}>
        <Link className="btn-primary" href="/especialistas">
          Reservar por {specialist.credits} créditos
        </Link>
        <Link className="btn-secondary" href="/especialistas">
          Volver al listado
        </Link>
      </AppHero>

      <section className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <article className="panel">
          <img src={specialist.image} alt={specialist.name} className="mb-5 h-[420px] w-full rounded-2xl object-cover" />
          <h2 className="text-3xl font-black">Perfil profesional</h2>
          <p className="mt-3 text-muted">{specialist.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {specialist.gallery.map((item) => (
              <span key={item} className="chip bg-brand-soft text-brand-dark">
                {item}
              </span>
            ))}
          </div>
        </article>
        <aside className="panel grid gap-4 self-start">
          <div className="rounded-2xl bg-brand p-5 text-white">
            <span className="font-bold text-white/70">Desde</span>
            <strong className="block text-4xl font-black">{specialist.credits} créditos</strong>
            <p className="mt-2 text-sm text-white/70">La cantidad puede cambiar por demanda, horario y zona.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SmallStat label="Calificación" value={`${specialist.rating.toFixed(1)}/5`} />
            <SmallStat label="Trabajos" value={specialist.jobs.toString()} />
            <SmallStat label="Respuesta" value={specialist.responseTime} />
            <SmallStat label="Recomendación" value={`${specialist.recommendation}%`} />
          </div>
          <div>
            <h3 className="mb-3 text-xl font-black">Certificaciones</h3>
            <div className="flex flex-wrap gap-2">
              {specialist.certifications.map((certification) => (
                <span key={certification} className="chip bg-slate-100 text-slate-700">
                  {certification}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl bg-slate-50 p-4">
      <strong className="block text-xl font-black">{value}</strong>
      <span className="text-sm font-bold text-muted">{label}</span>
    </article>
  );
}
