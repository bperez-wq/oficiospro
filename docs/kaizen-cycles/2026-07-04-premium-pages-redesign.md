# Kaizen 2026-07-04 — Rediseño premium: Club Hogar, Empresas, Referidos, Soporte

Rama: `kaizen/claude-premium-pages-redesign`
Solicitado por Benjamin: "estas pestañas están super fomes en diseño".

## Diagnóstico

Las cuatro páginas tenían contenido sólido (comparadores, planes, FAQ,
herramienta de referidos, accordions) pero **todos los heros eran planos y
blancos**: cero fotografía, cero color, cero drama visual. El problema no era
el contenido sino la primera impresión.

## Solución: `PremiumPhotoHero` (componente reutilizable)

Un solo componente nuevo (`src/components/PremiumPhotoHero.tsx`) en vez de
cuatro heros duplicados: fotografía real de oficios como textura de fondo
(decorativa, aria-hidden, opacity 16%), gradiente de profundidad, pill con
`pulse-dot`, chips con check, footnote de honestidad y slot para tarjeta
flotante. Dos tonos: `brand` (gradiente verde cálido) y `enterprise` (shell
oscuro existente). Mantiene los textos i18n (`t("pages.<key>.*")`).

## Por página

- **Club Hogar** (tono brand, foto hero-hogar): tarjeta flotante "Plan
  destacado" con datos reales del plan (precio, créditos mensuales,
  acumulación) y ancla a #planes; chips derivados de la configuración vigente
  (créditos/mes, acumulables, descuento por servicio, pago protegido); CTAs
  re-estilizados (btn-sun + ghost blanco); footnote: "configuración vigente de
  los planes".
- **Empresas** (tono enterprise, foto industria-tablero): mini-dashboard
  flotante con chip "Ejemplo" (mismos strings i18n de la sección inferior);
  chips de capacidades; footnote de apertura controlada con contacto
  operacional.
- **Soporte** (tono brand, foto equipo): panel "Ir directo a" con las 3
  audiencias como anclas (#soy-cliente/#soy-especialista/#soy-empresa,
  scroll-mt para el header); chips de temas; footnote "una persona real antes
  que prometer respuestas automáticas".
- **Referidos** ("Recomienda y gana"): hero envuelto en gradiente
  brand-soft→sun-soft con hero-aura y pill "Recomienda y gana reconocimiento"
  con pulso. Sin cambios de lógica (programa sigue explícitamente no
  monetario).

## Honestidad

- Ninguna métrica nueva inventada: la tarjeta de Club Hogar usa datos de
  configuración de planes; la de Empresas conserva el chip "Ejemplo".
- Fotos de fondo decorativas, nunca presentadas como especialistas publicados.
- Footnotes explícitos de piloto/apertura controlada en Empresas y Soporte.

## Accesibilidad / mobile

- Imágenes de fondo aria-hidden; nav de anclas con aria-label; foco visible
  heredado del sistema; pulso neutralizado por prefers-reduced-motion.
- Verificado a 390px en las 4 páginas: sin scroll horizontal, consola limpia.

## Validación

`npm.cmd run validate` ✅ · `npm.cmd run build` ✅ · `wrangler --dry-run` ✅

## Segundo pase (aprobado por Benjamin): secciones intermedias

- **Club Hogar — simulador de acumulación**: los 4 tiles planos (Mes 1/3/6/12)
  ahora son un mini gráfico de barras con crecimiento animado (`.op-grow`,
  scaleY desde la base, delay escalonado; neutralizado por el kill-switch de
  prefers-reduced-motion). Alturas proporcionales al total de 12 meses
  (14/25/50/100%) — matemática real del plan, no decoración.
- **Club Hogar — comparador con/sin club**: la card "sin suscripción" se
  atenúa (slate) para que la card Club domine; nueva franja de ahorro honesta:
  "Ahorro en estos 4 ejemplos · −{descuento×4} créditos" (aritmética de los
  ejemplos mostrados, config vigente).
- **Empresas — feature cards con fotografía**: las 6 features i18n pasan de
  cards de texto plano a cards con banda fotográfica temática (planos,
  tablero, mantención, medidor, obra, planta), overlay de profundidad y
  hover-zoom sutil. Imágenes decorativas (aria-hidden); el significado sigue
  en el texto.
- Verificado: barras con alturas correctas, franja de ahorro, 6 fotos
  resolviendo (probe 1168×784), 390px sin overflow en ambas páginas, consola
  limpia.

## Pendientes / próximos

- Secciones intermedias de estas páginas (comparador Club Hogar, features
  Empresas) podrían recibir el mismo tratamiento en un segundo pase si Benjamin
  quiere más profundidad.
- Sigue pendiente la decisión de copy de activación de Club Hogar y el merge a
  main de la cadena kaizen.
