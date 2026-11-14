import { image_data } from '../media/image_data.js';

export function picture_source(slug, name) {
    if (!/^[a-z0-9_]+$/i.test(slug) || !/^[a-z0-9_-]+$/i.test(name)) return undefined;
    return Object.keys(image_data).find(
        (src) =>
            src.startsWith(`/${slug}/`) &&
            src
                .split('/')
                .pop()
                .replace(/\.[^.]+$/, '') === name,
    );
}
