# Ciclo Kaizen - Business health input seguro

## Problema

El reporte de salud del modelo puede leer endpoints live, pero no existia un collector semanal que dejara un input agregado local y reutilizable. Sin ese paso operativo, el reporte vuelve facilmente a `insufficient_data` cuando no se configuran variables live o no existe export local.

## Evidencia

- `reports/business-health/2026-06-22.md` marco estado global `insufficient_data`.
- El mismo reporte declaro fuente: "Sin export local. Todavia no medible."
- KZ-010 ya habilito lectura live, pero faltaba una forma segura de persistir solo agregados para uso semanal.

## Hipotesis

Si existe un collector seguro que lea endpoints admin existentes y escriba solo metricas agregadas en `reports/business-health/input/latest.json`, Benjamin podra generar reportes semanales medibles sin guardar datos personales ni filas crudas.

## Metrica afectada

- Principal: `specialistApplicationSubmitRate`.
- Secundarias: `onboardingFrictionRate`, `specialistsWithCompleteProfileRate`, `requestsSent`, `b2bDemandShare`.

## Alcance

- Factorizar la construccion de snapshot en un modulo compartido.
- Agregar script `business-health:collect`.
- Ignorar JSON temporales de input para evitar commits accidentales.
- Documentar uso seguro.

## Archivos permitidos

- `scripts/business-health-snapshot.mjs`
- `scripts/collect-business-health-input.mjs`
- `scripts/generate-business-health-report.mjs`
- `package.json`
- `.gitignore`
- `docs/business-model-health-system.md`
- `docs/kaizen-backlog.md`
- `docs/kaizen-cycles/*`
- `docs/kaizen-handoffs/*`

## Archivos prohibidos

- `worker/index.ts`
- `wrangler.toml`
- migraciones D1
- pagos, Mercado Pago y checkout
- precios, comisiones y legal/tributario
- componentes visuales no relacionados

## Criterios de aceptacion

- `npm.cmd run business-health:report` sigue funcionando sin input y marca insuficiencia honestamente.
- `npm.cmd run business-health:collect` exige `APP_BASE_URL`/`BUSINESS_HEALTH_BASE_URL` y `ADMIN_TOKEN`/`ADMIN_API_TOKEN`.
- El collector no imprime ni persiste tokens.
- El collector escribe solo `metrics`, `sources`, `notes`, `generatedAt` y `windowDays`.
- `reports/business-health/input/*.json` queda ignorado por Git.
- `npm.cmd run validate`, `npm.cmd run build` y dry-run de Wrangler pasan.

## Pruebas

- Ejecutar `npm.cmd run business-health:report` sin variables.
- Ejecutar `npm.cmd run validate`.
- Ejecutar `npm.cmd run build`.
- Ejecutar `npx.cmd wrangler deploy --dry-run --assets ./out`.

## Riesgo

- Riesgo bajo: cambio en scripts y docs, sin backend productivo.
- Riesgo operacional: si el token admin es incorrecto, el collector falla y no escribe input.
- Riesgo de datos: mitigado al ignorar input JSON y escribir solo metricas agregadas.

## Rollback

- Revertir el commit del ciclo.
- Seguir usando `scripts/generate-business-health-report.mjs` con variables live o sin input para volver al comportamiento seguro de `insufficient_data`.
