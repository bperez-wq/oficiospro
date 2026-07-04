import type { ReactNode } from "react";

type Tone = "brand" | "enterprise";

/* Hero premium reutilizable: fotografía de oficios como textura de fondo,
 * pill con indicador de actividad, CTAs y una tarjeta flotante opcional.
 * La imagen es decorativa (aria-hidden); el contenido vive en el texto. */
export function PremiumPhotoHero({
  eyebrow,
  title,
  subtitle,
  image,
  tone = "brand",
  chips = [],
  footnote,
  aside,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  tone?: Tone;
  chips?: string[];
  footnote?: string;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const shell =
    tone === "enterprise"
      ? "enterprise-shell"
      : "rounded-[28px] border border-white/10 bg-brand-gradient text-white shadow-card";

  return (
    <section className={`relative isolate overflow-hidden ${shell} p-7 md:p-12`}>
      <img src={image} alt="" aria-hidden loading="eager" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.16]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/55 via-ink/20 to-transparent" />
      <div className={`relative grid items-center gap-10 ${aside ? "lg:grid-cols-[1.05fr_0.95fr]" : ""}`}>
        <div>
          <p className="eyebrow-pill inline-flex items-center gap-2 border-white/20 bg-white/10 text-white">
            <span aria-hidden className="pulse-dot text-sun" />
            {eyebrow}
          </p>
          <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-xl text-lg font-semibold leading-8 text-white/80">{subtitle}</p>
          {children ? <div className="mt-7 flex flex-wrap items-center gap-3">{children}</div> : null}
          {chips.length ? (
            <div className="mt-6 flex flex-wrap gap-2.5">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 text-sm font-bold text-white/90"
                >
                  <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
          {footnote ? <p className="mt-4 max-w-xl text-xs font-bold leading-5 text-white/60">{footnote}</p> : null}
        </div>
        {aside}
      </div>
    </section>
  );
}
