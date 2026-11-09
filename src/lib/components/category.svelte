<script>
    import HandLine from "./hand_line.svelte";
    let { children, title, anchor } = $props();
</script>

<div class="flex flex-col gap-6 md:gap-8 lg:gap-10">
    <div class="flex gap-5 items-center justify-between text-2xl" id={anchor}>
        {#if title}
            <!-- stays on one line; the hand-drawn line beside it gives way instead -->
            <h2 class="whitespace-nowrap">{title}</h2>
        {/if}
        <HandLine class="flex-1" />
    </div>

    <!-- gaps leave empty ground between hover outlines (which reach 10px past each card), less on smaller screens -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 md:gap-x-8 md:gap-y-10 lg:gap-x-10 lg:gap-y-12">
        {@render children?.()}
    </div>
</div>
