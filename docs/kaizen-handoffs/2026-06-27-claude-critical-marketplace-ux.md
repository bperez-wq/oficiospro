# Handoff Claude — Critical marketplace UX (2026-06-27)

Ciclo Kaizen UX/conversion sobre los 5 puntos criticos nuevos (KC-001..KC-005 / KZ-037..KZ-041).
Rama: `kaizen/codex-2026-06-26-conversion-events-stability`.

## Resumen

Mejoras incrementales de UX, copy y claridad de flujo sobre componentes existentes. No se rehizo
ninguna pantalla. No se tocó Worker, D1, wrangler.toml, pagos, precios ni comisión. No se inventaron
especialistas ni se mostraron datos demo como reales. Build, validate y dry-run pasan.

## Puntos críticos tocados

### KC-001 / KZ-037 — Densidad de red baja
- `src/components/SpecialistsExplorer.tsx`: nuevo banner de baja densidad que aparece solo cuando hay
  entre 1 y 3 resultados visibles. Refuerza captura de demanda ("Solicitar especialista" / "Quiero que
  me contacten") reutilizando `captureDemand`, que ya registra `category_search_no_results` en CRM.
- El empty state de 0 resultados ya era fuerte (no se modificó). Mensaje honesto de red en crecimiento.

### KC-002 / KZ-038 — Perfiles públicos
- `src/components/SpecialistPublicProfile.tsx`:
  - Reemplazado el texto plano `Cargando perfil...` por `ProfileLoadingSkeleton` (skeleton branded,
    `aria-busy`), exportado para reuso.
  - Estado "no encontrado" reescrito como captura de demanda (CTAs a especialistas, dejar solicitud,
    hablar con el equipo) con copy honesto de revisión manual.
- `src/app/especialistas/perfil/page.tsx`: el `Suspense` fallback ahora usa `ProfileLoadingSkeleton`.
- Nota: la ruta `/especialistas/[id]` ya es SSG con `initialSpecialist` server-side (HTML completo,
  bueno para SEO). El skeleton aplica al camino client-side (`/especialistas/perfil?id=` y lookups).

### KC-003 / KZ-039 — Funnel post-búsqueda
- `src/components/ConversionModal.tsx`: `SuccessState` ahora muestra un bloque "Qué pasa ahora" con 3
  pasos honestos y adaptados a tipo (reserva / empresa / general): solicitud guardada → revisión manual
  del equipo → contacto para coordinar. Sin prometer SLA ni horario falso. Mantiene créditos protegidos
  en el caso de reserva.

### KC-004 / KZ-040 — Onboarding especialista
- `src/app/registro-especialista/page.tsx`: pasos "Cómo funciona" enriquecidos con detalle por paso,
  énfasis en que el intento queda guardado temprano, que documentos/certificaciones pueden completarse
  después, y reassurance de revisión humana real (sin prometer empleo ni ingresos).

### KC-005 / KZ-041 — Sistema de créditos
- `src/app/faq/page.tsx`: nueva sección completa de créditos (qué es 1 crédito, cómo se compran, cómo se
  usan, qué pasa si no se completa el trabajo, reembolsos/disputas, acumulación, Club Hogar, empresas).
- `src/components/CreditExplainer.tsx`: footer con recordatorio de protección de créditos + link a `/faq`.
  Como el componente se usa en Home, Bolsa, Checkout, Club Hogar y Empresas, la mejora llega a todas esas
  superficies de una sola vez. Sin exponer precios, margen ni payout.

#### Corrección del modelo de créditos (indicada por Benjamín, 2026-06-27)
El modelo NO es "vencen a 24 meses". El correcto es un **tope de acumulación de 10 meses**:
- Acumulas créditos hasta el equivalente a 10 meses de tu plan (ej. Plan Hogar 40/mes → tope 400 créditos).
- Dentro del tope, los créditos se mantienen disponibles en el tiempo (no vencen por fecha).
- El excedente sobre el tope queda en beneficio de la plataforma (rationale interno: reconocimiento de
  ingreso / impuesto a la renta por suscripciones acumuladas más de un año sin uso). Esto incentiva usar
  los créditos al menos un par de veces al año.
- **Importante:** este rationale (excedente → plataforma / impuestos) NO se expone en UI pública.

Cambios aplicados (copy + dato, sin tocar finanzas/backend):
- `src/data/marketplace.ts`: `accumulatesMonths` 24 → 10 en los 6 planes (alimenta automáticamente el copy
  de checkout, planes, modales y forms vía `plan.accumulatesMonths`).
- `src/components/CreditExplainer.tsx`: copy de acumulación reescrito al modelo de tope; el simulador ahora
  se clampa al tope (`monthlyCredits * 10`) y muestra una nota cuando se alcanza.
- `src/app/faq/page.tsx`: pregunta de vencimiento reescrita al modelo de tope con ejemplo.
- `src/components/Dashboards.tsx` y `src/data/mock.ts`: textos hardcoded "24 meses" → "10 meses" / tope.

## Páginas / archivos modificados

- `src/components/SpecialistsExplorer.tsx`
- `src/components/SpecialistPublicProfile.tsx`
- `src/app/especialistas/perfil/page.tsx`
- `src/components/ConversionModal.tsx`
- `src/app/registro-especialista/page.tsx`
- `src/app/faq/page.tsx`
- `src/components/CreditExplainer.tsx`
- `docs/kaizen-backlog.md` (KZ-037..041 → en_progreso)
- `docs/kaizen-handoffs/2026-06-27-claude-critical-marketplace-ux.md` (este archivo)

## Qué NO se tocó

Worker, D1, migraciones, wrangler.toml, pagos / Mercado Pago, precios, comisión 9,5% + IVA, lógica de
datos de especialistas (`src/data/mock`), admin, CRM backend, SEO de rutas. No se ejecutó deploy ni merge.
No se usó `git add .`.

## Qué debe revisar Codex

- KZ-038: dar HTML inicial útil a la ruta client `/especialistas/perfil` (hoy depende de fetch + storage);
  evaluar pasar `initialSpecialist` o prerender parcial.
- KZ-039: confirmar que cada CTA del funnel deja un evento medible en CRM por paso (el copy ya promete
  revisión y contacto; falta cerrar la evidencia).
- KZ-037: instrumentar medición de búsquedas con baja densidad (1-3 resultados) además de 0 resultados.
- KZ-040: cola de revisión / automatización segura del intake especialista (el copy ya alinea expectativas).
- Verificar que el link `/faq` y los nuevos textos no rompan SEO/snapshots existentes.
- **KZ-041 (créditos) — reconciliar lifecycle:** el copy ya describe tope de acumulación de 10 meses, pero
  la lógica real sigue siendo expiración por fecha (`defaultCommercialConfig.creditExpirationMonths = 24`
  en `src/data/marketplace.ts`, usado por `src/lib/storage.ts` para `expiresAt`). Falta implementar el
  modelo de **tope = monthlyCredits × 10** y el tratamiento del **excedente → plataforma** (ver
  `src/lib/finance/creditOperations.ts` y `src/lib/finance/taxModel.ts`). Requiere aprobación de Benjamín
  por tocar finanzas/impuestos. No lo implementé en este ciclo (fuera de alcance UX y toca lógica sensible).

## Qué debe decidir Benjamín

- Confirmar la redacción pública del modelo de créditos: tope de acumulación de 10 meses (ej. 400 créditos
  en plan de 40/mes), créditos dentro del tope se mantienen, sin exponer el destino del excedente.
- Aprobar (legal/tributario + producto) la implementación real del lifecycle: tope = monthlyCredits × 10 y
  excedente → plataforma. Hoy solo está el copy; la lógica backend sigue con expiración a 24 meses.
- Confirmar la política de reembolsos/disputas tal como quedó redactada en FAQ (conviene validación legal).
- Si se desea exponer rangos de precio de paquetes de créditos en FAQ (hoy se evita a propósito).
- Aprobar commit / merge / deploy.

## Riesgos pendientes

- El marketplace sigue mostrando especialistas de `src/data/mock` mezclados con aprobados reales. No es
  parte de este ciclo, pero sigue siendo el riesgo de fondo de KC-001 (densidad real vs. percibida).
- Las mejoras son de copy/UX: el impacto en conversión debe medirse después (todavía no medible).

## Validaciones ejecutadas

- `npm.cmd run validate` → Project validation passed.
- `npm.cmd run build` → Compiled successfully, 304 páginas generadas, TypeScript OK.
- `npx.cmd wrangler deploy --dry-run --assets ./out` → OK (4163 assets, bindings DB + ASSETS).

## Commit sugerido

`Improve critical marketplace UX and conversion clarity`
