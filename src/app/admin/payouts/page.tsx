import { AdminOperationalTablePage } from "@/components/AdminOperationalTablePage";

export default function AdminPayoutsPage() {
  return (
    <AdminOperationalTablePage
      eyebrow="Panel interno OficiosPro"
      title="Pagos a especialistas"
      description="Payouts, Comision OficiosPro y documento tributario asociado para operar pago protegido de forma auditable."
      endpoint="/api/admin/payouts"
      responseKey="payouts"
      columns={["id", "specialistId", "serviceRequestId", "paymentIntentId", "customerCredits", "customerChargeCLP", "specialistPayoutCLP", "platformMarginCLP", "status", "taxDocumentId", "createdAt", "approvedAt", "paidAt"]}
    />
  );
}
