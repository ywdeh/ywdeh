<script>
    import CardScale from "$lib/components/cardScale.svelte";

    import Category from "$lib/components/category.svelte";
    import Footer from "$lib/components/footer.svelte";

    import { onMount } from "svelte";

    let sectionEl;
    let blocks = [];

    // scenarios
    import { pushState } from "$app/navigation";
    import { page } from "$app/state";
    import DetailsTemplate from "$lib/components/detailsTemplate.svelte";
    import { scenario } from "$lib/scenario.js";

    function openCase(slug) {
        pushState(`/${slug}`, { caseSlug: slug });
    }
    function closeCase() {
        history.back();
    }

    onMount(() => {
        gsap.to(sectionEl, {
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
            stagger: 0.1
            });
        }
        });
    });

    // scroll
    export function scrollTo(node, targetId) {
    function handleClick(e) {
        e.preventDefault();
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
    node.addEventListener('click', handleClick);
    return {
        destroy() {
        node.removeEventListener('click', handleClick);
        }
    };
    }

</script>

<div class="fixed w-screen h-screen pointer-events-none bg-[url(/noise.gif)] mix-blend-overlay opacity-4 bg-repeat z-100"></div>

<section class="w-screen h-screen overflow-auto bg-neutral-900 text-mauve-50 p-5 lg:p-0 lg:py-10 opacity-0" bind:this={sectionEl}>

    <div class="flex flex-col gap-30 max-w-5xl mx-auto font-[Google_Sans_Flex]">
        <header class="flex flex-col gap-20 justify-between">

            <div class="flex justify-between">
                <div class="flex md:flex-col flex-row-reverse justify-between w-full">
                    <a href="/" class="w-fit"><img src="pfp.png" alt="" class="size-15 rounded-full mb-5"></a>
                    <h1 class="flex flex-col">
                        <span class="font-normal">Danya Hedwy</span>
                        <span class="opacity-90">graphic & visual design</span>
                    </h1>
                </div>
            </div>
        </header>

        <div class="max-w-full md:max-w-3xl font-[Yuyu] text-6xl md:text-7xl tracking-[-3px] split">
            Every project has a feeling
            <span class="opacity-30">it's reaching for. </span>
                I make that 
            <span class="relative inline-block">
                feeling
            </span>
                visible <span class="opacity-30">with motion, patterns and textures, lights and shadows -</span> in web, game UIs, branding <span class="opacity-30">and anywhere
            <span class="relative inline-block">
                else
                <img src="smile.gif" alt="" class="inline-block bottom-2 -right-9 h-7.5 md:h-8.5">
            </span>
            </span>
        </div>


        <div class="flex flex-col gap-10">
            <nav aria-label="Work sections" class="flex flex-col gap-2 md:flex-row justify-between">
                <div class="flex items-center gap-4">
                    <a use:scrollTo={'brand-identity'} href="#brand-identity" class="transition opacity-30 hover:opacity-90">brand & identity</a>
                    <a use:scrollTo={'ux-ui-design'} href="#ux-ui-design" class="transition opacity-30 hover:opacity-90">ux & ui design</a>
                    <a use:scrollTo={'illustration-art'} href="#illustration-art" class="transition opacity-30 hover:opacity-90">illustration & art</a>
                </div>
                <a use:scrollTo={'contacts'} href="#contacts" class="transition opacity-30 hover:opacity-90 w-fit">contact me</a>
            </nav>

            <Category title="brand & identity" anchor="brand-identity">
                <CardScale onclick={() => openCase('routes-and-journeys')} src="scenario/rj.png" alt="RJ initials carved into a stone tablet with ivy vines, shown in orange and green color variants" title="dyeable emblem illustration" client="Routes & Journeys" />
                <CardScale onclick={() => openCase('sq')} src="scenario/sq.png" alt="SQ letters forming a glowing purple and pink gem-cut heart shape" title="sq community emblem" client="SQ" />
                <CardScale onclick={() => openCase('dino-cafe')} thumbnail="scenario/dino_cafe.png" src="scenario/dino_cafe.gif" alt="Hand-lettered green Cyrillic wordmark on cream paper, styled like a hand-painted cafe sign" title="cafe full rebranding" client="Dino Cafe" />
                <CardScale onclick={() => openCase('sneakers-bros')} src="scenario/sneakers.png" alt="Bold angular Sneakers Bro's logo in black and white streetwear style, with dashed technical line accents" title="sneakers store logo & socials banners" client="Sneakers Bro's" />
                <CardScale onclick={() => openCase('daloras')} src="scenario/daloras.png" alt="Daloras model agency wordmark in a warm gold serif typeface, shown in lowercase and uppercase business card versions" title="model agency logo" client="Daloras" />
            </Category>
        </div>

        <Category title="ux & ui design" anchor="ux-ui-design">
            <CardScale onclick={() => openCase('paladins-concept')} left src="scenario/paladins.png" alt="Redesigned in-game item store UI with category sidebar, item grid, and build path panel" title="game ux/ui redesign concept" client="Paladins" />
            <CardScale onclick={() => openCase('pixel-icons-pack')} src="scenario/iconsvol2.png" alt="Grid of small pixel-art game icons in bright colors" title="pixel icon pack 5×5 and 3×3" client="Wintertale" />
            <CardScale onclick={() => openCase('palia-concept')} src="scenario/palia.png" alt="Before and after comparison of an inventory hotbar, simplified into a cleaner slot-based layout" title="hotbar redesign concept" client="Palia" />
            <CardScale onclick={() => openCase('morroworld')} src="https://cdn.dribbble.com/userupload/15692955/file/04fb21afb07ce749c83b06d8c964ca22.png?crop=0x0-1575x1181&format=webp&resize=640x480&vertical=center" alt="" title="fantasy website design" client="MorroWorld" />
        </Category>

        <Category title="illustration & art" anchor="illustration-art">
            <CardScale onclick={() => openCase('wintertale-banner')} left src="scenario/wintertale.webp" alt="Illustrated banner split into a cozy blue-toned workshop scene and a snowy window view with gift boxes" title="illustrated banner" client="Wintertale" />
            <CardScale onclick={() => openCase('blue-animation')} thumbnail="scenario/blue.png" src="scenario/blue.gif" alt="Simple round-headed illustrated character standing on a hill, looking down thoughtfully" title="blue - simple illustrated character" client="personal" />
            <CardScale onclick={() => openCase('thats-what-journey-means')} src="scenario/pride.png" alt="Metallic holographic lettering reading that's what journey means against a dark background" title="that's what journey means poster" client="personal" />
        </Category>

        <Footer cta="have a role in mind?" />

    </div>

</section>

{#if page.state.caseSlug}
    {@const entry = scenario[page.state.caseSlug]}
    <DetailsTemplate title={entry.title} onclose={closeCase}>
        {#snippet children()}
            {#await entry.component() then module}
                <module.default />
            {/await}
        {/snippet}
    </DetailsTemplate>
{/if}
