<script>
    import { press } from '$lib/actions/press.js';
    import { strokes } from '$lib/geometry/strokes.js';

    let { href, external = false, class: class_name = '', children, ...rest } = $props();
</script>

<a
    use:press
    {href}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    class="arrow_link link-soft tap-target flex items-center gap-inline {class_name}"
    {...rest}
>
    {@render children()}
    <svg
        class="size-6 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        aria-hidden="true"
    >
        {#each strokes.arrow as d (d)}<path {d} pathLength="1" />{/each}
    </svg>
</a>

<style>
    path {
        stroke-dasharray: 1 1;
    }

    @media (prefers-reduced-motion: no-preference) {
        path {
            transition:
                stroke-dasharray 120ms var(--ease-out),
                translate 120ms var(--ease-out);
        }

        @media (hover: hover) and (pointer: fine) {
            .arrow_link:hover path {
                stroke-dasharray: 0.8 1;
                translate: -1.06px 1.06px;
            }
        }

        .arrow_link:is(:active, :global(.is_pressed)) path {
            stroke-dasharray: 0.6 1;
            translate: -2.12px 2.12px;
        }
    }
</style>
