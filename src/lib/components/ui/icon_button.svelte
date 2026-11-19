<script>
    import { press } from '$lib/actions/press.js';
    import Icon from '$lib/components/ui/icon.svelte';

    let { label, paths, onclick, element = $bindable(), class: classes = '', ...rest } = $props();
</script>

<button
    type="button"
    bind:this={element}
    use:press
    aria-label={label}
    {onclick}
    {...rest}
    class="icon_button icon-host link-quiet pointer-events-auto block shrink-0 p-2 {classes}"
>
    <Icon {paths} stroke={1.5} crossfade class="size-8 text-ink" />
</button>

<style>
    @media (prefers-reduced-motion: no-preference) {
        .icon_button {
            transition: opacity var(--duration-press) var(--ease-out);
        }
    }
</style>
