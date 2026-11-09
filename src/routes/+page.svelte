<svelte:head></svelte:head>

<div class="fixed w-screen h-screen pointer-events-none bg-[url(/noise.gif)] mix-blend-overlay opacity-4 bg-repeat z-100"></div>

<section class="w-screen h-screen overflow-auto overflow-x-hidden bg-neutral-900 text-mauve-100 px-[clamp(2rem,5vw+1rem,10rem)] py-6 md:py-10 lg:py-14 opacity-0" bind:this={mainSection} inert={!!(gallery_slug || page.state.scenarioSlug)}>
    <!-- every gap steps down with the screen: phone / md / lg -->
    <div class="flex flex-col gap-16 md:gap-24 lg:gap-30 w-full font-[Google_Sans_Flex,'Google_Sans',sans-serif]">
        <Header />

        <div class="flex flex-col gap-6 md:gap-8 lg:gap-10">
            <nav aria-label="Work sections" class="flex flex-col gap-2 md:flex-row justify-between">
                <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <a use:card_release use:scrollTo={'personal-projects'} href="#personal-projects" class="transition opacity-30 hover:opacity-90">personal projects</a>
                    <a use:card_release use:scrollTo={'case-studies'} href="#case-studies" class="transition opacity-30 hover:opacity-90">case studies</a>
                    <a use:card_release use:scrollTo={'gallery'} href="#gallery" class="transition opacity-30 hover:opacity-90">gallery</a>
                </div>
                <div class="flex items-center gap-4">
                    <a use:card_release use:scrollTo={'contacts'} href="#contacts" class="transition opacity-30 hover:opacity-90 w-fit">contact me</a>
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
                        onclick={() => enterScenario(slug)}
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


{#snippet image_viewer(item, title, zoom_width, close, tint_backdrop = true, origin = undefined)}
    {@const wide = item.width / item.height > 2}
    <ScenarioDetails {title} gallery {tint_backdrop} {origin} natural={{ width: item.width, height: item.height }} onclose={close}>
        <figure class="gallery_view" style:--gallery-zoom-width={wide ? zoom_width + 'px' : undefined}>
            <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to pan the enlarged image.) -->
            <div class="gallery_image_viewport" use:image_pan_zoom role="region"
                aria-label="Image viewer. Scroll to zoom or drag to pan." tabindex="0">
                <div class="gallery_image_layer">
                    <TrailImage src={item.full_src ?? item.src} alt={item.alt} gallery />
                </div>
            </div>
        </figure>
    </ScenarioDetails>
{/snippet}

