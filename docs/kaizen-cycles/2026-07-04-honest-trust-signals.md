# Kaizen 2026-07-04 — Confianza honesta del especialista

Rama: `kaizen/claude-product-trust-passport`
Responsable: Claude (producto/UX) · Aprobado por Benjamin

## Problema

Las señales de confianza del perfil de especialista se fabricaban en frontend:

- `src/lib/trust.ts` marcaba ~2/3 de las reseñas como "Opinión verificada" y ~3/4 como
  "revisada por admin" por patrón de índice (`index % 3 !== 2`, `index % 4 !== 0`).
- Los sub-ratings (puntualidad, calidad, comunicación, precio) se derivaban
  algorítmicamente del rating general cuando la fuente no los traía.
- Los perfiles del catálogo demo (`src/data/mock.ts`) se mostraban indistinguibles de
  especialistas reales, con badge "Identidad verificada" incluido.
- "Disponible ahora/hoy/mañana" se prometía sin agenda real conectada.
- El perfil público fabricaba al menos 1 "Referencia verificada" (`Math.max(1, ...)`)
  y una certificación fallback "Validación OficiosPro" cuando no había datos.

## Cambio (solo frontend, sin tocar worker/D1/pagos/Bolsa/checkout)

1. **Reseñas**: `verifiedService` y `reviewedByAdmin` solo son `true` si vienen
   explícitos en la fuente. Sub-ratings ahora opcionales: no se derivan; los promedios
   por dimensión se calculan solo sobre reseñas que los declaran, y la UI omite la fila
   si no hay datos (perfil público) o muestra "Sin dato" (admin).
2. **Perfiles demo**: nuevo helper `src/lib/specialists/demoProfile.ts`
   (`isDemoSpecialist`) — un especialista es referencial si pertenece al catálogo
   estático y no tiene `publishedFromAdmin`. En perfil público: banner ámbar "Perfil
   referencial" + microcopy; chip del hero reemplaza disponibilidad. En las tres cards
   (SpecialistCard, SpecialistGridCard, SpecialistCompactCard): chip "Perfil
   referencial". `getTrustBadges` suprime "Identidad verificada", "Referencias
   revisadas" y "Certificación cargada" en perfiles demo.
3. **Disponibilidad**: `availabilityLabels` (mock enum sin agenda) → "Disponibilidad
   por confirmar" en todas las variantes; `statusLabels` de agenda → copy referencial
   ("Agenda abierta hoy · por confirmar", "Horarios hoy · por confirmar", "Próximo
   horario referencial"); dots de estado neutros (sin verde "en vivo").
4. **Fabricaciones menores**: sección "Referencias verificadas" solo se muestra si
   `validation.references > 0`; certificaciones vacías muestran texto honesto en vez
   del chip fallback; titular de reputación condicionado ("reputación en construcción"
   si no hay opiniones verificadas).

## Métrica

- Principal: 100% de badges "Opinión verificada"/"revisada por admin" respaldados por
  dato explícito (antes ~66%/75% fabricado).
- Control: conversión perfil→solicitud (`conversion_events`) no debe caer de forma
  anómala tras el sinceramiento.

## Reversión

`git revert` del commit único de esta microentrega.

## Handoff Codex (pendiente, L3)

- Perfiles demo no deberían poder llegar a pago real: hoy un item de Bolsa/checkout
  puede referenciar un especialista del catálogo demo y cobrar vía Mercado Pago.
  Propuesta: en el flujo de checkout/creación de payment intent, rechazar o marcar
  items cuyo `specialistId` pertenezca al catálogo referencial cuando
  `NEXT_PUBLIC_SHOW_DEMO_DATA` no esté activo. No se tocó checkout/Bolsa en este ciclo.
- `verifiedService` real debe nacer del cierre de trabajos con evidencia (D1), no del
  seed; cuando exista ese dato, la UI ya lo respeta sin cambios.
