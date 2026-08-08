export const scenario = {

    "routes_and_journeys": {
        title: "illustrated logo",
        client: "Routes & Journeys",
        alt: "RJ initials carved into a stone tablet with ivy vines, shown in orange and green color variants",
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
        component: () => import("$lib/components/scenario/dino-cafe.svelte"),
    },

    "sneakers_bros": {
        title: "store logo and banner",
        client: "Sneakers Bro's",
        alt: "Bold angular Sneakers Bro's logo in black and white streetwear style, with dashed technical line accents",
        component: () => import("$lib/components/scenario/sneakers-bros.svelte"),
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
        component: () => import("$lib/components/scenario/paladins-concept.svelte"),
    },

    "palia_concept": {
        title: "hud elements redesign concept",
        client: "Palia",
        alt: "Before and after comparison of an inventory hotbar, simplified into a cleaner slot-based layout",
        component: () => import("$lib/components/scenario/palia-concept.svelte"),
    },

    "pixel_icons_pack": {
        title: "5×5 and 3×3 icon pack",
        client: "Wintertale",
        alt: "Grid of small pixel-art game icons in bright colors",
        component: () => import("$lib/components/scenario/pixel-icons-pack.svelte"),
    },

    "wintertale_banner": {
        title: "illustrated banner",
        client: "Wintertale",
        alt: "Illustrated banner split into a cozy blue-toned workshop scene and a snowy window view with gift boxes",
        component: () => import("$lib/components/scenario/wintertale-banner.svelte"),
    },

    "blue_animation": {
        title: "illustrated animated character",
        client: "personal",
        alt: "Simple round-headed illustrated character standing on a hill, looking down thoughtfully",
        component: () => import("$lib/components/scenario/blue-animated.svelte"),
    },

    "thats_what_journey_means": {
        title: "that's what journey means poster",
        client: "personal",
        alt: "Metallic holographic lettering reading that's what journey means against a dark background",
        component: () => import("$lib/components/scenario/thats-what-journey-means.svelte"),
    },

    "morroworld": {
        title: "fantasy website design",
        client: "MorroWorld",
        alt: "",
        component: () => import("$lib/components/scenario/morroworld.svelte"),
    },

};