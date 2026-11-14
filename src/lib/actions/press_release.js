import { reduced_motion } from '$lib/motion/settings.js';
export function press_release(card, preview_selector, should_press = () => true) {
    if (preview_selector === false) return;
    let waiting = false;
    async function click(event) {
        if (
            !event.isTrusted ||
            event.defaultPrevented ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
        )
            return;
        if (!should_press(event) || reduced_motion()) return;
        if (leaves_page(card)) {
            card.classList.add('is_pressed');
            await finish_inset();
            card.classList.remove('is_pressed');
            return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        if (waiting) return;
        waiting = true;
        card.classList.add('is_pressed');
        await finish_inset();
        waiting = false;
        if (card.isConnected) card.click();
        card.classList.remove('is_pressed');
    }
    function finish_inset() {
        const preview = preview_selector && card.querySelector(preview_selector);
        const animations = preview ? preview.getAnimations() : card.getAnimations({ subtree: true });
        return Promise.allSettled(
            animations
                .filter(({ transitionProperty }) =>
                    ['clip-path', 'padding-left', 'opacity', 'stroke-dasharray'].includes(transitionProperty),
                )
                .map((animation) => animation.finished),
        );
    }
    function leaves_page(element) {
        if (!(element instanceof HTMLAnchorElement)) return false;
        return element.target === '_blank' || element.origin !== location.origin;
    }
    card.addEventListener('click', click, true);
    return { destroy: () => card.removeEventListener('click', click, true) };
}
