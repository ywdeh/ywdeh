<script>
    import { star_drag } from '$lib/controllers/star_drag.svelte.js';
    import { pair_position, redraw, star_layouts, star_shapes, stretch_tips } from '$lib/geometry/stars.js';

    let { layout, start_inset = 0 } = $props();

    const id = $props.id();
    const stars = star_drag({
        get start_inset() {
            return start_inset;
        },
    });
    const preset = $derived(star_layouts[layout]);
    const shapes = $derived(preset.single ? star_shapes.slice(0, 1) : star_shapes);
</script>

{#each shapes as shape, index (index)}
    {@const transform = index === 0 ? preset.large : preset.small}
    {@const resting = preset.single ? preset.position : pair_position(preset.position, index)}
    <div
        class="star"
        class:small={index === 1}
        class:dragging={stars.drag?.index === index}
        data-own-swipe
        aria-hidden="true"
        use:stars.measure={index}
        style:--star-position={stars.positions[index] === undefined ? resting : `${stars.positions[index]}%`}
        style:--star-safe-start="{start_inset}px"
        onpointerdown={(event) => stars.start(event, index)}
        onpointermove={(event) => stars.move(event, index)}
        onpointerup={stars.end}
        onpointercancel={stars.end}
        onlostpointercapture={stars.end}
    >
        <svg viewBox={index === 0 ? '0 0 26 24' : '27 0 24 24'}>
            {#each [shape, redraw(shape, index + 1)] as drawing, frame (frame)}
                {@const frame_id = `${id}-${index}-${frame}`}
                {@const outline =
                    stars.stretch_index === index
                        ? stretch_tips(drawing, stars.tip_stretch.current)
                        : drawing}
                <g class="drawing">
                    <defs>
                        <path id={frame_id} d={outline} {transform} />
                        <clipPath id="{frame_id}-clip"><use href="#{frame_id}" /></clipPath>
                    </defs>
                    <path class="cutout" d={outline} {transform} />
                    <g class="ink" clip-path="url(#{frame_id}-clip)">
                        <path d={outline} {transform} />
                    </g>
                </g>
            {/each}
        </svg>
    </div>
{/each}

<style>
    .star {
        --star-ink: var(--tone-line);
        --star-width: clamp(40px, 4.7vw, 60px);
        --star-end-gap: 12px;
        --star-end: min(50%, calc(var(--star-right, var(--star-width) / 2) + var(--star-end-gap)));
        --star-start: min(
            calc(100% - var(--star-end)),
            max(
                var(--star-safe-start, 0px),
                min(50%, calc(var(--star-left, var(--star-width) / 2) + var(--star-end-gap)))
            )
        );
        position: absolute;
        z-index: 1;
        top: 50%;
        left: clamp(var(--star-start), var(--star-position), calc(100% - var(--star-end)));
        width: var(--star-width);
        translate: -50% -50%;
        color: var(--project-ink, var(--color-ink));
        overflow: visible;
        cursor: grab;
        touch-action: pan-y;
        user-select: none;
    }

    .star.small {
        --star-width: clamp(34px, 4.3vw, 55px);
        z-index: 0;
    }

    .star.dragging {
        z-index: 2;
        cursor: grabbing;
    }

    @media (hover: hover) {
        .star:hover {
            --star-ink: 0.14;
        }
    }

    svg {
        position: relative;
        display: block;
        width: 100%;
        overflow: visible;
    }

    path {
        vector-effect: non-scaling-stroke;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .cutout {
        fill: var(--color-surface);
        stroke: var(--color-surface);
        stroke-width: calc(var(--ornament-gap) * 2);
    }

    .ink {
        fill: none;
        stroke: currentColor;
        stroke-width: 4;
        stroke-opacity: var(--star-ink);
    }

    .drawing + .drawing {
        visibility: hidden;
    }

    @media (prefers-reduced-motion: no-preference) {
        .star:not(.dragging) {
            transition:
                left var(--duration-glide) ease-out,
                z-index 0s var(--duration-glide);
        }

        .ink {
            transition: stroke-opacity 180ms ease-out;
        }

        .drawing {
            animation: star-boil 780ms step-end infinite;
        }

        .drawing + .drawing {
            animation-delay: -390ms;
        }

        .small .drawing {
            animation-delay: -210ms;
        }

        .small .drawing + .drawing {
            animation-delay: -600ms;
        }
    }

    @keyframes star-boil {
        0% {
            visibility: visible;
        }
        50% {
            visibility: hidden;
        }
    }
</style>
