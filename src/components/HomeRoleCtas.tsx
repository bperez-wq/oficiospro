"use client";

import Link from "next/link";
import { ConversionButton } from "@/components/ConversionModal";
import { useI18n } from "@/lib/i18n/I18nProvider";

/** Tres CTAs de rol (cliente/empresa/especialista) de Home, traducidas por i18n. */
export function HomeRoleCtas() {
  const { t } = useI18n();
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <RoleCard title={t("homeCta.clientTitle")} text={t("homeCta.clientText")} type="lead_cliente" label={t("homeCta.clientLabel")} />
      <RoleCard title={t("homeCta.companyTitle")} text={t("homeCta.companyText")} type="contacto_empresa" label={t("homeCta.companyLabel")} />
      <RoleCard
        title={t("homeCta.specialistTitle")}
        text={t("homeCta.specialistText")}
        type="registro_especialista"
        label={t("homeCta.specialistLabel")}
        secondaryHref="/agenda-especialista"
        secondaryLabel={t("homeCta.specialistSecondary")}
      />
    </div>
  );
}

function RoleCard({
  title,
  text,
  type,
  label,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  text: string;
  type: "lead_cliente" | "contacto_empresa" | "registro_especialista";
  label: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <article className="panel card-hover">
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-3 min-h-16 text-sm font-semibold leading-6 text-muted">{text}</p>
      <ConversionButton className="btn-primary mt-5 w-full" type={type} sourceButton={label}>
        {label}
      </ConversionButton>
      {secondaryHref && secondaryLabel ? (
        <Link className="btn-secondary mt-3 w-full" href={secondaryHref} data-event="home_specialist_agenda_preview">
          {secondaryLabel}
        </Link>
      ) : null}
    </article>
  );
}
