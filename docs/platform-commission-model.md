# Modelo de comision OficiosPro

Estado: regla operacional referencial, pendiente de validacion contable/SII.

## Regla estandar

OficiosPro aplica una comision estandar de plataforma de **9,5% + IVA**.

La tasa no esta hardcodeada en formulas. Vive en:

`src/config/taxConfig.ts`

Campos relevantes:

- `platformCommission.standardRate`
- `platformCommission.ivaApplies`
- `platformCommission.minimumCommissionCLP`
- `platformCommission.maximumCommissionCLP`
- `platformCommission.commissionBaseMode`

## Que financia

La comision financia:

- tecnologia,
- CRM,
- soporte,
- operacion,
- pago protegido,
- formalizacion asistida,
- gestion administrativa,
- validacion,
- seguimiento comercial,
- cotizacion virtual.

## Base de calculo

Base por defecto:

`commissionBaseCLP = specialistGrossDocumentCLP`

Modo configurado:

`specialist_gross_document`

Esto significa:

- Boleta de honorarios: comision sobre monto bruto de boleta.
- Factura afecta: comision sobre total documento especialista por defecto.
- Factura exenta: comision sobre documento exento.
- Tipo tributario desconocido: no se calcula comision definitiva.

La base debe validarse con contador. Si contabilidad define otra base, cambiar `commissionBaseMode` y versionar config.

## Formula

```text
platformCommissionNetCLP = commissionBaseCLP * standardRate
platformCommissionIvaCLP = platformCommissionNetCLP * ivaRate
platformCommissionGrossCLP = platformCommissionNetCLP + platformCommissionIvaCLP

customerGrossPriceCLP =
  specialistGrossDocumentCLP
  + platformCommissionGrossCLP
  + adicionales aprobados
  + recargos configurados
  - descuentos configurados
```

Luego se convierte a creditos con `creditValueCLP` y `creditRoundingStep`.

## Helper central

Para servicios, cotizaciones aprobadas y formalizacion se debe usar:

`calculateCustomerPriceWithPlatformCommission()`

Este helper vive en:

`src/lib/finance/specialistPayoutCalculator.ts`

Y queda reutilizado por:

- formalizacion,
- calculo preliminar de creditos del especialista,
- cotizaciones/precio cliente cuando parten desde tarifa especialista,
- vistas admin que necesitan ver CLP + creditos + comision.

## Planes, packs y Club Hogar

Los planes, packs de creditos y Club Hogar son precios comerciales independientes.

La regla **Comision OficiosPro 9,5% + IVA** aplica a servicios/cotizaciones cuando se calcula el precio cliente desde el documento o tarifa del especialista. No se usa para recalcular:

- precio mensual de Club Hogar,
- packs de creditos,
- beneficios promocionales,
- compra directa de creditos.

Cada cobro de plan/pack debe documentarse al cliente segun la regla tributaria validada por contador.

## UI

Especialista:

- ve "Comision OficiosPro",
- ve "9,5% + IVA",
- ve comision neta, IVA comision y comision total,
- ve advertencia: "Calculo referencial sujeto a validacion contable/SII."

Admin:

- ve base de calculo,
- regla aplicada,
- comision neta,
- IVA comision,
- comision total,
- precio cliente,
- creditos cliente,
- bloqueo de payout si falta formalizacion.

Checkout/Bolsa:

- no se cambia logica de pago real.
- si se muestra desglose avanzado, usar "Comision OficiosPro" o "Incluye gestion de plataforma y pago protegido".
- no mostrar lenguaje de comision interna al cliente.

## Anti-factoring y documentos no autorizados

La comision no habilita al especialista a emitir documentos libremente. Todo documento emitido a OP SpA debe tener autorizacion interna previa.

Si llega un documento sin autorizacion, duplicado, con monto/emisor distinto o cedido/factorizado sin autorizacion escrita, el payout queda bloqueado y debe revisarse en `Documentos tributarios`.

## Riesgos y validaciones

- Validar con contador si la base debe ser bruto o neto por tipo de documento.
- Validar si la comision siempre afecta IVA.
- Validar tratamiento de materiales, urgencias, empresas y servicios gestionados.
- Validar glosas y documentos tributarios.
- No presentar la calculadora como asesoria tributaria definitiva.
