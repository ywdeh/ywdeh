<script>
    import { fade } from 'svelte/transition';
    import { pan_zoom, unzoom_before_close } from '$lib/actions/pan_zoom.js';
    import { labels } from '$lib/content/labels.js';
    import { context_menu } from '$lib/controllers/context_menu.svelte.js';
    import { image_flight } from '$lib/controllers/image_flight.svelte.js';
    import { strokes } from '$lib/geometry/strokes.js';
    import { overlay_pace } from '$lib/motion/timing.js';
    import CloseButton from '$lib/components/ui/close_button.svelte';
    import CopyIcon from '$lib/components/ui/copy_icon.svelte';
    import IconButton from '$lib/components/ui/icon_button.svelte';
    import NegativeIcon from '$lib/components/ui/negative_icon.svelte';

    let { src, alt = '', width, height, title, zoom_width, origin, tinted = true, link, close, ongone } = $props();

    const WIDE_RATIO = 2;

    const heading = $props.id();
    const wide = $derived(width / height > WIDE_RATIO);
    let viewport = $state();
    let frame = $state();
    let close_button = $state();
    let closing = false;

    const flight = image_flight({
        get origin() {
            return origin;
        },
        get natural() {
            return { width, height };
        },
        get ongone() {
            return ongone;
        },
        get frame() {
            return frame;
        },
        get viewport() {
            return viewport;
        },
    });

    function travel(node, direction) {
        if (flight.launch(direction)) return flight.pace(direction);
        return { ...overlay_pace(), css: (t) => `transform: scale(${0.9 + 0.1 * t}); opacity: ${t}` };
    }

    function reveal_close(node, direction) {
        return { ...flight.pace(direction), css: (t) => (tinted ? `--shown: ${t}` : `--negative: ${t}`) };
    }

    async function request_close() {
        if (closing) return;
        closing = true;
        try {
            await unzoom_before_close(viewport);
            close();
        } finally {
            closing = false;
        }
    }

    const menu = {
        items: () => [
            [
                { label: labels.menu.copy_image_link, copy: location.href },
                { label: labels.menu.close_image, icon: strokes.close, run: request_close },
            ],
        ],
    };

    function keydown(event) {
        if (event.key !== 'Escape' || event.defaultPrevented) return;
        event.preventDefault();
        request_close();
    }
</script>

<svelte:window onkeydown={keydown} />

<div class="overlay fixed inset-0 flex items-center justify-center">
    <button
        type="button"
        aria-label={labels.close_overlay}
        tabindex="-1"
        onclick={() => close_button?.click()}
        class="fixed inset-0 {tinted ? 'scrim mute-blur-behind' : 'blur-behind'}"
        transition:fade|global={overlay_pace()}
    ></button>

    <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={heading}
        class="pointer-events-none absolute inset-0 flex flex-col overflow-clip px-viewer py-(--viewer-gap-y) font-normal"
        in:travel|global={'in'}
        out:travel|global={'out'}
    >
        <figure class="m-auto w-full" style:--zoom-width={wide ? `${zoom_width}px` : undefined}>
            <div
                bind:this={viewport}
                use:pan_zoom
                use:context_menu={menu}
                class="viewport"
                role="button"
                tabindex="0"
                aria-label={labels.image_viewer}
            >
                <div class="layer">
                    <div bind:this={frame} class="frame">
                        <img {src} data-src={src} {alt} {width} {height} decoding="async" draggable="false" />
                    </div>
                </div>
            </div>
        </figure>
    </div>

    <header class="controls fixed level-raised flex" in:reveal_close|global={'in'} out:reveal_close|global={'out'}>
        <h1 id={heading} class="sr-only">{title}</h1>
        {#if link}
            <NegativeIcon>
                {#snippet icon()}<CopyIcon swapped={link.copied} stroke={1.5} fit inline />{/snippet}
                <IconButton label={link.copied ? labels.link_copied : labels.copy_link} onclick={link.copy}>
                    {#snippet icon()}<CopyIcon swapped={link.copied} stroke={1.5} fit class="size-8 text-ink" />{/snippet}
                </IconButton>
            </NegativeIcon>
        {/if}
        <NegativeIcon paths={strokes.close}>
            <CloseButton bind:element={close_button} label={labels.close_image} onclick={request_close} />
        </NegativeIcon>
    </header>
</div>

<style>
    .overlay {
        z-index: var(--layer-overlay);
    }

    .viewport {
        height: calc(100dvh - 2 * var(--viewer-gap-y));
        touch-action: none;
    }

    .viewport:focus-visible {
        background-color: transparent;
    }

    .viewport:global(.is_grabbing) {
        cursor: grabbing;
    }

    .layer {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        transform-origin: top left;
    }

    .frame {
        width: fit-content;
        max-width: 100%;
        min-width: min(var(--zoom-width, 0px), 100%);
        margin-inline: auto;
        overflow: clip;
        border-radius: var(--radius-card);
    }

    img {
        display: block;
        width: auto;
        height: auto;
        min-width: min(var(--zoom-width, 0px), 100%);
        max-width: 100%;
        max-height: calc(100dvh - 2 * var(--viewer-gap-y));
        pointer-events: auto;
        touch-action: none;
    }

    .controls {
        --negative: 1;
        --shown: 1;
        --icon-opacity: calc(var(--shown) * (1 - var(--negative)));
        top: calc(var(--spacing-panel) - var(--spacing-inline));
        right: calc(var(--spacing-panel) - var(--spacing-inline));
    }

    @media (prefers-reduced-motion: no-preference) {
        .layer:global(.is_zooming) {
            transition: transform var(--duration-quick) var(--ease-out);
        }

        .layer:global(.is_settling) {
            transition: transform var(--duration-settle) var(--ease-settle);
        }
    }
</style>
