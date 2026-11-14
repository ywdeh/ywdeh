<script>
    import Artwork from '$lib/components/media/artwork.svelte';
    import ImageSlider from '$lib/components/media/image_slider.svelte';
</script>

<Artwork
    src="/wintertale_banner/wintertale.webp"
    alt="wintertale banner, a lantern lit shelf with drawings next to a snowy window and gifts"
/>

<article>
    <h2>The world is cold, but there's always warmth in a winter's tale</h2>
    <p>
        This illustration was made as a community banner, just one asset among the countless I've created for
        Wintertale
    </p>
</article>

<ImageSlider
    pictures={[
        {
            src: '/wintertale_banner/wintertale_half_1.webp',
            alt: 'the shelf half, drawings pinned above a glowing lantern',
        },
        {
            src: '/wintertale_banner/wintertale_half_2.webp',
            alt: 'the window half, a snowy tree outside and gift boxes',
        },
    ]}
/>
