import { cubicOut } from 'svelte/easing';
import { Tween } from 'svelte/motion';
import { reduced_motion, token_ms } from '$lib/motion/timing.js';

const VELOCITY_SMOOTHING_MS = 24;
const GLIDE_DECAY_MS = 65;
const EDGE_ZONE = 76;
const GLIDE_REACH = 150;
const GLIDE_MAX = 120;
const GLIDE_IDLE_MS = 120;
const STRETCH_GAIN = 17;
const STRETCH_MAX = 10;
const STRETCH_IDLE_MS = 70;

const star_edges = new WeakMap();
const position_setters = new WeakMap();

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function resist_end(value, edge, direction, start, max_zone) {
    const zone = clamp((start - edge) * direction, 0, max_zone);
    const distance = (value - edge) * direction;
    if (!zone || distance >= zone) return value;
    const progress = clamp((distance + zone / 2) / (1.5 * zone), 0, 1);
    return edge + direction * zone * progress ** 2 * (1.5 - progress / 2);
}

function resting_position({ min, max, obstacles, center }, glide) {
    const gaps = [];
    let start = min;
    for (const [left, right] of obstacles) {
        if (start <= left && left >= min && start <= max) gaps.push([start, Math.min(left, max)]);
        start = Math.max(start, right);
    }
    if (start <= max) gaps.push([start, max]);
    const nearest = gaps.reduce((best, [left, right]) => {
        const distance = Math.abs(center - clamp(center, left, right));
        return !best || distance < best.distance ? { left, right, distance } : best;
    }, undefined);
    return nearest && clamp(center + glide, nearest.left, nearest.right);
}

export function star_drag(options) {
    let positions = $state([undefined, undefined]);
    let drag = $state();
    let stretch_index = $state();
    const tip_stretch = new Tween(0, { easing: cubicOut });
    const relax = () => tip_stretch.set(0, { duration: token_ms('--duration-press') });
    let stretch_idle;

    $effect(() => () => clearTimeout(stretch_idle));

    function measure(star, index) {
        position_setters.set(star, (position) => (positions[index] = position));
        const observer = new ResizeObserver(() => {
            const bounds = star.getBoundingClientRect();
            if (!bounds.width) return;
            const center = bounds.left + bounds.width / 2;
            let left = 0;
            let right = 0;
            for (const cutout of star.querySelectorAll('.cutout')) {
                const rect = cutout.getBoundingClientRect();
                const stroke = parseFloat(getComputedStyle(cutout).strokeWidth) / 2;
                left = Math.max(left, center - rect.left + stroke);
                right = Math.max(right, rect.right - center + stroke);
            }
            star_edges.set(star, { left, right });
            star.style.setProperty('--star-left', `${left}px`);
            star.style.setProperty('--star-right', `${right}px`);
        });
        observer.observe(star);
        return {
            destroy() {
                observer.disconnect();
                position_setters.delete(star);
            },
        };
    }

    function drag_bounds(star, destinations) {
        const track = star.parentElement.getBoundingClientRect();
        const bounds = star.getBoundingClientRect();
        const half = bounds.width / 2;
        const end_gap = parseFloat(getComputedStyle(star).getPropertyValue('--star-end-gap'));
        const edges = star_edges.get(star) ?? { left: half, right: half };
        const max = track.width - Math.min(edges.right + end_gap, track.width / 2);
        const min = Math.min(
            max,
            Math.max(Math.min(edges.left + end_gap, track.width / 2), options.start_inset),
        );
        const obstacles = [...star.parentElement.querySelectorAll(':scope > .star')]
            .filter((other) => other !== star)
            .map((other) => {
                const rect = other.getBoundingClientRect();
                const center = destinations?.get(other) ?? rect.left - track.left + rect.width / 2;
                const other_edges = star_edges.get(other) ?? { left: rect.width / 2, right: rect.width / 2 };
                return [
                    center - other_edges.left - edges.right,
                    center + other_edges.right + edges.left,
                    other,
                ];
            })
            .sort(([a], [b]) => a - b);
        return { track, min, max, obstacles, center: bounds.left - track.left + half };
    }

    function push_underlying(bounds) {
        const destinations = new Map();
        for (const [left, right, other] of bounds.obstacles) {
            if (bounds.center <= left || bounds.center >= right) continue;
            const position = resting_position(drag_bounds(other, destinations), 0);
            if (position === undefined) return false;
            destinations.set(other, position);
        }
        for (const [star, position] of destinations) {
            position_setters.get(star)?.((position / bounds.track.width) * 100);
        }
        return destinations.size > 0;
    }

    function start(event, index) {
        if (!event.isPrimary || event.button !== 0) return;
        clearTimeout(stretch_idle);
        tip_stretch.set(0, { duration: 0 });
        stretch_index = index;
        const star = event.currentTarget;
        const bounds = star.getBoundingClientRect();
        drag = {
            index,
            id: event.pointerId,
            offset: event.clientX - bounds.left - bounds.width / 2,
            start_center: bounds.left - star.parentElement.getBoundingClientRect().left + bounds.width / 2,
            last_time: event.timeStamp,
            velocity: 0,
            initial_position: positions[index],
            moved: false,
            stretch: !reduced_motion(),
        };
        star.setPointerCapture(event.pointerId);
    }

    function move(event, index) {
        if (drag?.id !== event.pointerId) return;
        const elapsed = event.timeStamp - drag.last_time;
        drag.last_time = event.timeStamp;
        const { track, min, max, center: previous } = drag_bounds(event.currentTarget);
        if (!track.width) return;
        const target = event.clientX - track.left - drag.offset;
        const zone = Math.min(EDGE_ZONE, (max - min) / 2);
        const near_start = resist_end(target, min, 1, drag.start_center, zone);
        const center = clamp(resist_end(near_start, max, -1, drag.start_center, zone), min, max);
        if (elapsed > 0) {
            const speed = (center - previous) / elapsed;
            drag.velocity += (speed - drag.velocity) * (1 - Math.exp(-elapsed / VELOCITY_SMOOTHING_MS));
            if (drag.stretch) {
                tip_stretch.set(clamp(-speed * STRETCH_GAIN, -STRETCH_MAX, STRETCH_MAX), { duration: 0 });
                clearTimeout(stretch_idle);
                stretch_idle = setTimeout(relax, STRETCH_IDLE_MS);
            }
        }
        drag.moved = true;
        positions[index] = (center / track.width) * 100;
    }

    function end(event) {
        if (drag?.id !== event.pointerId) return;
        clearTimeout(stretch_idle);
        relax();
        const { index, velocity, last_time, initial_position, moved } = drag;
        drag = undefined;
        if (!moved) return;
        const bounds = drag_bounds(event.currentTarget);
        const released = event.type === 'pointerup';
        if (released && bounds.track.width && push_underlying(bounds)) return;
        const idle = Math.max(0, event.timeStamp - last_time);
        const can_glide = released && idle <= GLIDE_IDLE_MS && !reduced_motion();
        const glide = can_glide
            ? clamp(velocity * GLIDE_REACH * Math.exp(-idle / GLIDE_DECAY_MS), -GLIDE_MAX, GLIDE_MAX)
            : 0;
        const position = resting_position(bounds, Math.abs(glide) >= 1 ? glide : 0);
        positions[index] =
            position === undefined || !bounds.track.width
                ? initial_position
                : (position / bounds.track.width) * 100;
    }

    return {
        get positions() {
            return positions;
        },
        get drag() {
            return drag;
        },
        get stretch_index() {
            return stretch_index;
        },
        tip_stretch,
        measure,
        start,
        move,
        end,
    };
}
