<script>
    import ScenarioDetails from "./scenario_details.svelte";
    import ImageViewer from "./image_viewer.svelte";

    let { title, close, children } = $props();
    let case_image = $state();

    function open_image(image) {
        if (!image?.naturalWidth) return;
        case_image = {
            src: image.currentSrc || image.src,
            alt: image.alt,
            width: image.naturalWidth,
            height: image.naturalHeight,
            zoom_width: Math.ceil(image.clientWidth * 1.2),
            origin: image,
        };
    }
</script>

<ScenarioDetails {title} onclose={close} {open_image} suspended={!!case_image}>
    {@render children()}
</ScenarioDetails>

{#if case_image}
    <ImageViewer item={case_image} title={case_image.alt || title} zoom_width={case_image.zoom_width}
        origin={case_image.origin} tint_backdrop={false} close={() => case_image = undefined} />
{/if}
