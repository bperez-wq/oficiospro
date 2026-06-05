import Link from "next/link";
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
        <Link className="btn-primary" href="/especialistas">
          Solicitar técnico
        </Link>
        <Link className="btn-secondary" href="/empresas">
          Ver planes empresa
        </Link>
      </AppHero>
      <CompanyDashboard />
    </main>
  );
}
