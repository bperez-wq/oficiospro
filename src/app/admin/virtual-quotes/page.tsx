"use client";

import { AdminOperationalTablePage } from "@/components/AdminOperationalTablePage";

export default function AdminVirtualQuotesPage() {
  return (
    <AdminOperationalTablePage
      eyebrow="Panel interno OficiosPro"
      title="Cotizaciones virtuales"
      description="Revisa solicitudes con fotos/antecedentes, estados, urgencia y seguimiento antes de una visita presencial."
      endpoint="/api/admin/virtual-quotes"
      responseKey="virtualQuotes"
      columns={["id", "customerName", "customerEmail", "specialistName", "serviceName", "commune", "region", "urgency", "status", "attachmentCount", "description", "createdAt", "updatedAt"]}
      actions={[
        { label: "En revision", path: (row) => `/api/admin/virtual-quotes/${encodeURIComponent(String(row.id))}/update-status`, body: () => ({ status: "pendiente_revision", message: "Admin marco la cotización en revision." }), tone: "secondary" },
        { label: "Esperando especialista", path: (row) => `/api/admin/virtual-quotes/${encodeURIComponent(String(row.id))}/update-status`, body: () => ({ status: "pendiente_revision", message: "Esperando revision del especialista." }), tone: "secondary" },
        { label: "Esperando cliente", path: (row) => `/api/admin/virtual-quotes/${encodeURIComponent(String(row.id))}/update-status`, body: () => ({ status: "cotizacion_enviada", message: "Propuesta enviada; esperando decision del cliente." }), tone: "primary" },
        { label: "Convertida", path: (row) => `/api/admin/virtual-quotes/${encodeURIComponent(String(row.id))}/update-status`, body: () => ({ status: "convertida_a_reserva", message: "Cotización convertida en reserva." }), tone: "secondary" },
      ]}
    />
  );
}
