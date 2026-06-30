# Playbook de expansión global

Cómo OficiosPro evalúa y activa mercados nuevos, **local-first**, sin depender de `oficiospro.com` y sin
prometer presencia global.

## Secuencia por mercado

1. **Research** — agregar el mercado a `src/data/marketLab.ts` (noindex). Hipótesis de demanda/oferta.
2. **Landing noindex** — `/market-lab/[country]/[city]/[trade]` en `oficiospro.cl`. Copy honesto
   ("estamos explorando"). Cero promesa de cobertura.
3. **Medir** — leads `market_lab_demand_lead` (cliente/empresa) y `market_lab_supply_lead` (especialista).
4. **Umbral de tracción** — definir mínimos de demanda + oferta sostenidas antes de invertir.
5. **Decisión de operar** — solo si hay capacidad real: oferta verificada, pagos locales, legal/tributario, soporte.
6. **Activación local** — recién aquí se evalúa dominio/idioma/SEO indexable para ese mercado.

## Dominios en la expansión

- Chile: `oficiospro.cl` (principal, no se mueve).
- Exploración: `oficiospro.cl/market-lab` (noindex).
- Global futuro: dominio alternativo **solo con tracción** (`oficiospro.app`, `.global`, `getoficiospro.com`,
  o ccTLD por país). Ver `docs/domain-global-strategy.md`.

## Estrategia si `oficiospro.com` no está disponible

No bloquea la expansión: se mide demanda en `/market-lab` (noindex, sobre `.cl`) y se compra un dominio
global alternativo únicamente cuando un mercado justifique operación real. Riesgos de rebranding y criterios
de compra están en `docs/domain-global-strategy.md`.

## Reglas

- No SEO internacional indexable hasta aprobación.
- No activar pagos internacionales (todo `paymentStatus: disabled/research_only`).
- No mostrar oferta/demos como reales.
- No tocar Worker/D1/wrangler para experimentos de mercado.
