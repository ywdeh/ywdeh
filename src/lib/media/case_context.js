import { getContext, setContext } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { picture_name } from './images.js';

const KEY = Symbol('case');

export function provide_case(open, link) {
    const images = new SvelteMap();
    const context = {
        open,
        link: (src) => link?.(picture_name(src)),
        register(node, { reveal, anchor }) {
            const src = node.dataset.src;
            const entry = { node, reveal, anchor };
            images.set(src, entry);
            return {
                destroy() {
                    if (images.get(src) === entry) images.delete(src);
                },
            };
        },
        find(name) {
            for (const [src, entry] of images) if (picture_name(src) === name) return entry;
        },
    };
    setContext(KEY, context);
    return context;
}

export const case_context = () => getContext(KEY);
