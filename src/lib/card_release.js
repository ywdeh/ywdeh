import { reduced_motion } from './motion.js';

// Presses a card in before it acts: a click is held back while the card sinks in (.is_pressed), then
// replayed once the press-in has finished. Use as an action, `use:card_release`.
//   preview_selector: the part whose transition marks the end of the press (default: anything inside);
//     false turns the action off
//   should_press(event): false lets that click through untouched
export function card_release(card, preview_selector, should_press = () => true) {
    if (preview_selector === false) return;
    let waiting = false;

    async function click(event) {
        if (!event.isTrusted || event.defaultPrevented ||
            event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        if (!should_press(event) || reduced_motion()) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        if (waiting) return;

        // the action fires as soon as the press-in finishes; the spring back plays alongside it
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
        return Promise.allSettled(animations
            .filter(({ transitionProperty }) => ['clip-path', 'padding-left', 'opacity', 'stroke-dasharray'].includes(transitionProperty))
            .map((animation) => animation.finished));
    }

    card.addEventListener('click', click, true);
    return { destroy: () => card.removeEventListener('click', click, true) };
}
