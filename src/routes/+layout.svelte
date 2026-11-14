<script>
    import '$lib/styles/index.css';
    let { children } = $props();
</script>

{@render children()}

<div aria-hidden="true" class="edge_fade at_top"></div>
<div aria-hidden="true" class="edge_fade at_bottom"></div>
<div
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-120 bg-[url(/noise.gif)] bg-repeat opacity-4 mix-blend-overlay"
></div>
