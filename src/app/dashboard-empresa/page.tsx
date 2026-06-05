import { ConversionButton } from "@/components/ConversionModal";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { CompanyDashboard } from "@/components/Dashboards";

export default function DashboardEmpresaPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Dashboard empresa"
        title="Centro operativo para mantenciones corporativas."
        subtitle="Controla créditos, sucursales, servicios solicitados, gastos mensuales, reportes, proveedores frecuentes y facturación mensual consolidada."
      >
        <ConversionButton type="contacto_empresa" sourceButton="Solicitar técnico dashboard empresa" className="btn-primary">
          Solicitar técnico
        </ConversionButton>
        <ConversionButton type="plan_empresa" sourceButton="Ver planes empresa dashboard" className="btn-secondary">
          Ver planes empresa
        </ConversionButton>
      </AppHero>
      <CompanyDashboard />
    </main>
  );
}
