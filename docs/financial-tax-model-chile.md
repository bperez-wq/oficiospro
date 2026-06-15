# Modelo financiero y tributario — OficiosPro (OP SpA)

> **ADVERTENCIA**: este documento es diseño operacional y de software. **No es asesoría legal ni tributaria.**
> Todos los puntos marcados **[VALIDAR]** requieren revisión de contador/tributarista chileno antes de operar.

Sociedad: **OP SpA** · Nombre comercial: **OficiosPro SpA** · Plataforma: **OficiosPro.cl**
Código: `src/lib/finance/*` (tipos, modelo tributario, comisiones, payouts, documentos, reportes).

---

## 1. Modelo recomendado

| Etapa | Modelo | Resumen |
|---|---|---|
| **Piloto** | **Modelo A** | OP SpA documenta el **total** al cliente (boleta/factura por créditos y suscripciones). El especialista emite **su documento a OP SpA** (boleta de honorarios o factura) y se liquida contra documento. |
| **Madurez** | **Modelo C** | Modelo A + riel B2B: empresas reciben **factura afecta OP SpA** (crédito IVA para ellas), contratos marco y facturación mensual consolidada. Especialistas siguen liquidando contra documento a OP SpA. |

### Comparación de modelos

**Modelo A — OP SpA documenta el total; especialista documenta a OP SpA**
- Ventajas: un solo documento para el cliente; especialista nunca factura a desconocidos; calza con créditos prepagados y pago protegido; control total de conciliación.
- Desventajas: OP SpA reconoce el total como ingreso (más IVA débito y administración); rol de contratante administrativo exige contratos que eviten apariencia de empleador; más capital de trabajo.
- Riesgo tributario: medio · Cliente: alta simplicidad · Especialista: alta · Escalabilidad: alta.

**Modelo B — Especialista documenta al cliente; OP SpA solo comisión**
- Ventajas: OP SpA tributa solo por comisión; rol de intermediario puro.
- Desventajas: **incompatible con créditos prepagados** (el cliente pagó a OP SpA, no al especialista); N documentos de N especialistas; especialistas informales rompen el flujo; conciliación compleja.
- Riesgo: medio · Cliente: baja · Especialista: baja · Escalabilidad: media.

**Modelo C — Mixto por segmento**
- B2C hogar = Modelo A con créditos/prepago; B2B = factura afecta OP SpA; especialistas siempre contra documento a OP SpA.
- Ventajas: simplicidad de A + tratamiento B2B correcto. Desventajas: dos rieles de documentación que el sistema debe distinguir (implementado: `resolveClientDocumentType`).
- Riesgo: medio · Cliente: alta · Especialista: alta · Escalabilidad: alta.

**Conclusión**: piloto con **A**, evolución natural a **C**. B queda descartado mientras el producto se base en créditos prepagados.

---

## 2. Flujo tributario completo

```
Cliente paga (créditos / Club Hogar / adicional)
  → payment_intent (Mercado Pago, status approved)
  → documento OP SpA al cliente (boleta afecta B2C | factura afecta B2B)
  → wallet de créditos (issueCredits / subscription_credits_issued)
  → reserva de servicio (reserveCreditsForService → créditos retenidos)
  → especialista ejecuta → cliente confirma avance/cierre
  → releaseCreditsAfterCompletion (captura retenidos, devuelve excedente)
  → calculatePlatformCommission + calculateSpecialistPayout
  → especialista emite documento a OP SpA (boleta honorarios | factura afecta | exenta)
  → markSpecialistDocumentReceived → ready_to_pay → paid
  → ledger + platform_commissions + tax_documents + specialist_payouts
  → reportes contables mensuales y conciliación contra Mercado Pago
```

### A. Cliente compra créditos
- OP SpA emite **boleta afecta** (B2C) o **factura afecta** (B2B) por el monto pagado, en el momento del pago. **[VALIDAR]** si el devengo del IVA es al vender el crédito (anticipo) o al consumirlo; el sistema soporta ambos (documento ligado al `payment_intent`, consumo trazado en ledger).
- El crédito es **saldo interno prepagado**, no dinero: no es retirable, vence (24 meses) y se rige por términos de uso.
- Créditos no usados: siguen como **pasivo** (deuda de servicio) — reporte `creditMovementsReport.outstandingLiabilityCredits`.
- Créditos vencidos: `expireCredits` los da de baja; **[VALIDAR]** reconocimiento de ingreso por breakage.
- Reembolsos: `refundCredits` + el pago pasa a `refunded` y el documento queda `credit_note_required` → **nota de crédito obligatoria** (alerta crítica si falta).

