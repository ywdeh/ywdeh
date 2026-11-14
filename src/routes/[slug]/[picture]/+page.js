import { load_case } from '$lib/routing/load_case.js';
import { picture_source } from '$lib/routing/picture_source.js';
import { error } from '@sveltejs/kit';
export async function load({ params }) {
    if (!picture_source(params.slug, params.picture)) error(404, 'Not found');
    return { ...(await load_case(params.slug)), picture: params.picture };
}
