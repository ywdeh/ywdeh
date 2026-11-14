<script>
    import { card_release } from "$lib/card_release.js";
    import ArrowIcon from "./arrow_icon.svelte";
    import DividerStars from "./divider_stars.svelte";
    import HandLine from "./hand_line.svelte";
    let { cta = "have a role in mind?" } = $props();

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
        class="arrow_link link-soft flex w-fit items-center gap-inline">{label}<ArrowIcon /></a>
{/snippet}

<div class="flex flex-col gap-row">
    <div class="flex flex-col gap-copy text-xl md:text-2xl">
        <p>{cta}</p>
        <!-- stacked on phones; on wider screens the résumé link moves to the far right, level with the email -->
        <div class="flex flex-col gap-copy md:flex-row md:items-center md:justify-between">
            {@render contact('itshedwy@icloud.com', 'mailto:itshedwy@icloud.com')}
            {@render contact('check résumé', 'https://linkedin.com/in/hedwy', true)}
        </div>
    </div>

    <div class="relative overflow-x-clip">
        <HandLine class="w-full" />
        <DividerStars star_position="var(--divider-star-inset)" single_star />
        <DividerStars star_position="calc(100% - var(--divider-star-inset) - clamp(30px, 3.4vw, 45px))" large_transform="translate(0 12) skewX(13) translate(0 -12)" />
    </div>

    <footer id="contacts" class="flex flex-col items-start gap-control text-ui">
        <p class="fg-faint">hedwy</p>
        <nav aria-label="Socials and contacts" class="flex flex-wrap items-center gap-x-copy gap-y-inline">
            {#each socials as [label, href]}
                <a use:card_release {href} target="_blank" rel="noopener noreferrer" class="link-quiet">{label}</a>
            {/each}
        </nav>
    </footer>
</div>
