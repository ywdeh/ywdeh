<script>
    let { color = "currentColor" } = $props();
</script>

<!-- stroke goes through style, not the attribute, so CSS variables like var(--color-mauve-300) work -->
<svg class="size-6 shrink-0" viewBox="0 0 24 24" fill="none" style:stroke={color}
    stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <path d="M17.3 6.7Q12.6 6.2 7.5 7.1" pathLength="1" />
    <path d="M17.3 6.7Q17.9 11.7 17.1 16.5" pathLength="1" />
    <path d="M17.3 6.7Q12.8 12.1 6.5 17.4" pathLength="1" />
</svg>

<style>
    path { stroke-dasharray: 1 1; }

    @media (prefers-reduced-motion: no-preference) {
        path { transition: stroke-dasharray 120ms var(--ease-out), translate 120ms var(--ease-out); }

        @media (hover: hover) and (pointer: fine) {
            :global(.arrow_link:hover) path {
                stroke-dasharray: 0.8 1;
                translate: -1.06px 1.06px;
            }
        }

        :global(.arrow_link:is(:active, .is_pressed)) path {
            stroke-dasharray: 0.6 1;
            translate: -2.12px 2.12px;
        }
    }
</style>
