<script>
    import { star_drag } from '$lib/controllers/star_drag.svelte.js';
    import { star_shapes, redraw, stretch_tips } from '$lib/geometry/star_shape.js';
    let {
        star_position,
        single_star = false,
        large_transform = 'translate(0 12) skewX(-8) translate(0 -12)',
        small_transform = 'translate(8 12) skewX(12) translate(0 -12)',
        start_inset = 0,
    } = $props();
    const star_id = $props.id();
    const interaction = star_drag({
        get start_inset() {
            return start_inset;
        },
    });
</script>

{#each single_star ? star_shapes.slice(0, 1) : star_shapes as shape, index}
    {@const shape_id = star_id + '-' + index}
    {@const transform = index === 0 ? large_transform : small_transform}
    {@const initial_position = single_star
        ? star_position
        : index === 0
          ? 'calc(' + star_position + ' - clamp(13px, 1.6vw, 20px))'
          : 'calc(' + star_position + ' + clamp(30px, 3.4vw, 45px))'}
    <div
        class="divider_star"
        data-own-swipe
        class:small={index === 1}
        class:dragging={interaction.drag?.index === index}
        use:interaction.measure_star={index}
        style:--star-position={interaction.positions[index] === undefined
            ? initial_position
            : interaction.positions[index] + '%'}
        style:--star-safe-start={start_inset + 'px'}
        aria-hidden="true"
        onpointerdown={(event) => interaction.start_drag(event, index)}
        onpointermove={(event) => interaction.move_drag(event, index)}
        onlostpointercapture={interaction.end_drag}
        onpointerup={interaction.end_drag}
        onpointercancel={interaction.end_drag}
    >
        <svg viewBox={index === 0 ? '0 0 26 24' : '27 0 24 24'}>
            {#each [shape, redraw(shape, index + 1)] as drawing, frame}
                {@const frame_id = shape_id + '-' + frame}
                {@const outline =
                    interaction.stretch_index === index
                        ? stretch_tips(drawing, interaction.tip_stretch.current)
                        : drawing}
                <g class="drawing">
                    <defs>
                        <path id={frame_id} d={outline} {transform} />
                        <clipPath id={frame_id + '-clip'}><use href={'#' + frame_id} /></clipPath>
                    </defs>
                    <path
                        class="cutout"
                        d={outline}
                        {transform}
                        fill="var(--color-neutral-900)"
                        stroke="var(--color-neutral-900)"
                        vector-effect="non-scaling-stroke"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />

                    <g
                        class="ink"
                        clip-path={'url(#' + frame_id + '-clip)'}
                        fill="none"
                        stroke="currentColor"
                        stroke-width="4"
                        stroke-linejoin="round"
                    >
                        <path d={outline} {transform} vector-effect="non-scaling-stroke" />
                    </g>
                </g>
            {/each}
        </svg>
    </div>
{/each}

<style>
    .divider_star path {
        vector-effect: non-scaling-stroke;
    }
    .cutout {
        stroke-width: calc(var(--ornament-gap) * 2);
    }

    .divider_star {
        --star-ink-opacity: var(--line-ink);
        --star-width: clamp(40px, 4.7vw, 60px);
        --star-end-gap: 12px;
        --star-start: min(
            calc(100% - var(--star-end)),
            max(
                var(--star-safe-start, 0px),
                min(50%, calc(var(--star-left, var(--star-width) / 2) + var(--star-end-gap)))
            )
        );
        --star-end: min(50%, calc(var(--star-right, var(--star-width) / 2) + var(--star-end-gap)));
        position: absolute;
        z-index: 0;
        top: 50%;
        left: clamp(var(--star-start), var(--star-position), calc(100% - var(--star-end)));
        width: var(--star-width);
        height: auto;
        translate: -50% -50%;
        color: var(--project-tint-color, var(--color-mauve-100));
        overflow: visible;
        cursor: grab;
        touch-action: pan-y;
        user-select: none;
    }

    @media (hover: hover) {
        .divider_star:hover {
            --star-ink-opacity: 0.14;
        }
    }
    .ink {
        stroke-opacity: var(--star-ink-opacity);
    }
    .divider_star:not(.small) {
        z-index: 1;
    }
    .divider_star.dragging {
        z-index: 2;
        cursor: grabbing;
    }
    @media (prefers-reduced-motion: no-preference) {
        .divider_star:not(.dragging) {
            transition:
                left 420ms ease-out,
                z-index 0s 420ms;
        }
        .ink {
            transition: stroke-opacity 180ms ease-out;
        }
        .drawing {
            animation: star_boil 780ms step-end infinite;
        }
        .drawing + .drawing {
            animation-delay: -390ms;
        }
        .divider_star.small .drawing {
            animation-delay: -210ms;
        }
        .divider_star.small .drawing + .drawing {
            animation-delay: -600ms;
        }
    }
    .drawing + .drawing {
        visibility: hidden;
    }
    .divider_star > svg {
        position: relative;
        display: block;
        width: 100%;
        overflow: visible;
    }
    .divider_star.small {
        --star-width: clamp(34px, 4.3vw, 55px);
    }

    @keyframes star_boil {
        0% {
            visibility: visible;
        }
        50% {
            visibility: hidden;
        }
    }
</style>
