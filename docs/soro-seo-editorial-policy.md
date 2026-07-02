# Política editorial Soro SEO

## Qué es Soro SEO

Soro SEO es una plataforma externa que puede investigar palabras clave, generar briefs, redactar contenido SEO y, en teoría, publicar contenido. En OficiosPro se usa **solo como motor de investigación y borradores**. Nunca como autopublicador.

## Cómo se usa en OficiosPro

| Actividad | ¿Automatizable con Soro? |
|---|---|
| Investigación de keywords | Sí |
| Generación de briefs | Sí, con revisión |
| Borradores de artículos/guías | Sí, siempre como draft noindex |
| Fact-checking | No: humano |
| Aprobación editorial | No: humano |
| Publicación | No: humano |
| Cambios de sitemap/robots/canonical | No: humano + scripts existentes |
| Contenido tributario/legal definitivo | No: requiere revisión experta |

## Flujo editorial

```
Soro keyword → brief → draft Markdown → content/soro-drafts/
→ npm run soro:audit → node scripts/import-soro-draft.mjs <archivo>
→ content/soro-staging/ → revisión editorial → fact-check → revisión de marca
→ revisión SEO → (revisión tributaria/legal si aplica)
→ aprobación humana registrada en src/data/soroSeoPipeline.ts
→ publicación manual → sitemap solo si approved+index → Search Console
```

Los estados del pipeline están tipados en `src/data/soroSeoPipeline.ts`. Todo contenido de Soro entra como `draft`/`noindex` y solo un revisor humano (campo `reviewedBy` + `reviewedAt`) puede subirlo a `approved`.

## Control humano

- Nadie publica contenido de Soro directo a producción. No existe conexión de publicación (ver `src/lib/seo/soroClient.ts`: `publishDraft()` siempre falla por diseño).
- Toda pieza pasa mínimo por: revisión editorial, fact-check, revisión de marca y revisión SEO.
- Contenido tributario pasa además por revisión tributaria (checklist en `docs/accountant-validation-checklist.md`).
- Contenido que menciona municipios, gobierno o convenios pasa por revisión institucional/legal.

## Checklist antes de publicar

1. `npm run soro:audit` sin errores.
2. Intención de búsqueda no cubierta mejor por página existente.
3. Título, H1 y metaDescription únicos.
4. Cero claims inventados (cobertura, disponibilidad, especialistas, precios, ratings).
5. CTA correcto y funcionando.
6. Enlaces internos validados contra rutas reales.
7. Canonical definido.
8. Disclaimers tributarios visibles si aplica.
9. Revisión registrada en `soroSeoPipeline.ts` (`reviewedBy`, `reviewedAt`).
10. Después de publicar: `npm run seo:sitemap` + `npm run seo:audit`.

## Reglas noindex

- Todo draft nace `noindex` y así se mantiene hasta aprobación.
- Página publicada pero aún en observación: `noindex` hasta cumplir `contentQualityScore >= 70` (regla existente de `docs/seo-editorial-rules.md`).
- Página con desempeño malo sostenido: volver a `noindex` o archivar.

## Reglas de sitemap

- Solo entra contenido `editorialStatus = approved` + `indexPolicy = index` (regla existente, no cambia).
- El sitemap se regenera solo con `scripts/generate-sitemap.mjs`. Ningún script de Soro toca el sitemap.

## Reglas de canonical

- Si existe una página productiva que responde la misma intención, el contenido nuevo debe apuntar su canonical ahí o no crearse.
- Nunca dos páginas indexables para la misma intención + comuna.

## Reglas de claims

Prohibido sin evidencia verificable: "los mejores", "garantizado", "número uno", "atención inmediata", "cobertura en todo Chile", tiempos de llegada, cantidad de especialistas inventada, ratings inventados, precios de mercado inventados.

## Reglas para temas tributarios

- Todo contenido que mencione boleta, factura, IVA, retención o SII lleva `requiresTaxReview: true`.
- Siempre disclaimer visible: orientación general, no asesoría tributaria.
- Nunca decir que OficiosPro reemplaza al contador.
- Tasas y reglas siempre con referencia a verificar en sii.cl (cambian por ley).

## Reglas para comunas

- No crear páginas por comuna que solo cambian el nombre de la comuna.
- Una página local requiere: demanda CRM, especialistas reales, piloto activo o contenido editorial local fuerte (regla existente).
- No prometer cobertura donde no existe.

## Reglas para especialistas

- No inventar especialistas, ratings, disponibilidad ni volumen de trabajos.
- No prometer ingresos ni cantidad de clientes.
- El único claim seguro: perfil gratuito, comisión 9,5% + IVA sobre servicios gestionados.

## Reglas para instituciones

- No prometer convenios, resultados de empleabilidad ni cifras garantizadas.
- Pilotos siempre descritos como "caso a caso" y medibles.
- Menciones a organismos públicos requieren revisión institucional.

## Reglas para contenido global / Market Lab

- Contenido de tesis (oficios en la era IA) puede ser global, pero sin datos inventados de mercado.
- Si cita estudios o cifras externas, con fuente verificable o no se publica.

## Cómo medir resultados

Ver `docs/search-console-playbook.md` y la sección Soro de `docs/analytics-and-growth-tracking.md`. Métricas por pieza: impresiones, clics, CTR, posición media, leads, registros de especialista, solicitudes de cliente. Contenido con impresiones y sin conversión en 60-90 días se actualiza, se fusiona o se pasa a noindex.
