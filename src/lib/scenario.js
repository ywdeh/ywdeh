import { image_data } from './image_data.js';

export const scenario = {

    "patter": {
        title: "ambient text editor",
        client: "Patter",
        alt: "A glowing lantern in a dark forest, one of Patter’s writing backgrounds",
        images: [
            "/projects/patter_lantern.webp",
            "/projects/patter_editor_current.webp",
            "/projects/patter_editor.webp",
        ],
        component: () => import("$lib/components/scenario/patter.svelte"),
    },

    "routes_and_journeys": {
        title: "illustrated logo",
        client: "Routes & Journeys",
        alt: "RJ initials carved into a stone tablet with ivy vines, shown in orange and green color variants",
        images: [
            "/scenario/rj.webp",
            "/scenario/rj_slate.webp",
            "/scenario/rj_branches.webp",
            "/scenario/rj_outline.webp",
        ],
        component: () => import("$lib/components/scenario/rj.svelte"),
    },

    "sq": {
        title: "illustrated emblem",
        client: "SQ",
        alt: "SQ letters forming a glowing purple and pink gem-cut heart shape",
        component: () => import("$lib/components/scenario/sq.svelte"),
    },

    "dino_cafe": {
        title: "cafe animated logo",
        client: "Dino Cafe",
        alt: "Hand-lettered green Cyrillic wordmark on cream paper, styled like a hand-painted cafe sign",
        component: () => import("$lib/components/scenario/dino_cafe.svelte"),
    },

    "sneakers_bros": {
        title: "store logo and banner",
        client: "Sneakers Bro's",
        alt: "Bold angular Sneakers Bro's logo in black and white streetwear style, with dashed technical line accents",
        component: () => import("$lib/components/scenario/sneakers_bros.svelte"),
    },

    "daloras": {
        title: "model agency logo",
        client: "Daloras",
        alt: "Daloras model agency wordmark in a warm gold serif typeface, shown in lowercase and uppercase business card versions",
        component: () => import("$lib/components/scenario/daloras.svelte"),
    },

    "paladins_concept": {
        title: "game ui/ux redesign concept",
        client: "Paladins",
        alt: "Redesigned in-game menu UI",
        images: [
            "/scenario/paladins_menu.webp",
            "/scenario/paladins_menu_queue.webp",
            "/scenario/paladins_character_list.webp",
            "/scenario/paladins_icons.webp",
            "/scenario/paladins_menu_2.webp",
            "/scenario/paladins_currency.webp",
            "/scenario/paladins.webp",
            "/scenario/paladins_hud.webp",
            "/scenario/paladins_hud_grayscale.webp",
            "/scenario/paladins_hud_ingame.webp",
            "/scenario/paladins_selected_character.webp",
            "/scenario/paladins_lobby.webp",
        ],
        component: () => import("$lib/components/scenario/paladins_concept.svelte"),
    },

    "palia_concept": {
        title: "hud elements redesign concept",
        client: "Palia",
        alt: "Before and after comparison of an inventory hotbar, simplified into a cleaner slot-based layout",
        images: [
            "/scenario/palia.webp",
            "/scenario/palia_quest_log.webp",
            "/scenario/palia_bars.webp",
            "/scenario/palia_hud.webp",
        ],
        component: () => import("$lib/components/scenario/palia_concept.svelte"),
    },

    "pixel_icons_pack": {
        title: "5×5 and 3×3 icon pack",
        client: "Wintertale",
        alt: "Grid of small pixel-art game icons in bright colors",
        images: [
            "/scenario/iconsvol2.png",
            "/scenario/iconsvol1.png",
        ],
        component: () => import("$lib/components/scenario/pixel_icons_pack.svelte"),
    },

    "wintertale_banner": {
        title: "illustrated banner",
        client: "Wintertale",
        alt: "Illustrated banner split into a cozy blue-toned workshop scene and a snowy window view with gift boxes",
        images: [
            "/scenario/wintertale.webp",
            "/scenario/wintertale_half_1.webp",
            "/scenario/wintertale_half_2.webp",
        ],
        component: () => import("$lib/components/scenario/wintertale_banner.svelte"),
    },

    "blue_animation": {
        title: "illustrated animated character",
        client: "personal",
        alt: "Simple round-headed illustrated character standing on a hill, looking down thoughtfully",
        component: () => import("$lib/components/scenario/blue_animated.svelte"),
    },

    "thats_what_journey_means": {
        title: "that's what journey means poster",
        client: "personal",
        alt: "Metallic holographic lettering reading that's what journey means against a dark background",
        component: () => import("$lib/components/scenario/thats_what_journey_means.svelte"),
    },

    "morroworld": {
        title: "fantasy website design",
        client: "MorroWorld",
        alt: "",
        images: [
            "/scenario/morroworld.webp",
            "/scenario/morroworld_block_2.webp",
            "/scenario/morroworld_gallery.webp",
            "/scenario/morroworld_login.webp",
        ],
        component: () => import("$lib/components/scenario/morroworld.svelte"),
    },

};
export const case_studies = [
    { slug: 'paladins_concept', src: '/scenario/paladins_character_list.webp', left: true },
    { slug: 'routes_and_journeys', src: '/scenario/rj.webp' },
    { slug: 'palia_concept', src: '/scenario/palia.webp' },
    { slug: 'morroworld', src: '/scenario/morroworld.webp' },
    { slug: 'pixel_icons_pack', src: '/scenario/iconsvol2.png' },
    { slug: 'wintertale_banner', src: '/scenario/wintertale.webp', left: true },
];

// hand-made rows; each spans the full width, its pictures sharing it by aspect ratio so they all
// come out the same height on larger screens. Each picture's size comes from the file itself
// (image_data.js), so it can't drift from it.
export const gallery_rows = [
    [
        { slug: 'thats_what_journey_means', src: '/scenario/pride.png' },
        { slug: 'sq', src: '/scenario/sq.webp' },
        { slug: 'daloras', src: '/scenario/daloras.webp' },
        { slug: 'sneakers_bros', src: '/scenario/sneakers_2.webp', alt: 'Alternate Sneakers Bro’s brand artwork' },
    ],
    [
        { slug: 'sneakers_bros', src: '/scenario/sneakers_full.webp', alt: 'Wide Sneakers Bro’s brand banner' },
        { slug: 'sneakers_bros', src: '/scenario/sneakers.png' },
        { slug: 'dino_cafe', src: '/scenario/dino_cafe.webp', full_src: '/scenario/dino_cafe_animated.webp' },
        { slug: 'blue_animation', src: '/scenario/blue.webp', full_src: '/scenario/blue_animated.webp' },
    ],
].map((row) => row.map((item) => {
    const [width, height] = image_data[item.full_src ?? item.src] ?? [];
    return { ...item, width, height };
}));
