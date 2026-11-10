<script>
    let { star_position, single_star = false, large_shape, large_transform = 'translate(0 12) skewX(-8) translate(0 -12)', small_transform = 'translate(8 12) skewX(12) translate(0 -12)' } = $props();
    const star_id = $props.id();
    let positions = $state([undefined, undefined]);
    const shapes = ["M11 1C12.5 1 12.6 7.5 15.2 8.8C17 10.2 24.2 10.7 24.2 12C24.2 13.1 17.6 12.7 16.2 15C14.7 17.4 16.1 22.3 14.8 23C13.4 23.7 12.1 17 10 15.4C8.1 13.9 1.4 13.1 1.4 12C1.4 10.9 7.2 10.3 8.8 8C10.4 5.8 9.9 1.2 11 1Z","M33.6 4.4C34.7 4.1 34 8.2 35.5 9.6C36.6 10.5 39.1 10.5 39 12C38.8 12.8 35.5 12.3 34.5 13.6C33.4 15 33.8 18.4 32.8 18.3C31.8 18.3 32.1 14.8 30.7 13.6C29.4 12.4 26.8 12.3 27 12C27.1 11.1 30.6 10.4 31.5 9C32.5 7.6 32.6 4.6 33.6 4.4Z"];
    let drag = $state();

    function move_to(button, x, index) {
        const { width } = button.parentElement.getBoundingClientRect();
        if (!width) return;
        const inset = Math.min(button.offsetWidth / 2, width / 2);
        positions[index] = Math.max(inset, Math.min(width - inset, x)) / width * 100;
    }

    function start_drag(event, index) {
        if (!event.isPrimary || event.button !== 0) return;
        const button = event.currentTarget;
        const bounds = button.getBoundingClientRect();
        drag = { index, id: event.pointerId, offset: event.clientX - bounds.left - bounds.width / 2,
            last_x: event.clientX, last_time: event.timeStamp, velocity: 0 };
        button.setPointerCapture(event.pointerId);
    }

    function move_drag(event, index) {
        if (drag?.id !== event.pointerId) return;
        const button = event.currentTarget;
        const elapsed = event.timeStamp - drag.last_time;
        if (elapsed > 0) drag.velocity = (event.clientX - drag.last_x) / elapsed;
        drag.last_x = event.clientX;
        drag.last_time = event.timeStamp;
        move_to(button, event.clientX - button.parentElement.getBoundingClientRect().left - drag.offset, index);
    }

    function end_drag(event) {
        if (drag?.id !== event.pointerId) return;
        const { index, velocity, last_time } = drag;
        drag = undefined;
        if (event.type !== 'pointerup' || event.timeStamp - last_time > 80 ||
            matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const star = event.currentTarget;
        const glide = Math.max(-48, Math.min(48, velocity * 65));
        if (Math.abs(glide) >= 1) move_to(star, star.offsetLeft + glide, index);
    }

</script>

{#each (single_star ? shapes.slice(0, 1) : shapes) as default_shape, index}
    {@const shape = index === 0 ? large_shape ?? default_shape : default_shape}
    {@const shape_id = star_id + '-' + index}
    {@const transform = index === 0 ? large_transform : small_transform}
    {@const initial_position = single_star ? star_position : index === 0
        ? 'calc(' + star_position + ' - clamp(13px, 1.6vw, 20px))'
        : 'calc(' + star_position + ' + clamp(30px, 3.4vw, 45px))'}
    <div class="divider_star" class:small={index === 1} class:dragging={drag?.index === index}
        style:left={positions[index] === undefined ? initial_position : positions[index] + '%'}
        aria-hidden="true" onpointerdown={(event) => start_drag(event, index)}
        onpointermove={(event) => move_drag(event, index)} onlostpointercapture={end_drag}
        onpointerup={end_drag} onpointercancel={end_drag}>
        <svg viewBox={index === 0 ? '0 0 26 24' : '27 0 24 24'}>
            <defs>
                <path id={shape_id} d={shape} {transform} />
                <clipPath id={shape_id + '-clip'}><use href={'#' + shape_id} /></clipPath>
            </defs>
            <use href={'#' + shape_id} fill="var(--color-neutral-900)" stroke="var(--color-neutral-900)"
                stroke-width="6" stroke-linejoin="round" />
            <g clip-path={'url(#' + shape_id + '-clip)'} fill="none" stroke="currentColor"
                stroke-opacity="0.072" stroke-width="4" stroke-linejoin="round">
                <path d={shape} {transform} vector-effect="non-scaling-stroke" />
            </g>
        </svg>
    </div>
{/each}

<style>
    .divider_star path { vector-effect: non-scaling-stroke; }

    .divider_star {
        position: absolute;
        top: 50%;
        width: clamp(43px, 5vw, 64px);
        height: auto;
        translate: -50% -50%;
        color: var(--color-mauve-100);
        overflow: visible;
        cursor: grab;
        touch-action: pan-y;
        user-select: none;
    }

    .divider_star.dragging { cursor: grabbing; }
    @media (hover: hover) {
        .divider_star:hover g[stroke-opacity] { stroke-opacity: 0.14; }
    }
    .divider_star:not(.small) { z-index: 1; }
    @media (prefers-reduced-motion: no-preference) {
        .divider_star:not(.dragging) { transition: left 240ms ease-out; }
        .divider_star g[stroke-opacity] { transition: stroke-opacity 180ms ease-out; }
        .divider_star svg { animation: star_wobble 780ms step-end infinite; }
        .divider_star.small svg { animation-delay: -210ms; }
    }
    .divider_star svg { display: block; width: 100%; overflow: visible; }
    .divider_star.small { width: clamp(36px, 4.6vw, 59px); }

    /* Hold each drawing for half the loop. */
    @keyframes star_wobble {
        0%, 100% { transform: skewX(-2deg) scaleY(0.98); }
        50% { transform: skewX(3deg) scaleY(1.03); }
    }
</style>
