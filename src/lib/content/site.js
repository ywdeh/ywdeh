export const site = {
    url: 'https://hedwy.art',
    title: 'hedwy',
    share_title: 'hedwy. graphic and visual design',
    share_image: '/share.png',
    description:
        "Every project has a feeling it's reaching for. I help that feeling become visible - in web, game UIs, branding, and anywhere else",
    name: 'Danya Hedwy',
    role: 'graphic & visual design',
    signature: 'hedwy',
    avatar: '/avatar.png',
    email: 'itshedwy@icloud.com',
    resume: '/resume',
    resume_label: 'check résumé',
    call_to_action: 'have a role in mind?',
    intro: [
        { text: 'Every project has a feeling ' },
        { text: "it's reaching for.", faint: true },
        { text: ' I make that feeling visible ' },
        { text: 'with motion, patterns and textures, lights and shadows -', faint: true },
        { text: ' in web, game UIs, branding' },
        { text: ', and anywhere ', faint: true },
        { text: 'else ', faint: true, image: '/smile.gif' },
    ],
    not_found: [
        [{ text: 'Whoops! ' }, { text: "That's a four o' four", faint: true }],
        [
            { text: 'Quickly,', faint: true },
            { text: ' ' },
            { text: 'return', href: '/' },
            { text: ' ' },
            { text: 'before it all collapses', faint: true },
        ],
    ],
    sections: [
        { id: 'personal-projects', label: 'personal projects', columns: 2 },
        { id: 'case-studies', label: 'selected work', columns: 3 },
        { id: 'gallery', label: 'gallery', columns: 1 },
    ],
    contact: { id: 'contacts', label: 'contact me' },
    socials: [
        { label: 'telegram', href: 'https://t.me/ywdeh' },
        { label: 'instagram', href: 'https://instagram.com/just.hedwy' },
        { label: 'linkedin', href: 'https://linkedin.com/in/hedwy' },
        { label: 'dribbble', href: 'https://dribbble.com/hedwy' },
        { label: 'github', href: 'https://github.com/ywdeh' },
    ],
};

export const section = (id) => site.sections.find((entry) => entry.id === id);
