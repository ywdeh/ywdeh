<script>
    import { center_reveal } from '$lib/actions/center_reveal.js';
    import { press } from '$lib/actions/press.js';
    import { spring_pan } from '$lib/controllers/spring_pan.svelte.js';
    import { image_color, image_info } from '$lib/media/images.js';
    import { queued } from '$lib/media/load_queue.js';
    import { reduced_motion, TOUCH_LINGER_MS } from '$lib/motion/timing.js';
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
    } = $props();

    const STAGGER_MS = 120;
    const picture = $derived(kind === 'picture');
    const info = $derived(image_info(thumbnail));
    const spring = spring_pan();

    let figure;
    let trigger;
    let centered = $state(false);
    let hovered = $state(false);
    let focused = $state(false);
    let stagger = $state(0);
    let touch_idle;

    const in_color = $derived(centered || hovered || focused);
    const shown = $derived(in_color ? src : thumbnail);

    function hover_start() {
        hovered = true;
        stagger = 0;
        preload?.();
        if (pan && !reduced_motion()) spring.hold(trigger);
    }

    function hover_end() {
        hovered = false;
        spring.reset();
    }

    function linger(delay) {
        clearTimeout(touch_idle);
        touch_idle = setTimeout(hover_end, delay);
    }

    function follow(event) {
        if (!pan || event.pointerType !== 'mouse') return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (!bounds.width) return;
        const x = (event.clientX - bounds.left) / bounds.width;
        spring.to(Math.min(100, Math.max(0, ((x - 0.2) / 0.6) * 100)));
    }

    function column_in_row() {
        const item = figure.closest('.gallery_item') ?? figure;
        if (!item.parentElement) return 0;
        const { top, left } = item.getBoundingClientRect();
        let column = 0;
        for (const sibling of item.parentElement.children) {
            if (sibling === item) continue;
            const bounds = sibling.getBoundingClientRect();
            if (Math.abs(bounds.top - top) < 2 && bounds.left < left) column++;
        }
        return column;
    }

    function reveal(value) {
        stagger = column_in_row() * STAGGER_MS;
        centered = value;
    }

    $effect(() => () => clearTimeout(touch_idle));
</script>

<figure
    bind:this={figure}
    class="work_card tinted relative"
    class:hovered
    style:--tint={image_color(src) ?? image_color(thumbnail)}
    onpointerenter={(event) => event.pointerType === 'mouse' && hover_start()}
    onpointerleave={(event) => event.pointerType === 'mouse' && hover_end()}
    onpointerdown={(event) => {
        if (event.pointerType === 'mouse') return;
        clearTimeout(touch_idle);
        hover_start();
    }}
    onpointerup={(event) => event.pointerType !== 'mouse' && linger(TOUCH_LINGER_MS)}
    onpointercancel={(event) => event.pointerType !== 'mouse' && linger(0)}
    onpointermove={follow}
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
        class="trigger own_outline relative z-10 flex w-full flex-col gap-copy text-left text-ui"
    >
        <span class="relative block">
            <span class="preview frame block overflow-hidden rounded-card bg-placeholder">
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
            <HoverBadge kind={picture ? 'zoom' : 'open'} />
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
                        <span class="minutes" aria-label="approximately {minutes} minute read"
                            >~{minutes}m</span
                        >
                    {/if}
                </span>
            </span>
        {/if}
    </button>
</figure>

<style>
    figure::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: var(--radius-card);
        background: var(--tint-glow);
        opacity: 0;
        pointer-events: none;
    }

    figure:is(.hovered, :focus-within)::before {
        opacity: 1;
        inset: calc(-1 * var(--outline-spread));
        border-radius: calc(var(--radius-card) + var(--outline-spread));
    }

    figure:has(> .trigger:is(:active, :global(.is_pressed)))::before {
        opacity: 1;
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
        filter: saturate(0) sepia(0.1);
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
        translate: 0.5rem;
    }

    figure:is(.hovered, :focus-within) .reading:has(.minutes) {
        padding-right: calc(3ch + var(--spacing-inline));
    }

    figure:is(.hovered, :focus-within) .minutes {
        opacity: 1;
        translate: 0;
    }

    @media (prefers-reduced-motion: no-preference) {
        figure::before {
            transition:
                opacity var(--duration-press) var(--ease-press),
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

        .caption {
            transition:
                padding-inline var(--duration-press) var(--ease-press),
                translate var(--duration-press) var(--ease-press),
                opacity var(--duration-press),
                color var(--duration-press);
        }

        .live_tint {
            transition: color var(--duration-press);
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
