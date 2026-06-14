# Admin auth setup

OficiosPro production does not enable demo admin login. Real admin access uses Worker secrets and an HTTP-only signed session cookie.

## Required Cloudflare secrets

- `ADMIN_LOGIN_EMAIL`: email allowed to sign in as admin.
- `ADMIN_LOGIN_SECRET`: admin login secret/password for pilot operations.
- `ADMIN_TOKEN`: internal token accepted by admin APIs.
- `ADMIN_API_TOKEN`: optional alias for admin API scripts. Keep the same value as `ADMIN_TOKEN` during pilot operations.
- `ADMIN_SESSION_SECRET`: optional dedicated secret for signing admin cookies. If absent, the Worker uses `ADMIN_TOKEN` or `ADMIN_API_TOKEN`.

Do not expose these values through `NEXT_PUBLIC_*` variables.

## Configure secrets

```powershell
npx.cmd wrangler secret put ADMIN_LOGIN_EMAIL
npx.cmd wrangler secret put ADMIN_LOGIN_SECRET
npx.cmd wrangler secret put ADMIN_TOKEN
npx.cmd wrangler secret put ADMIN_API_TOKEN
```

Deploy after changing secrets:

```powershell
npm.cmd run build
npx.cmd wrangler deploy --assets ./out
```

## How it works

- `/api/auth/admin-login` validates `ADMIN_LOGIN_EMAIL` and `ADMIN_LOGIN_SECRET`.
- On success, the Worker returns an HTTP-only `oficiospro_admin_session` cookie signed with HMAC SHA-256.
- Admin APIs accept either a valid signed cookie or `Authorization: Bearer <ADMIN_TOKEN>`.
- The browser UI stores only a lightweight admin session marker in localStorage. It does not store the admin token.
- Manual token entry remains available as a fallback and is kept only in `sessionStorage`.

## Production guard

- `admin@oficiospro.cl / Admin1234!` is not accepted in production.
- If `ADMIN_LOGIN_EMAIL` or `ADMIN_LOGIN_SECRET` is missing, login returns `admin_login_not_configured` and the UI shows an operational setup message.
- Demo login can be used only outside production when demo auth is enabled.

## Rotation

1. Create a new strong value for `ADMIN_LOGIN_SECRET`.
2. Update the Cloudflare secret.
3. If rotating API access too, update both `ADMIN_TOKEN` and `ADMIN_API_TOKEN` with the same new value.
4. Redeploy.
5. Close old browser sessions by rotating `ADMIN_SESSION_SECRET` or the token used as fallback signing secret.
