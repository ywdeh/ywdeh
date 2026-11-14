<script>
    import { press_release } from '$lib/actions/press_release.js';
    import SiteFooter from '$lib/components/layout/site_footer.svelte';
</script>

<section class="page flex w-full flex-col justify-center px-page py-page-y">
    <div class="flex w-full flex-col gap-section">
        <div class="text-intro">
            <p>Whoops! <span class="fg-faint">That's a four o' four</span></p>
            <p>
                <span class="fg-faint">Quickly,</span> <a use:press_release href="/">return</a>
                <span class="fg-faint">before it all collapses</span>
            </p>
        </div>

        <SiteFooter />
    </div>
</section>
