<script>
    import { onMount } from 'svelte';
    import { cubicOut } from 'svelte/easing';
    import { press } from '$lib/actions/press.js';
    import { labels } from '$lib/content/labels.js';
    import { tracks } from '$lib/content/music.js';
    import { light_under } from '$lib/controllers/light_under.svelte.js';
    import { playback } from '$lib/controllers/playback.svelte.js';
    import { vinyl_spin } from '$lib/controllers/vinyl_spin.svelte.js';
    import { disc, pinched, strokes } from '$lib/geometry/strokes.js';
    import { css_path, mask_url } from '$lib/geometry/svg.js';
    import { track_url } from '$lib/media/spotify.js';
    import { motion_ms, token_ms } from '$lib/motion/timing.js';
    import Icon from '$lib/components/ui/icon.svelte';

    const SHIFT_REM = 0.5;

    const music = playback(tracks);
    let player = $state();
    let info = $state();
    let vinyl = $state();
    let host = $state();
    let peek = $state(false);
    let peek_timer;

    const light = light_under({
        get element() {
            return player;
        },
        get area() {
            return info;
        },
    });

    vinyl_spin({
        get playing() {
            return music.playing;
        },
        get element() {
            return vinyl;
        },
    });

    const state_label = $derived(music.ended ? labels.replay : music.paused ? labels.play : labels.pause);
    const state_icon = $derived(music.ended ? strokes.replay : music.paused ? strokes.play : strokes.pause);

    const rise = (direction, duration) => ({
        duration: motion_ms(duration),
        easing: cubicOut,
        css: (t, u) => `opacity: ${t}; translate: 0 ${direction * u * SHIFT_REM}rem`,
    });

    const song_in = () => rise(1, '--duration-glide');
    const song_out = () => rise(-1, '--duration-reveal');
    const cover_in = () => ({
        duration: motion_ms('--duration-reveal'),
        easing: cubicOut,
        css: (t) => `opacity: ${t}; z-index: var(--level-raised)`,
    });
    const cover_out = () => ({ duration: motion_ms('--duration-reveal'), css: () => 'z-index: var(--level-base)' });

    function glance() {
        peek = true;
        clearTimeout(peek_timer);
        peek_timer = setTimeout(() => (peek = false), token_ms('--duration-peek'));
    }

    function toggle() {
        glance();
        music.toggle(host);
    }

    function next() {
        music.next();
        glance();
    }

    $effect(() => {
        if (peek && player) requestAnimationFrame(light.sample);
    });

    onMount(() => {
        music.start();
        return () => {
            clearTimeout(peek_timer);
            music.destroy();
        };
    });
</script>

