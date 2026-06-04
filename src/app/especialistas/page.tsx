import Link from "next/link";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { SpecialistsExplorer } from "@/components/SpecialistsExplorer";

export default function SpecialistsPage() {
  return (
    <main className="section grid gap-6">
      <PlatformNav />
      <AppHero
        eyebrow="Especialistas"
        title="Busca técnicos por comuna, disponibilidad y créditos."
        subtitle="Listado mock con filtros funcionales, perfiles individuales y reservas que descuentan créditos del usuario demo."
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
