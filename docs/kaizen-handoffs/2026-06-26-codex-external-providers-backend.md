# Handoff Codex - Backend External Provider Discovery

Fecha: 2026-06-26
Contexto previo: `docs/external-provider-discovery.md` (politica, riesgos, modelo de datos) y el
scaffolding frontend ya creado e inerte por defecto:
`src/lib/externalProviders/*`, `src/components/ExternalProvidersSection.tsx`,
integracion en `src/components/SpecialistsExplorer.tsx`.

Este documento entrega el trabajo de backend pendiente, listo para revisar y pegar.
NADA aqui se aplica automaticamente: la migracion se corre a mano y el endpoint se
despliega con `wrangler deploy`. Todo queda apagado mientras no exista la API key.

## Estado actual (que ya funciona hoy)

1. El frontend muestra la seccion externa SOLO si:
   `NEXT_PUBLIC_EXTERNAL_PROVIDERS_ENABLED === "true"` + baja cobertura propia
   (`ownResultCount <= 3`) + hay resultados. Por defecto el flag esta apagado y la
   seccion devuelve `null`.
2. El boton "Invitar a OficiosPro" ya envia un `submitConversionEvent`
   (`type: "external_provider_invite"`) que el Worker persiste en la tabla
   existente `conversion_events` via `POST /api/conversion-events/create`. Es decir,
   la captura del lead YA queda registrada sin tocar nada mas.
3. Lo que falta es: (a) el endpoint que entrega resultados en vivo, y
   (b) el enriquecimiento CRM (tabla dedicada + oportunidad en pipeline `oferta_externa`).

## Paso 1 - Migracion de base de datos

Archivo ya creado: `migrations/0010_external_provider_suggestions.sql`
(reflejado tambien en `schema.sql`).

Aplicar manualmente cuando se decida activar (NO en deploy automatico):

```
# Local (opcional, para probar)
wrangler d1 migrations apply oficiospro-leads --local

# Remoto (produccion)
wrangler d1 migrations apply oficiospro-leads --remote
```

La tabla guarda solo metadata operacional: `id, source, externalPlaceId, trade,
commune, region, searchQuery, suggestedByUserId, opportunityId, invitations, status,
createdAt, updatedAt`. NO guarda reviews, fotos, telefonos ni direcciones.

## Paso 2 - Variables de entorno (Worker)

Agregar a `interface Env` en `worker/index.ts` (cerca de `ADMIN_API_TOKEN?`):

```ts
  GOOGLE_PLACES_API_KEY?: string;
  GOOGLE_MAPS_API_KEY?: string;
```

Crear el secret (NO va en wrangler.toml ni en el repo):

```
wrangler secret put GOOGLE_PLACES_API_KEY
```

La key debe estar restringida en Google Cloud a la Places API y, si se puede,
por IP/uso. Nunca exponerla al cliente: el frontend solo llama al Worker.

## Paso 3 - Endpoint de busqueda en vivo

Registrar la ruta en el bloque de routing (junto a las otras rutas `/api/...`,
por ejemplo despues de `/api/specialists` GET, alrededor de la linea 245):

```ts
        if (url.pathname === "/api/external-providers/search" && request.method === "GET") {
          return withCors(await searchExternalProviders(request, env));
        }
```

Agregar el handler (zona de helpers, p.ej. cerca de `createConversionEvent`):

