<script>
    import { press } from '$lib/actions/press.js';
    import { strokes } from '$lib/geometry/strokes.js';

    let { label, onclick, element = $bindable() } = $props();

    const focus = (node) => node.focus({ preventScroll: true });
</script>

<button
    type="button"
    bind:this={element}
    use:focus
    use:press
    aria-label={label}
    {onclick}
    class="close_button link-quiet pointer-events-auto block shrink-0 p-2"
>
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        class="size-8 text-ink-dim"
        aria-hidden="true"
    >
        {#each strokes.close as d (d)}<path {d} pathLength="1" />{/each}
    </svg>
</button>

<style>
    path {
        stroke-dasharray: 1 1;
        stroke-dashoffset: 0;
    }

    @media (prefers-reduced-motion: no-preference) {
        .close_button {
            transition: opacity var(--duration-press) var(--ease-out);
        }

        path {
            transition:
                stroke-dasharray var(--duration-press) var(--ease-press),
                stroke-dashoffset var(--duration-press) var(--ease-press);
        }

        @media (hover: hover) and (pointer: fine) {
            .close_button:hover path {
                stroke-dasharray: 0.8 1;
                stroke-dashoffset: -0.1;
            }
        }

        .close_button:is(:active, :global(.is_pressed)) path {
            stroke-dasharray: 0.6 1;
            stroke-dashoffset: -0.2;
        }
    }
</style>
