import Link from "next/link";
import { AcquisitionPageViewTracker, AcquisitionTrackingLink } from "@/components/AcquisitionTrackingLink";
import { PlatformNav } from "@/components/PlatformNav";
import { PremiumPhotoHero } from "@/components/PremiumPhotoHero";
import { SpecialistQuickLeadForm } from "@/components/SpecialistQuickLeadForm";
import { Reveal } from "@/components/Reveal";
import { founderNoPromiseMessages, founderRegistrationHref } from "@/data/specialistAcquisition";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "Instaladores autorizados SEC | Crea tu Pasaporte Profesional OficiosPro",
  description:
    "Para instaladores eléctricos y de gas autorizados SEC: crea tu Pasaporte Profesional OficiosPro sin costo inicial, destaca tu certificación y aparece por comuna.",
  path: "/sec",
  keywords: ["instalador SEC", "instalador autorizado SEC", "electricista SEC", "instalador de gas SEC", "perfil profesional instalador"],
});

const secContext = {
  source: "sec_mailing" as const,
  campaign: "sec_outreach",
  landingPage: "/sec",
};

const registerHref = founderRegistrationHref({ ...secContext, sourceDetail: "sec_landing" });

const secSteps = [
  ["1", "Crea tu perfil en minutos", "Nombre, comuna, servicios y tu autorización SEC declarada. Sin costo inicial."],
  ["2", "Una persona real lo revisa", "El equipo OficiosPro valida tu información en ~48 h y te contacta si falta algo."],
  ["3", "Apareces por comuna", "Tu Pasaporte Profesional se publica con tu certificación destacada, para que clientes te encuentren y te prefieran."],
];

const secValuePoints = [
  "Tu autorización SEC destacada como certificación en tu perfil.",
  "Los clientes te encuentran por comuna y especialidad, no solo por contactos.",
  "Solicitudes y cotizaciones ordenadas en un solo lugar, con seguimiento.",
  "Reputación acumulable: cada trabajo bien hecho suma a tu respaldo.",
  "Formalización asistida: te ayudamos con boletas y documentos cuando actives pagos.",
];

export default function SecLandingPage() {
  return (
    <main className="section grid gap-10">
      <AcquisitionPageViewTracker eventType="page_view" source="sec_mailing" context={secContext} />
      <PlatformNav />

      <PremiumPhotoHero
        eyebrow="Para instaladores autorizados SEC"
        title="Tu certificación SEC merece una vitrina profesional."
        subtitle="Si llegaste desde nuestro correo, es porque figuras en el registro público de instaladores autorizados. Crea tu Pasaporte Profesional OficiosPro: tu certificación, tus servicios y tu comuna en un perfil que genera confianza."
        image="/assets/oficios/electricidad/electricidad-tablero-01.jpg"
        tone="brand"
        chips={["Sin costo inicial", "Revisión humana en ~48 h", "Tu certificación destacada", "Sin promesas de ingresos"]}
        footnote="OficiosPro no es la SEC, no emite certificaciones ni está afiliada a ella. La vigencia de tu autorización siempre se verifica en la fuente oficial (sec.cl)."
      >
        <AcquisitionTrackingLink
          href={registerHref}
          className="btn-sun shine"
          eventType="click_offer_services"
          sourceButton="Crear Pasaporte - landing SEC"
          sourceComponent="SecLandingPage"
          context={secContext}
        >
          Crear mi Pasaporte Profesional
        </AcquisitionTrackingLink>
        <a href="#como-funciona" className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/20">
          Ver cómo funciona
        </a>
      </PremiumPhotoHero>

      <Reveal delay={0}>
        <section id="como-funciona" className="grid gap-5 scroll-mt-28">
          <div className="max-w-2xl">
            <p className="eyebrow">Cómo funciona</p>
            <h2 className="section-title">Tres pasos, sin letra chica.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {secSteps.map(([step, title, text]) => (
              <article key={step} className="rounded-[24px] border border-line bg-white p-6 shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand text-lg font-black text-white">{step}</span>
                <h3 className="mt-4 text-lg font-black text-ink">{title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">{text}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={70}>
        <section className="grid gap-6 rounded-[32px] border border-brand/15 bg-brand-soft p-6 md:p-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow">Por qué en OficiosPro</p>
            <h2 className="text-3xl font-black leading-tight text-ink">Que tu autorización trabaje para ti.</h2>
            <ul className="mt-5 grid gap-2.5">
              {secValuePoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 rounded-2xl bg-white p-3.5 text-sm font-bold leading-6 text-ink">
                  <span aria-hidden className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-[10px] font-black text-white">✓</span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-bold leading-5 text-muted">
              Primero buenos perfiles, después más oportunidades. La publicación depende de revisión y cobertura por comuna.
            </p>
          </div>
          <SpecialistQuickLeadForm
            title="¿Prefieres que te ayudemos a crearlo?"
            text="Deja tus datos básicos y el equipo OficiosPro te orienta para armar tu perfil con tu certificación SEC."
            context={secContext}
            sourceComponent="SecLandingPage"
            sourceButton="Captura rápida landing SEC"
            leadKind="founder_lead"
          />
        </section>
      </Reveal>

      <Reveal delay={140}>
        <section className="rounded-[28px] border border-line bg-white p-6 shadow-soft md:p-7">
          <p className="eyebrow">Transparencia</p>
          <h2 className="text-2xl font-black text-ink">Sobre nuestros correos y tus datos</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-muted">
              Te contactamos porque tu autorización figura en el registro público de la SEC, una fuente consultable por cualquier persona.
            </p>
            <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-muted">
              No publicamos tus datos de contacto, dirección, RUT ni foto. Solo tú decides si creas y activas tu perfil.
            </p>
            <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-muted">
              ¿No quieres recibir más correos o necesitas corregir o eliminar una referencia tuya?{" "}
              <Link className="font-black text-brand-dark underline underline-offset-2" href="/privacidad/solicitudes?source=sec_landing">
                Envíanos tu solicitud aquí.
              </Link>
            </p>
          </div>
        </section>
      </Reveal>

      <footer className="grid gap-3 border-t border-line pt-6">
        <div className="flex flex-wrap gap-2">
          {founderNoPromiseMessages.map((message) => (
            <span key={message} className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">
              {message}
            </span>
          ))}
        </div>
        <p className="max-w-3xl text-xs font-semibold leading-5 text-muted">
          OficiosPro es una plataforma privada e independiente. La certificación SEC pertenece a su titular y su vigencia se verifica en el sitio oficial de la Superintendencia de Electricidad y Combustibles.
        </p>
      </footer>
    </main>
  );
}
