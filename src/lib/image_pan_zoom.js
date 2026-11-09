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

    function render(smooth = false) {
        layer.classList.toggle('is_zooming', smooth);
        layer.style.transform = `translate(${pan_x}px, ${pan_y}px) scale(${zoom})`;
    }

    function wheel(event) {
        if (drag || !event.deltaY) return;
        event.preventDefault();

        const delta = event.deltaMode === 0 ? event.deltaY : event.deltaY * 16;
        zoom_at(event.clientX, event.clientY, delta);
    }

    function zoom_at(client_x, client_y, delta) {
        const next_zoom = Math.min(4, Math.max(1, zoom * Math.exp(-Math.max(-100, Math.min(100, delta)) / 600)));
        if (next_zoom === zoom) return;
        if (next_zoom === 1) {
            reset_zoom();
            return;
        }

        const bounds = viewport.getBoundingClientRect();
        const x = client_x - bounds.left;
        const y = client_y - bounds.top;
        const ratio = next_zoom / zoom;
        pan_x = x - (x - pan_x) * ratio;
        pan_y = y - (y - pan_y) * ratio;
        zoom = next_zoom;
        render(true);
    }

    function reset_zoom() {
        zoom = 1;
        pan_x = 0;
        pan_y = 0;
        render(true);
    }

    function toggle_zoom(client_x, client_y) {
        if (zoom > 1) {
            reset_zoom();
            return;
        }

        const bounds = viewport.getBoundingClientRect();
        const image_x = client_x - bounds.left - pan_x;
        const image_y = client_y - bounds.top - pan_y;
        zoom = 1.5;
        pan_x = bounds.width / 2 - image_x * zoom;
        pan_y = bounds.height / 2 - image_y * zoom;
        render(true);
    }

    function pointerdown(event) {
        moved = false;
        if (!event.isPrimary || event.button !== 0) return;
        drag = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
        };
    }

    function pointermove(event) {
        if (drag?.id !== event.pointerId) return;
        const x = event.clientX - drag.x;
        const y = event.clientY - drag.y;
        if (!moved && Math.hypot(x, y) < 5) return;
        if (!moved) {
            pending_tap = undefined;
            const transform = getComputedStyle(layer).transform;
            const current = new DOMMatrix(transform === 'none' ? undefined : transform);
            drag.left = current.e;
            drag.top = current.f;
            zoom = current.a;
            moved = true;
            viewport.setPointerCapture(event.pointerId);
            viewport.classList.add('cursor-grabbing');
        }
        pan_x = drag.left + x;
        pan_y = drag.top + y;
        render();
    }

    function end_drag(event) {
        if (drag?.id !== event.pointerId) return;
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
        if (pending_tap && time - pending_tap.time <= 300 && Math.hypot(x - pending_tap.x, y - pending_tap.y) <= 28) {
            pending_tap = undefined;
            toggle_zoom(x, y);
            return;
        }

        pending_tap = { x, y, time };
    }

    function keydown(event) {
        const directions = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
        const direction = directions[event.key];
        if (!direction || drag) return;
        event.preventDefault();
        pan_x += direction[0] * 40;
        pan_y += direction[1] * 40;
        render();
    }

    const listeners = new AbortController();
    reset_before_close.set(viewport, () => {
        viewport.inert = true;
        reset_zoom();
        const transition = layer.getAnimations().find((animation) => animation.transitionProperty === 'transform');
        return transition?.finished.catch(() => {});
    });
    const options = { signal: listeners.signal };
    viewport.addEventListener('wheel', wheel, { ...options, passive: false });
    viewport.addEventListener('pointerdown', pointerdown, options);
    viewport.addEventListener('pointermove', pointermove, options);
    viewport.addEventListener('pointerleave', (event) => {
        if (!moved) end_drag(event);
    }, options);
    viewport.addEventListener('lostpointercapture', end_drag, options);
    viewport.addEventListener('pointerup', end_drag, options);
    viewport.addEventListener('pointercancel', end_drag, options);
    viewport.addEventListener('keydown', keydown, options);
    viewport.addEventListener('click', click, { ...options, capture: true });
    return {
        destroy() {
            listeners.abort();
            reset_before_close.delete(viewport);
        },
    };
}
