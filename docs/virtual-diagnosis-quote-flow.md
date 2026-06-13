# Diagnostico virtual antes de la visita

## Objetivo operativo

Permitir que un cliente solicite cotizacion con antecedentes, fotos o videos antes de agendar una visita presencial. El especialista puede responder con una propuesta en creditos, pedir mas informacion o recomendar visita tecnica. Los creditos solo se retienen cuando el cliente aprueba la cotizacion y continua al checkout.

## Flujo textual

1. Cliente presiona **Cotizar** en un especialista o servicio.
2. OficiosPro agrega el item a **Bolsa** como solicitud de cotizacion.
3. En Bolsa, el cliente presiona **Iniciar cotizacion virtual**.
4. Cliente describe el problema, comuna, urgencia y referencias visuales.
5. Si no existe storage privado, OficiosPro no guarda archivos en localStorage; solo registra cantidad de referencias y coordina fotos por canal seguro.
6. Worker registra la solicitud en D1 si `DB` esta configurado. Si no hay DB, la UX mantiene respaldo local de metadatos.
7. Especialista revisa en dashboard y puede:
   - pedir mas informacion,
   - recomendar visita tecnica,
   - enviar propuesta en creditos.
8. Cliente revisa propuesta en Bolsa.
9. Si aprueba, la solicitud pasa a checkout como `quote_request`; los creditos se retienen solo al pagar/confirmar.
10. Si rechaza, queda trazabilidad de rechazo sin cobro.

## Modelo de datos

Migracion: `migrations/0004_virtual_quotes.sql`.

- `virtual_quote_requests`: solicitud principal, cliente, especialista, servicio, comuna, urgencia, estado y metadatos.
- `virtual_quote_attachments`: referencias visuales futuras. Deben usar storage privado/signed URLs; no guardar archivos en navegador.
- `virtual_quote_messages`: mensajes de cliente, especialista o admin.
- `virtual_quote_offers`: propuesta del especialista, creditos fijos/rango/visita recomendada y condiciones.
- `service_requests.quoteRequestId`: puente futuro entre solicitud de servicio y cotizacion virtual.

## Endpoints

- `POST /api/quotes/virtual/create`
- `GET /api/quotes/virtual/:id`
- `POST /api/quotes/virtual/:id/message`
- `POST /api/quotes/virtual/:id/offer`
- `POST /api/quotes/virtual/:id/approve`
- `POST /api/quotes/virtual/:id/reject`
- `POST /api/quotes/virtual/:id/request-more-info`
- `GET /api/admin/virtual-quotes`
- `POST /api/admin/virtual-quotes/:id/update-status`

## Estados recomendados

- `pendiente_revision`
- `necesita_mas_info`
- `cotizacion_enviada`
- `aprobada_cliente`
- `rechazada_cliente`
- `visita_recomendada`
- `convertida_a_reserva`
- `expirada`

## Reglas de privacidad

- No guardar fotos ni videos en `localStorage` o `sessionStorage`.
- No exponer URLs publicas permanentes de cedulas, selfies, domicilios o evidencia sensible.
- Adjuntos deben ir a storage privado con signed URLs y expiracion.
- Logs del Worker deben evitar PII completa. Guardar IDs y estados; no dump de payloads con telefono/email si no es necesario.

## Como probar

1. Agregar un servicio que requiera cotizacion a Bolsa.
2. Abrir `/bolsa`.
3. Presionar **Iniciar cotizacion virtual**.
4. Completar problema, descripcion, comuna y seleccionar referencias.
5. Confirmar que la card muestra **Cotizacion virtual pendiente**.
6. Entrar como especialista y abrir dashboard para ver la bandeja de cotizaciones virtuales.
7. Enviar propuesta.
8. Volver a Bolsa y aprobar/rechazar.
9. Validar que al aprobar aparece como `quote_request` y checkout usa modo `quote_acceptance`.
10. En admin, abrir `/admin#cotizaciones-virtuales` o `/admin/virtual-quotes`, ingresar `ADMIN_TOKEN` y revisar datos D1.

## Configuracion Cloudflare

1. Aplicar migracion D1 remota:
   `npx wrangler d1 migrations apply <DB_NAME> --remote`
2. Confirmar binding `DB` en Cloudflare.
3. Configurar `ADMIN_TOKEN`.
4. Deployar assets/Worker.
5. Probar `POST /api/quotes/virtual/create` y `GET /api/admin/virtual-quotes`.
