<script>
    import TrailImage from "$lib/components/trail_image.svelte";
    import ImageGallery from "$lib/components/imageGallery.svelte";
</script>

<TrailImage src="/scenario/sneakers_full.webp" />

<ImageGallery pictures={[
    { src: "scenario/sneakers.png", alt: "" },
    { src: "scenario/sneakers_2.webp", alt: "" },
]} />