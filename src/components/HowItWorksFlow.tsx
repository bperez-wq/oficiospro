"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

type Step = {
  number: string;
  gradient: string;
  icon: ReactNode;
  visual: ReactNode;
};

const iconClass = "h-5 w-5";

const steps: Step[] = [
  {
    number: "1",
    gradient: "from-brand to-brand-dark",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
    visual: (
      <div className="grid gap-2">
        <span className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-muted">
          <span aria-hidden className="text-brand">⌕</span> Filtración en la cocina…
        </span>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-black text-brand-dark">Gasfitería</span>
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-black text-accent-dark">Ñuñoa</span>
          <span className="rounded-full bg-sun-soft px-2.5 py-1 text-[11px] font-black text-sun-dark">Hoy</span>
        </div>
      </div>
    ),
  },
  {
    number: "2",
    gradient: "from-accent to-accent-dark",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    visual: (
      <div className="flex items-center gap-2.5 rounded-xl border border-line bg-white p-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-xs font-black text-white">MS</span>
        <div className="min-w-0 flex-1">
          <span className="block truncate text-xs font-black text-ink">Francisco S. · Gasfíter</span>
          <span className="block text-[11px] font-bold text-muted">★ 4,8 · 221 trabajos</span>
        </div>
        <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-black text-gold">Oro</span>
      </div>
    ),
  },
  {
    number: "3",
    gradient: "from-sun to-sun-dark",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="4" width="18" height="18" rx="3" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    visual: (
      <div className="grid gap-2 rounded-xl border border-line bg-white p-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-ink">30 créditos</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sun-soft px-2 py-0.5 text-[10px] font-black text-sun-dark">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sun" /> Retenidos
          </span>
        </div>
        <span aria-hidden className="block h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full w-2/3 rounded-full bg-gradient-to-r from-sun to-sun-dark" />
        </span>
        <span className="text-[11px] font-bold text-muted">Se liberan al confirmar avance.</span>
      </div>
    ),
  },
  {
    number: "4",
    gradient: "from-brand to-brand-dark",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    ),
    visual: (
      <div className="grid gap-2 rounded-xl border border-line bg-white p-2.5">
        <span className="text-sm font-black tracking-wide text-gold" aria-label="5 estrellas">★★★★★</span>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">Pago liberado</span>
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-black text-brand-dark">Reputación ↑</span>
        </div>
      </div>
    ),
  },
];

export function HowItWorksFlow() {
  const { t, tList } = useI18n();
  const stepTitles = tList("howItWorks.stepTitles");
  const stepTexts = tList("howItWorks.stepTexts");
  return (
    <div>
      <ol className="relative grid gap-7 lg:grid-cols-4 lg:gap-4">
        <span aria-hidden className="absolute bottom-10 left-[21px] top-12 w-px bg-gradient-to-b from-brand via-accent to-sun opacity-40 lg:hidden" />
        <span aria-hidden className="absolute inset-x-20 top-[22px] hidden h-px bg-gradient-to-r from-brand via-accent to-sun opacity-50 lg:block" />
        {steps.map((step, index) => (
          <li key={step.number} className="relative pl-14 lg:pl-0">
            <span
              className={`absolute left-0 top-0 z-10 grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br ${step.gradient} text-sm font-black text-white shadow-card lg:static lg:mb-4`}
            >
              {step.number}
            </span>
            <article className="group h-full rounded-[24px] border border-line bg-white/95 p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-card">
              <div className="flex items-center gap-2 text-brand-dark">
                {step.icon}
                <h3 className="text-base font-black text-ink">{stepTitles[index]}</h3>
              </div>
              <p className="mt-2 min-h-10 text-[13px] font-semibold leading-5 text-muted">{stepTexts[index]}</p>
              <div className="mt-3 rounded-2xl bg-slate-50 p-2.5 transition duration-300 group-hover:bg-brand-soft/40">{step.visual}</div>
            </article>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        <Link href="/especialistas?sourceSection=home_how_it_works" className="btn-primary" data-event="how_it_works_cta">
          {t("howItWorks.cta")}
        </Link>
        <p className="text-sm font-bold text-muted">{t("howItWorks.note")}</p>
      </div>
    </div>
  );
}
