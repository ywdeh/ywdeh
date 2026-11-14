<script>
    import { getContext } from 'svelte';
    import { press_release } from '$lib/actions/press_release.js';
    import { image_data } from '$lib/media/image_data.js';
    import { queued } from '$lib/media/load_queue.js';
    import HoverBadge from '$lib/components/cards/hover_badge.svelte';
    import { CASE_IMAGES } from '$lib/media/image_registry.js';
    let {
        src,
        alt = '',
        gallery = false,
        zoom = true,
        eager = gallery,
        class: class_name = '',
        children,
        reveal,
    } = $props();
    const registry = getContext(CASE_IMAGES);
    function register(node) {
        if (!gallery) return registry?.register(node, () => reveal?.());
    }
    const open_image = getContext('case_image_viewer');
    const can_zoom = $derived(zoom && !!open_image);
    const data = $derived(image_data[src]);
    const ratio = $derived(data && (can_zoom || !zoom) ? `${data[0]} / ${data[1]}` : undefined);
</script>

{#if can_zoom}
    <button
        type="button"
        class="artwork zoomable has_badge {class_name}"
        class:gallery
        use:press_release
        style:--live-img-avg={data?.[2]}
        aria-label={alt ? 'Enlarge ' + alt : 'Enlarge image'}
        onclick={(event) => open_image(event.currentTarget.querySelector('img'))}
    >
        <span class="picture_frame">{@render picture()}</span>
        <HoverBadge kind="zoom" />
    </button>
{:else}
    <svelte:element this={zoom ? 'div' : 'span'} class="artwork {class_name}" class:gallery>
        {@render picture()}
    </svelte:element>
{/if}

{#snippet picture()}
    {#if children}
        {@render children()}
    {:else if eager}
        <img
            use:register
            {src}
            data-src={src}
            {alt}
            width={data?.[0]}
            height={data?.[1]}
            style:aspect-ratio={ratio}
            decoding="async"
            draggable="false"
        />
    {:else}
        <img
            use:register
            use:queued={src}
            data-src={src}
            {alt}
            width={data?.[0]}
            height={data?.[1]}
            style:aspect-ratio={ratio}
            decoding="async"
            draggable="false"
        />
    {/if}
{/snippet}

<style>
    .artwork,
    .picture_frame {
        display: block;
        position: relative;
        min-width: 0;
        border-radius: var(--radius-card);
        background-color: color-mix(in oklab, var(--color-mauve-100) 5%, transparent);
    }
    .artwork.zoomable {
        width: 100%;
        background-color: transparent;
    }
    .picture_frame {
        clip-path: inset(0 round var(--radius-card));
    }
    .picture_frame > img {
        object-fit: cover;
    }
    .artwork.zoomable:is(:active, :global(.is_pressed)) .picture_frame {
        clip-path: inset(var(--press-inset) round var(--radius-card));
    }
    .artwork.zoomable:is(:active, :global(.is_pressed)) .picture_frame > img {
        padding: var(--press-inset);
    }

    @media (prefers-reduced-motion: no-preference) {
        .picture_frame {
            transition: clip-path var(--press-time) var(--press-ease);
        }
        .picture_frame > img {
            transition: padding var(--press-time) var(--press-ease);
        }
    }
    :is(.artwork, .picture_frame) > img {
        display: block;
        width: 100%;
        height: auto;
    }
    .artwork.gallery {
        width: fit-content;
        max-width: 100%;
        margin-inline: auto;
        overflow: clip;
        border-radius: var(--radius-card);
    }
    .artwork.gallery > img {
        min-width: min(var(--gallery-zoom-width, 0px), 100%);
        max-width: 100%;
        max-height: calc(100dvh - 2 * var(--viewer-gap-y, 1.25rem));
        width: auto;
        height: auto;
    }
    .artwork.gallery:has(> img) {
        min-width: min(var(--gallery-zoom-width, 0px), 100%);
    }
</style>
