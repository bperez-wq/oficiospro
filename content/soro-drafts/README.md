# Drafts Soro SEO

Carpeta de **borradores** de contenido investigado o redactado con Soro SEO.

## Reglas

- Nada en esta carpeta se publica automáticamente. Nunca.
- Todo draft nace con `seoStatus: noindex` en su frontmatter.
- Ningún archivo aquí entra al sitemap ni a rutas productivas.
- Antes de mover un draft a revisión editorial, debe pasar `npm run soro:audit`.
- El flujo completo está en `docs/soro-seo-editorial-policy.md`.

## Flujo

1. Exportar draft desde Soro (o escribirlo manual) como Markdown en esta carpeta.
2. Completar el frontmatter obligatorio (ver plantilla abajo).
3. Ejecutar `npm run soro:audit` y corregir errores.
4. Ejecutar `node scripts/import-soro-draft.mjs <archivo>` para moverlo a staging con checklist editorial.
5. Revisión humana: editorial → fact-check → marca → SEO → (tributaria/legal si aplica).
6. Solo un humano decide aprobar y publicar, actualizando `src/data/soroSeoPipeline.ts`.

## Frontmatter obligatorio

```yaml
---
title:
metaTitle:
metaDescription:
keyword:
audience: # cliente | especialista | empresa | comunidad | institucion
funnelStage: # awareness | consideration | conversion
targetPageType: # guia | servicio | solucion | trabajo | institucion | formalizacion | empresa
canonicalTarget:
seoStatus: noindex
requiresTaxReview: # true si menciona boleta/factura/IVA/retencion/SII
requiresLegalReview: # true si menciona gobierno/convenios/municipios
ctaTarget:
internalLinks: []
factCheckNotes:
---
```

## Prohibiciones (el audit las detecta)

- Inventar cobertura, disponibilidad, especialistas, precios o ratings.
- Prometer ingresos o resultados garantizados.
- Claims tipo "los mejores", "garantizado", "número uno" sin evidencia.
- Asesoría tributaria definitiva sin disclaimer ni revisión.
- Contenido duplicado que solo cambia la comuna.
