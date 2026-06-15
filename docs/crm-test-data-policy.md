# CRM test data policy

CRM tests must never look like production operations.

## How test data is marked

Operational scripts must send all test leads with:

- `source: "e2e_test"`
- `sourcePage: "e2e_test"` when supported
- `utmSource: "e2e_test"` when supported
- `isTest: true`
- `testRunId`
- an email under `example.com`

Current scripts following this policy:

- `scripts/test-crm-end-to-end.mjs`
- `scripts/test-lead-endpoints.mjs`

## Default cleanup

`scripts/test-crm-end-to-end.mjs` now cleans test records at the end of the run by calling:

```text
POST /api/admin/crm/cleanup-test-data
```

The endpoint requires admin auth and removes only records with test markers such as `e2e_test`, `isTest`, `testRunId`, or `example.com` email addresses.

To run cleanup only:

```powershell
$env:ADMIN_TOKEN="pega_aqui_el_valor_real"
& "C:\Program Files\nodejs\node.exe" scripts\test-crm-end-to-end.mjs --cleanup-only
```

To temporarily keep test data for inspection:

```powershell
$env:CRM_E2E_KEEP_TEST_DATA="1"
& "C:\Program Files\nodejs\node.exe" scripts\test-crm-end-to-end.mjs
```

or:

```powershell
& "C:\Program Files\nodejs\node.exe" scripts\test-crm-end-to-end.mjs --keep-test-data
```

## Admin UI

`/admin/crm/contacts` hides test contacts by default.

Use **Mostrar datos de prueba** to inspect test contacts. Test rows show a **Test** badge.

Use **Limpiar datos de prueba** in the CRM dashboard to remove marked test records from CRM and source intake tables.

## Dedupe safeguards

CRM sync normalizes:

- email to lowercase
- Chilean phone numbers to a stable `+56...` format
- RUT without punctuation

If an email, phone or RUT already exists in `crm_contacts`, sync updates that contact instead of creating a new one. This prevents multiple `Juan Perez` contacts with the same `juan.perez@example.com` or phone.

## What cleanup may delete

The cleanup endpoint targets only records that match test markers in:

- `crm_contacts`
- `crm_companies`
- `crm_opportunities`
- `crm_tasks`
- `crm_notes`
- `crm_activity_log`
- `lead_submissions`
- `customer_leads`
- `company_leads`
- `specialist_applications`
- `service_requests`
- `virtual_quote_requests`
- virtual quote child tables
- `conversion_events`

It must not be used to remove production records. Do not add broad name-based cleanup conditions.
