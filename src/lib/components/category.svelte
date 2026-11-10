<script>
    import DividerStars from "./divider_stars.svelte";
    import HandLine from "./hand_line.svelte";
    let { children, title, anchor } = $props();

    // each section's divider gets its own hand-placed stars, so no two look stamped out of one mold
    const stars = {
        'case-studies': {
            star_position: '36%',
            single_star: true,
            large_transform: 'translate(1 12) skewX(14) scale(.88 1.08) translate(0 -12)',
            large_shape: 'M9 2C10 2 10.2 7.6 13 9.3C16 11.2 24.5 10.8 24.5 12C24.5 13 16 13.1 13.6 16C11.8 18 12 25 10.8 25C9.8 25 9.9 18.2 8 15.6C6.2 13.2 2 13.2 2 12C2 10.9 6.2 10.9 7.4 8.8C8.7 6.6 7.9 2 9 2Z',
        },
        gallery: {
            star_position: '73%',
            large_transform: 'translate(0 12) skewX(-13) scale(1.06 .93) translate(0 -12)',
            small_transform: 'translate(43 12) skewX(16) scale(.86 1.14) translate(-33 -12)',
        },
        default: {
            star_position: '58%',
            large_transform: 'translate(0 12) skewX(5) translate(0 -12)',
            small_transform: 'translate(7 12) skewX(-10) translate(0 -12)',
        },
    };
    const star_props = $derived(stars[anchor] ?? stars.default);
</script>

<div class="flex flex-col gap-6 md:gap-8 lg:gap-10">
    <div class="flex items-center justify-between gap-5 text-2xl" id={anchor}>
        {#if title}
            <!-- stays on one line; the hand-drawn line beside it gives way instead -->
            <h2 class="whitespace-nowrap">{title}</h2>
        {/if}
        <div class="relative min-w-0 flex-1">
            <HandLine class="w-full" />
            {#if title}
                <DividerStars {...star_props} />
            {/if}
        </div>
    </div>

    <!-- gaps leave empty ground between hover outlines (which reach 10px past each card), less on smaller screens -->
    <div class="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-12">
        {@render children?.()}
    </div>
</div>
