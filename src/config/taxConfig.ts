export type PlatformCommissionBaseMode =
  | "specialist_gross_document"
  | "specialist_net"
  | "customer_net_before_commission"
  | "manual";

export type PlatformCommissionConfig = {
  standardRate: number;
  ivaApplies: boolean;
  minimumCommissionCLP: number;
  maximumCommissionCLP: number | null;
  appliesTo: "specialist_document_amount";
  commissionBaseMode: PlatformCommissionBaseMode;
  label: string;
  shortLabel: string;
  description: string;
  futureRuleSlots: {
    categoryMinimumsEnabled: boolean;
    urgencyRulesEnabled: boolean;
    companyRulesEnabled: boolean;
    managedServiceRulesEnabled: boolean;
  };
};

export type TaxConfigVersion = {
  id: string;
  country: "CL";
  currency: "CLP";
  effectiveFrom: string;
  ivaRate: number;
  honorariosRetentionRate: number;
  platformCommission: PlatformCommissionConfig;
  roundingMode: "nearest";
  accountantValidationRequired: boolean;
  siiValidationRequired: boolean;
  notes: string[];
};

export const chileTaxConfig2026: TaxConfigVersion = {
  id: "cl-2026-reference",
  country: "CL",
  currency: "CLP",
  effectiveFrom: "2026-01-01",
  ivaRate: 0.19,
  honorariosRetentionRate: 0.1525,
  platformCommission: {
    standardRate: 0.095,
    ivaApplies: true,
    minimumCommissionCLP: 3000,
    maximumCommissionCLP: null,
    appliesTo: "specialist_document_amount",
    commissionBaseMode: "specialist_gross_document",
    label: "Comision OficiosPro",
    shortLabel: "9,5% + IVA",
    description: "Financia tecnologia, operacion, soporte, CRM, pago protegido y gestion de plataforma.",
    futureRuleSlots: {
      categoryMinimumsEnabled: false,
      urgencyRulesEnabled: false,
      companyRulesEnabled: false,
      managedServiceRulesEnabled: false,
    },
  },
  roundingMode: "nearest",
  accountantValidationRequired: true,
  siiValidationRequired: true,
  notes: [
    "Valores referenciales para modelar flujos internos de OficiosPro.",
    "La tasa de retencion de boleta de honorarios y su aplicabilidad deben validarse con contador/SII antes de operar.",
    "La venta de creditos, Club Hogar y documentacion de servicios deben validarse antes de emitir documentos reales.",
  ],
};

export const taxConfigVersions: TaxConfigVersion[] = [chileTaxConfig2026];

export function getTaxConfigForDate(date: Date = new Date()): TaxConfigVersion {
  const isoDate = date.toISOString().slice(0, 10);
  return [...taxConfigVersions]
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))
    .find((config) => config.effectiveFrom <= isoDate) ?? chileTaxConfig2026;
}

export function roundTaxCLP(value: number, config: Pick<TaxConfigVersion, "roundingMode"> = chileTaxConfig2026) {
  if (!Number.isFinite(value)) return 0;
  if (config.roundingMode === "nearest") return Math.round(value);
  return Math.round(value);
}
