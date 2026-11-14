<script>
    import { Tween } from 'svelte/motion';
    import { cubicInOut } from 'svelte/easing';
    import { press_release } from '$lib/actions/press_release.js';
    import { css_time, reduced_motion } from '$lib/motion/settings.js';
    import ArrowIcon from '$lib/components/icons/arrow_icon.svelte';
    import { project_frame } from '$lib/geometry/project_frame.js';
    let { name, href, logo, logo_ratio = 2.1, logo_height = 48, year, links, color, children } = $props();
    const primary_links = $derived(
        links ?? [
            {
                href,
                label: href.replace(/^https?:\/\//, '').replace(/\/$/, ''),
            },
        ],
    );
    let logo_failed = $state(false);
    let card;
    let gap = $state({ start: 16, end: 700 });
    let size = $state({ width: 400, height: 360 });
    const fold = new Tween(0, { easing: cubicInOut });
    const outline = $derived(project_frame(size, gap, fold.current));
    const TOUCH_LINGER_MS = 300;
    let link_hovered = $state(false);
    let touch_idle;
    function set_fold(active) {
        clearTimeout(touch_idle);
        link_hovered = active;
        fold.set(active ? 1 : 0, { duration: reduced_motion() ? 0 : css_time(card, '--press-time') });
    }
    const link_events = {
        onpointerenter: (event) => {
            if (event.pointerType === 'mouse') set_fold(true);
        },
        onpointerleave: (event) => {
            if (event.pointerType === 'mouse') set_fold(false);
        },
        onpointerdown: (event) => {
            if (event.pointerType !== 'mouse') set_fold(true);
        },
        onpointerup: (event) => {
            if (event.pointerType !== 'mouse')
                touch_idle = setTimeout(() => set_fold(false), TOUCH_LINGER_MS);
        },
        onpointercancel: (event) => {
            if (event.pointerType !== 'mouse') set_fold(false);
        },
    };
    $effect(() => () => clearTimeout(touch_idle));
    function measure_outline(node) {
        const link = node.querySelector('.project_links');
        const observer = new ResizeObserver(() => {
            const frame = node.getBoundingClientRect();
            const label = link.getBoundingClientRect();
            if (!frame.width) return;
            size = { width: frame.width, height: frame.height };
            node.style.setProperty('--project-link-inset', `${label.height / 2 + 5}px`);
            gap = {
                start: Math.max(16, ((label.left - frame.left) / frame.width) * 1000),
                end: Math.min(982, ((label.right - frame.left) / frame.width) * 1000),
            };
        });
        observer.observe(node);
        observer.observe(link);
        return { destroy: () => observer.disconnect() };
    }
</script>

<article
    bind:this={card}
    use:measure_outline
    style:--live-img-avg={color}
    class:link_hovered
    class="project_entry has_badge relative isolate flex flex-col items-start p-gutter"
>
    <svg
        class="project_outline pointer-events-none absolute inset-0 -z-1 h-full w-full"
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
        aria-hidden="true"
    >
        <path
            d={outline}
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            vector-effect="non-scaling-stroke"
        />
    </svg>
    <div class="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-gutter">
        <div class="flex min-h-12 shrink-0 items-center justify-between gap-control">
            <h3 class="flex min-w-0 items-start font-display text-[2rem] leading-none">
                {#if logo && !logo_failed}
                    <span
                        class="project_logo"
                        role="img"
                        aria-label={name}
                        style:--logo-image={`url("${logo}")`}
                        style:--logo-ratio={logo_ratio}
                        style:--logo-height={logo_height + 'px'}
                    >
                        <img
                            src={logo}
                            alt=""
                            aria-hidden="true"
                            class="hidden"
                            decoding="async"
                            draggable="false"
                            onerror={() => (logo_failed = true)}
                        />
                    </span>
                {:else}
                    {name}
                {/if}
            </h3>
            {#if year}
                <span
                    class="fg-muted inline-flex shrink-0 select-none items-center self-start gap-1.5 whitespace-nowrap font-hand text-2xl leading-none"
                    aria-label={year}
                >
                    {#each year.split(' - ') as part, index}
                        {#if index > 0}<span class="year_suffix" aria-hidden="true">-</span>{/if}
                        <span class:year_suffix={index > 0} aria-hidden="true">{part}</span>
                    {/each}
                </span>
            {/if}
        </div>
        <div class="project_description fg-soft min-h-0 w-full flex-1 text-ui">
            <div class="flex max-w-[46ch] flex-col gap-copy">
                {@render children()}
            </div>
        </div>
    </div>
    <div class="project_links flex w-fit items-center gap-control px-inline text-2xl">
        {#each primary_links as link, index (link.href)}
            {#if index > 0}<span class="fg-faint" aria-hidden="true">-</span>{/if}
            <a
                href={link.href}
                aria-label={`${name} ${link.label}`}
                target="_blank"
                {...link_events}
                rel="noopener noreferrer"
                use:press_release
                class="arrow_link link-soft tap-target flex min-w-0 items-center gap-inline"
            >
                {link.label}<ArrowIcon />
            </a>
        {/each}
    </div>
</article>

<style>
    .project_logo {
        display: block;
        width: calc(var(--logo-height) * var(--logo-ratio));
        max-width: 100%;
        height: var(--logo-height);
        background-color: currentColor;
        mask: var(--logo-image) left center / contain no-repeat;
    }
    .year_suffix {
        translate: 0 -3px;
    }
    .project_entry {
        --project-line-opacity: 0.045;
        --project-tint-color: var(--color-mauve-100);
        color: var(--project-tint-color);
        min-height: clamp(18rem, 26vw, 22rem);
        padding-bottom: calc(var(--spacing-gutter) + var(--project-link-inset, 21px));
    }
    .project_entry.link_hovered,
    .project_entry:has(.project_links a:is(:active, :global(.is_pressed))) {
        --project-tint-color: color-mix(in oklab, var(--color-mauve-100) 55%, var(--avg-text));
    }
    .project_description {
        text-wrap: pretty;
    }
    .project_outline {
        opacity: var(--project-line-opacity);
    }
    @media (prefers-reduced-motion: no-preference) {
        .project_entry {
            transition: --project-tint-color calc(var(--press-time) * 3) var(--ease-out);
        }
    }
    .project_links {
        position: absolute;
        bottom: 5px;
        left: calc(var(--spacing-gutter) - var(--spacing) * 2);
        translate: 0 50%;
        max-width: calc(100% - var(--spacing-gutter) * 2);
    }
    @media (width < 48rem) {
        .project_entry {
            min-height: 0;
        }
        .project_description {
            overflow: visible;
        }
        .project_links {
            font-size: clamp(1rem, 4.8vw, 1.25rem);
        }
    }
</style>
