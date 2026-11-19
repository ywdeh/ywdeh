<script>
    import { press } from '$lib/actions/press.js';
    import { site } from '$lib/content/site.js';
    import ArrowLink from '$lib/components/ui/arrow_link.svelte';
    import DividerStars from '$lib/components/ui/divider_stars.svelte';
    import HandLine from '$lib/components/ui/hand_line.svelte';
</script>

<div class="flex flex-col gap-row">
    <div class="flex flex-col gap-inline text-title">
        <p>{site.call_to_action}</p>
        <div class="flex flex-col gap-copy md:flex-row md:items-center md:justify-between">
            <ArrowLink href="mailto:{site.email}" class="w-fit">{site.email}</ArrowLink>
            <ArrowLink href={site.resume} external class="w-fit">check résumé</ArrowLink>
        </div>
    </div>

    <div class="relative overflow-x-clip">
        <HandLine />
        <DividerStars layout="footer_start" />
        <DividerStars layout="footer_end" />
    </div>

    <footer id="contacts" class="flex flex-col items-start gap-control text-ui">
        <p class="ink-faint">{site.signature}</p>
        <nav aria-label="Socials and contacts" class="flex flex-wrap items-center gap-x-copy gap-y-inline">
            {#each site.socials as { label, href } (href)}
                <a use:press {href} target="_blank" rel="noopener noreferrer" class="link-quiet tap-target"
                    >{label}</a
                >
            {/each}
        </nav>
    </footer>
</div>
