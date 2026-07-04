# Kaizen 2026-07-04 — Autonomous Business Model Growth Loop

Rama: `kaizen/claude-business-model-growth-loop` (parte de `kaizen/claude-product-trust-passport`, commit `2256325`)
Responsable: Claude (loop autónomo aprobado por Benjamin) · Máx. 5 iteraciones

Contexto de entrada: business health `insufficient_data` en las 5 dimensiones
(reports/business-health/2026-06-22.md); métrica de etapa = especialistas con
perfil completo, confiable y revisable; billion-dollar-backlog asigna a Claude
"mejorar prueba visual sin stock falso" (Trust) y B2B/comunidades (Demand).

## Loop 1 — Modelo y confianza (implementado)

- **Hipótesis**: quedaban señales débiles post-ciclo anterior: el explorador
  seguía titulando "especialistas verificados" y promediando ratings sobre un
  catálogo 100% referencial, y el filtro prometía "Disponible ahora".
- **Evidencia**: `SpecialistsExplorer.tsx` — chip "Especialistas verificados en tu
  búsqueda", métrica "Basado en resultados visibles", copy "Explora todos los
  especialistas verificados", opciones de filtro "Disponible ahora/hoy/mañana".
- **Cambio**: chip condicional (referencial vs verificado según composición real
  de resultados), métricas re-etiquetadas ("Referencial · según perfiles
  visibles", "Respuesta declarada"), copy honesto de red en formación, filtro
  "(por confirmar)", y barra ámbar cuando todos los resultados son referenciales.
- **Métrica**: 0 claims de verificación sobre resultados sin especialistas reales;
  control: conversión búsqueda→solicitud.
- **Decisión**: continuar.

## Loop 2 — Pasaporte profesional (implementado)

- **Hipótesis**: el perfil no funciona como pasaporte compartible ni explica qué
  respalda el "verificado" — el activo central de la tesis no es portable.
- **Cambio** en `SpecialistPublicProfile.tsx`:
  - Botón "Compartir este perfil" (Web Share API con fallback a portapapeles),
    evento `profile_share`.
  - Panel "¿Qué significa verificado?" con los 3 ejes reales de revisión
    (identidad/contacto, oficio/cobertura, referencias/certificaciones cuando
    aplican) + nota de verificación progresiva; en perfiles referenciales
    declara explícitamente que no representan especialistas verificados.
- **Métrica**: eventos `profile_share`; tráfico entrante a perfiles compartidos;
  conversión perfil→solicitud.
- **Decisión**: continuar.

## Loop 3 — Captación de especialistas (implementado)

- **Hipótesis**: /especialistas-fundadores y /registro-especialista ya están bien
  resueltos (pasos, reassurance, captura temprana, mensajes sin promesa); la
  fricción no está ahí. El gap: las superficies de demanda no reclutan oferta.
- **Cambio**: dos CTAs de captación con `data-event="click_offer_services"` y
  source rastreable: (a) barra referencial del explorador → "¿Tienes un oficio?
  Postula" (`source=specialists_explorer`); (b) panel "¿Tienes un oficio?" en el
  perfil público (`source=specialist_profile`) — muchos visitantes de perfiles
  son colegas del oficio evaluando la plataforma.
- **Métrica**: `click_offer_services` por source; `specialist_application_started`.
- **Decisión**: continuar.

## Loop 4 — B2B / Empresas (sin cambios, evaluado)

- **Evidencia**: /empresas ya comunica "Continuidad operacional", casos por tipo
  de operación, dashboard demo etiquetado "Ejemplo", planes por audiencia.
  El posicionamiento pedido ("red técnica externa para continuidad operacional")
  ya existe como sección; el hero es coherente.
- **Decisión**: no tocar (cambio de copy exigiría editar diccionarios en 5+
  idiomas por un matiz — mala relación riesgo/beneficio). Oportunidad real B2B
  siguiente: landing específica para comunidades/edificios (billion-dollar
  backlog, pendiente) — requiere decisión de alcance de Benjamin.

## Loop 5 — Beneficios y retención (implementado)

- **Hipótesis**: la promesa de largo plazo (formalización, beneficios,
  oportunidades) no se comunica, y comunicarla mal sería prometer de más.
- **Cambio**: sección "Hacia dónde va OficiosPro" en /especialistas-fundadores
  con tres columnas honestas: Disponible hoy / En construcción / Más adelante,
  con disclaimers explícitos ("sin fechas comprometidas", "solo con partners
  reales", "no es una promesa contractual").
- **Métrica**: scroll/permanencia en landing fundadores; tasa landing→inicio de
  postulación (umbral piloto >8%).
- **Decisión**: continuar → cierre del loop (5/5 iteraciones evaluadas, 4
  implementadas, 1 descartada por diseño).

## Patrones de benchmarks aplicados (sin copiar)

- **Directorio reputacional**: perfil compartible como activo (pasaporte) — el
  riesgo clásico "perfiles sin transacciones" se mitiga con honestidad
  referencial, no con inflado.
- **Marketplace gestionado**: se refuerza "revisión humana antes de publicar" y
  "seguimiento del equipo" como diferenciador visible.
- **Reviews verificadas**: explicación pública de qué significa verificado
  (patrón de plataformas con badges auditables), sin afirmar verificaciones
  inexistentes.
- **SaaS para especialistas / beneficios**: roadmap "hoy / en construcción /
  más adelante" comunica visión de retención sin prometer beneficios sin partner.

## Riesgos

- El sinceramiento referencial puede reducir la percepción de densidad de red en
  el corto plazo. Es intencional: protege la confianza y captura oferta con el
  CTA de postulación.
- `window.prompt` como último fallback de compartir es austero pero universal.

## Handoffs Codex

- (Persistente, L3) Bloqueo de pago real para perfiles referenciales en
  checkout/payment intent (ver kaizen 2026-07-04-honest-trust-signals).
- Instrumentar `profile_share` y `click_offer_services` por source en el panel
  `/admin/crm/acquisition` para que las métricas de este loop sean visibles.
- Storage privado R2 para documentos de identidad (sigue siendo el No-Go de
  escala a 1.000 especialistas).

## Decisiones para Benjamín

1. ¿Aprobar una landing B2B específica para comunidades/edificios (Loop 4
   siguiente)? Es el ítem "test landing específica" del billion-dollar backlog.
2. Revisar el copy del roadmap "Hacia dónde va OficiosPro" (promesa pública,
   nivel L4) — está escrito sin fechas ni compromisos, pero es su llamada.
3. Confirmar si el filtro de disponibilidad debería eliminarse por completo
   hasta tener agenda real (hoy quedó honesto pero sigue filtrando un dato
   declarativo).

## Métricas que deberían mejorar

- `click_offer_services` (nuevos sources: specialists_explorer, specialist_profile).
- `specialist_application_started` / landing→inicio (>8% umbral piloto).
- `profile_share` (nueva señal de pasaporte).
- Quejas/confusión por disponibilidad o perfiles demo: hacia 0.

## Validación

`npm.cmd run validate` ✅ · `npm.cmd run build` ✅ · `wrangler deploy --dry-run` ✅
Revisión manual dev: /especialistas (barra referencial + CTA + métricas honestas),
perfil público (compartir + verificado + CTA oficio), /especialistas-fundadores
(roadmap 3 columnas), mobile 375px sin overflow, consola sin errores.
