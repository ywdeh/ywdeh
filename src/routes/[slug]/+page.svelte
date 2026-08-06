<script>
    import { goto } from "$app/navigation";
    import DetailsTemplate from "$lib/components/detailsTemplate.svelte";
    let { data } = $props();
</script>

<DetailsTemplate title={data.title} onclose={() => goto("/")}>
    {#snippet children()}
        <data.Component />
    {/snippet}
</DetailsTemplate>