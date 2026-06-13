# CRM Daily Operations Playbook

## Rutina diaria

1. Abrir `/admin/crm`.
2. Ingresar `ADMIN_TOKEN`.
3. Ejecutar:
   - Sincronizar leads.
   - Sincronizar especialistas.
   - Sincronizar cotizaciones.
4. Revisar KPIs:
   - Leads nuevos.
   - Especialistas pendientes.
   - Cotizaciones virtuales pendientes.
   - Tareas vencidas.
   - Empresas nuevas.
   - Pagos con problema.
5. Ir a `/admin/crm/opportunities`.
6. Filtrar por pipeline y prioridad.
7. Abrir cada oportunidad nueva.
8. Crear tarea con proxima accion.
9. Agregar nota interna despues de cada llamada, WhatsApp o correo.
10. Actualizar stage/status.

## Leads de clientes

- Primer contacto el mismo dia.
- Si hay urgencia, prioridad `alta`.
- Si requiere diagnostico, mover a `diagnosticando`.
- Si se envia propuesta, mover a `cotizacion_enviada`.
- Si se pierde, cerrar con nota de motivo.

## Postulaciones de especialistas

- Revisar identidad y datos basicos.
- Si falta informacion, crear tarea `collect_docs`.
- Si pasa revision inicial, mover a `validacion`.
- Cuando este aprobado/publicado, cerrar oportunidad o dejar seguimiento comercial.

## Cotizaciones virtuales

- Revisar pendientes cada manana y tarde.
- Si falta informacion, crear tarea de WhatsApp al cliente.
- Si requiere especialista, asignar tarea `quote_review`.
- Cuando haya propuesta, mover a `propuesta_enviada`.
- Si cliente aprueba, mover a `convertido_checkout`.

## Empresas y Club Hogar

- Filtrar pipeline `empresas`.
- Crear tarea de llamada o reunion.
- Registrar notas de necesidad, comunas, frecuencia y urgencia.
- Exportar CSV semanal para seguimiento comercial.

## Pagos y creditos

- Revisar pagos con problema.
- Crear tarea `payment_check`.
- Revisar webhook, estado proveedor y ledger.
- No prometer activacion hasta confirmar conciliacion.

## Exportaciones

Exportar CSV desde:

- Oportunidades.
- Tareas.
- Contactos.
- Empresas.
- Actividad.

Usar el CSV para cierre operativo diario o reporte semanal.

## Reglas de seguridad

- No copiar documentos sensibles en notas.
- No registrar tokens, claves ni datos bancarios.
- No tratar datos demo como reales.
- Si no hay datos, mantener empty state y revisar D1/migraciones.
