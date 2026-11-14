<script>
    import DividerStars from '$lib/components/decorations/divider_stars.svelte';
    import HandLine from '$lib/components/decorations/hand_line.svelte';
    let { children, title, anchor, columns = 3 } = $props();
    const stars = {
        'case-studies': {
            star_position: 'calc(100% - var(--divider-star-inset))',
            single_star: true,
            large_transform: 'translate(13 12) skewX(4) scale(.92 .8) translate(-13 -12)',
        },
        gallery: {
            star_position: 'calc(100% - var(--divider-star-inset) - clamp(30px, 3.4vw, 45px))',
            large_transform: 'translate(0 12) skewX(-13) scale(1.06 .93) translate(0 -12)',
            small_transform: 'translate(43 12) skewX(16) scale(.86 1.14) translate(-33 -12)',
        },
        default: {
            star_position: 'calc(100% - var(--divider-star-inset) - clamp(30px, 3.4vw, 45px))',
            large_transform: 'translate(0 12) skewX(5) translate(0 -12)',
            small_transform: 'translate(7 12) skewX(-10) translate(0 -12)',
        },
    };
    const star_props = $derived(stars[anchor] ?? stars.default);
</script>

<div class="category flex flex-col gap-gutter">
    <div class="flex items-center justify-between gap-copy text-xl md:text-2xl" id={anchor}>
        {#if title}
            <h2 class="whitespace-nowrap">{title}</h2>
        {/if}
        <div class="category_divider relative min-w-0 flex-1 overflow-x-clip">
            <HandLine class="w-full" />
            {#if title}
                <div class="category_stars absolute inset-0">
                    <DividerStars {...star_props} />
                </div>
            {/if}
        </div>
    </div>

    <div class="category_grid grid gap-card-gap" class:three_up={columns === 3}>
        {@render children?.()}
    </div>
</div>

<style>
    .category {
        container-type: inline-size;
    }
    .category_grid {
        grid-template-columns: minmax(0, 1fr);
    }
    @container (width >= 40rem) {
        .category_grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }
    @container (width >= 86rem) {
        .category_grid.three_up {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }
    }
    @container (width < 40rem) {
        .category_grid:has(> :global(.project_entry)) {
            row-gap: calc(var(--spacing-card-gap) + var(--spacing-copy));
        }
    }

    .category_divider {
        container-type: inline-size;
    }
    @container (width < 8rem) {
        .category_stars {
            display: none;
        }
    }
</style>
