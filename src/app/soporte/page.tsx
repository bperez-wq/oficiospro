import { ConversionButton } from "@/components/ConversionModal";
import { PlatformNav } from "@/components/PlatformNav";

const supportBlocks = [
  {
    title: "Soy cliente",
    items: [
      "Como reservar",
      "Como funcionan los creditos",
      "Como aprobar adicionales",
      "Que pasa si el especialista no llega",
      "Como pedir ayuda",
    ],
  },
  {
    title: "Soy especialista",
    items: [
      "Como postular",
      "Como se revisa mi perfil",
      "Como agregar servicios",
      "Como funciona reputacion",
      "Como recibo solicitudes",
    ],
  },
  {
    title: "Soy empresa/comunidad",
    items: [
      "Como solicitar mantenciones",
      "Creditos empresa",
      "Facturacion",
      "SLA y sucursales",
    ],
  },
];

export default function SupportPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <section className="overflow-hidden rounded-[32px] border border-line bg-white shadow-card">
        <div className="surface-grid p-6 md:p-10">
          <p className="eyebrow">Soporte</p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight text-ink md:text-6xl">Centro de soporte OficiosPro</h1>
          <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-muted">
            Encuentra ayuda para reservar, usar creditos, gestionar servicios, postular como especialista o coordinar mantenciones de empresa y comunidades.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ConversionButton type="consulta_general" sourceButton="Contactar soporte" className="btn-primary">
              Contactar soporte
            </ConversionButton>
            <ConversionButton type="consulta_general" sourceButton="Quiero que me contacten soporte" className="btn-secondary">
              Quiero que me contacten
            </ConversionButton>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {supportBlocks.map((block) => (
          <article key={block.title} className="rounded-[28px] border border-line bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-black text-ink">{block.title}</h2>
            <div className="mt-5 grid gap-3">
              {block.items.map((item) => (
                <span key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-muted">
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-5 rounded-[28px] border border-brand/15 bg-brand-soft p-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="eyebrow">Ayuda operativa</p>
          <h2 className="text-3xl font-black text-ink">Si no encuentras tu caso, lo revisamos contigo.</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-brand-dark">
            OficiosPro centraliza soporte para clientes, especialistas, empresas y comunidades sin exponer datos sensibles.
          </p>
        </div>
        <ConversionButton type="consulta_general" sourceButton="Soporte final CTA" className="btn-primary">
          Pedir ayuda
        </ConversionButton>
      </section>
    </main>
  );
}
