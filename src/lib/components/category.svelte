<script>
    import HandLine from "./hand_line.svelte";
    // count: number of cards inside; when given, the last row is finished with one empty gray block
    // stretched across however many columns are left
    let { children, title, anchor, count = 0 } = $props();

    // columns left in the last row at 2 columns (md) and 3 columns (lg+)
    const fill_2 = $derived(count ? (2 - count % 2) % 2 : 0);
    const fill_3 = $derived(count ? (3 - count % 3) % 3 : 0);
</script>

<div class="flex flex-col gap-6 md:gap-8 lg:gap-10">
    <div class="flex gap-5 items-center justify-between text-2xl" id={anchor}>
        {#if title}
            <h2>{title}</h2>
        {/if}
        <HandLine class="flex-1" />
    </div>

    <!-- gaps leave empty ground between hover outlines (which reach 10px past each card), less on smaller screens -->
    <div class="cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 md:gap-x-8 md:gap-y-10 lg:gap-x-10 lg:gap-y-12">
        {@render children?.()}
        {#if fill_2 || fill_3}
            <div aria-hidden="true" class="filler hidden rounded-xl bg-mauve-100/3"
                class:md-show={fill_2} class:lg-show={fill_3}
                style:--span-md={fill_2 || 1} style:--span-lg={fill_3 || 1}></div>
        {/if}
    </div>
</div>

<style>
    /* the block is as tall as one card image (4:3 of a single column), however many columns it spans */
    .cards { container-type: inline-size; --gap: calc(var(--spacing) * 6); /* matches the gap-x-* steps */ }

    @media (min-width: 768px) and (max-width: 1023.98px) {
        .cards { --gap: calc(var(--spacing) * 8); }
        .filler.md-show {
            display: block;
            grid-column: span var(--span-md);
            height: calc((100cqw - var(--gap)) / 2 * 3 / 4);
        }
    }
    @media (min-width: 1024px) {
        .cards { --gap: calc(var(--spacing) * 10); }
        .filler.lg-show {
            display: block;
            grid-column: span var(--span-lg);
            height: calc((100cqw - 2 * var(--gap)) / 3 * 3 / 4);
        }
    }
</style>
