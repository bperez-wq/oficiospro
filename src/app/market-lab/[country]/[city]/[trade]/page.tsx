import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlatformNav } from "@/components/PlatformNav";
import { MarketLabLanding } from "@/components/MarketLabLanding";
import { getMarket, isTradeSlug, marketLabParams, tradeLabel } from "@/data/marketLab";
import { localeMeta } from "@/lib/i18n/config";

type Params = { country: string; city: string; trade: string };

export function generateStaticParams() {
  return marketLabParams();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, city, trade } = await params;
  const market = getMarket(country, city);
  if (!market || !isTradeSlug(trade)) return { robots: { index: false, follow: false } };
  const label = tradeLabel(trade, market.locale);
  // noindex por defecto: mercado en exploración, sin operación garantizada.
  return {
    title: `${label} · ${market.cityName} | OficiosPro Market Lab`,
    description: `Estamos explorando ${label} en ${market.cityName}, ${market.countryName}. Deja tu interés como cliente, empresa o especialista. Sin disponibilidad garantizada.`,
    robots: { index: false, follow: false },
  };
}

export default async function MarketLabTradePage({ params }: { params: Promise<Params> }) {
  const { country, city, trade } = await params;
  const market = getMarket(country, city);
  if (!market || !isTradeSlug(trade)) notFound();
  const label = tradeLabel(trade, market.locale);

  return (
    <main className="section grid gap-8">
      <PlatformNav />
      <MarketLabLanding
        countryName={market.countryName}
        cityName={market.cityName}
        tradeLabel={label}
        localLanguage={localeMeta[market.locale].label}
        neighborhoodLabel={market.neighborhoodLabel}
      />
    </main>
  );
}
