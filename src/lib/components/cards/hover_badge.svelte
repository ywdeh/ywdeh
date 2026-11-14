<script>
    import { badge_controller } from '$lib/controllers/badge_controller.svelte.js';
    let { kind = 'open' } = $props();
    let element = $state();
    let icon = $state();
    const self = {
        get kind() {
            return kind;
        },
        get element() {
            return element;
        },
        get icon() {
            return icon;
        },
        card: null,
    };
    $effect(() => {
        self.card = element.parentElement.closest('.has_badge');
        if (!self.card) return;
        badge_controller.register(self);
        return () => badge_controller.unregister(self);
    });
</script>

<span
    class="card_badge"
    class:shown={badge_controller.current === self}
    class:superseded={!!badge_controller.current && badge_controller.current !== self}
    aria-hidden="true"
    bind:this={element}
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
            {#if kind === 'zoom'}
                <path
                    d="M17.1 12.6C19.4 11.8 23.6 13.5 24.3 16.6C25 19.2 23 22.9 20.4 23.9C17.5 25 13.8 23.2 12.9 20.6C11.7 17.9 13.6 13.7 17.1 12.6Z"
                />
                <path d="M22.3 22.6Q23.7 25.4 27 27" />
            {:else}
                <path d="M15 24.8Q20.3 20.6 24.7 15.3M17.3 15.7Q21.1 14.9 24.7 15.3Q25.1 19.1 24.5 22.7" />
            {/if}
        </svg>
    </span>
</span>

<style>
    .card_badge {
        position: absolute;
        left: calc(50% - 20px);
        bottom: -20px;
        z-index: 2;
        width: 40px;
        height: 40px;
        pointer-events: none;
    }
    .disc {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(var(--avg-outline) 0 0), var(--color-neutral-900);
        color: var(--avg-text);
        opacity: 0;
        scale: 0.8;
    }
    :global([role='dialog']) .disc {
        background: var(--color-neutral-900);
    }
    svg {
        display: block;
        width: 40px;
        height: 40px;
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
    :global(:is(:active, .is_pressed)) > .card_badge,
    :global(:is(:active, .is_pressed)) > :global(*) > .card_badge {
        translate: 0 calc(-1 * var(--press-inset));
    }

    @media (prefers-reduced-motion: no-preference) {
        .card_badge {
            transition: translate var(--press-time) var(--press-ease);
        }
        .disc {
            transition:
                opacity var(--press-time) var(--ease-out),
                scale 200ms var(--ease-out);
        }
    }
</style>
