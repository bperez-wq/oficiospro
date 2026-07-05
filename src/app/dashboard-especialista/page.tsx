import Link from "next/link";
import { PlatformNav } from "@/components/PlatformNav";
import { PremiumPhotoHero } from "@/components/PremiumPhotoHero";
import { SpecialistDashboard } from "@/components/Dashboards";
import { SpecialistTaxStatusCard } from "@/components/SpecialistTaxStatusCard";

export default function DashboardEspecialistaPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <PremiumPhotoHero
        eyebrow="Panel del especialista"
        title="Tu oficio, tu panel, tu respaldo."
        subtitle="Revisa tu Pasaporte Profesional, tus solicitudes, tu reputación y tu estado para recibir pagos. Primero buenos perfiles, después más oportunidades."
        image="/assets/oficios/carpinteria/carpinteria-maestro-01.jpg"
        tone="brand"
        chips={["Pasaporte Profesional", "Solicitudes con seguimiento", "Reputación acumulable"]}
        footnote="Tu avance se guarda en este dispositivo; el estado oficial de revisión y publicación lo confirma el equipo OficiosPro."
      >
        <Link className="btn-sun shine" href="/registro-especialista?source=dashboard_hero&intent=offer_services" data-event="click_offer_services">
          Completar mi Pasaporte
        </Link>
        <Link className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/20" href="/agenda-especialista">
          Gestionar agenda
        </Link>
      </PremiumPhotoHero>
      <SpecialistTaxStatusCard />
      <SpecialistDashboard />
    </main>
  );
}
