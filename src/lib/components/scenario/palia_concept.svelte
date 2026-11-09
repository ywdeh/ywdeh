<script>
    import TrailImage from "$lib/components/trail_image.svelte";
    import ImageGallery from "$lib/components/image_gallery.svelte";
</script>

<ImageGallery pictures={[
    { src: "scenario/palia.png", alt: "" },
    { src: "scenario/palia_quest_log.png", alt: "" },
    { src: "scenario/palia_bars.png", alt: "" },
]} />

<p>This Palia interface concept features three hud elements: hotbar, quest tracker and focus/stamina bars</p>

<TrailImage src="/scenario/palia_hud.webp" />