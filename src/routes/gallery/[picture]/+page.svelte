<script>
    import Portfolio from '$lib/app/portfolio.svelte';
    let { data } = $props();
</script>

<Portfolio initial_gallery_picture={data.picture} />
