# External Provider Discovery (Google Places) - OficiosPro

Diseno de una integracion segura y legalmente prudente para mostrar e invitar proveedores externos de oficios (encontrados en fuentes como Google Places) cuando OficiosPro tiene poca cobertura propia. Sin scraping ni apropiacion de datos.

Estado: DISENO + SCAFFOLDING. Deshabilitado por defecto (sin impacto en produccion). La parte que requiere clave server-side y CRM real es handoff a Codex.

---

## 1. Problema que resuelve

Cuando un usuario busca un oficio en una comuna donde OficiosPro aun tiene poca o ninguna oferta propia, la pagina queda "vacia". En vez de no mostrar nada, podemos mostrar una seccion **separada** de "Empresas locales relacionadas" provenientes de Google Maps, dejando claro que NO estan verificadas por OficiosPro, y ofrecer **invitarlas** a unirse. Asi: (a) damos utilidad al usuario, (b) construimos un pipeline de reclutamiento de oferta real.

## 2. Fuentes posibles

- **Google Places API** (principal). Requiere clave y cumplimiento de sus terminos.
- **OpenStreetMap / Overpass** (alternativa abierta; menos cobertura comercial).
- **Directorio manual** (proveedores cargados por operaciones).

Interfaz comun `ExternalProviderSource` para no acoplarnos a un solo proveedor.

## 3. Limites de Google Places (reglas a respetar)

- **No scraping** de Google Maps ni del HTML. Solo API oficial.
- **No copiar masivamente** fichas ni construir una base propia con su contenido.
- **No almacenar de forma permanente** ratings, reviews, fotos, telefonos ni direcciones de Places. Esos datos se muestran **en vivo** (fetch on demand) y no se persisten como base propia.
- **Caching**: Google permite cachear `place_id` de forma indefinida; el resto de campos tiene limites estrictos de retencion. Por eso solo persistimos `googlePlaceId` + metadata operacional minima (trade, commune, status del pipeline).
- **Atribucion**: mostrar "Datos de Google Maps" / atribucion conforme a sus politicas. Enlazar a Google Maps.
- **Sin clave en cliente**: la clave (`GOOGLE_PLACES_API_KEY`/`GOOGLE_MAPS_API_KEY`) es **server-side**. El cliente llama a un endpoint propio (Worker) que hace la llamada.

## 4. Que se puede mostrar (en vivo, no persistido)

- Nombre, categoria, comuna/zona aproximada.
- Rating, **solo si viene en la respuesta directa y se muestra en tiempo real** (no se guarda).
- Enlace "Abrir en Google Maps".
- Atribucion "Datos de Google Maps".

## 5. Que NO se debe almacenar

- Ratings, reviews, fotos, telefonos, direcciones de Places como base propia permanente.
- Cualquier copia masiva de fichas.

## 6. Que SI se persiste (minimo operacional)

Solo lo necesario para el pipeline de reclutamiento (ver modelo de datos): `externalPlaceId` (= googlePlaceId), `source`, `trade`, `commune`, `region`, `searchQuery`, `status`, timestamps. Nada de contenido restringido de Places.

## 7. Diferencia perfil OficiosPro vs resultado externo

- **Especialista OficiosPro**: perfil verificado/revisado, reputacion real, reservable con pago protegido. Ranking propio.
- **Resultado externo**: viene de Google Maps, **NO verificado por OficiosPro**, no reservable; badge explicito y seccion **separada**. Nunca se mezcla con el ranking de especialistas OficiosPro.

## 8. Riesgos legales / API

- Incumplir terminos de Google (scraping, retencion indebida) -> riesgo legal/suspension de API.
- Presentar resultados externos como "verificados" -> riesgo de confianza/legal. Mitigado con badge y seccion separada.
- Costo por request de Places -> mitigado con: mostrar solo cuando hay poca cobertura propia, cache de place_id, limites de resultados.

## 9. Modelo de invitacion / reclamo de perfil

1. Usuario ve resultado externo -> "Invitar a OficiosPro" / "Sugerir contacto".
2. Se registra una sugerencia (evento/lead) con `googlePlaceId`, trade, commune, source.
3. Operaciones (CRM) evalua y contacta al proveedor para onboardearlo.
4. Si el proveedor se une, puede "reclamar" y se crea un perfil OficiosPro real (claimed).

## 10. Modelo de datos (propuesto, NO aplicar sin revision)

Tabla futura (D1) - handoff Codex, no ejecutar remoto aqui:

```sql
CREATE TABLE IF NOT EXISTS external_provider_suggestions (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,            -- google_places | osm | manual
  externalPlaceId TEXT NOT NULL,   -- googlePlaceId (cacheable)
  trade TEXT,
  commune TEXT,
  region TEXT,
  searchQuery TEXT,
  suggestedByUserId TEXT,          -- opcional
  status TEXT NOT NULL DEFAULT 'suggested', -- suggested|invited|contacted|claimed|rejected|archived
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_eps_place ON external_provider_suggestions (externalPlaceId);
CREATE INDEX IF NOT EXISTS idx_eps_trade_commune ON external_provider_suggestions (trade, commune);
```

No se almacena contenido restringido de Places (ratings/reviews/fotos/telefonos/direcciones).

## 11. Arquitectura tecnica

- `src/lib/externalProviders/types.ts`: tipos + interface `ExternalProviderSource`.
- `src/lib/externalProviders/googlePlacesDiscovery.ts`: `GooglePlacesSource` (search, getDetails, buildExternalUrl, normalize). **Llama a un endpoint propio del Worker**, nunca a Google directo desde el cliente (no filtrar clave). Si no esta habilitado -> estado `disabled`, UI no se rompe.
- `src/lib/externalProviders/sources.ts`: stubs `OpenStreetMapSource`, `ManualDirectorySource`.
- `src/components/ExternalProvidersSection.tsx`: UI condicional, **devuelve null por defecto** (deshabilitado).
- Integracion en `/especialistas`: render inerte hasta habilitar.

Flag de habilitacion (cliente): `NEXT_PUBLIC_EXTERNAL_PROVIDERS_ENABLED=true`.
Clave (server, Worker): `GOOGLE_PLACES_API_KEY` o `GOOGLE_MAPS_API_KEY`.

## 12. Fases de implementacion

1. (Hecho) Diseno + scaffolding deshabilitado + UI separada + doc.
2. (Codex) Endpoint en Worker `/api/external-providers/search` que llama Places con la clave server-side, normaliza y devuelve preview en vivo (sin persistir contenido restringido); atribucion.
3. (Codex) Migracion `external_provider_suggestions` + endpoint para registrar sugerencias y crear oportunidad CRM (pipeline "oferta_externa", stage "sugerido", task "evaluar/contactar proveedor externo").
4. Activar flag, A/B de conversion de invitaciones, medir onboarding de proveedores externos.

## 13. Handoff Codex

- Crear endpoint Worker de busqueda Places (clave server-side, rate limit, cache de place_id, atribucion).
- Crear migracion + endpoint de sugerencias + oportunidad CRM.
- No exponer la clave al cliente. No persistir contenido restringido de Places.
