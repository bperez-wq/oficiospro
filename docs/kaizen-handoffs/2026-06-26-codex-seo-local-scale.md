# Handoff Codex - Escalar SEO local por oficio x comuna

Origen: Claude (UX/contenido) + estrategia en `docs/seo-local-growth.md`.
Objetivo: que OficiosPro aparezca en Google para busquedas "{oficio} {comuna}" (ej. "gasfiter Nunoa"), escalando las paginas programaticas locales con contenido aprobado y unico.

## Diagnostico (por que hoy casi no indexamos)

Las paginas locales SE GENERAN todas (via `generateStaticParams` en `src/app/servicios/[servicio]/[comuna]/page.tsx`), pero el `sitemap.xml` aplica un gate editorial en `scripts/generate-sitemap.mjs`:

```
shouldIndex(route, parent):
  editorialStatus === "approved"
  && indexPolicy === "index"
  && contentScore >= minimumContentScore (default 80)
  && faqs.length >= 2
```

Resultado: la mayoria de `localPages` no pasan el gate (draft / contentScore bajo / <2 FAQs) y no se envian a Google. El cuello de botella es **contenido aprobado y unico por comuna**, no la plantilla.

## Archivos a tocar (Codex)

- `src/data/seoRoutesData.json` (fuente de verdad de rutas; tipos en `src/data/seoRoutes.ts`).
  - `seoCommunes[]`: { slug, name, region, nearby[], demandSignal }.
  - `seoServices[]`: SeoBaseRoute + { specialty, categoryId, includedServices[], creditRange, searchParams, localPages[] }.
  - `SeoLocalPage`: { communeSlug, title?, description?, faqs?, hasEnoughSpecialists?, editorialStatus, indexPolicy, contentScore, minimumContentScore? }.
- `scripts/generate-sitemap.mjs` (NO cambiar el gate; respetarlo).
- Regenerar `public/sitemap.xml` con `npm.cmd run seo:sitemap`.

NO tocar: Worker, D1, wrangler.toml, pagos, comision, ni la logica del gate (es una salvaguarda anti-thin-content).

## Tarea

1. Definir la **matriz prioritaria oficio x comuna** (empezar por demanda real): top oficios (gasfiteria, electricidad, climatizacion, cerrajeria, carpinteria, pintura, jardineria) x comunas de mayor demanda (cruzar con "comunas con mas interes" del panel `/admin/crm/acquisition` y `demandSignal`).
2. Para cada par, agregar/aprobar un `localPage` en el `seoService` correspondiente que **pase el gate**:
   - `editorialStatus: "approved"`, `indexPolicy: "index"`.
   - `contentScore >= minimumContentScore` (>=80).
   - `faqs`: minimo 2, **unicas y locales** (no copiar la misma FAQ entre comunas).
   - `title` y `description` intent-match: "{Oficio} en {Comuna} | OficiosPro" / descripcion con accion y cobertura honesta.
   - `nearby` poblado en `seoCommunes` para enlazado interno.
3. **Unicidad**: cada pagina debe tener contenido suficientemente distinto (intro/FAQ/servicios) para no ser thin/duplicada. Google ignora plantillas vacias replicadas.
4. Regenerar sitemap y verificar que las nuevas rutas aparecen.
5. (Cuando existan resenas reales) emitir `AggregateRating` en el schema; hoy NO (sin datos reales).

## Criterios de aceptacion

- `public/sitemap.xml` incluye las nuevas rutas `/servicios/{oficio}/{comuna}` aprobadas.
- Cada nueva pagina renderiza con title/description/FAQ unicos y structured data (Breadcrumb + Service areaServed + FAQPage + ItemList, ya en el template).
- `npm.cmd run validate` y `npm.cmd run build` pasan.
- `npx.cmd wrangler deploy --dry-run --assets ./out` pasa.
- Sin datos demo como reales; sin AggregateRating falso; sin promesas de disponibilidad inexistente.

## Validaciones

```
npm.cmd run seo:sitemap
npm.cmd run validate
npm.cmd run build
npx.cmd wrangler deploy --dry-run --assets ./out
```

## Despues (Benjamin)

- Google Business Profile de OficiosPro.
- Google Search Console: enviar sitemap, monitorear cobertura e impresiones por "{oficio} {comuna}".

## Ya hecho por Claude (no rehacer)

- `closingCta` en `/servicios/[servicio]/[comuna]` (CTA de cierre para convertir trafico SEO).
- `docs/seo-local-growth.md` (estrategia completa).
