import { srcset_of } from './image_source.js';
const pending = new Map();
export function preload_image(src, width) {
    if (!src || typeof Image === 'undefined') return Promise.resolve();
    const key = `${src}:${width ?? 'full'}`;
    if (pending.has(key)) return pending.get(key);
    const promise = new Promise((resolve) => {
        const image = new Image();
        image.fetchPriority = 'low';
        image.onload = () => resolve();
        image.onerror = () => {
            pending.delete(key);
            resolve();
        };
        if (width) {
            image.sizes = `${Math.ceil(width)}px`;
            image.srcset = srcset_of(src);
        }
        image.src = src;
    });
    pending.set(key, promise);
    return promise;
}
