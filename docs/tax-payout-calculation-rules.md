# Reglas de calculo de liquidacion especialista

Estado: reglas referenciales para software. No son asesoria tributaria, legal ni contable.

## Configuracion

Las tasas viven en `src/config/taxConfig.ts`.

No se deben incrustar tasas dentro de formulas. Si cambia IVA, retencion de honorarios u otra regla, se crea una nueva version de config y se valida con contador/SII.

## Comision OficiosPro

La regla estandar de plataforma es:

- Comision neta OficiosPro: `platformCommission.standardRate` = 9,5%.
- IVA de comision: `platformCommissionNetCLP * taxConfig.ivaRate` si `platformCommission.ivaApplies = true`.
- Comision total: comision neta + IVA comision.
- Minimo actual: `platformCommission.minimumCommissionCLP = 0`.

Esta comision financia tecnologia, operacion, soporte, CRM, pago protegido, formalizacion asistida, validacion, seguimiento comercial y cotizacion virtual.

Calculo referencial sujeto a validacion contable/SII.

## Base de calculo

Base por defecto:

`commissionBaseCLP = specialistGrossDocumentCLP`

Esto se configura con `platformCommission.commissionBaseMode = specialist_gross_document`.

Modos preparados:

- `specialist_gross_document`: monto bruto del documento del especialista.
- `specialist_net`: monto neto del documento del especialista.
- `customer_net_before_commission`: base cliente antes de comision.
- `manual`: base definida por una regla auditada.

Esta definicion debe validarse con contador antes de operar pagos reales.

## Entradas

- `specialistTargetAmountCLP`: tarifa esperada declarada por el especialista.
- `taxType`: `factura_afecta`, `boleta_honorarios`, `factura_exenta` o `unknown`.
- `commissionRule`: valor credito, redondeo y ajustes aprobados. La comision estandar vive en `taxConfig.platformCommission` y no debe duplicarse con fees legacy.
- `taxConfig`: version tributaria vigente.

## Factura afecta

Interpretacion referencial: la tarifa esperada es neta.

- Neto documento = tarifa esperada.
- IVA = neto * `ivaRate`.
- Documento bruto = neto + IVA.
- Retencion = 0.
- Liquidacion estimada = documento bruto.
- Comision OficiosPro = base configurada * 9,5%.
- IVA comision = comision neta * `ivaRate`.
- Precio cliente = documento bruto especialista + comision total.

## Boleta de honorarios

Interpretacion referencial: la tarifa esperada es liquida deseada.

- Documento bruto = tarifa esperada / (1 - `honorariosRetentionRate`).
- Retencion = documento bruto * `honorariosRetentionRate`.
- Liquidacion estimada = documento bruto - retencion.
- Documento requerido = boleta de honorarios emitida a OP SpA.
- Comision OficiosPro = monto bruto de la boleta * 9,5%.
- IVA comision = comision neta * `ivaRate`.
- Precio cliente = boleta bruta + comision total.

Ejemplo referencial con config actual:

- Liquido especialista: $25.000.
- Boleta bruta aproximada: $29.499.
- Retencion aproximada: $4.499.
- Comision neta aproximada: $2.802.
- IVA comision aproximado: $532.
- Comision total aproximada: $3.334.
- Precio cliente aproximado: $32.833.
- Creditos aproximados: 33 si `creditValueCLP = 1000`.

## Factura exenta

Interpretacion referencial: la tarifa esperada es el monto del documento.

- Documento bruto = tarifa esperada.
- IVA = 0.
- Retencion = 0.
- Liquidacion estimada = documento bruto.
- La comision OficiosPro sigue afecta a IVA si `platformCommission.ivaApplies = true`.

## Unknown

Si el tipo tributario es `unknown`:

- Documento requerido = `none`.
- `payoutAllowed = false`.
- Razon de bloqueo: `formalization_required`.
- No se muestra comision definitiva.

## Precio cliente y creditos

La calculadora agrega:

- costo bruto del documento especialista,
- comision OficiosPro neta,
- IVA de comision,
- materiales o adicionales aprobados si aplican,
- recargos configurados,
- descuentos configurados.

Luego convierte a creditos con `creditValueCLP` y redondea por `creditRoundingStep`.

Helper obligatorio para servicios/cotizaciones:

`calculateCustomerPriceWithPlatformCommission()`

Este helper calcula documento especialista, Comision OficiosPro 9,5% + IVA, precio cliente y creditos. Si se necesita partir desde precio cliente cerrado, usar `calculateSpecialistLiquidFromCustomerPrice()` solo como estimacion inversa.

## Planes, packs y Club Hogar

Club Hogar, packs de creditos y planes empresa tienen precios comerciales propios. No se recalculan aplicando 9,5% + IVA sobre el especialista porque no representan una liquidacion de servicio especifica.

Cuando esos creditos se usan en un servicio, el servicio si debe pasar por la regla de documento especialista + Comision OficiosPro.

## Bloqueos de payout

Un payout no puede liberarse si existe:

- tipo tributario desconocido,
- documento requerido faltante,
- storage privado pendiente,
- revision contador pendiente,
- validacion SII pendiente,
- revision manual admin pendiente.
- documento sin autorizacion interna previa,
- documento duplicado o con emisor/monto/receptor distinto,
- cesion, factoring o transferencia sin autorizacion escrita de OP SpA.

## UI

La UI debe decir siempre que el calculo es referencial y sujeto a validacion. El especialista no calcula impuestos manualmente; OficiosPro calcula desde reglas internas y bloquea pagos cuando falta respaldo.
