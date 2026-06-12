import { AdminOperationalTablePage } from "@/components/AdminOperationalTablePage";

export default function AdminPaymentsPage() {
  return (
    <AdminOperationalTablePage
      eyebrow="Panel interno OficiosPro"
      title="Pagos"
      description="Intenciones de pago persistidas en D1 para conciliacion con Mercado Pago y futuros proveedores."
      endpoint="/api/admin/payments"
      responseKey="paymentIntents"
      columns={["id", "provider", "externalPaymentId", "userId", "userRole", "amountCLP", "credits", "currency", "type", "status", "metadataJson", "createdAt", "updatedAt"]}
    />
  );
}
