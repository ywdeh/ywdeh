import { reduced_motion } from '$lib/motion/timing.js';

const TILT_PER_PX = 1.4;
const SETTLE_MS = 140;
const REST_MS = 1000;
const FOLLOW_RATE = 14;
const TURN_RATE = 12;
const HOME_RATE = 5;

const badges = new Map();
const motion = { x: null, x_goal: null, angle: 0, angle_goal: 0, turning: false, homing: false };
let shown = $state.raw(null);
let source = null;
let pointer = null;
let frame;
let last_time;
let settle_timer;
let rest_timer;
let observer;

function badge_for(element) {
    for (let host = element?.closest?.('.tinted'); host; host = host.parentElement?.closest('.tinted')) {
        if (badges.has(host)) return badges.get(host);
    }
    return null;
}

function keyboard_badge() {
    const focused = document.activeElement;
    return focused?.matches(':focus-visible') ? badge_for(focused) : null;
}

const radius = () => shown.element.offsetWidth / 2;

function along_edge(client_x) {
    const bounds = shown?.element.offsetParent?.getBoundingClientRect();
    if (!bounds?.width) return null;
    const inset = Math.min(radius(), bounds.width / 2);
    return Math.min(bounds.width - inset, Math.max(inset, client_x - bounds.left));
}

function place() {
    if (!shown) return;
    const { element, icon, kind } = shown;
    element.style.left = motion.x === null ? '' : '0px';
    element.style.transform = motion.x === null ? '' : `translateX(${motion.x - radius()}px)`;
    icon.style.rotate = kind === 'open' ? `${motion.angle}deg` : '';
}

function stop() {
    cancelAnimationFrame(frame);
    clearTimeout(settle_timer);
    clearTimeout(rest_timer);
    frame = settle_timer = rest_timer = undefined;
}

function show(badge, how) {
    if (badge === shown && how === source) return;
    cancelAnimationFrame(frame);
    frame = undefined;
    shown = badge;
    source = how;
    if (how === 'mouse' && pointer) {
        motion.x = motion.x_goal = along_edge(pointer.x);
    } else {
        motion.x = motion.x_goal = null;
        motion.angle = motion.angle_goal = 0;
        motion.turning = motion.homing = false;
    }
    place();
    wake();
}

function release() {
    const focused = keyboard_badge();
    if (focused) return show(focused, 'focus');
    stop();
    shown = null;
    source = null;
    if (motion.turning) settle();
}

function settle() {
    motion.turning = false;
    motion.homing = false;
    motion.angle_goal = motion.angle_goal <= -45 ? -90 : 0;
    wake();
}

function turn(delta) {
    if (shown?.kind !== 'open' || !delta) return;
    clearTimeout(rest_timer);
    rest_timer = undefined;
    if (!motion.turning) motion.angle_goal = motion.angle;
    motion.turning = true;
    motion.homing = false;
    motion.angle_goal = Math.max(-90, Math.min(0, motion.angle_goal + delta * TILT_PER_PX));
    clearTimeout(settle_timer);
    settle_timer = setTimeout(settle, SETTLE_MS);
}

function wake() {
    if (!shown || frame !== undefined) return;
    if (reduced_motion()) {
        motion.x = motion.x_goal;
        motion.angle = motion.angle_goal = 0;
        return place();
    }
    last_time = performance.now();
    frame = requestAnimationFrame(step);
}

function step(now) {
    const seconds = Math.min(Math.max(now - last_time, 0), 50) / 1000;
    last_time = now;
    const ease = (rate) => 1 - Math.exp(-seconds * rate);
    if (motion.x === null || motion.x_goal === null) motion.x = motion.x_goal;
    else motion.x += (motion.x_goal - motion.x) * ease(FOLLOW_RATE);
    motion.angle += (motion.angle_goal - motion.angle) * ease(motion.homing ? HOME_RATE : TURN_RATE);
    const placed = motion.x === null || Math.abs(motion.x_goal - motion.x) < 0.3;
    const turned = Math.abs(motion.angle_goal - motion.angle) < 0.1;
    if (placed) motion.x = motion.x_goal;
    if (turned) motion.angle = motion.angle_goal;
    place();
    if (turned && !motion.turning && motion.angle !== 0 && rest_timer === undefined) {
        rest_timer = setTimeout(() => {
            motion.homing = true;
            motion.angle_goal = 0;
            wake();
        }, REST_MS);
    }
    frame = placed && turned ? undefined : requestAnimationFrame(step);
}

function follow(event) {
    if (event.pointerType !== 'mouse') return;
    const delta = pointer ? event.clientX - pointer.x : 0;
    pointer = { x: event.clientX, y: event.clientY };
    const badge = badge_for(event.target);
    if (!badge) return shown && source !== 'focus' && release();
    show(badge, 'mouse');
    turn(delta);
    motion.x_goal = along_edge(pointer.x);
    wake();
}

function recheck() {
    if (!pointer || source === 'touch') return;
    const badge = badge_for(document.elementFromPoint(pointer.x, pointer.y));
    if (badge) {
        show(badge, 'mouse');
        motion.x_goal = along_edge(pointer.x);
        wake();
    } else if (source === 'mouse') release();
}

function press(event) {
    if (event.pointerType === 'mouse') return;
    const badge = badge_for(event.target);
    if (badge) show(badge, 'touch');
}

function lift(event) {
    if (event.pointerType === 'pen' && source === 'touch') release();
}

function lift_touch(event) {
    if (!event.touches.length && source === 'touch') release();
}

function leave_window(event) {
    if (event.pointerType !== 'mouse' || event.relatedTarget) return;
    pointer = null;
    if (source === 'mouse') release();
}

function focus_in(event) {
    const badge = badge_for(event.target);
    if (badge && badge !== shown && event.target.matches(':focus-visible')) show(badge, 'focus');
}

function focus_out(event) {
    if (source === 'focus' && badge_for(event.relatedTarget) !== shown) release();
}

const listeners = () => [
    [document, 'pointermove', follow],
    [document, 'pointerdown', press],
    [document, 'pointerup', lift],
    [document, 'pointercancel', lift],
    [document, 'touchend', lift_touch],
    [document, 'touchcancel', lift_touch],
    [document, 'pointerout', leave_window],
    [document, 'focusin', focus_in],
    [document, 'focusout', focus_out],
    [window, 'scroll', recheck],
];

export const badges_state = {
    get current() {
        return shown;
    },
    register(badge) {
        badges.set(badge.host, badge);
        if (badges.size > 1) return;
        for (const [target, type, listener] of listeners())
            target.addEventListener(type, listener, { capture: true, passive: true });
        observer = new MutationObserver(recheck);
        observer.observe(document.body, { subtree: true, attributeFilter: ['inert'] });
    },
    unregister(badge) {
        if (badges.get(badge.host) === badge) badges.delete(badge.host);
        if (shown === badge) release();
        if (badges.size) return;
        stop();
        for (const [target, type, listener] of listeners())
            target.removeEventListener(type, listener, { capture: true });
        observer?.disconnect();
        pointer = null;
    },
};
