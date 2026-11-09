<script>
    import { card_release } from "$lib/card_release.js";
    import Header from "$lib/components/header.svelte";
    import Footer from "$lib/components/footer.svelte";
    import { onMount } from "svelte";
</script>

<section class="w-screen h-screen overflow-auto overflow-x-hidden bg-neutral-900 text-mauve-100 p-5 lg:py-10" bind:this={mainSection}>
    <div class="flex flex-col gap-30 max-w-5xl mx-auto font-[Google_Sans_Flex,'Google_Sans',sans-serif] h-full justify-center">

        <div class="flex flex-col gap-10">
            <div class="max-w-full md:max-w-3xl font-[Yuyu,'Caveat',sans-serif] text-6xl md:text-7xl tracking-[-3px] split">
                <p>Whoops! <span class="opacity-30">That's a four o' four</span></p>
                <p><span class="opacity-30">Quickly,</span> <a use:card_release href="/">return</a> <span class="opacity-30">before it all collapses</span></p>
            </div>

            <nav aria-label="Work sections" class="flex flex-col gap-2 md:flex-row justify-between">
                <a use:card_release href="/" class="transition opacity-30 hover:opacity-90 w-fit">click here</a>
            </nav>
        </div>

        <Footer cta="have a role in mind?" />
    </div>
</section>