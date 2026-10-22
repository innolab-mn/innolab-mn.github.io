# InnoLab membership setup

The site is still a Next.js static export. Supabase hosts authentication,
PostgreSQL, and the username-login Edge Function. Contentful remains the CMS.
There is no need to move hosting or add a Python server for this stage.

## 1. Project

Use the existing `innolab_db` project in your `Innolab` organization. The supplied
project reference is `ajniokginnpuhttfjhcz` and its region is Singapore
(`ap-southeast-1`). Its URL is `https://ajniokginnpuhttfjhcz.supabase.co`.

The Project URL and publishable key are configured in ignored `.env.local`.
Never put a database password, secret key, or service-role key into a
`NEXT_PUBLIC_` variable or the frontend. No elevated credentials are needed by
the frontend. Supabase supplies server credentials inside deployed functions.

Current setup status (2026-10-22): the migration was applied successfully through
the dashboard SQL Editor, the `username-login` function was deployed with its
intended configuration, sixteen exact member/recovery redirect URLs and the production Site URL
were saved, and the minimum password length was set to eight. Anonymous profile
reads were verified to fail, and the deployed login rejects an unknown username.
Local registration is enabled for your organization email test. Do not rerun the
initial migration against this project. The user confirmed real registration,
email confirmation, and username/password login using the organization email.
The user subsequently configured custom SMTP in the dashboard. Template editing
is unlocked, and the branded Mongolian/English templates have been saved.
SMTP credentials were entered privately and are not stored in this repository.
All thirteen hosted template bodies were reopened and compared with their local
HTML; subjects were verified with equivalent Go-template spacing. The seven
security notification switches remain off. Fresh inbox delivery remains to be
verified with the configured sender.

## 2. Apply the database migration

In the project dashboard, open **SQL Editor → New query**. Paste the entire
contents of `supabase/migrations/202610220001_members.sql` and run it once.
The migration runs in a transaction. It creates:

- `profiles`: first name, last name, canonical unique username, and Auth user ID.
- A signup trigger that creates the profile atomically with the Auth user.
- Row Level Security and grants: a signed-in user can read only their profile;
  anonymous visitors cannot read profiles; client profile writes are disallowed.
- An email lookup callable only by the server-side service role, and private
  database-backed login rate limits.

Passwords stay in Supabase Auth. They are never stored in the profiles table.
User metadata is treated as untrusted input and never assigns roles or access.
Usernames are immutable in this release; casing is ignored and Mongolian letters
are supported. No public member directory or admin role is created.

The migration targets a new membership project. It intentionally fails rather
than overwriting an existing `profiles` table or replacing another signup trigger.
If the project already has Auth users, create/backfill their profiles separately
after reviewing them; the trigger applies to future signups only.

## 3. Deploy username login

Supabase's password API uses email internally. The Edge Function privately
resolves the username, verifies the password through Supabase Auth, and returns
only the authenticated session. The browser never receives the email lookup.

Using the official Supabase CLI (run these commands from the repository):

```powershell
npx supabase login
npx supabase link --project-ref ajniokginnpuhttfjhcz
npx supabase functions deploy username-login --project-ref ajniokginnpuhttfjhcz
```

`supabase/config.toml` sets `verify_jwt=false` for this one function because login
starts without a user session. This does not bypass password verification: the
function performs it through Auth and applies global, username, and IP request
limits. Do not change JWT verification for unrelated functions.

Alternatively, use **Edge Functions → Deploy a new function → Via Editor**.
Name it `username-login`, replace the sample code with
`supabase/functions/username-login/index.ts`, and deploy. In that function's
settings, turn off **Verify JWT** for its unauthenticated login entry point.
The CLI route is preferred because it reads the checked-in configuration.

Default permitted browser origins are `https://innolab.mn`,
`https://www.innolab.mn`, `http://localhost:3000`, and
`http://127.0.0.1:3000`. If needed, set an `ALLOWED_ORIGINS` function secret to a
comma-separated list of exact origins. CORS is not an authorization boundary;
the password and server-side request limits are always required.

## 4. Authentication settings

In **Authentication**, keep the Email provider and new signups enabled, and keep
**Confirm email** enabled. Set the minimum password length to **8** to match the
form's minimum. Social providers are not needed and are not shown on the site.

In **URL Configuration**, use `https://innolab.mn` as the production Site URL.
Add these exact redirect URLs:

