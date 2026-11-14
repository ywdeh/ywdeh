<script>
    import ArrowIcon from '$lib/components/icons/arrow_icon.svelte';
    import { press_release } from '$lib/actions/press_release.js';
    let { href, children } = $props();
</script>

<a
    use:press_release
    {href}
    target="_blank"
    rel="noopener noreferrer"
    class="visit_button arrow_link rounded-full"
>
    {@render children()}<ArrowIcon />
</a>

<style>
    .visit_button {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-inline);
        width: fit-content;
        padding: var(--spacing-control) var(--spacing-copy);
        background: var(--focus-tint);
        opacity: 0.8;
        transition:
            opacity var(--press-time) var(--ease-out),
            background-color var(--press-time) var(--ease-out);
    }
    .visit_button:focus-visible {
        opacity: 1;
        background: oklch(from var(--focus-tint) l c h / 20%);
    }
    @media (hover: hover) {
        .visit_button:hover {
            opacity: 1;
            background: oklch(from var(--focus-tint) l c h / 20%);
        }
    }
    .visit_button:is(:active, :global(.is_pressed)) {
        opacity: 0.8;
    }
</style>
