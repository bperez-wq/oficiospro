# Lead capture operational checklist

Este checklist deja trazable el estado operativo de captura de leads en OficiosPro.

## Estado actual

- El Worker expone endpoints POST para `/api/leads`, `/api/contact`, `/api/specialists/apply`, `/api/jobs/request`, `/api/companies/request` y `/api/bookings/request`.
- El Worker expone administración en `GET /api/admin/leads` y `PATCH /api/admin/leads/:id/status`.
- La tabla D1 esperada es `lead_submissions`, definida en `migrations/0001_leads.sql`.
- El email transaccional usa Resend solo cuando `RESEND_API_KEY` está configurado.
- El destinatario operacional debe ser `bperez@oficiospro.cl`.

## Formularios que llaman API

- Hero search: `src/components/HeroSearchPanel.tsx` llama `submitLead` como `customer_request`.
- Contacto: `src/components/ContactForm.tsx` llama `submitLead` como `contact_message`.
- Contacto inmediato: `src/components/InstantContactPanel.tsx` llama `submitLead` como `contact_message`.
- Empresas: `src/components/Forms.tsx` en `CompanyRequestForm` llama `submitLead` como `company_request`.
- Club Hogar / planes / empresas / reserva / búsqueda modal: `src/components/ConversionModal.tsx` llama `submitLead`.
- Agenda/reserva: `src/components/BookingDrawer.tsx` llama `submitLead` como `booking_request`.
- Registro cliente: `src/components/Forms.tsx` en `ClientRegisterForm` llama `submitLead` como `club_hogar_interest`.
- Postulación especialista: `src/components/Forms.tsx` en `SpecialistRegisterForm` llama `submitLead` como `specialist_application`.
- Checkout: `src/app/checkout/page.tsx` llama `submitLead` como `payment_interest`.

## Flujos que siguen usando localStorage

Estos flujos conservan copia local para UX, demos o respaldo:

- `src/lib/leadClient.ts` guarda respaldo de cada lead en `oficiospro.leadSubmissions.localBackup`.
- El respaldo local es defensivo: si el navegador no permite `localStorage`, el envío no queda bloqueado.
- `src/lib/storage.ts` mantiene leads comerciales locales para dashboards mock y backoffice visual.
- `src/lib/bookingStorage.ts` mantiene reservas, bloqueos y contactos instantáneos locales.
- El panel histórico `/admin` sigue mostrando datos locales/mock; el panel operativo D1 es `/admin/leads`.

## Endpoints existentes

- `POST /api/leads`: endpoint genérico, requiere `leadType`.
- `POST /api/contact`: fuerza `contact_message`.
- `POST /api/specialists/apply`: fuerza `specialist_application`.
- `POST /api/jobs/request`: fuerza `customer_request`.
- `POST /api/companies/request`: fuerza `company_request`.
- `POST /api/bookings/request`: fuerza `booking_request`.
- `GET /api/admin/leads`: lista leads con Bearer `ADMIN_TOKEN`.
- `PATCH /api/admin/leads/:id/status`: cambia estado o prioridad con Bearer `ADMIN_TOKEN`.

## Falta configurar en Cloudflare

- Crear base D1 `oficiospro-leads`.
- Agregar binding `DB` en `wrangler.toml` con `database_id` real.
- Ejecutar migración remota `migrations/0001_leads.sql`.
- Configurar `ADMIN_TOKEN`.
- Configurar `LEADS_TO_EMAIL=bperez@oficiospro.cl`.
- Configurar `LEADS_FROM_EMAIL` con un remitente validado.
- Configurar `LEADS_REPLY_TO_EMAIL=bperez@oficiospro.cl`.
- Configurar `RESEND_API_KEY` solo cuando el dominio esté validado en Resend.

## Cómo probar en producción

1. Desplegar con `npm run build` y `npm run deploy`.
2. Ejecutar:

```bash
TEST_BASE_URL=https://oficiospro.cl node scripts/test-lead-endpoints.mjs
```

3. Confirmar que cada endpoint responda `ok=true`.
4. Confirmar `stored=true` cuando D1 esté configurado.
5. Confirmar `emailSent=true` solo cuando Resend esté configurado y validado.
6. Abrir `/admin/leads`, ingresar `ADMIN_TOKEN`, filtrar leads y cambiar un estado.
7. Si `DB` falta, la UI debe mostrar: “Estamos activando la recepción automática. Escríbenos a bperez@oficiospro.cl.”
8. Si `RESEND_API_KEY` falta pero `DB` existe, la UI debe confirmar recepción sin prometer correo.
9. La página `/admin/leads` no está enlazada desde navegación pública; es un panel interno con token.

## QA de producto

- La postulación de especialista no exige certificaciones, archivos ni galería.
- El botón final de postulación vuelve a habilitarse si hay error.
- Una postulación exitosa redirige a `/?postulacion=recibida`.
- El especialista declara tarifa esperada en CLP; no elige créditos.
- El cliente ve créditos, no comisión interna ni payout.
- El admin puede revisar CLP, créditos, Comisión OficiosPro y ledger desde vistas internas; `/admin/leads` muestra un bloque de pricing interno cuando el payload trae servicios postulados.
