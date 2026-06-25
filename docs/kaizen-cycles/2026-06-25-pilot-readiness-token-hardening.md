# Kaizen cycle: pilot readiness token hardening

## Problema

El readiness check trataba cualquier valor en `ADMIN_TOKEN` como token real. Cuando se ejecutaba con placeholders como `TU_TOKEN_REAL`, los checks admin devolvian 401 y el reporte parecia una falla de Cloudflare o CRM.

## Evidencia

Corrida PowerShell del 2026-06-25:

- public checks: 9 OK
- admin checks: 401 unauthorized
- causa probable: `ADMIN_TOKEN="TU_TOKEN_REAL"`

## Hipotesis

Si el script detecta placeholders y los trata como token ausente, Benjamin puede distinguir entre "me falta configurar token" y "admin/CRM realmente falla".

## Alcance

- Detectar placeholders comunes en `ADMIN_TOKEN` / `ADMIN_API_TOKEN`.
- Omitir admin checks con warning cuando el token es placeholder.
- Exigir token admin real para write checks y pedir cleanup automatico.
- Agregar alias `npm run pilot:readiness`.
- Ignorar reportes diarios generados en `reports/pilot-readiness/*.md`.
- Actualizar documentacion.

## Criterios de aceptacion

- `TU_TOKEN_REAL`, `VALOR_REAL`, `PEGA_` y similares no disparan requests admin.
- El reporte muestra warning, no error critico, cuando el admin token es placeholder.
- El flujo con token real sigue ejecutando checks admin.
- Los write checks quedan marcados como `e2e_test` y solicitan cleanup.
- Validate/build/dry-run pasan.

## Rollback

Revertir el commit. No afecta runtime productivo.