{#if gallery_slug}
    {@const item = gallery_rows.flat().find(({ src }) => src === gallery_slug)}
    {#if item}
        {@const entry = scenario[item.slug]}
        {@render image_viewer({ ...item, alt: item.alt ?? entry.alt }, entry.title, gallery_zoom_width, () => gallery_slug = undefined, true, gallery_origin)}
    {/if}
{:else if page.state.scenarioSlug}
    {@const entry = scenario[page.state.scenarioSlug]}
    <ScenarioDetails title={entry.title} onclose={quitScenario}
        open_image={open_case_image} suspended={!!case_image}>
        {#snippet children()}
            {#await entry.component() then module}
                <module.default />
            {/await}
        {/snippet}
    </ScenarioDetails>
    {#if case_image}
        {@render image_viewer(case_image, case_image.alt || entry.title, case_image.zoom_width, () => case_image = undefined, false, case_image.origin)}
    {/if}
{/if}

<noscript>
    <style>
        section { opacity: 1 !important; }
    </style>
</noscript>

<script>
    import { card_release } from "$lib/card_release.js";
    import TrailImage from "$lib/components/trail_image.svelte";
    import { image_pan_zoom } from "$lib/image_pan_zoom.js";
    import ScenarioCard from "$lib/components/scenarioCard.svelte";
    import ScenarioDetails from "$lib/components/scenarioDetails.svelte";

    import Header from "$lib/components/header.svelte";
    import Category from "$lib/components/category.svelte";
    import Footer from "$lib/components/footer.svelte";
    import VisitButton from "$lib/components/visit_button.svelte";

    import { onMount } from "svelte";
    import { goto, pushState } from "$app/navigation";
    import { page } from "$app/state";
    import { scenario } from "$lib/scenario.js";

    const case_studies = [
        { slug: 'paladins_concept', src: '/scenario/paladins_character_list.png', left: true },
        { slug: 'routes_and_journeys', src: '/scenario/rj.png' },
        { slug: 'palia_concept', src: '/scenario/palia.png' },
        { slug: 'morroworld', src: '/scenario/morroworld.webp' },
        { slug: 'pixel_icons_pack', src: '/scenario/iconsvol2.png' },
        { slug: 'wintertale_banner', src: '/scenario/wintertale.webp', left: true },
    ];

    // hand-made rows; each spans the full width, its pictures sharing it by aspect ratio so they all
    // come out the same height (on phones every picture gets a row of its own)
    const gallery_rows = [
        [
            { slug: 'thats_what_journey_means', src: '/scenario/pride.png', width: 1600, height: 1200 },
            { slug: 'sq', src: '/scenario/sq.png', width: 2800, height: 2100 },
            { slug: 'daloras', src: '/scenario/daloras.png', width: 2800, height: 2100 },
        ],
        [
            { slug: 'sneakers_bros', src: '/scenario/sneakers_2.webp', width: 1905, height: 1429, alt: 'Alternate Sneakers Bro’s brand artwork' },
            { slug: 'sneakers_bros', src: '/scenario/sneakers_full.webp', width: 2800, height: 938, alt: 'Wide Sneakers Bro’s brand banner' },
        ],
        [
            { slug: 'sneakers_bros', src: '/scenario/sneakers.png', width: 1905, height: 1429 },
            { slug: 'dino_cafe', src: '/scenario/dino_cafe.png', full_src: '/scenario/dino_cafe.gif', width: 1400, height: 1050 },
            { slug: 'blue_animation', src: '/scenario/blue.png', full_src: '/scenario/blue.gif', width: 1258, height: 851 },
        ],
    ];

    let mainSection;

    let gallery_slug = $state();
    let gallery_zoom_width = $state(0);
    let gallery_origin = $state(); // the card's <img>: the picture flies out of it and back

    function open_gallery(slug, trigger) {
        const image = trigger.querySelector('img');
        gallery_zoom_width = Math.ceil((image?.clientWidth ?? trigger.clientWidth) * 1.2);
        gallery_origin = image;
        gallery_slug = slug;
    }

    let case_image = $state();

    $effect(() => {
        if (!page.state.scenarioSlug) case_image = undefined;
    });

    function open_case_image(image) {
        if (!image?.naturalWidth) return;
        case_image = {
            src: image.currentSrc || image.src,
            alt: image.alt,
            width: image.naturalWidth,
            height: image.naturalHeight,
            zoom_width: Math.ceil(image.clientWidth * 1.2),
            origin: image,
        };
    }

    const preloaded_case_images = new Set();

    function preload_case(slug) {
        const entry = scenario[slug];
        void entry.component().catch(() => {});

        for (const [index, src] of entry.images.entries()) {
            if (preloaded_case_images.has(src)) continue;
            preloaded_case_images.add(src);

            const image = new Image();
            if (index > 0) image.fetchPriority = 'low';
            image.onerror = () => preloaded_case_images.delete(src);
            image.src = src;
        }
    }

    function enterScenario(slug) {
        pushState(`/${slug}`, { scenarioSlug: slug });
    }
    function quitScenario() {
        pushState('/', {});
    }

    onMount(() => {
        gsap.to(mainSection, {
        opacity: 1,
        duration: 0.7,
        ease: "power2.inOut"
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
        if (page.state.scenarioSlug) {
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

    export function scrollTo(node, targetId) {
    function handleClick(e) {
        e.preventDefault();
        document.getElementById(targetId)?.scrollIntoView({
            behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
        });
    }
    node.addEventListener('click', handleClick);
    return {
        destroy() {
        node.removeEventListener('click', handleClick);
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
    .gallery_view { width: 100%; margin-inline: auto; }
    /* the viewport spans the whole viewer area, so a zoomed image fills it instead of staying cropped to its starting size */
    .gallery_image_viewport {
        height: calc(100dvh - 2 * var(--viewer-gap-y));
        overflow: clip;
        border-radius: var(--radius-xl);
    }
    /* it spans the whole viewer, so a filled tint would wash over the empty space around the image */
    .gallery_image_viewport:focus-visible { background-color: transparent; }
    .gallery_image_layer { display: flex; align-items: center; justify-content: center; height: 100%; transform-origin: top left; }
    .gallery_image_layer :global(img) { pointer-events: auto; touch-action: none; }
    @media (prefers-reduced-motion: no-preference) {
        .gallery_image_layer:global(.is_zooming) { transition: transform 180ms var(--ease-out); }
    }
</style>
