import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { ClientRegisterForm } from "@/components/Forms";

export default function ClientRegisterPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Registro cliente"
        title="Crea tu cuenta Club Hogar."
        subtitle="Guarda tu comuna, dirección privada y plan para recibir especialistas cercanos, activar créditos y reservar con pago protegido."
      />
      <section className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <ClientRegisterForm />
        <article className="enterprise-shell p-6">
          <span className="font-bold text-white/70">Saldo inicial</span>
          <strong className="my-4 block text-7xl font-black">45</strong>
          <p className="font-semibold leading-7 text-white/75">Al crear tu cuenta puedes activar créditos acumulables para reservar técnicos verificados cuando los necesites.</p>
          <div className="mt-6 grid gap-3">
            {["Créditos acumulables", "Pago seguro", "Historial de servicios"].map((item) => (
              <span key={item} className="rounded-2xl bg-white/10 p-4 text-sm font-black">
                {item}
              </span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
