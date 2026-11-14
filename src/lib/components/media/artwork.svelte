<script>
    import { press } from '$lib/actions/press.js';
    import { case_context } from '$lib/media/case_context.js';
    import { image_info } from '$lib/media/images.js';
    import { queued } from '$lib/media/load_queue.js';
    import HoverBadge from '$lib/components/ui/hover_badge.svelte';

    let { src, alt = '', zoom = true, eager = false, class: class_name = '', reveal } = $props();

    const context = case_context();
    const info = $derived(image_info(src));
    const zoomable = $derived(zoom && !!context);
    const register = (node) => context?.register(node, () => reveal?.());
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
        type="button"
        use:press
        class="artwork zoomable tinted {class_name}"
        style:--tint={info?.color}
        aria-label={alt ? `Enlarge ${alt}` : 'Enlarge image'}
        onclick={(event) => context.open(event.currentTarget.querySelector('img'))}
    >
        <span class="frame">{@render picture()}</span>
        <HoverBadge kind="zoom" />
    </button>
{:else}
    <span class="artwork frame {class_name}">{@render picture()}</span>
{/if}

<style>
    .artwork,
    .frame {
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

    .zoomable .frame {
        clip-path: inset(0 round var(--radius-card));
    }

    .zoomable:is(:active, :global(.is_pressed)) .frame {
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
        .zoomable .frame {
            transition: clip-path var(--duration-press) var(--ease-press);
        }

        .zoomable img {
            transition: padding var(--duration-press) var(--ease-press);
        }
    }
</style>
