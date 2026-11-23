<script module>
    const PANEL_MIN = 768;
    const PANEL_PADDING = 80;

    export const panel_content_width = () =>
        Math.min(innerWidth, Math.max(PANEL_MIN, innerWidth / 2)) - PANEL_PADDING;
</script>

<script>
    import { tick } from 'svelte';
    import { fade } from 'svelte/transition';
    import { swipe_to_close } from '$lib/actions/swipe_to_close.js';
    import { labels } from '$lib/content/labels.js';
    import { provide_case } from '$lib/media/case_context.js';
    import { image_info, picture_name } from '$lib/media/images.js';
    import { context_menu, menus } from '$lib/context_menu';
    import { link_copy } from '$lib/controllers/link_copy.svelte.js';
    import { overlay_pace } from '$lib/motion/timing.js';
    import CloseButton from '$lib/components/ui/close_button.svelte';
    import CopyIcon from '$lib/components/ui/copy_icon.svelte';
    import IconButton from '$lib/components/ui/icon_button.svelte';
    import SiteFooter from '$lib/components/layout/site_footer.svelte';
    import ImageViewer from '$lib/components/overlays/image_viewer.svelte';

    let { title, picture, link: case_link, picture_link, show_picture, close, children } = $props();

    const panel_menu = menus.case_panel({ link: () => case_link, close: () => close() });

    const ZOOM_HEADROOM = 1.2;

    const heading = $props.id();
    let viewed = $state();
    let viewing = $state(false);
    let covering = $state(false);
    let pressed;
    const link = link_copy();

    const context = provide_case((image) => {
        if (!image?.naturalWidth || !image.dataset.src) return;
        pressed = image;
        show_picture(picture_name(image.dataset.src));
    }, (name) => picture_link?.(name));

    function view(image, from_spot) {
        const info = image_info(image.dataset.src);
        viewing = covering = true;
        viewed = {
            src: image.dataset.src,
            alt: image.alt,
            width: info?.width ?? image.naturalWidth,
            height: info?.height ?? image.naturalHeight,
            zoom_width: Math.ceil(image.clientWidth * ZOOM_HEADROOM),
            origin: from_spot && image.complete && image.naturalWidth ? image : undefined,
        };
    }

    $effect(() => {
        const name = picture;
        if (!name) {
            viewing = false;
            return;
        }
        if (pressed && picture_name(pressed.dataset.src) === name) {
            view(pressed, true);
            pressed = undefined;
            return;
        }
        const entry = context.find(name);
        if (!entry) return;
        let current = true;
        entry.reveal();
        tick().then(() => {
            if (!current || !entry.node.isConnected) return;
            (entry.anchor() ?? entry.node).scrollIntoView({ block: 'center', behavior: 'instant' });
            view(entry.node, false);
        });
        return () => (current = false);
    });

    function slide() {
        return { ...overlay_pace(), css: (t) => `transform: translateX(${(1 - t) * 100}%)` };
    }

    $effect(() => () => link.destroy());

    function keydown(event) {
        if (viewing || event.key !== 'Escape' || event.defaultPrevented) return;
        event.preventDefault();
        close();
    }
</script>

<svelte:window onkeydown={keydown} />

<div class="overlay fixed inset-0 flex items-center justify-center" inert={viewing}>
    <button
        type="button"
        aria-label={labels.close_overlay}
        tabindex="-1"
        onclick={close}
        class="backdrop scrim mute-blur-behind fixed inset-0"
        transition:fade|global={overlay_pace()}
    ></button>

    <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={heading}
        class="panel sheet fixed inset-y-0 right-0 level-base flex flex-col overflow-y-auto overscroll-contain bg-surface font-normal"
        use:swipe_to_close={close}
        use:context_menu={case_link && panel_menu}
        transition:slide|global
    >
        <header
            class="sticky top-0 level-sticky flex w-full shrink-0 justify-between gap-copy bg-surface/95 p-panel backdrop-blur-md"
        >
            <h1 id={heading} class="text-heading">{title}</h1>
            <span class="-m-2 flex" class:invisible={viewing || covering}>
                <IconButton label={link.copied ? labels.link_copied : labels.copy_link} onclick={link.copy}>
                    {#snippet icon()}<CopyIcon swapped={link.copied} stroke={1.5} fit class="size-8 text-ink" />{/snippet}
                </IconButton>
                <CloseButton label={labels.close_case} onclick={close} />
            </span>
        </header>

        <div class="flex flex-col gap-section px-panel pb-row">
            <div class="flex flex-col gap-case text-body">
                {@render children()}
            </div>
            <SiteFooter />
        </div>
    </div>

    {#if viewing}
        <div
            aria-hidden="true"
            class="sheet scrim mute-behind pointer-events-none fixed inset-y-0 right-0 level-raised"
            transition:fade|global={overlay_pace()}
        ></div>
    {/if}
</div>

{#if viewing}
    <ImageViewer
        {...viewed}
        title={viewed.alt || title}
        tinted={false}
        {link}
        close={() => show_picture(null)}
        ongone={() => !viewing && (covering = false)}
    />
{/if}

<style>
    .overlay {
        z-index: var(--layer-overlay);
    }

    .sheet {
        width: 100%;
    }

    @media (width >= 48rem) {
        .sheet {
            width: 85%;
            border-start-start-radius: var(--radius-card);
            border-end-start-radius: var(--radius-card);
        }
    }

    @media (width >= 64rem) {
        .sheet {
            width: 50%;
            min-width: 48rem;
        }
    }

    .panel {
        touch-action: pan-y pinch-zoom;
        scrollbar-width: none;
    }

    .panel::-webkit-scrollbar {
        display: none;
    }

    @media (prefers-reduced-motion: no-preference) {
        .panel {
            transition: translate var(--duration-press) var(--ease-press);
        }

        .overlay:has(> .backdrop:active) > .panel {
            translate: var(--press-shift) 0;
        }

        .panel:global(.is_swiping) {
            transition: none;
        }
    }
</style>
