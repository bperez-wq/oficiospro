# Kaizen 2026-07-05 — Registro especialista: éxito sin expulsión + continuidad funnel SEC

Rama: `kaizen/claude-sec-mailing-funnel`
Líder de ciclo: Claude (primer ciclo bajo liderazgo Kaizen de Claude)
Ciclo del handoff: B (conversión especialista fundadores), priorizado porque el
mailing SEC está por generar tráfico real hacia `/sec` → `/registro-especialista`.

## Problema elegido

El momento de éxito de la postulación — el punto de mayor valor emocional del
funnel — se autodestruía: el usuario era redirigido al Home antes de poder leer
la confirmación o usar el CTA de referidos.

## Evidencia

1. `Forms.tsx` (submit de `SpecialistRegisterForm`) ejecutaba
   `window.location.href = "/?postulacion=recibida"` a los **2.500 ms** del envío.
2. Ese redirect es anterior (commit `9a8ceab`) a la tarjeta de éxito premium
   (badge fundador, preview de perfil, invitación WhatsApp con código de
   referido) agregada después: quedó huérfano y la sabotea. 2,5 s no alcanzan
   para leer 2 líneas; el CTA de referidos era inalcanzable.
3. El formulario completo (6 pasos) seguía visible junto a la tarjeta de éxito.
4. `SpecialistQuickLeadForm` (usado en `/sec`): el mensaje de éxito decía
   "Puedes terminar tu perfil ahora o pedir ayuda" pero no ofrecía **ningún
   enlace** para hacerlo, a pesar de que el borrador ya quedaba guardado
   (`saveSpecialistQuickDraft`).
5. El bloque "Origen de invitación" trataba al llegado del mailing SEC con copy
   interno ("Guardaremos este dato para seguimiento interno") sin conectar su
   certificación con el paso Certificaciones.

## Hipótesis

Si el éxito de postulación se vuelve protagonista (sin expulsión), el lead
rápido ofrece continuidad en un clic y el llegado SEC recibe instrucción clara
de destacar su credencial, suben: (a) uso del CTA de referidos post-éxito,
(b) conversión quick-lead → Pasaporte completo, (c) postulaciones SEC con
certificación declarada.

## Cambios realizados

1. `src/components/Forms.tsx`
   - Eliminado el redirect automático de 2,5 s; reemplazado por scroll suave a
     la tarjeta de éxito (`#registro-exito`). El link "Volver al inicio" ya
     existía y se mantiene como salida voluntaria.
   - El formulario (pasos, barra de progreso, navegación) se oculta cuando
     `submitted === true`: la tarjeta de éxito queda sola y protagonista.
   - Bloque "Origen de invitación": para `sec_mailing` / `sec_registro_publico`
     se agrega refuerzo para marcar la casilla SEC en Certificaciones, con
     lenguaje honesto ("cuando el equipo la revise").
2. `src/components/SpecialistQuickLeadForm.tsx`
   - Estado `saved`: al guardar con éxito muestra bloque con (a) confirmación
     honesta de contacto en ~48 h, (b) CTA "Completar mi Pasaporte ahora" →
     `founderRegistrationHref({ ...context, sourceDetail: "quick_lead_continue" })`
     que preserva la atribución (sec_mailing/campaña) y retoma el borrador ya
     guardado, (c) nota de que el avance quedó guardado, sin costo ni compromiso.
   - Botón de envío queda deshabilitado ("Datos guardados ✓") para evitar
     dobles envíos.

## Qué NO se tocó

- Worker, D1, migraciones, `wrangler.toml`, endpoints, auth.
- Precios, comisiones, créditos, reglas financieras, Mercado Pago.
- Eventos de tracking: mismos eventos, mismos nombres, misma atribución (el
  `sourceDetail=quick_lead_continue` es aditivo, usa el mecanismo existente).
- Política legal SEC de Codex y datos prototipo.
- El resto de formularios en `Forms.tsx`.

## Validación

- `tsc --noEmit` completo: sin errores.
- `npm run validate`: Project validation passed.
- `npm run test:unit`, `npm run build` y `npm run deploy:dry-run` no son
  ejecutables en el entorno de Claude (binarios esbuild/SWC son win32; los 8
  fallos de test:unit en Linux son ambientales y previos al cambio).
  **Pendiente Benjamin (PowerShell)**: `npm.cmd run test:unit`,
  `npm.cmd run validate`, `npm.cmd run build`,
  `npx.cmd wrangler deploy --dry-run --assets ./out` antes de merge.
- QA manual sugerido: enviar postulación de prueba y verificar que la tarjeta
  de éxito permanece, el form se oculta y no hay redirect; en `/sec`, guardar
  lead rápido y verificar CTA de continuidad con `source=sec_mailing`.

## Focos Kaizen permanentes (KC-001..KC-005)

- KC-001 densidad de red: igual (no tocado en este ciclo).
- KC-002 perfiles dinámicos: igual.
- KC-003 funnel post-búsqueda: mejora indirecta en el lado especialista (el
  post-envío ahora explica qué pasa y no expulsa). El lado cliente sigue
  pendiente como ciclo C.
- KC-004 onboarding especialista manual: mejora (continuidad quick-lead →
  Pasaporte reduce leads incompletos que Benjamin debe perseguir a mano).
- KC-005 explicación de créditos: igual.

## Decisiones requeridas de Benjamin

1. Correr las validaciones Windows listadas arriba y aprobar merge a `main`.
2. Eliminar lock huérfano de git (dejado por un pull interrumpido):
   `del C:\Users\Benjamin\oficiospro\oficiospro\.git\index.lock`
3. Definir siguiente ciclo: recomendado Ciclo A (claridad admin) para operar
   los leads del mailing SEC con etiquetas de datos reales vs ejemplo.
