import Link from "next/link";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { ClientDashboard } from "@/components/Dashboards";

export default function DashboardClientePage() {
  return (
    <main className="section grid gap-6">
      <PlatformNav />
      <AppHero
        eyebrow="Dashboard cliente"
        title="Tu operación de hogar en un solo lugar."
        subtitle="Billetera de créditos, reservas próximas, historial y técnicos favoritos usando datos mock."
      >
        <Link className="btn-primary" href="/especialistas">Reservar técnico</Link>
      </AppHero>
      <ClientDashboard />
    </main>
  );
}
