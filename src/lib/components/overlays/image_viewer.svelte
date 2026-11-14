<script>
    import OverlayShell from '$lib/components/overlays/overlay_shell.svelte';
    import Artwork from '$lib/components/media/artwork.svelte';
    import { image_pan_zoom } from '$lib/actions/image_pan_zoom.js';
    let { item, title, zoom_width, close, tint_backdrop = true, origin, ongone } = $props();
    const wide = $derived(item.width / item.height > 2);
</script>

<OverlayShell
    {title}
    gallery
    {tint_backdrop}
    {origin}
    natural={{ width: item.width, height: item.height }}
    onclose={close}
    {ongone}
>
    <figure class="gallery_view" style:--gallery-zoom-width={wide ? zoom_width + 'px' : undefined}>
        <div
            class="gallery_image_viewport"
            use:image_pan_zoom
            role="button"
            aria-label="Image viewer. Enter to toggle zoom, arrows to pan, or scroll and drag."
            tabindex="0"
        >
            <div class="gallery_image_layer">
                <Artwork src={item.full_src ?? item.src} alt={item.alt} gallery />
            </div>
        </div>
    </figure>
</OverlayShell>

<style>
    .gallery_view {
        width: 100%;
        margin-inline: auto;
    }
    .gallery_image_viewport {
        height: calc(100dvh - 2 * var(--viewer-gap-y));
        touch-action: none;
    }
    .gallery_image_viewport:focus-visible {
        background-color: transparent;
    }
    .gallery_image_layer {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        transform-origin: top left;
    }
    .gallery_image_layer :global(img) {
        pointer-events: auto;
        touch-action: none;
    }
    @media (prefers-reduced-motion: no-preference) {
        .gallery_image_layer:global(.is_zooming) {
            transition: transform 180ms var(--ease-out);
        }
        .gallery_image_layer:global(.is_settling) {
            transition: transform 450ms cubic-bezier(0.22, 1, 0.36, 1);
        }
    }
</style>
