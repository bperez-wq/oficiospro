# Kaizen 2026-07-04 — Experiencia del especialista: Pasaporte Profesional

Rama: `kaizen/claude-specialist-passport-experience`
Responsable: Claude (producto/UX) · Solicitado por Benjamin

## Tesis

"El especialista no está llenando un formulario; está construyendo su Pasaporte
Profesional OficiosPro." Los buenos especialistas son el corazón de la
plataforma: la experiencia debe hacer que crear el perfil sea deseable, claro y
motivo de orgullo.

## Auditoría (resumen)

- **Registro**: microcopy ya era benefit-oriented (pasos con "por qué", captura
  temprana, "Fuerza de tu perfil", cierre celebratorio). Lo que faltaba: nombrar
  el activo. El formulario nunca decía qué se estaba construyendo.
- **Dashboard**: 100% dependiente de datos demo. Un postulante real que enviaba
  su postulación veía un EmptyState vacío — el momento de mayor motivación
  (post-envío) no mostraba avance ni próximos pasos.
- **Landing fundadores**: sólida (hero, wizard, sin promesas), pero hablaba de
  "perfil" genérico, no de un respaldo con nombre propio.
- **Perfil público**: ya tenía compartir + explicación de verificado (ciclo
  anterior); faltaba el marco conceptual del pasaporte.
- **Home**: CTA "Ofrecer mis servicios" claro y trackeado — sin cambios.

## Cambios

1. **Nuevo `SpecialistPassportChecklist`** (`src/components/SpecialistPassportChecklist.tsx`):
   bloque "Completa tu Pasaporte Profesional" con 8 ítems (perfil básico,
   oficio/servicios, comuna/cobertura, fotos/portafolio, referencias,
   formalización, verificación, perfil compartible), cada uno con su beneficio,
   % de avance, y CTAs "Completar mi Pasaporte" / "Ver mi perfil como cliente" /
   "Compartir mi perfil" (copiar enlace). Lee la postulación local
   (`getPendingSpecialists`) y declara honestamente que el estado oficial lo
   confirma el equipo. Sin postulación → modo guía ("Construye tu Pasaporte").
2. **Dashboard** (`Dashboards.tsx`): checklist visible en ambos caminos — con
   demo y, clave, en el camino real sin demo (antes solo EmptyState).
3. **Registro** (`Forms.tsx`): título del formulario → "Construye tu Pasaporte
   Profesional" ("No estás llenando un formulario…"); banner del pasaporte;
   beneficios agregados en pasos 3 (te encuentren mejor), 4 (cobrar mejor y
   mejores oportunidades) y 5 (respaldan tu experiencia); cierre → "¡Tu
   Pasaporte Profesional quedó en marcha!".
4. **Landing fundadores**: hero nombra el Pasaporte Profesional; CTA →
   "Construir mi perfil sin costo"; roadmap → "Tu Pasaporte Profesional es el
   primer paso de un respaldo mayor."
5. **Página registro**: "Tu Pasaporte Profesional: para que te encuentren y te
   prefieran."
6. **Perfil público**: panel de captación reframed — "Este perfil es un
   Pasaporte Profesional OficiosPro… tu trabajo merece una vitrina profesional"
   con CTA "Construir mi perfil".

## Qué NO se tocó

Worker, D1, pagos, checkout, Mercado Pago, wrangler.toml, diccionarios i18n
multi-idioma (heros traducidos), lógica de validación/submit del formulario,
datos demo.

## Métricas

- % de perfiles completos (métrica de etapa) — ahora visible para el propio
  especialista vía checklist.
- `specialist_application_started` / `submitted` (framing más motivador).
- `click_offer_services` (CTAs renombrados mantienen data-event).
- `profile_share` (nuevo botón en dashboard + existente en perfil).

## Handoffs Codex

- El checklist lee localStorage: cuando exista API de estado de postulación
  (`specialist_applications` en D1 expuesta al postulante autenticado), conectar
  el checklist al estado real (reviewStatus/publicationStatus del servidor).
- Evento sugerido `passport_checklist_viewed` para medir si el bloque empuja
  completitud.

## Validación

`npm.cmd run validate` ✅ · `npm.cmd run build` ✅ · `wrangler --dry-run` ✅
Preview manual: registro (título/banner/pasos), dashboard en modo guía (0%) y
con postulación simulada (75%, "En revisión", "1 de 3 recomendadas"), fundadores
(hero + roadmap), perfil público (panel pasaporte), mobile 375px sin overflow,
consola limpia. QA data de localStorage eliminada tras la prueba.
