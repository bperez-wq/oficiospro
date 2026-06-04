import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { AdminPanel } from "@/components/AdminPanel";

export default function AdminPage() {
  return (
    <main className="section grid gap-6">
      <PlatformNav />
      <AppHero
        eyebrow="Admin"
        title="Panel operativo mock para administrar la red."
        subtitle="Aprobación de especialistas, usuarios, empresas, reservas, categorías y servicios sin backend todavía."
      />
      <AdminPanel />
    </main>
  );
}
