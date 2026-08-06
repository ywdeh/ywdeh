<script>
    let { children, title, anchor } = $props();
</script>

<div class="flex flex-col gap-10">
    <div class="flex gap-5 items-center justify-between text-2xl" id={anchor}>
        {#if title}
            <h2>{title}</h2>
        {/if}
        <div class="h-px flex-1 bg-mauve-100/5"></div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-10 md:gap-y-5">
        {@render children?.()}
    </div>
</div>