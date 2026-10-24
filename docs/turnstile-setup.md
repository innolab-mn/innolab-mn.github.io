# InnoLab Turnstile activation

Turnstile is integrated into registration, username/password login, and forgot
password. Ordinary pages and the authenticated password-update form do not load
the widget. Existing recovery links still authorize password updates through
Supabase Auth. No secret key belongs in this static website.

Status (2026-10-22): the CAPTCHA-aware username-login function has been deployed
to `ajniokginnpuhttfjhcz`. A hosted malformed-token probe returned
`400 invalid_request` before account lookup. The supplied production Turnstile site key
has been saved in ignored `.env.local` and the GitHub Actions repository variable
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`. The saved local membership flag is currently `false`; isolated
UI tests enable membership and use the public test key only for that build.
No live CAPTCHA enforcement setting has been changed by this implementation.

## Activate without blocking members

### Frontend on/off switch

Set `NEXT_PUBLIC_CAPTCHA_ENABLED=true` in `.env.local` to use Turnstile, or
`NEXT_PUBLIC_CAPTCHA_ENABLED=false` to hide it and remove the frontend token
requirement from login, registration and password reset. Keep the site key saved.
If this flag is unset, a configured site key retains the existing enabled behavior.
Restart the development server or rebuild/redeploy the static site after changes.

This flag does **not** change Supabase Auth settings. When turning CAPTCHA off,
also disable its requirement in Supabase Authentication → Attack Protection;
otherwise the server will reject unverified Auth requests. The website cannot
override that protection. When turning it on, deploy the widget before requiring
CAPTCHA in Supabase.

For GitHub Pages, configure the same name as a GitHub Actions **Variable** and
ensure `.github/workflows/nextjs.yml` passes it into the build. The workflow edit
is prepared locally; the current GitHub credential cannot publish workflow edits.

### Activation steps

1. Create a **Managed** widget in Cloudflare Turnstile for `innolab.mn` and
   `www.innolab.mn`. Pre-clearance is not needed. Domain hosting does not need to
   move to Cloudflare. Keep the production widget's hostname restrictions.
2. Add its **public site key** as `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in ignored
   `.env.local`, and as a GitHub Actions repository variable with the same name.
   Do not put the secret key in either location. Rebuild to embed the site key.
3. Deploy the updated `supabase/functions/username-login/index.ts`. The function
   forwards `captchaToken` to Supabase Auth using the public Auth client, retains
   all current rate limits, and never logs passwords or verification tokens.
4. Build and deploy the website with the real site key. Verify the widget loads
   on both language versions of login, registration, and password reset.
5. In Supabase **Authentication → Attack Protection**, enable CAPTCHA, choose
   **Cloudflare Turnstile**, and enter the matching **secret key privately**.
   Save only after the function and website are ready. Until then, keep the
   dashboard toggle off so existing clients can still authenticate.
6. Test all three forms with your own account. Missing, invalid, expired, or
   already-used tokens must fail once Supabase protection is enabled. Do not
   share passwords, CAPTCHA tokens, or account recovery links in chat.

The Supabase setting enforces verification on its Auth server, including direct
API requests. A disabled submit button alone is not bot protection. Passing the
token to the username proxy is essential: it authenticates through email/password
internally and otherwise would fail once CAPTCHA is required.

## UX and language

The app provides Mongolian/English labels, loading, verified, expired, and error
messages. Turnstile itself currently does not list Mongolian among supported
widget languages; Mongolian pages use the provider's automatic language mode,
while English pages explicitly request English. Its appearance follows the
site's selected light/dark theme. Changing theme requests a fresh verification.
Narrow forms use Turnstile's compact layout; wider forms use the flexible layout.

Tokens live only in component state. Each submitted request clears its token
and recreates the widget. Script failure and expiry have a retry action; there
is no fallback that silently bypasses verification. The public site key being
absent hides the widget, preserving current behavior until activation is ready.

## Local checks

`npm run check:membership` exercises the real Edge handler against a PostgreSQL
fixture and verifies token forwarding, malformed-token rejection, CAPTCHA Auth
failures without sessions, and recovery-token forwarding. `npm run
check:turnstile` tests shared script loading, network failure, timeout, and retry.

Cloudflare's public test key `1x00000000000000000000AA` is useful for isolated
local UI testing. It automatically produces dummy tokens. Never deploy that
key for production or configure its test secret on the live Supabase project.
Production secrets reject dummy tokens. Use local mock Auth responses for test
accounts; do not send synthetic credentials to the real project.
The local fixture also accepts `--captcha-mock` after its port argument. This
replaces the Turnstile script only in served development responses, labels the
widget as a local fixture, and supports simulated expiry/error controls. Its
`/__fixture/captcha-status` reports only request kinds and verification booleans;
it never stores passwords, verification tokens, or real member records.

References:
- https://supabase.com/docs/guides/auth/auth-captcha
- https://developers.cloudflare.com/turnstile/troubleshooting/testing/
- https://developers.cloudflare.com/turnstile/reference/supported-languages/
