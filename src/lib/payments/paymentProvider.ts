import { getPlanById, subscriptionPlans } from "@/data/marketplace";
import type { PaymentProvider, PaymentIntent, PaymentIntentType, CreditPack, UserRole } from "@/lib/payments/types";

export const oficiosProMerchant = {
  legalName: "OP SpA",
  rut: "78.444.059-1",
  tradeName: "OficiosPro SpA",
  incorporatedAt: "2026-06-10",
  businessPurpose:
    "Plataforma digital para intermediacion de servicios tecnicos, verificacion de proveedores, reputacion, pagos electronicos y suscripciones recurrentes.",
};

export const paymentProviders: { id: PaymentProvider; label: string; enabled: boolean; detail: string }[] = [
  { id: "mercado_pago", label: "Mercado Pago", enabled: true, detail: "Proveedor principal para checkout y suscripciones." },
  { id: "transbank_webpay", label: "Transbank Webpay", enabled: false, detail: "Transbank preparado, pendiente credenciales." },
  { id: "manual_bank_transfer", label: "Transferencia manual", enabled: false, detail: "Uso operativo interno para conciliaciones." },
  { id: "internal_adjustment", label: "Ajuste interno", enabled: false, detail: "Solo para administracion de creditos." },
];

export const defaultPaymentProvider: PaymentProvider = "mercado_pago";

export const creditPacks: CreditPack[] = [
  { id: "credits-20", credits: 20, amountCLP: 20000, title: "20 creditos", description: "Para visitas y reparaciones menores." },
  { id: "credits-50", credits: 50, amountCLP: 50000, title: "50 creditos", description: "Para mantenciones programadas." },
  { id: "credits-100", credits: 100, amountCLP: 100000, title: "100 creditos", description: "Bolsa familiar o empresa pequena." },
];

export function getProvider(id?: string | null) {
  return paymentProviders.find((provider) => provider.id === id) ?? paymentProviders[0];
}

export function paymentProviderLabel(provider: PaymentProvider) {
  return getProvider(provider).label;
}

export function isProviderAvailable(provider: PaymentProvider) {
  return getProvider(provider).enabled;
}

export function findCreditPack(idOrCredits?: string | number | null) {
  if (idOrCredits === undefined || idOrCredits === null || idOrCredits === "") return null;
  const asNumber = Number(idOrCredits);
  return creditPacks.find((pack) => pack.id === idOrCredits || pack.credits === asNumber) ?? null;
}

export function createPaymentIntent({
  provider = defaultPaymentProvider,
  userId,
  userRole,
  amountCLP,
  credits,
  type,
  metadata = {},
}: {
  provider?: PaymentProvider;
  userId: string;
  userRole: UserRole;
  amountCLP: number;
  credits: number;
  type: PaymentIntentType;
  metadata?: Record<string, unknown>;
}): PaymentIntent {
  const now = new Date().toISOString();
  return {
    id: `pi-op-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    provider,
    userId,
    userRole,
    amountCLP: Math.max(0, Math.round(amountCLP)),
    credits: Math.max(0, Math.round(credits)),
    currency: "CLP",
    type,
    status: "pending",
    metadata,
    createdAt: now,
    updatedAt: now,
  };
}

export function checkoutIntentFromCatalog({
  planId,
  creditPackId,
  creditsPack,
  provider = defaultPaymentProvider,
  userId,
  userRole = "client",
}: {
  planId?: string | null;
  creditPackId?: string | null;
  creditsPack?: number | string | null;
  provider?: PaymentProvider;
  userId: string;
  userRole?: UserRole;
}) {
  const pack = findCreditPack(creditPackId ?? creditsPack ?? null);
  if (pack) {
    return createPaymentIntent({
      provider,
      userId,
      userRole,
      amountCLP: pack.amountCLP,
      credits: pack.credits,
      type: "credit_pack",
      metadata: { creditPackId: pack.id, title: pack.title },
    });
  }

  const plan = getPlanById(planId ?? "plus");
  return createPaymentIntent({
    provider,
    userId,
    userRole: plan.audience === "empresa" ? "company" : userRole,
    amountCLP: plan.priceCLP,
    credits: plan.monthlyCredits,
    type: "subscription_plan",
    metadata: { planId: plan.id, planName: plan.name },
  });
}

export function planIds() {
  return subscriptionPlans.map((plan) => plan.id);
}
