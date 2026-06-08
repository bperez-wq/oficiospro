# Credit Finance Ledger

## Objetivo

El ledger de créditos permite separar experiencia de cliente y operación interna. El cliente ve créditos. El especialista declara tarifa esperada en CLP. OficiosPro calcula créditos, retenciones, payout y margen según reglas internas administrables.

La contabilidad final debe validarse con contador.

## Estados Principales

- Créditos comprados: créditos cargados por suscripción o compra puntual.
- Créditos disponibles: saldo que el cliente puede usar.
- Créditos retenidos: saldo bloqueado al reservar o aceptar una propuesta.
- Créditos usados: créditos consumidos por un servicio cerrado.
- Créditos devueltos: créditos liberados por cancelación, ajuste o reversa.
- Créditos expirados: créditos vencidos según términos de vigencia.
- Payout especialista: monto CLP que corresponde revisar y pagar.
- Margen plataforma: diferencia estimada entre valor cliente y payout, menos costos según configuración.
- Ingresos por servicio cerrado: ingreso reconocible cuando corresponde, sujeto a validación contable.
- Saldo no utilizado: créditos disponibles y retenidos que aún representan obligación operacional.

## Eventos Del Ledger

Eventos preparados en `src/data/financeModel.ts`:

- `credit_purchased`
- `credit_reserved`
- `credit_redeemed`
- `credit_released`
- `credit_refunded`
- `credit_expired`
- `specialist_payout_pending`
- `specialist_payout_paid`
- `platform_fee_recognized`
- `invoice_pending`
- `invoice_issued`
- `boleta_pending`
- `boleta_received`

## Reglas De Visibilidad

Cliente:

- Ve créditos, servicios, retenciones, uso y devoluciones.
- No ve margen interno ni configuración comercial.

Especialista:

- Declara tarifa esperada en CLP.
- Puede ver estado de pago y documentación pendiente cuando corresponda.
- No controla créditos cliente ni margen plataforma.

Admin/backend:

- Ve CLP, créditos, payout, margen, documento tributario y ledger.
- Ajusta reglas comerciales y revisa excepciones.

## Reportes Admin

Reportes mínimos:

- Créditos comprados por periodo.
- Créditos disponibles por cliente/empresa.
- Créditos retenidos por reserva.
- Créditos usados por servicio cerrado.
- Créditos expirados.
- Payouts pendientes y pagados.
- Margen estimado por categoría/comuna.
- Documentos tributarios pendientes.
- Saldo no utilizado.

## Validación Contable

Antes de escalar, validar:

- Tratamiento de créditos como prepago, saldo o beneficio contractual.
- Momento de reconocimiento de ingreso.
- Tratamiento de expiración.
- Emisión de boleta/factura.
- Documentación requerida al especialista.
- Reversas, garantías y disputas.
