<script>
    import { card_release } from '$lib/card_release.js';
    import { image_color, thumbnail_of } from '$lib/image_data.js';
    import { queued } from '$lib/load_queue.js';
    import TrailImage from "./trail_image.svelte";
    import CardBadge from "./card_badge.svelte";

    // image_only: a gallery picture (zooms, natural aspect, dim name); otherwise a case study (opens, 4:3, title + client)
    // left: a wide picture resting on its left edge, panned toward the pointer
    let { src, thumbnail = src, alt, title, client, left = false, image_only = false, width, height, onclick, preload } = $props();

    let card_element = $state();
    let figure_element = $state();
    let is_centered = $state(false);
    let is_hovered = $state(false);
    let is_focused = $state(false);

    // in color (and on the full-size file) while hovered, focused or crossing the middle of the screen
    const show_full = $derived(is_centered || is_hovered || is_focused);
    // the card shows small copies (static/thumbs): the full-size files are only for the case study and the
    // image viewer. A different src (an animation) takes over while the card is in color.
    const still = $derived(thumbnail_of(thumbnail));
    const shown = $derived(show_full && src !== thumbnail ? thumbnail_of(src) : still);
    const reduced_motion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── wide pictures pan toward whichever side the pointer is on ──
    // a critically damped spring chases the target: it speeds up gently and settles gently (ease-in-out),
    // and since it keeps its velocity, pointer moves mid-flight bend the motion instead of restarting it
    const PAN_REST = 0;
    const PAN_STIFFNESS = 12; // rad/s; higher = snappier, ~0.5s to settle at 12
    const OUTLINE_MS = 140; // panning waits until the hover outline has finished growing (--press-time)
    let pan_x = $state(PAN_REST);
    let pan_target = PAN_REST;
    let pan_velocity = 0;
    let pan_frame;
    let last_frame;
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

    function pan_to(target) {
        pan_target = target;
        if (!pan_ready) return;
        if (reduced_motion()) {
            pan_x = target;
            return;
        }
        if (!pan_frame) {
            last_frame = undefined;
            pan_frame = requestAnimationFrame(step_pan);
        }
    }

    function step_pan(now) {
        // the first frame only records its timestamp: mixing it with an event-time clock could give a
        // negative or oversized step, which shows up as a jump
        if (last_frame === undefined) {
            last_frame = now;
            pan_frame = requestAnimationFrame(step_pan);
            return;
        }
        // time-based, so it feels the same at any refresh rate; capped so a stalled frame can't teleport it
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

    function follow_pointer(event) {
        if (image_only || !left || event.pointerType !== 'mouse') return;
        const card = event.currentTarget;
        const bounds = card.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const x = (event.clientX - bounds.left) / bounds.width;
        // the outer 20% on each side shows that edge fully
        pan_to(Math.min(100, Math.max(0, (x - 0.2) / 0.6 * 100)));
    }

    $effect(() => () => {
        stop_pan_loop();
        clearTimeout(pan_delay);
    });

    // ── color in while crossing the middle of the screen ──
    // a whole row crosses together; each card waits by its place in the row, so they color in left to right
    const STAGGER_MS = 120;
    let stagger = $state(0);

    $effect(() => {
        if (!card_element) return;
        const observer = new IntersectionObserver(([entry]) => {
            stagger = column_in_row() * STAGGER_MS;
            is_centered = entry.isIntersecting;
        }, { rootMargin: "-50% 0px -50% 0px", threshold: 0 });
        observer.observe(card_element);
        return () => observer.disconnect();
    });

    // how many cards sit to the left of this one in the same row (a grid cell, or a gallery row's item)
    function column_in_row() {
        const item = figure_element?.closest('.gallery_item') ?? figure_element;
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
</script>

<figure
    bind:this={figure_element}
    onmouseenter={() => {
        is_hovered = true;
        stagger = 0; // hover reacts right away
        preload?.();
        if (left && !reduced_motion()) hold_pan_for_outline();
    }}
    onmouseleave={() => {
        is_hovered = false;
        clearTimeout(pan_delay);
        pan_ready = true;
        pan_to(PAN_REST);
    }}
    onpointermove={follow_pointer}
    style:--live-img-avg={image_color(src) ?? image_color(thumbnail)}
    class="has_badge group relative">
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
        class="card_trigger relative z-10 flex w-full flex-col gap-4 text-left">

        <div class="relative">
            <TrailImage class="card_preview overflow-hidden rounded-card" src={thumbnail}>
                <!-- waits its turn with the other on-screen pictures; an animation swaps in at once -->
                <img
                    use:queued={shown}
                    decoding="async"
                    {alt}
                    {width} {height}
                    draggable="false"
                    class="w-full object-cover {image_only ? 'h-auto' : 'aspect-4/3'}"
                    class:object-center={!left}
                    class:pannable={left}
                    class:in_color={show_full}
                    style:--stagger={stagger + 'ms'}
                    style:aspect-ratio={image_only ? width / height : undefined}
                    style:object-position={left ? `${pan_x}% center` : undefined}
                />
            </TrailImage>
            <!-- gallery pictures zoom, everything else opens; the badge straddles the picture's bottom edge -->
            <CardBadge kind={image_only ? 'zoom' : 'open'} />
        </div>

        {#if image_only}
            <!-- gallery pictures just get a dim name: who it's for, or what it is for personal work -->
            <p class="card_caption live_tint truncate" class:fg-muted={!show_full}>{client === 'personal' ? title : client}</p>
        {:else}
            <!-- always one line: on a narrow card the title shortens with an ellipsis, the client stays whole -->
            <div class="card_caption flex justify-between gap-4">
                <h3 class="live_tint truncate">{title}</h3>
                <p class="live_tint fg-muted whitespace-nowrap">{client}</p>
            </div>
        {/if}
    </button>
</figure>

<style>
    /* the hover outline: the picture's tint, --outline-spread past the card, its corners following the
       card's (outer radius = card radius + distance) */
    figure::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: var(--radius-card);
        background: var(--avg-outline);
        opacity: 0;
        pointer-events: none;
    }
    figure:is(:hover, :focus-within)::before {
        opacity: 1;
        inset: calc(-1 * var(--outline-spread));
        border-radius: var(--radius-outline);
    }
    figure:has(> .card_trigger:is(:active, :global(.is_pressed)))::before {
        inset: calc(-1 * var(--outline-press));
        border-radius: calc(var(--radius-card) + var(--outline-press));
    }

    /* pressing sinks the picture in: it shrinks inside its own frame and the caption follows */
    .card_trigger :global(.card_preview) { clip-path: inset(0 round var(--radius-card)); }
    .card_trigger:is(:active, :global(.is_pressed)) :global(.card_preview) { clip-path: inset(var(--press-inset) round var(--radius-card)); }
    .card_trigger:is(:active, :global(.is_pressed)) img { padding: var(--press-inset); }
    .card_trigger:is(:active, :global(.is_pressed)) .card_caption { padding-inline: var(--press-inset); translate: 0 calc(-1 * var(--press-inset)); }

    /* grey until in color */
    img { filter: saturate(0) sepia(0.1); }
    img.in_color, figure:is(:hover, :focus-within) img { filter: none; }
    figure:is(:hover, :focus-within) .live_tint { color: var(--avg-text); }

    @media (prefers-reduced-motion: no-preference) {
        figure::before { transition: opacity var(--press-time) ease-in-out, inset var(--press-time) var(--press-ease), border-radius var(--press-time) var(--press-ease); }
        .card_trigger :global(.card_preview) { transition: clip-path var(--press-time) var(--press-ease); }
        /* the color-in (filter) waits --stagger so a row lights up card by card */
        img { transition: filter 400ms var(--stagger, 0ms), object-position 400ms, padding var(--press-time) var(--press-ease); }
        /* panned by the frame loop, so object-position must not transition */
        img.pannable { transition: filter 400ms var(--stagger, 0ms), padding var(--press-time) var(--press-ease); }
        .card_caption { transition: padding-inline var(--press-time) var(--press-ease), translate var(--press-time) var(--press-ease); }
        .live_tint { transition: color var(--press-time); }
        .card_caption.live_tint { transition: padding-inline var(--press-time) var(--press-ease), translate var(--press-time) var(--press-ease), opacity var(--press-time), color var(--press-time); }
    }
</style>
