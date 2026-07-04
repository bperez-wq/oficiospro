# Kaizen 2026-07-04 — Premium Design Activity Loop

Rama: `kaizen/claude-premium-design-activity-loop`
Responsable: Claude (diseño/UX) · Máx. 4 loops

Nota de estado: los ciclos anteriores están commiteados, pusheados y desplegados
con autorización de Benjamin, pero aún sin mergear a `main` (PR pendiente de su
decisión). Este loop se apila sobre `kaizen/claude-specialist-passport-experience`.

## Diagnóstico visual

La plataforma ya tiene una base sólida tras los ciclos previos: señales de
confianza honestas, labels referenciales en cards y perfiles, pasaporte
profesional en registro/dashboard, focus-visible global y kill-switch de
prefers-reduced-motion en `globals.css`. Los gaps encontrados:

1. **Testimonios inventados sin etiquetar** en la home (personas ficticias de
   `mock.ts` presentadas como prueba social real) — violación de honestidad.
2. **DashboardPreview de empresas en home** con "Operación activa · SLA 2.4 h"
   (métricas demo sin etiqueta "Ejemplo", a diferencia de /empresas que sí la
   tiene).
3. La home no tenía un **bloque emocional del especialista** — el "corazón" del
   negocio no se veía; el bloque propósito era abstracto y sin fotos.
4. La franja piloto era correcta pero estática: sin sensación de red viva ni
   datos de categorías en formación, y sin "qué pasa después".
5. Hero de fundadores decía "cupos limitados" (claim de escasez no respaldado).

## Loop 1 — Plataforma viva (implementado)

- **PilotLaunchStrip (home)**: badge "Red en formación · piloto activo" con
  `.pulse-dot` animado (respetando reduced-motion vía kill-switch global);
  título → "Estamos formando la primera red de especialistas fundadores";
  chips de **categorías en formación reales** derivadas de `tradeTaxonomy`
  (`isTradeForming` + `getTradeCoverageLabel`) — datos de configuración, no
  inventados; línea "¿Qué pasa después? Postulas hoy → revisión humana ~48 h →
  publicación por comuna".
- **Honestidad**: testimonios etiquetados "Testimonios referenciales: ilustran
  el estándar de servicio que estamos construyendo en el piloto";
  DashboardPreview → "Así se ve tu operación" + chip "Ejemplo ilustrativo"
  (se eliminó el fake "SLA 2.4 h" como claim).

## Loop 2 — Especialista como corazón visual (implementado)

- Nuevo **`SpecialistHeartSection`** en home (reemplaza el bloque propósito
  abstracto): eyebrow "Para quienes hacen el trabajo en terreno", título
  emocional "Tu oficio merece verse, valorarse y brillar", bullets del
  pasaporte, CTAs "Construir mi perfil" (tracked `click_offer_services`,
  source `home_heart`) y "Ver programa fundador", collage de 3 fotos reales del
  banco de oficios con caption honesto "Oficios reales · fotos referenciales".
- Nota de expectativa: "Primero buenos perfiles, después más oportunidades."

## Loop 3 — Microinteracciones (implementado)

- Nueva utilidad CSS **`.pulse-dot`** (globals.css): indicador de actividad con
  animación de pulso en `currentColor`; el kill-switch global de
  prefers-reduced-motion la neutraliza automáticamente.
- Aplicada en home (franja piloto) y hero de fundadores.
- Ya existían y se reutilizaron: hover-lift en cards, focus-visible global,
  Reveal con reduced-motion, feedback "Enlace copiado ✓" (ciclos previos).

## Loop 4 — Conversión y claridad (implementado)

- "Qué pasa después" explícito bajo los CTAs de la franja piloto.
- Hero fundadores: "cupos limitados" → "red en formación" (se elimina el claim
  de escasez no respaldado; más honesto y coherente con el concepto rector).
- El bloque corazón responde arriba del fold de su sección: para quién es, qué
  ofrece, qué hacer ahora y qué tan real está ("fotos referenciales", "sin
  costo inicial y con revisión humana").

## Componentes creados / reutilizados

- Creado: `SpecialistHeartSection` (home).
- Creado: utilidad `.pulse-dot` (CSS, no componente).
- Reutilizados: AcquisitionTrackingLink, chips/badges existentes, Reveal,
  SpecialistPassportChecklist (ciclo anterior), FounderHero.

## Decisiones de honestidad

- Testimonios demo → etiquetados como referenciales (no eliminados: ilustran el
  estándar, pero ya no se hacen pasar por reales).
- Métricas demo del dashboard empresa → "Ejemplo ilustrativo".
- Chips de categorías en formación → derivadas de la taxonomía real
  (configuración operativa), nunca números inventados.
- "Cupos limitados" eliminado por no estar respaldado.

## Mobile

- 390px verificado en home y fundadores: sin scroll horizontal, CTAs visibles,
  collage y chips fluyen bien. Grid responsivo en todas las piezas nuevas.

## Validación

`npm.cmd run validate` ✅ · `npm.cmd run build` ✅ · `wrangler --dry-run` ✅
Preview manual: home (bloque corazón con fotos cargando, franja piloto con
pulso + chips reales + qué pasa después, testimonios etiquetados, dashboard
"Ejemplo ilustrativo"), fundadores (pill con pulso, sin "cupos limitados"),
consola sin errores.

## Handoff Codex

- Los chips "Categorías abriéndose por comuna" hoy salen de la taxonomía
  estática. Cuando el CRM tenga conteos reales por comuna (postulaciones en
  revisión), una franja de actividad real ("X perfiles en revisión esta
  semana") sería el siguiente nivel de "plataforma viva" — requiere endpoint
  agregado y anonimizado (L3).
- Persisten: instrumentación de `profile_share`/`click_offer_services` por
  source, storage R2 de identidad, bloqueo de pago para perfiles referenciales.

## Próximos loops recomendados

1. `/trabajos/[oficio]` y `/bolsa`: aplicar el mismo estándar de vida honesta y
   claridad de siguiente paso (no tocados en este loop).
2. Dashboards admin (acquisition/business-health): jerarquía visual y estados
   vacíos motivadores.
3. Cuando Benjamin lo decida: merge a `main` de toda la cadena de ramas kaizen.
