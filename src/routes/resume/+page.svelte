<script>
    import { resume } from '$lib/content/resume.js';
    import Resume from '$lib/components/resume.svelte';
</script>

<svelte:head>
    <title>{resume.page_title}</title>
</svelte:head>

<Resume />
