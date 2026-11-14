<script>
    import { onMount } from "svelte";
    import { pushState } from "$app/navigation";
    import { page } from "$app/state";
    import { card_release } from "$lib/card_release.js";
    import { reduced_motion } from "$lib/motion.js";
    import { case_studies, gallery_rows, scenario } from "$lib/scenario.js";
    import Header from "./header.svelte";
    import Category from "./category.svelte";
    import Footer from "./footer.svelte";
    import ScenarioCard from "./scenario_card.svelte";
    import CaseViewer from "./case_viewer.svelte";
    import ImageViewer from "./image_viewer.svelte";
    import ProjectCard from "./project_card.svelte";

    // gsap and SplitText are globals, loaded from a CDN in app.html

    // opened straight at /<slug>: that case study shows over the page once it has faded in
    let { initial_slug, initial_component: InitialCase } = $props();

    let main_section;
    let site_content;
    let identity;
    let content_ready = $state(true);
    let mounted = $state(false);
    const active_scenario_slug = $derived(page.state.scenarioSlug === undefined && mounted
        ? initial_slug
        : page.state.scenarioSlug);

    // ── gallery picture viewer ──
    let gallery_slug = $state();
    let gallery_zoom_width = $state(0);
    let gallery_origin = $state(); // the card's <img>: the picture flies out of it and back
    const gallery_item = $derived(gallery_slug && gallery_rows.flat().find(({ src }) => src === gallery_slug));

    function open_gallery(slug, trigger) {
        const image = trigger.querySelector('img');
        gallery_zoom_width = Math.ceil((image?.clientWidth ?? trigger.clientWidth) * 1.2);
        gallery_origin = image;
        gallery_slug = slug;
    }

    // ── pictures start loading when their card is hovered, focused or pressed, so they're in by the time
    // they open: a case study's first pictures, or a gallery picture's full size ──
    const preloaded = new Set();

    function preload(src) {
        if (preloaded.has(src)) return;
        preloaded.add(src);
        const image = new Image();
        image.fetchPriority = 'low';
        image.onerror = () => preloaded.delete(src);
        image.src = src;
    }

    // ── case studies: their own URL, without leaving the page ──
    function preload_case(slug) {
        const entry = scenario[slug];
        void entry.component().catch(() => {});
        for (const src of entry.images?.slice(0, 2) ?? []) preload(src);
    }

    const enter_scenario = (slug) => pushState(`/${slug}`, { scenarioSlug: slug });
    const quit_scenario = () => pushState('/', { scenarioSlug: null });

    // in-page links glide to their section (or jump, with reduced motion)
    function scroll_to(node, target_id) {
        function click(event) {
            event.preventDefault();
            document.getElementById(target_id)?.scrollIntoView({ behavior: reduced_motion() ? 'instant' : 'smooth' });
        }
        node.addEventListener('click', click);
        return { destroy: () => node.removeEventListener('click', click) };
    }

    onMount(() => {
        if (reduced_motion()) {
            gsap.set([main_section, identity, site_content], { opacity: 1 });
            content_ready = mounted = true;
            return;
        }
        content_ready = false;

        let content_reveal;
        function reveal_content() {
            if (content_reveal) return;
            content_reveal = gsap.to([identity, site_content], {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.inOut',
                onComplete: () => { content_ready = mounted = true; },
            });
        }

        const entrance = gsap.to(main_section, {
            opacity: 1,
            duration: 0.7,
            ease: 'power2.inOut',
        });

        // the intro's lines rise in one after another
        const intro = SplitText.create(main_section.querySelector('.split'), {
            type: 'lines',
            autoSplit: true,
            onSplit: (self) => gsap.from(self.lines, {
                y: 30,
                opacity: 0,
                delay: 0.2,
                stagger: 0.1,
                ease: 'power1.inOut',
                onComplete: () => {
                    self.revert();
                    reveal_content();
                },
            }),
        });
        return () => {
            entrance.kill();
            content_reveal?.kill();
            intro.revert();
        };
    });
</script>

