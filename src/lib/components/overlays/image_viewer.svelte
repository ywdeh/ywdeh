<script>
    import { fade } from 'svelte/transition';
    import { pan_zoom, unzoom_before_close } from '$lib/actions/pan_zoom.js';
    import { image_flight } from '$lib/controllers/image_flight.svelte.js';
    import { strokes } from '$lib/geometry/strokes.js';
    import { overlay_pace } from '$lib/motion/timing.js';
    import CloseButton from '$lib/components/ui/close_button.svelte';

    let { src, alt = '', width, height, title, zoom_width, origin, tinted = true, close, ongone } = $props();

    const heading = $props.id();
    const wide = $derived(width / height > 2);
    let dialog;
    let viewport;
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
    });

    function travel(node, direction) {
        if (flight.launch(node, direction)) return flight.pace(direction);
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
        aria-label="Close overlay"
        tabindex="-1"
        onclick={() => close_button?.click()}
        class="backdrop fixed inset-0"
        class:tinted
        transition:fade|global={overlay_pace()}
    ></button>

    <div
        bind:this={dialog}
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
                class="viewer_viewport"
                role="button"
                tabindex="0"
                aria-label="Image viewer. Enter to toggle zoom, arrows to pan, or scroll and drag."
            >
                <div class="layer">
                    <div class="viewer_frame frame">
                        <img {src} data-src={src} {alt} {width} {height} decoding="async" draggable="false" />
                    </div>
                </div>
            </div>
        </figure>
    </div>

    <header class="close fixed" in:reveal_close|global={'in'} out:reveal_close|global={'out'}>
        <h1 id={heading} class="sr-only">{title}</h1>
        <svg class="absolute size-0" aria-hidden="true">
            <mask id="{heading}-x" maskContentUnits="objectBoundingBox">
                <g
                    class="x_lines"
                    transform="scale(0.041667)"
                    fill="none"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                >
                    {#each strokes.close as d (d)}<path {d} pathLength="1" />{/each}
                </g>
            </mask>
        </svg>
        <span
            class="negative"
            aria-hidden="true"
            style="mask: url(#{heading}-x); -webkit-mask: url(#{heading}-x)"
        ></span>
        <CloseButton bind:element={close_button} label="Close image" onclick={request_close} />
    </header>
</div>

<style>
    .overlay {
        z-index: var(--layer-overlay);
    }

    .backdrop {
        backdrop-filter: blur(8px);
    }

    .backdrop.tinted {
        background-color: oklch(from var(--color-surface-deep) l c h / 70%);
        backdrop-filter: blur(8px) saturate(0) sepia(0.1);
    }

    .viewer_viewport {
        height: calc(100dvh - 2 * var(--viewer-gap-y));
        touch-action: none;
    }

    .viewer_viewport:focus-visible {
        background-color: transparent;
    }

    .viewer_viewport:global(.is_grabbing) {
        cursor: grabbing;
    }

    .layer {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        transform-origin: top left;
    }

    .viewer_frame {
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
        top: calc(var(--spacing-panel) - 0.5rem);
        right: calc(var(--spacing-panel) - 0.5rem);
        z-index: var(--layer-panel-header);
    }

    .close :global(.close_button svg) {
        opacity: calc(var(--shown) * (1 - var(--negative)));
    }

    .negative {
        position: absolute;
        top: 0.5rem;
        left: 0.5rem;
        width: 2rem;
        height: 2rem;
        pointer-events: none;
        -webkit-backdrop-filter: grayscale(1) contrast(6) invert(1);
        backdrop-filter: grayscale(1) contrast(6) invert(1);
        opacity: calc(var(--shown) * var(--negative) * var(--x-strength));
    }

    .close:has(:global(.close_button:focus-visible)) {
        --x-strength: 1;
    }

    @media (hover: hover) {
        .close:has(:global(.close_button:hover)) {
            --x-strength: 1;
        }
    }

    .close:has(:global(.close_button:is(:active, .is_pressed))) {
        --x-strength: 0.85;
    }

    .x_lines path {
        stroke-dasharray: 1 1;
        stroke-dashoffset: 0;
    }

    @media (prefers-reduced-motion: no-preference) {
        .layer:global(.is_zooming) {
            transition: transform 180ms var(--ease-out);
        }

        .layer:global(.is_settling) {
            transition: transform 450ms var(--ease-settle);
        }

        .x_lines path {
            transition:
                stroke-dasharray var(--duration-press) var(--ease-press),
                stroke-dashoffset var(--duration-press) var(--ease-press);
        }

        @media (hover: hover) and (pointer: fine) {
            .close:has(:global(.close_button:hover)) .x_lines path {
                stroke-dasharray: 0.8 1;
                stroke-dashoffset: -0.1;
            }
        }

        .close:has(:global(.close_button:is(:active, .is_pressed))) .x_lines path {
            stroke-dasharray: 0.6 1;
            stroke-dashoffset: -0.2;
        }
    }
</style>
