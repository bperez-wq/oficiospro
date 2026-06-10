import Link from "next/link";
import { Suspense } from "react";
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
        subtitle="Puedes buscar sin registrarte. Filtra por oficio, comuna, disponibilidad, reputacion y precio en creditos; crea tu cuenta cuando quieras reservar o contactar."
      >
        <Link className="btn-secondary" href="/dashboard-cliente">
          Ver mis créditos
        </Link>
        <ConversionButton type="lead_cliente" sourceButton="Crear cuenta desde especialistas" className="btn-primary">
          Crear cuenta
        </ConversionButton>
      </AppHero>
      <Suspense fallback={<div className="rounded-[28px] border border-line bg-white p-6 shadow-soft text-sm font-black text-muted">Cargando especialistas...</div>}>
        <SpecialistsExplorer />
      </Suspense>
    </main>
  );
}
