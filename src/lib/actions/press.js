import { reduced_motion } from '$lib/motion/timing.js';

const PRESS_PROPERTIES = new Set(['clip-path', 'padding-left', 'opacity', 'stroke-dasharray']);

const leaves_page = (element) =>
    element instanceof HTMLAnchorElement &&
    (element.target === '_blank' || element.origin !== location.origin);

export function press(element, options = {}) {
    let { target, when = () => true } = options;
    let waiting = false;

    function settled() {
        const preview = target && element.querySelector(target);
        const animations = preview ? preview.getAnimations() : element.getAnimations({ subtree: true });
        return Promise.allSettled(
            animations
                .filter(({ transitionProperty }) => PRESS_PROPERTIES.has(transitionProperty))
                .map(({ finished }) => finished),
        );
    }

    async function click(event) {
        if (!event.isTrusted || event.defaultPrevented) return;
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        if (!when(event) || reduced_motion()) return;
        if (leaves_page(element)) {
            element.classList.add('is_pressed');
            await settled();
            element.classList.remove('is_pressed');
            return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        if (waiting) return;
        waiting = true;
        element.classList.add('is_pressed');
        await settled();
        waiting = false;
        if (element.isConnected) element.click();
        element.classList.remove('is_pressed');
    }

    element.addEventListener('click', click, true);
    return {
        update(next = {}) {
            ({ target, when = () => true } = next);
        },
        destroy: () => element.removeEventListener('click', click, true),
    };
}
