<script>
    import ImageGallery from "$lib/components/imageGallery.svelte";
</script>

<img src="scenario/sneakers_full.webp" alt="">

<ImageGallery pictures={[
    { src: "scenario/sneakers.png", alt: "" },
    { src: "scenario/sneakers_2.webp", alt: "" },
]} />