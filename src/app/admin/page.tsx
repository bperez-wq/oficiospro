import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { AdminPanel } from "@/components/AdminPanel";
import { AdminMarketplaceControls, LocalSeoPanel, NationalCoveragePanel, SpecialistScaleMetrics } from "@/components/MarketplaceOverview";

export default function AdminPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Admin"
        title="Panel operativo para administrar la red."
        subtitle="Aprobación de especialistas, revisión de usuarios, empresas, reservas, categorías, servicios y métricas generales de OficiosPro."
      />
      <SpecialistScaleMetrics />
      <AdminMarketplaceControls />
      <NationalCoveragePanel />
      <LocalSeoPanel />
      <AdminPanel />
    </main>
  );
}