### B. Suscripción Club Hogar
- Cobro mensual → documento mensual OP SpA (boleta/factura) + `subscription_credits_issued` en el ledger.
- Descuento de 2 créditos por solicitud: **rebaja de precio** registrada como movimiento `service_discount` (trazable por solicitud), no un gasto. **[VALIDAR]** tratamiento contable del descuento.
- Ingreso mensual queda en `salesReport.subscriptionSalesCLP`.

### C. Cliente usa créditos
- **No se emite un segundo documento** al usar créditos (ya se documentó la compra): el uso es consumo de saldo, registrado en ledger (`credits_reserved` → `credits_released`). Así se evita la doble facturación.
- Retención (pago protegido): `credits_reserved` mueve disponible → retenido. Liberación al cierre: `releaseCreditsAfterCompletion` captura lo usado y devuelve el excedente.

### D. Servicio realizado por el especialista
El especialista emite **siempre a OP SpA**, nunca al cliente final:

| Situación del especialista | Documento a OP SpA | Retención | IVA |
|---|---|---|---|
| Persona natural | Boleta de honorarios electrónica | Sí (tasa vigente, `HONORARIOS_RETENTION_RATE`) **[VALIDAR tasa]** | No |
| Empresa afecta | Factura afecta | No | Crédito fiscal para OP SpA |
| Empresa exenta | Factura exenta | No | No |
| Pendiente de formalización | **Ninguno posible → payout bloqueado** | — | — |

### E. Comisión/margen de OficiosPro
- En el Modelo A la comisión es **margen interno**: OP SpA documenta el total al cliente y registra el costo del especialista contra su documento. No se emite documento separado por comisión (el riesgo de documentarla aparte es duplicar ingreso). **[VALIDAR]**
- Cálculo formalización: `calculatePlatformCommission` usa la regla estándar configurable **Comisión OficiosPro = 9,5% + IVA** desde `taxConfig.platformCommission`, con base por defecto `specialist_gross_document`. Cualquier mínimo futuro debe quedar explícito en config y validado con contador/SII.

### F. Materiales y adicionales
- Adicional (materiales, repuestos, mano de obra extra, urgencia, horas): requiere **aprobación del cliente** antes de retener créditos (`reserveApprovedAdditional` rechaza sin aprobación).
- Comisión diferenciada: materiales 8%, mano de obra adicional 12%, urgencia con multiplicador (config).
- Materiales con respaldo: boleta/factura del proveedor **[VALIDAR]** si conviene compra por OP SpA (crédito IVA) o reembolso al especialista.
- Cotizaciones: `quote_required` no retiene créditos hasta aceptar; `visit_then_quote` retiene solo los créditos de visita.

---

## 3. Estructura de datos (src/lib/finance/types.ts)

| Entidad | Tipo | Contenido clave |
|---|---|---|
| A | `FinancePaymentIntent` | extiende `PaymentIntent` con buyerRut/Name/Email, neto/IVA, `documentStatus`, providerPaymentId |
| B | `FinanceCreditWallet` | disponible, retenido, por vencer, lifetime purchased/used/refunded, lastMovementAt |
| C | `FinanceLedgerEntry` | 9 tipos de movimiento (incl. `service_discount`), saldo posterior, referencias a pago/solicitud/suscripción |
| D | `FinanceServiceRequest` | pricingMode, créditos cotizados/retenidos/finales, status, `taxTreatment` |
| E | `SpecialistTaxProfile` | RUT, razón social, `taxType` (4 casos), banco, verificación admin |
| F | `SpecialistPayout` | bruto, comisión, retención, neto, documento requerido + estado, payoutStatus con bloqueo |
| G | `PlatformCommission` | comisión CLP/créditos, tasa, IVA estimado |
| H | `TaxDocument` | emisor op_spa/specialist, 6 tipos de documento, folio, neto/IVA/retención, referencias |
| I | `FinanceSubscription` | plan, créditos mensuales, ciclo, documentStatus |
| J | `AccountingExport` | periodo, tipo, estado, fileUrl |
| — | `WebhookEventRecord` / `ReconciliationAlert` | idempotencia y conciliación |

**Storage**: hoy las estructuras operan en memoria (funciones puras) y alimentan los paneles internos. **Deben migrar a storage durable (D1/Supabase) en Fase 2**; los tipos ya están listos como esquema.

## 4. Lógica de ledger (reglas duras implementadas)

