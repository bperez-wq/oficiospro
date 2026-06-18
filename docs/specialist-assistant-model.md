# OficiosPro assistant model

Este documento describe la primera version del Asistente OficiosPro controlado y accionable.

## Objetivo

Guiar a clientes y especialistas con informacion curada sobre:

- busqueda de especialistas
- solicitudes por servicio
- registro
- perfil fundador
- formalizacion
- comision
- creditos
- pagos
- referidos
- categorias
- seguridad de documentos
- soporte humano

## Modelo usado

No usa LLM, API externa ni generacion libre.

La respuesta se construye con:

1. Base de conocimiento curada en `src/data/specialistAssistantKnowledge.ts`.
2. Matching por keywords e intencion en `src/lib/specialistAssistant.ts`.
3. Respuestas preaprobadas.
4. Fallback seguro a `bperez@oficiospro.cl`.

## Que no responde

El asistente no responde:

- temas fuera de OficiosPro
- asesoria tributaria, contable o legal definitiva
- instrucciones para evadir impuestos
- datos privados de otros especialistas
- documentos, cedulas, selfies o RUT de terceros
- credenciales, tokens, rutas internas o informacion sensible
- promesas de ingresos, empleos o volumen fijo de trabajos

## Como evita alucinaciones

- No genera respuestas nuevas con IA.
- Solo entrega respuestas existentes en la base curada.
- Si la confianza es baja, deriva a humano.
- Si detecta tema sensible, deriva a humano.
- Si detecta tema tributario/legal especifico, responde con disclaimer y deriva.
- Si no hay intencion conocida, dice que no tiene respuesta confirmada.

## Intenciones accionables

El asistente detecta intenciones como:

- `find_service`
- `find_gasfiter`
- `find_electricista`
- `find_calefont`
- `find_jardinero`
- `find_climatizacion`
- `find_pintor`
- `find_security_service`
- `find_pool_service`
- `offer_services`
- `formalization`
- `commission`
- `credits`
- `support`
- `referral`
- `institution`

Cada respuesta puede incluir botones como:

- Buscar especialista
- Ver gasfiteres
- Buscar por comuna
- Solicitar especialista
- Ofrecer mis servicios
- Ir al registro
- Ver formalizacion
- Escribir a soporte

## Limite de 5 preguntas

El widget guarda una sesion local en `sessionStorage`:

- `sessionId`
- `questionCount`
- `infoSeekingCount`
- `lastQuestions`
- `escalated`

Si una persona hace mas de 5 preguntas informativas sin iniciar una accion concreta, el asistente recomienda contacto humano:

`Para ayudarte bien y evitar informacion incompleta, escribenos a bperez@oficiospro.cl. Asi revisamos tu caso puntual.`

Acciones que reinician la friccion:

- click en crear perfil
- click en formalizacion
- click en email humano

## Donde aparece

El widget `src/components/SpecialistAssistantWidget.tsx` se monta globalmente desde `src/app/layout.tsx`.

Aparece en paginas publicas como:

- `/`
- `/especialistas`
- `/especialistas-fundadores`
- `/registro-especialista`
- `/trabajos/[oficio]`
- `/servicios/[servicio]`
- `/formalizacion`
- `/referidos/especialistas`
- `/instituciones`

Se oculta en:

- `/admin`
- `/admin/*`
- `/checkout`
- `/checkout/*`
- `/bolsa`
- `/bolsa/*`
- `/login`

## Eventos registrados

Usa la capa existente `src/lib/analytics/index.ts` y el endpoint existente `POST /api/conversion-events/create`.

Eventos:

- `assistant_opened`
- `assistant_question_asked`
- `assistant_intent_detected`
- `assistant_action_clicked`
- `assistant_escalated`
- `assistant_find_service_clicked`
- `assistant_offer_services_clicked`
- `specialist_assistant_opened`
- `specialist_assistant_question_asked`
- `specialist_assistant_answer_served`
- `specialist_assistant_escalated`
- `specialist_assistant_clicked_register`
- `specialist_assistant_clicked_email`
- `specialist_assistant_clicked_formalization`

No se guardan documentos, RUT completos, telefonos completos, tokens ni passwords. Las preguntas escaladas se guardan sanitizadas solo para mejorar la base curada.

## CRM

`/admin/crm/acquisition` muestra eventos antiguos `specialist_assistant_*` y eventos globales `assistant_*`:

- cantidad de preguntas
- respuestas servidas
- escalaciones
- preguntas sin respuesta
- temas mas preguntados
- razones de escalacion
- preguntas escaladas sanitizadas

No se creo una tabla nueva `unanswered_specialist_questions` para evitar tocar Worker/D1 en esta version. El pendiente queda como mejora futura si se necesita workflow editorial dedicado.

## Como agregar nuevas respuestas

1. Agregar una entrada en `src/data/specialistAssistantKnowledge.ts`.
2. Incluir:
   - `id`
   - `category`
   - `intent`
   - `keywords`
   - `questionExamples`
   - `answer`
   - `relatedLinks`
   - `confidence`
   - `escalationRecommended`
3. Mantener respuestas de 1 a 2 parrafos.
4. No prometer ingresos ni disponibilidad.
5. No dar asesoria tributaria/legal definitiva.
6. Correr `npm run validate` y `npm run build`.

## Como revisar preguntas sin respuesta

1. Entrar a `/admin/crm/acquisition`.
2. Revisar `Preguntas escaladas del asistente`.
3. Confirmar que la pregunta este sanitizada.
4. Decidir si requiere:
   - nueva respuesta curada
   - mejora de keywords
   - derivacion humana permanente
5. Agregar el aprendizaje al backlog Kaizen.

## Pendientes

- Crear endpoint/tabla dedicada `unanswered_specialist_questions` cuando Benjamin apruebe tocar Worker/D1.
- Agregar tests unitarios del motor de matching si el volumen de intenciones crece.
- Revisar semanalmente las escalaciones para ampliar la base sin inventar respuestas.
