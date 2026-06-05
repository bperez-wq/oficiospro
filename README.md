# OficiosPro

Plataforma inicial para OficiosPro: técnicos verificados para hogar y empresas, con landing, rutas de app, formularios mock, dashboards y preparación para Supabase.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Cloudflare Workers & Pages compatible mediante Worker con assets estáticos
- Datos mock por defecto
- Supabase opcional, documentado en `supabase/schema.sql`

## Rutas incluidas

- `/`
- `/login`
- `/registro-cliente`
- `/registro-especialista`
- `/especialistas`
- `/especialistas/[id]`
- `/club-hogar`
- `/empresas`
- `/dashboard-cliente`
- `/dashboard-especialista`
- `/dashboard-empresa`
- `/admin`

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir:

```text
http://localhost:3000
```

## Build para Cloudflare Workers & Pages

```bash
npm run build
```

La salida estática queda en:

```text
out
```

## Configuración Cloudflare Workers & Pages

El proyecto está configurado para desplegar el export estático de Next desde `out` usando Workers Static Assets.

En Cloudflare usar:

```text
Build command: npm run build
Deploy command: npx wrangler deploy --assets ./out
Root directory: /
```

El Worker activo configurado en `wrangler.toml` es:

```text
oficiospro
```

Ese es el proyecto que actualmente tiene el dominio `oficiospro.cl`.

También se puede ejecutar localmente:

```bash
npm run deploy
```

`wrangler.toml` apunta a:

```toml
[assets]
directory = "./out"
```

El proyecto usa `output: "export"` en `next.config.ts`, por eso `npm run build` genera HTML/CSS/JS estático en `out`. No hay entrypoint Worker porque el sitio solo necesita servir assets estáticos.

## Supabase opcional

La app no requiere variables de entorno para compilar en Cloudflare Pages. Por defecto usa datos mock y `localStorage`.

El stub opcional está en:

```text
src/lib/supabase.ts
```

El SQL inicial de referencia está en:

```text
supabase/schema.sql
```

Cuando se decida conectar Supabase, el próximo paso será reemplazar `src/lib/storage.ts` por consultas reales y activar un cliente en `src/lib/supabase.ts`.

## Subir a GitHub

Desde PowerShell, estando dentro de la carpeta `oficiospro-next`:

```powershell
git init
git branch -M main
git remote add origin https://github.com/bperez-wq/oficiospro.git
git add .
git commit -m "Initial OficiosPro Next platform"
git push -u origin main
```

Si el repo remoto ya tiene algún archivo, usar:

```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```
