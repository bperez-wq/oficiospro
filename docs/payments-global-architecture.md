# Arquitectura global de pagos y creditos

OficiosPro mantiene el frontend como Next static export y usa el Worker de Cloudflare para operaciones seguras de pagos, creditos y conciliacion. El frontend nunca recibe secrets de proveedores y no define precios finales: el Worker calcula montos desde catalogo interno.

## Comercio

- Razon social: OP SpA
- RUT: 78.444.059-1
- Nombre de fantasia: OficiosPro SpA
- Fecha de constitucion: 10 de junio de 2026
- Objeto: plataforma digital para intermediacion de servicios tecnicos, verificacion de proveedores, reputacion, pagos electronicos y suscripciones recurrentes.

## Capas creadas

- `src/lib/payments/types.ts`: contratos de `PaymentProvider`, `PaymentIntent`, `CreditLedgerEntry`, `CartItem`, `CreditWallet` y paquetes de creditos.
- `src/lib/payments/paymentProvider.ts`: catalogo de proveedores, datos de OP SpA, paquetes de creditos y creacion de intents desde catalogo.
- `src/lib/payments/mercadoPagoProvider.ts`: payloads, normalizacion de estado e idempotencia para Mercado Pago.
- `src/lib/payments/transbankWebpayProvider.ts`: stub preparado para Webpay, pendiente credenciales.
- `src/lib/payments/ledger.ts`: operaciones de wallet y ledger.
- `src/lib/payments/cart.ts`: totales y modo de checkout por carrito.

## Flujo compra de creditos

1. El cliente agrega un paquete global (`credits-20`, `credits-50`, `credits-100`) o lo selecciona en `/checkout`.
2. El carrito conserva `credits` y `amountCLP`, pero el Worker vuelve a validar contra catalogo interno.
3. `/api/payments/create-checkout` crea un `PaymentIntent` de tipo `credit_pack`.
4. Mercado Pago recibe solo el monto calculado por backend.
5. El webhook confirma el pago y debe emitir creditos mediante ledger una vez persistida la idempotencia.

## Flujo suscripcion

1. El usuario elige plan Club Hogar o Empresas.
2. `/checkout?plan=<planId>` muestra plan, creditos mensuales, CLP y datos de OP SpA.
3. `/api/payments/create-subscription` crea `PaymentIntent` de tipo `subscription_plan`.
4. Mercado Pago crea la preaprobacion.
5. Cada renovacion aprobada debe emitir `subscription_credits_issued` en ledger.

## Flujo reserva de servicio

1. La reserva agrega item al carrito segun `pricingMode`.
2. `fixed` y `hourly` pueden reservar creditos iniciales.
3. `quote_required` no retiene todo antes de aprobacion.
4. `visit_then_quote` retiene solo `visitCredits`.
5. Club Hogar puede descontar 2 creditos por solicitud si aplica.

## Flujo adicional

1. Un adicional aprobado se agrega como `additional_charge`.
2. El checkout lo trata como cargo adicional y lo concilia como retencion/captura separada.
3. El admin puede revisar movimientos retenidos, liberados y reembolsados.

## Mercado Pago

Endpoints actuales:

- `POST /api/payments/create-checkout`
- `POST /api/payments/create-subscription`
- `POST /api/payments/webhook`
- `GET /api/payments/status`

Reglas:

- No confiar en precios enviados desde frontend.
- Validar `planId`, `creditPackId` o `creditsPack` contra catalogo interno.
- Crear `PaymentIntent` antes de llamar al proveedor.
- Usar `external_reference` con el id interno del intent.
- Webhook idempotente por `mercado_pago:{topic}:{dataId}`.
- Si falta `MERCADOPAGO_WEBHOOK_SECRET`, no se debe aprobar pago real automaticamente en produccion.
- No loguear tokens ni payloads sensibles.

## Transbank Webpay

El provider queda preparado en `transbankWebpayProvider.ts` con:

- `createTransaction()`
- `confirmTransaction()`
- `refundTransaction()`
- `getTransactionStatus()`

Estado visible en admin: `Transbank preparado, pendiente credenciales.`

Variables futuras:

- `TRANSBANK_COMMERCE_CODE`
- `TRANSBANK_API_KEY`
- `TRANSBANK_ENV`

## Wallet y ledger

`CreditWallet`:

- `userId`
- `availableCredits`
- `reservedCredits`
- `expiringCredits`
- `lifetimePurchased`
- `lifetimeUsed`

Operaciones:

- `issueCredits()`: aumenta disponibles y comprados.
- `reserveCredits()`: baja disponibles y sube reservados.
- `releaseReservedCredits()`: devuelve creditos reservados a disponibles.
- `refundCredits()`: aumenta disponibles por reembolso.
- `expireCredits()`: baja disponibles y creditos por expirar.
- `adminAdjustCredits()`: ajuste interno controlado.

## Admin pagos y creditos

`/admin`, seccion `Pagos y creditos`, muestra:

- pagos pendientes, aprobados y rechazados
- creditos emitidos, retenidos y liberados
- pagos sin webhook
- errores de proveedor
- proveedor usado
- conciliacion manual
- acciones de ajuste, reembolso, reintento de conciliacion, marcar revisado y exportar CSV

## Variables necesarias

Mercado Pago:

- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_PUBLIC_KEY`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `APP_BASE_URL=https://oficiospro.cl`

Transbank futuro:

- `TRANSBANK_COMMERCE_CODE`
- `TRANSBANK_API_KEY`
- `TRANSBANK_ENV`

Admin:

- `ADMIN_API_TOKEN`
- `ADMIN_TOKEN` solo compatibilidad legacy

## Estados de pago

- `pending`
- `approved`
- `rejected`
- `cancelled`
- `refunded`
- `preparing` para proveedor sin credenciales o integracion incompleta.

## Pendientes antes de produccion real

- Persistir `PaymentIntent`, webhooks, wallets y ledger en D1/KV o base transaccional durable.
- Guardar idempotency keys antes de emitir creditos.
- Completar conciliacion real de Mercado Pago contra API de pagos/preapproval.
- Activar secretos reales en Cloudflare.
- Definir proceso contable de factura/boleta, reversas y chargebacks.
- Implementar Webpay solo cuando existan credenciales y pruebas de integracion.
- Reemplazar aprobaciones locales por autorizacion backend con roles reales.
