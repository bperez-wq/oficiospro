# Reglas de calculo de liquidacion especialista

Estado: reglas referenciales para software. No son asesoria tributaria, legal ni contable.

## Configuracion

Las tasas viven en `src/config/taxConfig.ts`.

No se deben incrustar tasas dentro de formulas. Si cambia IVA, retencion de honorarios u otra regla, se crea una nueva version de config y se valida con contador/SII.

## Entradas

- `specialistTargetAmountCLP`: tarifa esperada declarada por el especialista.
- `taxType`: `factura_afecta`, `boleta_honorarios`, `factura_exenta` o `unknown`.
- `commissionRule`: comision, fee de pago, buffer, fijo, margen minimo, valor credito y redondeo.
- `taxConfig`: version tributaria vigente.

## Factura afecta

Interpretacion referencial: la tarifa esperada es neta.

- Neto documento = tarifa esperada.
- IVA = neto * `ivaRate`.
- Documento bruto = neto + IVA.
- Retencion = 0.
- Liquidacion estimada = documento bruto.

## Boleta de honorarios

Interpretacion referencial: la tarifa esperada es liquida deseada.

- Documento bruto = tarifa esperada / (1 - `honorariosRetentionRate`).
- Retencion = documento bruto * `honorariosRetentionRate`.
- Liquidacion estimada = documento bruto - retencion.
- Documento requerido = boleta de honorarios emitida a OP SpA.

## Factura exenta

Interpretacion referencial: la tarifa esperada es el monto del documento.

- Documento bruto = tarifa esperada.
- IVA = 0.
- Retencion = 0.
- Liquidacion estimada = documento bruto.

## Unknown

Si el tipo tributario es `unknown`:

- Documento requerido = `none`.
- `payoutAllowed = false`.
- Razones de bloqueo: `missing_tax_profile`, `missing_document_capability`.

## Precio cliente y creditos

La calculadora agrega:

- costo bruto del documento especialista,
- materiales si aplican,
- comision plataforma,
- fee de pago,
- buffer de riesgo,
- cargo fijo operativo.

Luego convierte a creditos con `creditValueCLP` y redondea por `creditRoundingStep`.

## Bloqueos de payout

Un payout no puede liberarse si existe:

- tipo tributario desconocido,
- documento requerido faltante,
- storage privado pendiente,
- revision contador pendiente,
- validacion SII pendiente,
- revision manual admin pendiente.

## UI

La UI debe decir siempre que el calculo es referencial y sujeto a validacion. El especialista no calcula impuestos manualmente; OficiosPro calcula desde reglas internas y bloquea pagos cuando falta respaldo.
