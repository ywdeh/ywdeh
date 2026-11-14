<script>
    import { press_release } from '$lib/actions/press_release.js';
    import SiteFooter from '$lib/components/layout/site_footer.svelte';
    import { fade } from 'svelte/transition';
    import { setContext, untrack } from 'svelte';
    import { unzoom_before_close } from '$lib/actions/image_pan_zoom.js';
    import { flight_duration } from '$lib/motion/image_flight.js';
    import { image_flight } from '$lib/controllers/image_flight.svelte.js';
    import { overlay_pace } from '$lib/motion/settings.js';
    import { swipe_to_close } from '$lib/actions/swipe_to_close.js';
    let {
        title,
        onclose,
        children,
        gallery = false,
        suspended = false,
        close_hidden = false,
        open_image,
        tint_backdrop = true,
        origin,
        natural,
        ongone,
    } = $props();
    const heading_id = $props.id();
    const nested = $derived(gallery && !tint_backdrop);
    let close_button = $state();
    let dialog = $state();
    const backdrop_tint = 'bg-neutral-950/70 backdrop-saturate-0 backdrop-sepia-10';
    const panel_box = 'inset-y-0 right-0 w-full md:w-[85%] lg:w-1/2 lg:min-w-[48rem] md:rounded-l-card';
    setContext(
        'case_image_viewer',
        untrack(() => open_image),
    );

    const flight = image_flight({
        get origin() {
            return origin;
        },
        get natural() {
            return natural;
        },
        get ongone() {
            return ongone;
        },
    });
    function viewer_transition(node, direction) {
        if (gallery) {
            if (flight.fly(node, direction)) return { duration: flight_duration() };
            return { ...overlay_pace(), css: (t) => `transform: scale(${0.9 + 0.1 * t}); opacity: ${t}` };
        }
        return { ...overlay_pace(), css: (t) => `transform: translateX(${(1 - t) * 100}%)` };
    }
    function viewer_x(node, direction) {
        return { ...flight.pace(direction), css: (t) => (nested ? `--negative: ${t}` : `--shown: ${t}`) };
    }
    function focus_close(node) {
        node.focus({ preventScroll: true });
    }
    let close_pending = false;
    async function request_close() {
        if (close_pending) return;
        close_pending = true;
        try {
            if (gallery) {
                const viewport = dialog?.querySelector('.gallery_image_viewport');
                await unzoom_before_close(viewport);
            }
            onclose();
        } finally {
            close_pending = false;
        }
    }
    function handle_keydown(event) {
        if (!suspended && event.key === 'Escape' && !event.defaultPrevented) {
            event.preventDefault();
            request_close();
        }
    }
</script>

<svelte:window onkeydown={handle_keydown} />

