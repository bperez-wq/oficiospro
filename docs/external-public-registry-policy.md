# Registro publico externo de personas certificadas

## Proposito

OficiosPro puede ayudar a usuarios a descubrir que existen personas certificadas en fuentes publicas, partiendo por instaladores SEC. Esta capa no reemplaza la validacion operacional de OficiosPro ni convierte un registro publico en un perfil activo.

La primera version es solo un prototipo no indexable con datos ficticios. No se debe cargar una base masiva sin revision legal previa.

## Principios

- Minimizar datos: mostrar solo lo necesario para orientar al usuario.
- No exponer datos personales de contacto.
- No presentar referencias externas como perfiles activos.
- Dar al especialista control para activar, actualizar o solicitar retiro.
- Mantener noindex hasta validar legalidad, calidad editorial y utilidad real.
- Separar claramente fuente publica externa de verificacion OficiosPro.

## Campos permitidos

- Nombre visible.
- Tipo de prestador: persona natural o empresa/persona juridica.
- Especialidad o certificacion si existe.
- Comuna.
- Region.
- Fuente publica.
- Link para validar en fuente oficial.
- Estado operativo dentro de OficiosPro.

## Campos prohibidos

- Email.
- Telefono.
- Direccion exacta.
- RUT completo.
- Documentos personales.
- Datos privados, notas internas o informacion de contacto no consentida.

## Lenguaje permitido

Usar:

- "Ficha informativa no reclamada".
- "Verificado en fuente publica".
- "Activar/Reclamar perfil".
- "Activar mi perfil".
- "Activar mi vitrina".
- "Actualizar mi informacion".
- "Solicitar actualizacion o retiro".
- "Validar en fuente oficial".
- "Empresa o persona juridica" cuando el prestador no sea una persona natural.

No usar:

- "Reclamar perfil".
- "Verificado por OficiosPro" cuando el perfil aun no fue validado por OficiosPro.
- "Disponible para reservar" si el especialista no activo su perfil.
- "Contacto directo" si no existe consentimiento.

## Persona natural vs empresa

OficiosPro debe permitir ambos tipos de prestador, pero no tratarlos igual:

- Persona natural: activa un perfil profesional individual.
- Empresa o persona juridica: activa una vitrina de empresa prestadora o equipo tecnico.

Para empresas/personas juridicas se debe validar, antes de publicar como activo:

- representante o contacto autorizado,
- razon social o identidad comercial publica,
- certificacion aplicable cuando corresponda,
- permisos para mostrar marca/nombre,
- responsables tecnicos si el servicio exige certificacion personal.

Una referencia publica externa de empresa tampoco debe mostrar email, telefono, direccion exacta ni RUT completo mientras no exista consentimiento o flujo legal aprobado.

## Estados

- `UNCLAIMED_PUBLIC_REFERENCE`: ficha informativa no reclamada, no activa en OficiosPro.
- `CLAIMED_PROFESSIONAL_PROFILE`: perfil de persona natural activado por el titular.
- `COMPANY_SHOWCASE`: vitrina de empresa prestadora, separada de la certificacion personal.
- `SUSPENDED`: perfil o vitrina suspendida.
- `HIDDEN_BY_REQUEST`: ficha oculta por solicitud o revision de titular.

## Reglas de UI

- Cada ficha debe mostrar el badge "Ficha informativa no reclamada".
- Cada ficha inicial debe estar en estado `UNCLAIMED_PUBLIC_REFERENCE`.
- No debe haber botones "Cotizar" o "Reservar" en referencias no activas.
- Debe existir un boton "Verificar en SEC".
- Debe existir un CTA "Activar/Reclamar perfil".
- Debe existir un CTA "Reportar error o solicitar correccion/eliminacion".
- Los datos ficticios de prototipo deben estar marcados como tales.

## Indexacion

La ruta experimental inicial debe ser noindex. No debe entrar al sitemap ni a landings SEO hasta cumplir:

- Revision legal aprobada.
- Politica de retiro y actualizacion publicada.
- Calidad de datos validada.
- Prueba de utilidad para usuarios.
- Consentimiento o proceso de activacion cuando corresponda.

## Revision legal obligatoria

Antes de cargar una base publica real o masiva se debe revisar:

- Terminos de uso de la fuente publica.
- Base legal para tratamiento y publicacion limitada.
- Riesgos de datos personales.
- Procedimiento de actualizacion, retiro y oposicion.
- Regla de retencion y auditoria.
- Copy visible para no inducir a error.

## Rollout recomendado

1. Prototipo con datos ficticios noindex.
2. Revision legal y privacidad.
3. Prueba manual con pocos registros reales minimizados, si se aprueba.
4. Flujo de activacion por especialista.
5. Panel interno para update/removal requests.
6. Solo despues evaluar indexacion o SEO, si el contenido es util y autorizado.
