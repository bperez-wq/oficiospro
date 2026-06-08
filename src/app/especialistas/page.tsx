import Link from "next/link";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { ConversionButton } from "@/components/ConversionModal";
import { SpecialistsExplorer } from "@/components/SpecialistsExplorer";

export default function SpecialistsPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Especialistas verificados"
        title="Encuentra especialistas verificados"
        subtitle="Busca por oficio, problema, comuna, disponibilidad o reputación. Cada perfil busca ordenar experiencia, trabajos realizados, evidencia y pago protegido."
      >
        <Link className="btn-secondary" href="/dashboard-cliente">
          Ver mis créditos
        </Link>
        <ConversionButton type="lead_cliente" sourceButton="Crear cuenta desde especialistas" className="btn-primary">
          Crear cuenta
        </ConversionButton>
      </AppHero>
      <SpecialistsExplorer />
    </main>
  );
}
