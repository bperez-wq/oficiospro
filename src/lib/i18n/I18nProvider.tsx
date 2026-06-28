"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultLocale, isLocale, resolveLocale, type Locale } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/dictionaries";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
  tList: (path: string) => readonly string[];
};

const localeStorageKey = "oficiospro.locale";
const I18nContext = createContext<I18nContextValue | null>(null);

function getPathValue(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object" || !(key in current)) return undefined;
    return (current as Record<string, unknown>)[key];
  }, source);
}

function createI18nValue(locale: Locale, setLocale: (locale: Locale) => void): I18nContextValue {
  return {
    locale,
    setLocale,
    t(path) {
      const value = getPathValue(dictionaries[locale], path) ?? getPathValue(dictionaries[defaultLocale], path);
      return typeof value === "string" ? value : path;
    },
    tList(path) {
      const value = getPathValue(dictionaries[locale], path) ?? getPathValue(dictionaries[defaultLocale], path);
      return Array.isArray(value) ? value.map(String) : [];
    },
  };
}

const fallbackI18n = createI18nValue(defaultLocale, () => undefined);

export function I18nProvider({ children, initialLocale = defaultLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const stored = window.localStorage.getItem(localeStorageKey);
    setLocaleState(stored && isLocale(stored) ? stored : resolveLocale(window.navigator.language));
  }, []);

  // Mantiene <html lang> sincronizado con el idioma activo (a11y + SEO).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(localeStorageKey, nextLocale);
  }, []);

  const value = useMemo(() => createI18nValue(locale, setLocale), [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext) ?? fallbackI18n;
}
