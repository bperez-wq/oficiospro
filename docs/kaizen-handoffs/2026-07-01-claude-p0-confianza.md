# Kaizen · Claude · P0 confianza y conversión (2026-07-01)

Rama: `kaizen/claude-p0-confianza`

## Diagnóstico previo (regla: no rehacer)
La mayor parte del brss ya estaba desplegada en `main` (`7f61742`) por ciclos previos:
- 1.1 nav interna oculta a anónimos (footer por sesión + `RouteAuthGuard`).
- 1.2 contraste naranja `#d98a24 → #a65600`/`#9b5000` + tokens `--op-orange-*`, `--op-focus-ring`.
- 1.4 foco de teclado visible global (`:focus-visible`).
- 2.1 tildes corregidas globalmente (créditos/cotización/comisión/…).
- 2.4 a11y de detalle (alt, ratings `role=img`, combobox `aria-haspopup`).
- Ciclo 3: targets 44px, filtros ensanchados (240→280px), imágenes vía `next/Image`, widget con `safe-area`.

## Delta implementado en este ciclo (quirúrgico)
1. **1.3 — Ícono de ayuda del precio, área táctil ≥44px + tooltip del spec.**
   Se reutilizó el componente existente `CreditPriceTag` (no se duplicó). El botón `i`
   pasó de 16px de área táctil a **44px** (padding + margen negativo, ícono visual sigue
   16px), color `#08746F` (brand), y el `title` ahora trae el texto del spec
   ("1 crédito = $1.000. Pagas los servicios con créditos y tu dinero queda protegido…").
   Nota: la equivalencia crédito↔peso ya se muestra en todas las tarjetas vía
   `pricingSummary` (ciclo P1-01), por lo que la aceptación "ningún precio sin pesos" ya
   se cumplía; este cambio cierra el requisito del ícono/tooltip.
2. **2.2 — Placeholder de distancia sin comuna** con el copy exacto del spec
   (`📍 Indica tu comuna para ver especialistas cerca de ti`) en el contexto de resultados
   del directorio (las tarjetas ya ocultan km sin ubicación real desde P1-04).
3. **2.3 — Errores en región asertiva + copy de email.** El aviso de error del especialista
   en el modal pasa a `role="alert" aria-live="assertive"`; el estado de ubicación a
   `role="status" aria-live="polite"`. El copy de email inválido (es-CL) ahora es
   "Ingresa un correo válido, por ejemplo nombre@correo.cl".

## Pendiente / coordinación
- **Eventos del funnel (coordinar con CODEX antes de codificar):** hoy solo se emite
  `search_performed`. Faltan `search_zero_results`, `profile_viewed`, `service_requested`,
  `booking_paid` con nombres estables. NO se implementaron unilateralmente por la regla de
  coordinación del contrato con CODEX.
- **Badge de créditos de 2 líneas (rediseño):** el spec 1.3 describe un badge de dos
  líneas (créditos 20/700 + pesos 14/500) en contenedor `--op-surface-muted`/
  `--op-radius-control`. Las tarjetas actuales ya muestran pesos inline sin regresión; el
  rediseño a badge de 2 líneas es una mejora de diseño mayor (no quirúrgica) y se deja como
  decisión de producto para no alterar layouts existentes.

## Métricas del ciclo
- Conversión: seguir `service_requested` (pendiente de instrumentación CODEX) e inicio de
  postulación de especialista. Guardarraíl: no dar por bueno un alza de conversión que
  dañe la claridad del lado especialista (sin cambios en onboarding de especialista este ciclo).
