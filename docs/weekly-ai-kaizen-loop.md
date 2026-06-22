# Weekly AI Kaizen loop

## Objetivo

Crear un ritmo semanal donde las IAs observen, diagnostiquen, prioricen, implementen, validen, desplieguen si corresponde, midan y vuelvan a empezar.

## Calendario

### Lunes - Sintesis estrategica

Responsable: ChatGPT.

Entradas:

- Metricas de la semana.
- Feedback de Benjamin.
- CRM.
- Search Console.
- Errores o fricciones.
- Backlog Kaizen.

Salida:

- Tres problemas principales.
- Una prioridad recomendada.
- Prompt para Codex, Claude o Grok.
- Metrica esperada.

### Martes - Auditoria externa

Responsable: Grok.

Salida:

- Benchmark.
- Riesgos.
- Lo que parece debil comparado con marketplaces fuertes.
- Contraargumentos.
- Oportunidades no obvias.

### Miercoles - Implementacion tecnica

Responsable: Codex.

Salida:

- Cambio incremental.
- Validacion.
- Documentacion.
- Commit.
- Lista de riesgos si corresponde.

### Jueves - UX y conversion

Responsable: Claude.

Salida:

- Mejora de claridad visual.
- Copy mas accionable.
- Mobile revisado.
- CTAs mas claros.
- Estados vacios honestos.

### Viernes - QA y cierre tecnico

Responsable: Codex.

Salida:

- `git status`.
- Validaciones.
- Dry-run si aplica.
- Documentacion actualizada.
- Backlog actualizado.

### Sabado - Revision de Benjamin

Responsable: Benjamin.

Salida:

- Aprobar deploy.
- Pedir ajuste.
- Cambiar prioridad.
- Bloquear cambio sensible.

### Domingo - Aprendizaje

Responsable: ChatGPT.

Salida:

- Que se hizo.
- Que funciono.
- Que no funciono.
- Que se aprendio.
- Que sigue.

## Cierre semanal obligatorio

Cada semana debe terminar con:

- Commit.
- Validacion.
- Metrica esperada.
- Backlog actualizado.
- Aprendizaje documentado.
- Decision de siguiente ciclo.

## Salud del modelo de negocio

Cada cierre semanal debe incluir:

- Crecio la oferta?
- Crecio la demanda?
- Hubo registros?
- Hubo solicitudes?
- Hay senales de pago?
- Que canal trajo mejores leads?
- El modelo 9,5% + IVA parece suficiente?
- Que segmento muestra mas potencial?
- Conviene seguir con el modelo actual o probar una variante?

## Formato de reporte semanal

```md
# Cierre semanal OficiosPro

## Resultado
- Cambio:
- Commit:
- Deploy:
- Validaciones:

## Metricas
- Oferta:
- Demanda:
- Transacciones:
- Confianza:
- Economia:

## Salud del modelo
- Senal principal:
- Riesgo:
- Hipotesis:
- Experimento recomendado:

## Aprendizaje
- Lo que funciono:
- Lo que no:
- Proximo ciclo:
```

## Regla de continuidad

Si una metrica clave no se puede medir, el siguiente ciclo debe priorizar instrumentacion antes de seguir optimizando a ciegas.

## Cierre semanal V2

Cada semana debe terminar con:

- estado del modelo;
- metrica principal;
- cambios desplegados;
- experimento activo;
- resultado observado;
- aprendizaje;
- riesgo;
- proximo ciclo;
- decision requerida.

Pregunta obligatoria:

```text
Las mejoras de esta semana aumentaron oferta, demanda, liquidez, confianza o economia?
```

Si no existe evidencia, declarar:

```text
Todavia no medible.
```

El reporte semanal se genera con:

```powershell
node scripts\generate-business-health-report.mjs
```
