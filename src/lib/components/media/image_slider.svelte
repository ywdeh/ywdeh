<script>
    import { getContext } from 'svelte';
    import { press_release } from '$lib/actions/press_release.js';
    import { image_color } from '$lib/media/image_source.js';
    import Artwork from '$lib/components/media/artwork.svelte';
    import HoverBadge from '$lib/components/cards/hover_badge.svelte';
    let { pictures = [] } = $props();
    const open_image = getContext('case_image_viewer');
    const PRESS_INSET = 6;
    let active_index = $state(0);
    let drag_offset = $state(0);
    let is_dragging = $state(false);
    let is_held = $state(false);
    let container_width = $state(0);
    let first_slide_rect = $state();
    const frame_height = $derived(first_slide_rect?.height);
    let container;
    let start_x = 0;
    let was_dragged = false;
    function release_image(node) {
        return press_release(
            node,
            undefined,
            (event) => !!open_image && (!was_dragged || event.detail === 0),
        );
    }
    function pointer_down(event) {
        if (event.button !== 0) return;
        was_dragged = false;
        is_held = true;
        container.setPointerCapture(event.pointerId);
        if (pictures.length <= 1) return;
        is_dragging = true;
        start_x = event.clientX;
    }
    function pointer_move(event) {
        if (!is_dragging) return;
        let delta = event.clientX - start_x;
        if (Math.abs(delta) > 5) was_dragged = true;
        if ((active_index === 0 && delta > 0) || (active_index === pictures.length - 1 && delta < 0))
            delta *= 0.35;
        drag_offset = delta;
    }
    function pointer_release() {
        is_held = false;
        if (!is_dragging) return;
        is_dragging = false;
        const threshold = container_width * 0.06;
        if (drag_offset < -threshold) active_index = Math.min(active_index + 1, pictures.length - 1);
        else if (drag_offset > threshold) active_index = Math.max(active_index - 1, 0);
        drag_offset = 0;
    }
</script>

