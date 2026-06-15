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
- Procedimiento para autorizar documentos antes de que el especialista los emita.
- Procedimiento para reclamar/rechazar documentos recibidos sin autorizacion previa.
- Validar si y como OP SpA debe revisar cesion/factoring de DTE antes de pagar.

## Comision OficiosPro

- Validar tratamiento tributario de la comision estandar 9,5% + IVA.
- Validar que la base por defecto `specialist_gross_document` sea correcta.
- Validar si en factura afecta la base debe ser documento bruto o neto.
- Validar si la comision aplica IVA en todos los segmentos.
- Validar glosa y forma de mostrar comision a especialista/admin/cliente.
- Definir si existiran minimos futuros por categoria, urgencia, empresas o servicios gestionados.
- Confirmar que la comision no reemplaza documentos tributarios del especialista ni asesoria contable.

## Payout

- Documento requerido antes de liberar pago.
- Cuenta bancaria validada.
- Politica de documentos rechazados.
- Politica de documentos duplicados, emitidos por RUT distinto o con monto distinto.
- Politica contractual que prohiba ceder/factorizar documentos a OP SpA sin autorizacion escrita.
- Politica de pagos bloqueados.
- Reporte mensual de retenciones y documentos.

## Storage y seguridad

- No almacenar cedula, selfie, cuenta bancaria completa ni documentos tributarios en storage publico.
- Confirmar storage privado y acceso admin auditado.
- Redactar datos sensibles en logs.

## Sistemas futuros

- Integracion DTE/boletas electronicas.
- Integracion o revision manual de estado SII y registro de cesion/factoring.
- Export contable mensual.
- Conciliacion Mercado Pago.
- Idempotencia ante webhooks duplicados.
- Versionado de tasas en `src/config/taxConfig.ts`.

## Decision de salida

No liberar pagos reales si algun punto critico queda pendiente. En piloto se puede operar con revision manual, payouts bloqueados y documentos externos validados por admin/contador.
