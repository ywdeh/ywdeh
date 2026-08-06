import { scenario } from '$lib/scenario.js';
import { error } from '@sveltejs/kit';

export function entries() {
    return Object.keys(scenario).map((slug) => ({ slug }));
}

export async function load({ params }) {
    const entry = scenario[params.slug];
    if (!entry) throw error(404, 'Not found');
    const module = await entry.component();
    return { title: entry.title, Component: module.default };
}