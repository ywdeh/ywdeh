import { manifest } from './manifest.js';

export const image_info = (src) => manifest[src];

export const image_color = (src) => manifest[src]?.color;

export const picture_name = (src) => src.slice(src.lastIndexOf('/') + 1).replace(/\.[^.]+$/, '');

export function srcset_of(src) {
    const info = manifest[src];
    if (!info) return '';
    return [...(info.variants ?? []), [src, info.width]]
        .map(([path, width]) => `${path} ${width}w`)
        .join(', ');
}

const preloads = new Map();

export function preload_image(src, width) {
    if (!src || typeof Image === 'undefined') return Promise.resolve();
    const key = `${src}:${width ?? 'full'}`;
    if (!preloads.has(key)) {
        preloads.set(
            key,
            new Promise((resolve) => {
                const image = new Image();
                image.fetchPriority = 'low';
                image.onload = () => resolve();
                image.onerror = () => {
                    preloads.delete(key);
                    resolve();
                };
                if (width) {
                    image.sizes = `${Math.ceil(width)}px`;
                    image.srcset = srcset_of(src);
                }
                image.src = src;
            }),
        );
    }
    return preloads.get(key);
}
