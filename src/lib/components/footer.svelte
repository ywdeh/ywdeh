<script>
    let { cta } = $props();
</script>

<div class="flex flex-col gap-10">
<div class="flex flex-col text-2xl gap-2">
    <p>{cta}</p>
    <div class="flex flex-col md:flex-row justify-between">
        <a href="mailto:itshedwy@icloud.com" class="flex items-center gap-2 transition opacity-60 hover:opacity-90 w-full md:w-fit justify-between md:justify-start">itshedwy@icloud.com<img src="arrow_outward.svg" class="h-6" alt=""></a>
        <p class="flex items-center gap-2 transition opacity-60 hover:opacity-90 cursor-not-allowed w-full md:w-fit justify-between md:justify-start">download cv<img src="arrow_down.svg" class="h-6" alt=""></p>
    </div>
</div>

<div class="h-px w-full bg-mauve-100/5"></div>

<footer id="contacts" class="flex flex-col md:flex-row justify-between gap-2">
    <p class="opacity-30">hedwy</p>
    <nav aria-label="Socials and contacts" class="flex items-center gap-2">
        <a href="https://t.me/ywdeh" target="_blank" rel="noopener noreferrer" class="transition opacity-30 hover:opacity-90">telegram</a>
        <a href="https://instagram.com/just.hedwy" rel="noopener noreferrer" target="_blank" class="transition opacity-30 hover:opacity-90">instagram</a>
        <a href="https://linkedin.com/in/hedwy" rel="noopener noreferrer" target="_blank" class="transition opacity-30 hover:opacity-90">linkedin</a>
        <a href="https://dribbble.com/hedwy" rel="noopener noreferrer" target="_blank" class="transition opacity-30 hover:opacity-90">dribbble</a>
        <a href="https://github.com/ywdeh" rel="noopener noreferrer" target="_blank" class="transition opacity-30 hover:opacity-90">github</a>
    </nav>
</footer>
</div>