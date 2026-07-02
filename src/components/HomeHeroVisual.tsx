"use client";

import { CreditsHeroBadge } from "@/components/credits/CreditsExplainer";
import { specialists } from "@/data/mock";
import { heroCollageImages } from "@/data/visualAssets";
import { useI18n } from "@/lib/i18n/I18nProvider";

/** Columna visual (derecha) del hero de Home, con tarjetas flotantes traducidas. */
export function HomeHeroVisual() {
  const { t } = useI18n();
  return (
    <div className="relative hidden min-h-[520px] lg:block">
      <div className="absolute inset-0 rounded-[34px] bg-gradient-to-br from-brand-soft via-mint to-accent-soft" />
      <div className="surface-grid absolute inset-0 rounded-[34px] opacity-40" />
      <div className="absolute inset-x-6 bottom-6 top-6 grid grid-cols-2 grid-rows-2 gap-3">
        {heroCollageImages.map((image, index) => (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            loading="eager"
            fetchPriority={index === 0 ? "high" : "auto"}
            className="h-full w-full rounded-[24px] object-cover object-center shadow-card"
          />
        ))}
      </div>
      <FloatingCard className="left-0 top-6 animate-float" label={t("homeHeroVisual.examplePilot")} value="4,9★" accent="sun" />
      <FloatingCard className="right-0 top-20 animate-float [animation-delay:1.5s]" label={t("homeHeroVisual.responseRef")} value="35 min" accent="accent" />
      <CreditsHeroBadge className="bottom-16 left-4 animate-float [animation-delay:0.8s]" />
      <div className="absolute bottom-4 right-4 w-48 rounded-[20px] border border-line bg-white/95 p-3 shadow-card backdrop-blur">
        <p className="text-[11px] font-black uppercase text-muted">{t("homeHeroVisual.nearbyTechs")}</p>
        <div className="mt-2 flex -space-x-2.5">
          {specialists.slice(0, 4).map((specialist) => (
            <span key={specialist.id} className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-brand to-brand-dark text-[11px] font-black text-white shadow-sm">
              {specialist.initials}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs font-bold leading-4 text-muted">{t("homeHeroVisual.foundersReview")}</p>
      </div>
    </div>
  );
}

function FloatingCard({
  label,
  value,
  className,
  accent = "brand",
}: {
  label: string;
  value: string;
  className: string;
  accent?: "brand" | "accent" | "sun";
}) {
  const dot = accent === "sun" ? "bg-sun" : accent === "accent" ? "bg-accent" : "bg-brand";
  return (
    <div className={`absolute rounded-[22px] border border-line bg-white/95 p-4 shadow-card backdrop-blur ${className}`}>
      <span className="flex items-center gap-2 text-xs font-black uppercase text-muted">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </span>
      <strong className="mt-1 block text-2xl font-black text-ink">{value}</strong>
    </div>
  );
}
