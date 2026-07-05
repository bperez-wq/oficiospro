import Link from "next/link";
import { ConversionButton } from "@/components/ConversionModal";
import { PlatformNav } from "@/components/PlatformNav";
import { PremiumPhotoHero } from "@/components/PremiumPhotoHero";
import { ClientDashboard } from "@/components/Dashboards";

export default function DashboardClientePage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <PremiumPhotoHero
        eyebrow="Dashboard cliente"
        title="Tu operación de hogar en un solo lugar."
        subtitle="Billetera de créditos, reservas próximas, servicios realizados, historial y técnicos favoritos en un solo lugar."
        image="/assets/oficios/pintura/pintura-interior-01.jpg"
        tone="brand"
        chips={["Créditos y billetera", "Reservas y solicitudes", "Historial y favoritos"]}
        footnote="Tus créditos quedan retenidos al reservar y se liberan cuando confirmas el avance del trabajo."
      >
        <ConversionButton type="consulta_general" sourceButton="Reservar técnico dashboard cliente" className="btn-sun shine">
          Reservar técnico
        </ConversionButton>
        <Link className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/20" href="/especialistas?sourceSection=dashboard_cliente">
          Buscar especialistas
        </Link>
      </PremiumPhotoHero>
      <ClientDashboard />
    </main>
  );
}