{#snippet section_link(id, label)}
    <a use:card_release use:scroll_to={id} href="#{id}" class="link-quiet whitespace-nowrap">{label}</a>
{/snippet}

<section bind:this={main_section} inert={!!(gallery_slug || active_scenario_slug)}
    class="page w-full px-page py-page-y opacity-0">
    <div class="flex w-full flex-col gap-section">
        <div bind:this={identity} class="site_identity opacity-0">
            <Header part="identity" />
        </div>
        <Header part="intro" />

        <div bind:this={site_content} inert={!content_ready} class="site_content flex w-full flex-col gap-section opacity-0">
            <div class="flex flex-col gap-gutter">
                <nav aria-label="Work sections" class="flex flex-wrap justify-between gap-x-card-gap gap-y-control text-ui">
                    <div class="flex flex-wrap items-center gap-x-copy gap-y-inline">
                        {@render section_link('personal-projects', 'personal projects')}
                        {@render section_link('case-studies', 'selected work')}
                        {@render section_link('gallery', 'gallery')}
                    </div>
                    {@render section_link('contacts', 'contact me')}
                </nav>

                <div class="personal_projects relative isolate">
                    <Category title="personal projects" anchor="personal-projects" columns={2}>
                        <ProjectCard name="Patter" href="https://patter.hedwy.art" year="2026" color="#b3b66a">
                            <p>patter is an immersive text editor, free from advanced features and heavy ui, but with a lot of ambient customization options: background pictures, cinematic grain, blur and tint, ambient sounds, fonts, and other visual details</p>
                            <p>built with sveltekit, tailwind, and html/css/js</p>
                        </ProjectCard>
                        <ProjectCard name="Wintertale" href="https://wintertale.hedwy.art" year="2021 - present" color="#7faeca"
                            logo="/projects/wintertale_logo.svg"
                            links={[{ label: 'github', href: 'https://github.com/ywdeh/wintertale-downpour' }]}>
                            <p>wintertale is a game community and dedicated server with up to 40 concurrent players and almost 1000 people on discord</p>
                            <p>I wanted a comfortable space for people to feel at home; over time I learned a scripting language and wrote over 100 custom features to improve the base game's immersion, look and feel</p>
                        </ProjectCard>
                    </Category>
                </div>
            </div>

            <Category title="selected work" anchor="case-studies">
                {#each case_studies as { slug, src, left, reading_minutes } (slug)}
                    <ScenarioCard
                        onclick={() => enter_scenario(slug)}
                        preload={() => preload_case(slug)}
                        {src}
                        {left}
                        {reading_minutes}
                        alt={scenario[slug].alt || scenario[slug].title}
                        title={scenario[slug].title}
                        client={scenario[slug].client}
                    />
                {/each}
            </Category>

            <Category title="gallery" anchor="gallery">
                <div class="gallery gap-card-gap">
                    {#each gallery_rows as items}
                        <div class="gallery_row gap-card-gap">
                            {#each items as { slug, src, full_src, width, height, alt } (src)}
                                <div class="gallery_item" style:--ratio={width / height}>
                                    <ScenarioCard image_only src={full_src ?? src} thumbnail={src} {width} {height}
                                        title={scenario[slug].title} client={scenario[slug].client} alt={alt ?? scenario[slug].alt}
                                        preload={() => preload(full_src ?? src)}
                                        onclick={(event) => open_gallery(src, event.currentTarget)} />
                                </div>
                            {/each}
                        </div>
                    {/each}
                </div>
            </Category>

            <Footer />
        </div>
    </div>
</section>

{#if gallery_item}
    {@const entry = scenario[gallery_item.slug]}
    <ImageViewer item={{ ...gallery_item, alt: gallery_item.alt ?? entry.alt }} title={entry.title}
        zoom_width={gallery_zoom_width} close={() => gallery_slug = undefined} origin={gallery_origin} />
{:else if active_scenario_slug}
    {@const entry = scenario[active_scenario_slug]}
    {#key active_scenario_slug}
        <CaseViewer title={entry.title} close={quit_scenario}>
            {#if active_scenario_slug === initial_slug && InitialCase}
                <InitialCase />
            {:else}
                {#await entry.component() then module}
                    <module.default />
                {/await}
            {/if}
        </CaseViewer>
    {/key}
{/if}

<noscript>
    <style>
        section, .site_content, .site_identity { opacity: 1 !important; }
    </style>
</noscript>

<style>
    .gallery {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
    }
    /* a picture's share of its row's width is its aspect ratio, so every picture in a row is the same height */
    .gallery_row { display: flex; align-items: flex-start; }
    .gallery_item { min-width: 0; flex: var(--ratio) 1 0; }
    /* Phones: one picture per row. */
    @media (width < 48rem) {
        .gallery_row { flex-direction: column; }
        .gallery_item { flex: none; width: 100%; }
    }
</style>
