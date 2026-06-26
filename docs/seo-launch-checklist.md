# Checklist lanzamiento SEO

## Antes de publicar

- Revisar `src/data/seoRoutesData.json`.
- Confirmar que cada pagina indexable tiene `editorialStatus = "approved"`.
- Confirmar que drafts y paginas debiles usan `indexPolicy = "noindex"`.
- Ejecutar `node scripts/generate-sitemap.mjs`.
- Ejecutar `node scripts/seo-audit.mjs`.
- Ejecutar `node scripts/seo-live-audit.mjs` contra produccion despues de desplegar.
- Ejecutar `npm run validate`.
- Ejecutar `npm run build`.
- Ejecutar `npm run deploy:dry-run`.

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
- Verificar que `https://www.oficiospro.cl/robots.txt` incluye sitemap y bloquea admin/API/checkout/bolsa/login/dashboards.
- Ejecutar `node scripts/seo-live-audit.mjs` y exigir `error=0`.
- Comprobar que no hay URLs noindex dentro del sitemap.
- Comprobar que no hay URLs privadas dentro del sitemap.
- Comprobar que todas las URLs del sitemap responden `200`.
- Revisar que cada URL tenga title, description, canonical, H1 y robots indexable.
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

## Auditoria post-deploy

Comando recomendado:

```bash
node scripts/seo-live-audit.mjs
```

Variables utiles:

- `SEO_LIVE_AUDIT_SITEMAP_URL`: permite auditar otro sitemap.
- `SEO_LIVE_AUDIT_BASE_URL`: permite auditar otro dominio.
- `SEO_LIVE_AUDIT_SOURCE=local`: lee `public/sitemap.xml`, pero sigue auditando las URLs declaradas en ese archivo.
- `SEO_LIVE_AUDIT_LIMIT=5`: revisa una muestra corta.

Resultado esperado antes de Search Console:

- `error=0`.
- Ninguna URL privada.
- Ninguna URL `noindex` dentro del sitemap.
- Ninguna ruta indexable de la allowlist ausente del sitemap.
- Warnings resueltos o documentados.

## Expansion de 26 a 50 paginas

1. Revisar CRM por patrones repetidos de demanda: servicio, comuna, problema y segmento.
2. Confirmar oferta publicada o piloto activo en la zona.
3. Crear contenido local especifico, no solo reemplazar comuna.
4. Mantener `contentQualityScore >= 70` y `contentScore >= minimumContentScore`.
5. Agregar maximo 5-10 rutas por tanda y medir rendimiento antes de ampliar.
