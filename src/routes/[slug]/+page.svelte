<script>
    import { goto } from "$app/navigation";
    import ScenarioDetails from "$lib/components/scenarioDetails.svelte";
    let { data } = $props();
</script>

<ScenarioDetails title={data.title} onclose={() => goto("/")}>
    {#snippet children()}
        <data.Component />
    {/snippet}
</ScenarioDetails>