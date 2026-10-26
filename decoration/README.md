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
`NEXT_PUBLIC_` prefix, runtime server or database is needed. It is included after
the header in the shared layout for both Mongolian and English pages.

Halloween places webs and bats in the upper corners, a detailed goggled pumpkin
in the lower left, and a robot ghost in the lower right. It does not add a banner
or take up layout space. Smaller, lighter artwork is used on mobile. Light/dark
colors are scoped to the decoration. No event selected means no decoration.

CSS automatically moves the spider up and down with a matching thread length,
gently floats and sways the ghost, and blinks the pumpkin's eyes. A small native
checkbox beside the ghost pauses/resumes all loops, including with the keyboard.
Its label is localized. `prefers-reduced-motion: reduce` disables all animations
and hides this unneeded control. There is no client component, timer, request or
dependency; everything renders into the static export and works without JavaScript.

## Add another event

1. Add a server component, such as `decoration/new-year.tsx`.
2. Import it in `decoration/index.tsx` and add `"new-year": NewYear` to the registry.
3. Scope its CSS with `.event-decoration[data-event-decoration="new-year"]` in
   `decoration.css`. Keep its assets inside this folder or use inline SVG.
4. Build with `EVENT_DECORATION=new-year`.

Hide purely decorative SVG from assistive technology, while keeping animation
controls accessible and visibly focused. Only the pause control intercepts pointer
input. Keep artwork near the edges, respect reduced motion, support light/dark
themes and mobile sizes, and hide decorations in print.
