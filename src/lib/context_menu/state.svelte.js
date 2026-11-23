import { track } from '$lib/analytics/track.js';
import { events } from '$lib/content/events.js';
import { token_ms } from '$lib/motion/timing.js';
import { enabled } from './enabled.js';

const HOLD_SLOP = 10;
const HOLD_GRACE = 1000;
const NATIVE_TARGETS = 'input, textarea, select, [contenteditable]';

class MenuState {
    id = $state(0);
    open = $state(false);
    held = $state(false);
    x = $state(0);
    y = $state(0);
    groups = $state.raw([]);
    tint = $state('');
    engaged = $state(false);
    source = $state.raw(null);
    lit = $state.raw(null);
    anchor = null;
    anchor_at = { x: 0, y: 0 };
    return_to = null;
}

export const holds = (node) => menu.open && menu.engaged && !!node && menu.source === node;

export const tint_shown = () => !!menu.lit?.();

export const menu = new MenuState();

export function close_menu() {
    menu.open = false;
    menu.held = false;
    menu.engaged = false;
}

let native_next = false;

export function pass_to_native() {
    close_menu();
    native_next = true;
    const release = () => {
        removeEventListener('contextmenu', after, true);
        removeEventListener('pointerdown', release, true);
        native_next = false;
    };
    const after = () => setTimeout(release);
    addEventListener('contextmenu', after, true);
    setTimeout(() => addEventListener('pointerdown', release, true));
}

export const page_link = (path) => new URL(path, location.origin).href;

export async function copy_text(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

function open_menu(groups, x, y, held, tint) {
    menu.groups = groups;
    menu.tint = tint;
    const focused = document.activeElement;
    menu.return_to = focused?.matches?.(':focus-visible') ? focused : null;
    menu.x = x;
    menu.y = y;
    menu.held = held;
    menu.engaged = held;
    menu.id++;
    menu.open = true;
    track(events.menu_open, { page: location.pathname });
}

const keeps_native = (event) =>
    event.shiftKey || !!getSelection()?.toString().trim() || !!event.target.closest?.(NATIVE_TARGETS);

const claimed = new WeakSet();

export function context_menu(node, options) {
    if (!enabled) return;
    let current = options;
    let held_at = 0;
    let timer;
    let start = { x: 0, y: 0 };

    function show(x, y, held = false) {
        const groups = current?.items?.()?.filter((group) => group?.length);
        if (!groups?.length) return false;
        const tint = current.outline ? getComputedStyle(node).getPropertyValue('--tint').trim() || 'initial' : '';
        menu.source = current.outline ? node : null;
        menu.lit = current.outline ? (current.lit ?? null) : null;
        const box = node.getBoundingClientRect();
        menu.anchor = node;
        menu.anchor_at = { x: box.left, y: box.top };
        open_menu(groups, x, y, held, tint);
        return true;
    }

    function contextmenu(event) {
        if (!current || native_next || event.defaultPrevented || keeps_native(event)) return;
        if (current.skip?.(event.target)) return;
        if (Date.now() - held_at < HOLD_GRACE) return event.preventDefault();
        if (show(event.clientX, event.clientY)) event.preventDefault();
    }

    const strayed = (x, y) => Math.hypot(x - start.x, y - start.y) > HOLD_SLOP;

    function touch_move(event) {
        const touch = event.touches[0];
        if (event.touches.length > 1 || (touch && strayed(touch.clientX, touch.clientY))) cancel();
    }

    function cancel() {
        clearTimeout(timer);
        removeEventListener('touchmove', touch_move, true);
        removeEventListener('touchend', cancel, true);
        removeEventListener('touchcancel', cancel, true);
        removeEventListener('scroll', cancel, true);
    }

    function pointerdown(event) {
        if (!current?.items || current.hold === false || event.pointerType === 'mouse') return;
        if (claimed.has(event) || keeps_native(event)) return;
        claimed.add(event);
        cancel();
        start = { x: event.clientX, y: event.clientY };
        addEventListener('touchmove', touch_move, { capture: true, passive: true });
        addEventListener('touchend', cancel, true);
        addEventListener('touchcancel', cancel, true);
        addEventListener('scroll', cancel, true);
        timer = setTimeout(() => {
            cancel();
            if (!show(start.x, start.y, true)) return;
            held_at = Date.now();
            navigator.vibrate?.(8);
        }, token_ms('--duration-hold'));
    }

    function click(event) {
        if (Date.now() - held_at >= HOLD_GRACE) return;
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    node.addEventListener('contextmenu', contextmenu);
    node.addEventListener('pointerdown', pointerdown);
    node.addEventListener('click', click, true);

    return {
        update(next) {
            current = next;
        },
        destroy() {
            cancel();
            node.removeEventListener('contextmenu', contextmenu);
            node.removeEventListener('pointerdown', pointerdown);
            node.removeEventListener('click', click, true);
        },
    };
}
