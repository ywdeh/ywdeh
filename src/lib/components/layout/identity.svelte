<script>
    import { site } from '$lib/content/site.js';
</script>

<header class="flex flex-row-reverse justify-between gap-copy md:flex-col">
    <img src={site.avatar} width="60" height="60" decoding="async" alt="" class="size-15 rounded-full" />
    <h1 class="flex flex-col text-ui">
        <span class="font-normal">{site.name}</span>
        <span class="ink-soft">{site.role}</span>
    </h1>
</header>
