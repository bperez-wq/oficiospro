# Design Spec — Marketplace Proof Sections & Compact Specialist Grid

Especificación estilo Figma para las secciones rediseñadas de la Home y la grilla compacta de `/especialistas`. Sirve como referencia para mantener consistencia al iterar estos bloques.

---

## 1. Tokens visuales (fuente de verdad: `tailwind.config` + `globals.css`)

| Token | Valor | Uso |
|---|---|---|
| `brand` | `#08746f` | CTA primario, acentos, dots |
| `brand-dark` | `#066b65` | Hover CTA, texto sobre brand-soft |
| `brand-soft` | `#dff4ef` | Fondos suaves, chips |
| `accent` / `accent-dark` / `accent-soft` | `#2f6fed` / `#1d4ed8` / `#e9f1ff` | Paso 2, chips secundarios |
| `sun` / `sun-dark` / `sun-soft` | `#f2a93b` / `#d98a24` / `#fff3dc` | Paso 3, estados "retenido" |
| `ink` | `#14201f` | Texto principal, overlays oscuros |
| `muted` | `#2c3a38` | Texto secundario |
| `line` | `rgba(20,32,31,0.12)` | Bordes |
| `gold` | `#d98a24` | Rating ★, nivel Oro |
| Sombras | `shadow-sm → shadow-card → shadow-lift` | Reposo → hover card → hover destacado |
| Radios | controles `12–16px` (`rounded-xl`), cards compactas `18–20px`, cards sección `24px`, paneles `28–32px` | Jerarquía de contenedores |

Niveles de especialista (chips): Platino `violet-100/700`, Oro `gold/15 + gold`, Plata `slate-100/600`, Bronce `amber-100/700`, Fundador `brand-soft + brand-dark`.

Disponibilidad (dot): `now` → `emerald-500`, `today` → `amber-400`, `tomorrow` → `slate-300`.

---

## 2. "Cómo funciona" → `HowItWorksFlow.tsx`

### Layout
- **Desktop (lg+)**: 4 columnas (`lg:grid-cols-4`, gap 16px). Línea de progreso horizontal (`h-px`, gradiente brand→accent→sun, opacity 50%) cruzando los dots numerados (44×44px, gradiente por paso) a `top: 22px`.
- **Mobile**: timeline vertical. Dots a la izquierda (col de 44px, `pl-14` en el contenido), línea vertical (`w-px`, mismo gradiente, opacity 40%) conectando los pasos.

### Anatomía de cada paso
1. Dot numerado con gradiente (`from-brand`, `from-accent`, `from-sun`, `from-brand`).
2. Card compacta: `rounded-[24px]`, borde `line`, `bg-white/95`, padding 16px, `shadow-sm`.
3. Fila icono (SVG stroke 2.4, 20px, `text-brand-dark`) + título (`text-base font-black`).
4. Microcopy accionable (13px, `text-muted`, `min-h-10` para alinear filas).
5. **Mini-visual** en panel `bg-slate-50 rounded-2xl p-2.5` (en hover pasa a `brand-soft/40`):
   - Paso 1: input de búsqueda fake + chips de filtro (Gasfitería / Ñuñoa / Hoy).
   - Paso 2: mini-card de especialista (avatar iniciales, nombre, ★ rating, trabajos, chip Oro).
   - Paso 3: mini-wallet (créditos, pill "Retenidos" en sun, barra de progreso).
   - Paso 4: 5 estrellas + chips "Pago liberado" (emerald) y "Reputación ↑" (brand).

### Hover
Card: `-translate-y-1`, borde `brand/30`, `shadow-card`, 300ms. Mini-visual cambia de fondo.

### CTA
Centrado bajo el flujo: `btn-primary` "Buscar especialista ahora" → `/especialistas?sourceSection=home_how_it_works`, con línea de confianza debajo ("Pago protegido…").

---

## 3. "Trabajos realizados" → `WorkProofGallery.tsx`

