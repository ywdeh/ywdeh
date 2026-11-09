import { scenario } from '$lib/scenario.js';
import { error } from '@sveltejs/kit';

export function entries() {
    return Object.keys(scenario).map((slug) => ({ slug }));
}

export async function load({ params }) {
    if (!Object.hasOwn(scenario, params.slug)) throw error(404, 'Not found');
    const module = await scenario[params.slug].component();
    return { slug: params.slug, Component: module.default };
}