1. El frontend nunca define montos finales (catálogo interno + `commercialConfig`).
2. `quote_required` no retiene créditos completos; 3. `visit_then_quote` retiene solo visita; 4. adicionales requieren aprobación (`reserveApprovedAdditional`).
5. **No se paga sin documento**: `markSpecialistPayoutReady` bloquea si el documento no está recibido/validado; `markSpecialistPayoutPaid` exige `ready_to_pay`.
6. **Webhooks idempotentes**: `reconcileWebhookEvent` por providerEventId/providerPaymentId; `confirmPayment` no duplica.
7. **No se libera más que lo reservado** (`releaseCreditsAfterCompletion` con tope).
8. Todo movimiento queda en ledger con saldo posterior; 9. todo pago traza a documento o estado pendiente (`documentStatusForIntent`).

## 5. Responsabilidades

**OP SpA**: emitir documento al cliente por cada pago; retener y enterar retención de honorarios **[VALIDAR F29/F1879]**; custodiar créditos como pasivo; liquidar contra documento; reportes y conciliación mensual; notas de crédito por reembolsos.

**Especialista**: mantener datos tributarios al día; emitir su documento a OP SpA por cada liquidación; responder por la ejecución técnica del servicio (contrato de prestación de servicios independiente — **[VALIDAR]** cláusulas anti-laboralidad).

## 6. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación técnica | Mitigación operacional | Validar con |
|---|---|---|---|---|
| Doble facturación créditos+servicio | Ingreso/IVA duplicado | Uso de créditos no genera documento; documento solo en compra | Procedimiento de emisión único | Contador |
| Créditos tratados como dinero | Regulación de prepago/fintech | No retirables, vencen, solo canjeables en plataforma | Términos y condiciones claros | Abogado |
| IVA mal aplicado | Multas, rectificaciones | neto/IVA calculado y reportado por pago | Revisión mensual contador | Contador |
| Especialistas sin formalización | Pagos sin respaldo | Payout nace **bloqueado** (`pendiente_formalizacion`) | Acompañamiento a formalización | Contador |
| Pago sin documento | Gasto no acreditable | Regla dura en `markSpecialistPayoutReady/Paid` | Checklist semanal de liquidación | Contador |
| Payout sin trazabilidad | Auditoría imposible | payout → solicitud → comisión → documento (IDs cruzados) | Reportes mensuales | — |
| Webhooks duplicados | Créditos duplicados | Idempotencia por eventId/paymentId | Alerta `duplicated_webhook` | — |
| Reembolso sin nota de crédito | IVA pagado de más | `credit_note_required` + alerta crítica | Cierre mensual revisa alertas | Contador |
| Materiales sin respaldo | Gasto rechazado | Adicional aprobado + documento por definir | Política de materiales | Contador |
| Comisión vs margen confundidos | Reporte erróneo | `platform_commissions` separado del ingreso total | Definición contable escrita | Contador |
| OficiosPro como empleador | Contingencia laboral | Especialista define precios/horarios; multi-cliente | Contrato de servicios independiente | Abogado laboral |
| Responsabilidad por calidad | Garantías/reclamos | Pago protegido + evidencia de cierre | Política de garantía y disputas | Abogado |

## 7. Roadmap por fases

**Fase 1 — Piloto controlado**: créditos internos + Mercado Pago; ledger básico (implementado); documentos manuales (folios registrados a mano en `tax_documents`); payouts manuales contra boleta de honorarios; reportes CSV; solo especialistas formalizados o con boleta de honorarios.

**Fase 2 — Operación real**: wallet durable (D1/Supabase) con los tipos de `finance/types.ts`; webhooks idempotentes persistentes en Worker; reportes contables mensuales automáticos; admin financiero (implementado en UI); control de documentos tributarios; liquidaciones semiautomáticas (lotes semanales).

**Fase 3 — Escala**: facturación electrónica masiva vía proveedor DTE (SimpleAPI/Nubox/Bsale u otro) **[sin integración real aún]**; integración contable/ERP; conciliación automática contra Mercado Pago; payouts automatizados (transferencias batch); reglas tributarias por tipo de proveedor; eventual integración SII directa.

## 8. Puntos a validar con contador/tributarista

Ver lista programática en `accountantValidationPoints` (`src/lib/finance/taxModel.ts`): devengo de IVA en venta de créditos; documento y glosa correcta B2C/B2B; breakage de créditos vencidos; notas de crédito y plazos; documentación del descuento Club Hogar; viabilidad del Modelo A (documentar total + costo contra documento del especialista); tasa de retención vigente y declaración (F29/F1879); IVA de comisión si se migra a B/C; materiales y repuestos; riesgo de laboralidad; emisión de boletas de honorarios electrónicas a OP SpA; giros e inicio de actividades de OP SpA.
