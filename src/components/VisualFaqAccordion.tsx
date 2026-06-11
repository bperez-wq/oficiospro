import type { ReactNode } from "react";

export type FaqItem = {
  question: string;
  answer: ReactNode;
};

/**
 * FAQ accordion reutilizable (details nativo: sin JS, accesible e indexable).
 * Consistente con HomeCategoryAccordion y CollapsiblePanel de la Home.
 */
export function VisualFaqAccordion({ items, openFirst = true }: { items: FaqItem[]; openFirst?: boolean }) {
  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <details
          key={item.question}
          className="group overflow-hidden rounded-[20px] border border-line bg-white shadow-sm transition duration-200 open:border-brand/30 open:shadow-card"
          open={openFirst && index === 0}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 md:p-5 [&::-webkit-details-marker]:hidden">
            <strong className="min-w-0 text-base font-black leading-snug text-ink">{item.question}</strong>
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-muted transition duration-300 group-open:rotate-180 group-open:border-brand group-open:text-brand-dark"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </summary>
          <div className="border-t border-line bg-slate-50/60 p-4 text-sm font-semibold leading-6 text-muted md:p-5">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
