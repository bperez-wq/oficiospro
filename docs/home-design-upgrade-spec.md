# Home Design Upgrade — Spec de conversión y jerarquía visual

Objetivo: que la Home deje de sentirse como landing extensa y funcione como marketplace premium orientado a conversión. Referencias: Mercado Libre (oferta visible), ClassPass (créditos), Apple (ritmo visual), Airbnb/Booking (confianza).

## 1. Diagnóstico (antes)

- Demasiado texto antes de ver personas y acción: hero con 3 CTAs + 6 chips + colage de 520px también en mobile; bloque "Propósito" completo antes de "Cómo funciona".
- Dos grillas de categorías (12 cards "Rubros" + 8 "Categorías") con descripciones largas: ~3 pantallas de scroll redundante.
- Franja de destacados con poco peso (py-5, título xl, sin flechas, sin subtítulo).
- Sin accesos rápidos por problema (el usuario tenía que entender el catálogo).
- "Especialistas disponibles" (3 cards gigantes de ~1.400px) interrumpía el flujo a mitad de página.
- Créditos explicados con componente largo; "24 meses" sobre-prometido visualmente.
- Empresas era texto institucional + chips, sin visual de segmentos.
- Paneles SEO (cobertura, catálogo, validación, búsquedas locales) abiertos al final: muy largos.
- Sin `prefers-reduced-motion`.

## 2. Orden nuevo de secciones

1. Hero compacto con buscador protagonista.
2. **Especialistas destacados** (peso visual aumentado).
3. **¿Qué necesitas resolver?** — accesos rápidos por problema.
4. Stats de confianza (5 tiles).
5. Cómo funciona (workflow visual existente, header comprimido).
6. Trabajos realizados (proof gallery existente).
7. Club Hogar + **simulador compacto de créditos**.
8. Empresas/comunidades con **cards visuales de segmentos**.
9. Propósito + Confianza (testimonios) + Especialistas disponibles (3 perfiles).
10. Referidos + CTA por rol.
11. **Categorías en accordion** (reemplaza las 2 grillas).
12. Red OficiosPro: paneles SEO **colapsados** (`<details>`, contenido indexable).

## 3. Decisiones visuales por sección

**Hero**: colage de imagen solo en `lg+` (en mobile el buscador y CTAs quedan a 1 pantalla); copy reducido a 1 línea ("Explora sin registrarte, compara reputación y reserva o cotiza pagando con créditos"); CTAs = Buscar especialista (primario) + Postular (sun) + link "¿Cómo funcionan los créditos?" → `#club-hogar`; chips de confianza de 6 → 4; padding `py-10 md:py-16` (antes `py-16 md:py-24`).

**Especialistas destacados** (`FeaturedSpecialistsStrip`): sección `py-8 md:py-10`, título `2xl/3xl` + subtítulo "Compara reputación, precio en créditos y disponibilidad"; **flechas de carrusel en desktop** (`scrollBy ±440px` suave) junto a "Ver todos"; cards más grandes en desktop (`lg:215px / xl:205px`); se mantienen fades laterales, snap mobile (~1.3 cards visibles, edge-to-edge) y skeleton/empty. Cotizar/Reservar sigue pasando por `addSpecialistToBagAndProceed` (Bolsa + contexto).

**Accesos rápidos** (`QuickProblemLinks`): 12 chips (Filtración, Calefont, Electricidad, A/C, Jardín, Portón, Cámaras, Pintura, Piscina, Riego, Emergencia, Mantención empresa) con icono + link real a `/especialistas?categoria=…&especialidad=…(&q=…)`; una sola fila envolvente, sin bloques grandes.

**Cómo funciona**: se conserva `HowItWorksFlow` (timeline conectado + mini-mockups + CTA); se elimina el bloque Propósito que lo precedía y se acorta el header → sección `section-compact`.

**Trabajos realizados**: se conserva `WorkProofGallery` (destacada 2×2, badges "Trabajo verificado", CTA por trabajo a búsqueda filtrada).

**Créditos** (`HomeCreditPreview`): simulador compacto con 3 servicios de ejemplo y pill "Club Hogar: N créditos · ahorras 2" (descuento leído de `commercialConfig`, no hardcodeado); CTAs "Ver planes" y "Comprar créditos"; nota de que el precio se confirma antes de retener. "24 meses" se reemplazó por "acumulables" en stats y chips (configurable vía `plan.accumulatesMonths`, sin sobre-promesa visual).

**Empresas** (`HomeBusinessUseCases`): 4 cards con imagen + overlay (Comunidades, Oficinas y comercios, Restaurantes y frío, Industria y bodegas) usando assets propios (`/assets/work-*.webp`, `club-empresas-small.webp`), cada una → `/especialistas` filtrado; CTAs "Solicitar cuenta empresa" + "Ver soluciones empresas".

**Categorías** (`HomeCategoryAccordion`): 6 grupos (Hogar, Comunidades, Empresas, Industria, Agroindustria y campos, Emergencias) en `<details>` nativos — sin JS, accesibles e indexables; primer grupo abierto; subcategorías como chips-link; botón "Ver todas las categorías".

**SEO comprimido**: `CollapsiblePanel` (details) envuelve NationalCoverage/SpecialtyCatalog/Validation/LocalSeo — el contenido sigue en el DOM para SEO pero ocupa 4 filas cerradas.

## 4. Mobile

- Hero: sin colage, ~1 pantalla hasta el buscador; CTAs apilados full-width.
- Destacados como segunda sección: el usuario ve personas en el primer swipe.
- Chips de problemas tocables (min-h-44px), categorías en accordion (no 20 cards seguidas).
- Carruseles con snap + edge-bleed, sin scroll horizontal accidental (`overscroll-x-contain`, `min-w-0`).
- `prefers-reduced-motion` global en `globals.css`.

## 5. Conversión

Cada bloque tiene CTA accionable: hero (buscar/postular/créditos), strip (Cotizar/Reservar→Bolsa, Ver todos), chips (búsqueda filtrada), cómo funciona (Buscar ahora), trabajos (Buscar este servicio), créditos (Ver planes/Comprar), empresas (Solicitar cuenta), categorías (links reales), roles (3 CTAs). Tracking vía `data-event` en cada CTA nuevo.

## 6. Componentes

Creados: `QuickProblemLinks`, `HomeCategoryAccordion`, `HomeCreditPreview`, `HomeBusinessUseCases`. Modificados: `page.tsx` (orden + hero + accordion + paneles colapsables + helper `CollapsiblePanel`), `FeaturedSpecialistsStrip` (peso visual + flechas), `globals.css` (reduced-motion). Sin tocar: Header, BookingDrawer, Bolsa, checkout, pagos, worker, wrangler.

## 7. Pendientes

- Reemplazar emojis de chips por íconos SVG propios cuando exista set de iconografía.
- A/B del orden Club Hogar vs Empresas según tráfico real.
- Fotos reales de trabajos por comuna para la proof gallery.
- Toast de feedback global al agregar a Bolsa (hoy el feedback es la apertura del drawer/navegación).
