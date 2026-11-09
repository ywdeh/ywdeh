<script>
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head></svelte:head>
{@render children()}
<div aria-hidden="true" class="pointer-events-none fixed inset-x-0 top-0 z-95 h-5 mix-blend-darken bg-linear-to-b from-neutral-900 to-neutral-900/0 md:h-8"></div>
<div aria-hidden="true" class="pointer-events-none fixed inset-x-0 bottom-0 z-95 h-5 mix-blend-darken bg-linear-to-t from-neutral-900 to-neutral-900/0 md:h-8"></div>
