# Estrategia global de dominios

Define cómo OficiosPro maneja dominios para crecer globalmente **sin depender de `oficiospro.com`**,
que **actualmente NO es propiedad de OficiosPro**. Ningún código, doc ni estrategia debe asumir el `.com`
como propio.

## Principios

- **`oficiospro.cl` es el dominio principal** (operación real en Chile). Toda la metadata, canonical,
  sitemap y SEO indexable apuntan a `oficiospro.cl`.
- **No usar `oficiospro.com`** en código, metadata, docs ni materiales como si fuera nuestro.
- **No prometer presencia global** ni cobertura fuera de Chile.
- **No crear SEO internacional indexable todavía** (los experimentos van noindex).
- Expansión **local-first**: motor global común, activación por mercado solo con tracción.

## Estado actual

- Producción Chile: `oficiospro.cl`.
- Laboratorio de mercados: **`/market-lab`** dentro de `oficiospro.cl`, **noindex** por defecto
  (ver `docs/global-market-lab.md`). Sirve para medir interés por país/ciudad/oficio sin prometer cobertura.
- i18n: client-side (es/en/pt/fr/de/it). Rutas por idioma pregeneradas = fase futura con aprobación
  (ver `docs/i18n-localized-routes-plan.md`).

## Estrategia si `oficiospro.com` no está disponible

Es el escenario vigente. Plan:

1. **No depender del `.com`.** No se compra ni se referencia como propio. Si algún día está disponible a
   precio razonable, se evalúa solo como redirección hacia el dominio oficial, nunca como marca base.
2. **Chile sigue en `oficiospro.cl`.** Es el activo de marca y SEO; no se migra.
3. **Pruebas internacionales en `/market-lab` (noindex)** dentro de `oficiospro.cl`. Cero costo de dominio,
   cero riesgo de marca, datos de demanda reales por mercado.
4. **Evaluar un dominio global alternativo solo cuando haya tracción medible** en un mercado (ver criterios).
5. **Criterios para comprar un dominio global:**
   - Señal de demanda sostenida en ≥1 mercado fuera de Chile (leads supply+demand en `/market-lab`).
   - Decisión de operar realmente ahí (pagos, legal, oferta) — no solo marketing.
   - Disponibilidad del dominio + costo razonable + sin conflicto de marca/trademark.
   - Capacidad operativa para sostener el mercado (no abrir lo que no se puede atender).
6. **Riesgos de cambiar de marca/dominio:**
   - Pérdida de SEO/autoridad si se mueve Chile fuera de `.cl` (NO recomendado).
   - Confusión de marca si conviven varios dominios sin jerarquía clara.
   - Costo de redirecciones, emails, certificados y rebranding.
   - Mitigación: `oficiospro.cl` permanece como ancla; el dominio global sería **paraguas**, no reemplazo,
     y cada país fuerte puede usar su ccTLD (`.pe`, `.co`, `.mx`…) cuando se active.
7. **Dominios candidatos a verificar** (disponibilidad + trademark antes de comprar):
   - `oficiospro.app`
   - `oficiospro.global`
   - `getoficiospro.com`
   - `oficiospro.io` / `oficiospro.lat` (LatAm) / `oficiospro.world`
   - ccTLD por país cuando se active operación: `oficiospro.pe`, `.co`, `.mx`, etc.
   - Marca alternativa global solo si "OficiosPro" no escala lingüísticamente (decisión de Benjamín).

## Reglas para código y SEO

- `metadataBase`, `canonical`, OpenGraph y sitemap → `oficiospro.cl` únicamente.
- `/market-lab/**` → `robots: noindex` (ya implementado).
- No agregar `hreflang` ni sitemaps internacionales hasta aprobar la fase de rutas por idioma.
- Emails de contacto en `@oficiospro.cl`.

## Decisiones que requieren a Benjamín

- Comprar (o no) un dominio global alternativo y cuál, una vez haya tracción.
- Momento de activar SEO internacional indexable.
- Si algún país amerita su propio ccTLD/operación local.
