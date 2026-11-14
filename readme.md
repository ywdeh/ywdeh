# hedwy.art

SvelteKit portfolio with personal projects, selected work, a gallery, case panels, and zoomable artwork. The design tokens and interactions are shared; content stays separate from presentation.

## Development

```sh
npm ci
npm run dev
```

```sh
npm run check
npm test
npm run test:browser
npm run build
npm run preview
```

Browser tests use the installed Microsoft Edge in headless mode, with desktop and mobile layouts. They do not take screenshots or videos. Set `TEST_URL` to test a running production preview. `npm run format` formats source; `npm run format:check` checks formatting.

## Source layout

| Folder                | Responsibility                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------- |
| `src/routes`          | Public URLs, route validation, prerendered entries                                          |
| `src/lib/app`         | Homepage composition and URL-driven overlay state                                           |
| `src/lib/content`     | Project descriptions, work metadata, gallery order, case content                            |
| `src/lib/components`  | Layout, cards, media, overlays, decorations, icons, links                                   |
| `src/lib/controllers` | Stateful badge, star drag, image pan, and image flight behavior                             |
| `src/lib/actions`     | Reusable DOM gestures, press feedback, section scrolling, color reveal                      |
| `src/lib/geometry`    | SVG frame and star calculations                                                             |
| `src/lib/media`       | Generated dimensions/colors, responsive sources, queued loading, preloading, image registry |
| `src/lib/motion`      | Shared timing helpers, intro animation, transform-only image flights                        |
| `src/lib/styles`      | Tokens, typography, local fonts, utilities, base rules                                      |
| `static`              | Original artwork, responsive variants, SVG logos, licensed fonts                            |

## Editing content

- Add or edit personal projects in `src/lib/content/projects.js`. The card accepts a text name or SVG logo, year, description paragraphs, tint, and primary links.
- Add work metadata and selected-work ordering in `src/lib/content/work.js`, then create the matching `src/lib/content/cases/<slug>.svelte` component. Existing case components demonstrate `Artwork`, `ImageSlider`, and `ExternalLink`.
- Keep case assets in `static/<slug>/`. After adding or changing images, run `npm run images` to regenerate dimensions, average colors, and responsive variants. Originals are preserved. The content tests verify file references, dimensions, and gallery membership.
- Change shared spacing, colors, radii, fonts, and press timing in `src/lib/styles/tokens.css`. Typography is in `typography.css`; scripted overlay and flight timing is in `src/lib/motion/settings.js`.

## Interaction boundaries

Cases and images use URL state, including direct links and browser back/forward navigation. Images register with their case, so a direct image URL can select its slider before opening. There is one gallery DOM layout and one active hover badge. The loading queue limits simultaneous nearby-image loads and disconnects observers when no longer needed.

External links retain trusted browser clicks so new tabs work on mobile Safari. Reduced-motion preferences bypass decorative motion. Intro failure reveals the content instead of leaving the page hidden. Fonts and animation code are served locally; analytics remains unchanged.

Backups are kept in the ignored `.backups` folder and are never included in the published site.
