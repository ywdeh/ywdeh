import { token_ms } from '$lib/motion/timing.js';

export function link_copy() {
    let copied = $state(false);
    let timer;

    return {
        get copied() {
            return copied;
        },
        async copy() {
            try {
                await navigator.clipboard.writeText(location.href);
            } catch {
                return;
            }
            copied = true;
            clearTimeout(timer);
            timer = setTimeout(() => (copied = false), token_ms('--duration-confirm'));
        },
        destroy() {
            clearTimeout(timer);
        },
    };
}
