# Kaizen cycle - business health measurement

## Problema

El reporte semanal de salud del modelo queda en `insufficient_data` cuando no existe un export local manual en `reports/business-health/input`.

## Evidencia

El reporte `reports/business-health/2026-06-22.md` indica:

- Estado global: `insufficient_data`.
- 0 alertas concluyentes.
- 7 senales insuficientes.
- Fuente: "Sin export local. Todavia no medible."

## Hipotesis

Si el generador puede leer endpoints admin existentes con `APP_BASE_URL` y `ADMIN_TOKEN`, el ciclo semanal puede calcular metricas agregadas reales sin tocar Worker, D1 ni migraciones.

## Metrica afectada

`specialistApplicationSubmitRate`, como metrica prioritaria del reporte, y conteo de `insufficientSignals` como metrica de integridad de datos.

## Alcance

- Agregar fuente live opcional al script de reporte.
- Mantener fallback seguro a `insufficient_data` si no hay token/base URL.
- No persistir filas crudas ni datos personales.
- Documentar uso y rollback.
- Agregar handoff para Claude.

## Archivos permitidos

- `scripts/generate-business-health-report.mjs`
- `docs/business-model-health-system.md`
- `docs/kaizen-backlog.md`
- `docs/kaizen-cycles/*`
- `docs/kaizen-handoffs/*`
- `reports/business-health/*.md`

## Archivos prohibidos

- `worker/index.ts`
- `wrangler.toml`
- `migrations/*`
- pagos, checkout, Mercado Pago
- contratos, legal, tributario
- datos sensibles o credenciales

## Criterios de aceptacion

- El script sigue generando reporte sin token.
- Si hay `APP_BASE_URL` y `ADMIN_TOKEN`, lee endpoints admin existentes.
- El token no se imprime ni se escribe en archivos.
- El reporte solo guarda metricas agregadas y notas de integridad.
- `npm.cmd run validate` pasa.
- `npm.cmd run build` pasa.
- `npx.cmd wrangler deploy --dry-run --assets ./out` pasa.

## Pruebas

- `node scripts\generate-business-health-report.mjs`
- `npm.cmd run validate`
- `npm.cmd run build`
- `npx.cmd wrangler deploy --dry-run --assets ./out`

## Riesgo

Riesgo bajo. El cambio es script/documentacion y lectura opcional de endpoints existentes. No cambia UI publica, Worker, D1, pagos ni modelo comercial.

## Rollback

Revertir el commit del ciclo o ejecutar el reporte sin variables live para volver a `insufficient_data`. No hay cambios remotos ni migraciones.

