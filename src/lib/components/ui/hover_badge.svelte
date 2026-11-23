<script>
    import { badges_state } from '$lib/controllers/badge.svelte.js';
    import { menu } from '$lib/controllers/context_menu.svelte.js';
    import { strokes } from '$lib/geometry/strokes.js';
    import Icon from '$lib/components/ui/icon.svelte';

    let { kind = 'open', host, tinted = true } = $props();
    let element = $state();
    const paths = $derived(kind === 'open' ? strokes.arrow : strokes[kind]);

    const badge = {
        get kind() {
            return kind;
        },
        get element() {
            return element;
        },
        get host() {
            return host;
        },
    };

    $effect(() => {
        if (!host) return;
        badges_state.register(badge);
        return () => badges_state.unregister(badge);
    });
</script>

<span
    bind:this={element}
    class="badge"
    class:shown={badges_state.current === badge && !menu.open}
    class:muted={menu.open}
    aria-hidden="true"
>
    <span class="disc" class:tinted>
        <Icon {paths} motion={kind === 'open' ? 'nudge' : 'trim'} class="size-6" />
    </span>
</span>

<style>
    .badge {
        --badge-size: 40px;
        --badge-fillet: 0.3;
        position: absolute;
        left: calc(50% - var(--badge-size) / 2);
        bottom: calc(var(--badge-size) / -2);
        z-index: var(--level-float);
        width: var(--badge-size);
        height: var(--badge-size);
        pointer-events: none;
        opacity: var(--outline-shown);
        translate: 0 var(--badge-lift, 0);
    }

    .badge.muted {
        opacity: 0;
    }

    :global(:is(:active, .is_pressed)) > .badge,
    :global(:is(:active, .is_pressed)) > :global(*) > .badge {
        --badge-lift: calc(-1 * var(--press-inset));
    }

    .disc {
        --fillet: calc(var(--badge-size) / 2 * var(--badge-fillet));
        --fillet-reach: calc(var(--badge-size) / 2 * sqrt(1 + 2 * var(--badge-fillet)));
        position: relative;
        isolation: isolate;
        display: grid;
        place-items: center;
        height: 100%;
        border-radius: 9999px;
        background: var(--color-surface);
        color: var(--color-ink);
        opacity: var(--badge-idle-opacity, 0);
        scale: 0.8;
    }

    .disc::before,
    .disc::after {
        content: '';
        position: absolute;
        bottom: 50%;
        z-index: -1;
        width: var(--fillet-reach);
        height: var(--fillet);
        background: inherit;
        --fillet-mask: radial-gradient(
            circle at var(--fillet-side) 0,
            transparent var(--fillet),
            #000 calc(var(--fillet) + 0.5px)
        );
        -webkit-mask: var(--fillet-mask);
        mask: var(--fillet-mask);
    }

    .disc::before {
        --fillet-side: 0;
        right: 50%;
    }

    .disc::after {
        --fillet-side: 100%;
        left: 50%;
    }

    .disc.tinted {
        background:
            linear-gradient(oklch(from var(--tint-glow) l c h / calc(alpha * var(--outline-shown))) 0 0),
            var(--color-surface);
        color: var(--tint-ink);
    }

    .shown .disc {
        opacity: 1;
        scale: 1;
    }

    @media (prefers-reduced-motion: no-preference) {
        .badge {
            transition:
                translate var(--duration-press) var(--ease-press),
                opacity var(--duration-press) var(--ease-press);
        }

        :global(:is(:active, .is_pressed)) > .badge,
        :global(:is(:active, .is_pressed)) > :global(*) > .badge {
            --icon-trim: var(--trim-press);
            --icon-nudge: var(--nudge-press);
        }

        .disc {
            transition:
                opacity var(--duration-press) var(--ease-press),
                scale var(--duration-pop) var(--ease-out);
        }
    }
</style>
