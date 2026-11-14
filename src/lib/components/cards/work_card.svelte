<script>
    import { center_reveal } from '$lib/actions/center_reveal.js';
    import { press_release } from '$lib/actions/press_release.js';
    import { image_color } from '$lib/media/image_source.js';
    import { queued } from '$lib/media/load_queue.js';
    import { image_pan } from '$lib/controllers/image_pan.svelte.js';
    import { reduced_motion } from '$lib/motion/settings.js';
    import Artwork from '$lib/components/media/artwork.svelte';
    import HoverBadge from '$lib/components/cards/hover_badge.svelte';
    let {
        src,
        thumbnail = src,
        alt,
        title,
        client,
        reading_minutes,
        left = false,
        image_only = false,
        width,
        height,
        onclick,
        preload,
    } = $props();
    let card_element = $state();
    let figure_element = $state();
    let is_centered = $state(false);
    let is_hovered = $state(false);
    let is_focused = $state(false);
    const show_full = $derived(is_centered || is_hovered || is_focused);
    const shown = $derived(show_full ? src : thumbnail);
    const pan = image_pan();
    const TOUCH_LINGER_MS = 300;
    let touch_idle;
    function hover_start() {
        is_hovered = true;
        stagger = 0;
        preload?.();
        if (left && !reduced_motion()) pan.hold(card_element);
    }
    function hover_end() {
        is_hovered = false;
        pan.reset();
    }
    function touch_start() {
        clearTimeout(touch_idle);
        hover_start();
    }
    function touch_end(delay) {
        clearTimeout(touch_idle);
        touch_idle = setTimeout(hover_end, delay);
    }
    function follow_pointer(event) {
        if (image_only || !left || event.pointerType !== 'mouse') return;
        const card = event.currentTarget;
        const bounds = card.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const x = (event.clientX - bounds.left) / bounds.width;
        pan.to(Math.min(100, Math.max(0, ((x - 0.2) / 0.6) * 100)));
    }
    $effect(() => () => {
        clearTimeout(touch_idle);
    });
    const STAGGER_MS = 120;
    let stagger = $state(0);
    function centered(value) {
        stagger = column_in_row() * STAGGER_MS;
        is_centered = value;
    }
    function column_in_row() {
        const item = figure_element?.closest('.gallery_item') ?? figure_element;
        if (!item?.parentElement) return 0;
        const { top, left } = item.getBoundingClientRect();
        let column = 0;
        for (const sibling of item.parentElement.children) {
            if (sibling === item) continue;
            const bounds = sibling.getBoundingClientRect();
            if (Math.abs(bounds.top - top) < 2 && bounds.left < left) column++;
        }
        return column;
    }
</script>

<figure
    bind:this={figure_element}
    onpointerenter={(event) => {
        if (event.pointerType === 'mouse') hover_start();
    }}
    onpointerleave={(event) => {
        if (event.pointerType === 'mouse') hover_end();
    }}
    onpointerdown={(event) => {
        if (event.pointerType !== 'mouse') touch_start();
    }}
    onpointerup={(event) => {
        if (event.pointerType !== 'mouse') touch_end(TOUCH_LINGER_MS);
    }}
    onpointercancel={(event) => {
        if (event.pointerType !== 'mouse') touch_end(0);
    }}
    onpointermove={follow_pointer}
    style:--live-img-avg={image_color(src) ?? image_color(thumbnail)}
    class:hovered={is_hovered}
    class="has_badge group relative"
