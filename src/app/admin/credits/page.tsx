import { AdminOperationalTablePage } from "@/components/AdminOperationalTablePage";

export default function AdminCreditsPage() {
  return (
    <AdminOperationalTablePage
      eyebrow="Panel interno OficiosPro"
      title="Creditos"
      description="Wallets de créditos persistidas en D1. Los movimientos deben venir de ledger y acciones autorizadas."
      endpoint="/api/admin/credits"
      responseKey="wallets"
      columns={["id", "userId", "availableCredits", "reservedCredits", "expiringCredits", "lifetimePurchased", "lifetimeUsed", "updatedAt"]}
      allowStatusFilter={false}
    />
  );
}
