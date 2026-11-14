<script>
    import { press_release } from '$lib/actions/press_release.js';
    import { section_scroll } from '$lib/actions/section_scroll.js';
    const sections = [
        ['personal-projects', 'personal projects'],
        ['case-studies', 'selected work'],
        ['gallery', 'gallery'],
    ];
</script>

<nav aria-label="Work sections" class="flex flex-wrap justify-between gap-x-card-gap gap-y-control text-ui">
    <div class="flex flex-wrap items-center gap-x-copy gap-y-inline">
        {#each sections as [id, label]}
            <a
                use:press_release
                use:section_scroll={id}
                href="#{id}"
                class="link-quiet tap-target whitespace-nowrap">{label}</a
            >
        {/each}
    </div>
    <a
        use:press_release
        use:section_scroll={'contacts'}
        href="#contacts"
        class="link-quiet tap-target whitespace-nowrap ml-auto">contact me</a
    >
</nav>
