<script>
    import { press } from '$lib/actions/press.js';
    import { strokes } from '$lib/geometry/strokes.js';
    import Icon from '$lib/components/ui/icon.svelte';

    let { href, external = false, turn = 0, class: classes = '', children, ...rest } = $props();
</script>

<svelte:element
    this={href ? 'a' : 'button'}
    use:press
    {href}
    type={href ? undefined : 'button'}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    class="arrow_link icon-host link-soft tap-target flex items-center gap-inline {classes}"
    {...rest}
>
    {@render children()}
    <span class="turn" style:rotate="{turn}deg">
        <Icon paths={strokes.arrow} motion="nudge" class="size-6" />
    </span>
</svelte:element>

<style>
    .arrow_link {
        --icon-duration: var(--duration-hint);
        --icon-ease: var(--ease-out);
    }

    .turn {
        display: flex;
        flex-shrink: 0;
    }
</style>
