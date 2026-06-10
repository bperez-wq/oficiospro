# Seguridad de documentos de identidad

OficiosPro puede solicitar foto de perfil, cédula frontal, cédula reverso y selfie de verificación para revisar especialistas. Esos archivos son datos sensibles.

## Qué no se debe hacer

- No guardar cédula ni selfie en `localStorage`.
- No publicar esos archivos en `public/`.
- No mostrarlos en perfiles públicos de especialistas.
- No enviarlos por email transaccional sin control.
- No loguear URLs, nombres completos asociados a documentos ni payloads de identidad.

## Estado actual

Mientras no exista storage privado configurado, la postulación permite avanzar y marca:

`identityStorageStatus = "pending_secure_storage"`

El admin ve el estado “Documentos pendientes de almacenamiento seguro”. Cédula y selfie no se renderizan como imágenes sensibles en el panel.

## Storage recomendado

Opción Cloudflare R2:

- Bucket privado `oficiospro-identity-private`.
- Objetos con prefijo por especialista y tipo de documento.
- Acceso solo desde Worker con token admin o sesión admin real.
- URLs firmadas con expiración corta para revisión interna.

Opción Supabase Storage:

- Bucket privado `identity-documents`.
- RLS/policies para que solo admin pueda leer.
- Especialista puede subir su propio documento, pero no listar ni leer documentos de otros.

## Acceso y retención

- Solo admin autorizado puede revisar documentos.
- Los documentos se usan para verificación de identidad y prevención de fraude.
- Retener solo mientras sea necesario para revisión, auditoría y obligaciones legales.
- Eliminar documentos rechazados o vencidos con una política operacional definida.

## Próximo paso técnico

Implementar subida directa a storage privado desde una URL firmada emitida por el Worker. El frontend no debe recibir credenciales de storage ni guardar archivos sensibles como base64/blob persistente.
