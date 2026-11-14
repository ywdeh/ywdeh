<script>
    import '$lib/styles/app.css';
    import Atmosphere from '$lib/components/layout/atmosphere.svelte';

    let { children } = $props();
</script>

{@render children()}

<Atmosphere />
