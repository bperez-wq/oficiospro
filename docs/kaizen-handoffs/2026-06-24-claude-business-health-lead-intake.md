# Handoff para Claude: business health lead intake

## Contexto

Codex agrego evidencia agregada de `/api/admin/leads` al reporte semanal de salud del modelo. Ahora se consideran intentos tempranos de postulacion, leads cliente/empresa/servicio y fallos de email, excluyendo datos de prueba E2E.

## Lo que puedes trabajar

- Claridad visual/copy del dashboard `/admin/crm/business-health`.
- Explicar mejor que `insufficient_data` no significa fracaso, sino muestra insuficiente.
- Mostrar de forma comprensible las nuevas metricas de intake si ya aparecen en la UI.
- Mejorar mensajes para que Benjamin sepa si debe captar mas datos o perseguir leads.

## No tocar

- `worker/index.ts`
- `wrangler.toml`
- D1 remoto
- scripts de reporte salvo copy de docs acordado
- pagos, precios, comision, checkout
- datos demo como reales

## Archivos relevantes

- `scripts/generate-business-health-report.mjs`
- `src/config/businessModelHealthThresholds.json`
- `docs/business-model-health-system.md`
- `docs/kaizen-cycles/2026-06-24-business-health-lead-intake.md`

## Criterio UX sugerido

El dashboard deberia responder rapido: cuantas senales ya tienen datos, que falta medir y cual es el siguiente paso operacional.
