<svelte:head></svelte:head>

<div class="fixed w-screen h-screen pointer-events-none bg-[url(/noise.gif)] mix-blend-overlay opacity-4 bg-repeat z-100"></div>

<section class="w-screen h-screen overflow-auto overflow-x-hidden bg-neutral-900 text-mauve-50 p-5 lg:py-10 opacity-0" bind:this={mainSection}>
    <div class="flex flex-col gap-30 max-w-5xl mx-auto font-[Google_Sans_Flex,'Google_Sans',sans-serif]">
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
                <ScenarioCard 
                    onclick={() => enterScenario('routes_and_journeys')} 
                    src="scenario/rj.png"
                    alt={scenario['routes_and_journeys'].alt}
                    title={scenario['routes_and_journeys'].title}
                    client={scenario['routes_and_journeys'].client}
                />
                <ScenarioCard 
                    onclick={() => enterScenario('sq')} 
                    src="scenario/sq.png" 
                    alt={scenario['sq'].alt}
                    title={scenario['sq'].title}
                    client={scenario['sq'].client}
                />
                <ScenarioCard 
                    onclick={() => enterScenario('dino_cafe')}
                    thumbnail="scenario/dino_cafe.png"
                    src="scenario/dino_cafe.gif"
                    alt={scenario['dino_cafe'].alt}
                    title={scenario['dino_cafe'].title}
                    client={scenario['dino_cafe'].client}
                />
                <ScenarioCard 
                onclick={() => enterScenario('sneakers_bros')}
                src="scenario/sneakers.png"
                alt={scenario['sneakers_bros'].alt}
                title={scenario['sneakers_bros'].title}
                client={scenario['sneakers_bros'].client}
                />
                <ScenarioCard 
                    onclick={() => enterScenario('daloras')}
                    src="scenario/daloras.png"
                    alt={scenario['daloras'].alt}
                    title={scenario['daloras'].title}
                    client={scenario['daloras'].client}
                />
            </Category>
        </div>

        <Category title="ux & ui design" anchor="ux-ui-design">
            <ScenarioCard
                onclick={() => enterScenario('paladins_concept')} left
                src="scenario/paladins_character_list.png"
                alt={scenario['paladins_concept'].alt}
                title={scenario['paladins_concept'].title}
                client={scenario['paladins_concept'].client}
            />
            <ScenarioCard 
                onclick={() => enterScenario('pixel_icons_pack')}
                src="scenario/iconsvol2.png"
                alt={scenario['pixel_icons_pack'].alt}
                title={scenario['pixel_icons_pack'].title}
                client={scenario['pixel_icons_pack'].client}
            />
            <ScenarioCard
                onclick={() => enterScenario('palia_concept')}
                src="scenario/palia.png"
                alt={scenario['palia_concept'].alt}
                title={scenario['palia_concept'].title}
                client={scenario['palia_concept'].client}
            />
            <ScenarioCard
                onclick={() => enterScenario('morroworld')}
                src="scenario/morroworld.webp"
                alt={scenario['morroworld'].alt}
                title={scenario['morroworld'].title}
                client={scenario['morroworld'].client}
            />
        </Category>

        <Category title="illustration & art" anchor="illustration-art">
            <ScenarioCard
                onclick={() => enterScenario('wintertale_banner')}
                left src="scenario/wintertale.webp"
                alt={scenario['wintertale_banner'].alt}
                title={scenario['wintertale_banner'].title}
                client={scenario['wintertale_banner'].client}
            />
            <ScenarioCard
                onclick={() => enterScenario('thats_what_journey_means')}
                src="scenario/pride.png"
                alt={scenario['thats_what_journey_means'].alt}
                title={scenario['thats_what_journey_means'].title}
                client={scenario['thats_what_journey_means'].client}
            />
            <ScenarioCard
                onclick={() => enterScenario('blue_animation')}
                thumbnail="scenario/blue.png" src="scenario/blue.gif"
                alt={scenario['blue_animation'].alt}
                title={scenario['blue_animation'].title}
                client={scenario['blue_animation'].client}
            />
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