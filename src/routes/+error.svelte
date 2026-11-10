<script>
    import { card_release } from "$lib/card_release.js";
    import Footer from "$lib/components/footer.svelte";
</script>

<section class="page_scroll w-full p-5 lg:py-10">
    <div class="mx-auto flex min-h-full max-w-5xl flex-col justify-center gap-30">
        <div class="font-hand max-w-full text-6xl tracking-[-3px] md:max-w-3xl md:text-7xl">
            <p>Whoops! <span class="fg-faint">That's a four o' four</span></p>
            <p><span class="fg-faint">Quickly,</span> <a use:card_release href="/">return</a> <span class="fg-faint">before it all collapses</span></p>
        </div>

        <Footer cta="have a role in mind?" />
    </div>
</section>
