<script>
    import { strokes } from '$lib/geometry/strokes.js';

    let { swapped = false, inline = false, fit = false, stroke = 2, class: classes = '' } = $props();

    const id = $props.id();
    const cut = (other) => `url(#${id}-${other})`;
</script>

{#snippet sheets()}
    <g class="copy" class:swapped class:fit style:--icon-stroke={stroke}>
        <defs>
            {#each ['first', 'second'] as sheet (sheet)}
                <mask id="{id}-{sheet}" maskUnits="userSpaceOnUse" x="-4" y="-4" width="32" height="32">
                    <rect x="-4" y="-4" width="32" height="32" fill="#fff" stroke="none" />
                    <path
                        d={strokes.sheet}
                        class="sheet {sheet}"
                        fill="#000"
                        stroke="#000"
                        stroke-width={stroke + 4}
                    />
                </mask>
            {/each}
        </defs>
        <g class="stroke-squeeze">
            <g class="layer" style:mask={swapped ? cut('second') : 'none'}><path d={strokes.sheet} class="sheet first" /></g>
            <g class="layer" style:mask={swapped ? 'none' : cut('first')}><path d={strokes.sheet} class="sheet second" /></g>
        </g>
    </g>
{/snippet}

{#if inline}
    {@render sheets()}
{:else}
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
        {@render sheets()}
    </svg>
{/if}

<style>
    .icon {
        flex-shrink: 0;
        overflow: visible;
        opacity: var(--icon-opacity, 1);
    }

    .copy {
        --sheet-front: 4.25px, 7px;
        --sheet-back: 8.25px, 3px;
    }

    .copy.fit {
        transform-box: view-box;
        transform-origin: 12px 11.75px;
        scale: var(--copy-fit);
    }

    .copy.fit .stroke-squeeze {
        stroke-width: calc(var(--icon-stroke) / var(--copy-fit) / var(--icon-squeeze));
    }
    .sheet.first,
    .swapped .sheet.second {
        transform: translate(var(--sheet-front));
    }

    .sheet.second,
    .swapped .sheet.first {
        transform: translate(var(--sheet-back));
    }

    @media (prefers-reduced-motion: no-preference) {
        .sheet {
            transition: transform var(--duration-quick) var(--ease-press);
        }

        .layer {
            transition: mask var(--duration-quick) allow-discrete;
        }
    }
</style>
