const rows = [
  ["Solicitud", "Mantención HVAC", "Reservada", "18 créditos"],
  ["Evidencia", "Fotos y checklist", "Pendiente", "0 créditos"],
  ["Pago", "Retención protegida", "Activa", "18 créditos"],
  ["Documento", "Boleta/factura", "Por revisar", "Revisión interna"],
];

export function OperationalDashboardMock() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-enterprise p-5 text-white shadow-card md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-teal-200">Panel operativo</p>
          <h3 className="text-2xl font-black">Trazabilidad de servicio</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/70">Créditos, evidencia, estado de pago y documentación en una vista preparada para operación.</p>
        </div>
        <span className="chip bg-white text-brand-dark">Preparado para operar</span>
      </div>
      <div className="mt-5 grid gap-3">
        {rows.map(([label, title, status, value]) => (
          <div key={`${label}-${title}`} className="grid gap-3 rounded-2xl bg-white/10 p-4 text-sm font-bold sm:grid-cols-[0.7fr_1fr_0.8fr_auto] sm:items-center">
            <span className="text-white/55">{label}</span>
            <strong>{title}</strong>
            <span className="text-teal-100">{status}</span>
            <span className="font-black text-sun">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
