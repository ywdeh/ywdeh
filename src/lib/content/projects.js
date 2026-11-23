export const projects = [
    {
        name: 'Patter',
        year: '2026 - present',
        logo: { src: '/projects/patter_logo.svg', ratio: 3.22, height: 32 },
        links: [{ label: 'patter.hedwy.art', href: 'https://patter.hedwy.art' }],
        description: [
            'patter is an immersive text editor, free from advanced features and heavy ui, but with a lot of ambient customization options: background pictures, cinematic grain, blur and tint, ambient sounds, fonts, and other visual details',
            'built with sveltekit, tailwind, and html/css/js',
        ],
    },
    {
        name: 'Wintertale',
        year: '2021 - present',
        logo: { src: '/projects/wintertale_logo.svg', ratio: 2.1, height: 48 },
        links: [{ label: 'github', href: 'https://github.com/ywdeh/wintertale-downpour' }],
        description: [
            'wintertale is a game community and dedicated server with up to 40 concurrent players and almost 1000 people on discord',
            "I wanted a comfortable space for people to feel at home; over time I learned a scripting language and wrote over 100 custom features to improve the base game's immersion, look and feel",
        ],
    },
    {
        name: 'Playlist',
        year: '2026',
        logo: { src: '/projects/playlist_logo.svg', ratio: 1.457, height: 48 },
        links: [{ label: 'music.hedwy.art', href: 'https://music.hedwy.art' }],
        description: [
            "playlist is a live page of what I'm listening to, pulled straight from my spotify: the song playing right now, my top songs and artists, and recent plays",
            'built as a test of api interactions',
        ],
    },
];
