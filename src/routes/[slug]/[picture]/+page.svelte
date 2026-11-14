<script>
    import Portfolio from '$lib/app/portfolio.svelte';
    let { data } = $props();
</script>

<Portfolio initial_slug={data.slug} initial_component={data.Component} initial_picture={data.picture} />
