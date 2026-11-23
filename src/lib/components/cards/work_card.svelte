<script>
    import { center_reveal } from '$lib/actions/center_reveal.js';
    import { press } from '$lib/actions/press.js';
    import { labels } from '$lib/content/labels.js';
    import { badges_state } from '$lib/controllers/badge.svelte.js';
    import { context_menu, holds } from '$lib/context_menu';
    import { hover_intent } from '$lib/controllers/hover_intent.svelte.js';
    import { spring_pan } from '$lib/controllers/spring_pan.svelte.js';
    import { image_color, image_info } from '$lib/media/images.js';
    import { queued } from '$lib/media/load_queue.js';
    import { reduced_motion, token_ms } from '$lib/motion/timing.js';
    import HoverBadge from '$lib/components/ui/hover_badge.svelte';

    let {
        kind = 'case',
        src,
        thumbnail = src,
        alt,
        title,
        client,
        minutes,
        pan = false,
        onclick,
        preload,
        menu,
        class: classes = '',
        ...rest
    } = $props();

    const PAN_MARGIN = 0.2;
    const ROW_TOLERANCE = 2;

    const picture = $derived(kind === 'picture');
    const info = $derived(image_info(thumbnail));
    const spring = spring_pan();

    let figure = $state();
    let trigger;
    let centered = $state(false);
    let revealed = $state(false);
    let hovered = $state(false);
    let focused = $state(false);
    let stagger = $state(0);

    const in_color = $derived(centered || hovered || focused);
    const shown = $derived(in_color ? src : thumbnail);

    const intent = hover_intent({
        enter() {
            hovered = true;
            stagger = 0;
            preload?.();
            if (pan && !reduced_motion()) spring.hold(trigger);
        },
        leave() {
            hovered = false;
            spring.reset();
        },
    });

    function follow(event) {
        if (!pan || event.pointerType !== 'mouse') return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (!bounds.width) return;
        const x = (event.clientX - bounds.left) / bounds.width;
        spring.to(Math.min(100, Math.max(0, ((x - PAN_MARGIN) / (1 - 2 * PAN_MARGIN)) * 100)));
    }

    function place_in_row() {
        const place = { column: 0, alone: true };
        if (!figure.parentElement) return place;
        const { top, left } = figure.getBoundingClientRect();
        for (const sibling of figure.parentElement.children) {
            if (sibling === figure) continue;
            const bounds = sibling.getBoundingClientRect();
            if (Math.abs(bounds.top - top) >= ROW_TOLERANCE) continue;
            place.alone = false;
            if (bounds.left < left) place.column++;
        }
        return place;
    }

    function fills_row() {
        const row = figure.parentElement;
        if (!row) return true;
        const style = getComputedStyle(row);
        const inner = row.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        return figure.getBoundingClientRect().width >= inner - ROW_TOLERANCE;
    }

    function reveal(value) {
        const { column, alone } = place_in_row();
        stagger = column * token_ms('--duration-stagger');
        centered = value;
        revealed = value && alone && matchMedia('(hover: none)').matches && fills_row();
        if (revealed) preload?.();
    }

    $effect(() => {
        badges_state.reveal(figure, revealed);
    });
</script>

<figure
    bind:this={figure}
    {...rest}
    class="work_card tinted relative isolate {classes}"
    class:hovered={hovered || revealed || holds(figure)}
    style:--tint={image_color(src) ?? image_color(thumbnail)}
    {...intent}
    onpointermove={follow}
    use:context_menu={menu && { items: menu, outline: true, lit: () => hovered || revealed || focused || holds(figure) }}
