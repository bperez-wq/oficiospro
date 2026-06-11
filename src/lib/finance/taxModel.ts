/**
 * Modelo tributario operacional de OficiosPro (OP SpA).
 *
 * IMPORTANTE: esto es diseño operacional y de software, NO un dictamen legal.
 * Cada constante y regla marcada con "VALIDAR" debe revisarse con contador/tributarista
 * chileno antes de operar en producción. Ver docs/financial-tax-model-chile.md.
 */

import type {
  RequiredSpecialistDocument,
  ServiceTaxTreatment,
  SpecialistTaxProfile,
  SpecialistTaxType,
  TaxDocumentType,
  UserRole,
} from "@/lib/finance/types";

/** IVA vigente en Chile. VALIDAR: tasa y aplicabilidad por tipo de ingreso. */
export const IVA_RATE = 0.19;

/**
 * Retención boleta de honorarios. La tasa sube gradualmente por ley 21.133
 * hasta llegar a 17%. VALIDAR con contador la tasa vigente del año comercial.
 */
export const HONORARIOS_RETENTION_RATE = 0.1525;

export const OP_SPA = {
  legalName: "OP SpA",
  tradeName: "OficiosPro SpA",
  platform: "OficiosPro.cl",
  /** VALIDAR: RUT definitivo e inicio de actividades ante SII. */
  rut: "77.000.000-0",
} as const;

/* ------------------------------------------------------------------ */
/* Modelos tributarios comparados                                       */
/* ------------------------------------------------------------------ */

export type TaxModelId = "model_a_platform_total" | "model_b_commission_only" | "model_c_mixed_by_segment";

export type TaxModelDefinition = {
  id: TaxModelId;
  name: string;
  summary: string;
  clientDocumentIssuer: "op_spa" | "specialist";
  specialistDocumentReceiver: "op_spa" | "client";
  advantages: string[];
  disadvantages: string[];
  taxRisk: "bajo" | "medio" | "alto";
  clientSimplicity: "alta" | "media" | "baja";
  specialistSimplicity: "alta" | "media" | "baja";
  scalability: "alta" | "media" | "baja";
};

export const taxModels: TaxModelDefinition[] = [
  {
    id: "model_a_platform_total",
    name: "Modelo A — OP SpA documenta el total al cliente",
    summary:
      "OP SpA emite boleta/factura al cliente por créditos y suscripciones; el especialista emite su documento (boleta honorarios o factura) a OP SpA, que liquida contra documento.",
    clientDocumentIssuer: "op_spa",
    specialistDocumentReceiver: "op_spa",
    advantages: [
      "Cliente recibe un solo documento, de una sola empresa: experiencia simple.",
      "Especialista no factura a desconocidos: siempre emite a OP SpA.",
      "Pago protegido y créditos calzan naturalmente: OP SpA recauda y libera.",
      "Control total de conciliación, reportes y márgenes.",
    ],
    disadvantages: [
      "OP SpA reconoce como ingreso el total recaudado (no solo la comisión): más IVA débito y más carga administrativa.",
      "OP SpA asume rol de contratante administrativo del servicio: requiere contratos claros para no parecer empleador.",
      "Mayor exigencia de capital de trabajo (recauda todo, paga después).",
    ],
    taxRisk: "medio",
    clientSimplicity: "alta",
    specialistSimplicity: "alta",
    scalability: "alta",
  },
  {
    id: "model_b_commission_only",
    name: "Modelo B — Especialista documenta al cliente; OP SpA solo comisión",
    summary:
      "El especialista emite boleta/factura directo al cliente final por el servicio; OP SpA emite factura al especialista (o al cliente) solo por su comisión de intermediación.",
    clientDocumentIssuer: "specialist",
    specialistDocumentReceiver: "client",
    advantages: [
      "OP SpA tributa solo por su comisión: menor base de IVA e ingresos.",
      "Rol de mero intermediario, menor riesgo de ser visto como prestador o empleador.",
    ],
    disadvantages: [
      "Incompatible con créditos prepagados: el cliente ya pagó a OP SpA y el especialista tendría que documentar un monto que no recaudó.",
      "Cliente recibe documentos de N especialistas distintos: experiencia confusa.",
      "Especialistas informales o lentos en documentar rompen el flujo del cliente.",
      "Conciliación de pago protegido mucho más compleja.",
    ],
    taxRisk: "medio",
    clientSimplicity: "baja",
    specialistSimplicity: "baja",
    scalability: "media",
  },
  {
    id: "model_c_mixed_by_segment",
    name: "Modelo C — Mixto por segmento",
    summary:
      "B2C hogar opera con créditos/prepago documentados por OP SpA (como Modelo A); B2B empresas recibe factura OP SpA por servicios y suscripciones; especialistas siempre liquidan contra documento emitido a OP SpA.",
    clientDocumentIssuer: "op_spa",
    specialistDocumentReceiver: "op_spa",
    advantages: [
      "Mantiene la simplicidad del Modelo A para el cliente y el especialista.",
      "Permite tratamiento diferenciado B2B (factura afecta, crédito IVA para la empresa cliente).",
      "Escala a contratos marco empresa con facturación mensual consolidada.",
    ],
    disadvantages: [
      "Dos rieles de documentación (boleta B2C / factura B2B) que el sistema debe distinguir bien.",
      "Requiere datos de facturación de empresa en checkout y validación de RUT/giro.",
    ],
    taxRisk: "medio",
    clientSimplicity: "alta",
    specialistSimplicity: "alta",
    scalability: "alta",
  },
];

