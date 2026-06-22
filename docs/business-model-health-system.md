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
- `scripts/collect-business-health-input.mjs`: lee endpoints admin live y escribe un snapshot agregado local para reportes posteriores.
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

Tambien puede leer endpoints admin existentes sin tocar Worker ni D1 si se configuran variables de entorno:

```powershell
$env:APP_BASE_URL="https://www.oficiospro.cl"
$env:ADMIN_TOKEN="TOKEN_ADMIN_REAL"
node scripts\generate-business-health-report.mjs
```

Variables admitidas:

- `BUSINESS_HEALTH_BASE_URL` o `APP_BASE_URL`: origen del sitio.
- `ADMIN_TOKEN` o `ADMIN_API_TOKEN`: token admin para endpoints existentes.
- `BUSINESS_HEALTH_SOURCE=live`: exige modo live aunque no haya export local.
- `BUSINESS_HEALTH_REQUIRE_LIVE=true`: falla si faltan base URL o token.

El token no se imprime ni queda guardado en el reporte. El reporte solo persiste metricas agregadas, fuentes y notas de integridad.

## Collector semanal seguro

Para evitar que el reporte dependa de exports manuales crudos, Codex puede preparar un input agregado desde endpoints admin existentes:

```powershell
cd C:\Users\Benjamin\oficiospro\oficiospro
$env:APP_BASE_URL="https://www.oficiospro.cl"
$env:ADMIN_TOKEN="TOKEN_ADMIN_REAL"
npm.cmd run business-health:collect
npm.cmd run business-health:report
```

El collector escribe por defecto:

```text
reports/business-health/input/latest.json
```

Ese archivo contiene solo metricas agregadas, fuentes y notas. No guarda token admin, filas crudas, nombres, telefonos, emails, RUT, documentos ni datos personales.

La carpeta `reports/business-health/input/*.json` esta ignorada por Git porque tambien puede contener exports manuales temporales. Los reportes markdown semanales siguen siendo versionables.

Si se necesita usar otro archivo de input:

```powershell
$env:BUSINESS_HEALTH_INPUT="C:\ruta\segura\latest.json"
npm.cmd run business-health:report
```

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

## Rollback del ciclo de medicion live

Si el modo live falla, borrar variables de entorno y ejecutar el script sin token para volver al comportamiento seguro de `insufficient_data`. El dashboard interno no depende de este script para cargar.
