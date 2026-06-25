# Kaizen cycle: pilot readiness check

## Problema

OficiosPro avanza rapido con Codex y Claude en paralelo. Antes de deploy o merge, Benjamin necesita una verificacion repetible de rutas publicas, SEO, admin y CRM para evitar regresiones.

## Evidencia

- Se han hecho multiples cambios en captacion, admin, CRM, SEO y UI.
- El worktree actual tiene cambios concurrentes de Claude.
- El checklist manual existe, pero faltaba una herramienta que deje reporte operativo.

## Hipotesis

Un script de readiness reduce errores de deploy y hace mas facil decidir si una rama puede pasar a PR/main.

## Alcance

- Crear `scripts/pilot-readiness-check.mjs`.
- Crear documentacion de uso.
- Generar reportes anonimizados en `reports/pilot-readiness`.
- No tocar Worker, D1, pagos, UI ni rutas productivas.

## Criterios de aceptacion

- Modo offline funciona sin red ni token.
- Modo live revisa rutas publicas.
- Admin checks se saltan si no hay token.
- Admin checks se saltan con warning si el token parece placeholder.
- Write checks estan desactivados por defecto.
- El reporte no persiste secretos ni PII.

## Validacion

- `node --check scripts/pilot-readiness-check.mjs`
- `node scripts/pilot-readiness-check.mjs --offline`
- `npm.cmd run validate`
- `npm.cmd run build`
- `npx.cmd wrangler deploy --dry-run --assets ./out`

## Rollback

Revertir el commit del ciclo. No afecta runtime.
