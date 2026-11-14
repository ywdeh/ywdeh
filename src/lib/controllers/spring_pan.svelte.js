import { reduced_motion, token_ms } from '$lib/motion/timing.js';

const REST = 0;
const STIFFNESS = 12;
const SUBSTEP = 0.004;

export function spring_pan() {
    let position = $state(REST);
    let target = REST;
    let velocity = 0;
    let frame;
    let last_frame;
    let ready = true;
    let hold_timer;

    function stop() {
        cancelAnimationFrame(frame);
        frame = undefined;
        velocity = 0;
    }

    function step(now) {
        if (last_frame === undefined) {
            last_frame = now;
            frame = requestAnimationFrame(step);
            return;
        }
        const elapsed = Math.min(Math.max(now - last_frame, 0), 50) / 1000;
        last_frame = now;
        let x = position;
        for (let left = elapsed; left > 0; left -= SUBSTEP) {
            const dt = Math.min(SUBSTEP, left);
            velocity += (STIFFNESS * STIFFNESS * (target - x) - 2 * STIFFNESS * velocity) * dt;
            x += velocity * dt;
        }
        position = Math.min(100, Math.max(0, x));
        if (position !== x) velocity = 0;
        if (Math.abs(target - position) < 0.05 && Math.abs(velocity) < 0.5) {
            position = target;
            velocity = 0;
            frame = undefined;
            return;
        }
        frame = requestAnimationFrame(step);
    }

    function to(next) {
        target = next;
        if (!ready) return;
        if (reduced_motion()) {
            position = next;
            return;
        }
        if (frame) return;
        last_frame = undefined;
        frame = requestAnimationFrame(step);
    }

    $effect(() => () => {
        stop();
        clearTimeout(hold_timer);
    });

    return {
        get position() {
            return position;
        },
        to,
        hold(element) {
            clearTimeout(hold_timer);
            stop();
            ready = false;
            hold_timer = setTimeout(
                () => {
                    ready = true;
                    to(target);
                },
                token_ms('--duration-press', element),
            );
        },
        reset() {
            clearTimeout(hold_timer);
            ready = true;
            to(REST);
        },
    };
}
