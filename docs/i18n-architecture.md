# i18n architecture (prototipo global)

Capa de internacionalización de OficiosPro para prototipar el producto en varios idiomas
y medir dónde hay tracción antes de invertir en operación local (oferta, pagos, legal).

Filosofía: **pensar global, validar local**. El motor es común; la activación real es por mercado.
Complementa el trabajo de Market Lab (Codex): Market Lab = datos/rutas/mercados; i18n = capa de
presentación multilingüe sobre ese motor.

## Decisión técnica clave

El sitio es **static export** (`output: export` → `out/`, servido por Cloudflare Worker).
No se usa el i18n routing nativo de Next porque exigiría reestructurar las ~300 rutas bajo
`/[lang]/...` (eso sí sería "rehacer la plataforma"). En su lugar:

- **i18n client-side** con un Context provider, diccionarios tipados y persistencia en `localStorage`.
- Render inicial en `es` (estático) y ajuste tras el montaje según `localStorage` → idioma del navegador.
- `<html lang>` se sincroniza con el idioma activo (a11y + SEO básico).

Trade-off consciente: **no hay URL por idioma todavía** (no per-locale SEO). Es suficiente para un
prototipo de medición. El siguiente paso de SEO real está descrito abajo.

## Archivos

| Archivo | Rol |
| --- | --- |
| `src/lib/i18n/config.ts` | Locales soportados, default, metadata (label, flag, intl, currency), `resolveLocale`. |
| `src/lib/i18n/dictionaries.ts` | Diccionarios. `es` es la fuente de verdad y define el tipo `Dictionary` (con `WidenDictionary` para permitir literales por idioma). |
| `src/lib/i18n/I18nProvider.tsx` | Provider client-side: `locale`, `setLocale`, `t(path)`, `tList(path)`. Detección y persistencia. |
| `src/components/LanguageSwitcher.tsx` | Selector de idioma (header desktop+mobile y footer). |
| `src/components/HomeHero.tsx` | Columna izquierda del hero de Home, traducida. |
| `src/components/GlobalWaitlist.tsx` | Landing de demanda global (lista de espera honesta). |
| `src/app/global/page.tsx` | Ruta `/global` (noindex). |

Wiring: `src/app/layout.tsx` envuelve la app en `<I18nProvider>`. `Header` y `Footer` consumen `useI18n()`.

## Idiomas soportados

`es` (default, Chile), `en`, `pt`, `fr`, `de`, `it`. Definidos en `config.ts` → `locales`.

La `currency` en `localeMeta` es **referencial**: NO se muestran precios convertidos porque no hay
tipo de cambio real ni operación en esos países. Los precios siguen en CLP/créditos.

## Cómo traducir una superficie nueva

1. Agregar las claves al objeto `es` en `dictionaries.ts` (fuente de verdad).
2. Agregar las mismas claves en `en/pt/fr/de/it` (TypeScript obliga: `Dictionary`).
3. En un **client component**, usar `const { t, tList } = useI18n()` y reemplazar el texto:
   - `t("seccion.clave")` para strings.
   - `tList("seccion.clave")` para arrays.
4. Si la superficie es un server component, extraer el bloque traducible a un client component
   (como se hizo con `HomeHero`), manteniendo clases y tracking.

Fallback: si falta una clave en el idioma activo, `t()` cae a `es` y, si tampoco está, devuelve la clave.

## Estado actual (traducido)

- Shell completo: Header (nav, búsqueda, login, switcher) y Footer (tagline, chips, CTA global, switcher).
- Home hero (`HomeHero`).
- Landing `/global` completa.

Pendiente (incremental, no bloqueante): resto de Home, páginas de contenido (`/club-hogar`, `/empresas`,
`/faq`, etc.), modales y dashboards. El menú de categorías viene de `tradeTaxonomy` (es) y requiere
estrategia aparte de localización de oficios (ver Market Lab de Codex).

## Captura de demanda global (honesta)

`/global` NO promete cobertura. Copy explícito: "estamos evaluando", "no hay disponibilidad garantizada".
Captura país/ciudad/oficio/rol/idioma y lo envía por la infraestructura de leads existente (sin tocar el Worker):

- `submitLead({ leadType: "payment_interest", ..., payload: { kind: "global_waitlist", country, city, trade, role } })`.
- `submitConversionEvent({ type: "global_waitlist", payload: {...} })` como señal de analítica.

Pendiente CRM: alinear el marcador `global_waitlist` con la clasificación de Codex
(`market_lab_supply_lead` / `market_lab_demand_lead`) para no duplicar taxonomías de leads.

## Camino a SEO real por idioma (siguiente fase, requiere decisión)

Cuando un mercado muestre tracción y se quiera SEO multilingüe indexable:

1. Introducir segmento `/[lang]/...` con `generateStaticParams` por locale (solo para rutas que se
   decida indexar, no las ~300 de una vez).
2. `hreflang` y `<link rel="alternate">` por idioma.
3. Diccionarios server-side para esas rutas (render del idioma en HTML, no solo client).
4. Mantener `es` sin prefijo como default para no romper URLs actuales.

Esto es un proyecto en sí mismo y debe aprobarse por su impacto en SEO y routing.
