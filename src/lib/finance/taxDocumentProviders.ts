import type { RequiredSpecialistDocumentKind } from "@/data/specialistFormalization";

export type TaxDocumentProviderStatus =
  | "not_configured"
  | "pending_secure_storage"
  | "manual_review_required"
  | "queued"
  | "sent"
  | "failed";

export type SpecialistTaxDocumentDraft = {
  specialistId: string;
  payoutId?: string;
  documentType: RequiredSpecialistDocumentKind;
  receiverRut: string;
  receiverLegalName: string;
  grossAmountCLP: number;
  netAmountCLP: number;
  ivaAmountCLP: number;
  withholdingAmountCLP: number;
  createdAt: string;
};

export type TaxDocumentProviderResult = {
  ok: boolean;
  status: TaxDocumentProviderStatus;
  provider: "manual" | "sii" | "pending";
  message: string;
  externalId?: string;
};

export interface TaxDocumentProvider {
  createSpecialistDocumentRequest(draft: SpecialistTaxDocumentDraft): Promise<TaxDocumentProviderResult>;
  checkDocumentStatus(externalId: string): Promise<TaxDocumentProviderResult>;
}

export class PendingTaxDocumentProvider implements TaxDocumentProvider {
  async createSpecialistDocumentRequest(): Promise<TaxDocumentProviderResult> {
    return {
      ok: false,
      status: "manual_review_required",
      provider: "pending",
      message: "Emision electronica no configurada. Registrar documento manualmente y validar con contador antes de liberar pago.",
    };
  }

  async checkDocumentStatus(): Promise<TaxDocumentProviderResult> {
    return {
      ok: false,
      status: "not_configured",
      provider: "pending",
      message: "Proveedor tributario no configurado.",
    };
  }
}

export function getTaxDocumentProvider(): TaxDocumentProvider {
  return new PendingTaxDocumentProvider();
}

export function secureStorageStatusForDocumentUpload({ privateStorageConfigured }: { privateStorageConfigured: boolean }) {
  return privateStorageConfigured ? "manual_review_required" : "pending_secure_storage";
}
