import { AcquisitionPageViewTracker } from "@/components/AcquisitionTrackingLink";
import { PlatformNav } from "@/components/PlatformNav";
import { ReferralTool } from "@/components/referrals/ReferralTool";
import { femaleProfileImages } from "@/data/visualAssets";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "Referidos de especialistas | OficiosPro",
  description: "Programa no monetario para que especialistas aprobados recomienden a otros trabajadores tecnicos y fortalezcan la red fundadora.",
  path: "/referidos/especialistas",
  keywords: ["referidos especialistas", "oficiospro fundadores", "recomendar especialista"],
});

const referralContext = { source: "referido_especialista" as const, campaign: "founder_specialist_referrals", landingPage: "/referidos/especialistas" };

const steps = [
  { n: "1", title: "Comparte tu link", text: "Envialo por WhatsApp a buenos especialistas.", tone: "bg-brand" },
  { n: "2", title: "Tu referido postula", text: "Crea su perfil con tu codigo asociado.", tone: "bg-accent" },
  { n: "3", title: "OficiosPro revisa", text: "Validamos calidad, comuna y oficio.", tone: "bg-sun" },
  { n: "4", title: "Ganas reconocimiento", text: "Sumas visibilidad y badge en la red.", tone: "bg-emerald-500" },
];

const badges = [
  { label: "Fundador", tone: "chip-sun", icon: IconStar },
  { label: "Buen referidor", tone: "chip-brand", icon: IconShare },
  { label: "Red confiable", tone: "chip-emerald", icon: IconShield },
];

const progress = [
  { label: "Referidos enviados", value: "5" },
  { label: "Postulaciones recibidas", value: "3" },
  { label: "Aprobados", value: "2" },
  { label: "Badge fundador", value: "Activo" },
];

const faqs = [
  ["Hay pago en dinero por referir?", "No. El programa es no monetario: los beneficios son de visibilidad y reconocimiento dentro de la red."],
  ["Me garantizan ingresos o trabajos?", "No prometemos ingresos ni volumen de trabajos. La publicacion depende de revision, cobertura y calidad del perfil."],
  ["Que pasa con mi referido?", "Queda con source=referido_especialista y pasa por la misma revision operativa que cualquier postulante."],
];

export default function SpecialistReferralsPage() {
  return (
    <main className="section grid gap-12">
      <AcquisitionPageViewTracker eventType="page_view" source="referido_especialista" context={referralContext} />
      <PlatformNav />

      {/* HERO */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="eyebrow">Referidos de especialistas</p>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-ink md:text-5xl">
            Invita a buenos especialistas y fortalece la red OficiosPro.
          </h1>
          <p className="mt-4 max-w-xl text-lg font-semibold leading-8 text-muted">
            Comparte tu link, suma a tu gente de confianza y gana reconocimiento dentro de la red fundadora.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-3">
              {[femaleProfileImages.gasfiter, femaleProfileImages.electricista, femaleProfileImages.climatizacion].map((src) => (
                <img key={src} src={src} alt="" className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm" loading="lazy" />
              ))}
            </div>
            <p className="text-sm font-bold text-muted">Especialistas fundadores ya estan invitando.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <span key={badge.label} className={`${badge.tone} px-3.5 py-2`}>
                  <Icon className="h-4 w-4" /> {badge.label}
                </span>
              );
            })}
          </div>
        </div>
        <ReferralTool />
      </section>

      {/* PROGRESS / GAMIFICACION */}
      <section className="rounded-[32px] border border-line bg-slate-50 p-7 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Tu progreso</p>
            <h2 className="section-title">Mira crecer tu red</h2>
          </div>
          <span className="chip-sun px-3 py-1 text-[11px]">Ejemplo referencial</span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {progress.map((item) => (
            <div key={item.label} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <p className="text-3xl font-black text-ink">{item.value}</p>
              <p className="mt-1 text-sm font-bold text-muted">{item.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs font-bold leading-5 text-muted">
          Valores de ejemplo. Tus cifras reales apareceran en tu cuenta cuando inicies sesion como especialista aprobado.
        </p>
      </section>

      {/* STEPS */}
      <section className="grid gap-6">
        <div className="max-w-2xl">
          <p className="eyebrow">Como funciona</p>
          <h2 className="section-title">Cuatro pasos simples</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <article key={step.n} className="rounded-card border border-line bg-white p-6 shadow-soft">
              <span className={`grid h-12 w-12 place-items-center rounded-full ${step.tone} text-lg font-black text-white`}>{step.n}</span>
              <h3 className="mt-4 text-lg font-black text-ink">{step.title}</h3>
              <p className="mt-1.5 text-sm font-semibold leading-6 text-muted">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ con disclaimers */}
      <section className="grid gap-4 rounded-[32px] border border-line bg-white p-7 shadow-soft md:p-10">
        <p className="eyebrow">Preguntas frecuentes</p>
        <div className="grid gap-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="group rounded-2xl border border-line bg-slate-50 p-4">
              <summary className="cursor-pointer list-none text-base font-black text-ink marker:hidden">
                <span className="flex items-center justify-between gap-3">
                  {q}
                  <span className="text-muted transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm font-semibold leading-6 text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ---- Iconos inline ---- */
type IconProps = { className?: string };
function IconStar({ className }: IconProps) {
  return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.9l6.9-.8L12 2Z" /></svg>);
}
function IconShare({ className }: IconProps) {
  return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>);
}
function IconShield({ className }: IconProps) {
  return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>);
}
