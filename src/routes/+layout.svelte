<script>
	import './layout.css';

	let { children } = $props();
</script>

{@render children()}
<!-- film grain over everything -->
<div aria-hidden="true" class="pointer-events-none fixed inset-0 z-100 bg-[url(/noise.gif)] bg-repeat opacity-4 mix-blend-overlay"></div>
