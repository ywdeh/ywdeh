import { picture_name, work_entries } from '$lib/content/work.js';
const sources = import.meta.glob('$lib/content/cases/*.svelte', {
    query: '?raw',
    import: 'default',
    eager: true,
});
export function entries() {
    return Object.keys(work_entries).flatMap((slug) => {
        const source = Object.entries(sources).find(([path]) => path.endsWith(`/${slug}.svelte`))?.[1] ?? '';
        const pictures = new RegExp(`["'](/${slug}/[^"']+\\.(?:webp|png|jpe?g|gif))["']`, 'g');
        const names = new Set([...source.matchAll(pictures)].map(([, src]) => picture_name(src)));
        return [...names].map((picture) => ({ slug, picture }));
    });
}
