<svelte:head>
    <!-- <title>{page.state.scenarioSlug ? `hedwy × ${scenario[page.state.scenarioSlug].title}` : 'hedwy'}</title> -->
</svelte:head>

<div class="fixed w-screen h-screen pointer-events-none bg-[url(/noise.gif)] mix-blend-overlay opacity-4 bg-repeat z-100"></div>

<section class="w-screen h-screen overflow-auto bg-neutral-900 text-mauve-50 p-5 lg:py-10 opacity-0" bind:this={mainSection}>
    <div class="flex flex-col gap-30 max-w-5xl mx-auto font-[Google_Sans_Flex]">
        <Header />

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
                <ScenarioCard onclick={() => enterScenario('routes-and-journeys')} src="scenario/rj.png" alt="RJ initials carved into a stone tablet with ivy vines, shown in orange and green color variants" title="dyeable emblem illustration" client="Routes & Journeys" />
                <ScenarioCard onclick={() => enterScenario('sq')} src="scenario/sq.png" alt="SQ letters forming a glowing purple and pink gem-cut heart shape" title="sq community emblem" client="SQ" />
                <ScenarioCard onclick={() => enterScenario('dino-cafe')} thumbnail="scenario/dino_cafe.png" src="scenario/dino_cafe.gif" alt="Hand-lettered green Cyrillic wordmark on cream paper, styled like a hand-painted cafe sign" title="cafe full rebranding" client="Dino Cafe" />
                <ScenarioCard onclick={() => enterScenario('sneakers-bros')} src="scenario/sneakers.png" alt="Bold angular Sneakers Bro's logo in black and white streetwear style, with dashed technical line accents" title="sneakers store logo & socials banners" client="Sneakers Bro's" />
                <ScenarioCard onclick={() => enterScenario('daloras')} src="scenario/daloras.png" alt="Daloras model agency wordmark in a warm gold serif typeface, shown in lowercase and uppercase business card versions" title="model agency logo" client="Daloras" />
            </Category>
        </div>

        <Category title="ux & ui design" anchor="ux-ui-design">
            <ScenarioCard onclick={() => enterScenario('paladins-concept')} left src="scenario/paladins.png" alt="Redesigned in-game item store UI with category sidebar, item grid, and build path panel" title="game ux/ui redesign concept" client="Paladins" />
            <ScenarioCard onclick={() => enterScenario('pixel-icons-pack')} src="scenario/iconsvol2.png" alt="Grid of small pixel-art game icons in bright colors" title="pixel icon pack 5×5 and 3×3" client="Wintertale" />
            <ScenarioCard onclick={() => enterScenario('palia-concept')} src="scenario/palia.png" alt="Before and after comparison of an inventory hotbar, simplified into a cleaner slot-based layout" title="hud elements redesign concept" client="Palia" />
            <ScenarioCard onclick={() => enterScenario('morroworld')} src="scenario/morroworld.webp" alt="" title="fantasy website design" client="MorroWorld" />
        </Category>

        <Category title="illustration & art" anchor="illustration-art">
            <ScenarioCard onclick={() => enterScenario('wintertale-banner')} left src="scenario/wintertale.webp" alt="Illustrated banner split into a cozy blue-toned workshop scene and a snowy window view with gift boxes" title="illustrated banner" client="Wintertale" />
            <ScenarioCard onclick={() => enterScenario('thats-what-journey-means')} src="scenario/pride.png" alt="Metallic holographic lettering reading that's what journey means against a dark background" title="that's what journey means poster" client="personal" />
            <ScenarioCard onclick={() => enterScenario('blue-animation')} thumbnail="scenario/blue.png" src="scenario/blue.gif" alt="Simple round-headed illustrated character standing on a hill, looking down thoughtfully" title="blue - simple illustrated character" client="personal" />
        </Category>

        <Footer cta="have a role in mind?" />
    </div>
</section>

{#if page.state.scenarioSlug}
    {@const entry = scenario[page.state.scenarioSlug]}
    <ScenarioDetails title={entry.title} onclose={quitScenario}>
        {#snippet children()}
            {#await entry.component() then module}
                <module.default />
            {/await}
        {/snippet}
    </ScenarioDetails>
{/if}

<noscript>
    <style>
        section { opacity: 1 !important; }
    </style>
</noscript>

<script>
    import ScenarioCard from "$lib/components/scenarioCard.svelte";
    import ScenarioDetails from "$lib/components/scenarioDetails.svelte";

    import Header from "$lib/components/header.svelte";
    import Category from "$lib/components/category.svelte";
    import Footer from "$lib/components/footer.svelte";

    import { onMount } from "svelte";
    import { goto, pushState } from "$app/navigation";
    import { page } from "$app/state";
    import { scenario } from "$lib/scenario.js";

    let mainSection;

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
            stagger: 0.1
            });
        }
        });
    });

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