```text
https://innolab.mn/members
https://innolab.mn/en/members
https://www.innolab.mn/members
https://www.innolab.mn/en/members
http://localhost:3000/members
http://localhost:3000/en/members
http://127.0.0.1:3000/members
http://127.0.0.1:3000/en/members
https://innolab.mn/reset-password
https://innolab.mn/en/reset-password
https://www.innolab.mn/reset-password
https://www.innolab.mn/en/reset-password
http://localhost:3000/reset-password
http://localhost:3000/en/reset-password
http://127.0.0.1:3000/reset-password
http://127.0.0.1:3000/en/reset-password
```

Templates in `supabase/templates/confirmation.html` and `recovery.html` preserve
`{{ .ConfirmationURL }}` and approved redirects. Both have Mongolian and English
versions chosen from the requested return page. English `/en/members` and
`/en/reset-password` requests receive English; Mongolian requests receive
Mongolian. This uses the current request's `RedirectTo`, so password recovery
follows the language selected now, even if the account was registered in another
language. The subject and body use the same condition for all four approved
origins. Add any new origin to the redirect allowlist and both template conditions.

The templates use the existing public PNG club symbol, an InnoLab wordmark,
forest-green action buttons, and a responsive table layout. Text and actions
remain usable when an email client blocks images. No personal names or other
user-supplied HTML are inserted. The logo is already hosted at
`https://innolab.mn/android-chrome-192x192.png`.

Subject lines are also saved as `supabase/templates/confirmation.subject.txt`
and `recovery.subject.txt`. After SMTP is ready, open **Authentication → Emails
→ Templates** and paste each entire subject file into its Subject field and the
matching HTML file into its source editor. Keep the Go-template expressions;
they select the language at send time. Save both Confirm signup and Reset
password templates and test each language with your own account. The local
`supabase/config.toml` mirrors these subjects and paths; changing it alone does
not update the hosted project.

Before SMTP setup, this Free project's dashboard locked template editing and
sent default English text. The user has now configured custom SMTP, unlocking
editing without a plan upgrade. The branded templates were saved through the
dashboard. No sender credentials or notification switches were changed by the
template update. Existing inbox messages remain unchanged; test newly requested
emails to verify actual SMTP delivery and rendering.
The browser SDK consumes the email session on the static page and removes its
tokens from the URL. The implicit browser flow works across devices.

## 5. Email delivery (required for public registration)

Configure **Authentication → Email → SMTP Settings** with an SMTP sender you
control. Set its host, port, user, password, verified sender address, and InnoLab
sender name in Supabase only. Complete the sender's domain verification/DNS steps.
Do not commit SMTP credentials or paste them into chat.

Supabase's default sender only sends to organization team addresses and is
limited to two messages per hour. You can test with your own organization email
first, but public registration needs custom SMTP. Keep email confirmation enabled.

Official reference: https://supabase.com/docs/guides/auth/auth-smtp

### Activate the approved InnoLab emails

The user approved the branded design and configured SMTP on 2026-10-22. The
following provider instructions are retained for future sender changes.

If you do not have a sender, Resend is one option with a Free plan and an
official Supabase SMTP guide: https://resend.com/docs/send-with-supabase-smtp.
Create your own account and verify your sending domain using the exact DNS
records provided by the service. Keep existing website and mail records intact.
Then enter these settings directly in Supabase:

| Field | Resend setting |
| --- | --- |
| Sender name | InnoLab |
| Sender email | An address on your verified sending domain |
| Host | smtp.resend.com |
| Port | 465 |
| Username | resend |
| Password | Your Resend API key, entered privately |

Do not enable an incomplete configuration. After saving working SMTP settings,
save both the reviewed subject and HTML for Confirm signup and Reset password
as described above. SMTP configuration alone does not upload the templates.
Only newly requested emails will use the saved design; old inbox messages
cannot change. Finally, test registration confirmation and password recovery
from both language versions and check the delivered emails, not only previews.

### Full template set and language priority

All thirteen templates have local HTML and subject files in `supabase/templates`:
confirmation, recovery, invite, magic link, email change, reauthentication,
password/email/phone changes, sign-in methods linked/removed, and verification
methods added/removed. Security notification switches remain off as previously
configured; editing a template does not enable its notification or add those
features to the website.

Mongolian is always the fallback. Confirmation, recovery, invite, magic link,
and email-change requests use the exact approved return URL to select English.
Reauthentication and security notifications have no request return URL; they
use the account's `user_metadata.locale`, with English only for `en`. Missing,
unrecognized, and Mongolian metadata use Mongolian. Registration already stores
this locale. English signup and reset emails follow the current page language.