/**
 * Recomendación operacional:
 * - Piloto: Modelo A puro (un solo riel, todo documentado por OP SpA, liquidación contra documento).
 * - Madurez: Modelo C (A + riel B2B con factura afecta para empresas).
 * VALIDAR con contador antes de emitir los primeros documentos.
 */
export const recommendedPilotModel: TaxModelId = "model_a_platform_total";
export const recommendedMatureModel: TaxModelId = "model_c_mixed_by_segment";

export const taxFlowDiagram = `Cliente paga (créditos / Club Hogar / adicional)
  → payment_intent (provider Mercado Pago, status approved)
  → documento OP SpA al cliente (boleta afecta B2C | factura afecta B2B)
  → wallet de créditos (issueCredits / subscription_credits_issued)
  → reserva de servicio (reserveCreditsForService → créditos retenidos)
  → especialista ejecuta → cliente confirma avance/cierre
  → releaseCreditsAfterCompletion (captura créditos retenidos)
  → calculatePlatformCommission + calculateSpecialistPayout
  → especialista emite documento a OP SpA (boleta honorarios | factura)
  → markSpecialistDocumentReceived → payout ready_to_pay → paid
  → ledger + platform_commissions + tax_documents + specialist_payouts
  → reportes contables mensuales y conciliación contra Mercado Pago`;

/* ------------------------------------------------------------------ */
/* Resolución de documentos                                             */
/* ------------------------------------------------------------------ */

/** Documento que OP SpA emite al cliente según su rol. */
export function resolveClientDocumentType(role: UserRole, hasCompanyBilling: boolean): TaxDocumentType {
  if (role === "company" || hasCompanyBilling) return "factura_afecta";
  return "boleta_afecta";
}

/** Documento que el especialista debe emitir a OP SpA según su perfil tributario. */
export function resolveRequiredSpecialistDocument(taxType: SpecialistTaxType): RequiredSpecialistDocument {
  switch (taxType) {
    case "persona_natural_honorarios":
      return "boleta_honorarios";
    case "empresa_factura_afecta":
      return "factura_afecta";
    case "empresa_factura_exenta":
      return "factura_exenta";
    case "pendiente_formalizacion":
    default:
      /* Sin formalización no hay documento posible: el payout queda bloqueado. */
      return "none";
  }
}

/** Tratamiento tributario por defecto de una solicitud según rol del cliente. */
export function resolveServiceTaxTreatment(customerRole: UserRole): ServiceTaxTreatment {
  if (customerRole === "company") return "b2b_invoice_model_c";
  return "platform_total_model_a";
}

/** ¿Aplica retención de honorarios sobre el payout? */
export function retentionAppliesFor(profile: Pick<SpecialistTaxProfile, "taxType" | "retentionApplies">) {
  if (profile.taxType === "persona_natural_honorarios") return profile.retentionApplies !== false;
  return false;
}

/** Desglose neto/IVA de un monto bruto afecto. */
export function splitNetAndIva(grossCLP: number) {
  const net = Math.round(grossCLP / (1 + IVA_RATE));
  return { netAmountCLP: net, ivaAmountCLP: Math.max(0, grossCLP - net) };
}

/** ¿El especialista está habilitado para recibir pagos? */
export function specialistReadyForPayouts(profile: SpecialistTaxProfile | undefined): {
  ready: boolean;
  reason?: string;
} {
  if (!profile) return { ready: false, reason: "Datos tributarios pendientes" };
  if (!profile.rut || !profile.legalName) return { ready: false, reason: "Datos tributarios incompletos" };
  if (profile.taxType === "pendiente_formalizacion") return { ready: false, reason: "Formalización ante SII pendiente" };
  if (!profile.bankAccount?.accountNumber) return { ready: false, reason: "Cuenta bancaria pendiente" };
  if (!profile.verifiedByAdmin) return { ready: false, reason: "Verificación de datos tributarios pendiente" };
  return { ready: true };
}

/* ------------------------------------------------------------------ */
/* Puntos que requieren validación profesional                          */
/* ------------------------------------------------------------------ */

export const accountantValidationPoints = [
  "Tratamiento de la venta de créditos: prepago/anticipo vs servicio digital; momento de devengo del IVA (al vender el crédito o al usarlo).",
  "Documento correcto para créditos B2C (boleta afecta) y B2B (factura afecta) y su glosa.",
  "Tratamiento de créditos vencidos no usados: reconocimiento de ingreso y efecto IVA.",
  "Reembolsos: nota de crédito obligatoria, plazos y efecto en IVA débito.",
  "Suscripción Club Hogar: documentación mensual recurrente y tratamiento del descuento de 2 créditos por solicitud (rebaja de precio vs gasto).",
  "Modelo A: confirmación de que OP SpA puede documentar el total y registrar el pago al especialista como costo con respaldo (boleta honorarios/factura).",
  "Tasa de retención de honorarios vigente y obligación de OP SpA de retener y enterar (F29/F1879).",
  "IVA de la comisión de plataforma si se migrara a Modelo B/C parcial.",
  "Materiales y repuestos: documentación de respaldo, margen sobre materiales y si requieren factura del proveedor a OP SpA o al especialista.",
  "Riesgo de laboralidad: contratos de prestación de servicios con especialistas, criterios de independencia.",
  "Boletas de honorarios de especialistas: emisión electrónica a OP SpA y su registro como gasto.",
  "Inicio de actividades, giros correctos de OP SpA y eventual PPM.",
] as const;
