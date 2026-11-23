<script>
    import { fade } from 'svelte/transition';
    import { motion_ms } from '$lib/motion/timing.js';

    let { paths, icon, children } = $props();

    const ICON_GRID = 24;
    const id = $props.id();
</script>

<span class="negative_icon">
    <svg class="absolute size-0" aria-hidden="true">
        <mask id="{id}-mask" maskContentUnits="objectBoundingBox">
            <g
                transform="scale({1 / ICON_GRID})"
                fill="none"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                {#if icon}
                    {@render icon()}
                {:else}
                    {#key paths}
                        <g transition:fade={{ duration: motion_ms('--duration-press') }}>
                            {#each paths as d (d)}<path {d} pathLength="1" class="stroke-trim" />{/each}
                        </g>
                    {/key}
                {/if}
            </g>
        </mask>
    </svg>
    <span class="negative" aria-hidden="true" style:--negative-mask="url(#{id}-mask)"></span>
    {@render children()}
</span>

<style>
    .negative_icon {
        --negative-strength: 0.85;
        position: relative;
        display: flex;
    }

    .negative {
        position: absolute;
        top: var(--spacing-inline);
        left: var(--spacing-inline);
        width: 2rem;
        height: 2rem;
        pointer-events: none;
        -webkit-mask: var(--negative-mask);
        mask: var(--negative-mask);
        -webkit-backdrop-filter: grayscale(1) contrast(6) invert(1);
        backdrop-filter: grayscale(1) contrast(6) invert(1);
        opacity: calc(var(--shown, 1) * var(--negative, 0) * var(--negative-strength));
    }

    .negative_icon:has(:focus-visible) {
        --negative-strength: 1;
    }

    @media (hover: hover) {
        .negative_icon:has(:global(.icon-host:hover)) {
            --negative-strength: 1;
        }
    }

    .negative_icon:has(:global(.icon-host:is(:active, .is_pressed))) {
        --negative-strength: 0.85;
    }

    @media (prefers-reduced-motion: no-preference) {
        @media (hover: hover) and (pointer: fine) {
            .negative_icon:has(:global(.icon-host:hover)) {
                --icon-trim: var(--trim-hover);
                --icon-shift: var(--trim-shift-hover);
                --icon-squeeze: var(--squeeze-hover);
            }
        }

        .negative_icon:has(:global(.icon-host:is(:active, .is_pressed))) {
            --icon-trim: var(--trim-press);
            --icon-shift: var(--trim-shift-press);
            --icon-squeeze: var(--squeeze-press);
        }
    }
</style>
