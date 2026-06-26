import Link from "next/link";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { SpecialistAgendaPanel } from "@/components/SpecialistAgendaPanel";
import { specialists } from "@/data/mock";
import { Reveal } from "@/components/Reveal";

export default function AgendaEspecialistaPage() {
  const specialist = specialists[0];

  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Agenda especialista"
        title="Mi agenda OficiosPro"
        subtitle="Administra disponibilidad, urgencias, bloques de atención y horarios ocupados antes de recibir solicitudes reales en producción."
      >
        <Link className="btn-secondary" href={`/especialistas/${specialist.id}`}>
          Ver perfil público
        </Link>
        <Link className="btn-primary shine" href="/registro-especialista">
          Crear mi perfil verificado
        </Link>
      </AppHero>

      <Reveal delay={0}>
      <section className="grid gap-4 rounded-[28px] border border-line bg-white p-5 shadow-soft md:grid-cols-3">
        <article className="rounded-2xl bg-brand-soft p-4">
          <span className="text-xs font-black uppercase text-brand-dark">Control</span>
          <strong className="mt-1 block text-xl text-ink">Bloquea horarios ocupados</strong>
          <p className="mt-2 text-sm font-bold leading-6 text-muted">Los clientes dejan de ver esos espacios al reservar.</p>
        </article>
        <article className="rounded-2xl bg-slate-50 p-4">
          <span className="text-xs font-black uppercase text-muted">Confianza</span>
          <strong className="mt-1 block text-xl text-ink">Disponibilidad según agenda</strong>
          <p className="mt-2 text-sm font-bold leading-6 text-muted">El perfil muestra próximos bloques sin prometer confirmación automática.</p>
        </article>
        <article className="rounded-2xl bg-accent-soft p-4">
          <span className="text-xs font-black uppercase text-accent-dark">Operación</span>
          <strong className="mt-1 block text-xl text-ink">Listo para backend</strong>
          <p className="mt-2 text-sm font-bold leading-6 text-muted">La estructura local queda preparada para conectar D1 y validaciones reales.</p>
        </article>
      </section>
      </Reveal>

      <SpecialistAgendaPanel specialist={specialist} />
    </main>
  );
}
