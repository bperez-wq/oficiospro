# Kaizen cycle: pilot readiness strict gate

## Problema

El readiness check podia operar en modo diagnostico y omitir admin checks cuando faltaba token real. Eso es correcto para exploracion, pero insuficiente como gate de deploy: antes de produccion, admin y CRM deben verificarse o bloquear el release.

## Evidencia

- Corrida 2026-06-25 con placeholder mostro public checks OK y admin checks omitidos.
- Para deploy real, omitir admin checks no debe equivaler a aprobacion completa.

## Hipotesis

Un modo estricto permite usar la misma herramienta en dos contextos:

- diagnostico diario: warnings si falta token.
- release gate: error critico si admin/CRM no se verifican.

## Alcance

- Agregar `--require-admin`.
- Agregar `PILOT_READINESS_REQUIRE_ADMIN=1`.
- Agregar `npm run pilot:readiness:strict`.
- Documentar el uso antes de deploy.

## Criterios de aceptacion

- Modo normal conserva warnings cuando falta token.
- Modo estricto convierte admin checks omitidos en errores.
- Placeholder token no ejecuta requests admin.
- Validate/build/dry-run pasan.

## Rollback

Revertir el commit. No afecta runtime productivo.
