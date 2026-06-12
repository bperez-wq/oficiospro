# Private Identity Storage Plan

## Estado Actual

El registro especialista permite seleccionar foto, cedula, selfie, certificados y portafolio, pero no sube archivos reales a storage privado. Los archivos quedan como preview local y nombres; la postulacion marca identidad como `pending_secure_storage` cuando corresponde.

## Recomendacion

Usar Cloudflare R2 privado para mantener la plataforma en Cloudflare:

- Bucket privado `oficiospro-identity`.
- Binding `IDENTITY_BUCKET`.
- URLs firmadas de subida y lectura.
- Expiracion corta: 5-15 minutos.
- Metadatos en D1, archivos en R2.
- Acceso de lectura solo admin autorizado.

Alternativa: Supabase Storage privado si se elige Supabase Auth.

## Flujo Objetivo

1. Especialista inicia postulacion.
2. Front solicita signed upload URL.
3. Browser sube directo a storage privado.
4. Worker guarda metadatos en D1: tipo, hash, estado, owner, expiracion.
5. Admin solicita signed read URL temporal.
6. Toda lectura queda en `admin_audit_log`.

## Datos

- Cedula frontal.
- Cedula reverso.
- Selfie.
- Certificados.
- Portafolio.

## Reglas

- No public URLs.
- No guardar blobs en `localStorage`.
- No adjuntar cedula/selfie por email.
- No mostrar documentos en UI publica.
- Si no hay storage activo, mantener `pending_secure_storage`.

## Go/No-Go Piloto

Go sin pedir documentos obligatorios. Si el especialista adjunta algo en piloto, tratarlo como antecedente pendiente y no como documento validado.

## Go/No-Go 1.000 Especialistas

No-Go hasta tener storage privado, URLs firmadas, auditoria de lectura y politica de retencion/borrado.
