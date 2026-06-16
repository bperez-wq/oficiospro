# Sistema organico de captacion de especialistas

## Objetivo

OficiosPro capta especialistas fundadores antes de escalar demanda masiva. El sistema combina SEO, referidos, formularios con tracking, CRM y alianzas locales. La promesa publica es deliberadamente honesta: mas visibilidad y mejor presentacion profesional, sin prometer ingresos ni volumen fijo de trabajos.

## Fuentes soportadas

- `facebook_group`
- `whatsapp_referral`
- `omil`
- `sence`
- `chilevalora`
- `cft_ip`
- `liceo_tecnico`
- `ferreteria`
- `proveedor_materiales`
- `administrador_comunidad`
- `gremio`
- `seo_trabajos`
- `referido_especialista`
- `campana_local`

Cada postulacion puede guardar `source`, `sourceDetail`, `campaign`, `commune`, `trade`, `referrerSpecialistId` y `referralCode`.

## Embudo fundador

1. Visita una pagina de captacion: `/especialistas-fundadores`, `/piloto`, `/trabajos/[oficio]`, `/instituciones` o `/referidos/especialistas`.
2. El CTA lleva a `/registro-especialista` con query params de fuente.
3. El formulario registra `specialist_application_started`.
4. Al enviar, el lead guarda el contexto de adquisicion en `payload.acquisition`.
5. El CRM sincroniza especialistas y crea oportunidad en pipeline `especialistas`.
6. Operaciones revisa calidad minima, formalizacion, cobertura y antecedentes.
7. Solo especialistas aprobados/publicados pueden usar badge fundador visible.

## Calidad minima

Checklist inicial:

- experiencia declarada
- comuna/cobertura
- servicios claros
- portfolio si existe
- referencias opcionales
- disponibilidad
- tipo tributario/formalizacion
- aceptacion de terminos
- perfil completo minimo

Estados:

- `fundador_postulante`
- `fundador_en_revision`
- `fundador_aprobado`
- `fundador_publicado`
- `requiere_mas_info`
- `rechazado`

## CRM

El formulario no requiere columnas nuevas para funcionar: guarda el contexto en `payloadJson`. La vista `/admin/crm/acquisition` lee `/api/admin/specialists`, cruza oportunidades/tareas del pipeline `especialistas` y muestra:

- postulaciones por fuente
- postulaciones por oficio
- postulaciones por comuna
- referidos
- instituciones
- embudo fundador
- pendientes por SLA 48h
- export CSV

## Metricas disponibles

- `founder_page_view`
- `founder_cta_click`
- `specialist_application_started`
- `specialist_application_submitted`
- `referral_link_clicked`
- `institution_lead_submitted`

## Plan 30 dias

Semana 1: captar 30 a 50 postulaciones por oficios prioritarios, revisar calidad y medir fuentes.

Semana 2: abrir referidos entre especialistas aprobados y contactar 3 a 5 instituciones locales.

Semana 3: publicar perfiles aprobados por comuna, revisar solicitudes reales y ajustar mensajes.

Semana 4: comparar conversion por fuente, reforzar oficios con mayor demanda y pausar canales con baja calidad.

