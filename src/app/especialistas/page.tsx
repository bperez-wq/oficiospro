import Link from "next/link";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { SpecialistsExplorer } from "@/components/SpecialistsExplorer";

export default function SpecialistsPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Especialistas verificados"
        title="Busca por comuna, disponibilidad, calificación y precio en créditos."
        subtitle="Compara perfiles profesionales, trabajos completados, certificaciones, tiempos de respuesta y reserva con créditos desde una experiencia mock funcional."
      >
        <Link className="btn-secondary" href="/dashboard-cliente">
          Ver mis créditos
        </Link>
        <Link className="btn-primary" href="/registro-cliente">
          Crear cuenta
        </Link>
      </AppHero>
      <SpecialistsExplorer />
    </main>
  );
}
