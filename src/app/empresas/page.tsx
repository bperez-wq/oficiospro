import Link from "next/link";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { CompanyRequestForm } from "@/components/Forms";
import { companyDashboard } from "@/data/mock";

export default function EmpresasPage() {
  return (
    <main className="section grid gap-6">
      <PlatformNav />
      <AppHero
        eyebrow="OficiosPro Empresas"
        title="Centraliza tus mantenciones y paga con créditos corporativos."
        subtitle="Red de técnicos verificados para oficinas, restaurantes, bodegas, locales comerciales, plantas productivas y comunidades."
      >
        <Link className="btn-primary" href="#empresa-form">Solicitar cuenta empresa</Link>
        <Link className="btn-secondary" href="/dashboard-empresa">Ver dashboard demo</Link>
      </AppHero>
      <section className="grid gap-5 md:grid-cols-3">
        <Plan name="Plan Pyme" price="$49.990/mes" text="Membresía fija mensual + bolsa de créditos. Ideal para oficinas pequeñas, locales y restaurantes." />
        <Plan name="Plan Empresa" price="$149.990/mes" text="Dashboard, múltiples sucursales, historial de servicios y facturación mensual." featured />
        <Plan name="Corporativo" price="Desde $499.990/mes" text="SLA, atención prioritaria, ejecutivo asignado y reportes mensuales." />
      </section>
      <section className="rounded-panel bg-enterprise p-6 text-white shadow-soft">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Créditos corporativos" value={companyDashboard.creditsAvailable.toString()} />
          <Metric label="Usados este mes" value={companyDashboard.creditsUsed.toString()} />
          <Metric label="Respuesta promedio" value={companyDashboard.responseTime} />
          <Metric label="Facturación mensual" value={companyDashboard.monthlyBilling} />
        </div>
      </section>
      <section id="empresa-form" className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <CompanyRequestForm />
        <article className="panel">
          <h2 className="text-2xl font-black">Lo que compra una empresa</h2>
          <ul className="mt-4 grid gap-3 font-bold text-muted">
            <li>Facturación mensual consolidada.</li>
            <li>Dashboard de consumo de créditos.</li>
            <li>Gestión por sucursal.</li>
            <li>Menos tiempo buscando proveedores.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}

function Plan({ name, price, text, featured = false }: { name: string; price: string; text: string; featured?: boolean }) {
  return (
    <article className={`panel ${featured ? "bg-brand text-white" : ""}`}>
      <span className={featured ? "font-black text-white/70" : "font-black text-brand"}>{name}</span>
      <strong className="my-3 block text-3xl font-black">{price}</strong>
      <p className={featured ? "text-white/75" : "text-muted"}>{text}</p>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl bg-white/10 p-5">
      <span className="font-bold text-white/70">{label}</span>
      <strong className="mt-2 block text-3xl font-black">{value}</strong>
    </article>
  );
}
