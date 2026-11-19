<script>
    import { site } from '$lib/content/site.js';
    import Portfolio from '$lib/components/portfolio.svelte';

    let { data } = $props();
</script>

<svelte:head>
    <title>{site.title}</title>
</svelte:head>

<Portfolio arrival={data.view} />
