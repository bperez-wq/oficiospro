import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { availabilityLabels, specialists } from "@/data/mock";

export const dynamicParams = false;

export function generateStaticParams() {
  return specialists.map((specialist) => ({ id: specialist.id }));
}

export default async function SpecialistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const specialist = specialists.find((item) => item.id === id);
  if (!specialist) notFound();

  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero eyebrow={specialist.category} title={specialist.name} subtitle={`${specialist.specialty} en ${specialist.zone}. ${specialist.description}`}>
        <Link className="btn-primary" href="/especialistas">
          Reservar por {specialist.credits} créditos
        </Link>
        <Link className="btn-secondary" href="/especialistas">
          Volver al listado
        </Link>
      </AppHero>

      <section className="grid gap-6 lg:grid-cols-[1fr_390px]">
        <article className="overflow-hidden rounded-[30px] border border-line bg-white shadow-soft">
          <div className="relative h-[460px]">
            <img src={specialist.image} alt={specialist.name} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-6 text-white">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand text-xl font-black text-white shadow-lg">
                    {specialist.initials}
                  </span>
                  <div>
                    <h2 className="text-3xl font-black">{specialist.specialty}</h2>
                    <p className="font-bold text-white/80">{specialist.zone} · {specialist.distance} km aprox.</p>
                  </div>
                </div>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-brand-dark">{availabilityLabels[specialist.availability]}</span>
              </div>
            </div>
          </div>
          <div className="grid gap-6 p-6">
            <div className="grid gap-3 sm:grid-cols-4">
              <SmallStat label="Calificación" value={`${specialist.rating.toFixed(1)}/5`} />
              <SmallStat label="Trabajos" value={specialist.jobs.toString()} />
              <SmallStat label="Respuesta" value={specialist.responseTime} />
              <SmallStat label="Recomendación" value={`${specialist.recommendation}%`} />
            </div>

            <section>
              <h2 className="text-2xl font-black">Galería de trabajos</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {specialist.galleryImages.map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt={`${specialist.name} trabajo ${index + 1}`} className="h-40 w-full rounded-2xl object-cover" />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black">Servicios ofrecidos</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {specialist.servicesOffered.map((service) => (
                  <span key={service} className="rounded-2xl border border-line bg-slate-50 p-4 text-sm font-black text-ink">
                    {service}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black">Historial de trabajos</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {specialist.workHistory.map((work) => (
                  <article key={work.title} className="overflow-hidden rounded-2xl border border-line bg-slate-50">
                    <img src={work.image} alt={work.title} className="h-36 w-full object-cover" />
                    <div className="p-4">
                      <strong>{work.title}</strong>
                      <span className="block text-sm font-bold text-muted">
                        {work.commune} · {work.credits} créditos · {work.rating.toFixed(1)}/5
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black">Comentarios verificados</h2>
              <div className="mt-4 grid gap-3">
                {specialist.reviews.map((review) => (
                  <article key={`${review.author}-${review.date}`} className="rounded-2xl border border-line bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong>{review.author}</strong>
                      <span className="font-black text-gold">{review.rating.toFixed(1)}/5</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-muted">{review.text}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </article>

        <aside className="grid gap-5 self-start lg:sticky lg:top-28">
          <article className="panel">
            <span className="font-bold text-muted">Precio desde</span>
            <strong className="block text-4xl font-black">{specialist.credits} créditos</strong>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">La cantidad puede cambiar por demanda, horario y zona. El pago se libera al finalizar el trabajo.</p>
            <Link href="/especialistas" className="btn-primary mt-5 w-full">
              Reservar especialista
            </Link>
          </article>
          <article className="panel">
            <h3 className="text-xl font-black">Confianza y garantía</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Verificado", "Pago protegido", "Garantía OficiosPro", ...specialist.certifications].map((item) => (
                <span key={item} className="chip bg-brand-soft text-brand-dark">
                  {item}
                </span>
              ))}
            </div>
          </article>
          <article className="panel">
            <h3 className="text-xl font-black">Disponibilidad</h3>
            <div className="mt-4 grid gap-2 text-sm font-bold text-muted">
              <span className="rounded-2xl bg-slate-50 p-3">Hoy · 16:30</span>
              <span className="rounded-2xl bg-slate-50 p-3">Mañana · 10:00</span>
              <span className="rounded-2xl bg-slate-50 p-3">Mañana · 15:00</span>
            </div>
          </article>
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
