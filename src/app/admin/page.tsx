import { AdminPanel } from "@/components/AdminPanel";
import Link from "next/link";
import { RouteAuthGuard } from "@/components/RouteAuthGuard";

export default function AdminPage() {
  return (
    <RouteAuthGuard resource="admin">
    <main className="section grid gap-6">
      <section className="enterprise-shell relative overflow-hidden p-6 md:p-8">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/5" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow-pill inline-flex items-center gap-2 border-white/20 bg-white/10 text-white">
              <span aria-hidden className="pulse-dot text-emerald-400" />
              Operación interna OficiosPro
            </p>
            <h1 className="text-3xl font-black text-white">CRM operacional</h1>
            <p className="mt-1 max-w-2xl text-sm font-bold leading-6 text-white/70">
              Oportunidades, tareas, contactos, empresas, notas y actividad desde D1. Cada caso revisado fortalece la red.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link className="btn-sun" href="/admin/crm">
              Abrir CRM
            </Link>
            <Link className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/20" href="/admin/crm/acquisition">
              Captación especialistas
            </Link>
            <Link className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/20" href="/admin/crm/business-health">
              Salud del negocio
            </Link>
            <Link className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/20" href="/admin/formalizacion">
              Formalización
            </Link>
          </div>
        </div>
      </section>
      <AdminPanel />
    </main>
    </RouteAuthGuard>
  );
}
