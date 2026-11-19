<script>
    import { onMount } from 'svelte';
    import { pushState } from '$app/navigation';
    import { page } from '$app/state';
    import { labels } from '$lib/content/labels.js';
    import { projects } from '$lib/content/projects.js';
    import { page_title, section } from '$lib/content/site.js';
    import { cases, selected_work } from '$lib/content/work.js';
    import { image_info, preload_image } from '$lib/media/images.js';
    import { reveal_intro } from '$lib/motion/intro.js';
    import { motion_ms, reduced_motion } from '$lib/motion/timing.js';
    import { load_case, loaded_case } from '$lib/routing/case_loader.js';
    import { case_pictures, gallery_item, HOME, same_view, view_path } from '$lib/routing/views.js';
    import ProjectCard from '$lib/components/cards/project_card.svelte';
    import WorkCard from '$lib/components/cards/work_card.svelte';
    import Identity from '$lib/components/layout/identity.svelte';
    import Intro from '$lib/components/layout/intro.svelte';
    import Section from '$lib/components/layout/section.svelte';
    import SiteFooter from '$lib/components/layout/site_footer.svelte';
    import SiteNavigation from '$lib/components/layout/site_navigation.svelte';
    import CaseBody from '$lib/components/media/case_body.svelte';
    import GalleryGrid from '$lib/components/media/gallery_grid.svelte';
    import CasePanel, { panel_content_width } from '$lib/components/overlays/case_panel.svelte';
    import ImageViewer from '$lib/components/overlays/image_viewer.svelte';
    import MusicPlayer from '$lib/components/ui/music_player.svelte';

    let { arrival } = $props();

    const PRELOADED_PICTURES = 2;
    const ZOOM_HEADROOM = 1.2;

    let main;
    let identity;
    let intro = $state();
    let content;
    let gallery = $state();
    let mounted = $state(false);
    let content_ready = $state(true);
    let arrival_timer;

    const arrived = $derived(!page.state.view);
    const view = $derived(page.state.view ?? (mounted ? arrival : HOME));
    const case_entry = $derived(view.slug && cases[view.slug]);
    const case_blocks = $derived(view.slug && loaded_case(view.slug));
    const picture = $derived(view.gallery && gallery_item(view.gallery));
    const gallery_image = $derived(picture && gallery?.image(view.gallery));
    const titled = $derived(page.state.view ?? arrival);
    const title = $derived(page_title(titled.slug && cases[titled.slug]?.title));

    function go(next) {
        const target = { ...HOME, ...next };
        if (same_view(target, view) && page.url.pathname === view_path(target)) return;
        pushState(view_path(target), { view: target });
    }

    function arrive() {
        content_ready = mounted = true;
        if (!arrival.gallery) return;
        arrival_timer = setTimeout(
            () =>
                gallery?.cell(arrival.gallery)?.scrollIntoView({
                    block: 'center',
                    behavior: reduced_motion() ? 'instant' : 'smooth',
                }),
            motion_ms('--duration-overlay'),
        );
    }

    function preload_case(slug) {
        load_case(slug)
            .then((blocks) => {
                for (const { src } of case_pictures(blocks).slice(0, PRELOADED_PICTURES))
                    preload_image(src, panel_content_width());
            })
            .catch(() => {});
    }

    onMount(() => {
        content_ready = false;
        const dispose = reveal_intro({ page: main, identity, text: intro, content, ready: arrive });
        return () => {
            dispose();
            clearTimeout(arrival_timer);
        };
    });
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<main
    bind:this={main}
    data-reveal
    inert={!!(picture || view.slug)}
    class="min-h-dvh w-full overflow-x-clip px-page-x py-page-y opacity-0"
>
    <div class="flex w-full flex-col gap-section">
        <div bind:this={identity} data-reveal class="opacity-0">
            <Identity />
        </div>
        <Intro bind:element={intro} />

        <div
            bind:this={content}
            data-reveal
            inert={!content_ready}
            class="flex w-full flex-col gap-section opacity-0"
        >
            <div class="flex flex-col gap-row">
                <SiteNavigation />
                <Section {...section('personal-projects')}>
                    {#each projects as project (project.name)}
                        <ProjectCard {...project} />
                    {/each}
                </Section>
            </div>

            <Section {...section('case-studies')}>
                {#each selected_work as { slug, cover, minutes, pan } (slug)}
                    <WorkCard
                        src={cover}
                        {minutes}
                        {pan}
                        alt={cases[slug].alt}
                        title={cases[slug].title}
                        client={cases[slug].client}
                        preload={() => preload_case(slug)}
                        onclick={() => go({ slug })}
                    />
                {/each}
            </Section>

            <Section {...section('gallery')}>
                <GalleryGrid bind:this={gallery} open={(name) => go({ gallery: name })} />
            </Section>

            <SiteFooter />
        </div>
    </div>
</main>

<MusicPlayer />

{#if picture}
    {@const entry = cases[picture.slug]}
    {@const src = picture.full ?? picture.src}
    <ImageViewer
        {src}
        alt={picture.alt ?? entry.alt}
        width={image_info(src)?.width}
        height={image_info(src)?.height}
        title={entry.title}
        zoom_width={Math.ceil((gallery_image?.clientWidth ?? 0) * ZOOM_HEADROOM)}
        origin={arrived ? undefined : gallery_image}
        close={() => go(HOME)}
    />
{:else if case_entry}
    {#key view.slug}
        <CasePanel
            title={case_entry.title}
            picture={view.picture}
            show_picture={(name) => go({ slug: view.slug, picture: name })}
            close={() => go(HOME)}
        >
            {#if case_blocks}
                <CaseBody blocks={case_blocks} />
            {:else}
                {#await load_case(view.slug)}
                    <p class="ink-soft text-ui" role="status">{labels.case_loading}</p>
                {:then blocks}
                    <CaseBody {blocks} />
                {:catch}
                    <p class="ink-soft text-ui">
                        {labels.case_failed}
                        <a href={view_path(view)} data-sveltekit-reload class="underline">{labels.case_retry}</a>
                    </p>
                {/await}
            {/if}
        </CasePanel>
    {/key}
{/if}

<noscript>
    <style>
        [data-reveal] {
            opacity: 1 !important;
        }
    </style>
</noscript>
