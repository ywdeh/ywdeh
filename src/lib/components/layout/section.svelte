<script>
    import DividerHeading from '$lib/components/layout/divider_heading.svelte';

    let { id, label, columns = 3, children } = $props();
</script>

<section class="section flex flex-col gap-gutter" aria-labelledby="{id}-title">
    <DividerHeading {id} heading_id="{id}-title" title={label} stars={id} />

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
</style>
