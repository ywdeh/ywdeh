import { site } from './site.js';

export const resume = {
    page_title: 'hedwy: resume',
    headings: {
        skills: { title: 'skills', stars: 'personal-projects' },
        experience: { title: 'experience', stars: 'case-studies' },
        projects: { title: 'personal projects', stars: 'gallery' },
        work: { title: 'selected work on site', stars: 'footer_end' },
    },
    name: 'Danya (Hedwy) Smirnov',
    role: 'graphic & product designer',
    location: 'Novi Sad, Serbia',
    lead: 'Freelancing my way through life since 2019. The digital space is all dry, so I bring atmosphere and a little cinematic touch to it',
    links: [
        { label: new URL(site.url).host, href: site.url },
        { label: site.email, href: `mailto:${site.email}` },
        { label: '+381 65 345 3806', href: 'tel:+381653453806' },
        ...site.socials.filter(({ label }) => ['linkedin', 'github'].includes(label)),
    ],
    experience: [
        {
            place: 'Hedwy',
            role: 'freelance designer & web developer',
            dates: ['aug 2019', 'present'],
            points: [
                '10+ websites taken from mock-up to live on my own, for a tour operator, a barbershop, a flower shop, a video surveillance service and more',
                'logos, full branding and rebranding',
                'game UI/UX, illustrations and illustrated assets for games',
                'motion design, print and advertising materials',
            ],
        },
        {
            place: 'Wintertale',
            role: 'project lead',
            dates: ['jun 2021', 'present'],
            points: [
                'a game community and dedicated server with up to 40 concurrent players and almost 1000 people on discord',
                "wrote over 100 custom features on the server's scripting engine to make the game calmer and more immersive",
                'branding, socials and advertising design, discord bot development',
                'team leading, recruiting, moderation and technical administration',
            ],
        },
        {
            place: 'Firestorm Servers',
            role: 'translator, volunteer',
            dates: ['mar 2022', 'present'],
            points: [
                'english to russian translation of game updates and announcements for a large World of Warcraft private server community',
            ],
        },
        {
            place: 'E-Store',
            role: 'print designer',
            dates: ['aug 2025', 'jan 2026'],
            points: [
                'redesigned the print materials: promo pieces, price tags, business cards and a large storefront banner',
            ],
        },
        {
            place: 'Dino Cafe',
            role: 'lead graphic designer',
            dates: ['mar 2024', 'sep 2025'],
            points: [
                'the only designer on a cafe launching from scratch',
                'full visual identity: logo, animated logo, branding and ads',
                'print package: posters, banners, price tags, digital and physical menus',
            ],
        },
        {
            place: 'Lensa',
            role: 'support specialist',
            dates: ['jan 2024', 'jul 2024'],
            points: [
                'live chat support for photographers on the platform, from product and technical questions to onboarding and site building',
            ],
        },
    ],
    work: ['paladins_concept', 'morroworld', 'ollie', 'palia_concept', 'dino_cafe', 'routes_and_journeys'],
    projects: [
        {
            name: 'Patter',
            href: 'https://patter.hedwy.art',
            label: 'patter.hedwy.art',
            text: 'an immersive text editor with ambient customization, designed and built with sveltekit and tailwind',
        },
    ],
    skills: [
        {
            group: 'design',
            items: 'UI/UX, game UI and HUD, branding and identity, illustration, motion, print',
        },
        {
            group: 'build',
            items: 'html, css, js, sveltekit, tailwind, backend basics, discord bots, game server scripting',
        },
        {
            group: 'AI tools',
            items: 'Claude, ChatGPT, Codex',
        },
        {
            group: 'languages',
            items: 'english (B2, EF SET C2 81/100), ukrainian (native), russian (native)',
        },
    ],
};
