import { reduced_motion } from '$lib/motion/timing.js';

const TURN_MS = 4000;
const SPIN_EASE_MS = 700;
const REST_SPEED = 0.0005;

export function vinyl_spin(options) {
    let angle = 0;
    let speed = 0;
    let frame;
    let last;

    function spin(now) {
        const dt = last === undefined ? 0 : now - last;
        last = now;
        const playing = options.playing;
        const target = playing ? 360 / TURN_MS : 0;
        speed += (target - speed) * (1 - Math.exp(-dt / (SPIN_EASE_MS / 3)));
        if (!playing && speed < REST_SPEED) speed = 0;
        angle = (angle + speed * dt) % 360;
        if (options.element) options.element.style.rotate = `${angle}deg`;
        if (speed === 0 && !playing) {
            frame = undefined;
            last = undefined;
            return;
        }
        frame = requestAnimationFrame(spin);
    }

    $effect(() => {
        if (options.playing && !frame && !reduced_motion()) frame = requestAnimationFrame(spin);
    });

    $effect(() => () => cancelAnimationFrame(frame));
}
