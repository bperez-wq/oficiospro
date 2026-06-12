# Scale To 1000 Specialists Roadmap

## Estado Actual

La captacion de especialistas fundadores funciona para piloto. Hay postulaciones, revision basica, fotos/perfiles, filtros y catalogo fallback. Para 1.000 especialistas se necesita workflow operacional, deduplicacion, SLA, storage privado, publicacion DB y reportes.

## Plan Por Fases

### Fase 1: Piloto Real

- D1 operativo para leads y postulaciones.
- Admin leads y specialists con token.
- Emails minimos a operaciones.
- Sin carga obligatoria de cedula/selfie.
- Responsable: Product Ops Engineering.

### Fase 2: Operacion Inicial

- Auth real.
- `specialist_profiles` y `specialist_services` como fuente de verdad.
- Workflow: pending_review, approved, published, suspended, rejected.
- Notas internas y auditoria admin.
- Responsable: Full-stack/Platform.

### Fase 3: Pagos Y Confianza

- Wallet/ledger DB.
- Payment intents y webhook idempotente.
- Payouts y documentos tributarios.
- Storage privado para identidad/certificados.
- Responsable: Payments/Finance Engineering.

### Fase 4: Escala 1.000

- Cola de revision por prioridad, comuna y oficio.
- Dedupe por RUT/email/telefono.
- SLA por estado.
- Reportes semanales de supply/demand.
- Backups, export contable y monitoreo.
- Responsable: Platform + Product Ops.

## KPIs De Preparacion

- Postulaciones por dia.
- Tiempo medio pending_review -> approved.
- Porcentaje con servicios aprobados.
- Comunas con demanda sin match.
- Emails fallidos.
- Webhooks duplicados ignorados.
- Payouts pendientes.

## Go/No-Go Piloto

Go con maximo 50-100 especialistas si admin revisa manualmente y no se piden documentos sensibles reales.

## Go/No-Go 1.000 Especialistas

Go solo si DB, auth, storage, admin specialists, auditoria y reportes estan activos. No escalar si el equipo opera desde localStorage o planillas sin trazabilidad.
