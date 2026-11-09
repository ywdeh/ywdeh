<script>
    import { card_release } from '$lib/card_release.js';
    import TrailImage from "./trail_image.svelte";
    import CardBadge from "./card_badge.svelte";
    import { get_average_color } from '$lib/image_average_color.js';
    import { center_fade } from '$lib/center_fade.js';
    let { src, thumbnail = src, alt, title, client, left = false, image_only = false, width, height, onclick, preload } = $props();

    let card_element = $state();
    let figure_element = $state();
    let is_centered = $state(false);
    let is_hovered = $state(false);
    let is_focused = $state(false);

    let show_full = $derived(is_centered || is_hovered || is_focused);

    // wide images rest on their left edge and pan toward whichever side the pointer is on
    // a critically damped spring chases the target: it speeds up gently and settles gently (ease-in-out),
    // and since it keeps its velocity, pointer moves mid-flight bend the motion instead of restarting it
    const PAN_REST = 0;
    const PAN_STIFFNESS = 12; // rad/s; higher = snappier, ~0.5s to settle at 12
    let pan_x = $state(PAN_REST);
    let pan_target = PAN_REST;
    let pan_velocity = 0;
    let pan_frame;
    let last_frame;
    // panning waits until the hover outline has finished growing (its 140ms transition)
    const OUTLINE_MS = 140;
    let pan_ready = true;
    let pan_delay;

    function stop_pan_loop() {
        cancelAnimationFrame(pan_frame);
        pan_frame = undefined;
        pan_velocity = 0;
    }

    function hold_pan_for_outline() {
        clearTimeout(pan_delay);
        // freeze where it is (e.g. mid way back to center) instead of letting the old loop chase the new pointer
        stop_pan_loop();
        pan_ready = false;
        pan_delay = setTimeout(() => {
            pan_ready = true;
            pan_to(pan_target);
        }, OUTLINE_MS);
    }

    function release_pan() {
        clearTimeout(pan_delay);
        pan_ready = true;
    }

    function pan_to(target) {
        pan_target = target;
        if (!pan_ready) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
            pan_x = target;
            return;
        }
        if (!pan_frame) {
            last_frame = undefined;
            pan_frame = requestAnimationFrame(step_pan);
        }
    }

    function step_pan(now) {
        // the first frame only records its timestamp: mixing it with an event-time clock
        // could give a negative or oversized step, which shows up as a jump
        if (last_frame === undefined) {
            last_frame = now;
            pan_frame = requestAnimationFrame(step_pan);
            return;
        }
        // time-based, so it feels the same at any refresh rate; the step is capped so a stalled
        // frame (busy tab) can't teleport the image
        const elapsed = Math.min(Math.max(now - last_frame, 0), 50) / 1000;
        last_frame = now;
        // small fixed substeps keep the spring stable whatever the frame length
        let x = pan_x;
        for (let left_time = elapsed; left_time > 0; left_time -= 0.004) {
            const dt = Math.min(0.004, left_time);
            const accel = PAN_STIFFNESS * PAN_STIFFNESS * (pan_target - x) - 2 * PAN_STIFFNESS * pan_velocity;
            pan_velocity += accel * dt;
            x += pan_velocity * dt;
        }
        // a fast direction change can carry it past the edge; past 0/100% would show empty space
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

    function follow_pointer(event) {
        if (!left || event.pointerType !== 'mouse') return;
        const bounds = event.currentTarget.getBoundingClientRect();
        // the outer 20% on each side shows that edge fully
        const x = (event.clientX - bounds.left) / bounds.width;
        pan_to(Math.min(100, Math.max(0, (x - 0.2) / 0.6 * 100)));
    }

    $effect(() => {
        if (!card_element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // a whole row crosses the middle of the screen together; delay each card by its place in
                // the row so they color in one after another, left to right
                stagger = column_in_row() * STAGGER_MS;
                is_centered = entry.isIntersecting;
            },
            {
                rootMargin: "-50% 0px -50% 0px",
                threshold: 0,
            }
        );
        observer.observe(card_element);
        return () => observer.disconnect();
    });

    const STAGGER_MS = 120;
    let stagger = $state(0);

    // how many cards sit to the left of this one in the same row (works for the card grid and gallery rows)
    function column_in_row() {
        const item = figure_element?.parentElement;
        if (!item?.parentElement) return 0;
        const { top, left } = item.getBoundingClientRect();
        let column = 0;
        for (const sibling of item.parentElement.children) {
            if (sibling === item) continue;
            const bounds = sibling.getBoundingClientRect();
            if (Math.abs(bounds.top - top) < 2 && bounds.left < left) column++;
        }
        return column;
    }

    function extract_color(image) {
        if (!figure_element) return;

        const run = () => {
            const color = get_average_color(image);
            if (color) {
                figure_element.style.setProperty("--live-img-avg", color);
            }
        };

        if (image.complete) {
            run();
        } else {
            image.addEventListener("load", run, { once: true });
        }
    }
</script>

