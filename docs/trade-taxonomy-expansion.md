# Trade taxonomy expansion

## Decision

OficiosPro now uses a central trade taxonomy in `src/data/tradeTaxonomy.ts`.

The taxonomy separates three surfaces:

- Specialist registration: broad catalog, accepts active, pilot and forming trades.
- Client marketplace: conservative catalog, shows only active or pilot coverage.
- SEO/editorial: only pages with useful content, local intent and enough operational truth.

This keeps acquisition open for new specialists without promising client-side coverage before operations can support it.

## Key fields

Each trade category has:

- `id`, `slug`, `label`, `shortLabel`
- `segment`
- `clientVisibility`: `active`, `pilot`, `forming`, `hidden`
- `registrationVisibility`: `active`, `hidden`
- `coverageStatus`: `available`, `limited`, `forming`, `waitlist`
- `requiresCertification`
- `riskLevel`
- `allowedFor`
- `iconKey`, `imageKey`
- `relatedServices`, `relatedProblems`
- `seoEnabled`
- `notes`

Each specialty has equivalent visibility and coverage fields plus examples, keywords and default pricing mode.

## Visibility rules

- Client-facing selectors use `getClientVisibleTradeOptions()` and `getClientVisibleSpecialtyOptions()`.
- Specialist registration uses `getRegistrationTradeOptions()` and `getRegistrationSpecialtyOptions()`.
- Header mega menu and Home accordion use `getClientMenuGroups()`.
- `/especialistas` applies query filters against taxonomy search terms, but shows an honest empty state when coverage is forming.

## Operational coverage states

- `available`: can be shown normally.
- `limited`: can be shown as pilot or limited coverage.
- `forming`: can be accepted in registration but should not be promised to clients.
- `waitlist`: capture interest, do not expose as normal supply.

## Admin CRM

Specialist applications store:

- `primaryTradeId`
- `primaryTrade`
- `tradeSegment`
- `tradeCoverageStatus`
- `tradeCoverageLabel`
- `selectedSpecialties`
- `customTradeRequest`

The CRM acquisition view derives those fields for old and new rows, adds filters for segment and coverage, and shows an operational taxonomy table.

## Current audit

Ready:

- Central taxonomy file exists.
- Client and registration catalog helpers are split.
- Header and Home category navigation use client-safe groups.
- Registration accepts broader trades and captures missing trades without blocking.
- CRM can segment applications by trade layer and coverage status.

Needs future backend work:

- Persistent admin editing for taxonomy coverage status.
- Admin workflow to promote a forming trade to pilot/active after supply validation.
- Per-commune coverage table instead of global category coverage.
- SEO page generation tied to `seoEnabled` plus content quality review.