{#snippet close(label)}
    <button
        type="button"
        bind:this={close_button}
        use:focus_close
        use:press_release
        aria-label={label}
        onclick={request_close}
        class="close_button link-quiet pointer-events-auto block shrink-0 p-2 transition-opacity motion-reduce:transition-none"
    >
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            class="size-8 text-mauve-300"
            aria-hidden="true"
        >
            <path d="M6.1 6.5Q12.5 11.6 17.7 17.8" pathLength="1" />
            <path d="M17.5 6.2Q12.8 12.2 6.5 17.5" pathLength="1" />
        </svg>
    </button>
{/snippet}

<div class="overlay_root fixed inset-0 z-90 flex items-center justify-center" inert={suspended}>
    <button
        type="button"
        aria-label="Close overlay"
        tabindex="-1"
        onclick={() => (gallery ? close_button?.click() : onclose())}
        class="backdrop fixed inset-0 backdrop-blur-sm {tint_backdrop ? backdrop_tint : ''}"
        transition:fade|global={overlay_pace()}
    ></button>

    <div
        bind:this={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={heading_id}
        class:z-0={!gallery}
        class:panel={!gallery}
        class="dialog_box flex flex-col font-normal scrollbar-none! overscroll-contain {gallery
            ? 'pointer-events-none absolute inset-0 overflow-clip px-viewer py-(--viewer-gap-y)'
            : `fixed overflow-y-auto bg-neutral-900 ${panel_box}`}"
        use:swipe_to_close={{ onclose: request_close, enabled: !gallery }}
        in:viewer_transition|global={'in'}
        out:viewer_transition|global={'out'}
    >
        {#if !gallery}
            <header
                class="z-80 sticky top-0 flex w-full shrink-0 justify-between gap-copy bg-neutral-900/95 backdrop-blur-md px-panel py-(--panel-heading-space)"
            >
                <h1 id={heading_id} class="text-case-heading">{title}</h1>

                <span class="-m-2" class:invisible={suspended || close_hidden}
                    >{@render close('Close case study')}</span
                >
            </header>
        {/if}

        {#if gallery}
            <div class="m-auto w-full">
                {@render children()}
            </div>
        {:else}
            <div class="flex flex-col gap-section px-panel pb-row">
                <div class="case_body flex flex-col gap-case text-lg">
                    {@render children()}
                </div>
                <SiteFooter />
            </div>
        {/if}
    </div>

    {#if gallery}
        <header
            class="viewer_x z-80 fixed top-[calc(var(--panel-heading-space)_-_0.5rem)] right-[calc(var(--spacing-panel)_-_0.5rem)]"
            in:viewer_x|global={'in'}
            out:viewer_x|global={'out'}
        >
            <h1 id={heading_id} class="text-case-heading sr-only">{title}</h1>

            <svg class="absolute size-0" aria-hidden="true">
                <mask id="{heading_id}-x" maskContentUnits="objectBoundingBox">
                    <g
                        class="x_lines"
                        transform="scale(0.041667)"
                        fill="none"
                        stroke="white"
                        stroke-width="2"
                        stroke-linecap="round"
                    >
                        <path d="M6.1 6.5Q12.5 11.6 17.7 17.8" pathLength="1" />
                        <path d="M17.5 6.2Q12.8 12.2 6.5 17.5" pathLength="1" />
                    </g>
                </mask>
            </svg>
            <span
                class="x_negative"
                aria-hidden="true"
                style="mask: url(#{heading_id}-x); -webkit-mask: url(#{heading_id}-x)"
            ></span>
            {@render close('Close image')}
        </header>
    {/if}

    {#if suspended && !gallery && tint_backdrop}
        <div
            aria-hidden="true"
            class="pointer-events-none fixed z-10 {panel_box} {backdrop_tint}"
            transition:fade|global={overlay_pace()}
        ></div>
    {/if}
</div>

<style>
    :is(.close_button, .x_lines) path {
        stroke-dasharray: 1 1;
        stroke-dashoffset: 0;
    }
    .viewer_x {
        --negative: 1;
        --shown: 1;
        --x-strength: 0.85;
    }
    .viewer_x .close_button svg {
        opacity: calc(var(--shown) * (1 - var(--negative)));
    }
    .x_negative {
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
    .viewer_x:has(.close_button:focus-visible) {
        --x-strength: 1;
    }
    @media (hover: hover) {
        .viewer_x:has(.close_button:hover) {
            --x-strength: 1;
        }
    }
    .viewer_x:has(.close_button:is(:active, :global(.is_pressed))) {
        --x-strength: 0.85;
    }
    .dialog_box.panel {
        touch-action: pan-y pinch-zoom;
    }

    @media (prefers-reduced-motion: no-preference) {
        :is(.close_button, .x_lines) path {
            transition:
                stroke-dasharray var(--press-time) var(--press-ease),
                stroke-dashoffset var(--press-time) var(--press-ease);
        }

        @media (hover: hover) and (pointer: fine) {
            .close_button:hover path,
            .viewer_x:has(.close_button:hover) .x_lines path {
                stroke-dasharray: 0.8 1;
                stroke-dashoffset: -0.1;
            }
        }
        .dialog_box {
            transition: translate var(--press-time) var(--press-ease);
        }
        .overlay_root:has(> .backdrop:active) > .dialog_box.panel {
            translate: 16px 0;
        }
        .dialog_box:global(.is_swiping) {
            transition: none;
        }

        .close_button:is(:active, :global(.is_pressed)) path,
        .viewer_x:has(.close_button:is(:active, :global(.is_pressed))) .x_lines path {
            stroke-dasharray: 0.6 1;
            stroke-dashoffset: -0.2;
        }
    }
</style>
