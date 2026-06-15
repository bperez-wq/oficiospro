# Checklist lanzamiento SEO

## Antes de publicar

- Revisar `src/data/seoRoutesData.json`.
- Confirmar que cada pagina indexable tiene `editorialStatus = "approved"`.
- Confirmar que drafts y paginas debiles usan `indexPolicy = "noindex"`.
- Ejecutar `node scripts/generate-sitemap.mjs`.
- Ejecutar `node scripts/seo-audit.mjs`.
- Ejecutar `npm run validate`.
- Ejecutar `npm run build`.
- Ejecutar `wrangler deploy --dry-run --assets ./out`.

## Rutas a probar

- `/servicios/gasfiteria`
- `/servicios/electricidad`
- `/servicios/gasfiteria/nunoa`
- `/soluciones/filtracion-de-agua/nunoa`
- `/trabajos/gasfiter`
- `/empresas/mantencion-oficinas`
- `/comunidades/portones`
- `/sitemap.xml`
- `/robots.txt`

## Que no debe indexarse

- `/admin/`
- `/api/`
- `/checkout/`
- `/bolsa/`
- `/login/`
- `/dashboard-cliente/`
- `/dashboard-empresa/`
- `/dashboard-especialista/`
- busquedas con query params de `/especialistas`

## Antes de enviar a Search Console

- Verificar que `https://www.oficiospro.cl/sitemap.xml` responde.
- Comprobar que no hay URLs noindex dentro del sitemap.
- Revisar que las paginas locales no sean duplicadas.
- Revisar que las paginas sin especialistas muestren estado honesto.
- Validar que el CTA lleva a `/especialistas`, `/contacto`, `/empresas` o `/registro-especialista`.
- Revisar Lighthouse/HTML renderizado en mobile.
- Esperar datos reales de CRM antes de ampliar mas comunas.

## Publicacion gradual

1. Enviar solo sitemap inicial.
2. Medir impresiones, clicks, leads y conversiones.
3. Revisar rutas con baja calidad o alta tasa de rebote.
4. Agregar nuevas rutas solo desde backlog editorial y senales CRM.
5. Mantener auditoria SEO en cada PR que toque la allowlist.
