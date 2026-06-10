import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section">
      <section className="surface-grid rounded-[28px] border border-line bg-white p-8 shadow-soft">
        <p className="eyebrow">Ruta no encontrada</p>
        <h1 className="section-title">Esta vista todavía no existe.</h1>
        <p className="mt-4 max-w-2xl font-semibold leading-7 text-muted">Vuelve al listado de especialistas o al inicio de OficiosPro.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn-primary" href="/">
            Ir al inicio
          </Link>
          <Link className="btn-secondary" href="/especialistas" data-event="browse_specialists_404">
            Ver técnicos
          </Link>
        </div>
      </section>
    </main>
  );
}
