# Checklist de validacion contador/SII

Antes de abrir pagos reales a especialistas, validar y documentar:

## OficiosPro al cliente

- Documento correcto por compra de creditos B2C.
- Documento correcto por compra empresa B2B.
- Tratamiento de Club Hogar como suscripcion mensual.
- Momento de devengo al vender creditos, usar creditos o vencer creditos.
- Glosas de boletas/facturas.
- Notas de credito para reembolsos.

## Especialista a OP SpA

- Si boleta de honorarios aplica segun actividad.
- Tasa de retencion vigente por ano comercial.
- Si OP SpA debe retener y enterar la retencion.
- Si factura afecta o exenta aplica por giro del especialista.
- Datos reales de receptor OP SpA: razon social, RUT, giro, direccion y email.
- Requisitos de respaldo para materiales y repuestos.

## Payout

- Documento requerido antes de liberar pago.
- Cuenta bancaria validada.
- Politica de documentos rechazados.
- Politica de pagos bloqueados.
- Reporte mensual de retenciones y documentos.

## Storage y seguridad

- No almacenar cedula, selfie, cuenta bancaria completa ni documentos tributarios en storage publico.
- Confirmar storage privado y acceso admin auditado.
- Redactar datos sensibles en logs.

## Sistemas futuros

- Integracion DTE/boletas electronicas.
- Export contable mensual.
- Conciliacion Mercado Pago.
- Idempotencia ante webhooks duplicados.
- Versionado de tasas en `src/config/taxConfig.ts`.

## Decision de salida

No liberar pagos reales si algun punto critico queda pendiente. En piloto se puede operar con revision manual, payouts bloqueados y documentos externos validados por admin/contador.
