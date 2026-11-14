import { error } from '@sveltejs/kit';
import { case_page } from '$lib/routing/case_pages.js';
import { work_entries } from '$lib/content/work.js';
export async function load_case(slug) {
    if (!Object.hasOwn(work_entries, slug)) error(404, 'Not found');
    const module = await case_page(slug);
    return { slug, Component: module.default };
}
