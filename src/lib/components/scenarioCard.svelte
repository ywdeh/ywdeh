<script>
    import { get_average_color } from '$lib/image_average_color.js';
    let { src, thumbnail = src, alt, title, client, video = false, left = false, onclick } = $props();

    let cardEl = $state();
    let figureEl = $state();
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

    function extractColor(imgEl) {
        if (!figureEl) return;

        const run = () => {
            const color = get_average_color(imgEl);
            if (color) {
                figureEl.style.setProperty("--live-img-avg", color);
            }
        };

        if (imgEl.complete) {
            run();
        } else {
            imgEl.addEventListener("load", run, { once: true });
        }
    }
</script>

<figure
    bind:this={figureEl}
    onmouseenter={() => (isHovered = true)}
    onmouseleave={() => (isHovered = false)}
    class="group transition relative rounded-2xl">
    <button
        bind:this={cardEl}
        {onclick}
        class="transition flex flex-col gap-4 cursor-pointer text-left w-full relative z-10">

        <div class="rounded-xl overflow-hidden">
            <img
                onload={(e) => extractColor(e.currentTarget)}
                src={showFull ? src : thumbnail}
                {alt}
                class="transition-all bg-neutral-950/20 object-cover duration-400 aspect-4/3
                        saturate-0 group-hover:saturate-100 size-full"
                class:object-center={!left}
                class:object-left={left}
                class:group-hover:object-right={left}
                class:saturate-100={isCentered}
                crossorigin="anonymous" draggable="false"
            />
        </div>

        <div class="flex justify-between">
            <h3 class="live-tint">{title}</h3>
            <p class="live-tint opacity-40">{client}</p>
        </div>
    </button>
</figure>

<style>
    figure::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: inherit;
        background: oklch(from var(--live-img-avg, oklch(20.5% 0 none)) calc(l + 0.2) calc(c * 1.5) h / 12%);
        opacity: 0;
        transition: opacity 0.14s ease-in-out, inset 0.14s ease-in-out;
        pointer-events: none;
    }

    figure:hover::before {
        opacity: 1;
        inset: -10px;
    }

    .live-tint {
        transition: color 0.14s;
        opacity: 1;
    }

    figure:hover .live-tint {
        color: oklch(from var(--live-img-avg, oklch(70% 0 none)) clamp(0.85, l, 0.9) max(calc(c * 0.55), 0.015) h);
    }
</style>