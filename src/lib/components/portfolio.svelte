<script>
    import { onMount } from "svelte";
    import { pushState } from "$app/navigation";
    import { page } from "$app/state";
    import { card_release } from "$lib/card_release.js";
    import { case_studies, gallery_rows, scenario } from "$lib/scenario.js";
    import Header from "./header.svelte";
    import Category from "./category.svelte";
    import Footer from "./footer.svelte";
    import ScenarioCard from "./scenario_card.svelte";
    import CaseViewer from "./case_viewer.svelte";
    import ImageViewer from "./image_viewer.svelte";
    import ArrowIcon from "./arrow_icon.svelte";
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
    class="page_scroll w-full px-page py-page-y opacity-0">
    <!-- the spacing tokens (layout.css) grow with the screen -->
    <div class="flex w-full flex-col gap-section">
        <Header />

        <div class="flex flex-col gap-gutter">
            <nav aria-label="Work sections" class="flex justify-between gap-x-4 gap-y-2">
                <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {@render section_link('personal-projects', 'personal projects')}
                    {@render section_link('case-studies', 'case studies')}
                    {@render section_link('gallery', 'gallery')}
                </div>
                {@render section_link('contacts', 'contact me')}
            </nav>

            <Category title="personal projects" anchor="personal-projects">
                <article class="patter_entry relative isolate col-span-full flex flex-col items-start gap-row">
                    <div class="flex flex-col gap-gutter">
                        <h3 class="font-display text-5xl md:text-6xl">Patter</h3>
                        <div class="fg-soft flex max-w-[46ch] flex-col gap-3">
                            <p>an ambient text editor: pick a scene, let its sounds play, and write with nothing else asking for your attention</p>
                            <p>built with sveltekit, gsap, html, css, and javascript</p>
                        </div>
                    </div>
                    <a href="https://patter.hedwy.art" target="_blank" rel="noopener noreferrer" use:card_release
                        class="arrow_link link-soft flex w-fit items-center gap-2 text-2xl">patter.hedwy.art<ArrowIcon /></a>
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
            <div class="gallery gap-y-row">
                {#each gallery_rows as items}
                    <div class="gallery_row gap-x-gutter gap-y-row">
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
    .patter_entry::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        background-color: var(--color-mauve-100);
        opacity: 0.046;
        mask:
            url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20176%20112%22%3E%3Cdefs%3E%3Cpath%20id%3D%22upper%22%20d%3D%22M15%200C20%200%2026%204%2028%2010C30%2015%2030%2022%2026%2027C23%2032%2014%2035%208%2032C2%2030%200%2024%200%2018C0%2011%203%206%208%203C10%202%2013%201%2015%200Z%22%2F%3E%3Cpath%20id%3D%22lower%22%20d%3D%22M13%200C20%200%2026%204%2028%209C30%2015%2030%2021%2026%2025C22%2029%2015%2031%209%2028C4%2026%201%2022%200%2017C0%2011%203%206%208%203C10%202%2012%201%2013%200Z%22%2F%3E%3C%2Fdefs%3E%3Cuse%20href%3D%22%23upper%22%20transform%3D%22translate%2812%2019%29%20rotate%28-18%29%20scale%28.145%29%22%20opacity%3D%220.65%22%2F%3E%3Cuse%20href%3D%22%23upper%22%20transform%3D%22translate%2864%2033%29%20rotate%2812%29%20scale%28.145%29%22%20opacity%3D%220.44%22%2F%3E%3Cuse%20href%3D%22%23lower%22%20transform%3D%22translate%28111%2015%29%20rotate%28-28%29%20scale%28.145%29%22%20opacity%3D%220.92%22%2F%3E%3Cuse%20href%3D%22%23upper%22%20transform%3D%22translate%28152%2039%29%20rotate%2835%29%20scale%28.145%29%22%20opacity%3D%220.72%22%2F%3E%3Cuse%20href%3D%22%23lower%22%20transform%3D%22translate%2829%2068%29%20rotate%28-9%29%20scale%28.145%29%22%20opacity%3D%220.60%22%2F%3E%3Cuse%20href%3D%22%23lower%22%20transform%3D%22translate%2887%2076%29%20rotate%28-35%29%20scale%28.145%29%22%20opacity%3D%220.95%22%2F%3E%3Cuse%20href%3D%22%23lower%22%20transform%3D%22translate%28146%2091%29%20rotate%288%29%20scale%28.145%29%22%20opacity%3D%220.70%22%2F%3E%3C%2Fsvg%3E") center / 176px 112px repeat,
            radial-gradient(ellipse 43% 50% at 57% 52%, #000 35%, rgb(0 0 0 / 65%) 70%, transparent 100%);
        mask-composite: intersect;
    }

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
