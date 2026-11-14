# hedwy.art

SvelteKit portfolio, prerendered and served from Cloudflare.

```sh
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

## Structure

| Path                      | Holds                                                                    |
| ------------------------- | ------------------------------------------------------------------------ |
| `src/lib/styles`          | Design system: `tokens.css`, `utilities.css`, `base.css`, `fonts.css`    |
| `src/lib/content`         | Site details, projects, work metadata, gallery, one data file per case   |
| `src/lib/components`      | `ui` primitives, `layout`, `cards`, `media`, `overlays`, `portfolio`     |
| `src/lib/actions`         | DOM behaviours: press feedback, scrolling, swipe, pan and zoom, reveal   |
| `src/lib/controllers`     | Stateful motion: hover badge, star drag, spring pan, image flight        |
| `src/lib/motion`          | Timing read from tokens, intro animation, image flight                   |
| `src/lib/media`           | Generated image manifest, loading queue, preloading, case image context  |
| `src/lib/routing`         | URL ↔ view mapping and lazy case loading                                 |
| `src/lib/geometry`        | Project frame, star shapes and layouts, icon strokes                     |
| `src/routes/[...path]`    | The single route: home, `/<case>`, `/<case>/<picture>`, `/gallery/<picture>` |

## Design system

All colours, fonts, spacing, radii, easing, durations, opacity tones and layers live in `src/lib/styles/tokens.css`. Spacing, colour, font and radius tokens become Tailwind utilities (`px-page-x`, `gap-section`, `bg-surface`, `text-ink`, `rounded-card`). Typography and tone utilities (`text-intro`, `text-title`, `text-heading`, `text-body`, `text-ui`, `ink-soft`, `ink-muted`, `ink-faint`, `link-soft`, `link-quiet`, `tinted`) are in `utilities.css`. Scripts read durations and easing from the same tokens.

## Content

- Projects: `src/lib/content/projects.js`.
- Cases: add metadata to `cases` in `src/lib/content/work.js` and a matching `src/lib/content/cases/<slug>.js` with blocks: `{ image, alt }`, `{ slider: [{ src, alt }] }`, `{ heading, text: [] }`. Text supports `**bold**` and `[label](url)`.
- Selected work and gallery order: `selected_work`, `gallery` and `gallery_rows` in `work.js`.
- Images live in `static/<slug>/`, named without the project prefix (`static/paladins_concept/lobby.webp`). The file name is the picture's URL. Gallery pictures share one `/gallery/` namespace, so their names must be unique and self-explanatory (`sq_heart`, `sneakers_logo`). Run `npm run images` after adding, renaming or changing them: it stops if content points to a missing file or two gallery pictures share a name, regenerates `src/lib/media/manifest.js` and the responsive variants, and removes stale variants.
