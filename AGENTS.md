# OficiosPro Agent Rules

These rules protect the premium OficiosPro experience and the Cloudflare Workers Static Assets deployment. Follow them for every PR.

## Non-Negotiable Rules

1. Do not simplify the premium home source in `src/app/page.tsx` or the generated home in `out/index.html`.
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
3. Do not delete existing data for comunas, servicios, especialistas, categorías, reservas, créditos, Club Hogar, empresas, or trabajos.
4. Do not create `public/_redirects`.
5. Do not change `wrangler.toml` unless necessary and explicitly justified in the PR description.
6. Do not replace the current premium static-export architecture with a basic HTML mockup or another framework.
7. Add new functionality incrementally.
8. If a feature requires touching the home, only add links, CTAs, copy refinements, or small improvements. Do not replace the structure.
9. All PRs must target `main`.
10. All PRs must pass `npm run build` and `npm run validate`.

## Project Shape

- This is a premium Next static-export project deployed with Cloudflare Workers Static Assets.
- `npm run build` must generate `out/`.
- `wrangler.toml` must keep `[assets].directory` pointed at `./out` while this architecture is active.
- `public/` is for static assets only. Do not add `public/index.html`.
- The home page is a conversion asset, not a disposable scaffold.
- Marketplace source data lives in `src/data/` and storage/business logic lives in `src/lib/`.

## PR Checklist

- [ ] The PR targets `main`.
- [ ] The premium home sections are still present.
- [ ] `public/_redirects` does not exist.
- [ ] `public/index.html` does not exist while `wrangler.toml` deploys `./out`.
- [ ] `npm run build` passes.
- [ ] `npm run validate` passes.
- [ ] Any change to `wrangler.toml` is explained in the PR body.
- [ ] New features are additive and scoped.
