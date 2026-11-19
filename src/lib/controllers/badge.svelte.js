import { reduced_motion } from '$lib/motion/timing.js';

const FOLLOW_RATE = 14;
const MAX_FRAME_MS = 50;
const REST_DISTANCE = 0.3;

const badges = new Map();
const motions = new Map();
let shown = $state.raw(null);
let source = null;
let revealed = null;
let pointer = null;
let frame;
let last_time;
let observer;

function badge_for(element) {
    for (let node = element instanceof Element ? element : null; node; node = node.parentElement) {
        if (badges.has(node)) return badges.get(node);
    }
    return null;
}

function keyboard_badge() {
    const focused = document.activeElement;
    return focused?.matches(':focus-visible') ? badge_for(focused) : null;
}

function motion_of(badge) {
    if (!motions.has(badge)) motions.set(badge, { x: null, x_goal: null });
    return motions.get(badge);
}

const radius = (badge) => badge.element.offsetWidth / 2;

function along_edge(badge, client_x) {
    const bounds = badge.element.offsetParent?.getBoundingClientRect();
    if (!bounds?.width) return null;
    const inset = Math.min(radius(badge), bounds.width / 2);
    return Math.min(bounds.width - inset, Math.max(inset, client_x - bounds.left));
}

function centre(badge) {
    const width = badge.element.offsetParent?.getBoundingClientRect().width;
    return width ? width / 2 : null;
}

function place(badge) {
    const { x } = motion_of(badge);
    const { element } = badge;
    element.style.left = x === null ? '' : '0px';
    element.style.transform = x === null ? '' : `translateX(${x - radius(badge)}px)`;
}

function stop() {
    cancelAnimationFrame(frame);
    frame = undefined;
}

function glide_out(badge) {
    const motion = motions.get(badge);
    if (!motion || motion.x === null || !pointer) return;
    motion.x_goal = along_edge(badge, pointer.x) ?? motion.x;
}

function aim(badge) {
    if (pointer) motion_of(badge).x_goal = along_edge(badge, pointer.x);
    wake();
}

function show(badge, how) {
    if (badge === shown && how === source) return;
    const same = badge === shown;
    if (!same && shown) glide_out(shown);
    shown = badge;
    source = how;
    const motion = motion_of(badge);
    if (how === 'mouse' && pointer) {
        motion.x_goal = along_edge(badge, pointer.x);
        motion.x ??= same ? centre(badge) : motion.x_goal;
    } else if (same && motion.x !== null) {
        motion.x_goal = centre(badge);
    } else {
        motion.x = motion.x_goal = null;
    }
    place(badge);
    wake();
}

function release() {
    const focused = keyboard_badge();
    if (focused) return show(focused, 'focus');
    if (revealed) return show(revealed, 'reveal');
    if (shown) glide_out(shown);
    shown = null;
    source = null;
    wake();
}

function wake() {
    if (frame !== undefined || !motions.size) return;
    if (reduced_motion()) {
        for (const [badge, motion] of motions) {
            motion.x = motion.x_goal;
            place(badge);
        }
        return;
    }
    last_time = performance.now();
    frame = requestAnimationFrame(step);
}

function step(now) {
    const seconds = Math.min(Math.max(now - last_time, 0), MAX_FRAME_MS) / 1000;
    last_time = now;
    let moving = false;
    for (const [badge, motion] of motions) {
        if (motion.x === null || motion.x_goal === null) motion.x = motion.x_goal;
        else motion.x += (motion.x_goal - motion.x) * (1 - Math.exp(-seconds * FOLLOW_RATE));
        const placed = motion.x === null || Math.abs(motion.x_goal - motion.x) < REST_DISTANCE;
        if (placed) motion.x = motion.x_goal;
        place(badge);
        if (!placed) moving = true;
        else if (badge !== shown) motions.delete(badge);
    }
    frame = moving ? requestAnimationFrame(step) : undefined;
}

function follow(event) {
    if (event.pointerType !== 'mouse') return;
    pointer = { x: event.clientX, y: event.clientY };
    const badge = badge_for(event.target);
    if (!badge) return shown && source !== 'focus' && release();
    show(badge, 'mouse');
    aim(badge);
}

function recheck() {
    if (!pointer || source === 'touch') return;
    const badge = badge_for(document.elementFromPoint(pointer.x, pointer.y));
    if (badge) {
        show(badge, 'mouse');
        aim(badge);
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
        badge.registered = badge.host;
        badges.set(badge.registered, badge);
        if (badges.size > 1) return;
        for (const [target, type, listener] of listeners())
            target.addEventListener(type, listener, { capture: true, passive: true });
        observer = new MutationObserver(recheck);
        observer.observe(document.body, { subtree: true, attributeFilter: ['inert'] });
    },
    reveal(host, on) {
        const badge = badges.get(host);
        if (!badge) return;
        if (on) {
            revealed = badge;
            if (!shown || source === 'reveal') show(badge, 'reveal');
        } else if (revealed === badge) {
            revealed = null;
            if (shown === badge && source === 'reveal') release();
        }
    },
    unregister(badge) {
        if (badges.get(badge.registered) === badge) badges.delete(badge.registered);
        motions.delete(badge);
        if (revealed === badge) revealed = null;
        if (shown === badge) release();
        if (badges.size) return;
        stop();
        for (const [target, type, listener] of listeners())
            target.removeEventListener(type, listener, { capture: true });
        observer?.disconnect();
        pointer = null;
    },
};
