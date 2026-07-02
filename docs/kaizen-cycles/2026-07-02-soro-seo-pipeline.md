# Ciclo Kaizen 2026-07-02 — Pipeline controlado Soro SEO

Rama: `kaizen/claude-2026-07-02-soro-seo-pipeline`

## Objetivo

Integrar Soro SEO como motor de investigación y borradores (nunca autopublicador) para crecer tráfico orgánico calificado que convierta en especialistas, clientes, empresas e instituciones.

## Qué se hizo

- Auditoría del SEO actual: gates editoriales existentes (`src/lib/seo/policy.ts`, sitemap solo approved+index, robots correcto, 192 URLs) están sanos. Brechas: sin pipeline para contenido externo, sin capa AEO, sin hub de guías, sin playbook de Search Console.
- `src/data/soroSeoPipeline.ts`: modelo editorial tipado (13 estados) + 5 items iniciales, todos draft/noindex.
- `src/data/answerEngineTopics.ts`: 10 respuestas AEO/GEO con hechos verificados, todas en draft.
- `src/data/seoGuides.ts`: 5 guías iniciales completas, en draft (la ruta `/guias` queda para próximo ciclo).
- `src/lib/seo/soroClient.ts`: stub seguro; `publishDraft()` falla por diseño.
- `src/components/seo/AnswerBlock.tsx`: componente AEO con estilo OficiosPro (no integrado aún en páginas: pendiente con build local).
- `content/soro-drafts/`: README + 3 drafts de ejemplo con frontmatter obligatorio.
- `scripts/soro-content-audit.mjs` (`npm run soro:audit`): valida frontmatter, frases prohibidas, triggers tributarios/legales.
- `scripts/import-soro-draft.mjs` (`npm run soro:import`): copia a staging con checklist editorial; no publica ni toca sitemap.
- Docs: `soro-seo-editorial-policy.md`, `soro-seo-topic-briefs.md` (60 temas), `soro-seo-90-day-plan.md`, `soro-prompts.md`, `soro-seo-integration-plan.md`, `search-console-playbook.md` (nuevo), secciones Soro en `analytics-and-growth-tracking.md` y `organic-growth-playbook.md`.

## Cómo se evita autopublicación y spam

- Todo draft nace noindex; el audit rechaza `seoStatus: approved` en drafts.
- Aprobación exige `reviewedBy`/`reviewedAt` humanos en el pipeline.
- Sin código que escriba rutas productivas ni sitemap desde drafts.
- Reglas anti-doorway existentes intactas (no páginas por comuna sin contenido único).

## No se tocó

Worker, D1, wrangler.toml, pagos, checkout, Bolsa, Mercado Pago, comisión 9,5% + IVA, sitemap, robots, rutas productivas, páginas existentes.

## Pendiente (Codex / próximo ciclo)

- Ruta `/guias/[slug]` renderizando solo `getApprovedGuides()`.
- `/admin/crm/seo-content` leyendo datos estáticos del pipeline.
- Integrar `AnswerBlock` en páginas candidatas tras aprobar temas AEO.
- Integración API Soro (Fase 3) cuando existan docs y credenciales.

## Validación

Ver reporte del ciclo en el mensaje de cierre; `npm.cmd run build` y `npx.cmd wrangler deploy --dry-run --assets ./out` deben correrse en Windows (el sandbox de este ciclo solo tenía binarios win32 de swc/workerd).
