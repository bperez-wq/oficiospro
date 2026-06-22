# AI handoff protocol

## Objetivo

Convertir reportes de salud del modelo en paquetes claros para ChatGPT, Codex, Claude y Grok.

## Handoff semanal

Cada reporte semanal debe producir cuatro bloques:

### ChatGPT - sintesis y priorizacion

- Alertas principales.
- Contexto de metricas.
- Decisiones pendientes.
- Recomendacion de foco.
- Prompt del siguiente ciclo.

### Codex - implementacion

- Causa tecnica probable.
- Archivos probables.
- Criterios de aceptacion.
- Tests.
- Modulos que no debe tocar.
- Commit esperado.

### Claude - UX/conversion

- Paginas o flujos.
- Friccion observada.
- Copy a revisar.
- Mobile.
- Confianza.
- Modulos que no debe tocar.

### Grok - auditoria externa

- Benchmark.
- Riesgos.
- Contradicciones.
- Oportunidades.
- Preguntas criticas.

## Regla de handoff

Si la alerta requiere L3/L4, el handoff debe incluir `approval_required: true` y no pedir implementacion productiva sin aprobacion de Benjamin.

## Formato corto

```md
## Handoff IA

### Alerta
- Estado:
- Metrica:
- Evidencia:

### ChatGPT
- Sintetizar:
- Priorizar:

### Codex
- Implementar:
- No tocar:
- Validar:

### Claude
- Mejorar:
- No tocar:

### Grok
- Auditar:

### Benjamin
- Decision requerida:
```

