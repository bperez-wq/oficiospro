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
