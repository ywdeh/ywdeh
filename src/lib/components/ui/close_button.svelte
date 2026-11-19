<script>
    import { strokes } from '$lib/geometry/strokes.js';
    import IconButton from '$lib/components/ui/icon_button.svelte';

    let { label, onclick, element = $bindable(), class: classes = '' } = $props();

    $effect(() => element?.focus({ preventScroll: true }));
</script>

<IconButton bind:element {label} {onclick} paths={strokes.close} class={classes} />
