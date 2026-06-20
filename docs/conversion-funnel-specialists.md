# Conversion funnel specialists

Este playbook traduce los eventos de analytics en decisiones de crecimiento para captar especialistas fundadores reales.

## Funnel principal

```mermaid
flowchart TD
  A["home_view"] --> B["specialist_home_cta_viewed"]
  B --> C["click_offer_services"]
  C --> D["founder_landing_view"]
  D --> Q["quick_lead_started"]
  Q --> R["quick_lead_submitted"]
  R --> S["draft_profile_created"]
  D --> E["founder_cta_click"]
  E --> F["specialist_application_started"]
  F --> G["specialist_application_step_started"]
  G --> H["specialist_application_step_completed"]
  H --> I["specialist_application_submitted"]
  G --> J["specialist_application_step_error"]
  F --> K["specialist_application_abandoned"]
  H --> K
  G --> L["specialist_application_failed"]
```

## Vista admin

La ruta `/admin/crm/acquisition` muestra:

- visitas 24h
- visitas 7 dias
- clicks "Ofrecer mis servicios"
- visitas landing fundadores
- leads rapidos iniciados y enviados
- perfiles borrador/incompletos
- clicks de WhatsApp/contacto
- links de campana copiados
- referidos enviados
- inicios de registro
- pasos iniciados y pasos completados
- errores de registro por paso
- fallos de envio
- registros enviados
- fuente UTM principal
- campana principal
- tasa landing a inicio
- tasa inicio a envio
- paginas mas vistas
- campanas UTM
- abandono por paso
- solicitudes "no encuentro mi oficio"
- postulantes que necesitan ayuda de formalizacion tributaria
- eventos recientes
- postulaciones captadas en D1
- leads capturados, perfiles incompletos y referidos
- links/copies de campanas para Instagram, WhatsApp, Facebook, OMIL, ferreterias y CFT/IP

## Interpretacion

| Sintoma | Lectura | Accion |
| --- | --- | --- |
| Visitas altas y clicks bajos | La propuesta no esta clara o el CTA no se ve | Ajustar hero, texto del CTA y prueba de confianza |
| Clicks altos y landing views bajos | Link, navegacion o carga puede fallar | Revisar href, deploy y mobile |
| Landing views altas y CTA clicks bajos | Landing no convence rapido | Repetir CTA, reducir texto, mostrar beneficio concreto |
| Leads rapidos altos y submits bajos | Hay interes, pero formulario completo genera friccion | Contactar por CRM y revisar paso de abandono |
| Borradores altos | Personas quieren ayuda o no tienen documentos listos | Priorizar seguimiento 24/48 h y ayuda de formalizacion |
| Starts altos y submits bajos | Registro tiene friccion | Revisar paso con mas abandono y microcopy |
| Errores de paso concentrados | Un requisito o texto bloquea conversion | Revisar `reason` y ajustar copy, orden o validacion |
| Muchas solicitudes de oficio no listado | El catalogo no cubre demanda real | Priorizar nueva especialidad o landing SEO |
| Mucha ayuda de formalizacion | Hay barrera tributaria | Preparar guia y soporte operativo antes de aprobar |
| Submits altos y pocos aprobados | Operacion posterior lenta | Revisar CRM, tareas y SLA |

## Pasos del registro

El registro especialista reporta:

- `specialist_application_started`
- `specialist_application_step_started`
- `specialist_application_step_completed`
- `specialist_application_step_error`
- `specialist_application_failed`
- `specialist_application_abandoned`
- `specialist_application_submitted`
- `specialist_custom_trade_requested`
- `specialist_formalization_help_requested`
- `quick_lead_started`
- `quick_lead_submitted`
- `job_page_quick_lead_submitted`
- `draft_profile_created`
- `referral_lead_submitted`
- `whatsapp_contact_clicked`
- `campaign_link_copied`
- `founder_sticky_cta_clicked`

El evento de abandono guarda el mayor paso alcanzado y el nombre del paso, sin guardar RUT, documentos ni datos sensibles. Los eventos de error guardan solo el motivo operacional, paso, oficio, comuna y contexto de UTM.

## Metricas minimas semanales

1. Click rate Home a CTA especialista: `click_offer_services / home_view`.
2. Landing conversion: `founder_cta_click / founder_landing_view`.
3. Start rate: `specialist_application_started / founder_landing_view`.
4. Quick lead rate: `quick_lead_submitted / quick_lead_started`.
5. Submit rate: `specialist_application_submitted / specialist_application_started`.
6. Abandono por paso.
7. Errores por paso y motivo.
8. Oficios no encontrados.
9. Postulantes con ayuda de formalizacion.
10. Fuente con mejor submit rate.
11. Campana con mas registros enviados.

## Validacion en admin

1. Abrir `/admin/crm/acquisition`.
2. Ingresar `ADMIN_TOKEN` o tener sesion admin real.
3. Presionar `Actualizar`.
4. Revisar:
   - embudo: Home CTA -> landing fundadores -> registro iniciado -> paso oficio -> paso formalizacion -> postulacion enviada;
   - KPIs: clicks, landing, inicios, pasos completos, errores, fallos, oficios no listados, formalizacion;
   - tablas: eventos recientes y postulaciones captadas.

Empty state esperado:

```text
Aun no hay eventos de adquisicion registrados. Comparte links con UTM o prueba el flujo de registro.
```

No se deben mostrar datos demo como si fueran reales.

## Umbrales iniciales

Estos umbrales son para piloto, no para escala final:

- Home a CTA especialista: mayor a 1.5%.
- Landing a inicio: mayor a 8%.
- Inicio a envio: mayor a 25%.
- Abandono concentrado en un paso: revisar si supera 45% del abandono total.

## Kaizen semanal

1. Observar datos en `/admin/crm/acquisition`.
2. Diagnosticar el tramo con mayor perdida.
3. Priorizar un solo cambio de conversion.
4. Implementar sin rehacer la pagina.
5. Validar mobile, build y dry-run.
6. Desplegar.
7. Medir 7 dias.
8. Repetir.

## Pendientes recomendados

- Cuando se autorice tocar Worker, crear alias `POST /api/events` o tabla dedicada `analytics_events`.
- Agregar cohortes por oficio y comuna cuando el volumen supere 100 eventos semanales.
- Conectar eventos con Search Console para decidir nuevas paginas SEO sin spam.