{#if music.track}
    {@const track = music.track}
    <aside
        bind:this={player}
        class="music tinted fixed flex items-center gap-control text-ui"
        class:peek
        style:--tint={music.tint}
        style:--shade={light.shade}
        style:--ring-press={css_path(disc.ring_pressed)}
        style:--label-mask={mask_url(disc.label, disc.label_box)}
        aria-label={labels.music}
    >
        <div bind:this={info} class="info flex items-center gap-control">
            <div class="songs grid min-w-0">
                {#key track}
                    <div class="song flex min-w-0 flex-col items-end" in:song_in out:song_out>
                        <a
                            use:press
                            href={track_url(track.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="max-w-full truncate font-normal"
                            title={labels.open_in_spotify}>{track.title}</a
                        >
                        <span class="ink-muted max-w-full truncate">{track.artist}</span>
                    </div>
                {/key}
            </div>
            <button
                use:press
                type="button"
                class="icon-host link-soft tap-target shrink-0"
                aria-label={labels.next_song}
                onclick={next}
            >
                <Icon paths={strokes.next} morphs={pinched} class="size-6" />
            </button>
        </div>

        <button
            use:press
            type="button"
            class="disc icon-host relative level-raised shrink-0 rounded-full"
            aria-label={labels.playback(state_label, track)}
            aria-busy={music.connecting}
            onclick={toggle}
        >
            <svg class="progress absolute inset-0" viewBox="0 0 {disc.box} {disc.box}" aria-hidden="true">
                <path d={disc.ring} class="progress_track" vector-effect="non-scaling-stroke" />
                <path
                    d={disc.ring}
                    class="progress_fill"
                    class:moving={music.playing}
                    class:empty={music.progress === 0}
                    vector-effect="non-scaling-stroke"
                    pathLength="1"
                    style:stroke-dashoffset={1 - music.progress}
                />
            </svg>
            <span bind:this={vinyl} class="vinyl absolute">
                <span class="label absolute bg-placeholder">
                    {#if music.cover}
                        {#key music.cover}
                            <img
                                src={music.cover}
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
                <span class="hole absolute rounded-full"></span>
            </span>
            <span class="state absolute inset-0 flex items-center justify-center" class:shown={music.ended}>
                <Icon paths={state_icon} morphs={pinched} class="size-6" />
            </span>
        </button>

        <div class="embed" aria-hidden="true"><div bind:this={host}></div></div>
    </aside>
{/if}

<style>
    @property --shade {
        syntax: '<number>';
        inherits: true;
        initial-value: 0;
    }

    .music {
        --disc: 4.5rem;
        --disc-gap: 4px;
        --info-width: 16rem;
        --info-offset: 0.75rem;
        --glow-x: 18rem;
        --glow-y: 15rem;
        --groove: 1.5px;
        --vinyl: oklch(16% 0 0);
        --vinyl-groove: oklch(19% 0 0);
        --vinyl-ring: oklch(100% 0 0 / 6%);
        --corner: max(1rem, calc(var(--spacing-page-y) / 2));
        --shown: 0;
        right: var(--corner);
        bottom: var(--corner);
        z-index: var(--layer-music);
        max-width: calc(100vw - 2 * var(--corner));
        color: var(--tint-ink);
    }

    @media (width < 48rem) {
        .music {
            display: none;
        }
    }

    .music::before {
        content: '';
        position: absolute;
        right: calc(-1 * var(--corner));
        bottom: calc(-1 * var(--corner));
        z-index: var(--level-below);
        width: calc(100% + var(--glow-x));
        height: calc(100% + var(--glow-y));
        background: radial-gradient(
            farthest-side at 100% 100%,
            oklch(from var(--color-surface) l c h / 85%),
            oklch(from var(--color-surface) l c h / 80%) 14%,
            oklch(from var(--color-surface) l c h / 68%) 28%,
            oklch(from var(--color-surface) l c h / 51%) 42%,
            oklch(from var(--color-surface) l c h / 33%) 56%,
            oklch(from var(--color-surface) l c h / 18%) 69%,
            oklch(from var(--color-surface) l c h / 8%) 81%,
            oklch(from var(--color-surface) l c h / 2%) 91%,
            transparent
        );
        -webkit-backdrop-filter: var(--filter-muted);
        backdrop-filter: var(--filter-muted);
        -webkit-mask-image: var(--glow-mask);
        mask-image: var(--glow-mask);
        --glow-mask: radial-gradient(
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

    .info {
        color: oklch(
            from var(--tint-ink) calc(l + (0.99 - l) * var(--shade)) calc(c * (1 - 0.6 * var(--shade))) h
        );
        --tone-muted: calc(0.4 + 0.4 * var(--shade));
        --tone-soft: calc(0.6 + 0.3 * var(--shade));
        max-width: var(--info-width);
        text-align: right;
        text-transform: lowercase;
        opacity: var(--shown);
        translate: var(--info-offset) 0;
        pointer-events: none;
    }

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
        width: var(--disc);
        height: var(--disc);
    }

    .disc[aria-busy='true'] {
        cursor: progress;
    }

    .disc:is(:active, :global(.is_pressed)) .vinyl {
        inset: calc(var(--disc-gap) + var(--press-inset));
    }

    .disc:is(:active, :global(.is_pressed)) .progress path {
        d: var(--ring-press);
    }

    .progress {
        width: 100%;
        height: 100%;
        rotate: -90deg;
        overflow: visible;
        fill: none;
        stroke: currentColor;
        stroke-width: var(--stroke);
        stroke-linecap: round;
    }

    .progress_track {
        opacity: var(--tone-line);
    }

    .progress_fill {
        opacity: var(--tone-soft);
        stroke-dasharray: 1;
    }

    .progress_fill.empty {
        opacity: 0;
    }

    .vinyl {
        inset: var(--disc-gap);
        border-radius: 50%;
        background:
            radial-gradient(circle, transparent 30%, var(--vinyl-ring) 31%, transparent 33%),
            repeating-radial-gradient(
                circle,
                var(--vinyl) 0 var(--groove),
                var(--vinyl-groove) var(--groove) calc(2 * var(--groove))
            );
        box-shadow: var(--shadow-lift);
    }

    .label {
        inset: 28%;
        overflow: hidden;
        -webkit-mask: var(--label-mask) center / 100% 100% no-repeat;
        mask: var(--label-mask) center / 100% 100% no-repeat;
    }

    .hole {
        inset: calc(50% - var(--disc-gap));
        background-color: var(--color-surface);
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
        filter: drop-shadow(var(--shadow-glyph));
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

    @media (prefers-reduced-motion: no-preference) {
        .music {
            transition:
                color var(--duration-tint) var(--ease-out),
                --shade var(--duration-tint) var(--ease-out);
            animation: arrive var(--duration-glide) var(--delay-arrival) var(--ease-settle) backwards;
        }

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
            transition: d var(--duration-press) var(--ease-press);
        }

        .progress_fill {
            transition:
                stroke-dashoffset var(--duration-glide) var(--ease-settle),
                opacity var(--duration-glide) var(--ease-settle),
                d var(--duration-press) var(--ease-press);
        }

        .progress_fill.moving {
            transition:
                stroke-dashoffset 1s linear,
                d var(--duration-press) var(--ease-press);
        }
    }

    @keyframes arrive {
        from {
            opacity: 0;
            translate: 0 var(--info-offset);
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
