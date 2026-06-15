# Credit Finance Ledger

## Objetivo

El ledger de creditos separa experiencia de cliente y operacion interna. El cliente ve creditos. El especialista declara tarifa esperada en CLP. OficiosPro calcula creditos, retenciones, payout y Comision OficiosPro segun reglas internas administrables.

La contabilidad final debe validarse con contador.

## Estados principales

- Creditos comprados: creditos cargados por suscripcion o compra puntual.
- Creditos disponibles: saldo que el cliente puede usar.
- Creditos retenidos: saldo bloqueado al reservar o aceptar una propuesta.
- Creditos usados: creditos consumidos por un servicio cerrado.
- Creditos devueltos: creditos liberados por cancelacion, ajuste o reversa.
- Creditos expirados: creditos vencidos segun terminos de vigencia.
- Payout especialista: monto CLP que corresponde revisar y pagar.
- Comision OficiosPro: 9,5% + IVA para servicios/cotizaciones cuando se calcula desde documento o tarifa especialista.
- Ingresos por servicio cerrado: ingreso reconocible cuando corresponde, sujeto a validacion contable.
- Saldo no utilizado: creditos disponibles y retenidos que aun representan obligacion operacional.

## Eventos del ledger

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

## Reglas de visibilidad

Cliente:

- Ve creditos, servicios, retenciones, uso y devoluciones.
- No ve comision interna ni configuracion comercial.

Especialista:

- Declara tarifa esperada en CLP.
- Puede ver estado de pago y documentacion pendiente cuando corresponda.
- No controla creditos cliente ni Comision OficiosPro.

Admin/backend:

- Ve CLP, creditos, payout, Comision OficiosPro, documento tributario y ledger.
- Ajusta reglas comerciales y revisa excepciones.

## Reportes admin

Reportes minimos:

- Creditos comprados por periodo.
- Creditos disponibles por cliente/empresa.
- Creditos retenidos por reserva.
- Creditos usados por servicio cerrado.
- Creditos expirados.
- Payouts pendientes y pagados.
- Comision estimada por categoria/comuna.
- Documentos tributarios pendientes.
- Saldo no utilizado.

## Validacion contable

Antes de escalar, validar:

- Tratamiento de creditos como prepago, saldo o beneficio contractual.
- Momento de reconocimiento de ingreso.
- Tratamiento de expiracion.
- Emision de boleta/factura.
- Documentacion requerida al especialista.
- Autorizacion previa y bloqueo de documentos no autorizados.
- Reversas, garantias y disputas.
