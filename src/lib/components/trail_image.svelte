<script>
    import { getContext } from "svelte";
    import { card_release } from "$lib/card_release.js";
    import { image_data } from "$lib/image_data.js";
    import { queued } from "$lib/load_queue.js";
    import CardBadge from "./card_badge.svelte";

    let { src, alt = "", gallery = false, zoom = true, eager = gallery, class: class_name = "", children } = $props();
    const open_image = getContext('case_image_viewer');
    const can_zoom = $derived(zoom && !!open_image);
    // [width, height, average color], worked out ahead of time (scripts/image_data.mjs); the size sets
    // the picture's shape before it has loaded
    const data = $derived(image_data[src]);
    // a fixed shape for the whole box (padding included), so a pressed picture's padding shrinks the
    // picture instead of changing its height and moving everything below it (the viewer's own picture
    // sizes itself)
    const ratio = $derived(data && (can_zoom || !zoom) ? `${data[0]} / ${data[1]}` : undefined);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions (The click handler is only set on the native button.) -->
<svelte:element this={can_zoom ? 'button' : zoom ? 'div' : 'span'} class="trail_image {class_name}" class:gallery class:zoomable={can_zoom} class:has_badge={can_zoom}
    use:card_release={can_zoom ? undefined : false}
    style:--live-img-avg={can_zoom ? data?.[2] : undefined}
    type={can_zoom ? 'button' : undefined}
    aria-label={can_zoom ? (alt ? 'Enlarge ' + alt : 'Enlarge image') : undefined}
    onclick={can_zoom ? (event) => open_image(event.currentTarget.querySelector('img')) : undefined}>
    {#if can_zoom}
        <!-- the grey block gets its own frame here, so the zoom badge can hang below its bottom edge -->
        <span class="picture_frame">{@render picture()}</span>
        <CardBadge kind="zoom" />
    {:else}
        {@render picture()}
    {/if}
</svelte:element>

{#snippet picture()}
    {#if children}
        {@render children()}
    {:else if eager}
        <img src={src} alt={alt} width={data?.[0]} height={data?.[1]} style:aspect-ratio={ratio} decoding="async" draggable="false" />
    {:else}
        <!-- waits its turn as a grey block: on-screen pictures load one at a time, top to bottom (load_queue.js) -->
        <img use:queued={src} alt={alt} width={data?.[0]} height={data?.[1]} style:aspect-ratio={ratio} decoding="async" draggable="false" />
    {/if}
{/snippet}

<style>
    /* the picture's wrapper is its grey block (the tint under the case study slider): it shows while the
       picture loads, or while it's open in the image viewer (the picture is just see-through meanwhile) */
    .trail_image, .picture_frame {
        display: block;
        position: relative;
        min-width: 0;
        border-radius: var(--radius-card);
        background-color: color-mix(in oklab, var(--color-mauve-100) 5%, transparent);
    }
    /* a zoomable picture's frame holds the block instead, so the button around it stays clear for the badge */
    .trail_image.zoomable { width: 100%; background-color: transparent; }
    /* pressing sinks the picture in: the frame shrinks, and the picture with it */
    .picture_frame { clip-path: inset(0 round var(--radius-card)); }
    .picture_frame > img { object-fit: cover; }
    .trail_image.zoomable:is(:active, :global(.is_pressed)) .picture_frame { clip-path: inset(var(--press-inset) round var(--radius-card)); }
    .trail_image.zoomable:is(:active, :global(.is_pressed)) .picture_frame > img { padding: var(--press-inset); }

    @media (prefers-reduced-motion: no-preference) {
        .picture_frame { transition: clip-path var(--press-time) var(--press-ease); }
        .picture_frame > img { transition: padding var(--press-time) var(--press-ease); }
    }
    :is(.trail_image, .picture_frame) > img { display: block; width: 100%; height: auto; }
    .trail_image.gallery { width: fit-content; max-width: 100%; margin-inline: auto; overflow: clip; border-radius: var(--radius-card); }
    /* (never wider than the screen, though: on a phone a card can be nearly full width already) */
    .trail_image.gallery > img {
        min-width: min(var(--gallery-zoom-width, 0px), 100%);
        max-width: 100%;
        max-height: calc(100dvh - 2 * var(--viewer-gap-y, 1.25rem));
        width: auto;
        height: auto;
    }
    .trail_image.gallery:has(> img) { min-width: min(var(--gallery-zoom-width, 0px), 100%); }
</style>
