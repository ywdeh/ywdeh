<script>
    import { press } from '$lib/actions/press.js';
    import { labels } from '$lib/content/labels.js';
    import { case_context } from '$lib/media/case_context.js';
    import { image_color } from '$lib/media/images.js';
    import { token } from '$lib/motion/timing.js';
    import Artwork from '$lib/components/media/artwork.svelte';
    import HoverBadge from '$lib/components/ui/hover_badge.svelte';

    let { pictures } = $props();

    const DRAG_START = 5;
    const EDGE_RESISTANCE = 0.35;
    const SWIPE_SHARE = 0.06;
    const context = case_context();

    let stage = $state();
    let viewport;
    let active = $state(0);
    let offset = $state(0);
    let dragging = $state(false);
    let held = $state(false);
    let width = $state(0);
    let first_slide = $state();
    let start_x = 0;
    let dragged = false;

    const height = $derived(first_slide?.height ? `${first_slide.height}px` : undefined);
    const press_scale = $derived.by(() => {
        if (!width || !viewport) return 1;
        return (width - 2 * parseFloat(token('--press-inset', viewport))) / width;
    });

    const can_open = (event) => !!context && (!dragged || event.detail === 0);

    function pointerdown(event) {
        if (event.button !== 0) return;
        dragged = false;
        held = true;
        viewport.setPointerCapture(event.pointerId);
        if (pictures.length < 2) return;
        dragging = true;
        start_x = event.clientX;
    }

    function pointermove(event) {
        if (!dragging) return;
        const delta = event.clientX - start_x;
        if (Math.abs(delta) > DRAG_START) dragged = true;
        const at_edge = (active === 0 && delta > 0) || (active === pictures.length - 1 && delta < 0);
        offset = at_edge ? delta * EDGE_RESISTANCE : delta;
    }

    function release() {
        held = false;
        if (!dragging) return;
        dragging = false;
        const threshold = width * SWIPE_SHARE;
        if (offset < -threshold) active = Math.min(active + 1, pictures.length - 1);
        else if (offset > threshold) active = Math.max(active - 1, 0);
        offset = 0;
    }
</script>

<div class="slider isolate flex flex-col gap-copy">
    <div
        bind:this={stage}
        class="stage relative"
        class:tinted={!!context}
        style:--tint={image_color(pictures[active]?.src)}
    >
        <button
            type="button"
            aria-label={labels.enlarge_current}
            data-own-swipe
            bind:this={viewport}
            bind:clientWidth={width}
            use:press={{ when: can_open }}
            onpointerdown={pointerdown}
            onpointermove={pointermove}
            onpointerup={release}
            onpointercancel={release}
            onlostpointercapture={release}
            onclick={(event) => can_open(event) && context.open(viewport.querySelectorAll('img')[active])}
            class="viewport relative flex w-full touch-pan-y overflow-hidden rounded-card bg-placeholder"
            class:is_held={held}
            class:is_dragging={dragging}
            style:height
        >
            <span
                class="track flex w-full shrink-0 items-start will-change-transform"
                class:dragging
                style:--press-scale={press_scale}
                style:transform="translateX(calc({-active * 100}% + {offset}px))"
            >
                {#each pictures as { src, alt }, index (src)}
                    {#if index === 0}
                        <span class="block min-w-0 shrink-0 basis-full" bind:contentRect={first_slide}>
                            <Artwork {src} {alt} zoom={false} eager anchor={stage} reveal={() => (active = index)} />
                        </span>
                    {:else}
                        <span class="fill block min-w-0 shrink-0 basis-full" style:height>
                            <Artwork
                                {src}
                                {alt}
                                zoom={false}
                                class="h-full"
                                anchor={stage}
                                reveal={() => (active = index)}
                            />
                        </span>
                    {/if}
                {/each}
            </span>
        </button>
        {#if context}<HoverBadge kind="zoom" host={stage} tinted={false} />{/if}
    </div>

    {#if pictures.length > 1}
        <div class="relative level-control flex flex-wrap gap-control">
            {#each pictures as { src, alt }, index (src)}
                <button
                    type="button"
                    use:press={{ target: '.thumb_frame' }}
                    onclick={() => (active = index)}
                    aria-label={labels.show_image(index + 1)}
                    aria-current={index === active}
                    style:--tint={image_color(src)}
                    class="thumb tinted own_outline relative isolate flex aspect-4/3 h-14 shrink-0 rounded-card md:h-18"
                >
                    <span
                        class="thumb_frame relative level-raised block size-full overflow-hidden rounded-card bg-placeholder"
                    >
                        <img
                            {src}
                            {alt}
                            class="size-full object-cover"
                            loading="lazy"
                            decoding="async"
                            draggable="false"
                        />
                    </span>
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .viewport {
        clip-path: inset(0 round var(--radius-card));
    }

    .viewport.is_dragging {
        cursor: grabbing;
    }

    .viewport:is(.is_held, :global(.is_pressed)) {
        clip-path: inset(var(--press-inset) round var(--radius-card));
    }

    .viewport:is(.is_held, :global(.is_pressed)) .track {
        scale: var(--press-scale);
    }

    .stage:has(> .viewport:is(.is_held, :global(.is_pressed))) {
        --badge-lift: calc(-1 * var(--press-inset));
    }

    .track :global(img) {
        border-radius: 0;
        object-position: left center;
    }

    .fill :global(img) {
        height: 100%;
    }

    .thumb {
        opacity: var(--tone-soft);
    }

    .thumb::before {
        content: '';
        position: absolute;
        inset: calc(-1 * var(--outline-thumb));
        z-index: var(--level-base);
        border-radius: calc(var(--radius-card) + var(--outline-thumb));
        background: var(--tint-glow);
        opacity: 0;
        pointer-events: none;
    }

    .thumb:is([aria-current='true'], :focus-visible, :active, :global(.is_pressed)),
    .thumb:is([aria-current='true'], :focus-visible, :active, :global(.is_pressed))::before {
        opacity: 1;
    }

    @media (hover: hover) {
        .thumb:hover,
        .thumb:hover::before {
            opacity: 1;
        }
    }

    .thumb:is(:active, :global(.is_pressed))::before {
        inset: calc(var(--press-inset) - var(--outline-thumb));
    }

    .thumb_frame {
        clip-path: inset(0 round var(--radius-card));
    }

    .thumb:is(:active, :global(.is_pressed)) .thumb_frame {
        clip-path: inset(var(--press-inset) round var(--radius-card));
    }

    .thumb:is(:active, :global(.is_pressed)) img {
        padding: var(--press-inset);
    }

    @media (prefers-reduced-motion: no-preference) {
        .viewport,
        .thumb_frame {
            transition: clip-path var(--duration-press) var(--ease-press);
        }

        .thumb {
            transition: opacity var(--duration-press) var(--ease-out);
        }

        .thumb::before {
            transition:
                opacity var(--duration-press) var(--ease-press),
                inset var(--duration-press) var(--ease-press);
        }

        .thumb img {
            transition: padding var(--duration-press) var(--ease-press);
        }

        .track {
            transition:
                transform var(--duration-slide) var(--ease-settle),
                scale var(--duration-press) var(--ease-press);
        }

        .track.dragging {
            transition: scale var(--duration-press) var(--ease-press);
        }
    }
</style>
