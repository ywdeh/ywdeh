<script>
    import { badges_state } from '$lib/controllers/badge.svelte.js';
    import { strokes } from '$lib/geometry/strokes.js';

    let { kind = 'open' } = $props();
    let element = $state();
    let icon = $state();

    const badge = {
        get kind() {
            return kind;
        },
        get element() {
            return element;
        },
        get icon() {
            return icon;
        },
        host: null,
    };

    $effect(() => {
        badge.host = element.parentElement.closest('.tinted');
        if (!badge.host) return;
        badges_state.register(badge);
        return () => badges_state.unregister(badge);
    });
</script>

<span
    bind:this={element}
    class="badge"
    class:shown={badges_state.current === badge}
    class:superseded={!!badges_state.current && badges_state.current !== badge}
    aria-hidden="true"
>
    <span class="disc">
        <svg
            bind:this={icon}
            viewBox="0 0 40 40"
            fill="none"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            {#each strokes[kind] as d (d)}<path {d} />{/each}
        </svg>
    </span>
</span>

<style>
    .badge {
        --badge-size: 40px;
        position: absolute;
        left: calc(50% - var(--badge-size) / 2);
        bottom: calc(var(--badge-size) / -2);
        z-index: 2;
        width: var(--badge-size);
        height: var(--badge-size);
        pointer-events: none;
    }

    .disc {
        display: block;
        height: 100%;
        border-radius: 9999px;
        background: linear-gradient(var(--tint-glow) 0 0), var(--color-surface);
        color: var(--tint-ink);
        opacity: 0;
        scale: 0.8;
    }

    :global([role='dialog']) .disc {
        background: var(--color-surface);
        color: var(--color-ink);
    }

    svg {
        display: block;
        width: 100%;
        height: 100%;
        stroke: currentColor;
    }

    .shown .disc {
        opacity: 1;
        scale: 1;
    }

    .superseded .disc {
        opacity: 0;
        transition: none;
    }

    :global(:is(:active, .is_pressed)) > .badge,
    :global(:is(:active, .is_pressed)) > :global(*) > .badge {
        translate: 0 calc(-1 * var(--press-inset));
    }

    @media (prefers-reduced-motion: no-preference) {
        .badge {
            transition: translate var(--duration-press) var(--ease-press);
        }

        .disc {
            transition:
                opacity var(--duration-press) var(--ease-out),
                scale 200ms var(--ease-out);
        }
    }
</style>
