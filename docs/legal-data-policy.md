# Politica legal de datos: referencias publicas SEC y perfiles activados

## Objetivo

OficiosPro puede mostrar referencias publicas de personas certificadas por SEC solo bajo un modelo conservador, minimizado y no comercial hasta que la persona titular active su perfil o la empresa active una vitrina autorizada.

Esta politica aplica a:

- fichas informativas no reclamadas,
- perfiles profesionales activados,
- vitrinas de empresa,
- responsables tecnicos certificados vinculados a empresas,
- solicitudes de acceso, rectificacion, supresion, oposicion o bloqueo.

## Principio base

La certificacion SEC es personal cuando corresponde a instaladores, inspectores u otras personas naturales. Una empresa no debe aparecer como "Empresa certificada SEC" por heredar la certificacion de una persona.

Copy permitido para empresas:

- "Empresa con responsables tecnicos certificados SEC".
- "Equipo tecnico con instaladores autorizados SEC".

Copy prohibido:

- "Empresa certificada SEC", salvo que exista una certificacion empresarial especifica validada legalmente en el futuro.
- "Recomendado", "top", "mejor", ranking o score en fichas no reclamadas.

## Estados

### UNCLAIMED_PUBLIC_REFERENCE

Ficha informativa no reclamada.

Puede mostrar:

- nombre publico,
- rubro u oficio,
- clase/tipo de licencia si existe,
- comuna,
- region,
- estado de verificacion en fuente publica,
- fecha de ultima verificacion,
- fuente,
- boton "Verificar en SEC",
- disclaimer legal.

No puede mostrar:

- RUT completo,
- telefono,
- correo,
- WhatsApp,
- direccion exacta,
- foto,
- disponibilidad,
- precios,
- cotizar,
- reservar,
- resenas,
- ranking,
- badges reputacionales,
- perfil enriquecido.

Reglas SEO:

- `meta robots="noindex,nofollow,noarchive"`,
- `X-Robots-Tag: noindex, nofollow, noarchive`,
- fuera de sitemap.

### CLAIMED_PROFESSIONAL_PROFILE

Perfil de persona natural activado por el titular.

Requiere consentimiento versionado:

- user_id,
- timestamp,
- terms_version,
- privacy_policy_version,
- publication_scope,
- evidencia minima de aceptacion,
- IP/user agent solo si el sistema ya lo registra y con criterio de minimizacion.

Puede mostrar datos comerciales solo si el titular los ingreso y autorizo publicacion. Puede activar cotizacion/reserva solo si el perfil esta reclamado y `quotation_enabled`/`booking_enabled` son verdaderos.

### COMPANY_SHOWCASE

Vitrina de persona juridica o empresa.

La empresa debe activar su vitrina antes de recibir cotizaciones o reservas. No puede tener `sec_certified=true`.

Debe usar relacion `company_technical_responsibles` para mostrar responsables tecnicos:

- company_id,
- professional_profile_id,
- role,
- consent_status,
- verification_status,
- verified_at,
- expires_at.

Solo se muestran responsables si:

- `consent_status=ACCEPTED`,
- `verification_status=VERIFIED`.

Si no hay responsables tecnicos verificados:

"Esta empresa aun no ha informado responsables tecnicos certificados en la plataforma."

## Guardrails implementados

- Seeds ficticios marcados `fakeData=true`.
- Fichas externas no reclamadas `indexable=false`.
- Politica frontend compartida en `src/lib/externalCertifiedSpecialistPolicy.ts`.
- Guardrails Worker en `worker/lib/externalRegistryGuard.ts`.
- `POST /api/bookings/request` bloquea targets no reclamados.
- `POST /api/quotes/virtual/create` bloquea targets no reclamados.
- `POST /api/admin/external-registry/sec/import` queda bloqueado salvo `ALLOW_REAL_SEC_IMPORT=true`.
- Rutas `/registro-publico-externo/*` reciben `X-Robots-Tag`.
- Solicitudes de titulares entran por `/privacidad/solicitudes`.

## Feature flag

`ALLOW_REAL_SEC_IMPORT=false` por defecto.

No cambiar a `true` sin:

1. revision legal documentada,
2. evaluacion de terminos de uso de fuente oficial,
3. politica de minimizacion de datos,
4. flujo de solicitudes de titulares,
5. aprobacion de Benjamin,
6. migracion D1 revisada y testeada.

## Carga masiva

La base real SEC no debe importarse todavia. Cualquier importador real debe quedar detras de la flag y contener el comentario:

`requires legal review and approved source/API/terms assessment`

## Solicitudes de titulares

Canal inicial:

`/privacidad/solicitudes`

Tipos:

- ACCESS,
- RECTIFICATION,
- SUPPRESSION,
- OPPOSITION,
- BLOCKING,
- OTHER.

En esta etapa se registran como lead/contacto operacional para revision manual. Una tabla dedicada `data_subject_requests` queda pendiente para un ciclo con migracion D1 aprobada.

## Pendiente antes de carga real

- Tabla D1 `professionals`.
- Tabla D1 `professional_private_data`.
- Tabla D1 `companies`.
- Tabla D1 `company_technical_responsibles`.
- Tabla D1 `data_subject_requests`.
- Tabla D1 `consent_logs`.
- Admin dedicado para revisar fichas no reclamadas, solicitudes y empresas.
- Flujo de ocultamiento temporal automatizado.
- Revision legal y privacidad externa.
