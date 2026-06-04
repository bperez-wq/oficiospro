import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section">
      <section className="panel">
        <p className="eyebrow">Ruta no encontrada</p>
        <h1 className="section-title">Esta vista todavía no existe.</h1>
        <p className="mt-4 max-w-2xl text-muted">Vuelve al listado de especialistas o al inicio de OficiosPro.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn-primary" href="/">Ir al inicio</Link>
          <Link className="btn-secondary" href="/especialistas">Ver técnicos</Link>
        </div>
      </section>
    </main>
  );
}
