import Link from "next/link";
import { AcquisitionPageViewTracker } from "@/components/AcquisitionTrackingLink";
import { PlatformNav } from "@/components/PlatformNav";
import { InstitutionContactForm } from "@/components/institutions/InstitutionContactForm";
import { categoryImages, teamImages } from "@/data/visualAssets";
import { buildPublicRouteMetadata } from "@/lib/seo/baseRouteMetadata";

export const metadata = buildPublicRouteMetadata({
  title: "Instituciones y alianzas | OficiosPro",
  description: "Propuesta de colaboracion para municipalidades, OMIL, SENCE, CFT/IP, liceos tecnicos y organizaciones de empleabilidad.",
  path: "/instituciones",
  keywords: ["OMIL oficios", "alianzas empleabilidad", "especialistas tecnicos", "formalizacion oficios"],
});

const context = { source: "omil" as const, campaign: "institutional_partnerships", landingPage: "/instituciones" };

const partnerTypes = ["Municipalidades", "OMIL", "SENCE", "ChileValora", "CFT / IP", "Liceos tecnicos", "Fundaciones", "Programas de empleo"];

const valueCards = [
  { tone: "bg-brand-soft text-brand-dark", title: "Difusion local", text: "Llega a vecinos con oficios reales por comuna.", icon: IconMegaphone },
  { tone: "bg-accent-soft text-accent-dark", title: "Derivacion de especialistas", text: "Canal ordenado para inscribir a sus beneficiarios.", icon: IconUsers },
  { tone: "bg-sun-soft text-sun-dark", title: "Talleres de perfil digital", text: "Apoyo para crear un perfil profesional verificable.", icon: IconSpark },
  { tone: "bg-emerald-50 text-emerald-700", title: "Formalizacion asistida", text: "Acompanamiento para entender boletas y documentos.", icon: IconDoc },
  { tone: "bg-brand-soft text-brand-dark", title: "Reportes agregados", text: "Datos por comuna y oficio, sin exponer personas.", icon: IconChart },
  { tone: "bg-accent-soft text-accent-dark", title: "Pilotos comunales", text: "Una prueba acotada antes de escalar la alianza.", icon: IconFlag },
];

const reportRows = [
  { label: "Gasfiteria", pct: 78 },
  { label: "Electricidad", pct: 64 },
  { label: "Climatizacion", pct: 52 },
  { label: "Pintura", pct: 41 },
  { label: "Carpinteria", pct: 33 },
];

