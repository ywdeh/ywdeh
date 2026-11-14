<script>
    import { Tween } from 'svelte/motion';
    import { cubicInOut } from 'svelte/easing';
    import { motion_ms, TOUCH_LINGER_MS } from '$lib/motion/timing.js';
    import { project_frame } from '$lib/geometry/project_frame.js';
    import ArrowLink from '$lib/components/ui/arrow_link.svelte';

    let { name, year, color, logo, links, description } = $props();

    let card;
    let logo_failed = $state(false);
    let link_active = $state(false);
    let size = $state({ width: 400, height: 360 });
    let gap = $state({ start: 16, end: 700 });
    let touch_idle;
    const fold = new Tween(0, { easing: cubicInOut });
    const outline = $derived(project_frame(size, gap, fold.current));
    const year_parts = $derived(year?.split(' - ') ?? []);

    function set_fold(active) {
        clearTimeout(touch_idle);
        link_active = active;
        fold.set(active ? 1 : 0, { duration: motion_ms('--duration-press', card) });
    }

    const link_events = {
        onpointerenter: (event) => event.pointerType === 'mouse' && set_fold(true),
        onpointerleave: (event) => event.pointerType === 'mouse' && set_fold(false),
        onpointerdown: (event) => event.pointerType !== 'mouse' && set_fold(true),
        onpointerup: (event) => {
            if (event.pointerType !== 'mouse')
                touch_idle = setTimeout(() => set_fold(false), TOUCH_LINGER_MS);
        },
        onpointercancel: (event) => event.pointerType !== 'mouse' && set_fold(false),
    };

    $effect(() => () => clearTimeout(touch_idle));

    function measure(node) {
        const label = node.querySelector('.project_links');
        const observer = new ResizeObserver(() => {
            const frame = node.getBoundingClientRect();
            if (!frame.width) return;
            const box = label.getBoundingClientRect();
            size = { width: frame.width, height: frame.height };
            node.style.setProperty('--link-inset', `${box.height / 2 + 5}px`);
            gap = {
                start: Math.max(16, ((box.left - frame.left) / frame.width) * 1000),
                end: Math.min(982, ((box.right - frame.left) / frame.width) * 1000),
            };
        });
        observer.observe(node);
        observer.observe(label);
        return { destroy: () => observer.disconnect() };
    }
</script>

<article
    bind:this={card}
    use:measure
    style:--tint={color}
    class:link_active
    class="project tinted relative isolate flex flex-col items-start p-gutter"
>
    <svg
        class="frame_line pointer-events-none absolute inset-0 -z-1 size-full"
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
                        class="logo"
                        role="img"
                        aria-label={name}
                        style:--logo-image="url('{logo.src}')"
                        style:--logo-ratio={logo.ratio}
                        style:--logo-height="{logo.height}px"
                    >
                        <img src={logo.src} alt="" hidden onerror={() => (logo_failed = true)} />
                    </span>
                {:else}
                    {name}
                {/if}
            </h3>
            {#if year}
                <span
                    class="ink-muted inline-flex shrink-0 items-center gap-1.5 self-start font-hand text-2xl leading-none whitespace-nowrap select-none"
                    aria-label={year}
                >
                    {#each year_parts as part, index (index)}
                        {#if index > 0}<span class="raised" aria-hidden="true">-</span>{/if}
                        <span class:raised={index > 0} aria-hidden="true">{part}</span>
                    {/each}
                </span>
            {/if}
        </div>

        <div class="description ink-soft min-h-0 w-full flex-1 text-ui">
            <div class="flex max-w-[46ch] flex-col gap-copy">
                {#each description as paragraph, index (index)}<p>{paragraph}</p>{/each}
            </div>
        </div>
    </div>

    <div class="project_links flex w-fit items-center gap-control px-inline text-2xl">
        {#each links as link, index (link.href)}
            {#if index > 0}<span class="ink-faint" aria-hidden="true">-</span>{/if}
            <ArrowLink
                href={link.href}
                external
                aria-label="{name} {link.label}"
                class="min-w-0"
                {...link_events}
            >
                {link.label}
            </ArrowLink>
        {/each}
    </div>
</article>

<style>
    .project {
        --project-ink: var(--color-ink);
        color: var(--project-ink);
        min-height: clamp(18rem, 26vw, 22rem);
        padding-bottom: calc(var(--spacing-gutter) + var(--link-inset, 21px));
    }

    .project.link_active,
    .project:has(.project_links :global(a:is(:active, .is_pressed))) {
        --project-ink: color-mix(in oklab, var(--color-ink) 55%, var(--tint-ink));
    }

    .frame_line {
        opacity: 0.045;
    }

    .logo {
        display: block;
        width: calc(var(--logo-height) * var(--logo-ratio));
        max-width: 100%;
        height: var(--logo-height);
        background-color: currentColor;
        mask: var(--logo-image) left center / contain no-repeat;
    }

    .raised {
        translate: 0 -3px;
    }

    .description {
        text-wrap: pretty;
    }

    .project_links {
        position: absolute;
        bottom: 5px;
        left: calc(var(--spacing-gutter) - var(--spacing-inline));
        translate: 0 50%;
        max-width: calc(100% - var(--spacing-gutter) * 2);
    }

    @media (prefers-reduced-motion: no-preference) {
        .project {
            transition: --project-ink calc(var(--duration-press) * 3) var(--ease-out);
        }
    }

    @media (width < 48rem) {
        .project {
            min-height: 0;
        }

        .project_links {
            font-size: clamp(1rem, 4.8vw, 1.25rem);
        }
    }

    @container (width < 40rem) {
        .project:not(:last-child) {
            margin-bottom: var(--spacing-copy);
        }
    }
</style>
