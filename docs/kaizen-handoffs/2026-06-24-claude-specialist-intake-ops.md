# Handoff para Claude: specialist intake operations

## Contexto

Codex mejoro la visibilidad tecnica de intentos tempranos de postulacion especialista. `/admin/leads` ahora distingue los leads marcados como `registration_attempt`, `draftProfileStatus=contact_entered` o `founderStatus=lead_capturado`.

## Lo que puedes trabajar

- UX/copy del admin para que Benjamin entienda mejor que hacer con un intento capturado.
- Microcopy de seguimiento en `/admin/leads`.
- Estados vacios y mensajes operativos.
- Claridad mobile del panel admin, sin redisenar todo.

## No tocar

- `worker/index.ts`
- `wrangler.toml`
- D1 remoto
- pagos, checkout, precios, comision
- formularios publicos salvo copy menor aprobado
- datos demo como si fueran reales

## Archivos relevantes

- `src/app/admin/leads/page.tsx`
- `docs/leads-and-email.md`
- `scripts/test-specialist-intake-capture.mjs`
- `docs/kaizen-cycles/2026-06-24-specialist-intake-ops.md`

## Criterios UX sugeridos

- Que el badge `Intento capturado` se entienda en menos de 5 segundos.
- Que el admin sepa que debe contactar antes de 24 h.
- Que los datos de prueba con badge `Test` no parezcan oportunidades reales.
- Mantener densidad del panel y no convertirlo en una landing.

## Validaciones esperadas

- `npm.cmd run validate`
- `npm.cmd run build`
- `npx.cmd wrangler deploy --dry-run --assets ./out`
