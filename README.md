# InnoLab — Innovation Laboratory

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
