<script>
    import Portfolio from '$lib/components/portfolio.svelte';

    let { data } = $props();
</script>

<svelte:head>
    <title>hedwy</title>
</svelte:head>

<Portfolio arrival={data.view} />
