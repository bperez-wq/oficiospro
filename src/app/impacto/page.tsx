import Link from "next/link";
import { ContactTrustStrip } from "@/components/ContactTrustStrip";
import { ConversionButton } from "@/components/ConversionModal";
import { OperationalDashboardMock } from "@/components/OperationalDashboardMock";
import { PageHero } from "@/components/PageHero";
import { PageShell } from "@/components/PageShell";
import { PremiumCard } from "@/components/PremiumCard";
import { SectionHeader } from "@/components/SectionHeader";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { PlatformNav } from "@/components/PlatformNav";

const impactStats = [
  ["Especialistas", "Perfil verificable, reputación y agenda para vender mejor su oficio."],
  ["Hogares", "Créditos acumulables, pago protegido y evidencia del trabajo realizado."],
  ["Empresas", "Contratación flexible para mantenciones sin aumentar carga operativa."],
  ["País", "Más trabajo técnico con reputación y trazabilidad, sujeto a reglas claras."],
];

const benefitGroups = [
  {
    title: "Beneficio para especialistas",
    text: "OficiosPro facilita que gasfíters, eléctricos, técnicos HVAC, jardineros y maestros de mantención presenten su trabajo de forma profesional, acumulen reputación real y ordenen solicitudes sin depender solo de recomendaciones informales.",
    items: ["Perfil profesional", "Agenda y solicitudes calificadas", "Pagos trazables", "Documentación ordenada"],
  },
  {
    title: "Beneficio para hogares",
    text: "Las familias pueden planificar mantenciones con créditos acumulables para servicios reales, revisar especialistas y liberar pagos con mayor respaldo cuando el servicio se cierra.",
    items: ["Créditos acumulables", "Pago protegido", "Historial de uso", "Evidencia del trabajo"],
  },
  {
    title: "Beneficio para empresas y comunidades",
    text: "Empresas, comunidades y operaciones multi-sede pueden externalizar mantenciones de forma controlada, con centros de costo, reportes y documentación del servicio.",
    items: ["Contratación flexible para empresas", "Menos carga administrativa", "Reportes por sede", "Créditos corporativos"],
  },
  {
    title: "Beneficio para el país",
    text: "La plataforma busca ordenar el trabajo independiente, democratizar acceso a oportunidades técnicas y preparar una base de trazabilidad para pagos, reputación y documentación.",
    items: ["Formalizar oportunidades", "Profesionalizar el oficio", "Más trazabilidad", "Mejor información de servicios"],
  },
];

const operatingPrinciples = [
  ["Formalización progresiva", "Facilita antecedentes, perfiles, evidencia y registros para que el especialista pueda crecer con más orden."],
  ["Trazabilidad responsable", "Permite documentar solicitudes, créditos retenidos, trabajos cerrados, pagos y documentos tributarios cuando corresponda."],
  ["Lenguaje claro", "El cliente ve créditos; el especialista declara su tarifa esperada en CLP; OficiosPro calcula y administra reglas internas."],
  ["Revisión profesional", "La operación tributaria y contable final queda sujeta a revisión contable y tributaria."],
];

