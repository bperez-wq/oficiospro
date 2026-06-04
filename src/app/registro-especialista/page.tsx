import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { SpecialistRegisterForm } from "@/components/Forms";

export default function SpecialistRegisterPage() {
  return (
    <main className="section grid gap-6">
      <PlatformNav />
      <AppHero
        eyebrow="Registro especialista"
        title="Convierte tu oficio en una fuente constante de clientes."
        subtitle="Crea una solicitud verificable para que el admin la apruebe antes de aparecer en la red."
      />
      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <SpecialistRegisterForm />
        <article className="panel overflow-hidden p-0">
          <img src="/assets/work-electrical.webp" alt="Especialista mostrando un trabajo terminado" className="h-80 w-full object-cover" />
          <div className="p-6">
            <h2 className="text-2xl font-black">Perfil tipo LinkedIn + Booking</h2>
            <p className="mt-2 text-muted">Foto destacada, certificaciones, trabajos completados, galería y calificaciones verificadas.</p>
          </div>
        </article>
      </section>
    </main>
  );
}
