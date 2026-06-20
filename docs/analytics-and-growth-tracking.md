# Analytics and growth tracking

Este documento define la medicion propia para adquisicion y conversion de especialistas en OficiosPro.

## Objetivo

Medir el camino completo desde visita hasta postulacion enviada:

1. Visita a Home o landing publica.
2. Click en CTA de especialista.
3. Visita a `/especialistas-fundadores`.
4. Click hacia registro.
5. Inicio de registro.
6. Avance por pasos.
7. Abandono o envio final.
8. Lectura operacional en `/admin/crm/acquisition`.

## Capa tecnica

- Cliente: `src/lib/analytics/index.ts`.
- Page view helper: `src/components/AnalyticsTracker.tsx`.
- Compatibilidad con eventos existentes: `src/lib/leadClient.ts`.
- Endpoint usado: `POST /api/conversion-events/create`.
- Tabla D1 usada: `conversion_events`.
- Lectura admin: `GET /api/admin/conversion-events`.

No se creo un endpoint nuevo `/api/events` en este ciclo para evitar tocar Worker. La capa cliente ya deja el payload con forma de analytics y puede migrarse a `/api/events` cuando se apruebe tocar Worker.

## Eventos medidos

| Evento | Donde ocurre | Uso |
| --- | --- | --- |
| `page_view` | Paginas publicas de referidos e instituciones | Trafico publico general |
| `home_view` | Home | Base del funnel |
| `specialist_home_cta_viewed` | Home | Exposicion temprana a CTA especialista |
| `click_search_specialist` | Buscador del hero | Intencion cliente |
| `click_offer_services` | CTA especialista en Home | Intencion especialista |
| `founder_landing_view` | `/especialistas-fundadores` | Visitas a landing fundadora |
| `founder_cta_click` | CTAs de landing fundadora | Click hacia registro |
| `specialist_application_started` | Apertura de registro especialista | Inicio real del formulario |
| `specialist_application_step_started` | Registro especialista | Paso visto o retomado |
| `specialist_application_step_completed` | Avance de paso en registro | Friccion por paso |
| `specialist_application_step_error` | Validacion de paso | Donde se bloquea el registro |
| `specialist_application_failed` | Envio no completado | Error tecnico o fallback humano |
| `specialist_application_abandoned` | Salida de registro antes de enviar | Abandono |
| `specialist_application_submitted` | Envio de postulacion | Conversion principal |
| `specialist_custom_trade_requested` | Registro especialista | Oficio no encontrado en catalogo |
| `specialist_formalization_help_requested` | Registro especialista | Barrera tributaria/formalizacion |
| `search_performed` | Busqueda enviada | Demanda cliente |
| `lead_submitted` | Lead enviado | Conversion generica |
| `referral_link_created` | Herramienta de referidos | Activacion de referidores |
| `institution_contact_submitted` | Formulario institucional | Alianzas / OMIL / programas |

## Campos comunes

Cada evento incluye:

- `path`
- `referrer`
- `utmSource`
- `utmMedium`
- `utmCampaign`
- `utmContent`
- `source`
- `medium`
- `campaign`
- `referralCode`
- `anonymousId`
- `sessionId`
- `timestamp`
- `sourceComponent`
- `sourceButton`
- `payload` con metadata no sensible

## Privacidad

La capa de analytics filtra y redacta:

- RUT
- passwords
- tokens
- secretos
- documentos
- cedula
- selfie
- emails dentro de texto libre

No usar analytics para guardar archivos, credenciales, documentos, RUT completo ni notas sensibles.

## Revision semanal

Revisar cada lunes:

1. Visitas 7 dias.
2. Clicks `click_offer_services`.
3. `founder_landing_view`.
4. `founder_cta_click`.
5. `specialist_application_started`.
6. `specialist_application_step_started` y `specialist_application_step_completed` por paso.
7. `specialist_application_step_error` por motivo.
8. `specialist_application_failed`.
9. `specialist_application_abandoned` por paso.
10. `specialist_application_submitted`.
11. Oficios no encontrados y solicitudes de ayuda tributaria.
12. Top fuentes y campanas UTM.
13. Acciones para la semana siguiente.

## Campos de adquisicion especialista

Los eventos y postulaciones de especialista deben permitir segmentar sin exponer datos sensibles:

- `source`, `medium`, `campaign`
- `sourceComponent`, `sourceButton`
- `trade`, `primaryTrade`, `tradeSegment`
- `commune`, `region`
- `coverageStatus`
- `selectedSpecialties`
- `hasCustomTradeRequest` o `customTradeRequestLength`
- `needsFormalizationHelp`
- `step`, `stepName`, `reason`

El texto libre de "no encuentro mi oficio" se guarda en la postulacion/CRM para operacion, pero analytics evita usarlo como dato sensible masivo y prioriza largo o bandera.

## Test end-to-end del funnel

Para verificar que los eventos lleguen a D1 y aparezcan en la lectura admin:

```powershell
cd C:\Users\Benjamin\oficiospro\oficiospro
$env:APP_BASE_URL="https://www.oficiospro.cl"
$env:ADMIN_TOKEN="pega_aqui_el_token_real"
node scripts/test-specialist-funnel-events.mjs
```

El script:

- valida primero `ADMIN_TOKEN`;
- crea solo eventos marcados con `source=e2e_test`, `isTest=true` y `testRunId`;
- simula una postulacion especialista con email `example.com`;
- consulta `GET /api/admin/conversion-events`;
- consulta `GET /api/admin/specialists`;
- resume clicks, landing, inicio, pasos, oficio no listado y ayuda de formalizacion.

Si `ADMIN_TOKEN` no es aceptado, el script no crea datos de prueba.

## Regla operativa

Si hay visitas pero no clicks: mejorar propuesta y CTA.

Si hay clicks pero no landing views: revisar rutas, performance o links.

Si hay landing views pero no CTA clicks: simplificar landing y repetir CTA.

Si hay starts pero no submits: reducir friccion del paso con mas abandono.

Si hay submits pero pocos especialistas publicados: revisar operacion CRM, SLA y aprobacion.

Conversion real del ciclo especialista = `specialist_application_submitted` con `stored=true` y postulacion visible en admin. Los eventos previos son senales de diagnostico, no conversion final.
