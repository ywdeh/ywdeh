import { reduced_motion } from '$lib/motion/timing.js';

const LEAVE_SHARE = 0.3;
const FLICK_SPEED = 0.5;
const FLICK_MIN = 40;

export function swipe_to_close(panel, onclose) {
    let swipe = null;

    const distance = () => Math.max(0, swipe.last_x - swipe.start_x);

    function end() {
        swipe = null;
        panel.classList.remove('is_swiping');
    }

    function pointerdown(event) {
        if (event.pointerType !== 'touch' || !event.isPrimary) return;
        if (event.target.closest('[data-own-swipe]')) return;
        swipe = {
            id: event.pointerId,
            start_x: event.clientX,
            last_x: event.clientX,
            last_time: event.timeStamp,
            speed: 0,
        };
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
        const leaves =
            pulled > panel.offsetWidth * LEAVE_SHARE || (pulled > FLICK_MIN && swipe.speed > FLICK_SPEED);
        end();
        if (!leaves || reduced_motion()) panel.style.translate = '';
        if (leaves) onclose();
    }

    function pointercancel(event) {
        if (swipe?.id !== event.pointerId) return;
        end();
        panel.style.translate = '';
    }

    const listeners = new AbortController();
    const options = { signal: listeners.signal };
    panel.addEventListener('pointerdown', pointerdown, options);
    panel.addEventListener('pointermove', pointermove, options);
    panel.addEventListener('pointerup', pointerup, options);
    panel.addEventListener('pointercancel', pointercancel, options);
    return {
        update: (next) => (onclose = next),
        destroy: () => listeners.abort(),
    };
}
