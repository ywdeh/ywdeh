<script module>
    // shared by every group of stars, since two groups can share one track (the footer has two): each
    // star's ink reach either side of its center, and a way to move it from another group
    const star_edges = new WeakMap();
    const set_star_position = new WeakMap();
</script>

<script>
    import { cubicOut } from "svelte/easing";
    import { Tween } from "svelte/motion";
    import { reduced_motion } from "$lib/motion.js";
    import { ornament_width, ornament_height } from "$lib/project_ornaments.js";

    // hand-drawn stars sitting on a divider line; they can be dragged along it and glide when let go
    // star_position: where they start (any CSS length along the track)
    // single_star: only the large star, not the small one beside it
    // large_transform / small_transform: a skew or squash so each divider's stars look hand-placed
    // line_drawings: draw these frames instead of the stars (a project card's ornament)
    // start_inset: px at the start of the track the star must stay clear of
    let {
        star_position,
        single_star = false,
        large_transform = 'translate(0 12) skewX(-8) translate(0 -12)',
        small_transform = 'translate(8 12) skewX(12) translate(0 -12)',
        line_drawings,
        start_inset = 0,
    } = $props();
    const star_id = $props.id();
    let positions = $state([undefined, undefined]);
    const shapes = [
        'M11 1C12.5 1 12.6 7.5 15.2 8.8C17 10.2 24.2 10.7 24.2 12C24.2 13.1 17.6 12.7 16.2 15C14.7 17.4 16.1 22.3 14.8 23C13.4 23.7 12.1 17 10 15.4C8.1 13.9 1.4 13.1 1.4 12C1.4 10.9 7.2 10.3 8.8 8C10.4 5.8 9.9 1.2 11 1Z',
        'M33.6 4.4C34.7 4.1 34 8.2 35.5 9.6C36.6 10.5 39.1 10.5 39 12C38.8 12.8 35.5 12.3 34.5 13.6C33.4 15 33.8 18.4 32.8 18.3C31.8 18.3 32.1 14.8 30.7 13.6C29.4 12.4 26.8 12.3 27 12C27.1 11.1 30.6 10.4 31.5 9C32.5 7.6 32.6 4.6 33.6 4.4Z',
    ];
    let drag = $state();
    let stretch_index = $state();
    const tip_stretch = new Tween(0, { duration: 140, easing: cubicOut });
    let stretch_idle;
    $effect(() => () => {
        clearTimeout(stretch_idle);
    });

    // the same star drawn a second time by hand: every point shifted a touch, as a redraw would land.
    // The two drawings take turns like the frames of the :) in the header (a "line boil"). Seeded, so
    // it's the same redraw on every visit and on the server.
    function redraw(d, seed) {
        let n = seed;
        const random = () => (n = (n * 9301 + 49297) % 233280) / 233280;
        return d.replace(/-?\d*\.?\d+/g, (number) => (parseFloat(number) + (random() - 0.5) * 1.3).toFixed(2));
    }

    // while dragged, the star's trailing tips stretch back with the speed, as if it were pulled along
    function stretch_tips(drawing, amount) {
        if (Math.abs(amount) < 0.01) return drawing;
        const pairs = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g;
        const points = Array.from(drawing.matchAll(pairs), ([, x, y]) => [Number(x), Number(y)]);
        const xs = points.map(([x]) => x);
        const ys = points.map(([, y]) => y);
        const left = Math.min(...xs);
        const right = Math.max(...xs);
        const top = Math.min(...ys);
        const bottom = Math.max(...ys);
        const tip = amount < 0 ? left : right;
        const tip_width = (right - left) * 0.35;
        const tip_height = (bottom - top) * 0.25;
        return drawing.replace(pairs, (pair, x, y) => {
            const px = Number(x);
            const py = Number(y);
            const side = Math.max(0, 1 - Math.abs(px - tip) / tip_width) * Math.max(0, 1 - Math.abs(py - (line_drawings ? 20 : 12)) / (line_drawings ? 12 : 7));
            const vertical = Math.max(0, 1 - Math.min(py - top, bottom - py) / tip_height);
            const weight = Math.max(side, vertical * 0.8);
            return weight ? `${(px + amount * weight).toFixed(2)} ${y}` : pair;
        });
    }

    function measure_star(star, index) {
        set_star_position.set(star, (position) => { positions[index] = position; });
        const observer = new ResizeObserver(() => {
            const bounds = star.getBoundingClientRect();
            if (!bounds.width) return;
            const center = bounds.left + bounds.width / 2;
            let left = 0;
            let right = 0;
            for (const cutout of star.querySelectorAll('.drawing > .cutout')) {
                const rect = cutout.getBoundingClientRect();
                const stroke = parseFloat(getComputedStyle(cutout).strokeWidth) / 2;
                left = Math.max(left, center - rect.left + stroke);
                right = Math.max(right, rect.right - center + stroke);
            }
            star_edges.set(star, { left, right });
            star.style.setProperty('--star-left', left + 'px');
            star.style.setProperty('--star-right', right + 'px');
        });
        observer.observe(star);
        return { destroy: () => {
            observer.disconnect();
            set_star_position.delete(star);
        } };
    }

    function drag_bounds(star, destinations) {
        const track = star.parentElement.getBoundingClientRect();
        const bounds = star.getBoundingClientRect();
        const half_star = bounds.width / 2;
        const end_gap = parseFloat(getComputedStyle(star).getPropertyValue('--star-end-gap'));
        const edges = star_edges.get(star) ?? { left: half_star, right: half_star };
        const max = track.width - Math.min(edges.right + end_gap, track.width / 2);
        const min = Math.min(max, Math.max(Math.min(edges.left + end_gap, track.width / 2), start_inset));
        const obstacles = [...star.parentElement.querySelectorAll(':scope > .divider_star')]
            .filter((other) => other !== star)
            .map((other) => {
                const rect = other.getBoundingClientRect();
                const center = destinations?.get(other) ?? rect.left - track.left + rect.width / 2;
                const other_edges = star_edges.get(other) ?? { left: rect.width / 2, right: rect.width / 2 };
                return [center - other_edges.left - edges.right, center + other_edges.right + edges.left, other];
            })
            .sort(([a], [b]) => a - b);
        return { track, min, max, obstacles,
            center: bounds.left - track.left + half_star };
    }

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    function resist_end(value, edge, direction, start, max_zone) {
        const zone = clamp((start - edge) * direction, 0, max_zone);
        const distance = (value - edge) * direction;
        if (!zone || distance >= zone) return value;
        // at the start of the zone the star tracks at full speed, then slows to zero at the stop
        const progress = clamp((distance + zone / 2) / (1.5 * zone), 0, 1);
        return edge + direction * zone * progress ** 2 * (1.5 - progress / 2);
    }

    function resting_position({ min, max, obstacles, center }, glide) {
        // keeps momentum on the current side of a neighbour; released mid-crossing, it settles into the
        // closest open stretch instead of staying hidden behind it
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

    function move_underlying_stars(bounds) {
        const destinations = new Map();
        for (const [left, right, other] of bounds.obstacles) {
            if (bounds.center <= left || bounds.center >= right) continue;
            const position = resting_position(drag_bounds(other, destinations), 0);
            if (position === undefined) return false;
            destinations.set(other, position);
        }
        for (const [star, position] of destinations) {
            set_star_position.get(star)?.(position / bounds.track.width * 100);
        }
        return destinations.size > 0;
    }

    function start_drag(event, index) {
        if (!event.isPrimary || event.button !== 0) return;
        clearTimeout(stretch_idle);
        tip_stretch.set(0, { duration: 0 });
        stretch_index = index;
        const button = event.currentTarget;
        const bounds = button.getBoundingClientRect();
        const start_center = bounds.left - button.parentElement.getBoundingClientRect().left + bounds.width / 2;
        drag = { index, id: event.pointerId, offset: event.clientX - bounds.left - bounds.width / 2,
            start_center, last_time: event.timeStamp, velocity: 0,
            initial_position: positions[index], moved: false,
            stretch: !reduced_motion() };
        button.setPointerCapture(event.pointerId);
    }

    function move_drag(event, index) {
        if (drag?.id !== event.pointerId) return;
        const star = event.currentTarget;
        const elapsed = event.timeStamp - drag.last_time;
        drag.last_time = event.timeStamp;
        const { track, min, max, center: previous } = drag_bounds(star);
        if (!track.width) return;
        const target = event.clientX - track.left - drag.offset;
        const zone = Math.min(76, (max - min) / 2);
        const near_start = resist_end(target, min, 1, drag.start_center, zone);
        const center = clamp(resist_end(near_start, max, -1, drag.start_center, zone), min, max);
        if (elapsed > 0) {
            const step = center - previous;
            const speed = step / elapsed;
            drag.velocity += (speed - drag.velocity) * (1 - Math.exp(-elapsed / 24));
            if (drag.stretch) {
                tip_stretch.set(clamp(-speed * 11, -6.5, 6.5), { duration: 0 });
                clearTimeout(stretch_idle);
                stretch_idle = setTimeout(() => tip_stretch.set(0), 70);
            }
        }
        drag.moved = true;
        positions[index] = center / track.width * 100;
    }

    function end_drag(event) {
        if (drag?.id !== event.pointerId) return;
        clearTimeout(stretch_idle);
        tip_stretch.set(0);
        const { index, velocity, last_time, initial_position, moved } = drag;
        drag = undefined;
        if (!moved) return;
        const bounds = drag_bounds(event.currentTarget);
        if (event.type === 'pointerup' && bounds.track.width && move_underlying_stars(bounds)) return;
        const idle = Math.max(0, event.timeStamp - last_time);
        const can_glide = event.type === 'pointerup' && idle <= 120 && !reduced_motion();
        const glide = can_glide ? clamp(velocity * 150 * Math.exp(-idle / 65), -120, 120) : 0;
        const position = resting_position(bounds, Math.abs(glide) >= 1 ? glide : 0);
        positions[index] = position === undefined || !bounds.track.width ? initial_position : position / bounds.track.width * 100;
    }
</script>

{#each (single_star ? shapes.slice(0, 1) : shapes) as shape, index}
    {@const shape_id = star_id + '-' + index}
    {@const transform = line_drawings ? undefined : index === 0 ? large_transform : small_transform}
    {@const initial_position = single_star ? star_position : index === 0
        ? 'calc(' + star_position + ' - clamp(13px, 1.6vw, 20px))'
        : 'calc(' + star_position + ' + clamp(30px, 3.4vw, 45px))'}
    <div class="divider_star" class:small={index === 1} class:dragging={drag?.index === index}
        use:measure_star={index}
        style:--star-position={positions[index] === undefined ? initial_position : positions[index] + '%'}
        style:--star-safe-start={start_inset + 'px'}
        style:--star-width={line_drawings ? ornament_width + 'px' : undefined}
        style:--ornament-outer-stroke={line_drawings ? '2px' : '0px'}
        aria-hidden="true" onpointerdown={(event) => start_drag(event, index)}
        onpointermove={(event) => move_drag(event, index)} onlostpointercapture={end_drag}
        onpointerup={end_drag} onpointercancel={end_drag}>
        <svg viewBox={line_drawings ? `0 0 ${ornament_width} ${ornament_height}` : index === 0 ? '0 0 26 24' : '27 0 24 24'}>
            {#each line_drawings ?? [shape, redraw(shape, index + 1)] as drawing, frame}
                {@const frame_id = shape_id + '-' + frame}
                {@const outline = stretch_index === index ? stretch_tips(drawing, tip_stretch.current) : drawing}
                <g class="drawing">
                    <defs>
                        <path id={frame_id} d={outline} {transform} />
                        <clipPath id={frame_id + '-clip'}><use href={'#' + frame_id} /></clipPath>
                    </defs>
                    <path class="cutout" d={outline} {transform} fill="var(--color-neutral-900)" stroke="var(--color-neutral-900)"
                        vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" />
                    {#if line_drawings}
                        <!-- open line drawings: stroked as they are -->
                        <g class="ink" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d={outline} vector-effect="non-scaling-stroke" />
                        </g>
                    {:else}
                        <!-- stars: a stroke clipped to the inside of the shape, so it reads as an inner outline -->
                        <g class="ink" clip-path={'url(#' + frame_id + '-clip)'} fill="none" stroke="currentColor"
                            stroke-width="4" stroke-linejoin="round">
                            <path d={outline} {transform} vector-effect="non-scaling-stroke" />
                        </g>
                    {/if}
                </g>
            {/each}
        </svg>
    </div>
{/each}

<style>
    .divider_star path { vector-effect: non-scaling-stroke; }
    .cutout { stroke-width: calc(var(--ornament-gap) * 2 + var(--ornament-outer-stroke)); }

    .divider_star {
        --star-ink-opacity: var(--line-ink);
        --star-width: clamp(40px, 4.7vw, 60px);
        --star-end-gap: 12px;
        --star-start: min(calc(100% - var(--star-end)), max(var(--star-safe-start, 0px), min(50%, calc(var(--star-left, var(--star-width) / 2) + var(--star-end-gap)))));
        --star-end: min(50%, calc(var(--star-right, var(--star-width) / 2) + var(--star-end-gap)));
        position: absolute;
        z-index: 0;
        top: 50%;
        left: clamp(var(--star-start), var(--star-position), calc(100% - var(--star-end)));
        width: var(--star-width);
        height: auto;
        translate: -50% -50%;
        color: var(--project-tint-color, var(--color-mauve-100));
        overflow: visible;
        cursor: grab;
        touch-action: pan-y;
        user-select: none;
    }

    @media (hover: hover) {
        .divider_star:hover { --star-ink-opacity: 0.14; }
    }
    .ink { stroke-opacity: var(--star-ink-opacity); }
    .divider_star:not(.small) { z-index: 1; }
    .divider_star.dragging { z-index: 2; cursor: grabbing; }
    @media (prefers-reduced-motion: no-preference) {
        .divider_star:not(.dragging) { transition: left 420ms ease-out, z-index 0s 420ms; }
        .ink { transition: stroke-opacity 180ms ease-out; }
        /* the two drawings take turns, each held 390ms: the timing of the :) in the header (two drawings,
           13 frames of 30ms each); the small star is out of step with the large one */
        .drawing { animation: star_boil 780ms step-end infinite; }
        .drawing + .drawing { animation-delay: -390ms; }
        .divider_star.small .drawing { animation-delay: -210ms; }
        .divider_star.small .drawing + .drawing { animation-delay: -600ms; }
    }
    /* still: only the first drawing */
    .drawing + .drawing { visibility: hidden; }
    .divider_star > svg { position: relative; display: block; width: 100%; overflow: visible; }
    .divider_star.small { --star-width: clamp(34px, 4.3vw, 55px); }

    @keyframes star_boil {
        0% { visibility: visible; }
        50% { visibility: hidden; }
    }

</style>
