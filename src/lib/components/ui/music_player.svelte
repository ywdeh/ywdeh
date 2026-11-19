<script>
    import { onMount } from 'svelte';
    import { press } from '$lib/actions/press.js';
    import { strokes } from '$lib/geometry/strokes.js';
    import { tracks } from '$lib/content/music.js';
    import { spotify_controller } from '$lib/media/spotify.js';
    import { cubicOut } from 'svelte/easing';
    import { motion_ms, reduced_motion } from '$lib/motion/timing.js';

    const TURN_MS = 4000;
    const SPIN_EASE_MS = 700;

    // switching songs moves like the info's own reveal: the old title rises and fades while
    // the new one rises in from below, and the new cover fades in over the old one
    const SHIFT_REM = 0.5;

    function song_in() {
        return {
            duration: motion_ms('--duration-glide'),
            easing: cubicOut,
            css: (t, u) => `opacity: ${t}; translate: 0 ${u * SHIFT_REM}rem`,
        };
    }

    function song_out() {
        return {
            duration: motion_ms('--duration-reveal'),
            easing: cubicOut,
            css: (t, u) => `opacity: ${t}; translate: 0 ${-u * SHIFT_REM}rem`,
        };
    }

    function cover_in() {
        return { duration: motion_ms('--duration-reveal'), easing: cubicOut, css: (t) => `opacity: ${t}; z-index: 1` };
    }

    // the old cover just waits underneath until the new one has fully come in
    function cover_out() {
        return { duration: motion_ms('--duration-reveal'), css: () => 'z-index: 0' };
    }

    // the triangles are closed, so they can't trim their ends like the other icons; instead
    // their corners pull in while the sides bow out, keeping the same size (hover, then press)
    const PINCHED = {
        [strokes.play[0]]: [
            'M8.45 6.34Q14.08 8.21 17.72 12.1Q13.65 15.88 8.63 17.77Q7.28 12.1 8.45 6.34Z',
            'M8.8 6.97Q14.27 7.93 17.04 12.09Q13.8 16.16 8.96 17.13Q6.96 12.1 8.8 6.97Z',
        ],
        [strokes.next[0]]: [
            'M6.57 6.96Q10.84 8.76 13.59 12Q10.73 15.24 6.75 17.13Q5.65 12.1 6.57 6.96Z',
            'M6.83 7.53Q10.98 8.52 13.07 12.01Q10.86 15.48 7 16.57Q5.41 12.11 6.83 7.53Z',
        ],
    };

    let track = $state.raw();
    let cover = $state();
    let tint = $state();
    let host = $state();
    let vinyl = $state();
    let controller = $state.raw();
    let ready = $state(false);
    let paused = $state(true);
    let buffering = $state(false);
    let position = $state(0);
    let duration = $state(0);
    let peek = $state(false);
    let ended = $state(false);
    let connecting = $state(false);
    let loaded;
    let gone = false;
    let play_when_ready = false;
    let peek_timer;

    const covers = new Map();
    const progress = $derived(duration && !ended ? Math.min(position / duration, 1) : 0);
    const playing = $derived(!paused && !buffering && duration > 0 && position < duration);

    // the record spins up when sound starts and slows to a stop when it ends
    let angle = 0;
    let speed = 0;
    let frame;
    let last;

    function spin(now) {
        const dt = last === undefined ? 0 : now - last;
        last = now;
        const target = playing ? 360 / TURN_MS : 0;
        speed += (target - speed) * (1 - Math.exp(-dt / (SPIN_EASE_MS / 3)));
        if (!playing && speed < 0.0005) speed = 0;
        angle = (angle + speed * dt) % 360;
        if (vinyl) vinyl.style.rotate = `${angle}deg`;
        if (speed === 0 && !playing) {
            frame = undefined;
            last = undefined;
            return;
        }
        frame = requestAnimationFrame(spin);
    }

    $effect(() => {
        if (playing && !frame && !reduced_motion()) frame = requestAnimationFrame(spin);
    });

    // over bright pictures the song text brightens a little so it stays readable, judged by
    // the same average colours that tint the cards; over the plain dark page it has none
    let player = $state();
    let shade = $state(0);
    let pixel;

    function brightness(color) {
        pixel ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
        pixel.clearRect(0, 0, 1, 1);
        pixel.fillStyle = color;
        pixel.fillRect(0, 0, 1, 1);
        const [r, g, b] = pixel.getImageData(0, 0, 1, 1).data;
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }

    function picture_below(x, y) {
        const element = document.elementsFromPoint(x, y).find((node) => !player.contains(node));
        if (element?.tagName !== 'IMG') return 0;
        const tint = getComputedStyle(element.closest('.tinted') ?? element).getPropertyValue('--tint').trim();
        return tint ? brightness(tint) : 0;
    }

    function sample() {
        const box = player?.querySelector('.info')?.getBoundingClientRect();
        if (!box) return;
        let light = 0;
        for (const y of [box.top + box.height * 0.3, box.top + box.height * 0.75])
            for (const x of [box.left + 8, box.left + box.width * 0.4, box.left + box.width * 0.8])
                light = Math.max(light, picture_below(x, y));
        shade = Math.min(Math.max((light - 0.15) / 0.3, 0), 1);
    }

    $effect(() => {
        if (!player) return;
        let frame;
        const later = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(sample);
        };
        later();
        addEventListener('scroll', later, { passive: true, capture: true });
        addEventListener('resize', later);
        player.addEventListener('pointerenter', later);
        player.addEventListener('focusin', later);
        return () => {
            cancelAnimationFrame(frame);
            removeEventListener('scroll', later, { capture: true });
            removeEventListener('resize', later);
            player.removeEventListener('pointerenter', later);
            player.removeEventListener('focusin', later);
        };
    });

    $effect(() => {
        if (peek && player) requestAnimationFrame(sample);
    });

    function pick() {
        const others = tracks.filter((item) => item !== track);
        return others[Math.floor(Math.random() * others.length)];
    }

    // plain average of the cover, like scripts/images.mjs does for the site's own pictures
    async function average_color(url) {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = url;
        await image.decode();
        const size = 24;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0, size, size);
        const { data } = context.getImageData(0, 0, size, size);
        const sum = [0, 0, 0];
        for (let i = 0; i < data.length; i += 4) for (let c = 0; c < 3; c++) sum[c] += data[i + c];
        const pixels = data.length / 4;
        return `rgb(${sum.map((value) => Math.round(value / pixels)).join(' ')})`;
    }

    async function load_cover(item) {
        if (!covers.has(item.id)) {
            covers.set(
                item.id,
                fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/track/${item.id}`)
                    .then((response) => response.json())
                    .then(async ({ thumbnail_url }) => ({
                        url: thumbnail_url,
                        color: await average_color(thumbnail_url).catch(() => undefined),
                    }))
                    .catch(() => ({})),
            );
        }
        const found = await covers.get(item.id);
        if (track !== item) return;
        cover = found.url;
        tint = found.color;
    }

    function show(item) {
        // the old cover stays until the new one is ready, so the label can cross over to it
        track = item;
        position = 0;
        duration = 0;
        ended = false;
        load_cover(item);
    }

    function glance() {
        peek = true;
        clearTimeout(peek_timer);
        peek_timer = setTimeout(() => (peek = false), 2500);
    }

    function load(item) {
        loaded = item;
        ready = false;
        controller.loadUri(`spotify:track:${item.id}`);
    }

    // spotify's script and player load only once someone asks for music
    function connect() {
        if (connecting || controller) return;
        connecting = true;
        loaded = track;
        spotify_controller(host, `spotify:track:${track.id}`)
            .then((created) => {
                if (gone) return created.destroy();
                controller = created;
                controller.addListener('ready', () => {
                    if (loaded !== track) return load(track);
                    ready = true;
                    if (play_when_ready) {
                        play_when_ready = false;
                        controller.play();
                    }
                });
                controller.addListener('playback_update', ({ data }) => {
                    // at the end spotify stays "playing" with the position stuck on the full length
                    ended = data.duration > 0 && data.position >= data.duration - 250;
                    paused = data.isPaused || ended;
                    buffering = data.isBuffering;
                    position = data.position;
                    duration = data.duration;
                });
            })
            .catch(() => (play_when_ready = false))
            .finally(() => (connecting = false));
    }

    function toggle() {
        glance();
        if (!controller) {
            play_when_ready = true;
            connect();
        } else if (!ready) play_when_ready = true;
        else if (ended) {
            ended = false;
            controller.restart();
        } else controller.togglePlay();
    }

    function next() {
        const keep_playing = !paused || play_when_ready;
        show(pick());
        glance();
        if (!controller) return;
        play_when_ready = keep_playing;
        load(track);
    }

    onMount(() => {
        show(pick());
        return () => {
            gone = true;
            clearTimeout(peek_timer);
            cancelAnimationFrame(frame);
            controller?.destroy();
        };
    });
</script>

{#snippet icon(paths)}
    <svg
        class="size-6 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        {#each paths as d (d)}
            {#if PINCHED[d]}
                <path
                    {d}
                    class="pinch"
                    style:--d={`path('${d}')`}
                    style:--d-hover={`path('${PINCHED[d][0]}')`}
                    style:--d-press={`path('${PINCHED[d][1]}')`}
                />
            {:else}
                <path {d} class="trim" pathLength="1" />
            {/if}
        {/each}
    </svg>
{/snippet}

{#if track}
    <aside
        bind:this={player}
        class="music tinted fixed flex items-center gap-control text-ui"
        class:peek
        style:--tint={tint}
        style:--shade={shade}
        aria-label="Music"
    >
        <!-- title and artist, then next, all on the disc's centre line -->
        <div class="info flex items-center gap-control">
            <div class="songs grid min-w-0">
                {#key track}
                    <div class="song flex min-w-0 flex-col items-end" in:song_in out:song_out>
                        <a
                            use:press
                            href="https://open.spotify.com/track/{track.id}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="max-w-full truncate font-normal"
                            title="Open in Spotify">{track.title}</a
                        >
                        <span class="ink-muted max-w-full truncate">{track.artist}</span>
                    </div>
                {/key}
            </div>
            <button
                use:press
                type="button"
                class="skip link-soft tap-target shrink-0"
                aria-label="Another song"
                onclick={next}>{@render icon(strokes.next)}</button
            >
        </div>

        <button
            use:press
            type="button"
            class="disc relative shrink-0 rounded-full"
            aria-label="{ended ? 'Replay' : paused ? 'Play' : 'Pause'} {track.title} by {track.artist}"
            aria-busy={connecting}
            onclick={toggle}
        >
            <svg class="progress absolute inset-0" viewBox="0 0 72 72" aria-hidden="true">
                <circle cx="36" cy="36" r="35" class="progress_track" vector-effect="non-scaling-stroke" />
                <circle
                    cx="36"
                    cy="36"
                    r="35"
                    class="progress_fill"
                    class:moving={playing}
                    class:empty={progress === 0}
                    vector-effect="non-scaling-stroke"
                    pathLength="1"
                    style:stroke-dashoffset={1 - progress}
                />
            </svg>
            <span bind:this={vinyl} class="vinyl absolute rounded-full">
                <span class="label absolute rounded-full bg-placeholder">
                    <!-- key inside the if: local transitions only run when their nearest block changes -->
                    {#if cover}
                        {#key cover}
                            <img
                                src={cover}
                                alt=""
                                width="300"
                                height="300"
                                decoding="async"
                                in:cover_in
                                out:cover_out
                            />
                        {/key}
                    {/if}
                </span>
            </span>
            <span
                class="state absolute inset-0 flex items-center justify-center"
                class:shown={ended}
                aria-hidden="true"
            >
                {@render icon(ended ? strokes.replay : paused ? strokes.play : strokes.pause)}
            </span>
        </button>

        <div class="embed" aria-hidden="true"><div bind:this={host}></div></div>
    </aside>
{/if}

<style>
    /* how bright the picture under the text is, 0 to 1; registered so the text eases over */
    @property --shade {
        syntax: '<number>';
        inherits: true;
        initial-value: 0;
    }

    .music {
        --disc: 4.5rem;
        right: max(1rem, calc(var(--spacing-page-x) / 2));
        bottom: max(1rem, calc(var(--spacing-page-y) / 2));
        z-index: var(--layer-music);
        max-width: calc(100vw - 2rem);
        /* text, icons and the progress line take the cover's colour instead of plain white */
        color: var(--tint-ink);
        --shown: 0;
    }

    /* phones get the page to themselves: no room for a floating player beside the work */
    @media (width < 48rem) {
        .music {
            display: none;
        }
    }

    /* a soft shade from the screen corner, so the open player sits on a calm patch of page */
    .music::before {
        content: '';
        position: absolute;
        right: calc(-1 * max(1rem, calc(var(--spacing-page-x) / 2)));
        bottom: calc(-1 * max(1rem, calc(var(--spacing-page-y) / 2)));
        z-index: -1;
        width: calc(100% + 18rem);
        height: calc(100% + 15rem);
        /* eased stops, like light falling off, so the shade has no edge to read a shape from */
        background: radial-gradient(
            farthest-side at 100% 100%,
            oklch(from var(--color-surface-deep) l c h / 85%),
            oklch(from var(--color-surface-deep) l c h / 80%) 14%,
            oklch(from var(--color-surface-deep) l c h / 68%) 28%,
            oklch(from var(--color-surface-deep) l c h / 51%) 42%,
            oklch(from var(--color-surface-deep) l c h / 33%) 56%,
            oklch(from var(--color-surface-deep) l c h / 18%) 69%,
            oklch(from var(--color-surface-deep) l c h / 8%) 81%,
            oklch(from var(--color-surface-deep) l c h / 2%) 91%,
            transparent
        );
        /* same grey-out as the case and viewer backdrops, fading out with the shade */
        -webkit-backdrop-filter: saturate(0) sepia(0.1);
        backdrop-filter: saturate(0) sepia(0.1);
        mask-image: radial-gradient(
            farthest-side at 100% 100%,
            black 20%,
            rgb(0 0 0 / 85%) 38%,
            rgb(0 0 0 / 60%) 54%,
            rgb(0 0 0 / 34%) 68%,
            rgb(0 0 0 / 14%) 81%,
            rgb(0 0 0 / 3%) 92%,
            transparent
        );
        opacity: var(--shown);
        pointer-events: none;
    }

    @media (prefers-reduced-motion: no-preference) {
        .music {
            transition:
                color var(--duration-tint) var(--ease-out),
                --shade var(--duration-tint) var(--ease-out);
        }

        /* the shade comes in quickly so it doesn't seem to grow, and leaves at the platform's pace */
        .music::before {
            transition: opacity var(--duration-reveal) var(--ease-out);
        }

        .music:is(.peek, :focus-within)::before {
            transition-duration: var(--duration-press);
        }

        @media (hover: hover) and (pointer: fine) {
            .music:hover::before {
                transition-duration: var(--duration-press);
            }
        }
    }

    /* the song info sits straight on the corner shade; over bright pictures its ink edges
       towards white and the dimmed artist and next button come up, so it keeps its contrast
       without looking like a different colour */
    .info {
        color: oklch(
            from var(--tint-ink) calc(l + (0.99 - l) * var(--shade)) calc(c * (1 - 0.6 * var(--shade))) h
        );
        --tone-muted: calc(0.4 + 0.4 * var(--shade));
        --tone-soft: calc(0.6 + 0.3 * var(--shade));
        max-width: 16rem;
        text-align: right;
        text-transform: lowercase;
        opacity: var(--shown);
        translate: 0.75rem 0;
        pointer-events: none;
    }

    /* the leaving and arriving songs share one cell while they cross */
    .song {
        grid-area: 1 / 1;
    }

    .music:is(.peek, :focus-within) {
        --shown: 1;
    }

    .music:is(.peek, :focus-within) .info {
        translate: 0 0;
        pointer-events: auto;
    }

    @media (hover: hover) and (pointer: fine) {
        .music:hover {
            --shown: 1;
        }

        .music:hover .info {
            translate: 0 0;
            pointer-events: auto;
        }
    }

    .disc {
        z-index: 1;
        width: var(--disc);
        height: var(--disc);
    }

    .disc[aria-busy='true'] {
        cursor: progress;
    }

    /* pressed, the whole disc sinks in by the site's press inset, like the pictures do: the
       ring and the record both draw in, keeping their 2px of air; the icon stays put */
    .disc:is(:active, :global(.is_pressed)) .vinyl {
        inset: calc(4px + var(--press-inset));
    }

    .disc:is(:active, :global(.is_pressed)) circle {
        r: calc(35px - var(--press-inset));
    }

    .progress {
        width: 100%;
        height: 100%;
        rotate: -90deg;
        overflow: visible;
        fill: none;
        stroke: currentColor;
        stroke-width: 2px;
        stroke-linecap: round;
    }

    .progress_track {
        opacity: var(--tone-line);
    }

    .progress_fill {
        opacity: var(--tone-soft);
        stroke-dasharray: 1;
    }

    /* an empty line would still draw its round end as a dot at the top */
    .progress_fill.empty {
        opacity: 0;
    }

    /* the ring takes the outer 2px, then 2px of air */
    .vinyl {
        inset: 4px;
        background:
            radial-gradient(circle, transparent 30%, oklch(100% 0 0 / 6%) 31%, transparent 33%),
            repeating-radial-gradient(circle, oklch(16% 0 0) 0 1.5px, oklch(19% 0 0) 1.5px 3px);
        box-shadow: 0 0.5rem 1.5rem oklch(0% 0 0 / 35%);
    }

    .label {
        inset: 28%;
        overflow: hidden;
    }

    .label img {
        position: absolute;
        inset: 0;
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .state {
        opacity: 0;
        filter: drop-shadow(0 0 4px oklch(0% 0 0 / 60%));
    }

    .state.shown,
    .disc:focus-visible .state,
    .disc:is(:active, :global(.is_pressed)) .state {
        opacity: 1;
    }

    @media (hover: hover) and (pointer: fine) {
        .disc:hover .state {
            opacity: 1;
        }
    }

    /* icons answer hover like the rest of the site: open strokes trim in from both ends,
       closed triangles pinch their corners, a little on hover and more on press */
    .trim {
        stroke-dasharray: 1 1;
        stroke-dashoffset: 0;
    }

    .pinch {
        d: var(--d);
    }

    @media (prefers-reduced-motion: no-preference) {
        .trim {
            transition:
                stroke-dasharray var(--duration-press) var(--ease-press),
                stroke-dashoffset var(--duration-press) var(--ease-press);
        }

        .pinch {
            transition: d var(--duration-press) var(--ease-press);
        }

        @media (hover: hover) and (pointer: fine) {
            :is(.disc, .skip):hover .trim {
                stroke-dasharray: 0.8 1;
                stroke-dashoffset: -0.1;
            }

            :is(.disc, .skip):hover .pinch {
                d: var(--d-hover);
            }
        }

        :is(.disc, .skip):is(:active, :global(.is_pressed)) .trim {
            stroke-dasharray: 0.6 1;
            stroke-dashoffset: -0.2;
        }

        :is(.disc, .skip):is(:active, :global(.is_pressed)) .pinch {
            d: var(--d-press);
        }
    }

    @media (prefers-reduced-motion: no-preference) {
        .music {
            /* backwards, not both: a held opacity would cut the shade's grey-out off from the page */
            animation: arrive var(--duration-glide) 800ms var(--ease-settle) backwards;
        }

        .info {
            transition:
                opacity var(--duration-reveal) var(--ease-out),
                translate var(--duration-glide) var(--ease-settle);
        }


        .vinyl {
            transition: inset var(--duration-press) var(--ease-press);
        }

        .state {
            transition: opacity var(--duration-press) var(--ease-out);
        }

        .progress_track {
            transition: r var(--duration-press) var(--ease-press);
        }

        .progress_fill {
            transition:
                stroke-dashoffset var(--duration-glide) var(--ease-settle),
                opacity var(--duration-glide) var(--ease-settle),
                r var(--duration-press) var(--ease-press);
        }

        .progress_fill.moving {
            transition:
                stroke-dashoffset 1s linear,
                r var(--duration-press) var(--ease-press);
        }
    }

    @keyframes arrive {
        from {
            opacity: 0;
            translate: 0 0.75rem;
        }
    }

    .embed {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        opacity: 0;
        pointer-events: none;
    }
</style>
