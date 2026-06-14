# CRM end-to-end test

Use `scripts/test-crm-end-to-end.mjs` to verify the production CRM flow against D1.

## What it tests

The script runs against `https://www.oficiospro.cl` by default and checks:

- Create customer lead with `POST /api/leads`.
- Create company lead with `POST /api/companies/request`.
- Create specialist application with `POST /api/specialists/apply`.
- Create virtual quote with `POST /api/quotes/virtual/create`.
- Query `GET /api/admin/leads`.
- Run CRM sync endpoints for leads, specialists and virtual quotes.
- Query CRM overview, opportunities, tasks, work queue and reports.

It uses safe test data:

- `Juan Perez`
- `juan.perez@example.com`
- `+56 9 1234 5678`

## Required secret

Set `ADMIN_TOKEN` locally to the same value configured in Cloudflare. The script sends it as both:

- `Authorization: Bearer <ADMIN_TOKEN>`
- `x-admin-token: <ADMIN_TOKEN>`

PowerShell:

```powershell
cd C:\Users\Benjamin\oficiospro\oficiospro
$env:ADMIN_TOKEN="pega_aqui_el_valor_real"
& "C:\Program Files\nodejs\node.exe" scripts\test-crm-end-to-end.mjs
```

## Optional admin login check

To also test real admin login, set:

```powershell
$env:ADMIN_LOGIN_EMAIL="admin-real@oficiospro.cl"
$env:ADMIN_LOGIN_SECRET="pega_aqui_el_valor_real"
```

The script never hardcodes or prints secrets.

## Custom base URL

```powershell
$env:TEST_BASE_URL="https://oficiospro-web.bperez.workers.dev"
& "C:\Program Files\nodejs\node.exe" scripts\test-crm-end-to-end.mjs
```

## Expected result

All rows should report `ok=true`. Lead and virtual quote creation should also show `stored=true` and an `id`.

If admin requests return `401 unauthorized`, confirm that `ADMIN_TOKEN` and `ADMIN_API_TOKEN` in Cloudflare match the local `ADMIN_TOKEN`, then redeploy.
