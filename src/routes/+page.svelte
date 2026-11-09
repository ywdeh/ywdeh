<svelte:head></svelte:head>
<svelte:window bind:innerWidth={viewport_width} />

<div class="fixed w-screen h-screen pointer-events-none bg-[url(/noise.gif)] mix-blend-overlay opacity-4 bg-repeat z-100"></div>

<section class="w-screen h-screen overflow-auto overflow-x-hidden bg-neutral-900 text-mauve-100 px-6 py-6 md:px-12 md:py-10 lg:px-16 lg:py-14 opacity-0" bind:this={mainSection} inert={!!(gallery_slug || page.state.scenarioSlug)}>
    <!-- every gap steps down with the screen: phone / md / lg -->
    <div class="flex flex-col gap-16 md:gap-24 lg:gap-30 w-full font-[Google_Sans_Flex,'Google_Sans',sans-serif]">
        <Header />

        <div class="flex flex-col gap-6 md:gap-8 lg:gap-10">
            <nav aria-label="Work sections" class="flex flex-col gap-2 md:flex-row justify-between">
                <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <a use:card_release use:scrollTo={'case-studies'} href="#case-studies" class="transition opacity-30 hover:opacity-90">case studies</a>
                    <a use:card_release use:scrollTo={'gallery'} href="#gallery" class="transition opacity-30 hover:opacity-90">gallery</a>
                </div>
                <div class="flex items-center gap-4">
                    <a use:card_release use:scrollTo={'contacts'} href="#contacts" class="transition opacity-30 hover:opacity-90 w-fit">contact me</a>
                </div>
            </nav>

            <Category title="case studies" anchor="case-studies" count={case_studies.length}>
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
            <div class="gallery gap-y-8 md:gap-y-10 lg:gap-y-12" bind:clientWidth={gallery_width}>
                {#each gallery_layout as { items, height, filler }}
                    <div class="gallery_row gap-x-6 md:gap-x-8 lg:gap-x-10">
                        {#each items as { slug, src, full_src, width, height: image_height, alt, brightness } (src)}
                            <div class="gallery_item"
                                style:width={height ? height * width / image_height + 'px' : undefined}
                                style:flex={height ? undefined : `${width / image_height} 1 0`}>
                                <ScenarioCard image_only src={full_src ?? src} thumbnail={src} {width} height={image_height} {brightness}
                                    title={scenario[slug].title} client={scenario[slug].client} alt={alt ?? scenario[slug].alt}
                                    onclick={(event) => open_gallery(src, event.currentTarget)} />
                            </div>
                        {/each}
                        {#if filler}
                            <div aria-hidden="true" class="flex-1 rounded-xl bg-mauve-100/3" style:height={height + 'px'}></div>
                        {/if}
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

    const gallery_rows = [
        [
            { slug: 'sq', src: '/scenario/sq.png', width: 2800, height: 2100 },
            { slug: 'sq', src: '/scenario/sq_outline.png', width: 2800, height: 2100, alt: 'Outline version of the SQ emblem' },
        ],
        [
            { slug: 'daloras', src: '/scenario/daloras.png', width: 2800, height: 2100 },
            { slug: 'thats_what_journey_means', src: '/scenario/pride.png', width: 1600, height: 1200 },
        ],
        [
            { slug: 'sneakers_bros', src: '/scenario/sneakers_2.webp', width: 1905, height: 1429, brightness: 0.68, alt: 'Alternate Sneakers Bro’s brand artwork' },
            { slug: 'blue_animation', src: '/scenario/blue.png', full_src: '/scenario/blue.gif', width: 1258, height: 851, brightness: 0.66 },
        ],
        [
            { slug: 'sneakers_bros', src: '/scenario/sneakers_full.webp', width: 2800, height: 938, brightness: 0.65, alt: 'Wide Sneakers Bro’s brand banner' },
        ],
        [
            { slug: 'sneakers_bros', src: '/scenario/sneakers.png', width: 1905, height: 1429, brightness: 0.62 },
            { slug: 'dino_cafe', src: '/scenario/dino_cafe.png', full_src: '/scenario/dino_cafe.gif', width: 1400, height: 1050, brightness: 0.61 },
        ],
    ];

    let mainSection;
    // justified gallery: fill each row with as many images as fit at about the old size (376px tall),
    // then scale that row so it spans the width exactly; the last row keeps the target height
    let gallery_width = $state(0);
    let viewport_width = $state(0);
    const gallery_items = gallery_rows.flat();

    let gallery_layout = $derived.by(() => {
        // before the width is measured (server render), fall back to the hand-made rows
        if (!gallery_width) return gallery_rows.map((items) => ({ items, height: 0 }));
        // matches gap-x-6 / md:gap-x-8 / lg:gap-x-10 on .gallery_row
        const gap = viewport_width >= 1024 ? 40 : viewport_width >= 768 ? 32 : 24;
        // on phones the target sits just above a full-width 4:3 image, so it's one image per row
        const target = gallery_width < 768 ? 260 : 376;
        const rows = [];
        let row = [];
        let ratio_sum = 0;
        const row_height = (count, sum) => (gallery_width - gap * (count - 1)) / sum;
        for (const item of gallery_items) {
            const ratio = item.width / item.height;
            const height = row_height(row.length + 1, ratio_sum + ratio);
            if (height > target) {
                row.push(item);
                ratio_sum += ratio;
                continue;
            }
            // adding this image makes the row shorter than the target: break wherever the row height
            // lands closer to the target, either before this image or after it
            const without = row.length ? row_height(row.length, ratio_sum) : Infinity;
            if (without - target < target - height) {
                rows.push({ items: row, height: without });
                row = [item];
                ratio_sum = ratio;
            } else {
                rows.push({ items: [...row, item], height });
                row = [];
                ratio_sum = 0;
            }
        }
        if (row.length) {
            // a short last row would blow up if stretched, so it stays at the target height (capped to fit)
            const fit = (gallery_width - gap * (row.length - 1)) / ratio_sum;
            const height = Math.min(target, fit);
            // whatever width the last row leaves is filled by one gray block, like the card grids
            const leftover = gallery_width - height * ratio_sum - gap * row.length;
            rows.push({ items: row, height, filler: leftover >= 80 });
        }
        return rows;
    });

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
    /* row packing happens in gallery_layout; widths come from there */
    .gallery { grid-column: 1 / -1; display: flex; flex-direction: column; }
    .gallery_row { display: flex; align-items: flex-start; }
    .gallery_item { min-width: 0; flex-shrink: 1; }
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
