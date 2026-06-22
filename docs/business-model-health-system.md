# Business model health system

## Objetivo

El sistema de salud del modelo evalua semanalmente si OficiosPro esta acumulando traccion real en oferta, demanda, liquidez, economia y confianza. No cambia precios, comisiones, cobros ni condiciones comerciales: solo calcula estado, alerta riesgos y prepara experimentos.

## Archivos principales

- `src/config/businessModelHealthConfig.ts`: exporta configuracion central.
- `src/config/businessModelHealthThresholds.json`: contiene dimensiones y umbrales editables.
- `src/lib/businessHealth/types.ts`: tipos de estado, umbrales, snapshot, alertas, recomendaciones y experimentos.
- `src/lib/businessHealth/businessHealthCalculator.ts`: calculadora pura y deterministica.
- `src/lib/businessHealth/modelRecommendations.ts`: reglas transparentes de recomendacion.
- `src/data/growthExperiments.ts`: registro inicial de experimentos.
- `scripts/generate-business-health-report.mjs`: genera reporte semanal.
- `/admin/crm/business-health`: dashboard interno con datos reales o insuficiencia de datos.

## Estados

- `healthy`: no hay alertas con muestra suficiente.
- `watch`: hay senales tempranas, oportunidades o datos parciales.
- `warning`: hay riesgo relevante con muestra suficiente.
- `critical`: hay riesgo fuerte con muestra suficiente.
- `insufficient_data`: no hay evidencia suficiente para concluir.

## Dimensiones

| Dimension | Que evalua |
| --- | --- |
| Oferta | visitas a fundadores, clicks, registros, postulaciones, aprobaciones, publicados, cobertura y completitud |
| Demanda | visitas a especialistas, busquedas, perfiles vistos, Bolsa, cotizaciones, solicitudes y servicios |
| Liquidez | demanda sin oferta, oferta sin solicitudes, respuesta, resultados y conversion marketplace |
| Economia | GMV, comision neta, take rate, costo variable, margen, CAC, recurrencia, creditos y planes |
| Confianza/operacion | validacion, SLA, errores, reclamos, cancelaciones, pagos bloqueados, documentos, fraude y NPS |

## Regla de evidencia

No se presentan conclusiones fuertes si la muestra no alcanza `minimumSampleSize`. En ese caso el estado de la senal es `insufficient_data` y la prioridad recomendada es mejorar medicion.

## Fuentes de datos

El dashboard lee endpoints admin existentes con `ADMIN_TOKEN`:

- `/api/admin/conversion-events`
- `/api/admin/specialists`
- `/api/admin/crm/opportunities`
- `/api/admin/crm/tasks`
- `/api/admin/crm/overview`

El script puede leer export local desde:

- `reports/business-health/input/latest.json`
- `reports/business-health/input/conversion-events.json`
- `reports/business-health/input/specialists.json`
- `reports/business-health/input/opportunities.json`
- `reports/business-health/input/tasks.json`
- `reports/business-health/input/overview.json`

Si no hay export local, el reporte declara `insufficient_data`.

## Uso semanal

```powershell
cd C:\Users\Benjamin\oficiospro\oficiospro
node scripts\generate-business-health-report.mjs
```

El archivo queda en:

```text
reports/business-health/YYYY-MM-DD.md
```

## Autoridad

El sistema puede automatizar analisis, reportes, backlog y paquetes de trabajo. No puede automatizar cambios de precio, comision, cobros, contratos, legal/tributario, Worker, D1, pagos productivos, alianzas ni lanzamientos masivos.

