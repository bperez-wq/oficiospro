import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { ContactTrustStrip } from "@/components/ContactTrustStrip";
import { ConversionButton } from "@/components/ConversionModal";
import { CompanyRequestForm } from "@/components/Forms";
import { PlanActionCard } from "@/components/PlanActionCard";
import { companyDashboard, companyUseCases } from "@/data/mock";
import { subscriptionPlans } from "@/data/marketplace";

export default function EmpresasPage() {
  const enterprisePlans = subscriptionPlans.filter((plan) => plan.audience === "empresa");

  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="OficiosPro Empresas"
        title="Centraliza mantenciones, sucursales y créditos corporativos."
        subtitle="Externaliza mantenciones de forma controlada con técnicos verificados, centros de costo, reportes, documentación del servicio, facturación y trazabilidad."
      >
        <ConversionButton type="contacto_empresa" sourceButton="Solicitar cuenta empresa" className="btn-primary">
          Solicitar contacto
        </ConversionButton>
        <ConversionButton type="contacto_empresa" sourceButton="Ver planes empresa" className="btn-secondary">
          Ver planes empresa
        </ConversionButton>
      </AppHero>

      <section className="enterprise-shell p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow text-teal-200">Continuidad operacional</p>
            <h2 className="text-4xl font-black leading-tight">Centraliza tus mantenciones y paga con créditos corporativos.</h2>
            <p className="mt-4 font-semibold leading-7 text-white/75">
              Reduce carga administrativa, ordena proveedores externos, controla consumo por sucursal y prepara trazabilidad para facturación mensual consolidada.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {companyUseCases.map((item) => (
                <span key={item} className="chip bg-white/10 text-white">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[26px] bg-white p-5 text-ink">
            <div className="grid gap-3 md:grid-cols-4">
              <Metric label="Créditos" value={companyDashboard.creditsAvailable.toString()} />
              <Metric label="Usados" value={companyDashboard.creditsUsed.toString()} />
              <Metric label="Respuesta" value={companyDashboard.responseTime} />
              <Metric label="Sucursales" value={companyDashboard.activeBranches.toString()} />
            </div>
            <div className="mt-5 grid gap-3">
              {companyDashboard.services.map((service) => (
                <article key={`${service.service}-${service.branch}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <div>
                    <strong>{service.service}</strong>
                    <span className="block text-sm font-bold text-muted">
                      {service.branch} · {service.status}
                    </span>
                  </div>
                  <strong className="text-brand">{service.credits} cr</strong>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-8 max-w-3xl">
          <p className="eyebrow">Planes empresa</p>
          <h2 className="section-title">Membresía fija mensual + bolsa de créditos.</h2>
          <p className="section-lead">Diseñado para empresas que necesitan respuesta operacional, créditos corporativos, control por centro de costo, documentación y trazabilidad.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {enterprisePlans.map((plan) => (
            <PlanActionCard key={plan.id} plan={plan} featured={plan.id === "empresa"} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          ["Facturación y trazabilidad", "Documentación preparada para revisión administrativa, contable y tributaria."],
          ["Dashboard de consumo", "Créditos corporativos, solicitudes abiertas, centros de costo e historial."],
          ["SLA y priorización", "Respuesta rápida para operación crítica."],
          ["Gestión por sucursal", "Ordena locales, oficinas, bodegas, comunidades y responsables internos."],
          ["Reportes mensuales", "Control de mantenciones, gastos y proveedores."],
          ["Externalización controlada", "Contrata servicios sin aumentar carga operativa permanente."],
        ].map(([title, text]) => (
          <article key={title} className="panel card-hover">
            <h3 className="text-xl font-black">{title}</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-muted">{text}</p>
          </article>
        ))}
      </section>

      <section id="empresa-form" className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <CompanyRequestForm />
        <article className="panel">
          <p className="eyebrow">Solicitud empresa</p>
          <h2 className="text-3xl font-black">Cuéntanos tu operación.</h2>
          <p className="mt-3 font-semibold leading-7 text-muted">
            Recibiremos la solicitud con datos de contacto, sucursales, centros de costo y plan objetivo para preparar una cuenta corporativa.
          </p>
          <img src="/assets/club-empresas.webp" alt="Equipo técnico trabajando en una empresa" className="mt-6 h-72 w-full rounded-2xl object-cover" />
        </article>
      </section>

      <ContactTrustStrip />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl bg-slate-50 p-4">
      <span className="text-xs font-black uppercase text-muted">{label}</span>
      <strong className="mt-1 block text-2xl font-black">{value}</strong>
    </article>
  );
}
