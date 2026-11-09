<script>
    import ArrowIcon from "./arrow_icon.svelte";
    import { card_release } from "$lib/card_release.js";

    let { href, children } = $props();
</script>

<a use:card_release {href} target="_blank" rel="noopener noreferrer" class="visit_button arrow_link">
    {@render children()}<ArrowIcon color="var(--color-mauve-300)" />
</a>

<style>
    .visit_button {
        display: inline-flex;
        align-items: center;
        gap: calc(var(--spacing) * 2);
        width: fit-content;
        padding: calc(var(--spacing) * 3) calc(var(--spacing) * 5);
        border-radius: 999px;
        background: var(--focus-tint);
        opacity: 0.8;
        transition: opacity 140ms var(--ease-out), background-color 140ms var(--ease-out);
    }
    .visit_button:hover, .visit_button:focus-visible { opacity: 1; background: oklch(40.5% 0.006 325.6 / 20%); }
    .visit_button:is(:active, :global(.is_pressed)) { opacity: 0.8; }
</style>
