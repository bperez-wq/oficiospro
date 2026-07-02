import type { Metadata } from "next";
import Link from "next/link";
import { PlatformNav } from "@/components/PlatformNav";
import { markets, tradeLabel } from "@/data/marketLab";

// Índice interno de exploración: noindex (no es operación real ni SEO público).
export const metadata: Metadata = {
  title: "OficiosPro Market Lab | Mercados en exploración",
  description:
    "Países y ciudades donde OficiosPro está midiendo interés de clientes y especialistas. Sin operación ni disponibilidad garantizada.",
  robots: { index: false, follow: false },
};

const statusLabel: Record<string, string> = {
  research: "En investigación",
  landing_live: "Landing activa",
  collecting_supply: "Captando oferta",
  collecting_demand: "Captando demanda",
  pilot_ready: "Listo para piloto",
  paused: "En pausa",
};

export default function MarketLabIndexPage() {
  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <section className="surface-grid relative overflow-hidden rounded-[28px] border border-line bg-white p-7 shadow-soft md:p-10">
        <div aria-hidden className="hero-aura animate-gradient pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative">
          <p className="eyebrow">OficiosPro Market Lab</p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-ink md:text-5xl">
            Mercados en exploración
          </h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-muted">
            Inspirado en expansión local-first: motor global común, adaptación local y activación solo donde haya
            tracción. No operamos en estos mercados todavía; estamos midiendo interés.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/global" className="btn-primary">Lista de espera global</Link>
            <Link href="/" className="btn-secondary">Volver al inicio</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {markets.map((market) => (
          <article key={`${market.countrySlug}-${market.citySlug}`} className="rounded-[24px] border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-black text-ink">{market.cityName}</h2>
              <span className="chip bg-slate-100 text-ink">{market.countryName}</span>
            </div>
            <span className="mt-2 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">
              {statusLabel[market.status] ?? market.status}
            </span>
            <div className="mt-4 flex flex-wrap gap-2">
              {market.trades.map((trade) => (
                <Link
                  key={trade}
                  href={`/market-lab/${market.countrySlug}/${market.citySlug}/${trade}`}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-black text-brand-dark transition hover:border-brand hover:bg-brand-soft"
                >
                  {tradeLabel(trade, market.locale)}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
