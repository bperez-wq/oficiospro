# Especificación de reportes contables — OficiosPro (OP SpA)

Implementación: `src/lib/finance/accountingReports.ts` · UI: `/admin` → sección **Finanzas y tributación** (`AdminFinancePanel`).
Exportación actual: **CSV** (separador `;`, UTF-8) generado en el navegador. Excel/ERP: Fase 3.

## 1. Reportes requeridos

### A. Ventas OP SpA (`salesReport`) — mensual
Compras de créditos, suscripciones Club Hogar, cargos adicionales, documentos emitidos e IVA débito estimado.

Columnas CSV: `paymentId; fecha; tipo; cliente; rut; montoCLP; netoCLP; ivaCLP; creditos; estadoDocumento`
Resumen: totales por tipo de venta, `estimatedIvaDebitCLP`, documentos emitidos vs pendientes.

### B. Movimientos de créditos (`creditMovementsReport`) — mensual
Créditos emitidos, usados, retenidos, liberados, vencidos, reembolsados y descuentos Club Hogar.

Columnas: `id; fecha; usuario; tipo; creditos; saldoPosterior; pagoRelacionado; solicitudRelacionada; descripcion`
Resumen incluye `outstandingLiabilityCredits` (pasivo por créditos vivos: disponibles + retenidos).

### C. Liquidaciones a especialistas (`payoutsReport`) — semanal/mensual
Servicios completados, payout bruto, comisión, retención, neto, documento requerido/recibido y pagos pendientes o bloqueados.

Columnas: `payoutId; especialista; solicitud; brutoCLP; comisionCLP; payoutCLP; retencionCLP; netoCLP; documentoRequerido; estadoDocumento; estadoPago; pagadoEl`

### D. Comisiones (`commissionsReport`) — mensual
Comisión por servicio y mes, margen por categoría y por especialista (agrupaciones `byCategory`, `bySpecialist`; margen por comuna se habilita al persistir comuna en `service_requests`).

Columnas: `id; solicitud; especialista; cliente; comisionCLP; comisionCreditos; tasa; ivaCLP; fecha`

### E. Documentos tributarios (`taxDocumentsReport`) — mensual
Boletas/facturas OP SpA, documentos de especialistas y notas de crédito, con folio, neto/IVA/retención y estado.

Columnas: `id; emisor; rutEmisor; rutReceptor; tipo; folio; montoCLP; netoCLP; ivaCLP; retencionCLP; estado; emitidoEl`

### F. Reporte tributario consolidado (`generateTaxReport`) — mensual
IVA débito estimado, retenciones de honorarios a declarar, ventas, costos de especialistas y margen bruto. Cifras de apoyo al contador; **no constituye declaración**.

## 2. Conciliación (`reconciliationReport` / pestaña Alertas)

| Alerta | Severidad | Detección |
|---|---|---|
| `payment_without_document` | warning | Pago aprobado sin documento emitido |
| `document_without_payment` | critical | Documento OP SpA sin payment_intent |
| `credits_issued_without_payment` | critical | Ledger `credits_purchased` sin pago aprobado |
| `duplicated_payment` | critical | providerPaymentId repetido en ≥2 intents |
| `duplicated_webhook` | info | Evento de proveedor ya procesado (ignorado) |
| `payout_without_document` | critical | Payout pagado sin documento validado |
| `refund_without_credit_note` | critical | Reembolso con documento sin nota de crédito |

Periodicidad sugerida: revisión de alertas **semanal**; cierre con contador **mensual** (día 5 del mes siguiente).

## 3. Filtros y acciones admin

Filtros: periodo (YYYY-MM, default mes en curso); por pestaña: estado de pago, estado de documento, especialista, tipo de movimiento.
Acciones implementadas: ver detalle de pagos/ledger; **marcar documento recibido**; **aprobar payout**; **marcar pagado**; **bloquear payout**; **registrar ajuste manual** (usuario+créditos+motivo obligatorio → ledger); **exportar CSV** por tipo; revisión de alertas (conciliado = sin alertas del periodo).

KPIs cabecera: pagos aprobados del mes (CLP), créditos emitidos/retenidos, ingresos y comisión estimada, payouts y documentos pendientes, alertas de conciliación.

## 4. Preparación para ERP/contador (Fase 3)

- `AccountingExport` registra cada export (periodo, tipo, filas, timestamp) → auditable.
- CSV con separador `;` compatible con Excel chileno; JSON interno disponible (estructuras tipadas).
- Integración DTE: los `tax_documents` ya modelan folio/tipo/neto/IVA/retención → mapear a proveedor DTE sin cambiar el esquema.
- Pendiente de storage durable: los reportes leen `FinanceState`; al migrar a D1/Supabase solo cambia la fuente, no el contrato.
