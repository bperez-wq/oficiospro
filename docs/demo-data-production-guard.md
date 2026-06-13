# Bloqueo de datos demo en produccion

## Regla central

La utilidad `shouldShowDemoData()` en `src/lib/demoData.ts` es la fuente unica para decidir si la aplicacion puede mostrar o sembrar datos demo.

Regla vigente:

- Produccion: demo data desactivada por defecto.
- Produccion: `seedMockState()` no crea registros en `localStorage`.
- Produccion: si no hay datos reales/locales, las vistas internas muestran estados vacios.
- Desarrollo: demo data solo se habilita con `NEXT_PUBLIC_SHOW_DEMO_DATA=true`.

## Como activar demo data en desarrollo

Crear `.env.local` solo en entorno local:

```bash
NEXT_PUBLIC_SHOW_DEMO_DATA=true
```

No usar este flag en produccion.

## Limpieza defensiva

Cuando demo data esta desactivada, `seedMockState()` llama una limpieza defensiva que elimina registros demo conocidos ya persistidos en el navegador:

- especialistas pendientes `seed-specialist-*`,
- Mauricio Peña,
- Paula Cortés,
- emails demo `mauricio.pena@oficiospro.cl` y `paula.cortes@oficiospro.cl`,
- reservas demo conocidas (`bk-1001`, `bk-1002`, `bk-2001`, `bk-2002`),
- transacciones demo conocidas (`tx-001` a `tx-004`),
- pagos/suscripciones/movimientos/liquidaciones demo iniciales,
- acuerdos/adicionales demo conocidos.

La limpieza no borra postulaciones reales creadas desde formularios.

## Vistas corregidas

- `/admin`: pendientes, publicados, reviews y KPIs internos ya no mezclan especialistas de `mock.ts` si demo esta apagada.
- Pagos/admin: no se siembran payment intents, wallets, movimientos ni payouts demo.
- Finanzas admin: `AdminFinancePanel` parte vacio salvo demo explicito.
- Ledger admin: `AdminCreditLedgerPreview` muestra ceros salvo demo explicito.
- Dashboard cliente: reservas, movimientos, favoritos y especialistas cercanos no inventan datos.
- Dashboard especialista: no muestra perfil demo si no hay demo data.
- Dashboard empresa: KPIs, servicios, sucursales y movimientos parten vacios.
- Club Hogar: historial de movimientos no muestra `defaultTransactions` si demo esta apagada.
