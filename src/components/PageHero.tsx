import type { ReactNode } from "react";
import { TrustBadge } from "@/components/TrustBadge";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  badges = [],
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  badges?: string[];
  children?: ReactNode;
}) {
  return (
    <section className="surface-grid relative overflow-hidden rounded-[32px] border border-line bg-white p-7 shadow-soft md:p-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-accent to-sun" />
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="max-w-5xl text-4xl font-black leading-[1.02] text-ink md:text-6xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-muted">{subtitle}</p>
          {badges.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <TrustBadge key={badge} label={badge} />
              ))}
            </div>
          ) : null}
        </div>
        {children ? <div className="flex flex-wrap gap-3 lg:justify-end">{children}</div> : null}
      </div>
    </section>
  );
}