export default function ImpactPage() {
  return (
    <PageShell className="pb-28 md:pb-24">
      <PlatformNav />
      <PageHero
        eyebrow="Impacto OficiosPro"
        title="OficiosPro: infraestructura de confianza para el trabajo técnico en Chile"
        subtitle="Una plataforma preparada para profesionalizar el oficio, formalizar oportunidades y ordenar servicios técnicos con créditos, pago protegido, reputación y evidencia de trabajo."
        badges={["Profesionalizar el oficio", "Formalizar oportunidades", "Pago protegido y evidencia"]}
      >
        <ConversionButton type="lead_cliente" sourceButton="Impacto CTA hogares" className="btn-primary">
          Activar Club Hogar
        </ConversionButton>
        <ConversionButton type="contacto_empresa" sourceButton="Impacto CTA empresas" className="btn-secondary">
          Solicitar plan empresa
        </ConversionButton>
      </PageHero>

      <section className="grid gap-4 md:grid-cols-4">
        {impactStats.map(([title, text]) => (
          <PremiumCard key={title} className="min-h-44">
            <h2 className="text-2xl font-black text-ink">{title}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-muted">{text}</p>
          </PremiumCard>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SectionHeader
            eyebrow="Por qué existe OficiosPro"
            title="Más trabajo técnico con reputación y trazabilidad."
            text="Muchos servicios técnicos se coordinan con baja información, poca evidencia y procesos manuales. OficiosPro busca ordenar esa relación para hogares, empresas y especialistas, sin prometer cumplimiento automático ni reemplazar la revisión profesional."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {["Créditos acumulables para servicios reales", "Pago protegido y evidencia de trabajo", "Reputación real"].map((item) => (
              <span key={item} className="chip bg-brand-soft text-brand-dark">
                {item}
              </span>
            ))}
          </div>
        </div>
        <OperationalDashboardMock />
      </section>

      <section>
        <SectionHeader
          eyebrow="Beneficios"
          title="Una misma infraestructura para clientes, empresas, comunidades y especialistas."
          text="El valor no está solo en encontrar un técnico. Está en ordenar el flujo completo: solicitud, agenda, reputación, créditos, evidencia, soporte y documentación."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {benefitGroups.map((group) => (
            <PremiumCard key={group.title}>
              <h3 className="text-2xl font-black text-ink">{group.title}</h3>
              <p className="mt-3 font-semibold leading-7 text-muted">{group.text}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="chip bg-slate-50 text-ink">
                    {item}
                  </span>
                ))}
              </div>
            </PremiumCard>
          ))}
        </div>
      </section>

      <section className="enterprise-shell p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow text-teal-200">Formalización y trazabilidad</p>
            <h2 className="text-4xl font-black leading-tight">Preparado para ordenar pagos, documentación y reputación.</h2>
            <p className="mt-4 font-semibold leading-7 text-white/75">
              OficiosPro facilita registros operativos: solicitud, responsable, comuna, servicio, créditos retenidos, evidencia, estado de pago y documentación tributaria según corresponda.
            </p>
            <p className="mt-4 rounded-2xl bg-white/10 p-4 text-sm font-bold leading-6 text-white/75">
              Esto no reemplaza asesoría legal, laboral, contable ni tributaria. Todo flujo de documentación queda sujeto a revisión contable y tributaria con abogado y contador.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {operatingPrinciples.map(([title, text]) => (
              <article key={title} className="rounded-2xl bg-white p-5 text-ink">
                <h3 className="font-black">{title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <PremiumCard>
          <p className="eyebrow">Hogares</p>
          <h2 className="text-2xl font-black">Créditos acumulables para servicios reales.</h2>
          <p className="mt-3 font-semibold leading-7 text-muted">Planifica mantenciones, reserva especialistas y conserva historial de uso sujeto a términos de vigencia.</p>
          <ConversionButton type="lead_cliente" sourceButton="Impacto hogares bloque" className="btn-primary mt-5">
            Quiero usar OficiosPro
          </ConversionButton>
        </PremiumCard>
        <PremiumCard>
          <p className="eyebrow">Empresas</p>
          <h2 className="text-2xl font-black">Contratación flexible para empresas.</h2>
          <p className="mt-3 font-semibold leading-7 text-muted">Menos carga administrativa, centros de costo, reportes y documentación del servicio para mantenciones recurrentes.</p>
          <ConversionButton type="contacto_empresa" sourceButton="Impacto empresas bloque" className="btn-primary mt-5">
            Solicitar plan empresa
          </ConversionButton>
        </PremiumCard>
        <PremiumCard>
          <p className="eyebrow">Especialistas</p>
          <h2 className="text-2xl font-black">Perfil profesional y reputación acumulable.</h2>
          <p className="mt-3 font-semibold leading-7 text-muted">Más oportunidades, agenda, pagos trazables y soporte OficiosPro sin prometer empleo ni ingresos garantizados.</p>
          <ConversionButton type="registro_especialista" sourceButton="Impacto especialistas bloque" className="btn-primary mt-5">
            Postular como especialista
          </ConversionButton>
        </PremiumCard>
      </section>

      <ContactTrustStrip email="bperez@oficiospro.cl" />

      <section className="rounded-[28px] border border-line bg-white p-6 shadow-soft md:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow">Cómo ordenar el trabajo independiente</p>
            <h2 className="section-title">Del contacto informal a una operación con evidencia.</h2>
            <p className="section-lead">
              OficiosPro ordena la solicitud, permite comparar reputación, retiene créditos cuando corresponde, documenta avances y deja una base para boleta o factura según corresponda.
            </p>
          </div>
          <Link href="/terminos" className="btn-secondary">
            Revisar términos
          </Link>
        </div>
      </section>

      <StickyMobileCTA>
        <ConversionButton type="lead_cliente" sourceButton="Impacto sticky hogares" className="btn-primary flex-1 px-3">
          Hogar
        </ConversionButton>
        <ConversionButton type="registro_especialista" sourceButton="Impacto sticky especialistas" className="btn-secondary flex-1 px-3">
          Especialista
        </ConversionButton>
      </StickyMobileCTA>
    </PageShell>
  );
}
