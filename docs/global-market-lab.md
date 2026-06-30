# Global Market Lab

Laboratorio para prototipar mercados (países/ciudades/oficios) de forma global **sin operar realmente**
fuera de Chile y **sin depender de `oficiospro.com`**. Inspirado en expansión local-first (estilo Ebury):
motor global común, adaptación local, activación solo donde haya tracción.

## Principios de honestidad

- "Estamos explorando este mercado." / "Sin disponibilidad garantizada todavía." / "Perfiles referenciales si aplica."
- No prometer cobertura ni presencia global. No mostrar perfiles demo como reales.
- **noindex por defecto** (no SEO internacional indexable todavía).
- Dominio: todo vive bajo **`oficiospro.cl/market-lab`** (ver `docs/domain-global-strategy.md`). No usar `.com`.

## Implementación actual (en código)

- Datos: `src/data/marketLab.ts` — 11 mercados (Chile/Santiago, Perú/Lima, Colombia/Bogotá, México/CDMX,
  España/Madrid, Brasil/São Paulo, Portugal/Lisboa, Argentina/Buenos Aires, Uruguay/Montevideo,
  EE.UU. hispano/Miami, UAE/Dubai). Cada mercado: `countryCode`, `countrySlug`, `cityName`, `locale`,
  `currency`, `neighborhoodLabel`, `trades[]`, `status`, `seoStatus: noindex`, `paymentStatus: disabled/research_only`,
  `contactChannel`, `trustNote`, `demoProfilePolicy: referential_only`.
- Rutas (todas noindex):
  - `/market-lab` — índice de mercados en exploración.
  - `/market-lab/[country]/[city]/[trade]` — landing por mercado (`generateStaticParams`, `robots:{index:false}`).
- Captura de leads unificada (`src/lib/marketLab/marketLabLeads.ts`, sin tocar Worker/D1):
  - clientes/empresas → `market_lab_demand_lead`
  - especialistas → `market_lab_supply_lead`
  - `global_waitlist` queda como `source`/`campaign`.

## Estados de mercado

`research → landing_live → collecting_supply → collecting_demand → pilot_ready → paused`.
`seoStatus`: `noindex` (default) → `draft` → `approved` (solo con aprobación de Benjamín).
`paymentStatus`: `disabled` → `research_only` → `future` (no se activan pagos internacionales).

## Estrategia si `oficiospro.com` no está disponible

- El Market Lab **no necesita** el `.com`: corre dentro de `oficiospro.cl/market-lab` (noindex).
- Sirve para medir demanda por país antes de decidir cualquier dominio global.
- Solo con tracción medible se evalúa un dominio global alternativo (`oficiospro.app`, `.global`,
  `getoficiospro.com`, ccTLD por país). Ver criterios en `docs/domain-global-strategy.md`.

## Pendiente para operar realmente un mercado

Pagos locales, marco legal/tributario, oferta verificada, soporte e idioma — nada de eso está activo.
El Market Lab solo mide interés.
