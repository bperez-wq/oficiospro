import { ConversionButton } from "@/components/ConversionModal";
import { PlatformNav } from "@/components/PlatformNav";
import { PremiumPhotoHero } from "@/components/PremiumPhotoHero";
import { CompanyDashboard } from "@/components/Dashboards";

export default function DashboardEmpresaPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <PremiumPhotoHero
        eyebrow="Dashboard empresa"
        title="Centro operativo para mantenciones corporativas."
        subtitle="Controla créditos, sucursales, servicios solicitados, gastos mensuales, reportes, proveedores frecuentes y facturación mensual consolidada."
        image="/assets/oficios/industria/industria-bombas-01.jpg"
        tone="enterprise"
        chips={["Créditos corporativos", "Sucursales y centros de costo", "Reportes y facturación"]}
        footnote="Cuentas empresa en apertura controlada: la activación se coordina con contacto operacional del equipo OficiosPro."
      >
        <ConversionButton type="contacto_empresa" sourceButton="Solicitar técnico dashboard empresa" className="btn-sun shine">
          Solicitar técnico
        </ConversionButton>
        <ConversionButton type="plan_empresa" sourceButton="Ver planes empresa dashboard" className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/20">
          Ver planes empresa
        </ConversionButton>
      </PremiumPhotoHero>
      <CompanyDashboard />
    </main>
  );
}
