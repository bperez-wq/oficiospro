# OficiosPro Brand Assets

## Production assets

The approved worker identity from `Logo OP.zip` lives in `public/brand/`:

- `favicon-op.svg`: browser favicon and shortcut icon.
- `logo-worker-primary.svg`: primary worker mark for light backgrounds.
- `logo-worker-white.svg`: worker mark for dark, teal, or image backgrounds.
- `logo-worker-mono.svg`: single-color mark for restrained UI contexts.
- `logo-worker-tile.svg`: app tile / PWA icon surface.

Only SVG assets from `design_handoff_logo/assets/` should be committed. The ZIP, reference HTML, reference JSX, and handoff prototypes must stay out of production.

## Component usage

Use `BrandLogo` instead of hardcoding `OP` or rebuilding the mark by hand.

```tsx
import { BrandLogo } from "@/components/BrandLogo";

<BrandLogo variant="primary" size="md" />
<BrandLogo variant="white" size="lg" />
<BrandLogo variant="tile" size="sm" showWordmark={false} />
```

Available props:

- `variant`: `primary`, `white`, `mono`, or `tile`.
- `size`: `sm`, `md`, or `lg`.
- `showWordmark`: hides the OficiosPro wordmark when set to `false`.
- `className`: optional wrapper classes for layout only.

## Wordmark rules

- `Oficios` uses the ink color on light backgrounds and white on dark backgrounds.
- `Pro` uses teal on light backgrounds and amber on dark backgrounds.
- Use strong weights: `Oficios` at 800 and `Pro` at 900.
- Keep the logo readable at mobile header size before introducing smaller variants.

## Metadata and manifest

The app metadata and PWA manifest must point to:

- `/brand/favicon-op.svg`
- `/brand/logo-worker-tile.svg`

`public/favicon.svg` is kept as a legacy fallback and should mirror the approved favicon.

## Validation

Run these before opening or merging brand-related PRs:

```bash
npm run validate
npm run build
```

The validator checks that the brand SVGs exist, `BrandLogo` exists, favicon/manifest references are current, and old hardcoded visual `OP` marks do not return in shared UI.

## Pending production improvement

SVG app icons are acceptable for this static export. If a future app-store or PWA audit requires PNG fallbacks, generate 192x192 and 512x512 PNGs from `logo-worker-tile.svg` and add them to the manifest without removing the SVG assets.
