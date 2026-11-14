<script>
    import { card_release } from "$lib/card_release.js";
    import Footer from "$lib/components/footer.svelte";
</script>

<section class="page_scroll w-full px-page py-page-y">
    <div class="flex min-h-full w-full flex-col justify-center gap-section">
        <div class="text-intro">
            <p>Whoops! <span class="fg-faint">That's a four o' four</span></p>
            <p><span class="fg-faint">Quickly,</span> <a use:card_release href="/">return</a> <span class="fg-faint">before it all collapses</span></p>
        </div>

        <Footer />
    </div>
</section>
