import Link from "next/link";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { LoginForm } from "@/components/Forms";

export default function LoginPage() {
  return (
    <main className="section grid gap-6">
      <PlatformNav />
      <AppHero eyebrow="Acceso" title="Ingresa a OficiosPro" subtitle="Acceso mock para probar navegación, dashboards y reservas antes de conectar Supabase Auth." />
      <section className="grid gap-5 lg:grid-cols-2">
        <LoginForm />
        <aside className="panel">
          <h2 className="text-2xl font-black">Entradas rápidas</h2>
          <p className="mt-2 text-muted">Usa estos accesos para revisar la plataforma sin backend.</p>
          <div className="mt-5 grid gap-3">
            <Link className="btn-secondary" href="/dashboard-cliente">Dashboard cliente</Link>
            <Link className="btn-secondary" href="/dashboard-especialista">Dashboard especialista</Link>
            <Link className="btn-secondary" href="/admin">Panel admin</Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
