# Kaizen backlog

Este backlog concentra problemas, oportunidades y decisiones de mejora continua.

Estados sugeridos:

- `observado`
- `diagnosticado`
- `priorizado`
- `en_progreso`
- `validando`
- `listo_para_deploy`
- `desplegado`
- `medido`
- `descartado`

Tipos sugeridos:

- `bug`
- `ux`
- `conversion`
- `seo`
- `crm`
- `operacion`
- `seguridad`
- `performance`
- `documentacion`
- `tech_debt`

| ID | Problema | Fuente | Impacto | Urgencia | Tipo | Responsable | Estado | Commit | Validacion | Resultado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| KZ-001 | Ejemplo: CTA confuso en mobile | Benjamin / usuario real / auditoria | medio | media | ux | Claude + Codex | observado | - | pendiente | pendiente |
| KZ-002 | Ejemplo: ruta SEO candidata sin demanda suficiente | Search Console / CRM | bajo | baja | seo | ChatGPT + Grok | diagnosticado | - | revisar score editorial | pendiente |
| KZ-003 | Trafico existe pero no hay medicion clara de conversion especialista | Cloudflare / Benjamin | alto | alta | conversion | Codex | validando | Add growth analytics and specialist conversion funnel | validate/build/dry-run | pendiente |
| KZ-004 | Especialistas necesitan respuestas seguras sin IA generativa libre | Benjamin / Kaizen | medio | media | seguridad | Codex | validando | Add controlled specialist assistant | validate/build/dry-run | pendiente |
| KZ-005 | Asistente existe pero no aparece global ni guia a acciones reales | Benjamin / Kaizen | alto | alta | conversion | Codex | validando | Add global actionable OficiosPro assistant | validate/build/dry-run | pendiente |
| KZ-006 | Embudo de captacion especialista necesita eventos finos por paso, oficio no listado y formalizacion | Benjamin / Kaizen | alto | alta | conversion | Codex | validando | Instrument specialist acquisition funnel | validate/build/dry-run | pendiente |
| KZ-007 | Eventos del funnel especialista deben verificarse end-to-end contra D1 y admin | Benjamin / Kaizen | alto | alta | conversion | Codex | validando | Verify specialist funnel events and acquisition dashboard | validate/build/dry-run/test funnel | pendiente |
| KZ-008 | Visitantes con oficio necesitan dejar datos antes de completar formulario largo | Benjamin / Kaizen | alto | alta | conversion | Codex | validando | Improve specialist lead generation and profile completion funnel | validate/build/dry-run | pendiente |
| KZ-009 | El sistema Kaizen necesita evaluar salud del modelo y preparar experimentos sin cambiar precios ni cobros | Benjamin / AI Operating System V2 | alto | alta | growth | Codex | validando | Operationalize business model health and AI Kaizen orchestration | validate/build/report/dry-run | pendiente |
| KZ-010 | Reporte de salud del modelo queda en insufficient_data si no existe export local manual | Reporte business-health 2026-06-22 | alto | alta | analytics | Codex | validando | Add live admin data source for business health reports | validate/build/report/dry-run | pendiente |
| KZ-013 | Intentos de registro especialista deben verse en admin aunque el perfil no se complete | Benjamin / incidente postulantes reales 2026-06-24 | alto | alta | crm | Codex | validando | Improve specialist intake visibility and test coverage | validate/build/dry-run/script intake | pendiente |
| KZ-014 | Salud del modelo no incorpora intentos tempranos y leads reales como muestra agregada | Reporte business-health 2026-06-22 / incidente postulantes reales | alto | alta | analytics | Codex | validando | Include lead intake evidence in business health reporting | validate/build/report/dry-run | pendiente |
| KZ-015 | Cambios de Codex y Claude se mezclan con artefactos locales o comandos ejecutados fuera del repo | Incidentes PowerShell / worktree sucio | medio | alta | operacion | Codex | validando | Add Kaizen worktree audit script | audit/validate/build/dry-run | pendiente |
| KZ-016 | Intentos de postulacion necesitan cola diaria de seguimiento sin exponer datos personales en reportes | Incidente postulantes reales / operacion piloto | alto | alta | operacion | Codex | validando | Add specialist intake operations report | validate/build/dry-run/report | pendiente |
| KZ-017 | Piloto necesita verificacion repetible de rutas publicas, SEO, admin y CRM antes de deploy | Kaizen / trabajo paralelo Codex-Claude | alto | alta | operacion | Codex | validando | Add pilot readiness check script | offline/validate/build/dry-run | pendiente |
| KZ-018 | Readiness check confundia token placeholder con token real y bloqueaba con 401 admin | Corrida PowerShell 2026-06-25 | medio | alta | operacion | Codex | validando | Harden pilot readiness token handling | offline/validate/build/dry-run | pendiente |
| KZ-019 | Readiness check necesita modo estricto para bloquear deploy si admin/CRM no se verifican | Kaizen release gate | alto | alta | operacion | Codex | validando | Add strict admin gate to pilot readiness check | strict/offline/validate/build/dry-run | pendiente |
| KZ-020 | Tracking de conversion muestra 404 en desarrollo local y listas de oficios generan keys duplicadas | Browser local / captura Benjamin 2026-06-26 | alto | alta | conversion | Codex | validando | Harden conversion event fallback and trade option dedupe | validate/build/dry-run | pendiente |
| KZ-021 | Build Next infiere una raiz superior por lockfile externo y puede confundir Cloudflare/local | Warning Next build 2026-06-26 | medio | alta | operacion | Codex | validando | Pin Turbopack root for stable Next builds | validate/build/dry-run | pendiente |
| KZ-022 | Rutas API con trailing slash pueden caer en endpoint_not_found por comparaciones exactas en Worker | trailingSlash=true / captura browser 2026-06-26 | alto | alta | estabilidad | Codex | validando | Normalize API trailing slashes in Worker routing | validate/test/build/dry-run | pendiente |
| KZ-023 | Captura temprana de especialista no debe darse por deduplicada si D1 no confirmo stored=true | Incidente postulantes reales / auditoria Forms.tsx | alto | alta | crm | Codex | validando | Retry early specialist capture until remote store succeeds | validate/build/dry-run | pendiente |
| KZ-024 | Deploy manual puede publicar assets antiguos si no se corre validate/build antes | Incidentes PowerShell / rutina Cloudflare | alto | alta | operacion | Codex | validando | Add safe npm deploy gates for Cloudflare assets | validate/build/deploy:dry-run | pendiente |
| KZ-025 | Readiness check no cubria endpoints CRM que historicamente fallaron con 404 | CRM E2E / incidente work-queue reports | medio | alta | operacion | Codex | validando | Expand pilot readiness coverage for CRM operations | offline/validate/build/dry-run | pendiente |
| KZ-026 | Docs y prompts todavia indicaban comandos Wrangler directos que saltan el gate npm seguro | Auditoria docs 2026-06-26 | medio | media | documentacion | Codex | validando | Align release docs with safe npm deploy scripts | validate/build/deploy:dry-run | pendiente |
| KZ-027 | Normalizacion de trailing slash en API necesitaba cobertura automatica real | Worker routing guard | medio | media | testing | Codex | validando | Add Worker API trailing slash routing tests | test/validate/build/dry-run | pendiente |
| KZ-028 | Readiness live sin token muestra warnings que pueden confundirse con falla real | Corrida live sin ADMIN_TOKEN 2026-06-26 | bajo | media | operacion | Codex | validando | Clarify skipped admin checks in pilot readiness output | offline/live/validate | pendiente |
| KZ-029 | Readiness no distinguia si el Worker/API estaba vivo aunque las paginas estaticas cargaran | Operacion Cloudflare / piloto | alto | alta | estabilidad | Codex | validando | Add safe Worker health check to readiness gates | test/validate/build/dry-run | pendiente |
| KZ-030 | Binding D1 correcto debe quedar protegido por validacion automatica | Incidentes previos DB/oficiospro_leads | alto | media | operacion | Codex | validando | Guard D1 DB binding in project validation | validate/build/dry-run | pendiente |
| KZ-031 | Validaciones de release estaban dispersas y dependian de memoria operativa | Kaizen / trabajo multiagente 2026-06-26 | alto | alta | operacion | Codex | validando | Add unified platform release gate | release:gate/validate/build/dry-run | pendiente |
| KZ-032 | Gate de desarrollo no distinguia cambios reales pendientes antes de merge/deploy | Kaizen release gate 2026-06-26 | medio | alta | operacion | Codex | validando | Add strict clean release gate mode | audit strict/validate | pendiente |
| KZ-033 | Chips de captacion fundadores y opciones de oficio podian volver a generar keys fragiles | Browser local / warning React 2026-06-26 | medio | alta | ux | Codex | validando | Harden founder chip keys and key validation | validate/build/dry-run | pendiente |
| KZ-034 | Readiness offline pasaba aunque no verificara rutas locales ni APIs del Worker | Kaizen release gate 2026-06-26 | alto | media | operacion | Codex | validando | Make offline readiness verify local route evidence | release:gate/strict | pendiente |

## Criterios de priorizacion

Usar una escala simple:

- Impacto alto: afecta pagos, leads, postulaciones, admin, confianza o conversion principal.
- Impacto medio: mejora experiencia o reduce friccion sin bloquear operacion.
- Impacto bajo: limpieza, docs, polish o mejora preventiva.

Urgencia:

- Alta: rompe flujo real, datos, pago, admin o deploy.
- Media: afecta conversion o confianza pero tiene workaround.
- Baja: mejora planificada sin impacto inmediato.

## Reglas de uso

- Una fila debe describir un problema, no una solucion.
- Cada fila debe tener fuente.
- No mover a `desplegado` sin commit y validacion.
- No mover a `medido` sin resultado observado.
- Si una mejora requiere varias partes, crear subtareas con IDs nuevos.
