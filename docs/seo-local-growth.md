# SEO local y crecimiento por oficio - OficiosPro

Objetivo: que OficiosPro aparezca en Google cuando alguien busca un oficio por zona (ej. "gasfiter Nunoa", "electricista a domicilio Maipu", "reparar calefont Las Condes"), y apalancar la senal de oferta/demanda local sin inventar datos ni infringir terminos de Google.

---

## 1. Realidad del resultado de Google

Cuando se busca "gasfiter" aparece el **local pack de Google Maps**: negocios con **Google Business Profile** (ficha con direccion + resenas + "abierto 24 h"). OficiosPro es un **marketplace**, no un negocio local por comuna, por lo que **no compite directo en ese paquete** salvo con su propia ficha de empresa.

Donde OficiosPro SI puede ganar:
1. **Resultados organicos** (links azules) para long-tail "{oficio} {comuna}", "{oficio} a domicilio {comuna}", "{problema} {comuna}".
2. **Ficha Google Business Profile** propia de OficiosPro (la gestiona Benjamin en Google; no es codigo).

No buscamos clonar el local pack: buscamos capturar al que busca y convertir la lista de proveedores locales en **mapa de reclutamiento y demanda**.

---

## 2. Estado actual (lo que ya existe)

- Rutas programaticas: `/servicios/[servicio]/[comuna]`, `/servicios/[servicio]`, `/soluciones/[problema]/[comuna]`, `/trabajos/[oficio]`, `/comunidades/[servicio]`, `/empresas/[segmento]`, `/especialistas/[id]`.
- Structured data (src/lib/seo/schema.ts): Organization, Website, Breadcrumb, Service (con areaServed), FAQPage, ItemList, ProfilePage.
- Sitemap generado por `scripts/generate-sitemap.mjs` + `robots.txt`.
- Captura de demanda en empty state (la pagina rankea, el cliente llega, deja solicitud aunque no haya oferta).
- Paneles `/admin/crm/acquisition` y business-health miden comunas/oficios con mas interes.

## 3. Brechas (lo que falta)

1. **Escala del programatico/sitemap.** `seoRoutesData.json` (fuente del sitemap) declara muy pocas rutas frente a 346 comunas y decenas de oficios. La plantilla existe; falta poblarla. Esta es la brecha #1.
2. **AggregateRating / resenas:** no se emiten (correcto hoy: no hay datos reales; Google penaliza structured data falso).
3. **Google Business Profile** propio: pendiente (Benjamin).
4. **Contenido unico por pagina:** evitar paginas thin/duplicadas al escalar (Google ignora plantillas vacias).

---

## 4. Plan de posicionamiento por oficio

1. **Escalar `oficio x comuna`** para el top de oficios (gasfiteria, electricidad, climatizacion, cerrajeria, carpinteria, pintura, jardineria...) por las comunas de mayor demanda, e **incluir todas en el sitemap**.
2. **Contenido util y unico** por pagina: intro local, servicios frecuentes, rango de creditos, FAQ con intencion local, links a comunas cercanas y al servicio nacional (ya implementado en el template).
3. **Titulos/meta intent-match**: "{Oficio} en {Comuna} | OficiosPro" + descripcion con la accion ("compara y solicita / cobertura honesta").
4. **Captura de demanda** donde no hay supply (ya existe): convierte trafico en leads + senal de demanda por comuna.
5. **CTA de cierre** en las paginas locales (implementado: `closingCta` en `/servicios/[servicio]/[comuna]`).
6. **Resenas reales -> AggregateRating** solo cuando existan (handoff Codex), porque mejora CTR con estrellas en el snippet.

---

## 5. Apalancar la informacion tipo Maps (etico)

La lista de proveedores por zona NO se scrapea ni se copia (terminos de Google + legal + regla de no perfiles falsos). Su valor:

- **Mapa de reclutamiento:** cada proveedor de la zona es un especialista a onboardear en OficiosPro. La densidad por comuna indica a quien contactar para sumar supply real -> luego sus perfiles reales pueblan las paginas comuna.
- **Mapa de demanda:** densidad de busquedas/oferta prioriza que comunas lanzar primero y donde reclutar. Cruza con "comunas con mas interes" del panel de captacion.

Resultado: SEO (capta clientes) + reclutamiento (suma especialistas reales) se retroalimentan por comuna.

---

## 6. Quien hace que

- **Claude (UX/contenido):** plantillas y copy por oficio/comuna, titulos/meta, FAQ local, enlazado interno, structured data en pagina, CTA de cierre, UX de captura de demanda.
- **Codex (datos/infra):** poblar `seoRoutesData.json` y `seoRoutes.ts` a escala, generar sitemap completo sin romper export `./out`, conectar `AggregateRating` a resenas reales, performance (imagenes), indexacion. No tocar Worker/D1/pagos fuera de alcance.
- **Benjamin (negocio):** Google Business Profile de OficiosPro, Google Search Console (enviar sitemap, monitorear cobertura/keywords), validar resenas reales.

---

## 7. Metricas a seguir

- Paginas indexadas y impresiones/clics por consulta en Search Console.
- Posicion media para "{oficio} {comuna}" objetivo.
- Leads por pagina local (demand capture) y comunas con mas demanda sin supply.
- Especialistas onboardeados por comuna prioritaria.

## 8. Proximos pasos sugeridos

1. (Codex) Definir matriz oficio x comuna prioritaria y poblar datos + sitemap.
2. (Claude) Revisar/ampliar el copy y FAQ local de las plantillas para que cada pagina sea unica y util.
3. (Benjamin) Crear GBP + Search Console + enviar sitemap.
4. (Codex) Cuando haya resenas reales, emitir AggregateRating.
