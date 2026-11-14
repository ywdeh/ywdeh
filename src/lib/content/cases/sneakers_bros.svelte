<script>
    import Artwork from '$lib/components/media/artwork.svelte';
    import ImageSlider from '$lib/components/media/image_slider.svelte';
</script>

<Artwork
    src="/sneakers_bros/sneakers_full.webp"
    alt="wide sneakers bro's banner with the logo and sneaker photos"
/>

<ImageSlider
    pictures={[
        { src: '/sneakers_bros/sneakers.png', alt: "sneakers bro's logo with dashed lines around it" },
        { src: '/sneakers_bros/sneakers_2.webp', alt: 'brand names and two photos of people in sneakers' },
    ]}
/>
