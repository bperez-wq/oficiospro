import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { ClientRegisterForm } from "@/components/Forms";

export default function ClientRegisterPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Registro cliente"
        title="Crea tu cuenta Club Hogar."
        subtitle="Guarda datos en localStorage por ahora. La estructura separa usuario, comuna, plan y créditos para conectar una base de datos después."
      />
      <section className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <ClientRegisterForm />
        <article className="enterprise-shell p-6">
          <span className="font-bold text-white/70">Saldo inicial demo</span>
          <strong className="my-4 block text-7xl font-black">45</strong>
          <p className="font-semibold leading-7 text-white/75">Al registrar un cliente se crea el usuario mock. La billetera demo se mantiene separada para probar reservas.</p>
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
