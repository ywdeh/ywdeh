<script>
    import ScenarioCard from "$lib/components/scenarioCard.svelte";

    import Footer from "./footer.svelte";

    import { fade, fly } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    function slideY({ duration = 350, easing = cubicOut } = {}) {
        return {
            duration,
            easing,
            css: (t) => `transform: translateY(${(1 - t) * 100}%)`
        };
    }

    let { title, onclose, children } = $props();


    function escape(event) {
        if (event.key === 'Escape') {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        onclose();
        }
    }

</script>

<svelte:window on:keydown={escape} />

<div class="fixed flex items-center justify-center inset-0 z-90">
    
    <button aria-label="overlay" onclick={onclose} class="fixed inset-0 bg-neutral-950/50 backdrop-saturate-0 backdrop-sepia-10" transition:fade={{ duration: 400 }}></button>

    <div class="fixed flex flex-col bottom-0 w-full max-w-261 bg-neutral-900 h-[90%] rounded-t-xl overflow-y-auto px-5 pb-10 md:px-10 md:pb-15 font-normal scrollbar-none!"
    transition:slideY>

        <div class="z-80 flex w-full sticky bg-neutral-900/98 backdrop-blur-lg py-10 justify-between
                    -top-1.25">
            <h1>{title}</h1>
            <div class="flex items-center gap-5">
                <button onclick={onclose} class="group cursor-pointer transition opacity-30 hover:opacity-80 active:opacity-30 -m-2 p-2"><img src="close.svg" alt="" class="size-8"></button>
            </div>
            <div class="absolute top-full bg-linear-to-b from-neutral-900/40 to-neutral-900/0 w-full h-10 pointer-events-none"></div>
        </div>

        <div class="flex flex-col gap-40 pt-5">
        <!-- pt-5 ??? -->

            <div class="flex flex-col gap-20 scenario-body text-lg">
                {@render children()}
            </div>

            <Footer cta="have a role in mind?" />
        </div>

    </div>

</div>


<style>
    h1 {
        font-size: var(--text-2xl);
        line-height: var(--tw-leading, var(--text-2xl--line-height));
        opacity: 0.8;
    }

    :global(.scenario-body a) {
        opacity: 1;
        /* todo */
    }

    :global(.scenario-body h1) {
        font-size: var(--text-2xl);
        line-height: var(--tw-leading, var(--text-2xl--line-height));
        opacity: 0.8;
    }

    :global(.scenario-body p) {
        opacity: 0.6;
    }

    :global(.scenario-body img) {
        border-radius: 0.75rem;
    }

    :global(.scenario-body article) {
        display: flex;
        flex-direction: column;
        gap: calc(var(--spacing) * 5);
        align-self: center;
        text-align: left;
        width: 100%;
        max-width: var(--container-3xl);
    }
</style>