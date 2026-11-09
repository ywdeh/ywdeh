<script>
    import TrailImage from "./trail_image.svelte";
    import { getContext } from "svelte";
    import { card_release } from "$lib/card_release.js";
    import { get_average_color } from "$lib/image_average_color.js";
    import CardBadge from "./card_badge.svelte";
    let { pictures = [] } = $props();
    const open_image = getContext('case_image_viewer');

    // the zoom badge takes the average color of whichever slide is showing
    let frame;
    function take_color() {
        const img = container?.querySelectorAll('img')[activeIndex];
        if (!img?.complete || !img.naturalWidth) return;
        const color = get_average_color(img);
        if (color) frame?.style.setProperty('--live-img-avg', color);
    }
    $effect(() => {
        activeIndex;
        take_color();
    });

    let activeIndex = $state(0);
    let dragOffset = $state(0);
    let isDragging = $state(false);
    let isHeld = $state(false);
    let containerWidth = $state(0);
    let first_slide_rect = $state();
    let frame_height = $derived(first_slide_rect?.height);

    let container;

    let startX = 0;
    let currentX = 0;
    let was_dragged = false;

    function release_image(node) {
        return card_release(node, undefined, (event) => !!open_image && (!was_dragged || event.detail === 0));
    }

    function next() {
        activeIndex = Math.min(activeIndex + 1, pictures.length - 1);
    }
    function prev() {
        activeIndex = Math.max(activeIndex - 1, 0);
    }
    function select(i) {
        activeIndex = i;
    }

    function onPointerDown(e) {
        if (e.button !== 0) return;
        was_dragged = false;
        isHeld = true;
        container.setPointerCapture(e.pointerId);
        if (pictures.length <= 1) return;
        isDragging = true;
        startX = e.clientX;
        currentX = e.clientX;
    }
    function onPointerRelease() {
        isHeld = false;
        onPointerUp();
    }
    function onPointerMove(e) {
        if (!isDragging) return;
        currentX = e.clientX;
        let delta = currentX - startX;
        if (Math.abs(delta) > 5) was_dragged = true;

        // resist
        if ((activeIndex === 0 && delta > 0) || (activeIndex === pictures.length - 1 && delta < 0)) {
            delta *= 0.35;
        }
        dragOffset = delta;
    }
    function onPointerUp() {
        if (!isDragging) return;
        isDragging = false;

        const threshold = containerWidth * 0.06;
        if (dragOffset < -threshold) {
            next();
        } else if (dragOffset > threshold) {
            prev();
        }
        dragOffset = 0;
    }
</script>

<!-- gap leaves room for the badge hanging 20px below the frame before the thumbnails start -->
<div class="flex flex-col gap-6">
    <!-- the viewport clips its slides, so the zoom badge hangs off this wrapper instead -->
    <div class="slider_frame relative" class:has_badge={!!open_image} bind:this={frame}
        onloadcapture={take_color}>
    <button type="button" aria-label="Enlarge current image"
        use:release_image
        bind:this={container}
        bind:clientWidth={containerWidth}
        style:height={frame_height ? frame_height + 'px' : undefined}
        onpointerdown={onPointerDown}
        onpointermove={onPointerMove}
        onpointerup={onPointerRelease}
        onpointercancel={onPointerRelease}
        onlostpointercapture={onPointerRelease}
        onclick={(event) => {
            if (!was_dragged || event.detail === 0) {
                open_image?.(container.querySelectorAll('img')[activeIndex]);
            }
        }}
        class="gallery_viewport relative flex w-full overflow-hidden rounded-xl bg-mauve-100/5 touch-pan-y"
        class:cursor-grabbing={isDragging}
        class:is_held={isHeld}
    >
        <span
            class="gallery_track flex w-full shrink-0 items-start will-change-transform"
            style:--press-scale={containerWidth ? (containerWidth - 12) / containerWidth : 1}
            style="transform: translateX(calc(-{activeIndex * 100}% + {dragOffset}px)); transition: {isDragging ? '' : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),'} scale var(--press-duration, 0s) var(--ease-out);"
        >
            {#each pictures as img, i}
                {#if i === 0}
                    <span class="block min-w-0 basis-full shrink-0" bind:contentRect={first_slide_rect}>
                        <TrailImage src={img.src} alt={img.alt} zoom={false} eager />
                    </span>
                {:else}
                    <span class="slide_fill block min-w-0 basis-full shrink-0"
                        style:height={frame_height ? frame_height + 'px' : undefined}>
                        <TrailImage src={img.src} alt={img.alt} zoom={false} class="h-full" />
                    </span>
                {/if}
            {/each}
        </span>
    </button>
    {#if open_image}
        <CardBadge kind="zoom" />
    {/if}
    </div>

    {#if pictures.length > 1}
        <div class="flex flex-wrap gap-3">
            {#each pictures as img, i}
                <button
                    use:card_release={'.gallery_thumbnail_image'}
                    onclick={() => select(i)}
                    aria-label={`Show image ${i + 1}`}
                    class="gallery_thumbnail flex shrink-0 h-14 md:h-18 aspect-4/3 object-left overflow-hidden transition rounded-xl
                        {i === activeIndex ? 'ring-4 ring-mauve-100/5 opacity-100' : 'opacity-60 hover:opacity-100'}"
                >
                    <TrailImage src={img.src} zoom={false} class="gallery_thumbnail_image w-full h-full">
                        <img src={img.src} alt={img.alt ?? ""} class="w-full h-full object-cover" loading="lazy" decoding="async" draggable="false" />
                    </TrailImage>
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .gallery_thumbnail :global(.gallery_thumbnail_image) { clip-path: inset(0 round var(--radius-xl)); }
    .gallery_thumbnail:is(:active, :global(.is_pressed)) :global(.gallery_thumbnail_image) { clip-path: inset(6px round var(--radius-xl)); }
    .gallery_thumbnail:is(:active, :global(.is_pressed)) img { padding: 6px; }

    .gallery_viewport { clip-path: inset(0 round var(--radius-xl)); }
    /* widen the clip so the focus outline around it isn't cut off; overflow-hidden still clips the slides */
    .gallery_viewport:focus-visible { clip-path: inset(calc(-1 * var(--focus-spread)) round calc(var(--radius-xl) + var(--focus-spread))); }
    .gallery_viewport:is(.is_held, :global(.is_pressed)) { clip-path: inset(6px round var(--radius-xl)); }
    /* the whole strip of slides shrinks around the visible slide, so the image fills the 6px inset (like the
       other cards' padding) while neighbouring slides stay flush during a drag; the scale is 12px narrower
       than the frame, and the slight extra height is cropped by the inset the same way object-fit: cover does */
    .gallery_viewport:is(.is_held, :global(.is_pressed)) .gallery_track { scale: var(--press-scale); }
    /* the badge rides up with the bottom edge as the frame insets */
    .slider_frame:has(> .gallery_viewport:is(.is_held, :global(.is_pressed))) :global(.card_badge) { translate: 0 -6px; }

    @media (prefers-reduced-motion: no-preference) {
        .gallery_viewport { transition: clip-path 140ms var(--ease-out); }
        .gallery_thumbnail :global(.gallery_thumbnail_image) { transition: clip-path 140ms var(--ease-out); }
        .gallery_thumbnail img { transition: padding 140ms var(--ease-out); }
        .gallery_track { --press-duration: 140ms; }
    }

    .gallery_track :global(img) {
        border-radius: 0;
        object-fit: cover;
    }
    .gallery_track .slide_fill :global(img) { height: 100%; }
</style>