<figure
    bind:this={figure_element}
    onmouseenter={() => {
        is_hovered = true;
        stagger = 0; // hover reacts right away
        preload?.();
        if (left && !matchMedia('(prefers-reduced-motion: reduce)').matches) hold_pan_for_outline();
    }}
    onmouseleave={() => {
        is_hovered = false;
        release_pan();
        pan_to(PAN_REST);
    }}
    onpointermove={follow_pointer}
    use:center_fade={{ enabled: image_only, active: show_full }}
    class:scroll_fade={image_only}
    class="has_badge group transition relative rounded-2xl">
    <button type="button"
        bind:this={card_element}
        use:card_release={'.card_preview'}
        onfocus={() => {
            is_focused = true;
            stagger = 0;
            preload?.();
        }}
        onblur={() => (is_focused = false)}
        onpointerdown={preload}
        {onclick}
        aria-label={image_only ? title + " — " + client : undefined}
        class="card_trigger transition flex flex-col gap-4 text-left w-full relative z-10">

        <div class="relative">
        <TrailImage class="card_preview rounded-xl overflow-hidden" src={show_full ? src : thumbnail}>
            <img
                onload={(e) => extract_color(e.currentTarget)}
                src={show_full ? src : thumbnail}
                loading={show_full && src !== thumbnail ? 'eager' : 'lazy'}
                decoding="async"
                {alt}
                class="transition-all bg-neutral-950/20 object-cover duration-400
                        saturate-0 sepia-10 group-hover:saturate-100 group-hover:sepia-0 group-focus-within:saturate-100 group-focus-within:sepia-0 w-full {image_only ? 'h-auto' : 'aspect-4/3'}"
                style:--stagger={stagger + 'ms'}
                {width} {height}
                style:aspect-ratio={image_only ? width / height : undefined}
                class:object-center={!left}
                class:pannable={left}
                style:object-position={left ? `${pan_x}% center` : undefined}
                class:saturate-100={is_centered}
                class:sepia-0={is_centered}
                draggable="false"
            />
        </TrailImage>
        <!-- gallery pictures zoom, everything else opens; the badge straddles the picture's bottom edge -->
        <CardBadge kind={image_only ? 'zoom' : 'open'} />
        </div>

        {#if image_only}
        <!-- gallery pictures just get a dim name: who it's for, or what it is for personal work -->
        <div class="card_caption">
            <p class="live-tint opacity-40 truncate">{client === 'personal' ? title : client}</p>
        </div>
        {:else}
        <!-- always one line: on a narrow card the title shortens with an ellipsis, the client stays whole -->
        <div class="card_caption flex justify-between gap-4">
            <h3 class="live-tint truncate">{title}</h3>
            <p class="live-tint opacity-40 whitespace-nowrap">{client}</p>
        </div>
        {/if}
    </button>
</figure>

<style>
    figure::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: inherit;
        background: oklch(from var(--live-img-avg, oklch(20.5% 0.004 325.6)) calc(l + 0.2) calc(c * 1.5) h / 12%);
        opacity: 0;
        transition: opacity 0.14s ease-in-out, inset 140ms var(--ease-out);
        pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
        figure::before, figure img, .live-tint { transition: none; }
    }

    figure:is(:hover, :focus-within)::before {
        opacity: 1;
        inset: -10px;
    }

    figure:has(> .card_trigger:is(:active, :global(.is_pressed)))::before { inset: -4px; }
    .card_trigger :global(.card_preview) { clip-path: inset(0 round var(--radius-xl)); }    .card_trigger:is(:active, :global(.is_pressed)) :global(.card_preview) { clip-path: inset(6px round var(--radius-xl)); }
    .card_trigger:is(:active, :global(.is_pressed)) img { padding: 6px; }
    .card_trigger:is(:active, :global(.is_pressed)) .card_caption { padding-inline: 6px; translate: 0 -6px; }

    @media (prefers-reduced-motion: no-preference) {
        .card_trigger :global(.card_preview) { transition: clip-path 140ms var(--ease-out); }
        /* the color-in (filter) waits --stagger so a row lights up card by card */
        .card_trigger img { transition: filter 400ms var(--stagger, 0ms), object-position 400ms, padding 140ms var(--ease-out); }
        /* panned by the frame loop, so object-position must not transition */
        .card_trigger img.pannable { transition: filter 400ms var(--stagger, 0ms), padding 140ms var(--ease-out); }
        .card_caption { transition: padding-inline 140ms var(--ease-out), translate 140ms var(--ease-out); }
    }

    /* gallery pictures fade the farther they are from the middle of the screen (--fade comes from center_fade.js) */
    figure.scroll_fade img { opacity: var(--fade, 1); }

    .live-tint {
        transition: color 0.14s;
    }

    figure:is(:hover, :focus-within) .live-tint {
        color: oklch(from var(--live-img-avg, oklch(70% 0.01 325.6)) clamp(0.85, l, 0.9) max(calc(c * 0.55), 0.015) h);
    }
</style>
