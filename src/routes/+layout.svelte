<script>
    import '$lib/styles/app.css';
    import { site } from '$lib/content/site.js';
    import Atmosphere from '$lib/components/layout/atmosphere.svelte';

    let { children } = $props();
</script>

<svelte:head>
    <meta name="description" content={site.description} />
    <link rel="icon" href={site.avatar} />
    <link rel="canonical" href={site.url} />
    <meta property="og:title" content={site.share_title} />
    <meta property="og:site_name" content={site.title} />
    <meta property="og:description" content={site.description} />
    <meta property="og:image" content="{site.url}{site.share_image}" />
    <meta property="og:url" content={site.url} />
    <meta property="og:type" content="website" />
</svelte:head>

{@render children()}

<Atmosphere />
