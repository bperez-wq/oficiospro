import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { SpecialistRegisterForm } from "@/components/Forms";

export default function SpecialistRegisterPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Registro especialista"
        title="Convierte tu oficio en una fuente constante de clientes."
        subtitle="Crea tu perfil profesional, muestra trabajos, recibe reservas y construye reputación con calificaciones reales."
      />
      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <SpecialistRegisterForm />
        <article className="overflow-hidden rounded-[28px] border border-line bg-white shadow-soft">
          <img src="/assets/work-electrical.webp" alt="Especialista mostrando un trabajo terminado" className="h-80 w-full object-cover" />
          <div className="p-6">
            <h2 className="text-2xl font-black">Perfil tipo LinkedIn profesional.</h2>
            <p className="mt-3 font-semibold leading-7 text-muted">Foto destacada, certificaciones, trabajos completados, galería y calificaciones verificadas.</p>
            <div className="mt-5 grid gap-2">
              {["Perfil público profesional", "Galería de trabajos", "Pagos a través de la plataforma", "Top Especialista"].map((item) => (
                <span key={item} className="rounded-2xl bg-slate-50 p-3 text-sm font-black text-ink">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
