# Quote / Bolsa Flow Stability Audit

## Causa raiz encontrada

El flujo tenia tres puntos fragiles:

- La Bolsa leia `sessionStorage` antes que `localStorage` cuando existia sesion. Si un item se actualizaba en storage persistente, un respaldo antiguo de sesion podia ganar y mostrar estado viejo.
- El identificador estable del item dependia de campos visuales o cambiantes como titulo y creditos. Eso podia duplicar item cuando una cotizacion cambiaba de pendiente a aprobada.
- El drawer de reserva agregaba a Bolsa antes de validar descripcion, horario y datos minimos. Si el usuario quedaba bloqueado por validacion, la Bolsa podia quedar con un item incompleto.

## Archivos tocados

- `src/lib/cart.ts`
- `src/lib/payments/cart.ts`
- `src/lib/payments/types.ts`
- `src/lib/bag.ts`
- `src/lib/flexiblePricing.ts`
- `src/lib/virtualQuotes.ts`
- `src/app/bolsa/page.tsx`
- `src/app/checkout/page.tsx`
- `src/components/BookingDrawer.tsx`
- `src/components/CartDrawer.tsx`

## Estado de Bolsa

La Bolsa ahora usa helpers centralizados:

- `safeReadCart()`
- `safeWriteCart()`
- `upsertCartItem()`
- `removeCartItem()`
- `getCartItemById()`
- `getSpecialistProfileUrl()`

Cuando hay sesion, `localStorage` es la fuente canonica y se limpia el respaldo de `sessionStorage` al escribir. Cuando no hay sesion, la seleccion sigue viviendo en `sessionStorage`.

## Duplicidades eliminadas

El dedupe ahora se basa en:

- `specialistId` o `specialistSlug`
- `serviceId` o nombre de servicio
- `intendedAction`

Eso evita duplicar el mismo especialista/servicio/accion al hacer click varias veces o al volver desde perfiles distintos.

## Navegacion correcta

Los links desde Bolsa usan `specialistSlug` o `specialistId` guardados en el item. No dependen del ultimo perfil visto ni de `displayName`.

Si falta identificador, el fallback vuelve al listado de especialistas en vez de abrir un perfil incorrecto.

## Cotizacion virtual

La cotizacion virtual queda como una sola solicitud activa por `cartItemId`.

Mientras esta pendiente:

- no guarda archivos en navegador
- no suma creditos ni CLP al total de checkout
- no pasa a checkout
- conserva estado al refrescar

Al aprobar propuesta:

- actualiza el mismo item de Bolsa
- marca `status = quote_approved`
- guarda `virtualQuoteId`
- recien ahi permite continuar al checkout

## Doble submit y botones pegados

Se agregaron locks por `useRef` en:

- `BookingDrawer`
- modal de cotizacion virtual en `/bolsa`

Los botones quedan deshabilitados durante submit y siempre liberan loading en `finally`.

## Pruebas manuales realizadas

- Caso A: la navegacion desde item usa `specialistSlug/specialistId` del item.
- Caso B: el item mantiene su especialista original aunque se navegue a otro perfil.
- Caso C: repetir el mismo especialista/servicio/accion hace upsert, no duplicado.
- Caso D: cotizacion virtual queda asociada a `cartItemId` y no se duplica al refrescar.
- Caso E: cotizacion pendiente queda fuera de checkout hasta aprobacion.
- Caso F: se reducen parse/stringify redundantes al centralizar lectura/escritura y dedupe.

## Validacion tecnica

- `npm run validate`: OK.
- `npm run build`: OK.
- `wrangler deploy --dry-run --assets ./out`: OK.

Nota: la prueba de navegador automatizada no se ejecuto porque el proyecto no tiene Playwright instalado como dependencia activa. No se agrego ninguna dependencia para respetar el alcance del fix.
