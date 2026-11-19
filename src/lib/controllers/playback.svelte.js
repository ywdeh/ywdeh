import { spotify_controller, track_cover, track_uri } from '$lib/media/spotify.js';

const END_TOLERANCE_MS = 250;

export function playback(tracks) {
    let track = $state.raw();
    let cover = $state();
    let tint = $state();
    let controller = $state.raw();
    let ready = $state(false);
    let paused = $state(true);
    let buffering = $state(false);
    let position = $state(0);
    let duration = $state(0);
    let ended = $state(false);
    let connecting = $state(false);
    let loaded;
    let gone = false;
    let play_when_ready = false;

    const progress = $derived(duration && !ended ? Math.min(position / duration, 1) : 0);
    const playing = $derived(!paused && !buffering && duration > 0 && position < duration);

    const random_track = () => tracks[Math.floor(Math.random() * tracks.length)];
    const following = () => tracks[(tracks.indexOf(track) + 1) % tracks.length];

    async function load_cover(item) {
        const found = await track_cover(item.id);
        if (track !== item) return;
        cover = found.url;
        tint = found.color;
    }

    function show(item) {
        track = item;
        position = 0;
        duration = 0;
        ended = false;
        load_cover(item);
    }

    function load(item) {
        loaded = item;
        ready = false;
        controller.loadUri(track_uri(item.id));
    }

    function connect(host) {
        if (connecting || controller) return;
        connecting = true;
        loaded = track;
        spotify_controller(host, track.id)
            .then((created) => {
                if (gone) return created.destroy();
                controller = created;
                controller.addListener('ready', () => {
                    if (loaded !== track) return load(track);
                    ready = true;
                    if (!play_when_ready) return;
                    play_when_ready = false;
                    controller.play();
                });
                controller.addListener('playback_update', ({ data }) => {
                    ended = data.duration > 0 && data.position >= data.duration - END_TOLERANCE_MS;
                    paused = data.isPaused || ended;
                    buffering = data.isBuffering;
                    position = data.position;
                    duration = data.duration;
                });
            })
            .catch(() => (play_when_ready = false))
            .finally(() => (connecting = false));
    }

    return {
        get track() {
            return track;
        },
        get cover() {
            return cover;
        },
        get tint() {
            return tint;
        },
        get paused() {
            return paused;
        },
        get ended() {
            return ended;
        },
        get connecting() {
            return connecting;
        },
        get progress() {
            return progress;
        },
        get playing() {
            return playing;
        },
        start: () => show(random_track()),
        toggle(host) {
            if (!controller) {
                play_when_ready = true;
                connect(host);
            } else if (!ready) play_when_ready = true;
            else if (ended) {
                ended = false;
                controller.restart();
            } else controller.togglePlay();
        },
        next() {
            const keep_playing = !paused || play_when_ready;
            show(following());
            if (!controller) return;
            play_when_ready = keep_playing;
            load(track);
        },
        destroy() {
            gone = true;
            controller?.destroy();
        },
    };
}
