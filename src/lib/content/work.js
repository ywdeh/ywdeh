export const cases = {
    routes_and_journeys: {
        title: 'illustrated logo',
        client: 'Routes & Journeys',
        alt: 'rj letters on a stone slate with ivy, in orange and green',
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
    },
    palia_concept: {
        title: 'hud elements redesign concept',
        client: 'Palia',
        alt: 'palia hotbar with an axe, gems and stones',
    },
    pixel_icons_pack: {
        title: '5×5 and 3×3 icon pack',
        client: 'Wintertale',
        alt: 'tiny pixel icons, arrows, gems, hearts and a skull',
    },
    wintertale_banner: {
        title: 'illustrated banner',
        client: 'Wintertale',
        alt: 'blue winter banner, a lantern lit shelf next to a snowy window and gifts',
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
    },
};

export const selected_work = [
    {
        slug: 'paladins_concept',
        cover: '/paladins_concept/champions.webp',
        minutes: 8,
        pan: true,
    },
    { slug: 'routes_and_journeys', cover: '/routes_and_journeys/emblem.webp', minutes: 2 },
    { slug: 'palia_concept', cover: '/palia_concept/hotbar.webp', minutes: 1 },
    { slug: 'morroworld', cover: '/morroworld/landing.webp', minutes: 2 },
    { slug: 'pixel_icons_pack', cover: '/pixel_icons_pack/icons_vol2.png', minutes: 1 },
    { slug: 'wintertale_banner', cover: '/wintertale_banner/banner.webp', minutes: 1, pan: true },
];

export const gallery = [
    { slug: 'thats_what_journey_means', src: '/thats_what_journey_means/pride.png' },
    { slug: 'sq', src: '/sq/sq_heart.webp' },
    { slug: 'daloras', src: '/daloras/daloras_cards.webp' },
    {
        slug: 'sneakers_bros',
        src: '/sneakers_bros/sneakers_photos.webp',
        alt: 'brand names and two photos of people in sneakers',
    },
    { slug: 'sneakers_bros', src: '/sneakers_bros/sneakers_logo.png' },
    {
        slug: 'sneakers_bros',
        src: '/sneakers_bros/sneakers_banner.webp',
        alt: "wide sneakers bro's banner with the logo and sneaker photos",
    },
    { slug: 'dino_cafe', src: '/dino_cafe/dino_logo.webp', full: '/dino_cafe/dino_logo_animated.webp' },
    { slug: 'blue_animation', src: '/blue_animation/blue.webp', full: '/blue_animation/blue_animated.webp' },
];

export const gallery_rows = {
    wide: [
        ['pride', 'sq_heart', 'daloras_cards', 'sneakers_photos', 'sneakers_logo'],
        ['sneakers_banner', 'dino_logo', 'blue'],
    ],
    compact: [
        ['pride', 'sq_heart', 'daloras_cards'],
        ['sneakers_banner', 'dino_logo'],
        ['sneakers_photos', 'sneakers_logo', 'blue'],
    ],
};
