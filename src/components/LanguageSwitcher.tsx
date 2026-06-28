"use client";

import { locales, localeMeta, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function LanguageSwitcher({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">{t("lang.choose")}</span>
      <span aria-hidden className="pointer-events-none absolute left-3 text-sm">
        🌐
      </span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className={`appearance-none rounded-2xl border border-line bg-white pl-8 pr-7 text-sm font-black text-muted shadow-sm transition hover:border-brand hover:text-brand focus:border-brand focus:outline-none ${compact ? "py-2" : "py-2.5"}`}
        aria-label={t("lang.choose")}
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {compact ? `${localeMeta[code].flag} ${code.toUpperCase()}` : `${localeMeta[code].flag} ${localeMeta[code].label}`}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-3 text-xs text-muted">
        ▾
      </span>
    </label>
  );
}
