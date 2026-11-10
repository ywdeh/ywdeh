<script>
    import { card_release } from "$lib/card_release.js";
    import ArrowIcon from "./arrow_icon.svelte";
    import DividerStars from "./divider_stars.svelte";
    import HandLine from "./hand_line.svelte";
    let { cta } = $props();

    const socials = [
        ['telegram', 'https://t.me/ywdeh'],
        ['instagram', 'https://instagram.com/just.hedwy'],
        ['linkedin', 'https://linkedin.com/in/hedwy'],
        ['dribbble', 'https://dribbble.com/hedwy'],
        ['github', 'https://github.com/ywdeh'],
    ];
</script>

{#snippet contact(label, href, external = false)}
    <a use:card_release {href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
        class="arrow_link link-soft flex w-fit items-center gap-2">{label}<ArrowIcon color="var(--color-mauve-300)" /></a>
{/snippet}

<div class="flex flex-col gap-10">
    <div class="flex flex-col gap-2 text-2xl">
        <p>{cta}</p>
        {@render contact('itshedwy@icloud.com', 'mailto:itshedwy@icloud.com')}
        {@render contact('check résumé', 'https://linkedin.com/in/hedwy', true)}
    </div>

    <div class="relative">
        <HandLine class="w-full" />
        <DividerStars star_position="max(54px, 5%)" />
        <DividerStars star_position="min(calc(100% - 32px), 94%)" single_star large_transform="translate(0 12) skewX(13) translate(0 -12)" />
    </div>

    <footer id="contacts" class="flex flex-col items-start gap-2">
        <p class="fg-faint">hedwy</p>
        <nav aria-label="Socials and contacts" class="flex flex-wrap items-center gap-2">
            {#each socials as [label, href]}
                <a use:card_release {href} target="_blank" rel="noopener noreferrer" class="link-quiet">{label}</a>
            {/each}
        </nav>
    </footer>
</div>
