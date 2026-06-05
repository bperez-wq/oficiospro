import { PlatformNav } from "@/components/PlatformNav";
import { LoginForm } from "@/components/Forms";

export default function LoginPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <section className="grid overflow-hidden rounded-[32px] border border-line bg-white shadow-soft lg:grid-cols-[1fr_0.9fr]">
        <div className="p-6 md:p-10">
          <p className="eyebrow">Acceso seguro</p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-ink md:text-6xl">
            Entra a tu cuenta OficiosPro.
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-muted">
            Gestiona reservas, créditos, solicitudes, servicios y operación desde una plataforma preparada para hogares, especialistas y empresas.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
        <aside className="relative min-h-[540px] bg-enterprise p-6 text-white md:p-10">
          <img
            src="/assets/hero-hogar.webp"
            alt="Técnico verificado atendiendo una mantención de hogar"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/90 via-brand-dark/78 to-ink/88" />
          <div className="relative z-10 grid h-full content-between gap-6">
            <div>
              <p className="eyebrow text-teal-200">Red verificada</p>
              <h2 className="text-3xl font-black">Confianza operacional para hogares y empresas.</h2>
              <p className="mt-3 font-semibold leading-7 text-white/75">
                OficiosPro combina reputación, créditos, cobertura por comuna y pago protegido para reducir incertidumbre en cada servicio.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["Técnicos verificados", "Pago seguro", "Créditos acumulables", "Cobertura en tu comuna"].map((item) => (
                <span key={item} className="rounded-2xl bg-white/12 p-4 text-sm font-black shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
