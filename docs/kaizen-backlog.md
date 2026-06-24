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
