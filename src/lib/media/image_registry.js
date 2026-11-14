import { SvelteMap } from 'svelte/reactivity';
export const CASE_IMAGES = Symbol('case_images');
export function create_image_registry() {
    const images = new SvelteMap();
    return {
        register(node, reveal) {
            const source = node.dataset.src;
            const entry = { node, reveal };
            images.set(source, entry);
            return {
                destroy() {
                    if (images.get(source) === entry) images.delete(source);
                },
            };
        },
        find(name) {
            for (const [source, entry] of images) {
                if (
                    source
                        .split('/')
                        .pop()
                        .replace(/\.[^.]+$/, '') === name
                )
                    return entry;
            }
        },
    };
}
