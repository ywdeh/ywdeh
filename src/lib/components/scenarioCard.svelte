<script>
    let { src, thumbnail = src, alt, title, client, video = false, left = false, onclick } = $props();

    let cardEl = $state();
    let isCentered = $state(false);
    let isHovered = $state(false);

    let showFull = $derived(isCentered || isHovered);

    $effect(() => {
        if (!cardEl) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                isCentered = entry.isIntersecting;
            },
            {
                rootMargin: "-50% 0px -50% 0px",
                threshold: 0,
            }
        );
        observer.observe(cardEl);
        return () => observer.disconnect();
    });
</script>

<button
    bind:this={cardEl}
    {onclick}
    class="transition flex flex-col gap-4 cursor-pointer text-left w-full">

    <figure class="transition relative rounded-xl overflow-hidden hover:ring-4" data-props-for="img-color">

    <img
        src={showFull ? src : thumbnail}
        {alt}
        onmouseenter={() => (isHovered = true)}
        onmouseleave={() => (isHovered = false)}
        class="transition-all bg-neutral-950/20 object-cover duration-400 aspect-4/3
                saturate-0 hover:saturate-100"
        class:object-center={!left}
        class:object-left={left}
        class:hover:object-right={left}
        class:saturate-100={isCentered}
    />

    </figure>

    <div class="flex justify-between">
        <h3>{title}</h3>
        <p class="opacity-40">{client}</p>
    </div>
</button>

<style>
    figure {
        --tw-ring-color: oklch(from var(--live-img-avg) calc(l + 0.2) calc(c * 1.5) h / 20%);
    }
</style>