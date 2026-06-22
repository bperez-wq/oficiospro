# Experiment registry

## Proposito

El registro de experimentos evita cambios impulsivos de modelo. Cada experimento debe tener hipotesis, segmento, metrica primaria, guardrails y decision antes de tocar precios reales o cobros.

## Fuente actual

El registro inicial vive en:

```text
src/data/growthExperiments.ts
```

No se creo estructura D1 en esta iteracion porque el objetivo es operar con bajo riesgo sin tocar Worker ni migraciones.

## Campos obligatorios

- `id`
- `title`
- `type`
- `hypothesis`
- `problem`
- `segment`
- `modelVariant`
- `owner`
- `status`
- `startDate`
- `endDate`
- `primaryMetric`
- `baseline`
- `target`
- `guardrailMetrics`
- `result`
- `decision`
- `learning`
- `approvalRequired`

## Estados

- `proposed`
- `approved`
- `running`
- `completed`
- `stopped`

## Tipos

- CTA/copy
- onboarding
- lead corto versus formulario completo
- WhatsApp versus formulario
- B2B versus hogar
- piloto por oficio
- piloto por comuna
- perfiles premium
- leads calificados
- plan empresa
- SaaS para especialistas
- modelo institucional
- comision versus lead fee

## Guardrails

Ningun experimento puede cambiar precios, activar cobros, modificar comision 9,5% + IVA, prometer ingresos, cambiar contratos, tocar legal/tributario o alterar pagos sin aprobacion explicita de Benjamin.

## Criterio de cierre

Un experimento se cierra con:

- muestra observada
- resultado versus baseline
- decision
- aprendizaje
- siguiente accion
- si escala, aprobacion requerida

