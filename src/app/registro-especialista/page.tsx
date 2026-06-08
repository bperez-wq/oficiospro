import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { ContactTrustStrip } from "@/components/ContactTrustStrip";
import { SpecialistRegisterForm } from "@/components/Forms";

export default function SpecialistRegisterPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Registro especialista"
        title="Convierte tu oficio en un perfil profesional verificable."
        subtitle="Postula para mostrar trabajos, recibir oportunidades calificadas, ordenar agenda, construir reputación y avanzar hacia una formalización progresiva con soporte OficiosPro."
      />
      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <SpecialistRegisterForm />
        <article className="overflow-hidden rounded-[28px] border border-line bg-white shadow-soft">
          <img src="/assets/work-electrical.webp" alt="Especialista mostrando un trabajo terminado" className="h-80 w-full object-cover" />
          <div className="p-6">
            <h2 className="text-2xl font-black">Perfil profesional con revisión de antecedentes.</h2>
            <p className="mt-3 font-semibold leading-7 text-muted">Foto destacada, certificaciones, trabajos completados, galería, agenda, pagos trazables y calificaciones verificadas. No prometemos empleo ni ingresos garantizados.</p>
            <div className="mt-5 grid gap-2">
              {["Más oportunidades calificadas", "Perfil público profesional", "Documentación ordenada", "Pagos trazables", "Reputación acumulable", "Soporte OficiosPro"].map((item) => (
                <span key={item} className="rounded-2xl bg-slate-50 p-3 text-sm font-black text-ink">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </article>
      </section>
      <ContactTrustStrip />
    </main>
  );
}
