# Modelo de formalizacion asistida de especialistas

Estado: operativo referencial, pendiente de validacion contador/SII antes de pagos reales.

## Flujo recomendado

1. Cliente compra creditos o paga Club Hogar a OficiosPro.
2. OficiosPro emite el documento tributario al cliente por la compra o suscripcion, segun corresponda.
3. Los creditos quedan disponibles o retenidos por pago protegido.
4. El especialista ejecuta el servicio.
5. OficiosPro calcula liquidacion referencial desde tarifa declarada, regla comercial y tipo tributario.
6. El especialista emite documento a OP SpA:
   - boleta de honorarios,
   - factura afecta,
   - o factura exenta.
7. Admin valida documento, perfil tributario, cuenta bancaria y revision contador/SII.
8. Solo con documento validado el payout puede pasar a listo para pago.

## Comision OficiosPro

La comision estandar de plataforma queda definida como **9,5% + IVA**.

Se calcula desde `src/config/taxConfig.ts`:

- `platformCommission.standardRate = 0.095`.
- `platformCommission.ivaApplies = true`.
- `platformCommission.commissionBaseMode = specialist_gross_document`.
- `platformCommission.minimumCommissionCLP = 0`.

Base por defecto:

`commissionBaseCLP = specialistGrossDocumentCLP`

La comision financia tecnologia, CRM, soporte, operacion, pago protegido, formalizacion asistida, gestion administrativa, validacion, seguimiento comercial y cotizacion virtual.

Calculo referencial sujeto a validacion contable/SII.

## Estados clave

- `unknown`: especialista aun no sabe como documentar; payout bloqueado.
- `pending_secure_storage`: no hay storage privado para archivos sensibles; no subir cedula/selfie/documentos reales.
- `pending_accountant_review`: falta revision contable.
- `pending_sii_validation`: falta validar capacidad SII.
- `verified`: perfil tributario validado para operar.

## Vistas agregadas

- Registro especialista: paso "Formalizacion" para declarar documento posible.
- Dashboard especialista: seccion "Formalizacion y cobro".
- Admin: `/admin/formalizacion`, con calculadora interna y estado vacio real.
- Publico: `/formalizacion`, pagina informativa con calculadora referencial.

## Restricciones

- No se emiten documentos reales desde la app.
- No se liberan pagos reales desde estas pantallas.
- No se almacenan archivos sensibles si no existe storage privado.
- Los calculos son referenciales y deben validarse antes de operar.
