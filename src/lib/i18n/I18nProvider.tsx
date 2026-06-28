"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultLocale, localeMeta, resolveLocale, type Locale } from "@/lib/i18n/config";
import { dictionaries, type Dictionary } from "@/lib/i18n/dictionaries";

const STORAGE_KEY = "oficiospro.locale";

type I18nContextValue = {
  locale: Locale;
  ready: boolean;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
  tList: (path: string) => string[];
  formatNumber: (value: number) => string;
};

function resolveKey(dict: Dictionary, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object" && key in (node as Record<string, unknown>)) {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
}

function makeTranslators(locale: Locale) {
  const dict = dictionaries[locale] ?? dictionaries[defaultLocale];
  const fallback = dictionaries[defaultLocale];
  const t = (path: string): string => {
    const value = resolveKey(dict, path) ?? resolveKey(fallback, path);
    return typeof value === "string" ? value : path;
  };
  const tList = (path: string): string[] => {
    const value = resolveKey(dict, path) ?? resolveKey(fallback, path);
    return Array.isArray(value) ? (value as string[]) : [];
  };
  return { t, tList };
}

const defaultTranslators = makeTranslators(defaultLocale);

const I18nContext = createContext<I18nContextValue>({
  locale: defaultLocale,
  ready: false,
  setLocale: () => {},
  t: defaultTranslators.t,
  tList: defaultTranslators.tList,
  formatNumber: (value: number) => new Intl.NumberFormat(localeMeta[defaultLocale].intl).format(value),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [ready, setReady] = useState(false);

  // Detección client-side: cookie/localStorage -> idioma del navegador -> default.
  // Mantiene el render inicial en es (estático) y ajusta tras el montaje sin romper hidratación.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    const browser = typeof navigator !== "undefined" ? navigator.language : null;
    setLocaleState(resolveLocale(stored ?? browser));
    setReady(true);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.cookie = `${STORAGE_KEY}=${next};path=/;max-age=31536000;samesite=lax`;
    } catch {
      // La selección de idioma no debe fallar si el almacenamiento no está disponible.
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const { t, tList } = makeTranslators(locale);
    return {
      locale,
      ready,
      setLocale,
      t,
      tList,
      formatNumber: (input: number) => new Intl.NumberFormat(localeMeta[locale].intl).format(input),
    };
  }, [locale, ready, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
