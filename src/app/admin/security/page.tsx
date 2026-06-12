import { AdminOperationalTablePage } from "@/components/AdminOperationalTablePage";

export default function AdminSecurityPage() {
  return (
    <AdminOperationalTablePage
      eyebrow="Panel interno OficiosPro"
      title="Seguridad operacional"
      description="Eventos de webhook, auditoria admin y rate limits para revisar duplicados, tokens y actividad sensible."
      endpoint="/api/admin/security"
      responseKey="securityEvents"
      columns={["id", "provider", "providerEventId", "topic", "dataId", "verified", "duplicate", "processed", "action", "entityType", "entityId", "limited", "receivedAt", "createdAt"]}
      allowStatusFilter={false}
    />
  );
}
