import Link from "next/link";

const contactItems = [
  "Especialistas verificados",
  "Pago protegido",
  "Evidencia de trabajo",
  "Soporte directo",
];

export function ContactTrustStrip({ email = "bperez@oficiospro.cl" }: { email?: string }) {
  return (
    <section className="rounded-[28px] border border-brand/15 bg-brand-soft p-5 shadow-sm md:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="eyebrow">Confianza operativa</p>
          <h2 className="text-2xl font-black text-ink">Contacto visible y respaldo humano.</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-brand-dark">
            Para solicitudes, empresas o postulaciones, escribe a <Link className="underline decoration-brand/40 underline-offset-4" href={`mailto:${email}`}>{email}</Link>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {contactItems.map((item) => (
            <span key={item} className="chip bg-white text-brand-dark">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
