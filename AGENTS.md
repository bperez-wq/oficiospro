# OficiosPro Agent Rules

These rules protect the current premium OficiosPro experience and Cloudflare Workers Static Assets deployment. Follow them for every PR.

## Non-Negotiable Rules

1. Do not simplify `public/index.html`.
2. Do not remove premium home sections:
   - hero
   - buscador
   - servicios
   - garantía OficiosPro
   - Club Hogar
   - empresas
   - especialistas
   - trabajos realizados
   - testimonios
   - footer
3. Do not delete existing data for comunas, servicios, especialistas, categorías, reservas, créditos, or empresas.
4. Do not create `public/_redirects`.
5. Do not change `wrangler.toml` unless necessary and explicitly justified in the PR description.
6. Do not convert the project to Next.js, React, Vite, or another framework.
7. Add new functionality incrementally.
8. If a feature requires touching `public/index.html`, only add links, CTAs, or small improvements. Do not replace the structure.
9. All PRs must target `main`.
10. All PRs must pass `npm run build` and `npm run validate`.

## Project Shape

- This is a static Cloudflare Workers Static Assets project.
- Public files live in `public/`.
- `wrangler.toml` must keep `[assets].directory` pointed at `./public`.
- The home page is a conversion asset, not a disposable scaffold.

## PR Checklist

- [ ] The PR targets `main`.
- [ ] `public/index.html` still contains the premium home experience.
- [ ] `public/_redirects` does not exist.
- [ ] `npm run build` passes.
- [ ] `npm run validate` passes.
- [ ] Any change to `wrangler.toml` is explained in the PR body.
- [ ] New features are additive and scoped.
