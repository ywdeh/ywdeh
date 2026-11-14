import { cases, gallery } from '../content/work.js';
import { picture_name } from '../media/images.js';

export const HOME = Object.freeze({ slug: null, picture: null, gallery: null });

export const case_pictures = (blocks) =>
    blocks.flatMap((block) => block.slider ?? (block.image ? [{ src: block.image, alt: block.alt }] : []));

export const has_case = (slug) => Object.hasOwn(cases, slug);

export const gallery_item = (name) => gallery.find(({ src }) => picture_name(src) === name);

export function view_path({ slug, picture, gallery: shown }) {
    if (shown) return `/gallery/${shown}`;
    if (!slug) return '/';
    return picture ? `/${slug}/${picture}` : `/${slug}`;
}

export function same_view(a, b) {
    return a.slug === b.slug && a.picture === b.picture && a.gallery === b.gallery;
}

export function read_path(path, blocks_of) {
    const [first, second, ...rest] = path ? path.split('/') : [];
    if (rest.length) return null;
    if (!first) return HOME;
    if (first === 'gallery') return second && gallery_item(second) ? { ...HOME, gallery: second } : null;
    if (!has_case(first)) return null;
    if (!second) return { ...HOME, slug: first };
    const known = case_pictures(blocks_of(first)).some(({ src }) => picture_name(src) === second);
    return known ? { ...HOME, slug: first, picture: second } : null;
}

export function all_paths(blocks_of) {
    const paths = new Set(['']);
    for (const { src } of gallery) paths.add(`gallery/${picture_name(src)}`);
    for (const slug of Object.keys(cases)) {
        paths.add(slug);
        for (const { src } of case_pictures(blocks_of(slug))) paths.add(`${slug}/${picture_name(src)}`);
    }
    return [...paths];
}
