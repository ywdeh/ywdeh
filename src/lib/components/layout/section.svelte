<script>
    import DividerStars from '$lib/components/ui/divider_stars.svelte';
    import HandLine from '$lib/components/ui/hand_line.svelte';

    let { id, title, columns = 3, children } = $props();
</script>

<section class="section flex flex-col gap-gutter" aria-labelledby="{id}-title">
    <div {id} class="flex items-center justify-between gap-copy text-title">
        <h2 id="{id}-title" class="whitespace-nowrap">{title}</h2>
        <div class="divider relative min-w-0 flex-1 overflow-x-clip">
            <HandLine />
            <div class="divider_stars absolute inset-0">
                <DividerStars layout={id} />
            </div>
        </div>
    </div>

    <div class="grid gap-grid" data-columns={columns}>
        {@render children()}
    </div>
</section>

<style>
    .section {
        container-type: inline-size;
    }

    .grid {
        grid-template-columns: minmax(0, 1fr);
    }

    @container (width >= 40rem) {
        [data-columns='2'],
        [data-columns='3'] {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @container (width >= 86rem) {
        [data-columns='3'] {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }
    }

    .divider {
        container-type: inline-size;
    }

    @container (width < 8rem) {
        .divider_stars {
            display: none;
        }
    }
</style>
