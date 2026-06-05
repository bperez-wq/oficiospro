import Link from "next/link";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { SpecialistDashboard } from "@/components/Dashboards";
import { specialists } from "@/data/mock";

export default function DashboardEspecialistaPage() {
  const specialist = specialists[0];

  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Dashboard especialista"
        title={`Panel de ${specialist.name}`}
        subtitle="Vista inicial para revisar perfil, reservas recibidas, calificación, trabajos completados, créditos ganados y estado de verificación."
      >
        <Link className="btn-primary" href={`/especialistas/${specialist.id}`}>
          Ver perfil público
        </Link>
      </AppHero>
      <SpecialistDashboard />
    </main>
  );
}
