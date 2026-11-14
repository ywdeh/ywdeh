import { error } from '@sveltejs/kit';
import { load_all_cases, load_case, loaded_case } from '$lib/routing/case_loader.js';
import { all_paths, has_case, read_path } from '$lib/routing/views.js';

export async function entries() {
    await load_all_cases();
    return all_paths(loaded_case).map((path) => ({ path }));
}

export async function load({ params }) {
    const [slug] = params.path.split('/');
    if (has_case(slug)) await load_case(slug);
    const view = read_path(params.path, loaded_case);
    if (!view) error(404, 'Not found');
    return { view };
}
