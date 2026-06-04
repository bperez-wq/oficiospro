import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { ClientRegisterForm } from "@/components/Forms";

export default function ClientRegisterPage() {
  return (
    <main className="section grid gap-6">
      <PlatformNav />
      <AppHero eyebrow="Registro cliente" title="Crea tu cuenta Club Hogar" subtitle="Guarda datos en localStorage por ahora. La estructura ya separa usuario, comuna, plan y créditos para migrar a Supabase." />
      <section className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <ClientRegisterForm />
        <article className="panel bg-brand text-white">
          <span className="font-bold text-white/70">Saldo inicial demo</span>
          <strong className="my-4 block text-7xl font-black">45</strong>
          <p className="text-white/75">Al registrar un cliente se crea el usuario mock. La billetera demo se mantiene separada para probar reservas.</p>
        </article>
      </section>
    </main>
  );
}
