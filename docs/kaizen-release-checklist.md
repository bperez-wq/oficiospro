# Kaizen release checklist

Usar antes de cada deploy o merge importante.

## 1. Estado Git

```powershell
git status
git log --oneline -5
git branch --show-current
npm.cmd run kaizen:audit
```

Confirmar:

- Estas en la rama correcta.
- No hay archivos generados stageados.
- No aparecen `node_modules/`, `.next/`, `out/` ni `work/`.
- No hay cambios sorpresa en `worker/index.ts`, `wrangler.toml`, migraciones, pagos o Mercado Pago.
- Si `kaizen:audit` muestra archivos accidentales como `_synctest.txt`, `tatus --short`, `ersBenjaminoficiosprooficiospro` o `tsconfig.tsbuildinfo`, no usar `git add .`.
- Para una revision estricta antes de commit:

```powershell
npm.cmd run kaizen:audit -- --strict
```

Si hay archivos intencionales pendientes de otro agente, dejarlos fuera del commit y stagear solo rutas explicitas.

## 2. Regla de ramas

Si se trabaja en feature branch, no usar:

```powershell
git push origin main
```

esperando que suba la rama actual.

Usar una de estas rutas:

- PR/merge a `main`.
- `git checkout main` y merge consciente de la feature.
- `git push origin feature-name` si corresponde subir la rama para revision.

Todo PR debe apuntar a `main`, salvo instruccion explicita.

## 3. Validacion local

Para cambios de codigo:

```powershell
npm run validate
npm run build
npx.cmd wrangler deploy --dry-run --assets ./out
```

Para cambios solo docs:

- Revisar ortografia tecnica.
- Revisar links internos.
- Confirmar que no se modifico codigo funcional.
- `npm run validate` si el cambio toca documentos exigidos por validadores o si hay duda.

## 4. Build y static export

Confirmar:

- `npm run build` genera `out/`.
- Next static export sigue funcionando.
- No existe `public/_redirects`.
- No hay errores de TypeScript.
- No hay cambios no intencionados en rutas publicas.

## 5. Dry-run Cloudflare

```powershell
npx.cmd wrangler deploy --dry-run --assets ./out
```

Confirmar:

- Wrangler lee assets desde `out/`.
- Binding esperado aparece como `env.DB (oficiospro-leads)`.
- `env.ASSETS` aparece.
- El comando sale con `--dry-run: exiting now`.

## 6. Deploy

Solo con aprobacion de Benjamin:

```powershell
npx.cmd wrangler deploy --assets ./out
```

Despues:

- Confirmar URL de Worker.
- Confirmar dominio publico si aplica.
- Revisar Cloudflare 100% trafico a la version correcta.
- Revisar que no haya rollback automatico o version antigua activa.

## 7. Pruebas manuales

Minimo:

- Home carga.
- Header y menu categorias funcionan.
- Login/admin funciona segun permisos reales.
- `/especialistas` carga y filtros funcionan.
- Perfil especialista carga.
- Bolsa y `/bolsa` funcionan.
- Checkout no rompe.
- `/admin/leads` carga con token.
- `/admin/crm` carga con token.
- Formularios principales muestran confirmacion o fallback humano.
- Mobile: no hay overflow, botones pegados ni modales fuera de viewport.

## 8. Modulos criticos que no deben romperse

- Worker.
- D1.
- CRM.
- Lead capture.
- Admin auth real.
- Mercado Pago.
- Creditos.
- Bolsa.
- Checkout.
- SEO sitemap/robots.
- Specialist registration.
- Public specialist profiles.

## 9. Rollback basico

Si algo falla en produccion:

1. No seguir haciendo cambios encima sin diagnostico.
2. Identificar ultimo commit/deploy sano.
3. Revisar Cloudflare deployments.
4. Si el problema es de assets/codigo, redeploy de version sana.
5. Si el problema es secreto/env, corregir variable y redeploy si corresponde.
6. Si afecta pagos, datos sensibles, admin o D1, pausar cambios y documentar incidente.
7. Registrar causa y accion preventiva en `docs/kaizen-backlog.md`.
