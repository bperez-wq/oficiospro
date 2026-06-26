# Handoff para Claude: specialist intake operations report

## Contexto

Codex agrego un reporte diario para oportunidades de postulacion especialista. El reporte es anonimizado y apunta a operacion: que contactar hoy, que se vencio y donde hay concentracion por oficio/comuna.

## Lo que puedes trabajar

- Copy y claridad del playbook en `docs/specialist-intake-operations.md`.
- Microcopy en `/admin/leads` para alinear los estados con el reporte.
- UX de seguimiento sin tocar backend.

## No tocar

- `worker/index.ts`
- `wrangler.toml`
- D1 remoto
- pagos, checkout, precios, comision
- datos personales en reportes

## Archivos relevantes

- `scripts/generate-specialist-intake-report.mjs`
- `docs/specialist-intake-operations.md`
- `src/app/admin/leads/page.tsx`

## Criterio UX sugerido

Benjamin debe poder entender en menos de 30 segundos que oportunidades debe contactar hoy y cuales estan vencidas.
