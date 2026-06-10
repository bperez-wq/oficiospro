import type { PaymentIntent, ProviderTransactionStatus } from "@/lib/payments/types";

export const transbankWebpayProvider = {
  id: "transbank_webpay" as const,
  status: "prepared_pending_credentials" as const,
  createTransaction(_intent: PaymentIntent) {
    return {
      ok: false,
      provider: "transbank_webpay" as const,
      status: "pending",
      message: "Transbank preparado, pendiente credenciales.",
    };
  },
  confirmTransaction(_token: string): ProviderTransactionStatus {
    return {
      provider: "transbank_webpay",
      status: "unknown",
      raw: { message: "Transbank preparado, pendiente credenciales." },
    };
  },
  refundTransaction(_externalPaymentId: string, _amountCLP: number): ProviderTransactionStatus {
    return {
      provider: "transbank_webpay",
      status: "unknown",
      raw: { message: "Transbank preparado, pendiente credenciales." },
    };
  },
  getTransactionStatus(_externalPaymentId: string): ProviderTransactionStatus {
    return {
      provider: "transbank_webpay",
      status: "unknown",
      raw: { message: "Transbank preparado, pendiente credenciales." },
    };
  },
};
