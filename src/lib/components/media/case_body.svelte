<script>
    import { press } from '$lib/actions/press.js';
    import { inline_parts } from '$lib/content/inline.js';
    import Artwork from '$lib/components/media/artwork.svelte';
    import ImageSlider from '$lib/components/media/image_slider.svelte';

    let { blocks } = $props();
</script>

{#snippet inline(part)}{#if part.href}<a use:press href={part.href} target="_blank" rel="noopener noreferrer"
            >{part.text}</a
        >{:else if part.strong}<strong class="font-semibold">{part.text}</strong
        >{:else}{part.text}{/if}{/snippet}

{#each blocks as block, index (index)}
    {#if block.image}
        <Artwork src={block.image} alt={block.alt} />
    {:else if block.slider}
        <ImageSlider pictures={block.slider} />
    {:else}
        <article class="flex w-full max-w-3xl flex-col gap-copy self-center">
            {#if block.heading}<h2 class="text-heading">{block.heading}</h2>{/if}
            {#each block.text as paragraph, line (line)}
                <p class="ink-soft">
                    {#each inline_parts(paragraph) as part, piece (piece)}{@render inline(part)}{/each}
                </p>
            {/each}
        </article>
    {/if}
{/each}
