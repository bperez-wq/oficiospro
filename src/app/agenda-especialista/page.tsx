import Link from "next/link";
import { PlatformNav } from "@/components/PlatformNav";
import { PremiumPhotoHero } from "@/components/PremiumPhotoHero";
import { SpecialistAgendaPanel } from "@/components/SpecialistAgendaPanel";
import { specialists } from "@/data/mock";
import { Reveal } from "@/components/Reveal";
import { RouteAuthGuard } from "@/components/RouteAuthGuard";

export default function AgendaEspecialistaPage() {
  const specialist = specialists[0];

  return (
    <RouteAuthGuard resource="specialist_dashboard">
    <main className="section grid gap-8">
      <PlatformNav />
      <PremiumPhotoHero
        eyebrow="Agenda especialista"
        title="Mi agenda OficiosPro"
        subtitle="Tu agenda, bajo tu control: administra disponibilidad, urgencias, bloques de atención y horarios ocupados. Lo que bloqueas deja de mostrarse a los clientes."
        image="/assets/oficios/climatizacion/aire-acondicionado-mantencion-01.jpg"
        tone="brand"
        chips={["Bloquea horarios ocupados", "Disponibilidad según agenda", "Sin confirmación automática"]}
        footnote="La disponibilidad que declares es referencial para el cliente: cada reserva se confirma antes de ejecutarse."
      >
        <Link className="btn-sun shine" href="/dashboard-especialista">
          Volver a mi panel
        </Link>
        <Link
          className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/20"
          href="/registro-especialista?source=agenda_hero&intent=offer_services"
          data-event="click_offer_services"
        >
          Completar mi Pasaporte
        </Link>
      </PremiumPhotoHero>

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
          <span className="text-xs font-black uppercase text-accent-dark">Preparada para crecer</span>
          <strong className="mt-1 block text-xl text-ink">Conectada a tu Pasaporte</strong>
          <p className="mt-2 text-sm font-bold leading-6 text-muted">A medida que la red crece, tu agenda recibirá solicitudes reales con seguimiento del equipo.</p>
        </article>
      </section>
      </Reveal>

      <SpecialistAgendaPanel specialist={specialist} />
    </main>
    </RouteAuthGuard>
  );
}
