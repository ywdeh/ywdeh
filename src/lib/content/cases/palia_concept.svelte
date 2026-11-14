<script>
    import Artwork from '$lib/components/media/artwork.svelte';
    import ImageSlider from '$lib/components/media/image_slider.svelte';
</script>

<ImageSlider
    pictures={[
        { src: '/palia_concept/palia.webp', alt: 'hotbar with an axe, gems and stones over a foraging bar' },
        {
            src: '/palia_concept/palia_quest_log.webp',
            alt: 'quest tracker with a crafting task and a friendship task',
        },
        {
            src: '/palia_concept/palia_bars.webp',
            alt: 'curved focus and stamina bars on both sides of the character',
        },
    ]}
/>

<p>This Palia interface concept features three hud elements: hotbar, quest tracker and focus/stamina bars</p>

<Artwork src="/palia_concept/palia_hud.webp" alt="all three in game, in a dark purple forest" />
