<script>
    import DividerStars from "./divider_stars.svelte";
    import HandLine from "./hand_line.svelte";
    // columns: how many cards share a row on wide screens (2 or 3); phones always stack them
    let { children, title, anchor, columns = 3 } = $props();

    // each section's divider gets its own hand-placed stars, so no two look stamped out of one mold
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

<div class="flex flex-col gap-gutter">
    <div class="flex items-center justify-between gap-copy text-xl md:text-2xl" id={anchor}>
        {#if title}
            <!-- stays on one line; the hand-drawn line beside it gives way instead -->
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

    <div class="category_grid grid grid-cols-1 gap-card-gap md:grid-cols-2 {columns === 3 ? 'lg:grid-cols-3' : ''}">
        {@render children?.()}
    </div>
</div>

<style>
    .category_divider { container-type: inline-size; }
    @container (width < 8rem) {
        .category_stars { display: none; }
    }
    @media (width < 48rem) {
        .category_grid:has(> :global(.project_entry)) {
            row-gap: calc(var(--spacing-card-gap) + var(--spacing-copy));
        }
    }
</style>
