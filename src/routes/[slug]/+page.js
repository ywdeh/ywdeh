import { work_entries } from '$lib/content/work.js';
import { load_case } from '$lib/routing/load_case.js';
export function entries() {
    return Object.keys(work_entries).map((slug) => ({ slug }));
}
export function load({ params }) {
    return load_case(params.slug);
}
