// Swipe a panel away to the right with a finger: it follows the finger, and on release either leaves
// (pulled far or flicked fast enough) or springs back. Use as an action:
// `use:swipe_to_close={{ onclose, enabled }}`.
//
// The panel needs `touch-action: pan-y` so the browser keeps vertical scrolling for itself and hands
// sideways moves over. Anything inside that handles its own sideways drags (a picture slider, the divider
// stars) opts out with a `data-own-swipe` attribute.
//
// While following the finger the panel gets `.is_swiping` (turn its transitions off with it) and an inline
// `translate`; letting it spring back just clears both, so its own CSS transition on translate plays.
// When it leaves, the translate stays, so its exit animation carries on from where the finger let go.

import { reduced_motion } from './motion.js';

const LEAVE_SHARE = 0.3; // pulled past this share of its width, it leaves
const FLICK_SPEED = 0.5; // px/ms: a flick this fast leaves too...
const FLICK_MIN = 40; // ...once it has travelled at least this far (px)

export function swipe_to_close(panel, options) {
    let { onclose, enabled = true } = options;
    let swipe = null; // { id, start_x, last_x, last_time, speed }

    function pointerdown(event) {
        if (!enabled || event.pointerType !== 'touch' || !event.isPrimary) return;
        if (event.target.closest('[data-own-swipe]')) return;
        swipe = { id: event.pointerId, start_x: event.clientX, last_x: event.clientX, last_time: event.timeStamp, speed: 0 };
    }

    function pointermove(event) {
        if (swipe?.id !== event.pointerId) return;
        const elapsed = event.timeStamp - swipe.last_time;
        if (elapsed > 0) swipe.speed = (event.clientX - swipe.last_x) / elapsed;
        swipe.last_x = event.clientX;
        swipe.last_time = event.timeStamp;
        panel.classList.add('is_swiping');
        panel.style.translate = `${distance()}px 0`;
    }

    function pointerup(event) {
        if (swipe?.id !== event.pointerId) return;
        const pulled = distance();
        const leaves = pulled > panel.offsetWidth * LEAVE_SHARE || (pulled > FLICK_MIN && swipe.speed > FLICK_SPEED);
        swipe = null;
        panel.classList.remove('is_swiping');
        if (leaves) {
            if (reduced_motion()) panel.style.translate = '';
            onclose();
        } else {
            spring_back();
        }
    }

    // a vertical scroll took over, or the touch was interrupted
    function pointercancel(event) {
        if (swipe?.id !== event.pointerId) return;
        swipe = null;
        panel.classList.remove('is_swiping');
        spring_back();
    }

    // only ever to the right: pulling left stays put
    function distance() {
        return Math.max(0, swipe.last_x - swipe.start_x);
    }

    function spring_back() {
        panel.style.translate = '';
    }

    const listeners = new AbortController();
    const signal = listeners.signal;
    panel.addEventListener('pointerdown', pointerdown, { signal });
    panel.addEventListener('pointermove', pointermove, { signal });
    panel.addEventListener('pointerup', pointerup, { signal });
    panel.addEventListener('pointercancel', pointercancel, { signal });

    return {
        update(next) {
            ({ onclose, enabled = true } = next);
        },
        destroy() {
            listeners.abort();
        },
    };
}
