<script>
    import { onMount } from "svelte";
    import { pushState } from "$app/navigation";
    import { page } from "$app/state";
    import { card_release } from "$lib/card_release.js";
    import { case_studies, gallery_rows, scenario } from "$lib/scenario.js";
    import Header from "./header.svelte";
    import Category from "./category.svelte";
    import Footer from "./footer.svelte";
    import VisitButton from "./visit_button.svelte";
    import ScenarioCard from "./scenario_card.svelte";
    import CaseViewer from "./case_viewer.svelte";
    import ImageViewer from "./image_viewer.svelte";

    // opened straight at /<slug>: that case study shows over the page once it has faded in
    let { initial_slug, initial_component: InitialCase } = $props();

    let main_section;
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

    // ── case studies: their own URL, without leaving the page ──
    const preloaded_case_images = new Set();

    function preload_case(slug) {
        const entry = scenario[slug];
        void entry.component().catch(() => {});
        for (const src of entry.images?.slice(0, 2) ?? []) {
            if (preloaded_case_images.has(src)) continue;
            preloaded_case_images.add(src);
            const image = new Image();
            image.fetchPriority = 'low';
            image.onerror = () => preloaded_case_images.delete(src);
            image.src = src;
        }
    }

    const enter_scenario = (slug) => pushState(`/${slug}`, { scenarioSlug: slug });
    const quit_scenario = () => pushState('/', { scenarioSlug: null });

    // in-page links glide to their section (or jump, with reduced motion)
    function scroll_to(node, target_id) {
        function click(event) {
            event.preventDefault();
            document.getElementById(target_id)?.scrollIntoView({
                behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
            });
        }
        node.addEventListener('click', click);
        return { destroy: () => node.removeEventListener('click', click) };
    }

    onMount(() => {
        gsap.to(main_section, {
            opacity: 1,
            duration: 0.7,
            ease: "power2.inOut",
            onComplete: () => { mounted = true; },
        });

        // the intro's lines rise in one after another
        SplitText.create(".split", {
            type: "lines",
            autoSplit: true,
            onSplit: (self) => gsap.from(self.lines, {
                y: 30,
                opacity: 0,
                delay: 0.2,
                stagger: 0.1,
                ease: "power1.inOut",
                onComplete: () => self.revert(),
            }),
        });
    });
</script>

{#snippet section_link(id, label)}
    <a use:card_release use:scroll_to={id} href="#{id}" class="link-quiet whitespace-nowrap">{label}</a>
{/snippet}

<section bind:this={main_section} inert={!!(gallery_slug || active_scenario_slug)}
    class="page_scroll w-full px-[clamp(2rem,5vw+1rem,10rem)] py-6 opacity-0 md:py-10 lg:py-14">
    <!-- every gap steps down with the screen: phone / md / lg -->
    <div class="flex w-full flex-col gap-16 md:gap-24 lg:gap-30">
        <Header />

        <div class="flex flex-col gap-6 md:gap-8 lg:gap-10">
            <nav aria-label="Work sections" class="flex justify-between gap-x-4 gap-y-2">
                <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {@render section_link('personal-projects', 'personal projects')}
                    {@render section_link('case-studies', 'case studies')}
                    {@render section_link('gallery', 'gallery')}
                </div>
                {@render section_link('contacts', 'contact me')}
            </nav>

            <Category title="personal projects" anchor="personal-projects">
                <!-- text only, in one card: name and what it is on top; what it's built with and a way in below -->
                <article class="flex flex-col justify-between gap-8 rounded-card bg-mauve-100/5 p-6">
                    <div class="flex flex-col gap-2">
                        <h3 class="font-display text-3xl">Patter</h3>
                        <p class="fg-soft max-w-[36ch]">An ambient text editor: pick a scene, let its sounds play, and write with nothing else asking for your attention.</p>
                    </div>
                    <div class="flex items-end justify-between gap-4">
                        <ul aria-label="Built with" class="fg-muted flex flex-wrap gap-x-3 gap-y-1 text-sm">
                            <li>svelte</li>
                            <li>gsap</li>
                            <li>html, css, js</li>
                        </ul>
                        <VisitButton href="https://patter.hedwy.art">Visit</VisitButton>
                    </div>
                </article>
            </Category>
        </div>

        <Category title="case studies" anchor="case-studies">
            {#each case_studies as { slug, src, left } (slug)}
                <ScenarioCard
                    onclick={() => enter_scenario(slug)}
                    preload={() => preload_case(slug)}
                    {src}
                    {left}
                    alt={scenario[slug].alt || scenario[slug].title}
                    title={scenario[slug].title}
                    client={scenario[slug].client}
                />
            {/each}
        </Category>

        <Category title="gallery" anchor="gallery">
            <div class="gallery gap-y-8 md:gap-y-10 lg:gap-y-12">
                {#each gallery_rows as items}
                    <div class="gallery_row gap-x-6 gap-y-8 md:gap-x-8 lg:gap-x-10">
                        {#each items as { slug, src, full_src, width, height, alt } (src)}
                            <div class="gallery_item" style:--ratio={width / height}>
                                <ScenarioCard image_only src={full_src ?? src} thumbnail={src} {width} {height}
                                    title={scenario[slug].title} client={scenario[slug].client} alt={alt ?? scenario[slug].alt}
                                    onclick={(event) => open_gallery(src, event.currentTarget)} />
                            </div>
                        {/each}
                    </div>
                {/each}
            </div>
        </Category>

        <Footer cta="have a role in mind?" />
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
        section { opacity: 1 !important; }
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
    /* Phones: two pictures per row. */
    @media (width < 48rem) {
        .gallery_row { flex-wrap: wrap; column-gap: 1rem; }
        .gallery_item { flex: 0 0 calc((100% - 1rem) / 2); }
    }
</style>
