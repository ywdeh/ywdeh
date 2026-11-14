<script>
    // part: 'identity' (name and picture), 'intro' (the handwritten line) or 'all'
    let { part = 'all' } = $props();
</script>

{#if part !== 'intro'}
    <header class="flex flex-row-reverse justify-between gap-copy md:flex-col">
        <img src="/pfp.png" width="60" height="60" decoding="async" alt="" class="size-15 rounded-full">
        <h1 class="flex flex-col text-ui">
            <span class="font-normal">Danya Hedwy</span>
            <span class="fg-soft">graphic & visual design</span>
        </h1>
    </header>
{/if}

{#if part !== 'identity'}
    <p class="split text-intro">Every project has a feeling <span class="fg-faint">it's reaching for.</span> I make that feeling visible <span class="fg-faint">with motion, patterns and textures, lights and shadows -</span> in web, game UIs, branding<span class="fg-faint">, and anywhere <span class="relative inline-block">else <img src="/smile.gif" alt="" class="inline-block h-7.5 md:h-8.5"></span></span></p>
{/if}
