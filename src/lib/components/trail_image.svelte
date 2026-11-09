<script>
    import { getContext } from "svelte";
    import { card_release } from "$lib/card_release.js";
    import { get_average_color } from "$lib/image_average_color.js";
    import { image_dimensions } from "$lib/image_dimensions.js";
    import CardBadge from "./card_badge.svelte";

    let { src, alt = "", gallery = false, zoom = true, eager = gallery, class: class_name = "", children } = $props();
    const open_image = getContext('case_image_viewer');
    const can_zoom = $derived(zoom && !!open_image);
    const dimensions = $derived(image_dimensions[src]);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions (The click handler is only set on the native button.) -->
<svelte:element this={can_zoom ? 'button' : zoom ? 'div' : 'span'} class="trail_image {class_name}" class:gallery class:zoomable={can_zoom} class:has_badge={can_zoom}
    use:card_release={can_zoom ? undefined : false}
    type={can_zoom ? 'button' : undefined}
    aria-label={can_zoom ? (alt ? 'Enlarge ' + alt : 'Enlarge image') : undefined}
    onclick={can_zoom ? (event) => open_image(event.currentTarget.querySelector('img')) : undefined}>
    {#if children}
        {@render children()}
    {:else}
        <img src={src} alt={alt} width={dimensions?.[0]} height={dimensions?.[1]}
            loading={eager ? 'eager' : 'lazy'} decoding="async" draggable="false" onload={(event) => {
            const img = event.currentTarget;
            if (can_zoom || !zoom) img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
            // the zoom badge takes the picture's average color
            if (can_zoom) {
                const color = get_average_color(img);
                if (color) img.parentElement?.style.setProperty('--live-img-avg', color);
            }
        }} />
    {/if}
    {#if can_zoom}
        <CardBadge kind="zoom" />
    {/if}
</svelte:element>

<style>
    .trail_image { display: block; position: relative; min-width: 0; }
    /* the picture clips itself (not the button), so the zoom badge can hang below its bottom edge */
    .trail_image.zoomable { width: 100%; border-radius: var(--radius-xl); }
    .trail_image.zoomable > img { object-fit: cover; clip-path: inset(0 round var(--radius-xl)); }
    .trail_image.zoomable:is(:active, :global(.is_pressed)) > img { padding: 6px; clip-path: inset(6px round var(--radius-xl)); }

    @media (prefers-reduced-motion: no-preference) {
        .trail_image.zoomable > img { transition: padding 140ms var(--ease-out), clip-path 140ms var(--ease-out); }
    }
    .trail_image > img { display: block; width: 100%; height: auto; }
    .trail_image.gallery { width: fit-content; max-width: 100%; margin-inline: auto; overflow: clip; border-radius: var(--radius-xl); }
    .trail_image.gallery > img {
        min-width: var(--gallery-zoom-width, 0px);
        max-width: 100%;
        max-height: calc(100dvh - 2 * var(--viewer-gap-y, 1.25rem));
        width: auto;
        height: auto;
    }
    .trail_image.gallery:has(> img) { min-width: var(--gallery-zoom-width, 0px); }
</style>
