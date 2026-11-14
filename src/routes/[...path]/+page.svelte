<script>
    import Portfolio from '$lib/components/portfolio.svelte';

    let { data } = $props();
</script>

<Portfolio arrival={data.view} />
