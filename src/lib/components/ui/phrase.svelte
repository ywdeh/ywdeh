<script>
    import { press } from '$lib/actions/press.js';

    let { parts } = $props();
</script>

{#each parts as part, index (index)}{#if part.href}<a use:press href={part.href} class:ink-faint={part.faint}
            >{part.text}</a
        >{:else if part.image}<span class="relative inline-block" class:ink-faint={part.faint}
            >{part.text}<img src={part.image} alt="" class="inline-block h-[0.472em]" /></span
        >{:else if part.faint}<span class="ink-faint">{part.text}</span>{:else}{part.text}{/if}{/each}
