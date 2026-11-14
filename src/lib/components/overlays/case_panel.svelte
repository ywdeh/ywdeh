<script>
    import { setContext, tick } from 'svelte';
    import { CASE_IMAGES, create_image_registry } from '$lib/media/image_registry.js';
    import { image_data } from '$lib/media/image_data.js';
    import { picture_name } from '$lib/content/work.js';
    import OverlayShell from '$lib/components/overlays/overlay_shell.svelte';
    import ImageViewer from '$lib/components/overlays/image_viewer.svelte';
    let { title, close, children, picture, show_picture } = $props();
    let case_image = $state();
    let image_open = $state(false);
    let image_shown = $state(false);
    let pressed;
    const images = create_image_registry();
    setContext(CASE_IMAGES, images);
    function open_image(image) {
        if (!image?.naturalWidth || !image.dataset.src) return;
        pressed = image;
        show_picture(picture_name(image.dataset.src));
    }
    function show(image, from_spot) {
        const [width = image.naturalWidth, height = image.naturalHeight] =
            image_data[image.dataset.src] ?? [];
        image_shown = image_open = true;
        case_image = {
            src: image.dataset.src,
            alt: image.alt,
            width,
            height,
            zoom_width: Math.ceil(image.clientWidth * 1.2),
            origin: from_spot && image.complete && image.naturalWidth ? image : undefined,
        };
    }
    $effect(() => {
        const name = picture;
        if (!name) {
            image_open = false;
            return;
        }
        if (pressed && picture_name(pressed.dataset.src) === name) {
            show(pressed, true);
            pressed = undefined;
            return;
        }
        const entry = images.find(name);
        if (!entry) return;
        const image = entry.node;
        let current = true;
        entry.reveal();
        tick().then(() => {
            if (!current || !image.isConnected) return;
            (image.closest('.slider_frame') ?? image).scrollIntoView({
                block: 'center',
                behavior: 'instant',
            });
            show(image, false);
        });
        return () => (current = false);
    });
</script>

<OverlayShell {title} onclose={close} {open_image} suspended={image_open} close_hidden={image_shown}>
    {@render children()}
</OverlayShell>

{#if image_open}
    <ImageViewer
        item={case_image}
        title={case_image.alt || title}
        zoom_width={case_image.zoom_width}
        origin={case_image.origin}
        tint_backdrop={false}
        close={() => show_picture(null)}
        ongone={() => {
            if (!image_open) image_shown = false;
        }}
    />
{/if}