Subjects use compact Go expressions to stay within the hosted field's
255-character limit. Multi-argument `eq` matches the same four URLs as the body.
Reauthentication preserves `{{ .Token }}` instead of inventing a verification
URL. Security notices link to the existing contact/recovery pages and do not
include sensitive profile details. Contact pages currently use the site's
published inquiry options; they are not an automated account-recovery service.

Edit additional copy in `supabase/templates/messages.mjs`, run `npm run
build:emails`, then `npm run check:emails`. The generator reuses the approved
confirmation header/footer and keeps the two approved core bodies intact.
Changes must still be saved to the hosted dashboard. The local config mirrors
all thirteen templates and leaves security notifications disabled.

## 6. Enable and build locally

After the migration, function, and redirect URLs are ready, set the following
for a local organization-email test. A public launch additionally needs custom
SMTP. This is already enabled locally for your first test:

```dotenv
NEXT_PUBLIC_MEMBERSHIP_ENABLED=true
```

Restart the dev server, or rebuild the static export and restart its preview.
`NEXT_PUBLIC_` values are compiled into the build; updating an environment file
does not update an already-exported site.

```powershell
npm run check:membership
npm run check:emails
npm run build -- --webpack
npm run check
npm start
```

## 7. Verify your first real account

1. Register at `/en/register` or `/register` using your own email, name, unique
   username, and password. The form sends credentials only to your Supabase project.
2. Open the confirmation email. Check that `/members` loads your profile.
3. Sign out. Sign in again using your username and password; casing is ignored.
4. A wrong password must fail; an unknown username must produce the same generic
   failure. Another person must not be able to read or change your profile.
5. Confirm that an unauthenticated `/members` visit shows the sign-in gate.
6. Check **Authentication → Users** and **Table Editor → profiles**. There should
   be one matching profile per account, no password column, and no anonymous read
   policy. No fake seed accounts are deployed.

The local `check:membership` test executes the SQL migration against PostgreSQL
in PGlite, tests the trigger/permissions/RLS, and tests the actual Edge handler
with simulated Auth responses. It does not replace this hosted end-to-end check.

## 8. GitHub Pages deployment

In GitHub repository **Settings → Secrets and variables → Actions → Variables**,
add these repository variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_MEMBERSHIP_ENABLED=true
```

Use the same URL and publishable key as `.env.local`. The existing deployment
workflow reads these public variables at build time. Keep Contentful secrets
unchanged. Deploy the database and function before enabling registration in the
website. Deployment of a static page does not deploy a Supabase migration/function.

## Scope

This release covers registration, email confirmation, username/password login,
session refresh, sign-out, the member profile, and password recovery. Social
login, profile editing, payments, admin membership approval, enrollments, and
private course material are not implemented. The dashboard links to public club
offerings; it does not claim paid membership or course access. Future private
content needs its own database/storage policies, not only a client-side gate.

Browser sessions are managed by the official Supabase SDK, including token
refresh. The application never persists the raw password. Legacy demo storage
is not read and cannot authenticate anyone.

## Password recovery and UI validation

The login page links to `/forgot-password` (`/en/forgot-password` in English).
The form requests a reset using the registration email and gives the same
acknowledgement regardless of whether an account exists. Supabase returns the
email recipient to `/reset-password` or `/en/reset-password`.

Only a session created by a verified `PASSWORD_RECOVERY` event opens the new
password form. A short-lived per-tab marker is tied to the Auth session ID;
server-side `getUser` and `updateUser` still verify authorization. Reloading the
same recovery session works, while a regular or different sign-in cannot open
the form. Expired/invalid links have a clear route to request a new link.
After an update the app requests global sign-out and clears the marker.

`scripts/preview-membership-fixture.mjs` serves an isolated local UI fixture on
`127.0.0.1:3002` using the actual static build with a mock Auth API. It sends no
real emails, touches no hosted data, and never logs or persists passwords. It is
only a development test helper, not a backend or a route in the deployed site.
Its `/__fixture/email/confirmation/mn`, `/__fixture/email/confirmation/en`,
`/__fixture/email/recovery/mn`, and `/__fixture/email/recovery/en` routes preview
the same templates with a nonfunctional example verification link. The preview
renderer deliberately supports only the Go expressions used by these templates;
Supabase performs the actual rendering for delivered email. `check:emails`
checks subject/body language for 104 supported request combinations and verifies
Mongolian fallback for every template, subject limits,
secure action URL preservation, and the branded responsive markup. Browser
previews of all thirteen templates in both languages were checked at 1440, 390,
and 320 pixels: 78 cases, with the logo loaded, the expected language, and no
horizontal overflow. The code layout was checked with an eight-digit sample.
Actual inbox rendering and delivery still need a fresh test with the new sender.
