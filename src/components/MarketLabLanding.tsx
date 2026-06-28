"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { submitMarketLabInterest, type MarketLabRole } from "@/lib/marketLab/marketLabLeads";

/**
 * Landing de exploración de mercado (Market Lab). Honesta: NO promete cobertura, NO muestra
 * especialistas reales. Captura interés (demand/supply) por país/ciudad/oficio y lo clasifica
 * con la taxonomía unificada (market_lab_demand_lead / market_lab_supply_lead).
 */
export function MarketLabLanding({
  countryName,
  cityName,
  tradeLabel,
  localLanguage,
  neighborhoodLabel,
}: {
  countryName: string;
  cityName: string;
  tradeLabel: string;
  localLanguage: string;
  neighborhoodLabel: string;
}) {
  const { t } = useI18n();
  const [role, setRole] = useState<MarketLabRole>("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [website, setWebsite] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || website) return;
    setSubmitting(true);
    try {
      await submitMarketLabInterest({
        role,
        country: countryName,
        city: cityName,
        trade: tradeLabel,
        name,
        email,
        source: "market_lab_landing",
        honeypot: website,
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <section className="surface-grid relative overflow-hidden rounded-[28px] border border-line bg-white p-7 shadow-soft md:p-10">
        <div aria-hidden className="hero-aura animate-gradient pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative">
          <p className="eyebrow">{t("marketLab.eyebrow")}</p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-ink md:text-5xl">
            {tradeLabel} · {cityName}
          </h1>
          <p className="mt-3 text-lg font-black text-brand-dark">{t("marketLab.exploring")}</p>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-muted">{t("marketLab.subtitle")}</p>
          <p className="mt-4 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">
            {t("global.honest")}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="chip bg-brand-soft text-brand-dark">{countryName}</span>
            <span className="chip bg-slate-100 text-ink">{t("marketLab.localTermLabel")}: {tradeLabel}</span>
            <span className="chip bg-slate-100 text-ink">{t("marketLab.localLangLabel")}: {localLanguage}</span>
            <span className="chip bg-slate-100 text-ink capitalize">{neighborhoodLabel}</span>
          </div>
          <p className="mt-5 text-xs font-bold leading-5 text-muted">{t("marketLab.referential")}</p>
          <Link href="/global" className="mt-6 inline-flex text-sm font-black text-brand-dark underline-offset-4 hover:underline">
            ← {t("global.back")}
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-line bg-white p-6 shadow-soft md:p-7">
        {done ? (
          <div className="rounded-[24px] border border-brand/20 bg-brand-soft p-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-900">
              <span aria-hidden>✓</span> {t("global.success")}
            </span>
            <p className="mt-4 font-semibold leading-7 text-brand-dark">{t("global.successSub")}</p>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={submit}>
            <h2 className="text-2xl font-black text-ink">{t("global.formTitle")}</h2>
            <fieldset className="grid gap-2">
              <legend className="text-sm font-black text-muted">{t("global.role")}</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {([
                  ["client", t("global.roleClient")],
                  ["company", t("marketLab.demandCta")],
                  ["specialist", t("global.roleSpecialist")],
                ] as [MarketLabRole, string][]).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 rounded-2xl border p-3 text-sm font-black ${role === value ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-white text-muted"}`}
                  >
                    <input type="radio" name="role" checked={role === value} onChange={() => setRole(value)} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field">
                {t("global.name")}
                <input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              <label className="field">
                {t("global.email")}
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
            </div>
            <label className="hidden" aria-hidden="true">
              Website
              <input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
            </label>
            <p className="rounded-2xl bg-slate-50 p-3 text-xs font-bold leading-5 text-muted">{t("global.disclaimer")}</p>
            <button className="btn-primary w-full" type="submit" disabled={submitting}>
              {submitting ? t("global.submitting") : t("global.submit")}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
