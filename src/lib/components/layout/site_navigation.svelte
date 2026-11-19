<script>
    import { press } from '$lib/actions/press.js';
    import { section_scroll } from '$lib/actions/section_scroll.js';
    import { labels } from '$lib/content/labels.js';
    import { site } from '$lib/content/site.js';
</script>

{#snippet jump(id, label, classes = '')}
    <a use:press use:section_scroll={id} href="#{id}" class="link-quiet tap-target whitespace-nowrap {classes}">
        {label}
    </a>
{/snippet}

<nav aria-label={labels.work_sections} class="flex flex-wrap justify-between gap-x-grid gap-y-control text-ui">
    <div class="flex flex-wrap items-center gap-x-copy gap-y-inline">
        {#each site.sections as { id, label } (id)}
            {@render jump(id, label)}
        {/each}
    </div>
    {@render jump(site.contact.id, site.contact.label, 'ml-auto')}
</nav>
