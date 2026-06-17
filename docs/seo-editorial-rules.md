# Reglas editoriales SEO

## Como aprobar nuevas paginas

1. Agregar la ruta a `src/data/seoRoutesData.json`.
2. Definir `editorialStatus`.
3. Definir `indexPolicy`.
4. Completar titulo, descripcion, imagen, FAQs, enlaces internos y CTAs.
5. Asignar `contentScore` y `minimumContentScore`.
6. Ejecutar `node scripts/generate-sitemap.mjs`.
7. Ejecutar `node scripts/seo-audit.mjs`.

Solo `editorialStatus = "approved"` e `indexPolicy = "index"` puede entrar al sitemap.

## ContentQualityScore

Cada ruta indexable debe alcanzar `contentQualityScore >= 70`. La auditoria considera:

- status 200;
- title y description especificos;
- canonical propio;
- un solo H1 claro;
- CTA util;
- FAQ o bloque util visible cuando aplica;
- JSON-LD en paginas SEO programaticas;
- longitud suficiente;
- ausencia de `noindex`;
- ausencia de duplicados obvios.

Si el score baja de 70, la ruta debe quedar `noindex`, salir del sitemap o volver a draft editorial.

## Como evitar spam y doorway pages

- No crear todas las combinaciones servicio/comuna.
- No publicar paginas que solo cambian el nombre de la comuna.
- No indexar paginas sin especialistas, demanda CRM, piloto activo o contenido editorial fuerte.
- No indexar oficios con `clientVisibility = forming` o `coverageStatus = waitlist` hasta que tengan contenido editorial fuerte y aprobacion operacional.
- No incluir query params en sitemap.
- No usar textos genericos repetidos.
- No inventar disponibilidad, rating, local fisico ni demanda.
- No publicar una pagina local solo porque existe la URL; debe tener demanda CRM, especialistas, piloto activo o contenido editorial fuerte.

## Cuando usar noindex

Usar `indexPolicy = "noindex"` cuando:

- la pagina esta en investigacion;
- no hay especialistas ni demanda;
- el contenido local no esta listo;
- existe riesgo de duplicidad;
- la ruta es interna, checkout, bolsa, admin, CRM, login o dashboard.

Las paginas noindex pueden existir para UX o preparacion editorial, pero no deben entrar al sitemap.

## Revision de paginas nuevas

Antes de aprobar una pagina nueva:

1. Validar que la intencion de busqueda no este mejor cubierta por una pagina existente.
2. Revisar que la descripcion y H1 sean unicos.
3. Confirmar CTA real y enlaces internos.
4. Confirmar que la FAQ se muestra en pantalla si se declara `FAQPage`.
5. Ejecutar `node scripts/generate-sitemap.mjs`.
6. Ejecutar `node scripts/seo-audit.mjs`.
7. Desplegar y ejecutar `node scripts/seo-live-audit.mjs`.

## Contenido requerido por pagina

Cada pagina indexable debe tener:

- H1 especifico;
- descripcion util;
- al menos dos FAQs visibles;
- CTA principal;
- minimo dos enlaces internos;
- imagen de oficio real;
- canonical propio;
- metadata title/description;
- schema coherente con contenido visible.

## Conexion con CRM

El CRM puede proponer oportunidades cuando detecta demanda repetida, por ejemplo "gasfiteria en Nunoa". Esa senal puede justificar una pagina local si se complementa con contenido editorial o especialistas publicados. El CRM no debe publicar rutas automaticamente.

Usar CRM para priorizar expansion cuando:

- hay varias solicitudes con el mismo servicio y comuna;
- hay oportunidades B2B recurrentes;
- hay especialistas publicados o postulantes aprobables en la zona;
- hay suficientes postulantes en una capa de la taxonomia (`tradeSegment`) para pasar de formacion a piloto;
- hay consultas que requieren una guia de seguridad o preparacion.

No usar CRM para publicar automaticamente. El CRM alimenta el backlog editorial, no el sitemap directo.

## Checklist de revision humana

- La busqueda tiene intencion clara.
- El contenido responde mejor que una busqueda filtrada generica.
- La pagina no promete disponibilidad que OficiosPro no tiene.
- Las advertencias de seguridad no ensenan reparaciones peligrosas.
- La pagina tiene un camino de conversion real.
- La ruta aparece o no aparece en sitemap segun su politica.
