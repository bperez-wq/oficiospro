# Production Readiness Roadmap

## Estado Actual

OficiosPro esta listo para piloto controlado: Home, especialistas, Bolsa, checkout foundation, leads D1, emails configurables y admin leads real parcial. La operacion masiva aun requiere auth, DB como fuente de verdad, storage privado, ledger durable y observabilidad.

## Brechas

| Area | Brecha | Prioridad | Responsable tecnico |
| --- | --- | --- | --- |
| D1 | Binding remoto y migraciones completas por ambiente | P0 | Platform |
| Auth | Sesion real y roles server-side | P0 | Full-stack |
| Admin | Consolidar especialistas, pagos, creditos, payouts y seguridad | P0 | Product Ops Engineering |
| Pagos | Payment intents/webhooks/ledger durables | P0 | Payments Engineering |
| Storage | Cedula, selfie y certificados privados | P0 | Platform/Security |
| Demo data | Desactivar seed local en produccion | P1 | Frontend/Platform |
| Observabilidad | Logs seguros, alertas y auditoria | P1 | Platform |

## Acciones

1. Aplicar migraciones D1 `0001_leads.sql`, `0002_specialist_publication_identity.sql`, `0003_operational_foundation.sql`.
2. Configurar `DB`, `ADMIN_TOKEN`, `LEADS_TO_EMAIL`, `LEADS_FROM_EMAIL`, `RESEND_API_KEY`.
3. Probar `/api/leads`, `/api/specialists/apply`, `/api/admin/leads`, `/api/admin/specialists`.
4. Elegir proveedor auth y reemplazar mock session en rutas sensibles.
5. Activar storage privado para identidad antes de pedir cedulas reales.
6. Usar `payment_intents`, `webhook_events`, `credit_wallets` y `credit_ledger_entries` como fuente de verdad.
7. Activar `NEXT_PUBLIC_SHOW_DEMO_DATA=false` y revisar dashboards con empty states.

## Go/No-Go Piloto

Go si:
- D1 remoto guarda leads.
- Admin leads y admin specialists responden con token.
- Email falla sin bloquear guardado.
- No se solicitan documentos sensibles reales sin storage privado.

No-Go si:
- No hay `ADMIN_TOKEN`.
- Leads no llegan a D1 ni a correo.
- Checkout promete creditos activados sin confirmacion.

## Go/No-Go 1.000 Especialistas

Go si:
- Auth real activo.
- Publicacion desde DB.
- Storage privado activo con URLs firmadas.
- Webhook idempotente y ledger DB conciliado.
- Admin unificado con auditoria y reportes.
- Backups/export contable operativos.

No-Go si:
- Perfiles dependen de `mock.ts`.
- Pagos/creditos dependen de frontend.
- Documentos quedan en URLs publicas o browser storage.
