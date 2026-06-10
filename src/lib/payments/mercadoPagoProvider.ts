import { defaultPaymentProvider } from "@/lib/payments/paymentProvider";
import type { PaymentIntent, ProviderTransactionStatus } from "@/lib/payments/types";

export const mercadoPagoProvider = {
  id: defaultPaymentProvider,
  createCheckoutPayload(intent: PaymentIntent, payer: { email?: string; name?: string; rut?: string; whatsapp?: string }) {
    return {
      items: [
        {
          id: intent.id,
          title: String(intent.metadata.title ?? intent.metadata.planName ?? "OficiosPro"),
          quantity: 1,
          currency_id: intent.currency,
          unit_price: intent.amountCLP,
        },
      ],
      payer,
      external_reference: intent.id,
      metadata: {
        payment_intent_id: intent.id,
        payment_intent_type: intent.type,
        credits: intent.credits,
      },
    };
  },
  normalizeStatus(status?: string): ProviderTransactionStatus["status"] {
    if (status === "approved" || status === "authorized") return "approved";
    if (status === "cancelled") return "cancelled";
    if (status === "rejected") return "rejected";
    if (status === "refunded") return "refunded";
    return "pending";
  },
  webhookIdempotencyKey(topic: string, dataId?: string | number | null) {
    return `mercado_pago:${topic || "unknown"}:${dataId ?? "sin-id"}`;
  },
};
