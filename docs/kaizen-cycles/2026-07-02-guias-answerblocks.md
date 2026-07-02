# Ciclo Kaizen 2026-07-02b — Ruta /guias y AnswerBlocks

Rama: `kaizen/claude-2026-07-02-soro-seo-pipeline` (continuación del ciclo Soro SEO).

## Qué se hizo

- Ruta `/guias/[slug]`: renderiza solo guías con `editorialStatus: "approved"` (`dynamicParams = false`), con metadata vía `buildSeoMetadata`, JSON-LD (BreadcrumbList, WebPage, FAQPage) y diseño OficiosPro (hero, steps numerados, FAQ, CTA, enlaces internos, disclaimer tributario visible).
- Índice `/guias`: lista guías aprobadas; noindex mientras el hub sea pequeño.
- `src/data/seoGuidesData.json`: fuente única del estado publicable de guías, compartida entre `seoGuides.ts` y `generate-sitemap.mjs`.
- Aprobadas 3 guías de riesgo bajo: `como-ofrecer-mis-servicios`, `como-encontrar-especialista-confiable`, `oficios-en-la-era-ia`. Las 2 tributarias siguen draft hasta revisión tributaria.
- `generate-sitemap.mjs`: agrega `/guias/[slug]` solo si approved + reviewedBy + reviewedAt. Sitemap regenerado: 195 URLs (192 + 3 guías).
- AnswerBlocks integrados (1 por página): `/formalizacion` (formalización asistida), `/especialistas-fundadores` (qué es un fundador), `/instituciones` (cómo funciona para instituciones). Temas AEO correspondientes aprobados en `answerEngineTopics.ts`.

## Control editorial

La aprobación de las 3 guías y 3 temas AEO se registró a nombre de Benjamin Perez con fecha 2026-07-02: deben leerse antes del deploy a producción. Todo el contenido restante sigue draft.

## Validación

- `soro:audit` OK, `validate` OK, `tsc` scoped OK sobre los 9 archivos del ciclo.
- `npm.cmd run build` + `npx.cmd wrangler deploy --dry-run --assets ./out` pendientes en Windows (binarios win32).

## Pendiente

- Leer y confirmar las 3 guías aprobadas antes del deploy.
- Enlace a `/guias` en Footer (descubrimiento).
- `/admin/crm/seo-content` (Codex).
- Tras el deploy: enviar sitemap actualizado en Search Console.
