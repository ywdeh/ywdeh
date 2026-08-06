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

    <div class="relative rounded-xl overflow-hidden">

    <img
        src={showFull ? src : thumbnail}
        {alt}
        onmouseenter={() => (isHovered = true)}
        onmouseleave={() => (isHovered = false)}
        class="transition-all bg-neutral-950/20 object-cover duration-400 aspect-4/3
                saturate-0 hover:saturate-100"
        class:object-center={!left}
        class:object-left={left}
        class:hover:scale-102={!left}
        class:hover:object-right={left}
        class:saturate-100={isCentered}
    />

    </div>

    <div class="flex justify-between">
        <h3>{title}</h3>
        <p class="opacity-40">{client}</p>
    </div>
</button>