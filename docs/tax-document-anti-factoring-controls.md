# Controles de documentos tributarios y antifactoring

Estado: diseno operacional preventivo. No reemplaza contrato, asesoria legal, contador ni validacion SII.

## Regla base

Los especialistas solo deben emitir boletas/facturas a OP SpA cuando exista una autorizacion interna previa.

Cada autorizacion genera un `authorizationCode` y define:

- especialista,
- solicitud o payout asociado,
- RUT emisor autorizado,
- receptor OP SpA,
- tipo de documento,
- monto autorizado,
- vigencia,
- usuario admin que autoriza.

Si un documento llega sin autorizacion previa, con emisor distinto, monto distinto, folio duplicado o cesion/factoring no autorizado, queda bloqueado hasta revision.

## Tablas D1

La migracion `migrations/0009_tax_document_controls.sql` crea:

- `authorized_document_requests`
- `received_tax_documents`
- `factoring_risk_alerts`
- `supplier_document_policies`

Todas las tablas se crean con `CREATE TABLE IF NOT EXISTS` para evitar conflictos en D1.

## Flujo operativo

1. Admin genera autorizacion interna antes de pedir documento.
2. Especialista emite documento a OP SpA usando los datos autorizados.
3. Admin registra documento recibido.
4. Sistema intenta hacer match por `authorizationCode`, emisor, tipo, solicitud/payout y monto.
5. Si calza, el documento puede quedar `accepted` y el payout puede avanzar.
6. Si no calza, el documento queda `claimed`, `rejected` o `manual_review`.
7. Si hay cesion/factoring no autorizado, se crea alerta critica y se bloquea payout.

## Reglas de bloqueo

- Sin autorizacion: reclamar/rechazar y bloquear payout.
- Monto distinto: revision manual y payout bloqueado.
- Emisor distinto: rechazar/reclamar y bloquear payout.
- Receptor distinto a OP SpA: rechazar/reclamar y bloquear payout.
- Documento duplicado: rechazar/reclamar y bloquear payout.
- Cesion/factoring sin autorizacion escrita: alerta critica, payout bloqueado y revision legal/contable.
- Documento calzado y sin alertas bloqueantes: aceptado y listo para revision final.

## Codigo

Reglas puras:

`src/lib/finance/taxDocumentControls.ts`

Funciones principales:

- `validateReceivedTaxDocument()`
- `matchDocumentToAuthorization()`
- `detectFactoringRisk()`
- `shouldAcceptDocument()`
- `shouldBlockPayoutForDocument()`

Providers/stubs preparados:

- `TaxDocumentVerificationProvider`
- `ManualSiiVerificationProvider`
- `FactoringAssignmentCheckProvider`

## UI admin

`/admin/formalizacion` incluye la seccion **Documentos tributarios** para:

- generar autorizaciones,
- copiar datos OP SpA,
- invalidar autorizaciones,
- marcar documento recibido,
- validar match,
- aceptar/reclamar/rechazar,
- bloquear/desbloquear payout,
- crear tarea CRM de revision,
- revisar alertas de factoring.

La vista actual es operativa/manual. Antes de pagos reales debe conectarse a endpoints admin D1 con auditoria.

## Pendiente legal/contador/SII

- Datos definitivos OP SpA: RUT, giro, direccion y correo tributario.
- Glosa obligatoria de boletas/facturas.
- Procedimiento formal para reclamar DTE/boletas no autorizadas.
- Politica contractual de prohibicion de cesion/factoring sin autorizacion.
- Consulta real a SII y registro de cesion/factoring.
- Auditoria de acciones admin.
