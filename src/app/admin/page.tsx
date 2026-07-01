import { AdminPanel } from "@/components/AdminPanel";
import Link from "next/link";
import { RouteAuthGuard } from "@/components/RouteAuthGuard";

export default function AdminPage() {
  return (
    <RouteAuthGuard resource="admin">
    <main className="section grid gap-6">
      <section className="rounded-[28px] border border-brand/15 bg-brand-soft p-5 shadow-soft">
        <p className="eyebrow">Panel interno OficiosPro</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-ink">CRM operacional</h1>
            <p className="mt-1 text-sm font-bold leading-6 text-brand-dark">Gestiona oportunidades, tareas, contactos, empresas, notas y actividad desde D1.</p>
          </div>
          <Link className="btn-primary" href="/admin/crm">
            Abrir CRM
          </Link>
          <Link className="btn-secondary" href="/admin/crm/acquisition">
            Captacion especialistas
          </Link>
          <Link className="btn-secondary" href="/admin/formalizacion">
            Formalizacion
          </Link>
        </div>
      </section>
      <AdminPanel />
    </main>
    </RouteAuthGuard>
  );
}