<div class="image_gallery flex flex-col gap-copy">
    <div
        class="slider_frame relative"
        class:has_badge={!!open_image}
        style:--live-img-avg={image_color(pictures[active_index]?.src)}
    >
        <button
            type="button"
            aria-label="Enlarge current image"
            data-own-swipe
            use:release_image
            bind:this={container}
            bind:clientWidth={container_width}
            style:height={frame_height ? frame_height + 'px' : undefined}
            onpointerdown={pointer_down}
            onpointermove={pointer_move}
            onpointerup={pointer_release}
            onpointercancel={pointer_release}
            onlostpointercapture={pointer_release}
            onclick={(event) => {
                if (!was_dragged || event.detail === 0)
                    open_image?.(container.querySelectorAll('img')[active_index]);
            }}
            class="gallery_viewport relative flex w-full touch-pan-y overflow-hidden rounded-card bg-mauve-100/5"
            class:cursor-grabbing={is_dragging}
            class:is_held
        >
            <span
                class="gallery_track flex w-full shrink-0 items-start will-change-transform"
                class:dragging={is_dragging}
                style:--press-scale={container_width
                    ? (container_width - 2 * PRESS_INSET) / container_width
                    : 1}
                style:transform="translateX(calc({-active_index * 100}% + {drag_offset}px))"
            >
                {#each pictures as img, i}
                    {#if i === 0}
                        <span class="block min-w-0 shrink-0 basis-full" bind:contentRect={first_slide_rect}>
                            <Artwork
                                reveal={() => (active_index = i)}
                                src={img.src}
                                alt={img.alt}
                                zoom={false}
                                eager
                            />
                        </span>
                    {:else}
                        <span
                            class="slide_fill block min-w-0 shrink-0 basis-full"
                            style:height={frame_height ? frame_height + 'px' : undefined}
                        >
                            <Artwork
                                reveal={() => (active_index = i)}
                                src={img.src}
                                alt={img.alt}
                                zoom={false}
                                class="h-full"
                            />
                        </span>
                    {/if}
                {/each}
            </span>
        </button>
        {#if open_image}
            <HoverBadge kind="zoom" />
        {/if}
    </div>

    {#if pictures.length > 1}
        <div class="gallery_thumbnails flex flex-wrap gap-control">
            {#each pictures as img, i}
                <button
                    type="button"
                    use:press_release={'.gallery_thumbnail_image'}
                    onclick={() => (active_index = i)}
                    aria-label={`Show image ${i + 1}`}
                    aria-current={i === active_index}
                    style:--live-img-avg={image_color(img.src)}
                    class="gallery_thumbnail has_badge own_outline relative isolate flex aspect-4/3 h-14 shrink-0 rounded-card md:h-18"
                >
                    <Artwork
                        src={img.src}
                        zoom={false}
                        class="gallery_thumbnail_image relative z-1 h-full w-full overflow-hidden rounded-card"
                    >
                        <img
                            src={img.src}
                            alt={img.alt ?? ''}
                            class="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                            draggable="false"
                        />
                    </Artwork>
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .gallery_thumbnail {
        opacity: 0.6;
    }
    .gallery_thumbnail::before {
        content: '';
        position: absolute;
        inset: -4px;
        z-index: 0;
        background: var(--avg-outline);
        border-radius: calc(var(--radius-card) + 4px);
        opacity: 0;
        pointer-events: none;
    }
    .gallery_thumbnail:is([aria-current='true'], :focus-visible, :active, :global(.is_pressed)) {
        opacity: 1;
    }
    .gallery_thumbnail:is([aria-current='true'], :focus-visible, :active, :global(.is_pressed))::before {
        opacity: 1;
    }
    @media (hover: hover) {
        .gallery_thumbnail:hover {
            opacity: 1;
        }
        .gallery_thumbnail:hover::before {
            opacity: 1;
        }
    }
    .gallery_thumbnail:is(:active, :global(.is_pressed))::before {
        inset: calc(var(--press-inset) - 4px);
    }
    .gallery_thumbnail :global(.gallery_thumbnail_image) {
        clip-path: inset(0 round var(--radius-card));
    }
    .gallery_thumbnail:is(:active, :global(.is_pressed)) :global(.gallery_thumbnail_image) {
        clip-path: inset(var(--press-inset) round var(--radius-card));
    }
    .gallery_thumbnail:is(:active, :global(.is_pressed)) img {
        padding: var(--press-inset);
    }

    .gallery_viewport {
        clip-path: inset(0 round var(--radius-card));
    }
    .gallery_viewport:is(.is_held, :global(.is_pressed)) {
        clip-path: inset(var(--press-inset) round var(--radius-card));
    }
    .gallery_viewport:is(.is_held, :global(.is_pressed)) .gallery_track {
        scale: var(--press-scale);
    }
    .slider_frame:has(> .gallery_viewport:is(.is_held, :global(.is_pressed))) :global(.card_badge) {
        translate: 0 calc(-1 * var(--press-inset));
    }
    .slider_frame :global(.card_badge) {
        bottom: calc(-1 * var(--spacing-control));
    }

    .gallery_track :global(img) {
        border-radius: 0;
        object-fit: cover;
    }
    .gallery_track .slide_fill :global(img) {
        height: 100%;
    }

    @media (prefers-reduced-motion: no-preference) {
        .gallery_thumbnail {
            transition: opacity var(--press-time) var(--ease-out);
        }
        .gallery_thumbnail::before {
            transition:
                opacity var(--press-time) var(--press-ease),
                inset var(--press-time) var(--press-ease);
        }
        .gallery_viewport {
            transition: clip-path var(--press-time) var(--press-ease);
        }
        .gallery_thumbnail :global(.gallery_thumbnail_image) {
            transition: clip-path var(--press-time) var(--press-ease);
        }
        .gallery_thumbnail img {
            transition: padding var(--press-time) var(--press-ease);
        }
        .gallery_track {
            transition:
                transform 350ms cubic-bezier(0.22, 1, 0.36, 1),
                scale var(--press-time) var(--press-ease);
        }
        .gallery_track.dragging {
            transition: scale var(--press-time) var(--press-ease);
        }
    }
</style>
