# Handoff para Claude: pilot readiness check

## Contexto

Codex agrego un script de readiness para revisar rutas publicas, SEO, admin y CRM antes de deploy o merge. No cambia UI ni backend.

## Lo que puedes trabajar

- Mejorar copy de `docs/pilot-readiness-check.md`.
- Agregar pasos manuales UX/mobile complementarios al reporte.
- No tocar el script si estas trabajando en cambios visuales.

## No tocar

- `worker/index.ts`
- `wrangler.toml`
- D1 remoto
- pagos, Mercado Pago, checkout
- datos personales o secretos

## Uso esperado

```powershell
node scripts\pilot-readiness-check.mjs --offline
node scripts\pilot-readiness-check.mjs
```