```ts
const EXTERNAL_ATTRIBUTION = "Datos de Google Maps";

async function searchExternalProviders(request: Request, env: Env): Promise<Response> {
  // Apagado si no hay key: el frontend ya tolera este estado.
  const apiKey = env.GOOGLE_PLACES_API_KEY ?? env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return json({ ok: true, status: "disabled", providers: [], attribution: "" });
  }
  await enforceRateLimit(request, "external_search", { limit: 30, windowMs: 60 * 60 * 1000 });

  const url = new URL(request.url);
  const trade = sanitizeText(url.searchParams.get("trade") ?? "", 80) ?? "";
  const commune = sanitizeText(url.searchParams.get("commune") ?? "", 80) ?? "";
  const region = sanitizeText(url.searchParams.get("region") ?? "", 80) ?? "";
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 4), 1), 8);
  if (!trade) return json({ ok: true, status: "ok", providers: [], attribution: EXTERNAL_ATTRIBUTION });

  // Places API (New) - Text Search. Solo pedimos los campos minimos via FieldMask.
  const textQuery = [trade, commune, region, "Chile"].filter(Boolean).join(" ");
  let providers: unknown[] = [];
  try {
    const resp = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        // Pedimos solo lo que vamos a MOSTRAR en vivo (no se persiste).
        "X-Goog-FieldMask": "places.id,places.displayName,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.shortFormattedAddress",
      },
      body: JSON.stringify({ textQuery, regionCode: "CL", languageCode: "es", maxResultCount: limit }),
    });
    if (!resp.ok) {
      return json({ ok: false, status: "error", providers: [], attribution: EXTERNAL_ATTRIBUTION, error: "places_unavailable" });
    }
    const data = (await resp.json()) as { places?: Record<string, unknown>[] };
    providers = (data.places ?? []).slice(0, limit).map((p) => ({
      externalPlaceId: String((p as any).id ?? ""),
      name: String(((p as any).displayName?.text) ?? ""),
      category: ((p as any).primaryTypeDisplayName?.text) ?? undefined,
      // Direccion corta solo para ubicar; NO se guarda en DB.
      commune: ((p as any).shortFormattedAddress) ?? undefined,
      region: region || undefined,
      rating: typeof (p as any).rating === "number" ? (p as any).rating : undefined,
      userRatingsTotal: typeof (p as any).userRatingCount === "number" ? (p as any).userRatingCount : undefined,
    }));
  } catch {
    return json({ ok: false, status: "error", providers: [], attribution: EXTERNAL_ATTRIBUTION, error: "fetch_failed" });
  }

  // IMPORTANTE: no persistimos NADA de esta respuesta. Es preview en vivo.
  return json({ ok: true, status: "ok", providers, attribution: EXTERNAL_ATTRIBUTION });
}
```

El cliente (`googlePlacesDiscovery.ts -> callEndpoint`) ya consume esta forma:
`{ providers: [...], attribution }` y normaliza cada fila. No requiere cambios.

## Paso 4 - Enriquecimiento CRM al invitar

El invite ya llega como conversion event. Para escalarlo a la tabla dedicada y a una
oportunidad CRM, interceptar dentro de `createConversionEvent` (worker/index.ts),
justo despues de `const id = await insertConversionEventRecord(...)`:

```ts
  if (event.type === "external_provider_invite") {
    await captureExternalProviderInvite(env.DB, body.payload as Record<string, unknown> | undefined);
  }
```

Y agregar el helper (usa la tabla de la migracion 0010 y el modelo CRM existente
`crm_opportunities` / `crm_tasks`; `pipeline` es texto libre, por eso `oferta_externa`
no requiere tocar el CHECK de `type`):

