import { ConversionButton } from "@/components/ConversionModal";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { ClientDashboard } from "@/components/Dashboards";

export default function DashboardClientePage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Dashboard cliente"
        title="Tu operación de hogar en un solo lugar."
        subtitle="Billetera de créditos, reservas próximas, servicios realizados, historial y técnicos favoritos en un solo lugar."
      >
        <ConversionButton type="consulta_general" sourceButton="Reservar técnico dashboard cliente" className="btn-primary">
          Reservar técnico
        </ConversionButton>
      </AppHero>
      <ClientDashboard />
    </main>
  );
}
