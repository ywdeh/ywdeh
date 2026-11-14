<script>
    import { onMount } from 'svelte';
    import { pushState } from '$app/navigation';
    import { page } from '$app/state';
    import { OVERLAY_MS, motion_time } from '$lib/motion/settings.js';
    import { case_page } from '$lib/routing/case_pages.js';
    import { selected_work, gallery_pictures, picture_name, work_entries } from '$lib/content/work.js';
    import { reveal_intro } from '$lib/motion/intro.js';
    import { preload_image } from '$lib/media/preload.js';
    import { projects } from '$lib/content/projects.js';
    import SiteNavigation from '$lib/components/layout/site_navigation.svelte';
    import PortfolioGallery from '$lib/components/media/portfolio_gallery.svelte';
    import SiteHeader from '$lib/components/layout/site_header.svelte';
    import Section from '$lib/components/layout/section.svelte';
    import SiteFooter from '$lib/components/layout/site_footer.svelte';
    import WorkCard from '$lib/components/cards/work_card.svelte';
    import CasePanel from '$lib/components/overlays/case_panel.svelte';
    import ImageViewer from '$lib/components/overlays/image_viewer.svelte';
    import ProjectCard from '$lib/components/cards/project_card.svelte';
    let { initial_slug, initial_component: InitialCase, initial_picture, initial_gallery_picture } = $props();
    let main_section;
    let site_content;
    let identity;
    let content_ready = $state(true);
    let mounted = $state(false);
    const arrived = $derived(page.state.scenarioSlug === undefined);
    const from_url = (key, initial) => (arrived ? (mounted ? initial : undefined) : page.state[key]);
    const active_case_slug = $derived(from_url('scenarioSlug', initial_slug));
    const case_picture = $derived(from_url('casePicture', initial_picture));
    const gallery_picture = $derived(from_url('galleryPicture', initial_gallery_picture));
    function go(path, { slug = null, picture = null, gallery = null } = {}) {
        if (
            page.url.pathname === path &&
            active_case_slug === slug &&
            case_picture === picture &&
            gallery_picture === gallery
        )
            return;
        pushState(path, { scenarioSlug: slug, casePicture: picture, galleryPicture: gallery });
    }
    const gallery_item = $derived(
        gallery_picture && gallery_pictures.find(({ src }) => picture_name(src) === gallery_picture),
    );
    const find_gallery_card = (name) =>
        [...document.querySelectorAll('.gallery_item')].find(
            (card) => card.dataset.picture === name && card.getClientRects().length,
        );
    const gallery_card = $derived(gallery_item ? find_gallery_card(gallery_picture) : undefined);
    const gallery_origin = $derived(arrived ? undefined : gallery_card?.querySelector('img'));
    const gallery_zoom_width = $derived(
        Math.ceil((gallery_card?.querySelector('img')?.clientWidth ?? 0) * 1.2),
    );
    const open_gallery = (name) => go(`/gallery/${name}`, { gallery: name });
    let arrival_timer;
    function arrive() {
        content_ready = mounted = true;
        if (initial_gallery_picture) {
            arrival_timer = setTimeout(
                () =>
                    find_gallery_card(initial_gallery_picture)?.scrollIntoView({
                        block: 'center',
                        behavior: 'instant',
                    }),
                motion_time(OVERLAY_MS),
            );
        }
    }
    function preload_case(slug) {
        const entry = work_entries[slug];
        void case_page(slug).catch(() => {});
        const width = Math.min(innerWidth, Math.max(768, innerWidth / 2)) - 80;
        for (const src of entry.images?.slice(0, 2) ?? []) preload_image(src, width);
    }
    const enter_scenario = (slug) => go(`/${slug}`, { slug });
    const quit_scenario = () => go('/');
    function show_case_picture(name) {
        const slug = active_case_slug;
        go(name ? `/${slug}/${name}` : `/${slug}`, { slug, picture: name });
    }
    onMount(() => {
        content_ready = false;
        const cleanup = reveal_intro({ main: main_section, identity, content: site_content, ready: arrive });
        return () => {
            cleanup();
            clearTimeout(arrival_timer);
        };
    });
</script>

<section
    bind:this={main_section}
    inert={!!(gallery_item || active_case_slug)}
    class="page w-full px-page py-page-y opacity-0"
>
    <div class="flex w-full flex-col gap-section">
        <div bind:this={identity} class="site_identity opacity-0">
            <SiteHeader part="identity" />
        </div>
        <SiteHeader part="intro" />

        <div
            bind:this={site_content}
            inert={!content_ready}
            class="site_content flex w-full flex-col gap-section opacity-0"
        >
            <div class="flex flex-col gap-row">
                <SiteNavigation />

                <div class="personal_projects relative isolate">
                    <Section title="personal projects" anchor="personal-projects" columns={2}>
                        {#each projects as project (project.name)}
                            <ProjectCard {...project}>
                                {#each project.description as paragraph}<p>{paragraph}</p>{/each}
                            </ProjectCard>
                        {/each}
                    </Section>
                </div>
            </div>

            <Section title="selected work" anchor="case-studies">
                {#each selected_work as { slug, src, left, reading_minutes } (slug)}
                    <WorkCard
                        onclick={() => enter_scenario(slug)}
                        preload={() => preload_case(slug)}
                        {src}
                        {left}
                        {reading_minutes}
                        alt={work_entries[slug].alt || work_entries[slug].title}
                        title={work_entries[slug].title}
                        client={work_entries[slug].client}
                    />
                {/each}
            </Section>

            <Section title="gallery" anchor="gallery">
                <PortfolioGallery open={open_gallery} />
            </Section>

            <SiteFooter />
        </div>
    </div>
</section>

{#if gallery_item}
    {@const entry = work_entries[gallery_item.slug]}
    <ImageViewer
        item={{ ...gallery_item, alt: gallery_item.alt ?? entry.alt }}
        title={entry.title}
        zoom_width={gallery_zoom_width}
        close={() => go('/')}
        origin={gallery_origin}
    />
{:else if active_case_slug}
    {@const entry = work_entries[active_case_slug]}
    {#key active_case_slug}
        <CasePanel
            title={entry.title}
            close={quit_scenario}
            picture={case_picture}
            show_picture={show_case_picture}
        >
            {#if active_case_slug === initial_slug && InitialCase}
                <InitialCase />
            {:else}
                {#await case_page(active_case_slug)}
                    <p class="fg-soft text-ui" role="status">loading…</p>
                {:then module}
                    <module.default />
                {:catch}
                    <p class="fg-soft text-ui">
                        couldn't load this project. <a
                            href={`/${active_case_slug}`}
                            data-sveltekit-reload
                            class="underline">try again</a
                        >
                    </p>
                {/await}
            {/if}
        </CasePanel>
    {/key}
{/if}

<noscript>
    <style>
        section,
        .site_content,
        .site_identity {
            opacity: 1 !important;
        }
    </style>
</noscript>
