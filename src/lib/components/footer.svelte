<script>
    import { card_release } from "$lib/card_release.js";
    import ArrowIcon from "./arrow_icon.svelte";
    import DividerStars from "./divider_stars.svelte";
    import HandLine from "./hand_line.svelte";
    let { cta } = $props();
</script>

<div class="flex flex-col gap-10">
<div class="flex flex-col text-2xl gap-2">
    <p>{cta}</p>
    <div class="flex flex-col items-start gap-2">
        <a use:card_release href="mailto:itshedwy@icloud.com" class="arrow_link flex items-center gap-2 transition opacity-60 hover:opacity-90 w-fit">itshedwy@icloud.com<ArrowIcon color="var(--color-mauve-300)" /></a>
        <a use:card_release href="https://linkedin.com/in/hedwy" target="_blank" class="arrow_link flex items-center gap-2 transition opacity-60 hover:opacity-90 w-fit">check résumé<ArrowIcon color="var(--color-mauve-300)" /></a>
    </div>
</div>

<div class="relative">
    <HandLine class="w-full" />
    <DividerStars star_position="max(54px, 5%)" />
    <DividerStars star_position="min(calc(100% - 32px), 94%)" single_star large_transform="translate(0 12) skewX(13) translate(0 -12)" />
</div>

<footer id="contacts" class="flex flex-col items-start gap-2">
    <p class="opacity-30">hedwy</p>
    <nav aria-label="Socials and contacts" class="flex flex-wrap items-center gap-2">
        <a use:card_release href="https://t.me/ywdeh" target="_blank" rel="noopener noreferrer" class="transition opacity-30 hover:opacity-90">telegram</a>
        <a use:card_release href="https://instagram.com/just.hedwy" rel="noopener noreferrer" target="_blank" class="transition opacity-30 hover:opacity-90">instagram</a>
        <a use:card_release href="https://linkedin.com/in/hedwy" rel="noopener noreferrer" target="_blank" class="transition opacity-30 hover:opacity-90">linkedin</a>
        <a use:card_release href="https://dribbble.com/hedwy" rel="noopener noreferrer" target="_blank" class="transition opacity-30 hover:opacity-90">dribbble</a>
        <a use:card_release href="https://github.com/ywdeh" rel="noopener noreferrer" target="_blank" class="transition opacity-30 hover:opacity-90">github</a>
    </nav>
</footer>
</div>
