<script>
    import { card_release } from "$lib/card_release.js";
    import Footer from "./footer.svelte";
    import { fade } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import { setContext, untrack } from "svelte";
    import { unzoom_before_close } from "$lib/image_pan_zoom.js";
    import { fly, flight_duration, picture_box, when_painted } from "$lib/image_flight.js";
    import { reduced_motion } from "$lib/motion.js";

    // origin: for the image viewer, the <img> on the page it was opened from; the picture flies out of that
    // spot to the middle of the screen (and back into it on close), leaving its grey block meanwhile
    // natural: the picture's { width, height }, to work out where it lands before it has been laid out
    let { title, onclose, children, gallery = false, suspended = false, open_image, tint_backdrop = true, origin, natural } = $props();
    const heading_id = $props.id();
    // an image viewer opened from inside a case study (it leaves the dimming to the panel underneath)
    const nested = $derived(gallery && !tint_backdrop);
    let close_button = $state();
    let dialog = $state();
    const backdrop_tint = 'bg-neutral-950/70 backdrop-saturate-0 backdrop-sepia-10';
    // case studies open as a panel sliding in from the right; the dimmed page stays visible beside it on wider screens
    const panel_box = 'inset-y-0 right-0 w-full md:w-[85%] lg:w-1/2 lg:min-w-[48rem] md:rounded-l-card';
    setContext('case_image_viewer', untrack(() => open_image));

    function duration(ms) {
        return reduced_motion() ? 0 : ms;
    }

    // ── the image viewer's picture flies out of its spot on the page and back (see image_flight.js) ──
    // While it's out, its spot on the page shows its grey block; while the stand-in is flying, the viewer's
    // own picture is hidden under it.
    let flight = null;
    let closing = false;
    // kept here: a viewer opened from a case study loses its origin prop as soon as it starts closing
    let home;

    // where the enlarged picture will sit: measured if it's already laid out, otherwise worked out the
    // way the viewer lays it out (fitted into the viewing area, never past its own size, centered)
    function landing_box(node) {
        // (only once it has loaded: until then a very wide picture sits at its minimum width, far
        // smaller than where it ends up)
        const enlarged = node.querySelector('.trail_image img');
        const measured = enlarged?.complete && enlarged.naturalWidth && enlarged.getBoundingClientRect();
        if (measured?.width && measured?.height) return measured;
        const area = node.querySelector('.gallery_image_viewport')?.getBoundingClientRect();
        if (!area?.width || !natural?.width || !natural?.height) return null;
        const fit = Math.min(1, area.width / natural.width, area.height / natural.height);
        const width = natural.width * fit;
        const height = natural.height * fit;
        return { left: area.left + (area.width - width) / 2, top: area.top + (area.height - height) / 2, width, height };
    }

    // starts the picture's flight; false if it can't fly (no spot to fly from, reduced motion, nothing
    // measurable), and the viewer falls back to a plain fade
    function fly_picture(node, direction) {
        const picture = node.querySelector('.trail_image.gallery');
        const enlarged = picture?.querySelector('img');
        if (direction === 'in') home = origin;
        if (!picture || !enlarged || !home?.isConnected || !flight_duration()) return false;

        if (direction === 'out') {
            closing = true;
            // closed while still opening: it simply turns round from wherever it is
            if (flight) {
                flight.reverse();
                return true;
            }
            flight = fly(enlarged, picture_box(home), picture_box(enlarged), 'out');
        } else {
            // the full picture if it's already in (it starts loading when the card is hovered), otherwise the
            // card's own copy until it is
            const ready = enlarged.complete && enlarged.naturalWidth;
            flight = fly(home, picture_box(home), landing_box(node), 'in', ready ? enlarged.currentSrc : undefined);
            if (flight && !ready) {
                const stand_in = flight.element;
                enlarged.decode().then(() => { if (stand_in.isConnected) stand_in.src = enlarged.currentSrc; }, () => {});
            }
        }
        if (!flight) return false;

        const current = flight;
        const spot = home;
        picture.style.visibility = 'hidden';
        // the spot on the page empties only once the stand-in is on screen over it, so there's no blank frame
        if (direction === 'in') when_painted(current).then(() => { if (!closing) spot.style.visibility = 'hidden'; });
        current.finished.then(async () => {
            // the card only had a small copy, so the full-size picture may still be on its way: the stand-in
            // (that copy, already at full size) holds the spot until it's decoded, so there's no blank frame
            if (direction === 'in' && !closing) await enlarged.decode().catch(() => {});
            // closed meanwhile: the stand-in is flying back, so wait for it to land on the page
            if (direction === 'in' && closing) await current.element.getAnimations()[0]?.finished.catch(() => {});
            // whatever the stand-in landed on shows again, and the stand-in goes a frame later
            (closing ? spot : picture).style.visibility = '';
            requestAnimationFrame(() => {
                current.remove();
                if (flight === current) flight = null;
            });
        });
        return true;
    }

    // safety net: never leave the page's picture hidden or a stand-in behind
    $effect(() => () => {
        flight?.remove();
        if (home) home.style.visibility = '';
    });

    function viewer_transition(node, direction) {
        if (gallery) {
            // the flight runs on its own; this only keeps the viewer around until it has landed
            if (fly_picture(node, direction)) return { duration: flight_duration() };
            return {
                duration: duration(350),
                easing: cubicOut,
                css: (t) => `transform: scale(${0.9 + 0.1 * t}); opacity: ${t}`
            };
        }

        return {
            duration: duration(350),
            easing: cubicOut,
            css: (t) => 'transform: translateX(' + ((1 - t) * 100) + '%)'
        };
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
    <button type="button" bind:this={close_button} use:focus_close use:card_release aria-label={label} onclick={request_close}
        class="close_button link-quiet pointer-events-auto block shrink-0 p-2 transition-opacity motion-reduce:transition-none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            class="size-8 text-mauve-300" aria-hidden="true">
            <path d="M6.1 6.5Q12.5 11.6 17.7 17.8" pathLength="1" />
            <path d="M17.5 6.2Q12.8 12.2 6.5 17.5" pathLength="1" />
        </svg>
    </button>
{/snippet}

<div class="overlay_root fixed inset-0 z-90 flex items-center justify-center" inert={suspended}>
    <!-- pressing the empty space beside a case study nudges the panel right, hinting it's about to close -->
    <button type="button" aria-label="Close overlay" tabindex="-1" onclick={() => gallery ? close_button?.click() : onclose()}
        class="backdrop fixed inset-0 backdrop-blur-sm {tint_backdrop ? backdrop_tint : ''}"
        transition:fade|global={{ duration: duration(400) }}></button>

    <div bind:this={dialog} role="dialog" aria-modal="true" aria-labelledby={heading_id}
        class:z-0={!gallery}
        class:panel={!gallery}
        class="dialog_box flex flex-col overflow-y-auto font-normal scrollbar-none! overscroll-contain {gallery ? 'pointer-events-none absolute inset-0 px-viewer py-(--viewer-gap-y)' : `fixed bg-neutral-900 ${panel_box}`}"
        in:viewer_transition|global={'in'}
        out:viewer_transition|global={'out'}>
        {#if !gallery}
            <header class="z-80 sticky top-0 flex w-full shrink-0 justify-between gap-copy bg-neutral-900 px-panel py-(--panel-heading-space)">
                <h1 id={heading_id} class="text-case-heading">{title}</h1>
                <!-- while an image is open on top, the viewer's X stands in for this one at the exact same spot -->
                <span class="-m-2" class:invisible={suspended}>{@render close('Close case study')}</span>
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
                <Footer />
            </div>
        {/if}
    </div>

    {#if gallery}
        <!-- sits at the same spot as the case study panel's X (its header's padding, less the button's -m-2),
             outside the viewer's animation; opened from a case study it swaps in instantly, so it reads as one X
             that never moves (1ms, not 0: a 0ms outro would skip hiding it, leaving it visible while the viewer
             fades out) -->
        <header class="z-80 fixed top-[calc(var(--panel-heading-space)_-_0.5rem)] right-[calc(var(--spacing-panel)_-_0.5rem)]"
            in:fade|global={{ duration: nested ? 1 : duration(350) }}
            out:fade|global={{ duration: nested ? 1 : duration(350) }}>
            <h1 id={heading_id} class="text-case-heading sr-only">{title}</h1>
            {@render close('Close image')}
        </header>
    {/if}

    {#if suspended && !gallery && tint_backdrop}
        <div aria-hidden="true"
            class="pointer-events-none fixed z-10 {panel_box} {backdrop_tint}"
            transition:fade|global={{ duration: duration(350), easing: cubicOut }}></div>
    {/if}
</div>

<style>
    .close_button path {
        stroke-dasharray: 1 1;
        stroke-dashoffset: 0;
    }

    @media (prefers-reduced-motion: no-preference) {
        .close_button path {
            transition: stroke-dasharray var(--press-time) var(--press-ease), stroke-dashoffset var(--press-time) var(--press-ease);
        }

        @media (hover: hover) and (pointer: fine) {
            .close_button:hover path {
                stroke-dasharray: 0.8 1;
                stroke-dashoffset: -0.1;
            }
        }

        /* pressing the empty space beside a case study nudges the panel right, hinting it's about to close
           (the image viewer has no such hint: it would fight the picture's flight back to the page).
           Uses translate, not transform, so it adds to the slide animation instead of fighting it */
        .dialog_box { transition: translate var(--press-time) var(--press-ease); }
        .overlay_root:has(> .backdrop:active) > .dialog_box.panel { translate: 16px 0; }

        .close_button:is(:active, :global(.is_pressed)) path {
            stroke-dasharray: 0.6 1;
            stroke-dashoffset: -0.2;
        }
    }
</style>
