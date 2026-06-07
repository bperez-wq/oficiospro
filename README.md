# OficiosPro Web

Sitio estático premium para OficiosPro, preparado para Cloudflare Workers Static Assets sin framework ni build pesado.

## Estructura

```txt
.
├── package.json
├── wrangler.toml
└── public/
    ├── index.html
    ├── styles.css
    ├── app.js
    └── assets/
        └── visuals/
```

## Deploy

```bash
npx wrangler deploy
```

## Configuración Cloudflare

`wrangler.toml`:

```toml
name = "oficiospro-web"
compatibility_date = "2026-06-06"

[assets]
directory = "./public"
not_found_handling = "single-page-application"
```

## Desarrollo local

Abre `public/index.html` directamente en el navegador para revisar el sitio. La experiencia no requiere Next.js, React, Tailwind ni pasos de build.