export default function InstitutionsPage() {
  return (
    <main className="section grid gap-12">
      <AcquisitionPageViewTracker source="omil" context={context} />
      <PlatformNav />

      {/* HERO */}
      <section className="enterprise-shell relative overflow-hidden p-7 md:p-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow-pill border-white/20 bg-white/10 text-white">Instituciones y alianzas</p>
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">
              Un canal serio para visibilizar a los especialistas tecnicos de tu comuna.
            </h1>
            <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-white/80">
              Derivacion ordenada, talleres de perfil digital y reportes agregados por comuna y oficio. Sin prometer empleo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#contacto-institucional" className="btn-sun">Solicitar reunion</Link>
              <Link href="/contacto?source=instituciones&campaign=institutional_partnerships" className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/20">
                Proponer piloto
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5 text-sm font-bold text-white/90">
              {["Datos agregados", "Sin exponer personas", "Piloto controlado"].map((chip) => (
                <span key={chip} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-2">
                  <IconCheck className="h-3.5 w-3.5 text-emerald-300" /> {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img src={teamImages.mujeresPlanos} alt="Equipo tecnico revisando planos" className="col-span-2 h-48 w-full rounded-card object-cover shadow-lift" loading="eager" />
            <img src={categoryImages.electricidad} alt="Especialista en electricidad" className="h-32 w-full rounded-card object-cover" loading="lazy" />
            <img src={categoryImages.climatizacion} alt="Especialista en climatizacion" className="h-32 w-full rounded-card object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      {/* PARTNER TYPES */}
      <section className="grid gap-4">
        <p className="text-center text-sm font-black uppercase tracking-wide text-muted">Pensado para</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {partnerTypes.map((type) => (
            <span key={type} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-black text-ink shadow-sm">{type}</span>
          ))}
        </div>
      </section>

      {/* VALUE CARDS */}
      <section className="grid gap-6">
        <div className="max-w-2xl">
          <p className="eyebrow">Como colaborar</p>
          <h2 className="section-title">Seis formas concretas de trabajar juntos</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {valueCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="rounded-card border border-line bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-card">
                <span className={`grid h-14 w-14 place-items-center rounded-2xl ${card.tone}`}><Icon className="h-7 w-7" /></span>
                <h3 className="mt-5 text-xl font-black text-ink">{card.title}</h3>
                <p className="mt-2 text-base font-semibold leading-7 text-muted">{card.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* QUE GANA LA INSTITUCION + REPORT MOCK */}
      <section className="grid gap-6 rounded-[32px] border border-line bg-slate-50 p-7 md:p-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow">Que gana la institucion</p>
          <h2 className="section-title">Visibilidad medible de tu comuna</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Especialistas inscritos", "Por comuna"],
              ["Oficios por comuna", "Distribucion"],
              ["Postulaciones por fuente", "Trazables"],
              ["Necesidades de formalizacion", "Detectadas"],
              ["Avance de revision", "En tiempo real"],
              ["Reportes agregados", "Exportables"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wide text-muted">{label}</p>
                <p className="mt-1 text-lg font-black text-ink">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Report mock */}
        <div className="rounded-card border border-line bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-ink">Reporte agregado por oficio</p>
            <span className="chip-sun px-3 py-1 text-[11px]">Ejemplo referencial</span>
          </div>
          <div className="mt-5 grid gap-4">
            {reportRows.map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-sm font-black text-ink">
                  <span>{row.label}</span>
                  <span className="text-muted">{row.pct}%</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs font-bold leading-5 text-muted">
            Vista ilustrativa. Los reportes reales se generan por comuna y oficio cuando exista volumen, sin exponer datos personales.
          </p>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section id="contacto-institucional" className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Conversemos</p>
          <h2 className="section-title">Solicita una reunion o propon un piloto</h2>
          <p className="mt-4 text-base font-semibold leading-7 text-muted">
            Cuentanos tu institucion y comuna. Coordinamos una conversacion para evaluar una colaboracion acotada.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {["Sin costo de exploracion", "Piloto acotado", "Datos agregados"].map((chip) => (
              <span key={chip} className="chip-brand px-3.5 py-2">{chip}</span>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-line bg-white p-6 shadow-soft md:p-8">
          <InstitutionContactForm />
        </div>
      </section>

      <p className="max-w-3xl text-xs font-semibold leading-5 text-muted">
        Esta pagina no declara convenios vigentes: presenta una propuesta de colaboracion para pilotos y conversaciones institucionales. OficiosPro no promete empleo ni ingresos garantizados.
      </p>
    </main>
  );
}

/* ---- Iconos inline (sin dependencias externas) ---- */
type IconProps = { className?: string };
function IconCheck({ className }: IconProps) {
  return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={3}><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function IconMegaphone({ className }: IconProps) {
  return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><path d="m3 11 14-6v14L3 13v-2Z" /><path d="M7 12v5a2 2 0 0 0 2 2h1" /><path d="M17 9a3 3 0 0 1 0 6" /></svg>);
}
function IconUsers({ className }: IconProps) {
  return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6" /></svg>);
}
function IconSpark({ className }: IconProps) {
  return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>);
}
function IconDoc({ className }: IconProps) {
  return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><path d="M7 3h7l5 5v13H7Z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>);
}
function IconChart({ className }: IconProps) {
  return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 20V4M4 20h16M8 16v-4M13 16V8M18 16v-6" /></svg>);
}
function IconFlag({ className }: IconProps) {
  return (<svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>);
}
