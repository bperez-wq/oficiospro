# Handoff Claude — i18n global layer (2026-06-28)

Capa de internacionalización + landing de demanda global, construida en un **worktree aislado**
para no colisionar con el trabajo simultáneo de Codex (Market Lab) en el árbol principal.

## Rama y worktree

- Rama: `kaizen/claude-2026-06-28-global-ux` (basada en `f238809` "Add global waitlist i18n foundation").
- Worktree: `C:\Users\Benjamin\oficiospro\oficiospro-claude-ux` (separado del árbol principal).
- Commits:
  - `f238809` (base, de Codex): foundation i18n (config, dictionaries, provider, GlobalWaitlist, layout).
  - Wire i18n switcher, translate shell and add /global waitlist route.
  - Translate home hero via i18n and add home dictionary keys.
  - (+ este doc / provider lang sync).

## Qué construí

- **i18n client-side** (static-export safe): provider, diccionarios tipados en 6 idiomas
  (es/en/pt/fr/de/it), `LanguageSwitcher` en header (desktop+mobile) y footer.
- **Shell traducido**: Header (nav, búsqueda, login) y Footer (tagline, chips, CTA global).
- **Home hero traducido** (`HomeHero` client component, mantiene look premium y tracking).
- **Ruta `/global`** (noindex): lista de espera honesta multilenguaje que captura país/ciudad/oficio/rol.
- **`<html lang>`** sincronizado con el idioma activo.
- Docs: `docs/i18n-architecture.md`.

## Cómo evito promesas falsas

- `/global` dice explícito: "estamos evaluando", "no hay disponibilidad garantizada todavía".
- No se muestran especialistas demo como reales en `/global`.
- No se exponen precios convertidos (no hay FX real); precios siguen en CLP/créditos.
- Ruta noindex para no generar SEO de mercados sin operación.

## Conexión a CRM (taxonomía unificada — implementada)

Decisión de Benjamín aplicada en `src/lib/marketLab/marketLabLeads.ts` (`submitMarketLabInterest`):
- clientes/empresas → `market_lab_demand_lead`
- especialistas → `market_lab_supply_lead`
- `global_waitlist` quedó como **source** (no como modelo separado); `campaign = global_prototype`.

Sin tocar Worker/D1: persiste el contacto vía `/api/leads` (`payment_interest`) con `payload.classification`
= el tipo demand/supply, y emite `submitConversionEvent(type = classification)` como señal CRM.
Tanto `/global` (GlobalWaitlist) como `/market-lab/...` (MarketLabLanding) usan este helper.

## Arquitectura híbrida (implementada)

- `/global` — entrada general (lista de espera honesta) + enlace a Market Lab. noindex.
- `/market-lab` — índice de mercados en exploración. noindex.
- `/market-lab/[country]/[city]/[trade]` — landing por mercado, `generateStaticParams`, noindex,
  `robots:{index:false}`. Copy: "estamos explorando", "sin disponibilidad garantizada", "perfiles
  referenciales si aplica".
- Datos: `src/data/marketLab.ts` (11 países/ciudades; oficios localizados por idioma; `status`,
  `seoStatus=noindex`, `paymentStatus=disabled/research_only`, `neighborhoodLabel`, etc.).

## Coordinación con Codex (Market Lab) — IMPORTANTE

Hay solapamiento intencional. División acordada: **Codex = motor/datos/rutas de mercado; Claude = i18n/UX encima.**
Pendiente de reconciliar al integrar ambas ramas:

1. **Taxonomía de leads:** unificar `global_waitlist` (mío) con `market_lab_supply_lead` /
   `market_lab_demand_lead` (Codex). Sugerencia: que `/global` use la clasificación de Codex.
2. **Rutas:** `/global` (mío, waitlist simple) vs `/market-lab/[country]/[city]/[trade]` (Codex).
   Decidir si `/global` queda como entrada general que enlaza a las landings de market-lab.
3. **Localización de oficios:** el menú de categorías y los `localTradeTerms` de Codex deberían
   alimentar futuras traducciones de oficios; hoy el shell traduce navegación, no el catálogo.
4. Las landings de market-lab de Codex pueden adoptar `useI18n()` para ser multilingües.

## Validaciones (en el worktree)

- `npm.cmd run validate` → passed.
- `npm.cmd run build` → OK (static export, todas las rutas + `/global`).
- `npx.cmd wrangler deploy --dry-run --assets ./out` → OK (bindings DB + ASSETS).

## Pendiente / decisiones de Benjamín

- **SEO multiidioma** (`/{lang}/...`, hreflang, sitemap por idioma, canonical): NO implementado, requiere
  tu aprobación explícita (ver `docs/i18n-architecture.md`). Hoy: i18n client-side + `/market-lab` noindex.
- Cuando un mercado muestre tracción, mover su `seoStatus` a `draft/approved` y decidir indexación.
- Activar `paymentStatus` solo tras decisión comercial/legal por país (hoy todos disabled/research_only).
- Traducir el resto del contenido (Home completo, páginas, modales) de forma incremental.
- **Merge:** esta rama parte de `main`; NO incluye los arreglos críticos (5 puntos + créditos 10 meses)
  que están en `kaizen/codex-2026-06-26-conversion-events-stability`. Decidir orden de merge.
- Reconciliar con la rama de Market Lab de Codex antes de integrar a `main`.

## Limpieza

Al terminar, el worktree `oficiospro-claude-ux` puede removerse con:
`git worktree remove ../oficiospro-claude-ux` (la rama y commits quedan en el repo).
