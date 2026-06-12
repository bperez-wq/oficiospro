"use client";

import { AdminOperationalTablePage } from "@/components/AdminOperationalTablePage";

export default function AdminSpecialistsPage() {
  return (
    <AdminOperationalTablePage
      eyebrow="Panel interno OficiosPro"
      title="Especialistas"
      description="Revisa postulaciones, aprueba, publica, suspende o rechaza especialistas desde datos reales en D1."
      endpoint="/api/admin/specialists"
      responseKey="specialists"
      columns={["id", "firstName", "lastName", "email", "whatsapp", "region", "comuna", "serviceTypes", "specialties", "status", "publicationStatus", "identityVerificationJson", "createdAt", "updatedAt"]}
      actions={[
        { label: "Aprobar", path: (row) => `/api/admin/specialists/${encodeURIComponent(String(row.id))}/approve`, tone: "secondary" },
        { label: "Publicar", path: (row) => `/api/admin/specialists/${encodeURIComponent(String(row.id))}/publish`, tone: "primary" },
        { label: "Pedir mas info", path: (row) => `/api/admin/specialists/${encodeURIComponent(String(row.id))}/request-more-info`, tone: "secondary" },
        { label: "Suspender", path: (row) => `/api/admin/specialists/${encodeURIComponent(String(row.id))}/suspend`, tone: "secondary" },
        { label: "Rechazar", path: (row) => `/api/admin/specialists/${encodeURIComponent(String(row.id))}/reject`, tone: "danger" },
      ]}
    />
  );
}
