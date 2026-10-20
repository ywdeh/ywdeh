<script>
    import { get_average_color } from '$lib/image_average_color.js';
    let { title, description, href, icon, preview, stack = [], title_font = 'inherit' } = $props();
    let card_element = $state();
    let is_centered = $state(false);

    $effect(() => {
        if (!card_element) return;
        const observer = new IntersectionObserver(
            ([entry]) => { is_centered = entry.isIntersecting; },
            { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
        );
        observer.observe(card_element);
        return () => observer.disconnect();
    });

    function extract_color(event) {
        const color = get_average_color(event.currentTarget);
        if (color) card_element.style.setProperty('--live-img-avg', color);
    }
</script>

<a class="project_card" bind:this={card_element} class:is_centered {href} target="_blank" rel="noopener noreferrer" aria-label={`${title} — visit project (opens in a new tab)`}>
    {#if preview}
        <div class="project_backdrop" aria-hidden="true">
            <img class="project_preview" src={preview} onload={extract_color} alt="" loading="lazy" draggable="false" />
        </div>
    {/if}
    <div class="project_details">
        <div class="project_header">
        <div class="project_intro">
            <h3 style:font-family={title_font}>{title}</h3>
            <p class="project_description">{description}</p>
        </div>
        <div class="project_visual" aria-hidden="true">
            <img class="project_icon" src={icon} onload={preview ? undefined : extract_color} alt="" width="112" height="112" draggable="false" />
        </div>
        </div>
        <div class="project_meta">
        <ul class="project_stack" aria-label="Built with">
            {#each stack as technology}
                <li>{technology}</li>
            {/each}
        </ul>
        <span class="project_destination">
            {new URL(href).hostname}
            <span class="project_arrow" aria-hidden="true"></span>
        </span>
        </div>
    </div>
</a>

<style>
    .project_card {
        grid-column: 1 / -1;
        position: relative;
        isolation: isolate;
        padding: calc(var(--spacing) * 5);
        border-radius: var(--radius-2xl);
        --project-tint: oklch(from var(--live-img-avg, oklch(70% 0 none)) clamp(0.85, l, 0.9) max(calc(c * 0.55), 0.015) h);
    }

    .project_backdrop {
        position: absolute;
        inset: 0;
        z-index: 1;
        border-radius: var(--radius-xl);
        overflow: hidden;
        pointer-events: none;
    }

    .project_backdrop::after {
        content: '';
        position: absolute;
        inset: 0;
        background: color-mix(in oklab, var(--color-neutral-900) 45%, transparent);
    }

    .project_preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        transform: scale(1.06);
        filter: blur(3px) saturate(0);
        opacity: 0.85;
        transition: filter 400ms;
    }

    .project_card:hover .project_preview,
    .project_card:focus-visible .project_preview,
    .is_centered .project_preview { filter: blur(3px) saturate(1); }

    .project_card::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: inherit;
        background: color-mix(in oklab, var(--project-tint) 12%, transparent);
        opacity: 0;
        transition: opacity 0.14s ease-in-out, inset 0.14s ease-in-out;
        pointer-events: none;
    }

    .project_card:hover::before, .project_card:focus-visible::before {
        opacity: 1;
        inset: -10px;
    }

    .project_card:focus-visible { outline: none; }
    .project_card:focus-visible::before { background: color-mix(in oklab, var(--project-tint) 22%, transparent); }

    .project_details {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: calc(var(--spacing) * 60);
        gap: calc(var(--spacing) * 5);
    }
    .project_header { display: flex; justify-content: space-between; align-items: stretch; gap: calc(var(--spacing) * 5); }
    .project_intro { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: calc(var(--spacing) * 2); }
    .project_meta { display: flex; flex-direction: column; gap: calc(var(--spacing) * 2); }
    .project_details { transition: color 0.14s; }
    h3 { font-size: var(--text-4xl); line-height: var(--text-4xl--line-height); }
    .project_card:hover .project_details, .project_card:focus-visible .project_details {
        color: var(--project-tint);
    }
    .project_description { opacity: 0.6; }
    .project_stack { display: flex; flex-wrap: wrap; opacity: 0.4; }
    .project_stack li:not(:last-child)::after { content: ',\00a0'; }
    .project_destination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: calc(var(--spacing) * 2);
        font-size: var(--text-base);
        line-height: var(--text-base--line-height);
        opacity: 0.6;
        transition: opacity 0.14s;
    }
    .project_arrow {
        width: calc(var(--spacing) * 6);
        height: calc(var(--spacing) * 6);
        flex-shrink: 0;
        background-color: currentColor;
        mask: url('/arrow_outward.svg') center / contain no-repeat;
    }
    .project_card:hover .project_destination, .project_card:focus-visible .project_destination { opacity: 0.9; }
    .project_visual {
        position: relative;
        flex-shrink: 0;
        align-self: flex-start;
        width: calc(var(--spacing) * 18);
        aspect-ratio: 1;
    }
    .project_icon { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; border-radius: var(--radius-xl); box-shadow: 0 0 8px 0 rgb(0 0 0 / 5%); filter: saturate(0); transition: filter 400ms; }
    .project_card:hover .project_icon, .project_card:focus-visible .project_icon, .is_centered .project_icon { filter: saturate(1); }

    @media (min-width: 768px) {
        .project_card { padding: calc(var(--spacing) * 10); }
        h3 { font-size: var(--text-5xl); line-height: var(--text-5xl--line-height); }
        .project_visual { width: calc(var(--spacing) * 20); }
    }

    @media (max-width: 767px) {
        .project_details { min-height: 0; gap: calc(var(--spacing) * 8); }
        .project_header { gap: calc(var(--spacing) * 4); }
    }

    @media (prefers-reduced-motion: reduce) {
        .project_card::before, .project_destination, .project_icon, .project_preview, .project_details { transition: none; }
    }
</style>
