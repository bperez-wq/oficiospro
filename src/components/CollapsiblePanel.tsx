"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

/** Panel colapsable con título/detalle traducidos por i18n. Los hijos (server) se pasan como children. */
export function CollapsiblePanel({ titleKey, detailKey, children }: { titleKey: string; detailKey: string; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <details className="group overflow-hidden rounded-[24px] border border-line bg-white shadow-sm transition duration-200 open:border-brand/30 open:shadow-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <strong className="block text-lg font-black text-ink">{t(titleKey)}</strong>
          <span className="block truncate text-sm font-bold text-muted">{t(detailKey)}</span>
        </span>
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-muted transition duration-300 group-open:rotate-180 group-open:border-brand group-open:text-brand-dark"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </summary>
      <div className="border-t border-line p-5">{children}</div>
    </details>
  );
}
