<script>
    import { press } from '$lib/actions/press.js';
    import { labels } from '$lib/content/labels.js';
    import { case_context } from '$lib/media/case_context.js';
    import { image_info } from '$lib/media/images.js';
    import { queued } from '$lib/media/load_queue.js';
    import HoverBadge from '$lib/components/ui/hover_badge.svelte';

    let { src, alt = '', zoom = true, eager = false, class: classes = '', reveal, anchor } = $props();

    const context = case_context();
    const info = $derived(image_info(src));
    const zoomable = $derived(zoom && !!context);
    let button = $state();

    const register = (node) =>
        context?.register(node, {
            reveal: () => reveal?.(),
            anchor: () => anchor,
        });
    const lazy = (node, value) => (eager ? undefined : queued(node, value));
</script>

{#snippet picture()}
    <img
        use:register
        use:lazy={src}
        src={eager ? src : undefined}
        data-src={src}
        {alt}
        width={info?.width}
        height={info?.height}
        style:aspect-ratio={info ? `${info.width} / ${info.height}` : undefined}
        decoding="async"
        draggable="false"
    />
{/snippet}

{#if zoomable}
    <button
        bind:this={button}
        type="button"
        use:press
        class="artwork zoomable tinted {classes}"
        style:--tint={info?.color}
        aria-label={labels.enlarge(alt)}
        onclick={(event) => context.open(event.currentTarget.querySelector('img'))}
    >
        <span class="clip">{@render picture()}</span>
        <HoverBadge kind="zoom" host={button} tinted={false} />
    </button>
{:else}
    <span class="artwork clip {classes}">{@render picture()}</span>
{/if}

<style>
    .artwork,
    .clip {
        position: relative;
        display: block;
        min-width: 0;
        border-radius: var(--radius-card);
        background-color: var(--color-placeholder);
    }

    .zoomable {
        width: 100%;
        background-color: transparent;
    }

    .zoomable .clip {
        clip-path: inset(0 round var(--radius-card));
    }

    .zoomable:is(:active, :global(.is_pressed)) .clip {
        clip-path: inset(var(--press-inset) round var(--radius-card));
    }

    img {
        display: block;
        width: 100%;
        height: auto;
        object-fit: cover;
    }

    .zoomable:is(:active, :global(.is_pressed)) img {
        padding: var(--press-inset);
    }

    @media (prefers-reduced-motion: no-preference) {
        .zoomable .clip {
            transition: clip-path var(--duration-press) var(--ease-press);
        }

        .zoomable img {
            transition: padding var(--duration-press) var(--ease-press);
        }
    }
</style>
