import { reduced_motion } from '$lib/motion/settings.js';
const LEAVE_SHARE = 0.3;
const FLICK_SPEED = 0.5;
const FLICK_MIN = 40;
export function swipe_to_close(panel, options) {
    let { onclose, enabled = true } = options;
    let swipe = null;
    function pointerdown(event) {
        if (!enabled || event.pointerType !== 'touch' || !event.isPrimary) return;
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
        swipe = null;
        panel.classList.remove('is_swiping');
        if (leaves) {
            if (reduced_motion()) panel.style.translate = '';
            onclose();
        } else {
            spring_back();
        }
    }
    function pointercancel(event) {
        if (swipe?.id !== event.pointerId) return;
        swipe = null;
        panel.classList.remove('is_swiping');
        spring_back();
    }
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