```ts
async function captureExternalProviderInvite(db: D1Database, payload?: Record<string, unknown>) {
  if (!db || !payload) return;
  const externalPlaceId = sanitizeText(payload.externalPlaceId, 200) ?? "";
  if (!externalPlaceId) return;
  const source = sanitizeText(payload.externalSource, 40) ?? "google_places";
  const trade = sanitizeText(payload.trade, 80) ?? "";
  const commune = sanitizeText(payload.commune, 80) ?? "";
  const region = sanitizeText(payload.region, 80) ?? "";
  const searchQuery = sanitizeText(payload.searchQuery, 200) ?? "";
  const now = new Date().toISOString();

  try {
    // Upsert idempotente por (source, externalPlaceId); cada invite suma 1.
    await db.prepare(
      `INSERT INTO external_provider_suggestions
        (id, source, externalPlaceId, trade, commune, region, searchQuery, status, invitations, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'invited', 1, ?, ?)
       ON CONFLICT(source, externalPlaceId) DO UPDATE SET
         invitations = invitations + 1,
         status = CASE WHEN status = 'suggested' THEN 'invited' ELSE status END,
         updatedAt = excluded.updatedAt`
    ).bind(`eps_${crypto.randomUUID()}`, source, externalPlaceId, trade, commune, region, searchQuery, now, now).run();

    // Oportunidad CRM en pipeline 'oferta_externa', stage 'sugerido' + tarea de contacto.
    const oppId = `opp_${crypto.randomUUID()}`;
    await db.prepare(
      `INSERT INTO crm_opportunities
        (id, title, type, pipeline, stage, priority, status, sourceEntityType, sourceEntityId, createdAt, updatedAt)
       VALUES (?, ?, 'specialist_onboarding', 'oferta_externa', 'sugerido', 'media', 'open', 'external_provider', ?, ?, ?)`
    ).bind(oppId, `Invitar proveedor externo (${trade || "oficio"} - ${commune || "comuna"})`, externalPlaceId, now, now).run();

    await db.prepare(
      `INSERT INTO crm_tasks (id, opportunityId, title, taskType, status, priority, createdAt, updatedAt)
       VALUES (?, ?, ?, 'followup', 'pending', 'media', ?, ?)`
    ).bind(`task_${crypto.randomUUID()}`, oppId, "Evaluar y contactar proveedor externo sugerido", now, now).run();

    await db.prepare(
      `UPDATE external_provider_suggestions SET opportunityId = ?, updatedAt = ?
       WHERE source = ? AND externalPlaceId = ? AND opportunityId IS NULL`
    ).bind(oppId, now, source, externalPlaceId).run();
  } catch {
    // Best-effort: el conversion event ya quedo registrado; no romper la respuesta.
  }
}
```

Nota: `type` en `crm_opportunities` tiene CHECK; usamos `specialist_onboarding`
(semanticamente: queremos sumar a este proveedor como especialista). El `pipeline`
es libre, asi que `oferta_externa` no necesita migracion de schema.

## Paso 5 - (Opcional) Endpoint admin para listar sugerencias

Si se quiere ver la tabla en el panel admin, replicar el patron de `listAdminTable`:

```ts
        if (url.pathname === "/api/admin/external-provider-suggestions" && request.method === "GET") {
          const auth = await authorizeAdmin(request, env);
          if (auth) return withCors(auth);
          if (!env.DB) return withCors(json({ ok: false, error: "database_not_configured" }, 503));
          const res = await env.DB.prepare(
            "SELECT * FROM external_provider_suggestions ORDER BY updatedAt DESC LIMIT 100"
          ).all();
          return withCors(json({ ok: true, suggestions: res.results ?? [] }));
        }
```

## Activacion (orden recomendado)

1. `wrangler secret put GOOGLE_PLACES_API_KEY` (key restringida).
2. Agregar campos a `interface Env` + handler `searchExternalProviders` + ruta.
3. (Opcional) interceptor CRM `captureExternalProviderInvite` + ruta admin.
4. `wrangler d1 migrations apply oficiospro-leads --remote`.
5. `npm run build` y `wrangler deploy`.
6. Activar el flag frontend solo cuando lo anterior este verificado:
   build con `NEXT_PUBLIC_EXTERNAL_PROVIDERS_ENABLED=true`.
7. Probar en una comuna/oficio de baja cobertura: debe aparecer la seccion
   "Empresas locales relacionadas", separada del ranking, con atribucion Google y
   badge "No verificado".

## Checklist de cumplimiento (mantener)

- No scraping ni copia masiva de fichas.
- Solo se persiste metadata operacional (`googlePlaceId` + contexto). Sin reviews,
  fotos, telefonos ni direcciones en DB.
- Atribucion "Datos de Google Maps" visible.
- Resultados externos SIEMPRE separados del ranking OficiosPro y marcados
  "No verificado por OficiosPro".
- Key Places solo en el Worker. Flag apagado por defecto.
- No tocar pagos, checkout, Bolsa, formalizacion ni wrangler.toml (salvo el binding
  ya existente).
