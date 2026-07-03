# Handoff Kaizen - Backoffice data pipeline

Fecha: 2026-07-01
Rama: `kaizen/codex-pipeline-datos`
Responsable: Codex
Actualizacion 2026-07-02: la rama fue sincronizada con `origin/main` para incluir los cambios recientes de Claude antes del PR.

## Problema

El admin clasico podia mostrar KPIs en cero o fallback local aunque D1 remoto ya tuviera leads y postulaciones reales.

## Evidencia

Consultas read-only contra D1 remoto `oficiospro-leads`:

- `lead_submissions`: 4 registros.
- `specialist_applications`: 2 registros.
- `crm_contacts`: 4 registros.
- `crm_opportunities`: 5 registros.
- `service_requests`: 0 registros.
- `company_leads`: 0 registros.
- `conversion_events`: 475 registros.

La captura de formularios no estaba completamente rota: `/api/specialists/apply` inserta en `lead_submissions`, `specialist_applications` y crea CRM best-effort en tiempo real. La causa principal diagnosticada fue H3: el panel `/admin` seguia leyendo principalmente `localStorage`.

## Cambio implementado

- `/admin` ahora carga una capa viva desde:
  - `GET /api/admin/leads?limit=100`
  - `GET /api/admin/crm/overview`
- Los KPIs criticos usan D1 cuando hay sesion/token admin:
  - especialistas pendientes
  - solicitudes nuevas
  - leads hogar
  - leads empresa
  - cotizaciones virtuales desde CRM overview
- Se agrego un bloque "Fuente de datos backoffice" para distinguir D1 activo vs fallback local.
- Se agrego "Leads D1 recientes" en el resumen.
- La seccion "Especialistas pendientes" muestra postulaciones abiertas desde D1 y enlaza a `/admin/leads` para gestionarlas.
- El fallback local queda visible solo como fallback, no como fuente real.

## Script nuevo

`scripts/backoffice-data-pipeline-check.mjs`

Uso:

```powershell
cd C:\Users\Benjamin\oficiospro\oficiospro-integration-critical-global
$env:APP_BASE_URL="https://www.oficiospro.cl"
$env:ADMIN_TOKEN="TOKEN_REAL"
npm.cmd run ops:backoffice-pipeline
```

El script es read-only y no crea datos de prueba.

## Archivos tocados

- `src/components/AdminPanel.tsx`
- `scripts/backoffice-data-pipeline-check.mjs`
- `package.json`
- `docs/kaizen-backlog.md`
- `docs/kaizen-handoffs/2026-07-01-codex-backoffice-data-pipeline.md`

## Handoff para Claude

No redisenar el panel admin. Si haces UX, enfocate en claridad visual del bloque "Fuente de datos backoffice", estados vacios y mensajes operativos. No cambies endpoints, Worker ni D1. Si necesitas mostrar mas detalle, enlaza a `/admin/leads` o `/admin/crm` en vez de duplicar acciones.

## Estado post-merge con main

- `origin/main` fue mergeado dentro de `kaizen/codex-pipeline-datos`.
- No hubo conflictos manuales; `AdminPanel.tsx` conserva la capa viva D1 de Codex y los cambios recientes de Claude que ya estaban en main.
- El PR debe apuntar a `main`. No hacer merge automatico si Benjamin no lo pide.

## Validacion 2026-07-02

- `npm.cmd run validate`: OK.
- `npm.cmd run build`: OK.
- `npx.cmd wrangler deploy --dry-run --assets ./out`: OK. Binding confirmado: `env.DB (oficiospro-leads)`.
- `npm.cmd run ops:backoffice-pipeline`: ejecutado read-only contra `https://www.oficiospro.cl`; `/api/health` OK, endpoints admin respondieron `401 unauthorized` porque esta sesion local de Codex no tenia `ADMIN_TOKEN` real configurado. Repetir desde PowerShell de Benjamin con `$env:ADMIN_TOKEN` real antes de merge/deploy final.

## Pendiente

- Ciclo B separado: endurecer seguridad admin y sesiones.
- Definir si `/admin` debe permitir acciones D1 directas o si toda gestion real queda en `/admin/leads` y `/admin/crm`.
- Crear limpieza periodica de datos de prueba si vuelven a entrar registros no reales.
