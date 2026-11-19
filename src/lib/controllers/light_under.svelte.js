import { luminance } from '$lib/media/color.js';

const ROWS = [0.3, 0.75];
const COLUMNS = [0, 0.4, 0.8];
const EDGE_PX = 8;
const DARK = 0.15;
const RANGE = 0.3;

export function light_under(options) {
    let shade = $state(0);

    function picture_below(x, y) {
        const element = document.elementsFromPoint(x, y).find((node) => !options.element.contains(node));
        if (element?.tagName !== 'IMG') return 0;
        const tint = getComputedStyle(element).getPropertyValue('--tint').trim();
        return tint ? luminance(tint) : 0;
    }

    function sample() {
        const box = options.area?.getBoundingClientRect();
        if (!box) return;
        let light = 0;
        for (const row of ROWS)
            for (const column of COLUMNS)
                light = Math.max(
                    light,
                    picture_below(box.left + Math.max(EDGE_PX, box.width * column), box.top + box.height * row),
                );
        shade = Math.min(Math.max((light - DARK) / RANGE, 0), 1);
    }

    $effect(() => {
        const element = options.element;
        if (!element) return;
        let frame;
        const later = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(sample);
        };
        later();
        const listeners = new AbortController();
        const signal = listeners.signal;
        addEventListener('scroll', later, { passive: true, capture: true, signal });
        addEventListener('scrollend', sample, { capture: true, signal });
        addEventListener('resize', later, { signal });
        element.addEventListener('pointerenter', later, { signal });
        element.addEventListener('focusin', later, { signal });
        return () => {
            cancelAnimationFrame(frame);
            listeners.abort();
        };
    });

    return {
        get shade() {
            return shade;
        },
        sample,
    };
}
