import { token_ms } from '$lib/motion/timing.js';

export function hover_intent(handlers) {
    let timer;

    function enter() {
        clearTimeout(timer);
        handlers.enter();
    }

    function leave() {
        clearTimeout(timer);
        handlers.leave();
    }

    function leave_after(delay) {
        clearTimeout(timer);
        timer = setTimeout(handlers.leave, delay);
    }

    const linger = () => leave_after(token_ms('--duration-linger'));

    $effect(() => () => clearTimeout(timer));

    return {
        onpointerenter: (event) => event.pointerType === 'mouse' && enter(),
        onpointerleave: (event) => event.pointerType === 'mouse' && leave(),
        onpointerdown: (event) => event.pointerType !== 'mouse' && enter(),
        onpointerup: (event) => event.pointerType === 'pen' && linger(),
        onpointercancel: (event) => event.pointerType === 'pen' && leave_after(0),
        ontouchend: linger,
        ontouchcancel: () => leave_after(0),
    };
}
