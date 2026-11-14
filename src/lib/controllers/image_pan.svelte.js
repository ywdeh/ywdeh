import { reduced_motion, css_time } from '$lib/motion/settings.js';
export function image_pan() {
    const PAN_REST = 0;
    const PAN_STIFFNESS = 12;
    let pan_x = $state(PAN_REST);
    let pan_target = PAN_REST;
    let pan_velocity = 0;
    let pan_frame;
    let last_frame;
    let pan_ready = true;
    let pan_delay;
    function stop_pan_loop() {
        cancelAnimationFrame(pan_frame);
        pan_frame = undefined;
        pan_velocity = 0;
    }
    function hold_pan_for_outline(element) {
        clearTimeout(pan_delay);
        stop_pan_loop();
        pan_ready = false;
        pan_delay = setTimeout(
            () => {
                pan_ready = true;
                pan_to(pan_target);
            },
            css_time(element, '--press-time'),
        );
    }
    function pan_to(target) {
        pan_target = target;
        if (!pan_ready) return;
        if (reduced_motion()) {
            pan_x = target;
            return;
        }
        if (!pan_frame) {
            last_frame = undefined;
            pan_frame = requestAnimationFrame(step_pan);
        }
    }
    function step_pan(now) {
        if (last_frame === undefined) {
            last_frame = now;
            pan_frame = requestAnimationFrame(step_pan);
            return;
        }
        const elapsed = Math.min(Math.max(now - last_frame, 0), 50) / 1000;
        last_frame = now;
        let x = pan_x;
        for (let left_time = elapsed; left_time > 0; left_time -= 0.004) {
            const dt = Math.min(0.004, left_time);
            const accel = PAN_STIFFNESS * PAN_STIFFNESS * (pan_target - x) - 2 * PAN_STIFFNESS * pan_velocity;
            pan_velocity += accel * dt;
            x += pan_velocity * dt;
        }
        pan_x = Math.min(100, Math.max(0, x));
        if (pan_x !== x) pan_velocity = 0;
        if (Math.abs(pan_target - pan_x) < 0.05 && Math.abs(pan_velocity) < 0.5) {
            pan_x = pan_target;
            pan_velocity = 0;
            pan_frame = undefined;
            return;
        }
        pan_frame = requestAnimationFrame(step_pan);
    }
    $effect(() => () => {
        stop_pan_loop();
        clearTimeout(pan_delay);
    });
    return {
        get position() {
            return pan_x;
        },
        hold: hold_pan_for_outline,
        to: pan_to,
        reset() {
            clearTimeout(pan_delay);
            pan_ready = true;
            pan_to(PAN_REST);
        },
    };
}
