# OficiosPro

Plataforma inicial para OficiosPro: técnicos verificados para hogar y empresas, con landing, rutas de app, formularios mock, dashboards y preparación para Supabase.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Cloudflare Pages compatible mediante export estático
- Supabase preparado con `supabase/schema.sql`

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

## Build para Cloudflare Pages

```bash
npm run build
```

La salida estática queda en:

```text
out
```

## Configuración Cloudflare Pages

Conectar el repositorio GitHub y usar:

```text
Framework preset: Next.js
Build command: npm run build
Build output directory: out
Root directory: /
```

El proyecto usa `output: "export"` en `next.config.ts`, por eso Cloudflare Pages publica HTML/CSS/JS estático desde `out`.

## Supabase

Variables esperadas:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

El cliente está en:

```text
src/lib/supabase.ts
```

El SQL inicial está en:

```text
supabase/schema.sql
```

Por ahora la plataforma usa datos mock y `localStorage`; el próximo paso es reemplazar `src/lib/storage.ts` por consultas a Supabase.

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
