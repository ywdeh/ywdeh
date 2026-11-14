import { reduced_motion } from '$lib/motion/settings.js';
const MAX_ZOOM = 4;
const TAP_ZOOM = 2;
const KEEP_VISIBLE = 0.3;
const OVERPULL = 0.08;
const SLIDE = 150;
const MAX_SLIDE = 0.35;
const reset_before_close = new WeakMap();
export function unzoom_before_close(viewport) {
    return reset_before_close.get(viewport)?.();
}
export function image_pan_zoom(viewport) {
    const layer = viewport.firstElementChild;
    let zoom = 1;
    let pan_x = 0;
    let pan_y = 0;
    let drag;
    let moved = false;
    let pending_tap;
    function render(smooth) {
        layer.classList.toggle('is_zooming', smooth === 'zoom');
        layer.classList.toggle('is_settling', smooth === 'settle');
        layer.style.transform = `translate(${pan_x}px, ${pan_y}px) scale(${zoom})`;
    }
    function screen() {
        return { x: document.documentElement.clientWidth, y: window.innerHeight };
    }
    function bounds() {
        const image = layer.querySelector('img')?.getBoundingClientRect();
        const moving = layer.getBoundingClientRect();
        const home = viewport.getBoundingClientRect();
        const size = screen();
        if (!image?.width) return { x: [0, 0], y: [0, 0] };
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
    const clamp = (value, [low, high]) => Math.min(high, Math.max(low, value));
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
            const distance = speed * SLIDE;
            const most = size[axis] * MAX_SLIDE;
            return Math.max(-most, Math.min(most, distance));
        };
        const next_x = clamp(pan_x + slide(velocity.x, 'x'), range.x);
        const next_y = clamp(pan_y + slide(velocity.y, 'y'), range.y);
        if (Math.abs(next_x - pan_x) < 0.5 && Math.abs(next_y - pan_y) < 0.5) return;
        pan_x = next_x;
        pan_y = next_y;
        render('settle');
    }
    function wheel(event) {
        if (drag || !event.deltaY) return;
        event.preventDefault();
        const delta = event.deltaMode === 0 ? event.deltaY : event.deltaY * 16;
        zoom_at(event.clientX, event.clientY, delta, event.ctrlKey ? 150 : 600);
    }
    function zoom_at(client_x, client_y, delta, sensitivity = 600) {
        const next_zoom = Math.min(
            MAX_ZOOM,
            Math.max(1, zoom * Math.exp(-Math.max(-100, Math.min(100, delta)) / sensitivity)),
        );
        if (next_zoom === zoom) return;
        if (next_zoom === 1) {
            reset_zoom();
            return;
        }
        zoom_around(next_zoom, client_x, client_y);
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
    function toggle_zoom(client_x, client_y) {
        if (zoom > 1) reset_zoom();
        else zoom_around(TAP_ZOOM, client_x, client_y);
    }
    const touches = new Map();
    let pinch;
    function pinch_frame() {
        const [a, b] = [...touches.values()];
        return { distance: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }
    function start_pinch() {
        const bounds = viewport.getBoundingClientRect();
        const { distance, x, y } = pinch_frame();
        drag = undefined;
        pending_tap = undefined;
        moved = true;
        pinch = {
            distance,
            zoom,
            point_x: (x - bounds.left - pan_x) / zoom,
            point_y: (y - bounds.top - pan_y) / zoom,
        };
    }
    function move_pinch() {
        const bounds = viewport.getBoundingClientRect();
        const { distance, x, y } = pinch_frame();
        zoom = Math.min(MAX_ZOOM, Math.max(1, (pinch.zoom * distance) / pinch.distance));
        pan_x = x - bounds.left - pinch.point_x * zoom;
        pan_y = y - bounds.top - pinch.point_y * zoom;
        render();
    }
    function start_drag(id, x, y) {
        drag = { id, x, y, left: pan_x, top: pan_y, range: bounds(), trail: [] };
    }
    function pointerdown(event) {
        if (event.pointerType === 'touch') {
            touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
            if (touches.size === 2) {
                start_pinch();
                return;
            }
        }
        moved = false;
        if (!event.isPrimary || event.button !== 0) return;
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    }
    function pointermove(event) {
        if (touches.has(event.pointerId)) {
            touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
            if (pinch && touches.size === 2) {
                move_pinch();
                return;
            }
        }
        if (drag?.id !== event.pointerId) return;
        if (!moved) {
            if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 5) return;
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
            viewport.classList.add('cursor-grabbing');
        }
        const size = screen();
        pan_x = rubber(drag.left + event.clientX - drag.x, drag.range.x, size.x);
        pan_y = rubber(drag.top + event.clientY - drag.y, drag.range.y, size.y);
        render();
        drag.trail.push({ x: event.clientX, y: event.clientY, time: event.timeStamp });
        if (drag.trail.length > 6) drag.trail.shift();
    }
    function release_velocity(event) {
        const recent = drag.trail?.filter((point) => event.timeStamp - point.time < 100) ?? [];
        if (event.type !== 'pointerup' || recent.length < 2) return { x: 0, y: 0 };
        const first = recent[0];
        const last = recent.at(-1);
        const time = Math.max(last.time - first.time, 16);
        return { x: (last.x - first.x) / time, y: (last.y - first.y) / time };
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
        viewport.classList.remove('cursor-grabbing');
    }
    function click(event) {
        if (!event.detail) return;
        if (moved) {
            moved = false;
            return;
        }
        if (!event.target.closest('img')) return;
        const x = event.clientX;
        const y = event.clientY;
        const time = performance.now();
        if (
            pending_tap &&
            time - pending_tap.time <= 300 &&
            Math.hypot(x - pending_tap.x, y - pending_tap.y) <= 28
        ) {
            pending_tap = undefined;
            toggle_zoom(x, y);
            return;
        }
        pending_tap = { x, y, time };
    }
    function keydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const box = viewport.getBoundingClientRect();
            toggle_zoom(box.left + box.width / 2, box.top + box.height / 2);
            return;
        }
        const directions = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
        const direction = directions[event.key];
        if (!direction || drag) return;
        event.preventDefault();
        const range = bounds();
        pan_x = clamp(pan_x + direction[0] * 40, range.x);
        pan_y = clamp(pan_y + direction[1] * 40, range.y);
        render('zoom');
    }
    const listeners = new AbortController();
    reset_before_close.set(viewport, () => {
        viewport.inert = true;
        reset_zoom();
        const transition = layer
            .getAnimations()
            .find((animation) => animation.transitionProperty === 'transform');
        return transition?.finished.catch(() => {});
    });
    const options = { signal: listeners.signal };
    viewport.addEventListener('wheel', wheel, { ...options, passive: false });
    viewport.addEventListener('pointerdown', pointerdown, options);
    viewport.addEventListener('pointermove', pointermove, options);
    viewport.addEventListener(
        'pointerleave',
        (event) => {
            if (!moved) end_drag(event);
        },
        options,
    );
    viewport.addEventListener('lostpointercapture', end_drag, options);
    viewport.addEventListener('pointerup', end_drag, options);
    viewport.addEventListener('pointercancel', end_drag, options);
    viewport.addEventListener('keydown', keydown, options);
    viewport.addEventListener('click', click, { ...options, capture: true });
    window.addEventListener('resize', () => settle(), options);
    return {
        destroy() {
            listeners.abort();
            reset_before_close.delete(viewport);
        },
    };
}