>
    <button
        type="button"
        bind:this={card_element}
        use:center_reveal={centered}
        use:press_release={'.card_preview'}
        onfocus={() => {
            is_focused = true;
            stagger = 0;
            preload?.();
        }}
        onblur={() => (is_focused = false)}
        onpointerdown={preload}
        {onclick}
        aria-label={image_only ? title + ' — ' + client : undefined}
        class="card_trigger relative z-10 flex w-full flex-col gap-copy text-left text-ui"
    >
        <div class="relative">
            <Artwork class="card_preview overflow-hidden rounded-card" src={thumbnail}>
                <img
                    use:queued={shown}
                    decoding="async"
                    {alt}
                    {width}
                    {height}
                    draggable="false"
                    class="w-full object-cover {image_only ? 'h-auto' : 'aspect-4/3'}"
                    class:object-center={!left}
                    class:pannable={left}
                    class:in_color={show_full}
                    style:--stagger={stagger + 'ms'}
                    style:aspect-ratio={image_only ? width / height : undefined}
                    style:object-position={left ? `${pan.position}% center` : undefined}
                />
            </Artwork>

            <HoverBadge kind={image_only ? 'zoom' : 'open'} />
        </div>

        {#if image_only}
            <p class="card_caption gallery_caption live_tint fg-muted truncate">
                {client === 'personal' ? title : client}
            </p>
        {:else}
            <div class="card_caption flex justify-between gap-copy">
                <h3 class="live_tint truncate">{title}</h3>
                {#if reading_minutes}
                    <p class="reading_label live_tint fg-muted whitespace-nowrap">
                        <span>{client}</span>
                        <span class="reading_time" aria-label={`approximately ${reading_minutes} minute read`}
                            >~{reading_minutes}m</span
                        >
                    </p>
                {:else}
                    <p class="live_tint fg-muted whitespace-nowrap">{client}</p>
                {/if}
            </div>
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
        background: var(--avg-outline);
        opacity: 0;
        pointer-events: none;
    }
    figure:is(.hovered, :focus-within)::before {
        opacity: 1;
        inset: calc(-1 * var(--outline-spread));
        border-radius: var(--radius-outline);
    }
    figure:has(> .card_trigger:is(:active, :global(.is_pressed)))::before {
        opacity: 1;
        inset: calc(-1 * var(--outline-press));
        border-radius: calc(var(--radius-card) + var(--outline-press));
    }
    .card_trigger :global(.card_preview) {
        clip-path: inset(0 round var(--radius-card));
    }
    .card_trigger:is(:active, :global(.is_pressed)) :global(.card_preview) {
        clip-path: inset(var(--press-inset) round var(--radius-card));
    }
    .card_trigger:is(:active, :global(.is_pressed)) img {
        padding: var(--press-inset);
    }
    .card_trigger:is(:active, :global(.is_pressed)) .card_caption {
        padding-inline: var(--press-inset);
        translate: 0 calc(-1 * var(--press-inset));
    }
    img {
        filter: saturate(0) sepia(0.1);
    }
    img.in_color,
    figure:is(.hovered, :focus-within) img,
    .card_trigger:is(:active, :global(.is_pressed)) img {
        filter: none;
    }
    figure:is(.hovered, :focus-within) .live_tint,
    .card_trigger:is(:active, :global(.is_pressed)) .live_tint {
        color: var(--avg-text);
    }
    figure:is(.hovered, :focus-within) .gallery_caption,
    figure:has(> .card_trigger:is(:active, :global(.is_pressed))) .gallery_caption {
        opacity: 1;
    }
    .reading_label {
        --reading-space: calc(3ch + var(--spacing) * 2);
        display: flex;
        align-items: center;
        flex-shrink: 0;
        position: relative;
    }
    .reading_time {
        position: absolute;
        right: 0;
        opacity: 0;
        translate: 0.5rem;
    }
    figure:is(.hovered, :focus-within) .reading_label {
        padding-right: var(--reading-space);
    }
    figure:is(.hovered, :focus-within) .reading_time {
        opacity: 1;
        translate: 0;
    }

    @media (prefers-reduced-motion: no-preference) {
        .reading_time {
            transition:
                opacity var(--press-time) var(--press-ease),
                translate var(--press-time) var(--press-ease);
        }
        figure::before {
            transition:
                opacity var(--press-time) ease-in-out,
                inset var(--press-time) var(--press-ease),
                border-radius var(--press-time) var(--press-ease);
        }
        .card_trigger :global(.card_preview) {
            transition: clip-path var(--press-time) var(--press-ease);
        }
        img {
            transition:
                filter 400ms var(--stagger, 0ms),
                object-position 400ms,
                padding var(--press-time) var(--press-ease);
        }
        img.pannable {
            transition:
                filter 400ms var(--stagger, 0ms),
                padding var(--press-time) var(--press-ease);
        }
        .card_caption {
            transition:
                padding-inline var(--press-time) var(--press-ease),
                translate var(--press-time) var(--press-ease);
        }
        .live_tint {
            transition: color var(--press-time);
        }
        .reading_label.live_tint {
            transition:
                padding-right var(--press-time) var(--press-ease),
                color var(--press-time);
        }
        .card_caption.live_tint {
            transition:
                padding-inline var(--press-time) var(--press-ease),
                translate var(--press-time) var(--press-ease),
                opacity var(--press-time),
                color var(--press-time);
        }
    }
</style>
