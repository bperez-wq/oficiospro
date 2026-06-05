import Link from "next/link";
import { AppHero, PlatformNav } from "@/components/PlatformNav";
import { LoginForm } from "@/components/Forms";

export default function LoginPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <AppHero eyebrow="Acceso" title="Ingresa a OficiosPro" subtitle="Acceso mock para probar navegación, dashboards y reservas antes de conectar autenticación real." />
      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <LoginForm />
        <aside className="panel">
          <p className="eyebrow">Entradas rápidas</p>
          <h2 className="text-3xl font-black">Explora la plataforma sin backend.</h2>
          <p className="mt-3 font-semibold leading-7 text-muted">Usa estos accesos para revisar la experiencia de cliente, especialista, empresa y administración.</p>
          <div className="mt-6 grid gap-3">
            <Link className="btn-secondary" href="/dashboard-cliente">
              Dashboard cliente
            </Link>
            <Link className="btn-secondary" href="/dashboard-especialista">
              Dashboard especialista
            </Link>
            <Link className="btn-secondary" href="/dashboard-empresa">
              Dashboard empresa
            </Link>
            <Link className="btn-secondary" href="/admin">
              Panel admin
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
