<div class="fixed w-screen h-screen pointer-events-none bg-[url(/noise.gif)] mix-blend-overlay opacity-4 bg-repeat z-100"></div>

<section class="w-screen h-screen overflow-auto overflow-x-hidden bg-neutral-900 text-mauve-100 px-[clamp(2rem,5vw+1rem,10rem)] py-6 md:py-10 lg:py-14 opacity-0" bind:this={main_section} inert={!!(gallery_slug || active_scenario_slug)}>
    <!-- every gap steps down with the screen: phone / md / lg -->
    <div class="flex flex-col gap-16 md:gap-24 lg:gap-30 w-full font-[Google_Sans_Flex,'Google_Sans',sans-serif]">
        <Header />

        <div class="flex flex-col gap-6 md:gap-8 lg:gap-10">
            <nav aria-label="Work sections" class="flex flex-col gap-2 md:flex-row justify-between">
                <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <a use:card_release use:scroll_to={'personal-projects'} href="#personal-projects" class="transition opacity-30 hover:opacity-90">personal projects</a>
                    <a use:card_release use:scroll_to={'case-studies'} href="#case-studies" class="transition opacity-30 hover:opacity-90">case studies</a>
                    <a use:card_release use:scroll_to={'gallery'} href="#gallery" class="transition opacity-30 hover:opacity-90">gallery</a>
                </div>
                <div class="flex items-center gap-4">
                    <a use:card_release use:scroll_to={'contacts'} href="#contacts" class="transition opacity-30 hover:opacity-90 w-fit">contact me</a>
                </div>
            </nav>

            <Category title="personal projects" anchor="personal-projects">
                <!-- text only, in one card: name and what it is on top; what it's built with and a way in below -->
                <article class="flex flex-col justify-between gap-8 rounded-2xl bg-mauve-100/5 p-6">
                    <div class="flex flex-col gap-2">
                        <h3 class="text-3xl font-[Amarante,serif]">Patter</h3>
                        <p class="opacity-60 max-w-[36ch]">An ambient text editor: pick a scene, let its sounds play, and write with nothing else asking for your attention.</p>
                    </div>
                    <div class="flex items-end justify-between gap-4">
                        <ul aria-label="Built with" class="flex flex-wrap gap-x-3 gap-y-1 text-sm opacity-40">
                            <li>svelte</li>
                            <li>gsap</li>
                            <li>html, css, js</li>
                        </ul>
                        <VisitButton href="https://patter.hedwy.art">Visit</VisitButton>
                    </div>
                </article>
            </Category>
        </div>

        <div class="flex flex-col gap-6 md:gap-8 lg:gap-10">
            <Category title="case studies" anchor="case-studies">
            {#each case_studies as { slug, src, left } (slug)}
                <div>
                    <ScenarioCard
                        onclick={() => enter_scenario(slug)}
                        preload={() => preload_case(slug)}
                        {src}
                        {left}
                        alt={scenario[slug].alt || scenario[slug].title}
                        title={scenario[slug].title}
                        client={scenario[slug].client}
                    />
                </div>
            {/each}
            </Category>
        </div>

        <Category title="gallery" anchor="gallery">
            <div class="gallery gap-y-8 md:gap-y-10 lg:gap-y-12">
                {#each gallery_rows as items}
                    <div class="gallery_row gap-y-8 gap-x-6 md:gap-x-8 lg:gap-x-10">
                        {#each items as { slug, src, full_src, width, height: image_height, alt } (src)}
                            <div class="gallery_item" style:--ratio={width / image_height}>
                                <ScenarioCard image_only src={full_src ?? src} thumbnail={src} {width} height={image_height}
                                    title={scenario[slug].title} client={scenario[slug].client} alt={alt ?? scenario[slug].alt}
                                    onclick={(event) => open_gallery(src, event.currentTarget)} />
                            </div>
                        {/each}
                    </div>
                {/each}
            </div>
        </Category>

        <div><Footer cta="have a role in mind?" /></div>
    </div>
</section>


{#if gallery_slug}
    {@const item = gallery_rows.flat().find(({ src }) => src === gallery_slug)}
    {#if item}
        {@const entry = scenario[item.slug]}
        <ImageViewer item={{ ...item, alt: item.alt ?? entry.alt }} title={entry.title}
            zoom_width={gallery_zoom_width} close={() => gallery_slug = undefined} origin={gallery_origin} />
    {/if}
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

<script>
    import { card_release } from "$lib/card_release.js";
    import ScenarioCard from "$lib/components/scenario_card.svelte";
    import CaseViewer from "$lib/components/case_viewer.svelte";
    import ImageViewer from "$lib/components/image_viewer.svelte";

    import Header from "$lib/components/header.svelte";
    import Category from "$lib/components/category.svelte";
    import Footer from "$lib/components/footer.svelte";
    import VisitButton from "$lib/components/visit_button.svelte";

    import { onMount } from "svelte";
    import { pushState } from "$app/navigation";
    import { page } from "$app/state";
    import { case_studies, gallery_rows, scenario } from "$lib/scenario.js";

    let main_section;

    let gallery_slug = $state();
    let gallery_zoom_width = $state(0);
    let gallery_origin = $state(); // the card's <img>: the picture flies out of it and back

    function open_gallery(slug, trigger) {
        const image = trigger.querySelector('img');
        gallery_zoom_width = Math.ceil((image?.clientWidth ?? trigger.clientWidth) * 1.2);
        gallery_origin = image;
        gallery_slug = slug;
    }

    let { initial_slug, initial_component: InitialCase } = $props();
    let mounted = $state(false);
    const active_scenario_slug = $derived(page.state.scenarioSlug === undefined && mounted
        ? initial_slug
        : page.state.scenarioSlug);

    const preloaded_case_images = new Set();

    function preload_case(slug) {
        const entry = scenario[slug];
        void entry.component().catch(() => {});

        for (const src of entry.images.slice(0, 2)) {
            if (preloaded_case_images.has(src)) continue;
            preloaded_case_images.add(src);

            const image = new Image();
            image.fetchPriority = 'low';
            image.onerror = () => preloaded_case_images.delete(src);
            image.src = src;
        }
    }

    function enter_scenario(slug) {
        pushState(`/${slug}`, { scenarioSlug: slug });
    }
    function quit_scenario() {
        pushState('/', { scenarioSlug: null });
    }

    onMount(() => {
        gsap.to(main_section, {
        opacity: 1,
        duration: 0.7,
        ease: "power2.inOut",
        onComplete: () => { mounted = true; }
        });

        SplitText.create(".split", {
        type: "lines",
        autoSplit: true,
        onSplit: (self) => {
            return gsap.from(self.lines, {
            y: 30,
            opacity: 0,
            delay: 0.2,
            stagger: 0.1,
            ease: "power1.inOut",
            onComplete: () => {
            self.revert();
            }
            });
        }
        });
    });

    $effect(() => {
        if (active_scenario_slug) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        } else {
            const y = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, y ? -parseInt(y) : 0);
        }
    });

    export function scroll_to(node, target_id) {
    function handle_click(e) {
        e.preventDefault();
        document.getElementById(target_id)?.scrollIntoView({
            behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
        });
    }
    node.addEventListener('click', handle_click);
    return {
        destroy() {
        node.removeEventListener('click', handle_click);
        }
    };
    }

</script>

<style>
    .gallery { grid-column: 1 / -1; display: flex; flex-direction: column; }
    /* a picture's share of its row's width is its aspect ratio, so every picture in a row is the same height */
    .gallery_row { display: flex; align-items: flex-start; }
    .gallery_item { min-width: 0; flex: var(--ratio) 1 0; }
    /* phones: one full-width picture per row */
    @media (max-width: 767.98px) {
        .gallery_row { flex-direction: column; align-items: stretch; }
        .gallery_item { flex: none; }
    }
</style>
