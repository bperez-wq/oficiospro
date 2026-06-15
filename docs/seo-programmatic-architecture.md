# Arquitectura SEO programatica OficiosPro

## Diagnostico inicial

OficiosPro ya tenia rutas publicas valiosas: Home, `/especialistas`, perfiles publicos, `/club-hogar`, `/empresas`, `/registro-especialista`, FAQ y soporte. Tambien existian rutas internas que no deben competir en busqueda: admin, CRM, checkout, bolsa, login, dashboards y endpoints API.

El riesgo principal era abrir combinaciones infinitas por servicio, comuna y problema sin revision editorial. Eso podria crear doorway pages, contenido duplicado o paginas vacias. La nueva arquitectura parte con una allowlist pequena y revisada.

## Modelo de rutas

- Servicio nacional: `/servicios/[servicio]`
- Servicio local aprobado: `/servicios/[servicio]/[comuna]`
- Problema local aprobado: `/soluciones/[problema]/[comuna]`
- Captacion especialista: `/trabajos/[oficio]`
- Segmentos B2B: `/empresas/[segmento]`
- Comunidades: `/comunidades/[servicio]`

La fuente editorial vive en `src/data/seoRoutesData.json` y se expone tipada desde `src/data/seoRoutes.ts`.

## Criterios de indexacion

Cada ruta necesita:

- `editorialStatus = "approved"`
- `indexPolicy = "index"`
- `contentScore >= minimumContentScore`
- FAQ visible
- CTA util
- enlaces internos
- intencion de busqueda clara

Las paginas locales necesitan ademas al menos una senal: especialistas publicados, demanda CRM, contenido editorial fuerte o piloto activo. La funcion central es `getSeoIndexPolicy(pageContext)`.

## Reglas noindex

Se dejan fuera del indice:

- drafts, archived o rutas marcadas `noindex`
- paginas con contenido insuficiente
- combinaciones generadas sin revision
- busquedas internas con query params
- checkout, bolsa, admin, CRM, login, dashboards y API

El sitemap no incluye ninguna URL noindex ni rutas con query params.

## Contenido minimo

Servicio nacional: hero claro, servicios incluidos, creditos/modalidad, especialistas si existen, problemas relacionados, FAQ y enlaces internos.

Servicio/comuna: descripcion local honesta, disponibilidad real, especialistas publicados si existen, empty state honesto si no hay oferta, FAQ local o heredada y comunas/servicios cercanos.

Problema/comuna: explicacion del problema, senales de urgencia, informacion a preparar, advertencias de seguridad, CTA de diagnostico y FAQ visible.

Captacion especialista: beneficios, requisitos, privacidad de documentos, proceso de postulacion y FAQ sin prometer ingresos garantizados.

B2B/comunidades: caso de uso, creditos empresa, facturacion/operacion, seguimiento y CTA comercial.

## Schema recomendado

`src/lib/seo/schema.ts` genera:

- `Organization`
- `WebSite`
- `BreadcrumbList`
- `Service`
- `FAQPage` solo si la FAQ esta visible
- `ItemList` solo si hay especialistas relacionados
- `ProfilePage` preparado para perfiles publicos

No se inventan `aggregateRating`, locales fisicos por comuna ni datos que no aparezcan en contenido visible.

## Sitemap strategy

`scripts/generate-sitemap.mjs` lee la allowlist y genera `public/sitemap.xml`. Incluye rutas base publicas y rutas SEO aprobadas. Excluye admin, CRM, checkout, bolsa, login, dashboards, API, query params y rutas noindex.

## Riesgos y mitigaciones

- Doorway pages: mitigado con allowlist, score minimo y revision editorial.
- Duplicidad por comuna: mitigada con `seo-audit`, contenido local y noindex por defecto si falta evidencia.
- Paginas vacias: mitigadas con empty state honesto y noindex cuando no hay senal local.
- Datos falsos: no se muestran datos demo ni ratings inventados en schema.
- Dependencia DB: las paginas SEO no bloquean build si D1/CRM no esta disponible.

## Plan por fases

1. Piloto: publicar servicios y combinaciones locales ya aprobadas.
2. Medicion: revisar Search Console, CRM y conversiones por ruta.
3. Expansion editorial: sumar comunas solo con demanda, especialistas o contenido local fuerte.
4. Automatizacion controlada: usar CRM para proponer rutas, nunca para publicarlas sin aprobacion humana.