### Layout
- **Desktop (lg+)**: grid editorial 3×2 (`lg:grid-cols-3 lg:grid-rows-2`, gap 16px):
  - Card destacada: `col-span-2 row-span-2` (≈2× altura).
  - 3 cards secundarias 1×1.
  - Tile CTA de cierre (gradiente brand-soft→accent-soft) con titular de confianza y `btn-primary`.
- **Tablet (md)**: `grid-cols-2`, sin spans forzados.
- **Mobile**: carrusel horizontal `snap-x snap-mandatory`, cards al 82% del viewport, edge-bleed (`-mx-5 px-5`).

### Anatomía de card de evidencia
- Imagen full-bleed (`absolute inset-0`, `object-cover`, zoom 105% en hover, 500ms).
- Overlay `gradient-to-t from-ink/85 via-ink/25 to-ink/10`.
- Badges superiores: "● Trabajo verificado" (pill blanca, dot brand) + "★ rating" (pill `ink/70`).
- Bloque inferior: título (xl; destacada: 2xl/3xl), "Comuna · Servicio", pills `white/15` ("N créditos", "Especialista verificado").
- CTA por card: pill blanca `min-h-10` con flecha animada — "Buscar gasfíter / electricista / climatización / jardinero" → `/especialistas?categoria=…&especialidad=…&sourceSection=home_work_proof_gallery`.

Mapeo trabajo→búsqueda en `storyMeta` (clave: título del trabajo). Trabajos nuevos sin mapeo caen a "Buscar especialista".

---

## 4. Card compacta de especialista → `SpecialistGridCard.tsx`

### Grid en `/especialistas` (SpecialistsExplorer)
| Breakpoint | Columnas |
|---|---|
| `<640px` (mobile) | 1 |
| `sm` (≥640, tablet) | 2 |
| `lg` (≥1024, laptop) | 3 |
| `xl` (≥1280, desktop) | 4 |

Gap 16px. Sidebar de filtros: 240px (antes 260px). El mapa referencial se movió **debajo** de los resultados para priorizar cards above the fold.

### Anatomía (altura objetivo ≈ 360–390px)
1. **Header visual** `h-32`: foto con zoom hover, degradado inferior `ink/55`, badge disponibilidad (pill blanca + dot semántico, esquina sup. izq.), badge "★ rating" (pill `ink/75`, sup. der.).
2. **Identidad**: nombre (sm, truncate) + oficio (xs, truncate).
3. **Fila de reputación** (pills 11px): nivel (color por tier) · "N trabajos" · "Resp. {tiempo}".
4. **Trust badges**: máx. 2, formato corto ("✓ Verificado", "✓ Resp. rápida"), emerald.
5. **Precio**: panel `brand-soft/50`, label "Precio"/"Servicio relacionado" (si hay intención de búsqueda) + resumen en créditos (truncate + `title`).
6. **Ubicación**: comuna + "a X,X km".
7. **Acciones**: 2 botones 50/50, `min-h-10` — "Ver perfil" (outline) / "Reservar" o "Cotizar" (brand). `active:scale-[0.98]`.

### Criterios
- Hover: `-translate-y-1`, borde `brand/30`, `shadow-card`, 300ms.
- Nada de párrafos: solo datos comparables. El detalle vive en el perfil.
- `matchedService` + `highlightedCreditPrice` conservan el filtro por intención (mismo contrato que la card antigua).
- "Reservar" delega en `onReserve(id, service)` del explorer (modal de conversión + `preserveSpecialistIntent`): no duplicar lógica en la card.

---

## 5. Criterios mobile globales
- Touch targets ≥ 40px (`min-h-10`); CTAs principales `min-h-12`.
- Carruseles: `snap-x snap-mandatory` + `no-scrollbar` + edge-bleed con `scroll-px-5`.
- 1 card de especialista por fila; tipografía no baja de 11px en datos, 14px en nombres.
- Sticky CTA de filtros/resultados se mantiene (`StickyMobileCTA`).

## 6. Qué NO tocar al iterar
- `SpecialistCard.tsx` (card grande) queda para la Home y vistas de detalle.
- Lógica de filtros, query params, intención, booking y pagos: solo presentación cambió.
