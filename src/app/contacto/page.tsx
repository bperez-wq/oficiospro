import { ContactForm } from "@/components/ContactForm";
import { AppHero, PlatformNav } from "@/components/PlatformNav";

export default function ContactoPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Contacto"
        title="Hablemos de tu solicitud"
        subtitle="Escríbenos si necesitas un especialista para tu hogar, cobertura para empresa o postular como técnico verificado."
      />
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="panel">
          <p className="eyebrow">Correo institucional</p>
          <h2 className="text-3xl font-black">bperez@oficiospro.cl</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted">
            Este correo está disponible para coordinación comercial, soporte inicial y revisión de solicitudes mientras activamos automatizaciones.
          </p>
          <div className="mt-5 grid gap-2 text-sm font-bold text-muted">
            {["Hogar", "Empresa", "Especialista"].map((segment) => (
              <span key={segment} className="rounded-2xl bg-slate-50 p-3">{segment}</span>
            ))}
          </div>
          <p className="mt-5 text-xs font-bold leading-5 text-muted">
            Aliases preparados para operación futura: hola@oficiospro.cl, postulaciones@oficiospro.cl, empresas@oficiospro.cl y soporte@oficiospro.cl.
          </p>
        </article>
        <ContactForm />
      </section>
    </main>
  );
}
