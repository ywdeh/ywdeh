<script>
    import { press } from '$lib/actions/press.js';
    import SiteFooter from '$lib/components/layout/site_footer.svelte';
</script>

<svelte:head>
    <title>hedwy</title>
</svelte:head>

<main class="flex min-h-dvh w-full flex-col justify-center overflow-x-clip px-page-x py-page-y">
    <div class="flex w-full flex-col gap-section">
        <div class="text-intro">
            <p>Whoops! <span class="ink-faint">That's a four o' four</span></p>
            <p>
                <span class="ink-faint">Quickly,</span> <a use:press href="/">return</a>
                <span class="ink-faint">before it all collapses</span>
            </p>
        </div>
        <SiteFooter />
    </div>
</main>
