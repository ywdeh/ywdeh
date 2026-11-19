<script>
    import { site } from '$lib/content/site.js';
    import Phrase from '$lib/components/ui/phrase.svelte';
    import SiteFooter from '$lib/components/layout/site_footer.svelte';
</script>

<svelte:head>
    <title>{site.title}</title>
</svelte:head>

<main class="flex min-h-dvh w-full flex-col justify-center overflow-x-clip px-page-x py-page-y">
    <div class="flex w-full flex-col gap-section">
        <div class="text-intro">
            {#each site.not_found as line, index (index)}
                <p><Phrase parts={line} /></p>
            {/each}
        </div>
        <SiteFooter />
    </div>
</main>
