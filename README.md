# PromptMarketer / Vitarights – PROD test deployment

The existing `index.html` is the standalone bilingual branding template. During
`npm run build`, `build.mjs` replaces its **local-only** submit handler with
`integration.js` and produces `public/index.html`. A Node server serves that
compiled HTML and `/api/submit` on the same origin. CSS/JS/logo remain inline;
the API key is **never** injected into HTML or JavaScript. GitHub Pages alone
cannot run this backend and continues to show the standalone template.

## Railway variables

Required:
- `BASE44_FUNCTION_URL=https://api.promptmarketer.io/functions/createVitarightsPartnerApplication`
- `VITARIGHTS_PARTNER_API_KEY`: the **same** value as the Base44 secret; use at least
  32 printable non-space ASCII characters. Only the server sends it as `X-API-Key`.

Optional / already present:
- `BASE44_PROJECT_ID`: value to send as `project_id`. **For this PROD test we default
  to the app ID supplied in the project conversation: `689b57ef278375135d0068b9`.**
  This is an explicit test assumption, not a verified foreign-key relationship.
  Override it here if `project_id` means a different internal project. It is never
  taken from a browser field and never replaced by the company ID.
- `VITARIGHTS_COMPANY_ID`: retained as operator configuration. The supplied API
  contract has no `company_id` input, so the proxy does **not** invent one or send
  this value as `project_id`. CompanyConfiguration lookup belongs to Base44.
- `PUBLIC_ORIGIN`: defaults to `https://vitarights-partner.promptmarketer.io`.
  Override only when serving the form on a different origin. The Railway public
  hostname, if provided by Railway, is also allowed.
- `PORT`: read from Railway; local default 3000.

In Base44 only the matching `VITARIGHTS_PARTNER_API_KEY` is required by the supplied
authentication contract. Do not create `BASE44_INGRESS_SECRET` for this version.
No Base44 code or schema is changed by this repository.

## Deployment

The Dockerfile runs `npm test` and `npm run build`, then starts `node server.mjs`
as the non-root `node` user. There are no npm runtime dependencies. `railway.json`
selects Dockerfile, the start command, one replica and `/api/health` as deployment
healthcheck for this existing service. Railway config-as-code is currently a
legacy mechanism; migrate to Railway IaC before its announced retirement.
Do not use a static Caddy/nginx-only start override for the new deployment.

`GET /api/health` returns version, `submission_ready`, **names** of missing/invalid
variables, and the project-ID source, never variable values. HTTP 200 means the
web server is up; `submission_ready: true` means local configuration passed checks,
**not** that Base44 accepted a credential or stored a record. This endpoint never
calls Base44 or writes a test record.

Open `/?sponsorId=471123`. The sponsor number is read-only, retained as a string
and bound to an expiring signed form token for submission. It is a **public
attribution**, not a login or proof of the link's author. A new URL can select a
different sponsor; final owner/company verification is Base44's responsibility.

## Submission contract

The request uses the operator's documented snake_case field names. `phone` is
required; `mobile`, `bank`, `signing_location`, `sponsor_name`, `vitarights_leader`
are optional. VAT is a Boolean. Tax fields are omitted when VAT is false. All
three confirmations must be Boolean `true`. The handwritten signature is exported
as an actual PNG data URI, dark ink on white independent of the page theme.
The server validates types, lengths, dates, IBAN checksum, confirmations, and
bounded PNG decoding before forwarding. `source` is `vitarights_partner_form`.
`user_id` is not accepted from the browser. Base44 resolves ownership.

Acknowledgements are intentionally conservative:
- `success:true, stored:true, application_id:"..."` -> confirmed saved (201).
- `stored:false, reason:"sponsor_not_found", admin_notified:true` -> manual review
  (202), explicitly **not saved in the application table**.
- `stored:false` with an unconfirmed notification -> not saved.
- 400/422 -> mapped field errors; 401/403 -> operator credential/gateway error.
- Timeout, redirect, unknown 2xx body, invalid JSON response or 5xx -> uncertain
  outcome, **no automatic resend** and no invented success.

Confirm the actual deployed Base44 response shape during the first test. If it
is different, an unknown-result message is expected until this adapter is updated.
No live Base44 request is sent during builds/tests; tests mock the upstream.

## Safety limits for the supervised PROD test

- Same-origin POST, JSON-only, signed token bound to HttpOnly SameSite session.
- Request-body cap, per-session/global in-memory limits and no redirect following.
- No API keys, bank data, signatures or full bodies in server logs. Correlation ID,
  HTTP status and acknowledgement booleans only.
- Concurrent requests with the same idempotency key reuse the same in-process
  attempt; differing content is rejected. Results expire after 24 hours.
- **This is NOT durable cross-restart idempotency.** The process cache is not a
  database. After ambiguous outcomes the browser blocks resubmission, including
  same-tab reloads when sessionStorage works. Different tabs/devices and restarts
  are not exactly-once protected. Add durable Base44 idempotency before unattended
  public volume; verify status manually rather than retrying after a timeout.
- CAPTCHA/distributed abuse controls and a complete original-contract presentation
  are release tasks beyond this supervised connectivity test. The existing
  agreement summary remains explicitly marked as a summary.

The operator's Base44 endpoint may trigger admin email for an unmapped sponsor.
Use authorised synthetic data and inspect the response before repeating a test.
A saved application is not a Vitarights activation or countersigned contract.

## Local checks

```
npm test
npm run build
# Supply environment variables, then:
npm start
```

For local browser access set `PUBLIC_ORIGIN=http://localhost:3000` (or the exact
local origin). Production uses HTTPS and a Secure cookie.
