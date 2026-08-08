<script>
    let { pictures = [] } = $props();

    let activeIndex = $state(0);
    let dragOffset = $state(0);
    let isDragging = $state(false);
    let containerWidth = $state(0);

    let container;

    let startX = 0;
    let currentX = 0;

    function next() {
        activeIndex = Math.min(activeIndex + 1, pictures.length - 1);
    }
    function prev() {
        activeIndex = Math.max(activeIndex - 1, 0);
    }
    function select(i) {
        activeIndex = i;
    }

    function onPointerDown(e) {
        if (pictures.length <= 1) return;
        isDragging = true;
        startX = e.clientX;
        currentX = e.clientX;
        container.setPointerCapture(e.pointerId);
    }
    function onPointerMove(e) {
        if (!isDragging) return;
        currentX = e.clientX;
        let delta = currentX - startX;

        // resist
        if ((activeIndex === 0 && delta > 0) || (activeIndex === pictures.length - 1 && delta < 0)) {
            delta *= 0.35;
        }
        dragOffset = delta;
    }
    function onPointerUp() {
        if (!isDragging) return;
        isDragging = false;

        const threshold = containerWidth * 0.06;
        if (dragOffset < -threshold) {
            next();
        } else if (dragOffset > threshold) {
            prev();
        }
        dragOffset = 0;
    }
</script>

<div class="flex flex-col gap-3">
    <div role="button" tabindex="0"
        bind:this={container}
        bind:clientWidth={containerWidth}
        onpointerdown={onPointerDown}
        onpointermove={onPointerMove}
        onpointerup={onPointerUp}
        onpointercancel={onPointerUp}
        class="relative w-full overflow-hidden rounded-xl bg-mauve-100/5 touch-pan-y {pictures.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''}"
    >
        <div
            class="flex h-full will-change-transform"
            style="transform: translateX(calc(-{activeIndex * 100}% + {dragOffset}px)); transition: {isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)'};"
        >
            {#each pictures as img}
                <img
                    src={img.src}
                    alt={img.alt ?? ""}
                    draggable="false"
                    class="w-full h-full object-cover shrink-0"
                />
            {/each}
        </div>
    </div>

    {#if pictures.length > 1}
        <div class="flex flex-wrap gap-3">
            {#each pictures as img, i}
                <button
                    onclick={() => select(i)}
                    aria-label={`Show image ${i + 1}`}
                    class="flex shrink-0 h-14 md:h-18 aspect-4/3 object-left overflow-hidden transition rounded-xl cursor-pointer
                        {i === activeIndex ? 'ring-4 ring-mauve-50/5 opacity-100' : 'opacity-60 hover:opacity-100'}"
                >
                    <img src={img.src} alt={img.alt ?? ""} class="w-full h-full object-cover" />
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    img {
        border-radius: 0;
    }
</style>