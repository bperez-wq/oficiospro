import { AdminOperationalTablePage } from "@/components/AdminOperationalTablePage";

export default function AdminServiceRequestsPage() {
  return (
    <AdminOperationalTablePage
      eyebrow="Panel interno OficiosPro"
      title="Solicitudes de servicio"
      description="Vista operacional para reservas, cotizaciones y solicitudes capturadas desde formularios reales."
      endpoint="/api/admin/service-requests"
      responseKey="serviceRequests"
      columns={["id", "customerName", "customerEmail", "customerWhatsapp", "comuna", "specialistId", "serviceId", "serviceDescription", "urgency", "creditsEstimated", "status", "createdAt"]}
    />
  );
}
