# Submission connection and UX

## Confirmed production diagnosis, 2026-09-08 14:08 UTC

Read-only GitHub Actions run 34236376358 called the live form service.
GET /api/health returned HTTP 200 with submission_ready=false and
missing=[BASE44_FUNCTION_URL, VITARIGHTS_PARTNER_API_KEY], invalid=[].
GET /api/session returned HTTP 200 with ready=false and a token present.
No application was submitted and no credential value was read or logged.

This indicates missing runtime configuration in the serving Railway service,
not invalid applicant data or a rejected Base44 credential. It does not prove
where the operator may already have entered variables. Check the correct service
and production environment, shared-variable references and deployed changes.

Required on that service:
- BASE44_FUNCTION_URL: https://api.promptmarketer.io/functions/createVitarightsPartnerApplication
- VITARIGHTS_PARTNER_API_KEY: the existing matching Base44 secret, never copied into code.

The code does not supply fallback credentials or disable authentication.

## Updated user experience

Valid sponsor links silently populate and lock the partner number. No success,
setup, developer, or test-mode banners are shown in the production flow.
A malformed invitation still has an actionable error. Required-field labels,
contract information, review/edit, translations and theme switching are retained.

The submit button checks the session on each user-initiated attempt. It no longer
stays disabled after an initial connection failure. A preflight error means no
application was sent; inputs and signature remain available for another attempt.
After an actual POST, uncertain results are still locked against unsafe resending.
One concise error appears near the action, with a reference only when available.

The native four-digit date-entry fix remains in build.mjs. Node tests cover
unchanged credential enforcement and the compiled UI. Local Chromium checks covered
DE/EN, dark/light, widths 320/390/1280, config failure followed by successful retry,
network failure before POST, ambiguous POST, authentication error, manual review,
server field errors and malformed invitations, using simulated responses only.

GitHub Pages serves index.html as a standalone template; Railway serves the
compiled public/index.html. New production marker: pm-ux-version=clean-submit-v1.
