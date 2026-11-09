<script>
    // a personal project: its picture fills the top of the card and fades into the page, with the name,
    // what it is, a short description and a visit link sitting on the faded part. The whole card opens the
    // case study; the hover outline takes on the picture's average color, like the case study cards.
    import { card_release } from "$lib/card_release.js";
    import { get_average_color } from "$lib/image_average_color.js";
    import VisitButton from "./visit_button.svelte";

    let { src, alt, name, kind, role, href, link_label, onclick, preload, children } = $props();

    let figureEl = $state();
    let isCentered = $state(false);

    // colors in while it crosses the middle of the screen, like the cards
    $effect(() => {
        if (!figureEl) return;
        const observer = new IntersectionObserver(([entry]) => (isCentered = entry.isIntersecting),
            { rootMargin: "-50% 0px -50% 0px", threshold: 0 });
        observer.observe(figureEl);
        return () => observer.disconnect();
    });

    function take_color(img) {
        const color = get_average_color(img);
        if (color) figureEl?.style.setProperty('--live-img-avg', color);
    }
</script>

<figure bind:this={figureEl} class="project" class:is_centered={isCentered} onmouseenter={preload}>
    <!-- the whole card opens the case study; the text above it lets clicks through, except the visit link -->
    <button type="button" class="project_trigger" aria-label="{name}, {kind}" use:card_release
        {onclick} onfocus={preload} onpointerdown={preload}>
        <img {src} {alt} draggable="false" crossorigin="anonymous"
            onload={(event) => take_color(event.currentTarget)} />
    </button>

    <div class="project_content">
        <div class="flex flex-col gap-1">
            <div class="flex items-baseline justify-between gap-4">
                <h3 class="tinted text-2xl">{name}</h3>
                {#if role}<p class="text-sm opacity-40">{role}</p>{/if}
            </div>
            <p class="tinted opacity-60">{kind}</p>
        </div>
        <p class="description opacity-60">{@render children()}</p>
        <span class="pointer-events-auto w-fit">
            <VisitButton {href}>{link_label}</VisitButton>
        </span>
    </div>
</figure>

<style>
    .project {
        position: relative;
        border-radius: var(--radius-2xl);
        container-type: inline-size;
    }

    /* the hover outline, tinted by the picture (same recipe as the case study cards) */
    .project::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: oklch(from var(--live-img-avg, oklch(20.5% 0.004 325.6)) calc(l + 0.2) calc(c * 1.5) h / 12%);
        opacity: 0;
        pointer-events: none;
    }
    .project:is(:hover, :focus-within)::before { opacity: 1; inset: -10px; }
    .project:has(> .project_trigger:is(:active, :global(.is_pressed)))::before { inset: -4px; }

    .project_trigger {
        position: absolute;
        inset: 0;
        border-radius: var(--radius-xl);
        clip-path: inset(0 round var(--radius-xl));
    }
    .project_trigger:is(:active, :global(.is_pressed)) { clip-path: inset(6px round var(--radius-xl)); }

    /* the picture covers the top of the card and fades out into the text below it */
    .project_trigger img {
        position: absolute;
        inset: 0 0 auto 0;
        width: 100%;
        height: 62.5cqw; /* 16:10 */
        object-fit: cover;
        object-position: 65% 60%;
        mask-image: linear-gradient(to bottom, black 45%, transparent 100%);
        filter: saturate(0) sepia(0.1);
    }
    .project:is(:hover, :focus-within, .is_centered) .project_trigger img { filter: saturate(1) sepia(0); }

    .project_content {
        position: relative;
        z-index: 1;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        gap: calc(var(--spacing) * 4);
        padding-top: 50cqw; /* starts where the picture is already fading */
    }
    .description { max-width: 36rem; }

    .tinted { transition: color 140ms; }
    .project:is(:hover, :focus-within) .tinted {
        color: oklch(from var(--live-img-avg, oklch(70% 0.01 325.6)) clamp(0.85, l, 0.9) max(calc(c * 0.55), 0.015) h);
    }

    @media (prefers-reduced-motion: no-preference) {
        .project::before { transition: opacity 140ms ease-in-out, inset 140ms var(--ease-out); }
        .project_trigger { transition: clip-path 140ms var(--ease-out); }
        .project_trigger img { transition: filter 400ms; }
    }
</style>
