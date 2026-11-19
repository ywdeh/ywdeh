<script>
    import { fade } from 'svelte/transition';
    import { pan_zoom, unzoom_before_close } from '$lib/actions/pan_zoom.js';
    import { labels } from '$lib/content/labels.js';
    import { image_flight } from '$lib/controllers/image_flight.svelte.js';
    import { strokes } from '$lib/geometry/strokes.js';
    import { overlay_pace } from '$lib/motion/timing.js';
    import CloseButton from '$lib/components/ui/close_button.svelte';

    let { src, alt = '', width, height, title, zoom_width, origin, tinted = true, close, ongone } = $props();

    const WIDE_RATIO = 2;
    const ICON_GRID = 24;

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

    <header class="close fixed level-raised" in:reveal_close|global={'in'} out:reveal_close|global={'out'}>
        <h1 id={heading} class="sr-only">{title}</h1>
        <svg class="absolute size-0" aria-hidden="true">
            <mask id="{heading}-x" maskContentUnits="objectBoundingBox">
                <g
                    transform="scale({1 / ICON_GRID})"
                    fill="none"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                >
                    {#each strokes.close as d (d)}<path {d} pathLength="1" class="stroke-trim" />{/each}
                </g>
            </mask>
        </svg>
        <span class="negative" aria-hidden="true" style:--x-mask="url(#{heading}-x)"></span>
        <CloseButton bind:element={close_button} label={labels.close_image} onclick={request_close} />
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

    .close {
        --negative: 1;
        --shown: 1;
        --x-strength: 0.85;
        --icon-opacity: calc(var(--shown) * (1 - var(--negative)));
        top: calc(var(--spacing-panel) - var(--spacing-inline));
        right: calc(var(--spacing-panel) - var(--spacing-inline));
    }

    .negative {
        position: absolute;
        top: var(--spacing-inline);
        left: var(--spacing-inline);
        width: 2rem;
        height: 2rem;
        pointer-events: none;
        -webkit-mask: var(--x-mask);
        mask: var(--x-mask);
        -webkit-backdrop-filter: grayscale(1) contrast(6) invert(1);
        backdrop-filter: grayscale(1) contrast(6) invert(1);
        opacity: calc(var(--shown) * var(--negative) * var(--x-strength));
    }

    .close:has(:focus-visible) {
        --x-strength: 1;
    }

    @media (hover: hover) {
        .close:has(:global(.icon-host:hover)) {
            --x-strength: 1;
        }
    }

    .close:has(:global(.icon-host:is(:active, .is_pressed))) {
        --x-strength: 0.85;
    }

    @media (prefers-reduced-motion: no-preference) {
        .layer:global(.is_zooming) {
            transition: transform var(--duration-quick) var(--ease-out);
        }

        .layer:global(.is_settling) {
            transition: transform var(--duration-settle) var(--ease-settle);
        }

        @media (hover: hover) and (pointer: fine) {
            .close:has(:global(.icon-host:hover)) {
                --icon-trim: var(--trim-hover);
                --icon-shift: var(--trim-shift-hover);
            }
        }

        .close:has(:global(.icon-host:is(:active, .is_pressed))) {
            --icon-trim: var(--trim-press);
            --icon-shift: var(--trim-shift-press);
        }
    }
</style>
