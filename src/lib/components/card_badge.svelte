<script>
    // a small round badge with an icon that appears on hover/focus: an arrow for cards that open something,
    // a plus for pictures that zoom. The circle is the card outline's color (the picture's average color,
    // --live-img-avg, lifted the same way); the icon is the light caption tint. Shown by any `.has_badge` ancestor.
    // It straddles the bottom edge of its positioned parent (the picture), half on it and half below,
    // and slides along that edge to sit under the mouse (centered for keyboard focus and touch).
    let { kind = 'open' } = $props();

    let badge = $state();    const R = 20; // badge radius; it keeps this far from the corners

    $effect(() => {
        const host = badge?.closest('.has_badge');
        if (!host) return;
        let target = null; // px from the picture's left edge to the badge's center; null = centered
        let x = null;
        let frame;

        const place = () => (badge.style.left = x === null ? '' : `${x - R}px`);

        function pointer_x(event) {
            const bounds = badge.offsetParent.getBoundingClientRect();
            return Math.min(bounds.width - R, Math.max(R, event.clientX - bounds.left));
        }

        // glides after the pointer, easing in and out of each move, like the wide pictures' pan
        let last;
        function step(now) {
            const dt = Math.min(now - (last ?? now), 50) / 1000;
            last = now;
            x += (target - x) * (1 - Math.exp(-dt * 14));
            if (Math.abs(target - x) < 0.3) {
                x = target;
                frame = undefined;
            } else {
                frame = requestAnimationFrame(step);
            }
            place();
        }

        // it's hidden until hover, so on entering it jumps straight to the pointer instead of sliding in
        function enter(event) {
            if (event.pointerType !== 'mouse') return;
            cancelAnimationFrame(frame);
            frame = undefined;
            target = x = pointer_x(event);
            place();
        }
        function move(event) {
            if (event.pointerType !== 'mouse') return;
            target = pointer_x(event);
            if (x === null || matchMedia('(prefers-reduced-motion: reduce)').matches) {
                x = target;
                place();
                return;
            }
            if (!frame) {
                last = undefined;
                frame = requestAnimationFrame(step);
            }
        }

        host.addEventListener('pointerenter', enter);
        host.addEventListener('pointermove', move);
        return () => {
            cancelAnimationFrame(frame);
            host.removeEventListener('pointerenter', enter);
            host.removeEventListener('pointermove', move);
        };
    });
</script>

<span class="card_badge" aria-hidden="true" bind:this={badge}>
    <svg viewBox="0 0 40 40" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        {#if kind === 'zoom'}
            <!-- magnifying glass -->
            <path d="M17.1 12.6C19.4 11.8 23.6 13.5 24.3 16.6C25 19.2 23 22.9 20.4 23.9C17.5 25 13.8 23.2 12.9 20.6C11.7 17.9 13.6 13.7 17.1 12.6Z" />
            <path d="M22.3 22.6Q23.7 25.4 27 27" />
        {:else}
            <path d="M15 24.8Q20.3 20.6 24.7 15.3M17.3 15.7Q21.1 14.9 24.7 15.3Q25.1 19.1 24.5 22.7" />
        {/if}
    </svg>
</span>

<style>
    .card_badge {
        position: absolute;
        left: calc(50% - 20px);
        bottom: -20px;
        z-index: 2;
        width: 40px;
        height: 40px;
        border-radius: 999px;
        pointer-events: none;
        /* exactly what the hover outline looks like: its 12% tint over the page background, made solid
           so it reads the same over the picture too */
        background:
            linear-gradient(oklch(from var(--live-img-avg, oklch(20.5% 0.004 325.6)) calc(l + 0.2) calc(c * 1.5) h / 12%) 0 0),
            var(--color-neutral-900);
        color: oklch(from var(--live-img-avg, oklch(70% 0.01 325.6)) clamp(0.85, l, 0.9) max(calc(c * 0.55), 0.015) h);
        opacity: 0;
        scale: 0.8;
    }
    /* inside a case study panel it's simply the panel's own background, as if cut out of it */
    :global([role="dialog"]) .card_badge { background: var(--color-neutral-900); }
    svg { display: block; width: 40px; height: 40px; stroke: currentColor; }

    :global(.has_badge:is(:hover, :focus-visible, :focus-within)) .card_badge { opacity: 1; scale: 1; }
    /* rides along with the picture's bottom edge as a pressed card insets */
    :global(:is(:active, .is_pressed)) > .card_badge,
    :global(:is(:active, .is_pressed)) > :global(*) > .card_badge { translate: 0 -6px; }

    @media (prefers-reduced-motion: no-preference) {
        .card_badge { transition: opacity 140ms var(--ease-out), scale 200ms var(--ease-out), translate 140ms var(--ease-out); }
    }
</style>
