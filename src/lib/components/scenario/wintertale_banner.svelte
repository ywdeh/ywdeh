<script>
    import TrailImage from "$lib/components/trail_image.svelte";
    import ImageGallery from "$lib/components/image_gallery.svelte";
</script>

<TrailImage src="/scenario/wintertale.webp" alt="Illustrated banner split into a cozy blue-toned workshop scene and a snowy window view with gift boxes" />

<article>
    <h1>The world is cold, but there's always warmth in a winter's tale</h1>
    <p>This illustration was made as a community banner, just one asset among the countless I've created for Wintertale</p>
</article>

<ImageGallery pictures={[
    { src: "/scenario/wintertale_half_1.webp", alt: "Workshop half of the Wintertale banner" },
    { src: "/scenario/wintertale_half_2.webp", alt: "Snowy window half of the Wintertale banner" },
]} />
