<script>
    import { fade } from 'svelte/transition';
    import { motion_ms } from '$lib/motion/timing.js';

    let { paths, motion = 'trim', morphs = {}, stroke = 2, crossfade = false, class: classes = '' } = $props();

    const closed = (d) => d.endsWith('Z');
</script>

{#snippet drawing()}
    {#each paths as d (d)}
        {#if morphs[d]}
            <path
                {d}
                class="morph"
                style:--d={`path('${d}')`}
                style:--d-hover={`path('${morphs[d][0]}')`}
                style:--d-press={`path('${morphs[d][1]}')`}
            />
        {:else if closed(d)}
            <path {d} class="stroke-squeeze" />
        {:else}
            <path {d} pathLength="1" class={motion === 'nudge' ? 'stroke-nudge' : 'stroke-trim'} />
        {/if}
    {/each}
{/snippet}

<svg
    class="icon {classes}"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width={stroke}
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
>
    {#if crossfade}
        {#key paths}
            <g transition:fade={{ duration: motion_ms('--duration-press') }}>{@render drawing()}</g>
        {/key}
    {:else}
        {@render drawing()}
    {/if}
</svg>

<style>
    .icon {
        flex-shrink: 0;
        overflow: visible;
        opacity: var(--icon-opacity, 1);
    }

    .morph {
        d: var(--d);
    }

    @media (prefers-reduced-motion: no-preference) {
        .morph {
            transition: d var(--icon-duration) var(--icon-ease);
        }

        @media (hover: hover) and (pointer: fine) {
            :global(.icon-host:hover) .morph {
                d: var(--d-hover);
            }
        }

        :global(.icon-host:is(:active, .is_pressed)) .morph {
            d: var(--d-press);
        }
    }
</style>
