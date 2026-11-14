<script>
    import WorkCard from '$lib/components/cards/work_card.svelte';
    import { gallery_layouts, picture_name, work_entries } from '$lib/content/work.js';
    import { preload_image } from '$lib/media/preload.js';
    let { open } = $props();
    let width = $state(0);
    const rows = $derived(width >= 1440 ? gallery_layouts.wide : gallery_layouts.compact);
</script>

<div class="gallery" bind:clientWidth={width}>
    <div class="gallery_layout gap-card-gap">
        {#each rows as items}
            <div class="gallery_row gap-card-gap">
                {#each items as { slug, src, full_src, width, height, alt } (src)}
                    <div class="gallery_item" data-picture={picture_name(src)} style:--ratio={width / height}>
                        <WorkCard
                            image_only
                            src={full_src ?? src}
                            thumbnail={src}
                            {width}
                            {height}
                            title={work_entries[slug].title}
                            client={work_entries[slug].client}
                            alt={alt ?? work_entries[slug].alt}
                            preload={() => preload_image(full_src ?? src)}
                            onclick={() => open(picture_name(src))}
                        />
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</div>

<style>
    .gallery {
        grid-column: 1 / -1;
    }
    .gallery_layout {
        display: flex;
        flex-direction: column;
    }
    .gallery_row {
        display: flex;
        align-items: flex-start;
    }
    .gallery_item {
        min-width: 0;
        flex: var(--ratio) 1 0;
    }
    @container (width < 40rem) {
        .gallery_row {
            flex-direction: column;
        }
        .gallery_item {
            flex: none;
            width: 100%;
        }
    }
</style>
