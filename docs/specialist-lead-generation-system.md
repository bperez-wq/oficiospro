# Specialist lead generation system

Objetivo: convertir visitas de personas con oficio en leads operables para el CRM, sin prometer ingresos, cupos falsos ni convenios inexistentes.

## Flujos cubiertos

- Home: CTA "Ofrecer mis servicios" y captura rapida en la seccion de especialistas.
- `/especialistas-fundadores`: CTA sticky mobile, formulario rapido y registro completo.
- `/trabajos/[oficio]`: captura SEO con oficio precargado.
- `/referidos/especialistas`: link UTM, WhatsApp share y captura de referido.
- `/registro-especialista`: guardado de avance como perfil incompleto.
- `/admin/crm/acquisition`: seguimiento de eventos, leads, borradores, postulaciones, fuentes y campanas.

## Lead rapido

Campos minimos:

- nombre
- telefono
- comuna
- oficio principal

Se guarda usando `/api/specialists/apply` con `leadType=specialist_application` y payload operacional:

- `specialistLeadKind`: `founder_lead`, `specialist_lead`, `job_page_lead`, `specialist_referral_lead` o `draft_profile`
- `draftProfileStatus=incomplete`
- `founderStatus=lead_capturado`
- `crm.pipeline=especialistas`
- `crm.stage=lead_capturado`
- `crm.assignedTeam=Operaciones`
- `crm.slaHours=48`

El formulario completo no se reemplaza. El lead rapido es una salida de baja friccion para seguimiento humano.

## Perfil incompleto

En `/registro-especialista`, el usuario puede elegir "Guardar avance y pedir contacto" si no quiere terminar el formulario.

Regla operacional:

- Si hay nombre, telefono, oficio y comuna, se crea lead incompleto.
- Se mantiene draft local en `sessionStorage` para precargar el formulario si vuelve.
- En CRM debe tratarse como tarea de contacto 24/48 h.

## Eventos

- `quick_lead_started`
- `quick_lead_submitted`
- `job_page_quick_lead_submitted`
- `referral_lead_submitted`
- `draft_profile_created`
- `draft_profile_completed`
- `whatsapp_contact_clicked`
- `campaign_link_copied`
- `founder_sticky_cta_clicked`

Todos deben llevar source/campaign/utm cuando existan.

## Rutina diaria CRM

1. Abrir `/admin/crm/acquisition`.
2. Filtrar por `founderStatus=lead_capturado`.
3. Revisar "Leads capturados" y "Perfiles incompletos".
4. Contactar por telefono o WhatsApp si existe numero operativo.
5. Marcar la oportunidad/tarea como contactada cuando el backend lo permita.
6. Priorizar oficios con mas demanda por comuna.
7. Registrar aprendizajes en `docs/kaizen-backlog.md`.

## Reglas de cumplimiento

- No prometer ingresos garantizados.
- No prometer volumen fijo de trabajos.
- No inventar convenios.
- No mostrar datos demo como reales.
- No pedir documentos sensibles en captura rapida.
- El usuario puede postular aunque necesite ayuda de formalizacion.
