<script>
    import Portfolio from "$lib/components/portfolio.svelte";
    let { data } = $props();
</script>

<Portfolio initial_slug={data.slug} initial_component={data.Component} />
