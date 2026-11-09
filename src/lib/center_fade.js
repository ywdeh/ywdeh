// Fades elements the farther they are from the middle of the screen, easing after the scroll instead of
// snapping with every wheel step. Sets --fade (0.25 … 1) on each element; CSS decides what to fade with it.
// Elements marked active (in color: hovered, focused or crossing the middle) go to full. One shared scroll
// listener and one frame loop serve every element, and the loop stops as soon as everything has settled.

const MIN = 0.25; // how faint the farthest elements get
const PLATEAU = 0.15; // this much of the half-screen around the middle stays at full
const REACH = 1.1; // past this many half-screens away it's fully faded
const SMOOTHING = 7; // per second; lower = lazier follow

const elements = new Map(); // element → current fade
const active = new WeakSet();
let frame;
let last;

function target(element) {
    if (active.has(element)) return 1;
    const rect = element.getBoundingClientRect();
    const half = innerHeight / 2;
    const distance = Math.abs(rect.top + rect.height / 2 - half) / half;
    const t = Math.min(1, Math.max(0, (distance - PLATEAU) / (REACH - PLATEAU)));
    const eased = t * t * (3 - 2 * t); // smoothstep: eases out of the middle and into the edges
    return 1 - (1 - MIN) * eased;
}

function step(now) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dt = Math.min(now - (last ?? now), 50) / 1000;
    last = now;
    const blend = reduce ? 1 : 1 - Math.exp(-dt * SMOOTHING);
    let moving = false;
    for (const [element, current] of elements) {
        const goal = target(element);
        let next = current + (goal - current) * blend;
        if (Math.abs(goal - next) < 0.002) next = goal;
        else moving = true;
        if (next !== current) {
            elements.set(element, next);
            element.style.setProperty('--fade', next.toFixed(3));
        }
    }
    frame = moving ? requestAnimationFrame(step) : undefined;
}

function wake() {
    if (frame) return;
    last = undefined;
    frame = requestAnimationFrame(step);
}

// scroll events don't bubble, so listen in the capture phase to hear any scroller on the page
function listen() {
    document.addEventListener('scroll', wake, { capture: true, passive: true });
    addEventListener('resize', wake, { passive: true });
}
function unlisten() {
    document.removeEventListener('scroll', wake, { capture: true });
    removeEventListener('resize', wake);
    cancelAnimationFrame(frame);
    frame = undefined;
}

function set_active(element, is_active) {
    if (is_active) active.add(element);
    else active.delete(element);
}

// Svelte action: use:center_fade={{ enabled, active }}
//   enabled: false leaves the element alone; active: true holds it at full
export function center_fade(element, { enabled = true, active: is_active = false } = {}) {
    if (!enabled) return;
    if (!elements.size) listen();
    set_active(element, is_active);
    // start where it should be, so nothing fades in on page load
    const start = target(element);
    elements.set(element, start);
    element.style.setProperty('--fade', start.toFixed(3));
    return {
        update({ active: next = false } = {}) {
            set_active(element, next);
            wake();
        },
        destroy() {
            elements.delete(element);
            if (!elements.size) unlisten();
        },
    };
}
