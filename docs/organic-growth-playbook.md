# Organic growth playbook

Plan de 30 dias para captar especialistas fundadores con canales organicos y seguimiento CRM.

## Semana 1: base y mensajes

- Publicar link de Instagram bio con UTM.
- Probar 2 historias con `utm_content=story_cta_01` y `story_cta_02`.
- Contactar 20 especialistas por WhatsApp directo con link medido.
- Publicar en 3 grupos de Facebook locales sin prometer trabajos.
- Revisar `/admin/crm/acquisition` cada dia.

Mensaje base:

```text
Hola, vi que trabajas en oficios tecnicos. Estoy creando OficiosPro.cl para dar visibilidad a especialistas verificados por comuna. Estamos invitando a los primeros especialistas fundadores sin costo inicial. Te interesa crear tu perfil?
```

## Semana 2: comunas y oficios

- Elegir 3 comunas prioritarias segun leads recibidos.
- Publicar paginas `/trabajos/[oficio]` para oficios con senal real.
- Contactar ferreterias locales con QR medido.
- Separar leads por oficio y comuna en CRM.

## Semana 3: instituciones

- Contactar OMIL, CFT/IP y ferreterias con mensaje institucional.
- Usar links de `src/data/growthCampaigns.ts`.
- Medir `institution_contact_submitted` y leads por `utm_source`.

## Semana 4: optimizacion

- Revisar tasa `quick_lead_submitted / quick_lead_started`.
- Revisar tasa `specialist_application_submitted / specialist_application_started`.
- Identificar paso de mayor abandono.
- Ajustar solo una friccion por ciclo Kaizen.

## Canales

Instagram:

- Bio: frase corta + link UTM.
- Story: una pregunta y CTA directo.
- No usar testimonios inventados.

Facebook grupos:

- Publicar de forma honesta.
- Explicar que es etapa fundador.
- No prometer ingresos ni trabajos asegurados.

WhatsApp:

- Usar mensaje humano uno a uno.
- Si existe numero oficial configurado, usar boton WhatsApp.
- Si no existe, fallback a `bperez@oficiospro.cl`.

OMIL / ferreterias / CFT:

- Presentar como piloto de visibilidad y formalizacion asistida.
- Pedir apoyo para difundir link medido.
- No prometer convenio ni empleabilidad garantizada.

## Medicion

Revisar semanalmente:

- fuente con mas leads
- oficio con mas leads
- comuna con mas leads
- perfiles incompletos pendientes
- referidos enviados
- campanas con mayor envio de postulacion

Registrar decision y resultado en `docs/kaizen-backlog.md`.

## Canal SEO editorial (Soro)

Desde julio 2026 existe un canal adicional de crecimiento organico: contenido editorial investigado con Soro SEO bajo control humano.

- Backlog de temas: `docs/soro-seo-topic-briefs.md` (60 oportunidades priorizadas).
- Politica y flujo editorial: `docs/soro-seo-editorial-policy.md`.
- Plan de 90 dias: `docs/soro-seo-90-day-plan.md`.
- Medicion: `docs/search-console-playbook.md` y seccion Soro de `docs/analytics-and-growth-tracking.md`.

Regla de oro: el contenido complementa este playbook, no lo reemplaza. Cada pieza debe apuntar a una conversion real (registro especialista, solicitud cliente, contacto empresa/institucion) y pasa por revision humana antes de publicarse. Nada se autopublica.
