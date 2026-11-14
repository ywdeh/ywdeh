import { reduced_motion } from '$lib/motion/timing.js';

const MAX_ZOOM = 4;
const TAP_ZOOM = 2;
const KEEP_VISIBLE = 0.3;
const OVERPULL = 0.08;
const SLIDE = 150;
const MAX_SLIDE = 0.35;
const DRAG_START = 5;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_DISTANCE = 28;
const KEY_STEP = 40;
const KEY_DIRECTIONS = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };

const resets = new WeakMap();

export function unzoom_before_close(viewport) {
    return resets.get(viewport)?.();
}

const clamp = (value, [low, high]) => Math.min(high, Math.max(low, value));

export function pan_zoom(viewport) {
    const layer = viewport.firstElementChild;
    const touches = new Map();
    let zoom = 1;
    let pan_x = 0;
    let pan_y = 0;
    let drag;
    let pinch;
    let moved = false;
    let pending_tap;

    const screen = () => ({ x: document.documentElement.clientWidth, y: window.innerHeight });

    function render(smooth) {
        layer.classList.toggle('is_zooming', smooth === 'zoom');
        layer.classList.toggle('is_settling', smooth === 'settle');
        layer.style.transform = `translate(${pan_x}px, ${pan_y}px) scale(${zoom})`;
    }

    function bounds() {
        const image = layer.querySelector('img')?.getBoundingClientRect();
        if (!image?.width) return { x: [0, 0], y: [0, 0] };
        const moving = layer.getBoundingClientRect();
        const home = viewport.getBoundingClientRect();
        const size = screen();
        const scale = moving.width / layer.offsetWidth || 1;
        const range = (axis, start, length) => {
            const base = (image[start] - moving[start]) / scale;
            const extent = (image[length] / scale) * zoom;
            const keep = Math.min(extent * KEEP_VISIBLE, size[axis]);
            const offset = home[start] + base * zoom;
            return [keep - extent - offset, size[axis] - keep - offset];
        };
        return { x: range('x', 'left', 'width'), y: range('y', 'top', 'height') };
    }

    function rubber(value, [low, high], size) {
        const most = size * OVERPULL;
        const pull = (distance) => (1 - 1 / (distance / most + 1)) * most;
        if (value < low) return low - pull(low - value);
        if (value > high) return high + pull(value - high);
        return value;
    }

    function settle(velocity = { x: 0, y: 0 }) {
        const range = bounds();
        const size = screen();
        const slide = (speed, axis) => {
            if (reduced_motion()) return 0;
            const most = size[axis] * MAX_SLIDE;
            return Math.max(-most, Math.min(most, speed * SLIDE));
        };
        const next_x = clamp(pan_x + slide(velocity.x, 'x'), range.x);
        const next_y = clamp(pan_y + slide(velocity.y, 'y'), range.y);
        if (Math.abs(next_x - pan_x) < 0.5 && Math.abs(next_y - pan_y) < 0.5) return;
        pan_x = next_x;
        pan_y = next_y;
        render('settle');
    }

    function zoom_around(next_zoom, client_x, client_y) {
        const home = viewport.getBoundingClientRect();
        const x = client_x - home.left;
        const y = client_y - home.top;
        const ratio = next_zoom / zoom;
        pan_x = x - (x - pan_x) * ratio;
        pan_y = y - (y - pan_y) * ratio;
        zoom = next_zoom;
        const range = bounds();
        pan_x = clamp(pan_x, range.x);
        pan_y = clamp(pan_y, range.y);
        render('zoom');
    }

    function reset_zoom() {
        zoom = 1;
        pan_x = 0;
        pan_y = 0;
        render('zoom');
    }

    function zoom_by(client_x, client_y, delta, sensitivity) {
        const step = Math.exp(-Math.max(-100, Math.min(100, delta)) / sensitivity);
        const next_zoom = Math.min(MAX_ZOOM, Math.max(1, zoom * step));
        if (next_zoom === zoom) return;
        if (next_zoom === 1) reset_zoom();
        else zoom_around(next_zoom, client_x, client_y);
    }

    function toggle_zoom(client_x, client_y) {
        if (zoom > 1) reset_zoom();
        else zoom_around(TAP_ZOOM, client_x, client_y);
    }

    function pinch_frame() {
        const [a, b] = [...touches.values()];
        return { distance: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }

    function start_pinch() {
        const home = viewport.getBoundingClientRect();
        const { distance, x, y } = pinch_frame();
        drag = undefined;
        pending_tap = undefined;
        moved = true;
        pinch = {
            distance,
            zoom,
            point_x: (x - home.left - pan_x) / zoom,
            point_y: (y - home.top - pan_y) / zoom,
        };
    }

    function move_pinch() {
        const home = viewport.getBoundingClientRect();
        const { distance, x, y } = pinch_frame();
        zoom = Math.min(MAX_ZOOM, Math.max(1, (pinch.zoom * distance) / pinch.distance));
        pan_x = x - home.left - pinch.point_x * zoom;
        pan_y = y - home.top - pinch.point_y * zoom;
        render();
    }

    function start_drag(id, x, y) {
        drag = { id, x, y, left: pan_x, top: pan_y, range: bounds(), trail: [] };
    }

    function release_velocity(event) {
        const recent = drag.trail?.filter((point) => event.timeStamp - point.time < 100) ?? [];
        if (event.type !== 'pointerup' || recent.length < 2) return { x: 0, y: 0 };
        const first = recent[0];
        const last = recent.at(-1);
        const time = Math.max(last.time - first.time, 16);
        return { x: (last.x - first.x) / time, y: (last.y - first.y) / time };
    }

    function wheel(event) {
        if (drag || !event.deltaY) return;
        event.preventDefault();
        const delta = event.deltaMode === 0 ? event.deltaY : event.deltaY * 16;
        zoom_by(event.clientX, event.clientY, delta, event.ctrlKey ? 150 : 600);
    }

    function pointerdown(event) {
        if (event.pointerType === 'touch') {
            touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
            if (touches.size === 2) return start_pinch();
        }
        moved = false;
        if (!event.isPrimary || event.button !== 0) return;
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    }

    function pointermove(event) {
        if (touches.has(event.pointerId)) {
            touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
            if (pinch && touches.size === 2) return move_pinch();
        }
        if (drag?.id !== event.pointerId) return;
        if (!moved) {
            if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < DRAG_START) return;
            pending_tap = undefined;
            const transform = getComputedStyle(layer).transform;
            const current = new DOMMatrix(transform === 'none' ? undefined : transform);
            pan_x = current.e;
            pan_y = current.f;
            zoom = current.a;
            render();
            start_drag(drag.id, event.clientX, event.clientY);
            moved = true;
            try {
                viewport.setPointerCapture(event.pointerId);
            } catch {}
            viewport.classList.add('is_grabbing');
        }
        const size = screen();
        pan_x = rubber(drag.left + event.clientX - drag.x, drag.range.x, size.x);
        pan_y = rubber(drag.top + event.clientY - drag.y, drag.range.y, size.y);
        render();
        drag.trail.push({ x: event.clientX, y: event.clientY, time: event.timeStamp });
        if (drag.trail.length > 6) drag.trail.shift();
    }

    function end_touch(event) {
        if (!touches.delete(event.pointerId) || !pinch) return;
        pinch = undefined;
        if (zoom < 1.05) {
            zoom = 1;
            render('zoom');
        }
        const [rest] = touches;
        if (rest) start_drag(rest[0], rest[1].x, rest[1].y);
        else settle();
    }

    function end_drag(event) {
        end_touch(event);
        if (drag?.id !== event.pointerId) return;
        if (moved && drag.trail) settle(release_velocity(event));
        drag = undefined;
        viewport.classList.remove('is_grabbing');
    }

    function click(event) {
        if (!event.detail) return;
        if (moved) {
            moved = false;
            return;
        }
        if (!event.target.closest('img')) return;
        const tap = { x: event.clientX, y: event.clientY, time: performance.now() };
        const repeated =
            pending_tap &&
            tap.time - pending_tap.time <= DOUBLE_TAP_MS &&
            Math.hypot(tap.x - pending_tap.x, tap.y - pending_tap.y) <= DOUBLE_TAP_DISTANCE;
        pending_tap = repeated ? undefined : tap;
        if (repeated) toggle_zoom(tap.x, tap.y);
    }

    function keydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const box = viewport.getBoundingClientRect();
            return toggle_zoom(box.left + box.width / 2, box.top + box.height / 2);
        }
        const direction = KEY_DIRECTIONS[event.key];
        if (!direction || drag) return;
        event.preventDefault();
        const range = bounds();
        pan_x = clamp(pan_x + direction[0] * KEY_STEP, range.x);
        pan_y = clamp(pan_y + direction[1] * KEY_STEP, range.y);
        render('zoom');
    }

    resets.set(viewport, () => {
        viewport.inert = true;
        reset_zoom();
        const transition = layer
            .getAnimations()
            .find(({ transitionProperty }) => transitionProperty === 'transform');
        return transition?.finished.catch(() => {});
    });

    const listeners = new AbortController();
    const options = { signal: listeners.signal };
    viewport.addEventListener('wheel', wheel, { ...options, passive: false });
    viewport.addEventListener('pointerdown', pointerdown, options);
    viewport.addEventListener('pointermove', pointermove, options);
    viewport.addEventListener('pointerleave', (event) => !moved && end_drag(event), options);
    viewport.addEventListener('lostpointercapture', end_drag, options);
    viewport.addEventListener('pointerup', end_drag, options);
    viewport.addEventListener('pointercancel', end_drag, options);
    viewport.addEventListener('keydown', keydown, options);
    viewport.addEventListener('click', click, { ...options, capture: true });
    window.addEventListener('resize', () => settle(), options);

    return {
        destroy() {
            listeners.abort();
            resets.delete(viewport);
        },
    };
}
