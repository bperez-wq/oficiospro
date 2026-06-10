import type { ReactNode } from "react";

export const designTokens = {
  radius: {
    card: "rounded-[28px]",
    compact: "rounded-2xl",
    pill: "rounded-full",
  },
  shadow: {
    soft: "shadow-soft",
    lift: "shadow-lift",
    card: "shadow-card",
  },
  surface: {
    base: "border border-line bg-white",
    soft: "border border-line bg-slate-50",
    brand: "border border-brand/15 bg-brand-soft",
    dark: "enterprise-shell",
  },
};

export function MarketplaceCard({
  children,
  className = "",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <article
      className={`rounded-[28px] border border-line bg-white p-5 shadow-soft transition ${
        hover ? "hover:-translate-y-1 hover:border-brand/30 hover:shadow-card" : ""
      } ${className}`}
    >
      {children}
    </article>
  );
}

export function DashboardMetricCard({
  label,
  value,
  detail,
  tone = "light",
  compact = false,
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "light" | "brand" | "dark";
  compact?: boolean;
}) {
  const toneClass =
    tone === "dark"
      ? "border-white/10 bg-white/10 text-white"
      : tone === "brand"
        ? "border-brand/15 bg-brand-soft text-ink"
        : "border-line bg-white text-ink";
  return (
    <article className={`rounded-2xl border ${compact ? "p-3" : "p-4"} shadow-sm ${toneClass}`}>
      <span className={`text-xs font-black uppercase ${tone === "dark" ? "text-white/70" : "text-muted"}`}>{label}</span>
      <strong className={`mt-1 block font-black ${compact ? "text-lg" : "text-2xl"}`}>{value}</strong>
      {detail ? <p className={`mt-1 text-xs font-bold leading-5 ${tone === "dark" ? "text-white/70" : "text-muted"}`}>{detail}</p> : null}
    </article>
  );
}

export function EmptyState({
  eyebrow = "Sin resultados",
  title,
  text,
  action,
}: {
  eyebrow?: string;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-line bg-slate-50 p-6">
      <p className="eyebrow">{eyebrow}</p>
      <h3 className="text-2xl font-black text-ink">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-muted">{text}</p>
      {action ? <div className="mt-5 flex flex-wrap gap-3">{action}</div> : null}
    </section>
  );
}

export function VisualRail({
  eyebrow,
  title,
  text,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  text?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-[32px] border border-line bg-white shadow-soft ${className}`}>
      <div className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="text-3xl font-black leading-tight text-ink md:text-4xl">{title}</h2>
          {text ? <p className="mt-3 font-semibold leading-7 text-muted">{text}</p> : null}
        </div>
        <div className="grid gap-3">{children}</div>
      </div>
    </section>
  );
}
