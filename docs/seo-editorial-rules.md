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

## Como evitar spam y doorway pages

- No crear todas las combinaciones servicio/comuna.
- No publicar paginas que solo cambian el nombre de la comuna.
- No indexar paginas sin especialistas, demanda CRM, piloto activo o contenido editorial fuerte.
- No incluir query params en sitemap.
- No usar textos genericos repetidos.
- No inventar disponibilidad, rating, local fisico ni demanda.

## Cuando usar noindex

Usar `indexPolicy = "noindex"` cuando:

- la pagina esta en investigacion;
- no hay especialistas ni demanda;
- el contenido local no esta listo;
- existe riesgo de duplicidad;
- la ruta es interna, checkout, bolsa, admin, CRM, login o dashboard.

Las paginas noindex pueden existir para UX o preparacion editorial, pero no deben entrar al sitemap.

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

## Checklist de revision humana

- La busqueda tiene intencion clara.
- El contenido responde mejor que una busqueda filtrada generica.
- La pagina no promete disponibilidad que OficiosPro no tiene.
- Las advertencias de seguridad no ensenan reparaciones peligrosas.
- La pagina tiene un camino de conversion real.
- La ruta aparece o no aparece en sitemap segun su politica.
