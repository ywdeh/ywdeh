<script>
    import { site } from '$lib/content/site.js';
    import Phrase from '$lib/components/ui/phrase.svelte';

    let { element = $bindable() } = $props();
</script>

<p bind:this={element} class="text-intro"><Phrase parts={site.intro} /></p>
