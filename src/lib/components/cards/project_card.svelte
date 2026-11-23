<script>
    import { Tween } from 'svelte/motion';
    import { cubicInOut } from 'svelte/easing';
    import { center_reveal } from '$lib/actions/center_reveal.js';
    import { labels } from '$lib/content/labels.js';
    import { context_menu } from '$lib/controllers/context_menu.svelte.js';
    import { hover_intent } from '$lib/controllers/hover_intent.svelte.js';
    import { FRAME, frame_gap, project_frame } from '$lib/geometry/project_frame.js';
    import { motion_ms } from '$lib/motion/timing.js';
    import ArrowLink from '$lib/components/ui/arrow_link.svelte';
    import Range from '$lib/components/ui/range.svelte';

    let { name, year, logo, links, description } = $props();

    let card;
    let label;
    let logo_failed = $state(false);
    let link_active = $state(false);
    let centered = $state(false);
    let one_per_row = $state(false);
    let size = $state({ width: 400, height: 360 });
    let gap = $state({ start: FRAME.gap_min, end: FRAME.width * 0.7 });
    const fold = new Tween(0, { easing: cubicInOut });
    const revealed = $derived(centered && one_per_row);
    const outline = $derived(project_frame(size, gap, fold.current));
    const year_parts = $derived(year?.split(' - ') ?? []);

    $effect(() => {
        fold.set(link_active || revealed ? 1 : 0, { duration: motion_ms('--duration-press', card) });
    });

    $effect(() => {
        if (!logo) return;
        const probe = new Image();
        probe.onerror = () => (logo_failed = true);
        probe.src = logo.src;
        return () => (probe.onerror = null);
    });

    const open_entries = () => links.map((link) => ({ label: labels.menu.open(link.label), href: link.href }));

    const card_menu = {
        hold: false,
        items: () => [open_entries(), [{ label: labels.menu.copy_link, copy: links[0]?.href }].filter((entry) => entry.copy)],
    };

    const link_menu = (link) => ({
        items: () => [
            [
                { label: labels.menu.open(link.label), href: link.href },
                { label: labels.menu.copy_link, copy: link.href },
            ],
        ],
    });

    const intent = hover_intent({
        enter: () => (link_active = true),
        leave: () => (link_active = false),
    });

    $effect(() => {
        const observer = new ResizeObserver(() => {
            const frame = card.getBoundingClientRect();
            if (!frame.width) return;
            const box = label.getBoundingClientRect();
            size = { width: frame.width, height: frame.height };
            one_per_row = frame.width >= card.parentElement.clientWidth - 1;
            card.style.setProperty('--label-half', `${box.height / 2}px`);
            gap = frame_gap(frame, box);
        });
        observer.observe(card);
        observer.observe(label);
        return () => observer.disconnect();
    });
</script>

<article
    bind:this={card}
    use:center_reveal={(value) => (centered = value)}
    use:context_menu={card_menu}
    class:revealed
    class="project relative isolate flex flex-col items-start p-gutter"
>
    <svg
        class="frame_line pointer-events-none absolute inset-0 level-below size-full"
        viewBox="0 0 {FRAME.width} {FRAME.height}"
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
                    ></span>
                {:else}
                    {name}
                {/if}
            </h3>
            {#if year}
                <p class="ink-muted shrink-0 self-start text-ui whitespace-nowrap">
                    <Range parts={year_parts} />
                </p>
            {/if}
        </div>

        <div class="description ink-soft min-h-0 w-full flex-1 text-ui">
            <div class="flex max-w-[46ch] flex-col gap-copy">
                {#each description as paragraph, index (index)}<p>{paragraph}</p>{/each}
            </div>
        </div>
    </div>

    <div bind:this={label} class="project_links flex w-fit items-center gap-control px-inline text-2xl">
        {#each links as link, index (link.href)}
            {#if index > 0}<span class="ink-faint" aria-hidden="true">-</span>{/if}
            <ArrowLink href={link.href} external
                aria-label="{name} {link.label}"
                menu={link_menu(link)}
                class="min-w-0"
                {...intent}
            >
                {link.label}
            </ArrowLink>
        {/each}
    </div>
</article>

<style>
    .project {
        --frame-baseline: 5px;
        min-height: clamp(18rem, 26vw, 22rem);
        padding-bottom: calc(var(--spacing-gutter) + var(--label-half, 16px) + var(--frame-baseline));
    }

    .project.revealed {
        --link-rest: var(--tone-hover);
        --icon-trim: var(--trim-hover);
        --icon-nudge: var(--nudge-hover);
    }

    .frame_line {
        opacity: var(--tone-frame);
    }

    .logo {
        display: block;
        width: calc(var(--logo-height) * var(--logo-ratio));
        max-width: 100%;
        height: var(--logo-height);
        background-color: currentColor;
        -webkit-mask: var(--logo-image) left center / contain no-repeat;
        mask: var(--logo-image) left center / contain no-repeat;
    }

    .description {
        text-wrap: pretty;
    }

    .project_links {
        position: absolute;
        bottom: var(--frame-baseline);
        left: calc(var(--spacing-gutter) - var(--spacing-inline));
        translate: 0 50%;
        max-width: calc(100% - var(--spacing-gutter) * 2);
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
