# Kaizen cycle: business health lead intake evidence

## Problema

El reporte de salud del modelo quedaba en `insufficient_data` y no incorporaba los intentos tempranos de postulacion especialista ni los leads reales capturados en D1.

## Evidencia

- `reports/business-health/2026-06-22.md` declara `specialistApplicationSubmitRate`, `onboardingFrictionRate` y otras senales con muestra 0.
- Benjamin reporto intentos reales de inscripcion que no debian perderse.
- El ciclo anterior hizo visibles los intentos en `/admin/leads`; faltaba incorporarlos al radar semanal.

## Hipotesis

Si el reporte semanal lee `/api/admin/leads` y excluye datos de prueba, el equipo puede medir oferta/demanda con evidencia real temprana sin esperar solo conversion events completos.

## Metrica afectada

- `specialistApplicationSubmitRate`
- `onboardingFrictionRate`
- `specialistRegistrationAttempts`
- `requestsSent`
- `b2bDemandShare`

## Alcance

- Agregar `lead_submissions` como fuente live/local del reporte.
- Derivar metricas agregadas desde leads reales.
- Excluir datos E2E marcados como prueba.
- Documentar nuevas fuentes y metricas.

## Archivos permitidos

- `scripts/generate-business-health-report.mjs`
- `src/config/businessModelHealthThresholds.json`
- `docs/business-model-health-system.md`
- `docs/kaizen-backlog.md`
- `docs/kaizen-cycles/2026-06-24-business-health-lead-intake.md`
- `docs/kaizen-handoffs/2026-06-24-claude-business-health-lead-intake.md`

## Archivos prohibidos

- `worker/index.ts`
- `wrangler.toml`
- migraciones y D1 remoto
- pagos, checkout, Mercado Pago, precios y comision
- componentes UI con trabajo suelto no relacionado

## Criterios de aceptacion

- El reporte live consulta `/api/admin/leads?limit=100`.
- El export local acepta `reports/business-health/input/leads.json`.
- Datos marcados como `e2e_test`, `isTest`, `testRunId` o `example.com` no cuentan como traccion.
- El snapshot agrega intentos especialista, leads cliente/empresa/servicio y fallos de email.
- `npm.cmd run validate`, `npm.cmd run build`, reporte y dry-run pasan.

## Riesgo

Bajo. No modifica endpoints ni datos productivos. Solo cambia como el script calcula metricas agregadas.

## Rollback

Revertir el commit. El reporte vuelve a usar solo conversion events, especialistas y CRM.
