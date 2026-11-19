<script>
    import { labels } from '$lib/content/labels.js';

    let { parts, spoken = labels.range_joiner, rule_class = '' } = $props();
</script>

{#each parts as part, index (index)}{#if index > 0}<span class="rule {rule_class}" aria-hidden="true"
        ></span>{#if spoken}<span class="sr-only">{spoken}</span>{/if}{/if}{part}{/each}
