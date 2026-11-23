import { track } from '$lib/analytics/track.js';
import { events } from '$lib/content/events.js';
import { token_ms } from '$lib/motion/timing.js';

const page_copy = () => ({ text: location.href, event: [events.copy_link, { page: location.pathname }] });

export function link_copy(source = page_copy) {
    let copied = $state(false);
    let timer;

    return {
        get copied() {
            return copied;
        },
        async copy() {
            const { text, event } = source();
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                return;
            }
            track(...event);
            copied = true;
            clearTimeout(timer);
            timer = setTimeout(() => (copied = false), token_ms('--duration-confirm'));
        },
        destroy() {
            clearTimeout(timer);
        },
    };
}
