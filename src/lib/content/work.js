import { image_data } from '../media/image_data.js';
export const work_entries = {
    routes_and_journeys: {
        title: 'illustrated logo',
        client: 'Routes & Journeys',
        alt: 'rj letters on a stone slate with ivy, in orange and green',
        images: [
            '/routes_and_journeys/rj.webp',
            '/routes_and_journeys/rj_slate.webp',
            '/routes_and_journeys/rj_branches.webp',
            '/routes_and_journeys/rj_outline.webp',
        ],
    },
    sq: {
        title: 'illustrated emblem',
        client: 'SQ',
        alt: 'sq letters cut into a purple and pink gem heart',
    },
    dino_cafe: {
        title: 'cafe animated logo',
        client: 'Dino Cafe',
        alt: 'dino cafe in chunky green cyrillic letters on cream paper',
    },
    sneakers_bros: {
        title: 'store logo and banner',
        client: "Sneakers Bro's",
        alt: "sneakers bro's logo in blocky black and white letters",
    },
    daloras: {
        title: 'model agency logo',
        client: 'Daloras',
        alt: 'daloras logo in gold on two dark business cards',
    },
    paladins_concept: {
        title: 'game ui/ux redesign concept',
        client: 'Paladins',
        alt: 'redesigned paladins champions list with kinessa in the middle',
        images: [
            '/paladins_concept/paladins_menu.webp',
            '/paladins_concept/paladins_menu_queue.webp',
            '/paladins_concept/paladins_character_list.webp',
            '/paladins_concept/paladins_icons.webp',
            '/paladins_concept/paladins_menu_2.webp',
            '/paladins_concept/paladins_currency.webp',
            '/paladins_concept/paladins.webp',
            '/paladins_concept/paladins_hud.webp',
            '/paladins_concept/paladins_hud_grayscale.webp',
            '/paladins_concept/paladins_hud_ingame.webp',
            '/paladins_concept/paladins_selected_character.webp',
            '/paladins_concept/paladins_lobby.webp',
        ],
    },
    palia_concept: {
        title: 'hud elements redesign concept',
        client: 'Palia',
        alt: 'palia hotbar with an axe, gems and stones',
        images: [
            '/palia_concept/palia.webp',
            '/palia_concept/palia_quest_log.webp',
            '/palia_concept/palia_bars.webp',
            '/palia_concept/palia_hud.webp',
        ],
    },
    pixel_icons_pack: {
        title: '5×5 and 3×3 icon pack',
        client: 'Wintertale',
        alt: 'tiny pixel icons, arrows, gems, hearts and a skull',
        images: ['/pixel_icons_pack/iconsvol2.png', '/pixel_icons_pack/iconsvol1.png'],
    },
    wintertale_banner: {
        title: 'illustrated banner',
        client: 'Wintertale',
        alt: 'blue winter banner, a lantern lit shelf next to a snowy window and gifts',
        images: [
            '/wintertale_banner/wintertale.webp',
            '/wintertale_banner/wintertale_half_1.webp',
            '/wintertale_banner/wintertale_half_2.webp',
        ],
    },
    blue_animation: {
        title: 'illustrated animated character',
        client: 'personal',
        alt: 'a little round headed guy on a hill, looking down',
    },
    thats_what_journey_means: {
        title: "that's what journey means poster",
        client: 'personal',
        alt: "that's what journey means in holographic letters on a starry night",
    },
    morroworld: {
        title: 'fantasy website design',
        client: 'MorroWorld',
        alt: 'morroworld landing page, a gold title on dark green',
        images: [
            '/morroworld/morroworld.webp',
            '/morroworld/morroworld_block_2.webp',
            '/morroworld/morroworld_gallery.webp',
            '/morroworld/morroworld_login.webp',
        ],
    },
};
export const picture_name = (src) =>
    src
        .split('/')
        .pop()
        .replace(/\.[^.]+$/, '');
export const selected_work = [
    {
        slug: 'paladins_concept',
        src: '/paladins_concept/paladins_character_list.webp',
        left: true,
        reading_minutes: 8,
    },
    { slug: 'routes_and_journeys', src: '/routes_and_journeys/rj.webp', reading_minutes: 2 },
    { slug: 'palia_concept', src: '/palia_concept/palia.webp', reading_minutes: 1 },
    { slug: 'morroworld', src: '/morroworld/morroworld.webp', reading_minutes: 2 },
    { slug: 'pixel_icons_pack', src: '/pixel_icons_pack/iconsvol2.png', reading_minutes: 1 },
    { slug: 'wintertale_banner', src: '/wintertale_banner/wintertale.webp', left: true, reading_minutes: 1 },
];
const picture = (item) => {
    const [width, height] = image_data[item.full_src ?? item.src] ?? [];
    return { ...item, width, height };
};
const journey = picture({ slug: 'thats_what_journey_means', src: '/thats_what_journey_means/pride.png' });
const sq = picture({ slug: 'sq', src: '/sq/sq.webp' });
const daloras = picture({ slug: 'daloras', src: '/daloras/daloras.webp' });
const sneakers_poster = picture({
    slug: 'sneakers_bros',
    src: '/sneakers_bros/sneakers_2.webp',
    alt: 'brand names and two photos of people in sneakers',
});
const sneakers_logo = picture({ slug: 'sneakers_bros', src: '/sneakers_bros/sneakers.png' });
const sneakers_banner = picture({
    slug: 'sneakers_bros',
    src: '/sneakers_bros/sneakers_full.webp',
    alt: "wide sneakers bro's banner with the logo and sneaker photos",
});
const dino_cafe = picture({
    slug: 'dino_cafe',
    src: '/dino_cafe/dino_cafe.webp',
    full_src: '/dino_cafe/dino_cafe_animated.webp',
});
const blue = picture({
    slug: 'blue_animation',
    src: '/blue_animation/blue.webp',
    full_src: '/blue_animation/blue_animated.webp',
});
export const gallery_pictures = [
    journey,
    sq,
    daloras,
    sneakers_poster,
    sneakers_logo,
    sneakers_banner,
    dino_cafe,
    blue,
];
export const gallery_layouts = {
    wide: [
        [journey, sq, daloras, sneakers_poster, sneakers_logo],
        [sneakers_banner, dino_cafe, blue],
    ],
    compact: [
        [journey, sq, daloras],
        [sneakers_banner, dino_cafe],
        [sneakers_poster, sneakers_logo, blue],
    ],
};
