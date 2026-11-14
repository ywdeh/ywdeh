<script>
    import { tick } from 'svelte';
    import { fade } from 'svelte/transition';
    import { swipe_to_close } from '$lib/actions/swipe_to_close.js';
    import { provide_case } from '$lib/media/case_context.js';
    import { image_info, picture_name } from '$lib/media/images.js';
    import { overlay_pace } from '$lib/motion/timing.js';
    import CloseButton from '$lib/components/ui/close_button.svelte';
    import SiteFooter from '$lib/components/layout/site_footer.svelte';
    import ImageViewer from '$lib/components/overlays/image_viewer.svelte';

    let { title, picture, show_picture, close, children } = $props();

    const heading = $props.id();
    let viewed = $state();
    let viewing = $state(false);
    let covering = $state(false);
    let pressed;

    const context = provide_case((image) => {
        if (!image?.naturalWidth || !image.dataset.src) return;
        pressed = image;
        show_picture(picture_name(image.dataset.src));
    });

    function view(image, from_spot) {
        const info = image_info(image.dataset.src);
        viewing = covering = true;
        viewed = {
            src: image.dataset.src,
            alt: image.alt,
            width: info?.width ?? image.naturalWidth,
            height: info?.height ?? image.naturalHeight,
            zoom_width: Math.ceil(image.clientWidth * 1.2),
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
            (entry.node.closest('.stage') ?? entry.node).scrollIntoView({
                block: 'center',
                behavior: 'instant',
            });
            view(entry.node, false);
        });
        return () => (current = false);
    });

    function slide(node) {
        return { ...overlay_pace(), css: (t) => `transform: translateX(${(1 - t) * 100}%)` };
    }

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
        aria-label="Close overlay"
        tabindex="-1"
        onclick={close}
        class="backdrop dim fixed inset-0"
        transition:fade|global={overlay_pace()}
    ></button>

    <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={heading}
        class="panel fixed inset-y-0 right-0 z-0 flex w-full flex-col overflow-y-auto overscroll-contain bg-surface font-normal md:w-[85%] md:rounded-l-card lg:w-1/2 lg:min-w-3xl"
        use:swipe_to_close={close}
        transition:slide|global
    >
        <header
            class="header sticky top-0 flex w-full shrink-0 justify-between gap-copy bg-surface/95 p-panel backdrop-blur-md"
        >
            <h1 id={heading} class="text-heading">{title}</h1>
            <span class="-m-2" class:invisible={viewing || covering}>
                <CloseButton label="Close case study" onclick={close} />
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
            class="dim pointer-events-none fixed inset-y-0 right-0 z-10 w-full md:w-[85%] md:rounded-l-card lg:w-1/2 lg:min-w-3xl"
            transition:fade|global={overlay_pace()}
        ></div>
    {/if}
</div>

{#if viewing}
    <ImageViewer
        {...viewed}
        title={viewed.alt || title}
        tinted={false}
        close={() => show_picture(null)}
        ongone={() => !viewing && (covering = false)}
    />
{/if}

<style>
    .overlay {
        z-index: var(--layer-overlay);
    }

    .dim {
        background-color: oklch(from var(--color-surface-deep) l c h / 70%);
        backdrop-filter: saturate(0) sepia(0.1);
    }

    .backdrop.dim {
        backdrop-filter: blur(8px) saturate(0) sepia(0.1);
    }

    .header {
        z-index: var(--layer-panel-header);
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
            translate: 16px 0;
        }

        .panel:global(.is_swiping) {
            transition: none;
        }
    }
</style>