>
    <button
        type="button"
        bind:this={trigger}
        use:center_reveal={reveal}
        use:press={{ target: '.preview' }}
        onfocus={() => {
            focused = true;
            stagger = 0;
            preload?.();
        }}
        onblur={() => (focused = false)}
        onpointerdown={preload}
        {onclick}
        aria-label={picture ? `${title} — ${client}` : undefined}
        class="trigger own_outline relative level-raised flex w-full flex-col gap-copy text-left text-ui"
    >
        <span class="relative block">
            <span class="preview block overflow-hidden rounded-card bg-placeholder">
                <img
                    use:queued={shown}
                    {alt}
                    width={info?.width}
                    height={info?.height}
                    decoding="async"
                    draggable="false"
                    class="block w-full object-cover"
                    class:pannable={pan}
                    class:in_color
                    style:aspect-ratio={picture && info ? `${info.width} / ${info.height}` : '4 / 3'}
                    style:object-position={pan ? `${spring.position}% center` : 'center'}
                    style:--stagger="{stagger}ms"
                />
            </span>
            <HoverBadge kind={picture ? 'zoom' : 'open'} host={figure} />
        </span>

        {#if picture}
            <span class="caption fades live_tint ink-muted block truncate">
                {client === 'personal' ? title : client}
            </span>
        {:else}
            <span class="caption flex justify-between gap-copy">
                <span class="live_tint truncate">{title}</span>
                <span class="reading live_tint ink-muted whitespace-nowrap">
                    <span>{client}</span>
                    {#if minutes}
                        <span class="minutes" aria-label={labels.reading_time(minutes)}
                            >{labels.reading_time_short(minutes)}</span
                        >
                    {/if}
                </span>
            </span>
        {/if}
    </button>
</figure>

<style>
    figure {
        --outline-shown: 0;
        --badge-idle-opacity: 1;
    }

    figure:is(.hovered, :focus-within),
    figure:has(> .trigger:is(:active, :global(.is_pressed))) {
        --outline-shown: 1;
    }

    figure::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: var(--level-base);
        border-radius: var(--radius-card);
        background: var(--tint-plate);
        opacity: var(--outline-shown);
        pointer-events: none;
    }

    figure:is(.hovered, :focus-within)::before {
        inset: calc(-1 * var(--outline-spread));
        border-radius: calc(var(--radius-card) + var(--outline-spread));
    }

    figure:has(> .trigger:is(:active, :global(.is_pressed)))::before {
        inset: calc(-1 * var(--outline-press));
        border-radius: calc(var(--radius-card) + var(--outline-press));
    }

    .preview {
        clip-path: inset(0 round var(--radius-card));
    }

    .trigger:is(:active, :global(.is_pressed)) .preview {
        clip-path: inset(var(--press-inset) round var(--radius-card));
    }

    img {
        filter: var(--filter-muted);
    }

    img.in_color,
    figure:is(.hovered, :focus-within) img,
    .trigger:is(:active, :global(.is_pressed)) img {
        filter: none;
    }

    .trigger:is(:active, :global(.is_pressed)) img {
        padding: var(--press-inset);
    }

    .trigger:is(:active, :global(.is_pressed)) .caption {
        padding-inline: var(--press-inset);
        translate: 0 calc(-1 * var(--press-inset));
    }

    figure:is(.hovered, :focus-within) .live_tint,
    .trigger:is(:active, :global(.is_pressed)) .live_tint {
        color: var(--tint-ink);
    }

    figure:is(.hovered, :focus-within) .fades,
    figure:has(> .trigger:is(:active, :global(.is_pressed))) .fades {
        opacity: 1;
    }

    .reading {
        position: relative;
        display: flex;
        flex-shrink: 0;
        align-items: center;
    }

    .minutes {
        position: absolute;
        right: 0;
        opacity: 0;
        translate: var(--spacing-inline);
    }

    figure:is(.hovered, :focus-within) .reading:has(.minutes) {
        padding-right: calc(3ch + var(--spacing-inline));
    }

    figure:is(.hovered, :focus-within) .minutes {
        opacity: 1;
        translate: 0;
    }

    @media (prefers-reduced-motion: no-preference) {
        figure {
            transition: --outline-shown var(--duration-press) var(--ease-press);
        }

        figure::before {
            transition:
                inset var(--duration-press) var(--ease-press),
                border-radius var(--duration-press) var(--ease-press);
        }

        .preview {
            transition: clip-path var(--duration-press) var(--ease-press);
        }

        img {
            transition:
                filter var(--duration-tint) var(--stagger, 0ms),
                object-position var(--duration-tint),
                padding var(--duration-press) var(--ease-press);
        }

        img.pannable {
            transition:
                filter var(--duration-tint) var(--stagger, 0ms),
                padding var(--duration-press) var(--ease-press);
        }

        .live_tint {
            transition: color var(--duration-press);
        }

        .caption {
            transition:
                padding-inline var(--duration-press) var(--ease-press),
                translate var(--duration-press) var(--ease-press),
                opacity var(--duration-press),
                color var(--duration-press);
        }

        .reading {
            transition:
                padding-right var(--duration-press) var(--ease-press),
                color var(--duration-press);
        }

        .minutes {
            transition:
                opacity var(--duration-press) var(--ease-press),
                translate var(--duration-press) var(--ease-press);
        }
    }
</style>
