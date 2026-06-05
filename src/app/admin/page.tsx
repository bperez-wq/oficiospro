import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { AdminPanel } from "@/components/AdminPanel";

export default function AdminPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero
        eyebrow="Admin"
        title="Panel operativo mock para administrar la red."
        subtitle="Aprobación de especialistas, revisión de usuarios, empresas, reservas, categorías, servicios y métricas generales sin backend todavía."
      />
      <AdminPanel />
    </main>
  );
}
