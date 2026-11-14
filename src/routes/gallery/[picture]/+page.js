import { error } from '@sveltejs/kit';
import { gallery_pictures, picture_name } from '$lib/content/work.js';
export function entries() {
    return gallery_pictures.map(({ src }) => ({ picture: picture_name(src) }));
}
export function load({ params }) {
    if (!gallery_pictures.some(({ src }) => picture_name(src) === params.picture)) error(404, 'Not found');
    return { picture: params.picture };
}
