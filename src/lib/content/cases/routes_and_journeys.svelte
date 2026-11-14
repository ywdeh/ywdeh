<script>
    import Artwork from '$lib/components/media/artwork.svelte';
    import ImageSlider from '$lib/components/media/image_slider.svelte';
</script>

<Artwork
    src="/routes_and_journeys/rj.webp"
    alt="rj emblem in orange and green, a stone slate wrapped in ivy"
/>
<article>
    <h2>Vibes and seasons change, so does the emblem</h2>
    <p>
        Although it appears relatively simple, there was an intriguing request in client's brief: they needed
        an emblem that could adapt its appearance depending on the context
    </p>
    <p>
        That's how nature works, so I leaned towards it, breaking emblem into 3 separate elements: the stone
        slate, branches and letters
    </p>
</article>

<ImageSlider
    pictures={[
        { src: '/routes_and_journeys/rj_slate.webp', alt: 'three stone slates from light to dark' },
        { src: '/routes_and_journeys/rj_branches.webp', alt: 'ivy branches in green, autumn brown and blue' },
    ]}
/>

<article>
    <p>
        Each one of them can be dyed and give drastically different vibe: let it be winter or autumn, spring
        or summer, mystical forest or give it a complete stone look
    </p>
    <p>Since its vector, changing colors is as easy as dragging sliders around!</p>
</article>

<Artwork
    src="/routes_and_journeys/rj_outline.webp"
    alt="both emblems in outlines, with their construction lines"
/>
