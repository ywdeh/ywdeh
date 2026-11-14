<script module>
    // only one badge shows at a time, across every card on the page
    let active_badge = $state();
    let release_active; // hands the previous badge's motion back when another one takes over
    // the open arrow's tilt carries over from one card to the next, so moving between cards stays fluid
    let arrow_motion = { angle: 0, target: 0 };
</script>

<script>
    // the round badge straddling a card's bottom edge: it follows the mouse along that edge, and the
    // 'open' arrow tilts with the pointer's sideways speed. Hangs off the nearest .has_badge element.
    // kind: 'open' (an arrow) or 'zoom' (a magnifying glass)
    let { kind = 'open' } = $props();

    let badge = $state();
    let icon = $state();
    const RADIUS = 20; // px, half the badge

    $effect(() => {
        const host = badge?.closest('.has_badge');
        if (!host) return;
        const reduced_motion = matchMedia('(prefers-reduced-motion: reduce)');
        let target = null;
        let x = null;
        let frame;
        let last;
        let angle = 0;
        let target_angle = 0;
        let previous_x;
        let moving = false;
        let returning = false;
        let turn_idle;
        let rest_idle;

        function stop() {
            cancelAnimationFrame(frame);
            frame = undefined;
            clearTimeout(turn_idle);
            clearTimeout(rest_idle);
            turn_idle = rest_idle = undefined;
        }

        function deactivate() {
            stop();
            if (kind === 'open') arrow_motion = { angle, target: target_angle };
        }

        function claim() {
            if (release_active !== deactivate) release_active?.();
            release_active = deactivate;
            active_badge = badge;
        }

        function place() {
            // glides with transform, leaving translate free for the card's press and scale for showing up
            badge.style.left = x === null ? '' : '0px';
            badge.style.transform = x === null ? '' : `translateX(${x - RADIUS}px)`;
            icon.style.rotate = `${angle}deg`;
        }

        function wake() {
            if (frame !== undefined || active_badge !== badge || x === null) return;
            last = performance.now();
            frame = requestAnimationFrame(step);
        }

        function pointer_x(event) {
            const bounds = badge.offsetParent.getBoundingClientRect();
            const inset = Math.min(RADIUS, bounds.width / 2);
            return Math.min(bounds.width - inset, Math.max(inset, event.clientX - bounds.left));
        }

        function settle_arrow() {
            moving = false;
            returning = false;
            target_angle = angle <= -45 ? -90 : 0;
            wake();
        }

        function turn_arrow(event) {
            const delta = event.clientX - (previous_x ?? event.clientX);
            previous_x = event.clientX;
            if (kind !== 'open' || !delta || reduced_motion.matches) return;
            clearTimeout(rest_idle);
            rest_idle = undefined;
            if (!moving) target_angle = angle;
            moving = true;
            returning = false;
            target_angle = Math.max(-90, Math.min(0, target_angle + delta * 1.4));
            clearTimeout(turn_idle);
            turn_idle = setTimeout(settle_arrow, 140);
        }

        function step(now) {
            const dt = Math.min(Math.max(now - last, 0), 50) / 1000;
            last = now;
            x += (target - x) * (1 - Math.exp(-dt * 14));
            angle += (target_angle - angle) * (1 - Math.exp(-dt * (returning ? 5 : 12)));
            const position_done = Math.abs(target - x) < 0.3;
            const rotation_done = Math.abs(target_angle - angle) < 0.1;
            if (position_done) x = target;
            if (rotation_done) {
                angle = target_angle;
                if (!moving && angle !== 0 && rest_idle === undefined) {
                    rest_idle = setTimeout(() => {
                        returning = true;
                        target_angle = 0;
                        wake();
                    }, 1000);
                }
            }
            place();
            frame = position_done && rotation_done ? undefined : requestAnimationFrame(step);
        }

        function enter(event) {
            claim();
            stop();
            if (event.pointerType !== 'mouse') {
                x = target = null;
                angle = target_angle = 0;
                place();
                return;
            }
            previous_x = event.clientX;
            if (kind === 'open' && !reduced_motion.matches) {
                angle = arrow_motion.angle;
                target_angle = arrow_motion.target;
                settle_arrow();
            }
            x = target = pointer_x(event);
            place();
            if (!reduced_motion.matches) wake();
        }

        function move(event) {
            if (event.pointerType !== 'mouse') return;
            if (active_badge !== badge) {
                enter(event);
                return;
            }
            turn_arrow(event);
            target = pointer_x(event);
            if (x === null || reduced_motion.matches) {
                x = target;
                place();
            } else wake();
        }

        function focus() {
            if (active_badge === badge) return;
            claim();
            stop();
            x = target = null;
            angle = target_angle = 0;
            moving = returning = false;
            place();
        }

        function leave() {
            if (active_badge !== badge) return;
            deactivate();
            release_active = undefined;
            active_badge = undefined;
            if (host.matches(':focus-within')) focus();
        }

        function blur(event) {
            if (!host.contains(event.relatedTarget) && !host.matches(':hover')) leave();
        }

        function change_motion() {
            if (active_badge !== badge) return;
            stop();
            if (reduced_motion.matches) {
                x = target;
                angle = target_angle = 0;
                moving = returning = false;
                place();
            } else {
                if (x !== null) wake();
            }
        }

        host.addEventListener('pointerenter', enter);
        host.addEventListener('pointermove', move);
        host.addEventListener('pointerleave', leave);
        host.addEventListener('focusin', focus);
        host.addEventListener('focusout', blur);
        reduced_motion.addEventListener('change', change_motion);
        return () => {
            if (active_badge === badge) {
                deactivate();
                release_active = undefined;
                active_badge = undefined;
            } else stop();
            host.removeEventListener('pointerenter', enter);
            host.removeEventListener('pointermove', move);
            host.removeEventListener('pointerleave', leave);
            host.removeEventListener('focusin', focus);
            host.removeEventListener('focusout', blur);
            reduced_motion.removeEventListener('change', change_motion);
        };
    });
</script>

<span class="card_badge" class:shown={active_badge === badge}
    class:superseded={!!active_badge && active_badge !== badge} aria-hidden="true" bind:this={badge}>
    <svg bind:this={icon} viewBox="0 0 40 40" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        /* exactly what the hover outline looks like: its tint over the page background, made solid
           so it reads the same over the picture too */
        background: linear-gradient(var(--avg-outline) 0 0), var(--color-neutral-900);
        color: var(--avg-text);
        opacity: 0;
        scale: 0.8;
    }
    /* inside a case study panel it's simply the panel's own background, as if cut out of it */
    :global([role="dialog"]) .card_badge { background: var(--color-neutral-900); }
    svg { display: block; width: 40px; height: 40px; stroke: currentColor; }
    .card_badge.shown { opacity: 1; scale: 1; }
    .card_badge.superseded { opacity: 0; transition: none; }
    /* rides along with the picture's bottom edge as a pressed card insets */
    :global(:is(:active, .is_pressed)) > .card_badge,
    :global(:is(:active, .is_pressed)) > :global(*) > .card_badge { translate: 0 calc(-1 * var(--press-inset)); }

    @media (prefers-reduced-motion: no-preference) {
        .card_badge { transition: opacity var(--press-time) var(--ease-out), scale 200ms var(--ease-out), translate var(--press-time) var(--press-ease); }
    }
</style>
