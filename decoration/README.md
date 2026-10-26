# Static event decorations

Set `EVENT_DECORATION=halloween` before building. Leave it empty (or unset) for
the normal layout. Unknown names also render nothing. Values are trimmed and
case-insensitive. A new build and deployment are required to change the event.

Local `.env.local`:

```dotenv
EVENT_DECORATION=halloween
```

For GitHub Pages, set repository **Settings → Secrets and variables → Actions →
Variables → EVENT_DECORATION** to `halloween`. The workflow already passes this
variable to the build. Remove it or clear its value, then rebuild, to turn it off.

`index.tsx` is a server component rendered into static HTML by Next.js. No
`NEXT_PUBLIC_` prefix, runtime server, client JavaScript or database is needed.
It is included in the shared layout for both Mongolian and English pages.

## Add another event

1. Add a server component, such as `decoration/new-year.tsx`.
2. Import it in `decoration/index.tsx` and add `"new-year": NewYear` to the registry.
3. Scope its CSS with `.event-decoration[data-event-decoration="new-year"]` in
   `decoration.css`. Keep its assets inside this folder or use inline SVG.
4. Build with `EVENT_DECORATION=new-year`.

Decorations must be presentational: no links or focusable controls, no event
handlers, no timers, and no remote requests. The wrapper is hidden from assistive
technology and cannot intercept pointer input. Keep artwork small near the edges,
support light/dark themes and mobile sizes, and hide decorations in print.
