import { labels } from '$lib/content/labels.js';
import { site } from '$lib/content/site.js';
import { strokes } from '$lib/geometry/strokes.js';
import { HOME, view_path } from '$lib/routing/views.js';
import { page_link } from './state.svelte.js';

const on_link = (target) => !!target.closest('a[href]');

const copy_email = { label: labels.menu.copy_email, copy: site.email, track: 'email' };

export const menus = {
    page: () => ({
        hold: false,
        skip: on_link,
        items: () => [[{ label: labels.menu.copy_site_link, copy: page_link('/') }, copy_email]],
    }),

    case: (slug, open) => () => [
        [
            { label: labels.menu.open_case, icon: strokes.arrow, run: open },
            { label: labels.menu.copy_link, copy: page_link(view_path({ ...HOME, slug })) },
        ],
    ],

    picture: (name, { open, open_case }) => () => [
        [
            { label: labels.menu.open_image, icon: strokes.zoom, run: open },
            { label: labels.menu.copy_image_link, copy: page_link(view_path({ ...HOME, gallery: name })) },
        ],
        [{ label: labels.menu.open_case, icon: strokes.arrow, run: open_case }],
    ],

    image: ({ open, link }) => ({
        items: () => [
            [
                { label: labels.menu.open_image, icon: strokes.zoom, run: open },
                { label: labels.menu.copy_image_link, copy: link() },
            ],
        ],
    }),

    viewer: ({ close }) => ({
        items: () => [
            [
                { label: labels.menu.copy_image_link, copy: location.href },
                { label: labels.menu.close_image, icon: strokes.close, run: close },
            ],
        ],
    }),

    case_panel: ({ link, close }) => ({
        hold: false,
        skip: on_link,
        items: () => [
            [
                { label: labels.menu.copy_link, copy: link() },
                { label: labels.menu.close_case, icon: strokes.close, run: close },
            ],
        ],
    }),

    project: (links) => ({
        hold: false,
        items: () => [
            links().map((link) => ({ label: labels.menu.open(link.label), href: link.href })),
            [{ label: labels.menu.copy_link, copy: links()[0]?.href }].filter((entry) => entry.copy),
        ],
    }),

    link: ({ label, href }) => ({
        items: () => [
            [
                { label: labels.menu.open(label), href },
                { label: labels.menu.copy_link, copy: href },
            ],
        ],
    }),

    email: () => ({
        items: () => [[copy_email, { label: labels.menu.write_email, href: `mailto:${site.email}` }]],
    }),
};
