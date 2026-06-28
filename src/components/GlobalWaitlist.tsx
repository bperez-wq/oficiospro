"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { submitMarketLabInterest } from "@/lib/marketLab/marketLabLeads";

/**
 * Landing de demanda global (lista de espera honesta).
 *
 * NO promete cobertura: captura interés por país/ciudad/oficio/idioma para medir
 * dónde priorizar. Reusa la infraestructura de leads existente (sin tocar el Worker):
 * - submitLead(payment_interest) persiste el contacto con marcador `global_waitlist`.
 * - submitConversionEvent registra la señal de demanda para analítica.
 */
const countries = [
  "Chile",
  "Argentina",
  "Perú",
  "Colombia",
  "México",
  "Brasil",
  "España",
  "Estados Unidos",
  "Reino Unido",
  "Francia",
  "Alemania",
  "Italia",
  "Portugal",
  "Canadá",
  "Otro / Other",
];

type Role = "client" | "specialist";

export function GlobalWaitlist() {
  const { t, tList, locale } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [trade, setTrade] = useState("");
  const [role, setRole] = useState<Role>("client");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || website) return;
    setSubmitting(true);
    try {
      await submitMarketLabInterest({
        role,
        country,
        city,
        trade,
        name,
        email,
        locale,
        source: "global_waitlist",
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
          <p className="eyebrow">{t("global.eyebrow")}</p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-ink md:text-5xl">{t("global.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-muted">{t("global.subtitle")}</p>
          <p className="mt-4 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">
            {t("global.honest")}
          </p>
          <div className="mt-6 rounded-2xl border border-line bg-slate-50 p-5">
            <p className="text-xs font-black uppercase text-muted">{t("global.benefitsTitle")}</p>
            <div className="mt-3 grid gap-2">
              {tList("global.benefits").map((item) => (
                <span key={item} className="rounded-2xl bg-white p-3 text-sm font-black text-ink">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href="/market-lab" className="rounded-2xl bg-brand-soft px-4 py-2.5 text-sm font-black text-brand-dark transition hover:bg-brand hover:text-white">
              🌎 {t("marketLab.indexTitle")}
            </Link>
            <Link href="/" className="inline-flex text-sm font-black text-brand-dark underline-offset-4 hover:underline">
              ← {t("global.back")}
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-line bg-white p-6 shadow-soft md:p-7">
        {done ? (
          <div className="rounded-[24px] border border-brand/20 bg-brand-soft p-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-900">
              <span aria-hidden>✓</span> {t("global.success")}
            </span>
            <p className="mt-4 font-semibold leading-7 text-brand-dark">{t("global.successSub")}</p>
            <Link href="/" className="btn-secondary mt-5 inline-flex">
              {t("global.back")}
            </Link>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={submit}>
            <h2 className="text-2xl font-black text-ink">{t("global.formTitle")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field">
                {t("global.name")}
                <input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              <label className="field">
                {t("global.email")}
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <label className="field">
                {t("global.country")}
                <select value={country} onChange={(event) => setCountry(event.target.value)} required>
                  <option value="" disabled>
                    {t("global.countryPlaceholder")}
                  </option>
                  {countries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                {t("global.city")}
                <input value={city} onChange={(event) => setCity(event.target.value)} placeholder={t("global.cityPlaceholder")} required />
              </label>
            </div>
            <label className="field">
              {t("global.trade")}
              <input value={trade} onChange={(event) => setTrade(event.target.value)} placeholder={t("global.tradePlaceholder")} required />
            </label>
            <fieldset className="grid gap-2">
              <legend className="text-sm font-black text-muted">{t("global.role")}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className={`flex items-center gap-3 rounded-2xl border p-3 text-sm font-black ${role === "client" ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-white text-muted"}`}>
                  <input type="radio" name="role" checked={role === "client"} onChange={() => setRole("client")} />
                  {t("global.roleClient")}
                </label>
                <label className={`flex items-center gap-3 rounded-2xl border p-3 text-sm font-black ${role === "specialist" ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-white text-muted"}`}>
                  <input type="radio" name="role" checked={role === "specialist"} onChange={() => setRole("specialist")} />
                  {t("global.roleSpecialist")}
                </label>
              </div>
            </fieldset>
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
