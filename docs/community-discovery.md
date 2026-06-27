# Descubrimiento colaborativo de especialistas

Objetivo: cuando un usuario elige su comuna y hay poca cobertura propia, OficiosPro
suma especialistas de dos formas, sin depender de Google y sin costo:

1. **Negocios cercanos de OpenStreetMap** (datos abiertos, gratis, sin API key).
2. **Recomendaciones de la comunidad**: cualquiera puede recomendar a un maestro que
   hace bien el trabajo. Le damos mas oportunidades y reconocemos a quien recomienda.

Esto reemplaza el plan original con Google Places (que tenia costo y riesgo de ToS).

## Por que OpenStreetMap y no Google

- Gratis y sin API key. CORS habilitado: corre desde el navegador, sin tocar el Worker.
- Licencia de datos abiertos (ODbL): no aplica la clausula de Google que prohibe usar
  su contenido para construir un servicio competidor.
- Mostramos resultados en vivo y NO guardamos contenido de OSM automaticamente.
- Atribucion "Datos de OpenStreetMap" siempre visible.
- Contrapartida: la cobertura de oficios chicos en OSM es despareja. Por eso el motor
  principal es la recomendacion colaborativa; OSM es un complemento.

## Como funciona (frontend, ya operativo)

Componente `src/components/ExternalProvidersSection.tsx`, montado en
`src/components/SpecialistsExplorer.tsx` despues de la grilla de resultados. Se muestra
solo cuando hay un oficio en contexto y la cobertura propia es baja
(`ownResultCount <= 4`). Contiene:

- **Listado OSM** (si hay resultados): tarjetas con nombre, rubro, comuna, badge
  "No verificado", "Ver en el mapa" y "Recomendar a OficiosPro". Separado del ranking
  de especialistas OficiosPro y con atribucion OSM.
- **Tarjeta de recomendacion** (`RecommendSpecialistCard`): formulario simple para
  recomendar a alguien (nombre, contacto opcional del especialista, motivo, y contacto
  opcional de quien recomienda para reconocerlo).

Pipeline OSM (`src/lib/externalProviders/openStreetMapDiscovery.ts`):
1. Nominatim resuelve la comuna a un bounding box (con cache).
2. Overpass busca negocios con tags `craft`/`shop` mapeados al oficio
   (`src/lib/externalProviders/osmTagMap.ts`).
3. Todo es best-effort: timeout, errores y vacios -> no se muestra nada, nunca rompe
   /especialistas.

## Captura de datos (que se guarda hoy y que no)

- Cada recomendacion o invitacion se registra HOY como conversion event
  (`type: "specialist_recommendation"`) via el endpoint existente
  `/api/conversion-events/create` -> tabla `conversion_events`. No requiere backend nuevo.
- De OSM NO se persiste contenido automaticamente (solo se muestra en vivo).
- De una recomendacion SI se guarda lo que el usuario aporta voluntariamente (nombre del
  recomendado, contacto, motivo, contacto de quien recomienda). Es un lead/referido normal.

## Modelo de merito y recompensa

Idea central: dar mas oportunidades a quienes hacen bien el trabajo y reconocer a quienes
recomiendan. Estructura sugerida (pendiente de definir montos/beneficios):

- **Recomendado que hace buen trabajo**: onboarding prioritario y mejor posicion inicial.
- **Quien recomienda**: reconocimiento o beneficio (ej. creditos, prioridad de atencion).
  Por eso pedimos su contacto opcional en el formulario.

El seguimiento de quien recomienda a quien queda en el payload del conversion event y, al
activar el enriquecimiento CRM, en la tabla `external_provider_suggestions`
(`recommenderContact`, `suggestedByUserId`).

## Banderas de configuracion

- `NEXT_PUBLIC_COMMUNITY_DISCOVERY_ENABLED` (default ON). "false" apaga toda la seccion.
- `NEXT_PUBLIC_OSM_DISCOVERY_ENABLED` (default ON). "false" apaga solo el listado OSM
  (la tarjeta de recomendacion sigue activa).
- No requiere ninguna API key.

## Pendiente CRM (handoff, opcional)

La migracion `migrations/0010_external_provider_suggestions.sql` (preparada, no aplicada)
agrega la tabla con columnas para recomendaciones (`recommendedName`,
`recommendedContact`, `recommenderContact`, `reason`) y una vista CRM `oferta_externa`.
Para escalar recomendaciones a oportunidades CRM y al programa de recompensa, ver el
interceptor `captureExternalProviderInvite` en
`docs/kaizen-handoffs/2026-06-26-codex-external-providers-backend.md` (el upsert por
`ON CONFLICT(source, externalPlaceId)` ya es compatible con el indice unico definido).

## Checklist de cumplimiento

- Sin scraping ni copia masiva. OSM mostrado en vivo, con atribucion ODbL.
- Resultados externos separados del ranking OficiosPro y marcados "No verificado".
- Sin costo ni API key. Banderas para apagar por si algo falla.
- No toca pagos, checkout, Bolsa, formalizacion, D1 ni wrangler.toml.
