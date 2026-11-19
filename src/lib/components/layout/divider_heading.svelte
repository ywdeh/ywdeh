<script>
    import DividerStars from '$lib/components/ui/divider_stars.svelte';
    import HandLine from '$lib/components/ui/hand_line.svelte';

    let { title, stars, id, heading_id } = $props();
</script>

<div {id} class="flex items-center justify-between gap-copy text-title">
    <h2 id={heading_id} class="whitespace-nowrap">{title}</h2>
    <div class="divider relative min-w-0 flex-1 overflow-x-clip">
        <HandLine />
        <div class="stars absolute inset-0">
            <DividerStars layout={stars} />
        </div>
    </div>
</div>

<style>
    .divider {
        container-type: inline-size;
    }

    @container (width < 8rem) {
        .stars {
            display: none;
        }
    }
</style>
