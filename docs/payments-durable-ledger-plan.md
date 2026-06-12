# Payments Durable Ledger Plan

## Estado Actual

- Checkout crea preferencias/suscripciones Mercado Pago si hay credenciales.
- Frontend conserva registros locales para experiencia piloto.
- Worker valida proveedor, crea `paymentIntent` en memoria y responde `preparing` si faltan credenciales.
- Nueva fundacion persiste best-effort en `payment_intents`, `webhook_events`, `credit_wallets` y `credit_ledger_entries`.

## Brechas

- Falta conciliacion completa contra API de Mercado Pago en webhook.
- Falta emision automatica de creditos solo despues de pago aprobado.
- Falta job/reporte de diferencias payment intent vs proveedor.
- Falta UI admin completa para ajustes con auditoria obligatoria.

## Reglas De Produccion

- Nunca emitir creditos desde frontend.
- Nunca emitir creditos si webhook no esta confirmado.
- No duplicar creditos con webhook repetido.
- `quote_required` no retiene total.
- `visit_then_quote` retiene solo visita.
- Adicionales requieren aprobacion del cliente.
- Todo ajuste admin crea ledger y audit log.

## Acciones

1. Aplicar migracion `0003`.
2. Persistir `payment_intents` antes de redirigir a proveedor.
3. Guardar `webhook_events` con idempotencia durable.
4. Consultar proveedor para confirmar `approved`.
5. Emitir ledger `credits_purchased` o `subscription_credits_issued`.
6. Actualizar `credit_wallets`.
7. Exponer reportes en `/admin/payments`, `/admin/credits`, `/admin/security`.

## Go/No-Go Piloto

Go si el checkout captura interes y redirige a Mercado Pago, pero los creditos se comunican como activados solo tras confirmacion.

## Go/No-Go 1.000 Especialistas

No-Go si un pago aprobado no genera ledger durable o si un webhook duplicado puede emitir creditos dos veces.
