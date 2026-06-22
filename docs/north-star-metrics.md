# North Star metrics OficiosPro

## North Star

Servicios completados con especialista validado y cliente satisfecho.

Esta metrica une oferta, demanda, confianza, pago protegido y reputacion. OficiosPro no debe optimizar solo visitas, registros o clicks si eso no aumenta servicios reales completados con calidad.

## Metricas de oferta

- Visitas a `/especialistas-fundadores`.
- Click en "Ofrecer mis servicios".
- Registros iniciados.
- Registros completados.
- Especialistas en revision.
- Especialistas aprobados.
- Especialistas publicados.
- Cobertura por oficio/comuna.
- Tiempo desde lead a contacto.
- Tiempo desde postulacion a publicacion.
- Calidad de perfil completado.

## Metricas de demanda

- Visitas a `/especialistas`.
- Busquedas.
- Filtros usados.
- Leads cliente.
- Solicitudes de cotizacion.
- Bolsa iniciada.
- Bolsa enviada.
- Checkout iniciado.
- Servicio completado.
- Repeticion de cliente.

## Metricas economicas

- GMV.
- Comision OficiosPro.
- Take rate.
- Creditos vendidos.
- Creditos usados.
- Creditos retenidos.
- Creditos liberados.
- CAC.
- LTV.
- Margen operativo.
- Costo operacional por servicio.
- Ingresos por Club Hogar.
- Ingresos por planes empresa.

## Metricas de confianza

- Tiempo de respuesta.
- Documentos validados.
- Reviews.
- Reclamos.
- NPS.
- Tasa de repeticion.
- Disputas.
- Casos antifraude.
- Especialistas suspendidos.

## Salud del modelo de negocio

Cada cierre semanal Kaizen debe responder:

- Crecio la oferta?
- Crecio la demanda?
- Hubo registros?
- Hubo solicitudes?
- Hay senales de pago?
- Que canal trajo mejores leads?
- El modelo 9,5% + IVA parece suficiente?
- Que segmento muestra mas potencial?
- Conviene seguir con el modelo actual o probar una variante?

## Senales cuantitativas de alerta

| Senal | Lectura inicial | Accion sugerida |
| --- | --- | --- |
| Alta visita a landing y baja postulacion | Friccion, promesa poco clara o formulario largo | Probar lead corto, WhatsApp y seguimiento CRM |
| Alta postulacion y baja aprobacion | Problema de calidad o operacion | Mejorar onboarding, checklist y SLA |
| Alta busqueda y baja solicitud | Falta cobertura o CTA debil | Priorizar comunas/oficios y mejorar cards |
| Alta bolsa iniciada y bajo envio | Duda de confianza/precio | Mejorar prueba social, copy y soporte |
| Alto checkout iniciado y baja conversion | Friccion de pago o disposicion baja | Revisar pricing, creditos y medios de pago |
| Bajo uso de Club Hogar | Oferta no percibida como recurrente | Probar bundles por mantencion |
| Alto interes empresa | B2B puede ser wedge inicial | Testear plan empresa/comunidad |

## Criterio de foco

Si una metrica crece pero no acerca a la North Star, se considera metrica secundaria. El foco semanal debe priorizar el cuello de botella que impide completar servicios reales con especialista validado y cliente satisfecho.

## Implementacion de salud del modelo

Las metricas se agrupan en cinco dimensiones operativas:

- Oferta.
- Demanda.
- Liquidez.
- Economia.
- Confianza y operacion.

Los umbrales iniciales viven en `src/config/businessModelHealthThresholds.json`. La calculadora usa `insufficient_data` cuando falta evidencia o la muestra no alcanza el minimo. Esto evita declarar saludable o critico un modelo con datos insuficientes.
