<script>
    import { press } from '$lib/actions/press.js';
    import { section_scroll } from '$lib/actions/section_scroll.js';
    import { site } from '$lib/content/site.js';
</script>

{#snippet jump(id, label, class_name = '')}
    <a
        use:press
        use:section_scroll={id}
        href="#{id}"
        class="link-quiet tap-target whitespace-nowrap {class_name}"
    >
        {label}
    </a>
{/snippet}

<nav aria-label="Work sections" class="flex flex-wrap justify-between gap-x-grid gap-y-control text-ui">
    <div class="flex flex-wrap items-center gap-x-copy gap-y-inline">
        {#each site.sections as { id, label } (id)}
            {@render jump(id, label)}
        {/each}
    </div>
    {@render jump('contacts', 'contact me', 'ml-auto')}
</nav>
