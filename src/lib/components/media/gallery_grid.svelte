<script>
    import { cases, gallery_rows } from '$lib/content/work.js';
    import { image_info, preload_image } from '$lib/media/images.js';
    import { menus } from '$lib/context_menu';
    import { gallery_item } from '$lib/routing/views.js';
    import WorkCard from '$lib/components/cards/work_card.svelte';

    let { open, open_case } = $props();

    const WIDE_FROM = 1440;
    let root;
    let width = $state(0);
    const rows = $derived(width >= WIDE_FROM ? gallery_rows.wide : gallery_rows.compact);

    export const cell = (name) => root?.querySelector(`[data-picture="${name}"]`) ?? null;
    export const image = (name) => cell(name)?.querySelector('img') ?? null;
</script>

<div bind:this={root} class="gallery flex flex-col gap-grid" bind:clientWidth={width}>
    {#each rows as names, row (row)}
        <div class="row flex items-start gap-grid">
            {#each names as name (name)}
                {@const item = gallery_item(name)}
                {@const info = image_info(item.src)}
                {@const entry = cases[item.slug]}
                <WorkCard
                    class="gallery_item"
                    data-picture={name}
                    style="--ratio: {info.width / info.height}"
                    kind="picture"
                    src={item.full ?? item.src}
                    thumbnail={item.src}
                    alt={item.alt ?? entry.alt}
                    title={entry.title}
                    client={entry.client}
                    preload={() => preload_image(item.full ?? item.src)}
                    onclick={() => open(name)}
                    menu={menus.picture(name, { open: () => open(name), open_case: () => open_case(item.slug) })}
                />
            {/each}
        </div>
    {/each}
</div>

<style>
    .gallery {
        container-type: inline-size;
    }

    .row > :global(.gallery_item) {
        min-width: 0;
        flex: var(--ratio) 1 0;
    }

    @container (width < 40rem) {
        .row {
            flex-direction: column;
        }

        .row > :global(.gallery_item) {
            flex: none;
            width: 100%;
        }
    }
</style>
