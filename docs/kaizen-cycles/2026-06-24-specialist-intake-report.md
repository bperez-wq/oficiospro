# Kaizen cycle: specialist intake operations report

## Problema

La plataforma ya captura intentos de postulacion especialista, pero Benjamin necesita una forma diaria de saber que oportunidades estan abiertas, cuales se vencieron y donde debe enfocar seguimiento.

## Evidencia

- Benjamin reporto que personas intentaron inscribirse y no se vio seguimiento operativo inmediato.
- Ciclos previos agregaron captura temprana y visibilidad en `/admin/leads`.
- Falta una rutina fuera de UI para revisar el backlog diario sin guardar PII en el repo.

## Hipotesis

Si existe un reporte operativo anonimizado, se reduce el riesgo de perder oportunidades y se mejora el tiempo a primer contacto.

## Metrica afectada

- `needsFirstContact`
- `overdue24h`
- `overdue72h`
- `openRegistrationAttempts`
- tiempo a primer contacto

## Alcance

- Agregar `npm run ops:specialist-intake`.
- Consultar `/api/admin/leads?leadType=specialist_application&limit=100` si hay `APP_BASE_URL` y `ADMIN_TOKEN`.
- Permitir input local con `SPECIALIST_INTAKE_INPUT`.
- Generar reporte anonimizado en `reports/specialist-intake/YYYY-MM-DD.md`.
- Documentar playbook diario.

## Archivos permitidos

- `scripts/generate-specialist-intake-report.mjs`
- `package.json`
- `docs/specialist-intake-operations.md`
- `docs/kaizen-backlog.md`
- `docs/kaizen-cycles/2026-06-24-specialist-intake-report.md`
- `docs/kaizen-handoffs/2026-06-24-claude-specialist-intake-report.md`

## Archivos prohibidos

- `worker/index.ts`
- `wrangler.toml`
- D1 remoto o migraciones
- pagos, checkout, Mercado Pago, precios y comision
- UI sucia de otros ciclos

## Criterios de aceptacion

- El script no persiste nombres, telefonos ni emails.
- Excluye datos marcados como test.
- Reporta vencidos 24 h y 72 h.
- Agrupa por oficio y comuna.
- `validate`, `build`, dry-run y sintaxis pasan.

## Rollback

Revertir el commit del ciclo. No afecta datos productivos.
