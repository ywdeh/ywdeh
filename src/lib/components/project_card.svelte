<script>
    import { card_release } from '$lib/card_release.js';
    import ArrowIcon from "./arrow_icon.svelte";
    import TrailImage from "./trail_image.svelte";
    import { get_average_color } from '$lib/image_average_color.js';
    let { title, description, href, icon, preview, preview_alt = '', stack = [], title_font = 'inherit' } = $props();
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

<a class="project_card arrow_link" bind:this={card_element} use:card_release={'.project_image'} class:is_centered {href} target="_blank" rel="noopener noreferrer" aria-label={`${title} — visit project (opens in a new tab)`}>
    {#if preview}
        <TrailImage class="project_image" src={preview}>
            <img class="project_preview" src={preview} onload={extract_color} alt={preview_alt} loading="lazy" draggable="false" />
        </TrailImage>
    {/if}
    <div class="project_details">
        <div class="project_header">
            <div class="project_intro">
                <h3 style:font-family={title_font}>{title}</h3>
                <p class="project_description">{description}</p>
            </div>
            <TrailImage src={icon} class="shrink-0">
                <img class="project_icon" src={icon} alt="" width="48" height="48" draggable="false" />
            </TrailImage>
        </div>
        <div class="project_meta">
            <ul class="project_stack" aria-label="Built with">
                {#each stack as technology}<li>{technology}</li>{/each}
            </ul>
            <span class="project_destination">
                {new URL(href).hostname}
                <ArrowIcon />
            </span>
        </div>
    </div>
</a>

<style>
    .project_card {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
        grid-template-areas: 'details preview';
        gap: calc(var(--spacing) * 8);
        position: relative;
        isolation: isolate;
        border-radius: var(--radius-2xl);
        --project-tint: oklch(from var(--live-img-avg, oklch(70% 0.01 325.6)) clamp(0.85, l, 0.9) max(calc(c * 0.55), 0.015) h);
    }
    .project_card::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: inherit;
        background: oklch(from var(--live-img-avg, oklch(20.5% 0.004 325.6)) calc(l + 0.2) calc(c * 1.5) h / 12%);
        opacity: 0;
        transition: opacity 0.14s ease-in-out, inset 140ms var(--ease-out);
        pointer-events: none;
    }
    .project_card:hover::before, .project_card:focus-visible::before { opacity: 1; inset: -10px; }
    .project_card:is(:active, :global(.is_pressed))::before { inset: -4px; }
    .project_card:focus-visible { outline: none; }
    .project_card :global(.project_image) { grid-area: preview; position: relative; overflow: hidden; border-radius: var(--radius-xl); background: rgb(0 0 0 / 20%); clip-path: inset(0 round var(--radius-xl)); }
    .project_card:is(:active, :global(.is_pressed)) :global(.project_image) { clip-path: inset(6px round var(--radius-xl)); }
    .project_card:is(:active, :global(.is_pressed)) .project_preview { padding: 6px; }

    @media (prefers-reduced-motion: no-preference) {
        .project_card :global(.project_image) { transition: clip-path 140ms var(--ease-out); }
        .project_card .project_preview { transition: filter 400ms, padding 140ms var(--ease-out); }
    }
    .project_preview {
        display: block;
        width: 100%;
        height: 100%;
        aspect-ratio: 2 / 1;
        object-fit: cover;
        object-position: right center;
        filter: saturate(0);
        transition: filter 400ms;
        user-select: none;
    }
    .project_card:hover .project_preview, .project_card:focus-visible .project_preview, .is_centered .project_preview { filter: saturate(1); }
    .project_details { grid-area: details; display: flex; flex-direction: column; justify-content: space-between; gap: calc(var(--spacing) * 8); padding: var(--details-padding, calc(var(--spacing) * 4)) 0; min-width: 0; transition: color 0.14s, padding 140ms var(--ease-out); }
    .project_card:is(:active, :global(.is_pressed)) .project_details { padding: calc(var(--details-padding, calc(var(--spacing) * 4)) + 6px) 6px; }
    .project_header { display: flex; justify-content: space-between; align-items: flex-start; gap: calc(var(--spacing) * 4); }
    .project_intro { min-width: 0; display: flex; flex-direction: column; gap: calc(var(--spacing) * 2); }
    h3 { font-size: var(--text-4xl); line-height: var(--text-4xl--line-height); }
    .project_description { opacity: 0.6; text-wrap: pretty; }
    .project_icon { flex-shrink: 0; width: calc(var(--spacing) * 12); height: auto; border-radius: var(--radius-xl); box-shadow: 0 0 8px rgb(0 0 0 / 5%); filter: saturate(0); transition: filter 400ms; user-select: none; }
    .project_card:hover .project_icon, .project_card:focus-visible .project_icon, .is_centered .project_icon { filter: saturate(1); }
    .project_meta { display: flex; flex-direction: column; gap: calc(var(--spacing) * 2); }
    .project_stack { display: flex; flex-wrap: wrap; opacity: 0.4; }
    .project_stack li:not(:last-child)::after { content: ',\00a0'; }
    .project_destination { display: flex; align-items: center; justify-content: center; gap: calc(var(--spacing) * 2); font-size: var(--text-base); line-height: var(--text-base--line-height); opacity: 0.6; transition: opacity 0.14s; }
    .project_card:hover .project_details, .project_card:focus-visible .project_details { color: var(--project-tint); }
    .project_card:hover .project_destination, .project_card:focus-visible .project_destination { opacity: 0.9; }
    @media (min-width: 768px) { h3 { font-size: var(--text-5xl); line-height: var(--text-5xl--line-height); } }
    @media (max-width: 767px) {
        .project_card { grid-template-columns: minmax(0, 1fr); grid-template-areas: 'preview' 'details'; gap: calc(var(--spacing) * 4); }
        .project_details { --details-padding: 0px; }
    }
    @media (prefers-reduced-motion: reduce) { .project_card::before, .project_preview, .project_icon, .project_details, .project_destination { transition: none; } }
</style>
