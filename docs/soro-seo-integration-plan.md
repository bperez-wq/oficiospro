# Plan de integración Soro SEO

Estado actual: **integración manual**. No hay API conectada, no hay credenciales en el repo y no existe (ni existirá) autopublicación.

## Fase 1 — Manual (vigente)

1. Investigar keywords y generar briefs dentro de Soro usando `docs/soro-prompts.md`.
2. Exportar borradores como Markdown con el frontmatter de `content/soro-drafts/README.md`.
3. Guardar en `content/soro-drafts/`.
4. `npm run soro:audit` → corregir errores.
5. `npm run soro:import <archivo>` → copia a `content/soro-staging/` + checklist editorial.
6. Revisión humana según `docs/soro-seo-editorial-policy.md`.
7. Publicación manual (cuando exista la ruta `/guias`) + registro en `src/data/soroSeoPipeline.ts`.

## Fase 2 — Export estructurado

Igual que Fase 1, pero con exports por lote desde Soro (Markdown + metadata). El importador se extiende para procesar carpetas completas. Sigue sin haber publicación automática.

## Fase 3 — API (pendiente para Codex)

Solo cuando exista documentación oficial de la API de Soro y credenciales gestionadas fuera del repo.

Variables de entorno posibles (nunca hardcodeadas):

- `SORO_API_KEY`
- `SORO_WEBHOOK_SECRET`
- `SORO_PROJECT_ID`

Adapter: `src/lib/seo/soroClient.ts` (ya creado como stub seguro):

- Sin variables de entorno → estado `disabled`, todas las funciones devuelven `ok: false`.
- `publishDraft()` **siempre** falla, incluso con credenciales: la publicación es humana por política.
- Un webhook de Soro solo podría depositar drafts en `content/soro-drafts/` (equivalente a Fase 1 automatizada), jamás publicar.

Flujo futuro completo:

```
Soro keyword → Soro draft → import (manual o webhook a drafts/)
→ soro:audit → revisión editorial humana → approved en soroSeoPipeline.ts
→ publicación manual → generate-sitemap.mjs → seo-audit.mjs → Search Console
```

## Cómo se evita la autopublicación

1. No existe código que escriba rutas productivas desde drafts.
2. `soroClient.publishDraft()` devuelve error por diseño.
3. Los drafts nacen `seoStatus: noindex`; el audit rechaza `approved` en drafts.
4. El sitemap solo lo genera `generate-sitemap.mjs` desde datos aprobados.
5. La aprobación exige `reviewedBy` + `reviewedAt` humanos en `soroSeoPipeline.ts`.

## Pendientes para Codex

- Ruta `/guias/[slug]` renderizando solo `getApprovedGuides()` de `src/data/seoGuides.ts`, con metadata, JSON-LD FAQPage y diseño OficiosPro (hero + respuesta corta + steps + FAQ + CTA, mobile-first). Incluir guías approved en `generate-sitemap.mjs` recién entonces.
- Página interna `/admin/crm/seo-content` que lea `soroSeoPipeline.ts` + `answerEngineTopics.ts` + resultado de `soro:audit` (datos estáticos, sin backend, sin métricas inventadas).
- Integrar `AnswerBlock` (ya creado en `src/components/seo/AnswerBlock.tsx`) en `/especialistas-fundadores`, `/formalizacion` e `/instituciones` con temas AEO una vez aprobados (1-2 bloques máximo por página).
- Fase 3 de API Soro cuando exista documentación y credenciales.

## Cómo medir resultados

Ver `docs/search-console-playbook.md` (rutina semanal/mensual) y la sección "Contenido Soro" de `docs/analytics-and-growth-tracking.md`.
