# Operational Foundation Audit

## Alcance Revisado

- `worker/index.ts`: leads, postulaciones, pagos, webhook, admin token, rate limit, email.
- `wrangler.toml`: D1 documentado pero binding remoto aun debe activarse por ambiente.
- `migrations/`: base de leads y publicacion especialista; nueva fundacion operacional en `0003`.
- `src/lib/storage.ts`: estado local para dashboards, pagos, wallet y datos de piloto.
- `src/lib/leadClient.ts`: envio real a API con respaldo local si falla DB/red.
- `src/lib/payments/*`, `src/lib/finance/*`, `src/lib/creditLedger.ts`: modelos y funciones financieras parciales.
- `src/components/Forms.tsx`: formularios conectados a leads; postulacion especialista operativa para piloto.
- `src/components/LoginEntryModal.tsx`: login mock/browser, no auth real.
- `src/components/AdminPanel.tsx`: admin visual con varios datos locales.
- `src/app/admin/leads/*`: vista real parcial contra `/api/admin/leads`.
- `src/app/bolsa/page.tsx`, `src/app/checkout/page.tsx`: flujo Bolsa/checkout con Mercado Pago foundation.
- `src/data/mock.ts`, `src/data/visualAssets.ts`: catalogo visual y especialistas fallback para piloto.

## Que Sigue Siendo Mock O Local

- Login y sesiones browser en `localStorage`.
- Dashboards cliente/especialista/empresa con seed local.
- Admin visual principal con pagos, leads comerciales, payouts y especialistas de estado local.
- Bolsa/carrito en browser storage.
- Wallet y ledger frontend en `localStorage` para experiencia piloto.
- Catalogo de especialistas publicos en `src/data/mock.ts` como fallback de marketplace.

## Que Ya Usa D1/API Real

- `/api/leads`, `/api/contact`, `/api/specialists/apply`, `/api/jobs/request`, `/api/companies/request`, `/api/bookings/request`.
- `/api/admin/leads` y cambio de estado.
- Tablas de `lead_submissions`, `specialist_applications`, `customer_leads`, `company_leads`, `service_requests`, `conversion_events`.
- Emails via Resend si `RESEND_API_KEY` y variables de remitente/destino estan configuradas.

## Listo Para Piloto

- Captura de leads y postulaciones con fallback humano.
- Admin leads como fuente real del piloto.
- Registro especialista fundador sin documentos obligatorios.
- Bolsa y checkout con copy honesto de piloto.
- Ruta `/piloto` para explicar apertura controlada.

## Bloquea Produccion Real

- Auth real no decidido ni integrado.
- D1 no es todavia fuente unica para catalogo publico, pagos, wallets y admin financiero.
- Webhook tenia idempotencia en memoria; ahora queda preparado para D1 pero falta aplicar migracion y reconciliar contra proveedor.
- Storage privado de identidad no activo.
- Admin unificado aun debe consolidar acciones, notas, asignacion y auditoria completa.
- Datos demo deben quedar desactivados por configuracion de produccion.

## Migrar Primero

1. D1 remoto + migraciones `0001` a `0003`.
2. Admin real: leads y especialistas.
3. Auth provider y guard server-side.
4. Storage privado para documentos.
5. Payment intents + webhook + wallet/ledger D1.
6. Publicacion de especialistas desde DB.
