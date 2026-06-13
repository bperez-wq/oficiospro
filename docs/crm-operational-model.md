# CRM Operational Model

## Objetivo

El CRM operacional centraliza el trabajo interno de OficiosPro para pasar de piloto a operacion real: seguimiento de leads, postulantes, especialistas, cotizaciones virtuales, empresas, pagos, tareas, notas y auditoria.

## Auditoria inicial

- Datos reales disponibles: `lead_submissions`, `specialist_applications`, `service_requests`, `company_leads`, `customer_leads`, `payment_intents`, `credit_wallets`, `specialist_payouts`, `virtual_quote_requests` y tablas asociadas.
- Admin real parcial: `/admin/leads`, `/admin/virtual-quotes`, `/admin/payments`, `/admin/credits`, `/admin/payouts`, `/admin/security`, `/admin/specialists`.
- Admin legacy: `AdminPanel` conserva pantallas con storage local para operacion visual y fallback. En produccion no debe sembrar demo si `NEXT_PUBLIC_SHOW_DEMO_DATA` no esta activo.
- CRM nuevo: no usa datos demo como reales. Si no hay datos en D1, muestra estados vacios.

## Entidades CRM

- `crm_contacts`: personas, clientes, especialistas o contactos de empresa.
- `crm_companies`: empresas, comunidades, administradores y comercios.
- `crm_opportunities`: unidad operacional principal. Puede vincular lead, especialista, empresa, solicitud, pago o cotizacion virtual.
- `crm_tasks`: tareas internas accionables.
- `crm_notes`: notas internas por entidad.
- `crm_activity_log`: historial de acciones admin.
- `crm_status_history`: cambios de estado.
- `crm_tags` y `crm_entity_tags`: etiquetado futuro.
- `crm_saved_views`: vistas guardadas de operacion.

## Pipelines

- Clientes: `nuevo`, `contactado`, `diagnosticando`, `cotizacion_enviada`, `aprobado`, `servicio_en_proceso`, `completado`, `perdido`.
- Especialistas: `postulacion_recibida`, `revision_inicial`, `falta_informacion`, `validacion`, `aprobado`, `publicado`, `suspendido`, `rechazado`.
- Empresas: `nuevo`, `contactado`, `reunion`, `propuesta`, `negociacion`, `ganado`, `perdido`.
- Pagos/creditos: `pendiente`, `confirmado`, `requiere_conciliacion`, `problema`, `reembolsado`, `cerrado`.
- Cotizaciones virtuales: `recibido`, `falta_info`, `especialista_revisando`, `propuesta_enviada`, `aprobado_cliente`, `rechazado_cliente`, `convertido_checkout`.

## Migracion

Nueva migracion:

`migrations/0005_crm_operations.sql`

Debe aplicarse en Cloudflare D1 despues de las migraciones existentes.

## Endpoints

Todos usan `Authorization: Bearer ADMIN_TOKEN`.

- `GET /api/admin/crm/overview`
- `GET /api/admin/crm/opportunities`
- `POST /api/admin/crm/opportunities`
- `GET /api/admin/crm/opportunities/:id`
- `PATCH /api/admin/crm/opportunities/:id`
- `GET /api/admin/crm/tasks`
- `POST /api/admin/crm/tasks`
- `PATCH /api/admin/crm/tasks/:id`
- `GET /api/admin/crm/notes`
- `POST /api/admin/crm/notes`
- `GET /api/admin/crm/activity`
- `GET /api/admin/crm/contacts`
- `GET /api/admin/crm/companies`
- `POST /api/admin/crm/sync-leads`
- `POST /api/admin/crm/sync-specialists`
- `POST /api/admin/crm/sync-virtual-quotes`

## Rutas admin

- `/admin/crm`
- `/admin/crm/opportunities`
- `/admin/crm/tasks`
- `/admin/crm/contacts`
- `/admin/crm/companies`
- `/admin/crm/pipeline`
- `/admin/crm/activity`

## Sincronizacion

La sincronizacion es manual desde el dashboard CRM para evitar sorpresas operacionales.

- Leads: lee `lead_submissions`, crea/actualiza `crm_contacts`, `crm_companies` cuando corresponde y oportunidades.
- Especialistas: lee `specialist_applications`, crea contactos de tipo especialista y oportunidades de onboarding.
- Cotizaciones virtuales: lee `virtual_quote_requests`, crea contactos cliente y oportunidades de seguimiento.

Las oportunidades se crean con IDs deterministas para evitar duplicados.

## Operacion diaria

1. Entrar a `/admin/crm`.
2. Sincronizar leads, especialistas y cotizaciones.
3. Revisar KPIs: leads nuevos, tareas vencidas, cotizaciones pendientes y pagos con problema.
4. Pasar a `/admin/crm/opportunities`.
5. Filtrar por pipeline, stage o prioridad.
6. Abrir oportunidad, crear tarea o agregar nota.
7. Actualizar stage/status despues de cada contacto.
8. Exportar CSV cuando se necesite seguimiento externo o cierre diario.

## Control de datos demo

El CRM no hace seed automatico de personas, oportunidades ni tareas. En produccion vacio significa empty state.

La data demo del marketplace publico sigue separada de la capa CRM. No se trata como dato operacional real.

## Para escalar a 1.000 especialistas

Faltan capas futuras:

- Roles admin reales por usuario, no solo token.
- Automatizacion de sync al crear lead/postulacion/cotizacion.
- Busqueda full text y paginacion avanzada.
- Asignacion por equipo y SLA.
- Webhooks internos para pagos con problema.
- Storage privado para documentos y evidencia.
- Auditoria mas granular con actor nominal.
- Reportes contables y BI.
