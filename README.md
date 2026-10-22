# InnoLab — Innovation Laboratory

## Supabase membership

`/login`, `/register`, and `/members` (and their `/en` equivalents) integrate with
Supabase Auth and PostgreSQL. Registration collects first/last name, username,
email, and password. Login uses username/password through a rate-limited Supabase
Edge Function; social login and demo bypasses have been removed. Profiles are
private under Row Level Security. Passwords are handled by Supabase Auth.

Follow [the Supabase setup guide](docs/supabase-setup.md) to apply the migration,
deploy the function, configure email delivery and redirect URLs, and enable the
forms. Registration is controlled by `NEXT_PUBLIC_MEMBERSHIP_ENABLED=true`, enabled
locally for the first organization-email test after database/function setup. Public project values are compiled into the static build.
Only use the publishable key in the frontend; keep elevated credentials private.

The login page also links to `/forgot-password`; recovery emails return to
`/reset-password` (both have `/en` equivalents). A verified recovery session is
required to set a new password. Registration, recovery requests, and password
updates have prominent focused success panels with clear next steps.

`npm run check:membership` tests the migration, access controls, username lookup,
login handler, and recovery session/expiry handling without changing hosted data.
The user has confirmed real registration, email confirmation, and login.
A real password reset should be tested privately with the organization email.
Shared localized copy lives in `lib/member-copy.ts`.

Branded bilingual email templates are prepared in `supabase/templates`.
Supabase Free currently requires custom SMTP to publish custom email copy;
until then, the hosted project continues sending its default templates.

The site is available in Mongolian at `/` and English at `/en`. The header's
language switch opens the equivalent page. Both versions are statically exported
with the correct document language, translated metadata, and alternate-language
links. Shared page templates live in `app/_pages`; route groups provide the
language-specific document layout. The original Mongolian URLs are preserved.

English interface copy and reviewed translations of published titles, article
summaries, and course outcomes live in `lib/locales/en.json`. Contentful currently
stores Mongolian content in its sole `en-US` locale. Full CMS text without an
English translation is available in a clearly labeled Mongolian disclosure with
`lang="mn"`; publishing an English CMS locale remains a content follow-up. No
external translation service is used, and the CMS is not modified.

The appearance button cycles **System → Dark → Light → System**. The choice is
saved locally under `innolab-theme`; System follows operating-system changes.
An early document script applies the theme before paint. Theme colors and surface
tokens are defined in `app/_components/landing.css`.

Mongolian technology club website built with Next.js App Router, React,
TypeScript and Tailwind. Contentful supplies courses, products, projects and
posts. GitHub Pages hosts the static export; existing URLs are retained.

## Local development

Use Node.js 22 or later. Install dependencies with `npm ci` and configure
`.env.local` using `.env.local.example`. The Contentful space and delivery token
must be valid. Do not commit credentials.

- `npm run dev` starts development.
- `npm run build` generates `out/` (requires Contentful and Google Fonts access).
- `npm start` previews the static export at `http://localhost:3000` with
  extensionless routes and the custom 404 page. The server binds to loopback only.
- `npm run check` runs TypeScript and checks the exported HTML for broken
  internal links/anchors, page headings, language and image alt attributes.
- `npm run check:emails` checks the branded Mongolian/English confirmation and
  password-reset emails and eleven additional authentication/security templates.
  These templates are saved in Supabase after the user's SMTP setup.
  `npm run build:emails` regenerates additional templates from shared copy.
  See [membership setup](docs/supabase-setup.md).

Next.js also supports `npm run build -- --webpack` as an alternative compiler.
The existing GitHub Pages deployment workflow and Contentful webhook remain intact.

## Design and content

The shared layout provides navigation, mobile disclosure menus, a skip link and
footer. Design tokens and responsive layouts live in
`app/_components/landing.css`. CMS rendering, cards and image transformations are
shared components. No animation is required to reveal content.

Courses and participation are the main journeys. `/projects`, `/services`,
`/about`, `/activities` and `/contact` now have dedicated pages. `/courses`,
`/products`, `/posts` and their detail URLs are unchanged. Messenger, telephone,
QPay links and rich-text/video content are preserved. QPay appears only when a
CMS entry supplies a payment URL; no checkout or enrollment backend is invented.

Short learning-outcome summaries in `lib/course-info.ts` are editorial summaries
of the published syllabi reviewed on 2026-10-09. Update these when curricula
change. Prices, original prices, full titles, imagery and full syllabi stay in
Contentful. Shop categories are inferred from existing product titles; product
entries with prices are shown first, and unpriced entries remain available.

## Content follow-up

- Python's course title says 20+ hours, while its syllabus says 12 weeks/36 hours.
  The summary asks visitors to confirm the duration and preserves the full syllabus.
- Course start dates, per-course format and prerequisites need confirmation.
- There is no structured event schedule or registration integration. The activities
  page offers participation inquiries and labels published posts as news.
- Product stock and collection/delivery terms are not in the CMS. Visitors are
  asked to confirm them before payment. Two project-like entries also exist as
  products without prices; review their intended shop placement in Contentful.
- Project descriptions are displayed as published. Add problem, approach,
  technologies, status and results to entries that lack that information.
- Two posts link to unpublished author entries. Nullable unresolved CMS links
  are handled gracefully; authentication and other query errors still fail builds.
- Analytics requires `NEXT_PUBLIC_GA_MEASUREMENT_ID`, which is absent locally.

No CMS content or production deployment is changed by the redesign.
