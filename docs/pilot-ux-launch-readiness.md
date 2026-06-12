# Pilot UX Launch Readiness

## Resumen

OficiosPro queda presentado como una apertura controlada, no como una operacion masiva ya automatizada. La UX ahora explica que el piloto combina perfiles fundadores, solicitudes reales y seguimiento operacional cuando no existe match exacto por comuna o servicio.

## Mensajes agregados

- Home: "Piloto fundador OficiosPro" y bloque de etapa piloto despues de especialistas destacados.
- Registro especialista: "Haz visible tu oficio en OficiosPro" y CTA "Crear perfil fundador".
- Especialistas: estado vacio para falta de cobertura por servicio o zona.
- Bolsa: seleccion guardada para comparar especialistas, creditos y planes.
- Checkout: los creditos se activan cuando el pago sea confirmado; en piloto puede existir confirmacion operacional.
- Soporte: etapa piloto con seguimiento humano.
- Admin leads: alerta para usar la vista como fuente real del piloto.

## Rutas clave

- `/`: entrada principal con busqueda, especialistas destacados y bloque piloto.
- `/piloto`: explicacion breve de apertura controlada.
- `/registro-especialista`: onboarding de especialista fundador.
- `/especialistas`: busqueda con filtros y captura de demanda si no hay resultados.
- `/bolsa`: comparacion de seleccion antes de reservar o pagar.
- `/checkout`: compra de creditos, plan o solicitud con lenguaje de confirmacion.
- `/soporte`: contencion de dudas y casos que requieren seguimiento.
- `/admin/leads`: revision real de leads desde D1 cuando Cloudflare esta configurado.

## Pruebas recomendadas

### Postulacion especialista

1. Abrir `/registro-especialista`.
2. Completar identidad, comuna y servicios.
3. Dejar referencias, certificaciones y archivos opcionales si no se tienen.
4. Enviar y verificar mensaje de exito.
5. Confirmar redireccion a `/?postulacion=recibida`.
6. Revisar que el lead aparezca en `/admin/leads` si D1 y `ADMIN_TOKEN` estan configurados.

### Lead cliente

1. Abrir `/especialistas` con una especialidad o comuna sin resultados.
2. Usar "Solicitar especialista" o "Quiero que me contacten".
3. Confirmar mensaje humano y respaldo local si DB no esta configurada.
4. Confirmar registro en `/admin/leads` en ambiente con D1.

### Solicitud desde bolsa

1. Agregar un especialista a la bolsa.
2. Revisar que `/bolsa` permita comparar y continuar.
3. Abrir reserva o checkout sin perder contexto.

### Checkout

1. Abrir `/checkout`.
2. Confirmar que no promete activacion automatica antes de pago confirmado.
3. Verificar que el estado visible indique confirmacion de pago u operacion piloto cuando corresponda.

## Listo para piloto

- Mensajes transparentes de etapa piloto.
- Captura de demanda cuando no hay especialistas exactos.
- Onboarding fundador con archivos y certificaciones opcionales.
- Bolsa como comparador previo a reserva o checkout.
- Admin leads con KPIs derivados de datos reales.
- Estados vacios premium para rutas criticas.

## No listo para produccion masiva

- La operacion todavia requiere configuracion Cloudflare D1 y secretos en produccion.
- Algunos dashboards siguen apoyandose en datos locales o seed para experiencia inicial.
- Los pagos necesitan conciliacion operacional robusta antes de prometer activacion instantanea de creditos.
- Falta hardening completo de almacenamiento seguro de documentos sensibles.
- Falta observabilidad, rate limits y procesos para volumen alto de postulaciones.
- Falta integracion tributaria/electronica definitiva para operacion masiva.

## Pendiente para escalar

- Confirmar D1 remoto, migraciones y `ADMIN_TOKEN` en Cloudflare.
- Definir SLA operacional para revisar leads diarios.
- Implementar almacenamiento privado y lifecycle de documentos de identidad.
- Consolidar reporteria de pagos, creditos y conciliacion.
- Crear panel de operaciones para priorizar comunas/oficios con demanda sin match.
- Automatizar notificaciones por email/WhatsApp cuando el volumen lo justifique.
