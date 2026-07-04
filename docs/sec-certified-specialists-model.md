# Modelo SEC para especialistas certificados externos

## Alcance inicial

Caso piloto: instaladores SEC como referencia publica externa. Esta version no importa la base real `BASE_MAESTRA_OficiosPro` ni otros archivos SEC locales. Solo deja preparado el modelo y una UI noindex con datos ficticios.

## Objetivo del modelo

Permitir que OficiosPro represente de forma prudente una referencia publica externa sin:

- exponer datos personales de contacto,
- hacerla parecer un perfil activo,
- prometer disponibilidad,
- permitir cotizar o reservar,
- mezclarla con especialistas verificados por OficiosPro.

## Entidad propuesta

Archivo inicial:

`src/data/externalCertifiedSpecialists.ts`

Campos:

| Campo | Uso | Regla |
| --- | --- | --- |
| `id` | Identificador interno | No debe contener RUT completo |
| `fullName` / `displayName` | Nombre publico visible | Debe venir de fuente autorizada o ser fake data en prototipo |
| `providerType` | Tipo de prestador | `natural_person` o `legal_entity` |
| `certificationAuthority` | Autoridad certificadora | Inicialmente `SEC` |
| `serviceType` | Rubro u oficio | `electrico`, `gas` u otro autorizado |
| `licenseClass` | Clase/tipo de licencia | Solo si existe en fuente publica |
| `commune` | Comuna | Permitido |
| `region` | Region | Permitido |
| `profileStatus` | Estado OficiosPro | Ver estados |
| `sourceName` | Nombre de fuente | Ej. Registro publico SEC |
| `sourceUrl` | URL fuente oficial | Generica o especifica si legalmente corresponde |
| `fakeData` | Marca de prototipo | `true` para seeds ficticios |
| `indexable` | Control SEO | `false` para fichas no reclamadas |
| `lastVerifiedAt` | Fecha de revision | Auditoria operacional |

## Estados

| Estado | Significado | Accion permitida |
| --- | --- | --- |
| `UNCLAIMED_PUBLIC_REFERENCE` | Ficha informativa no reclamada | Verificar en SEC, Activar/Reclamar perfil, Reportar error/correccion/eliminacion |
| `CLAIMED_PROFESSIONAL_PROFILE` | Perfil activado por persona natural | Puede pasar al flujo normal si cumple consentimiento y reglas |
| `SUSPENDED` | Suspendido | No mostrar acciones comerciales |
| `HIDDEN_BY_REQUEST` | Oculto por solicitud | No mostrar publicamente mientras se revisa |

## Datos sensibles excluidos

No agregar al modelo publico:

- email,
- telefono,
- direccion exacta,
- RUT completo,
- documentos,
- notas internas,
- historiales privados.

Si en una carga interna futura se necesita guardar datos de trazabilidad, debe ser en una tabla separada con controles de acceso y no en el payload publico.

## Activacion de especialista

CTA publico: "Activar/Reclamar perfil".

Flujo esperado para persona natural:

1. El especialista llega desde la ficha externa.
2. Completa registro normal de especialista.
3. OficiosPro valida identidad, certificacion y consentimiento.
4. Si corresponde, se vincula la referencia externa al perfil real.
5. Solo entonces puede mostrarse como perfil activo.

## Activacion de empresa o persona juridica

OficiosPro debe permitir empresas prestadoras, pero con una ruta distinta a la del especialista individual.

Flujo esperado:

1. La empresa llega desde la ficha externa o desde Empresas.
2. Declara representante autorizado y datos comerciales.
3. OficiosPro revisa certificaciones tecnicas, responsables y permisos de publicacion.
4. Si corresponde, se crea vitrina de empresa prestadora.
5. La empresa puede listar tecnicos o responsables certificados cuando la normativa lo exija.

Regla: una empresa no debe aparecer como "especialista verificado" por el solo hecho de existir en una fuente publica. Debe pasar por activacion y validacion propia.

## Actualizacion o retiro

CTA publico: "Reportar error o solicitar correccion/eliminacion".

Toda solicitud debe registrar:

- registro afectado,
- tipo de solicitud,
- contacto del solicitante,
- evidencia si aplica,
- fecha,
- estado de revision.

Hasta tener flujo D1 aprobado, la version inicial deriva a contacto y no modifica datos automaticamente.

## Indexacion

Las fichas iniciales deben permanecer noindex. No deben aparecer en sitemap. La indexacion futura requiere:

- aprobacion legal,
- mecanismo de retiro operativo,
- datos de calidad,
- valor real para usuario,
- copy que evite confusion con perfiles activos.

## Futuro D1

Cuando se apruebe pasar de prototipo a datos reales, crear migracion separada para:

- `external_certified_specialists`,
- `external_registry_update_requests`,
- `external_registry_activation_requests`,
- `external_registry_audit_log`.

No ejecutar migraciones remotas sin ciclo Kaizen especifico y aprobacion de Benjamin.

## Riesgos

- Confusion entre fuente publica y verificacion OficiosPro.
- Tratamiento excesivo de datos personales.
- Datos obsoletos o incorrectos.
- Falta de mecanismo de retiro.
- Dano reputacional si se usa como directorio masivo sin consentimiento ni control.

## Recomendacion

Mantener esta version como laboratorio noindex. Usarla para validar:

- copy,
- flujo de activacion,
- proceso de actualizacion/retiro,
- criterios legales,
- respuesta de especialistas certificados.
