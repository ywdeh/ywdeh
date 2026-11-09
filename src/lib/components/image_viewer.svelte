<script>
    import ScenarioDetails from "./scenario_details.svelte";
    import TrailImage from "./trail_image.svelte";
    import { image_pan_zoom } from "$lib/image_pan_zoom.js";

    let { item, title, zoom_width, close, tint_backdrop = true, origin } = $props();
    const wide = $derived(item.width / item.height > 2);
</script>

<ScenarioDetails {title} gallery {tint_backdrop} {origin} natural={{ width: item.width, height: item.height }} onclose={close}>
    <figure class="gallery_view" style:--gallery-zoom-width={wide ? zoom_width + 'px' : undefined}>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to pan the enlarged image.) -->
        <div class="gallery_image_viewport" use:image_pan_zoom role="region"
            aria-label="Image viewer. Scroll to zoom or drag to pan." tabindex="0">
            <div class="gallery_image_layer">
                <TrailImage src={item.full_src ?? item.src} alt={item.alt} gallery />
            </div>
        </div>
    </figure>
</ScenarioDetails>

<style>
    .gallery_view { width: 100%; margin-inline: auto; }
    /* the viewport spans the whole viewer area, so a zoomed image fills it instead of staying cropped to its starting size */
    .gallery_image_viewport {
        height: calc(100dvh - 2 * var(--viewer-gap-y));
        overflow: clip;
        border-radius: var(--radius-xl);
    }
    /* it spans the whole viewer, so a filled tint would wash over the empty space around the image */
    .gallery_image_viewport:focus-visible { background-color: transparent; }
    .gallery_image_layer { display: flex; align-items: center; justify-content: center; height: 100%; transform-origin: top left; }
    .gallery_image_layer :global(img) { pointer-events: auto; touch-action: none; }
    @media (prefers-reduced-motion: no-preference) {
        .gallery_image_layer:global(.is_zooming) { transition: transform 180ms var(--ease-out); }
    }
</style>
