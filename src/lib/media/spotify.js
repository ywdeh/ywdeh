// Spotify iFrame API: the embed plays the music, our own ui drives it
// https://developer.spotify.com/documentation/embeds/references/iframe-api

let api;

function load_api() {
    api ??= new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('spotify api timed out')), 10000);
        window.onSpotifyIframeApiReady = (IFrameAPI) => {
            clearTimeout(timer);
            resolve(IFrameAPI);
        };
        const script = document.createElement('script');
        script.src = 'https://open.spotify.com/embed/iframe-api/v1';
        script.async = true;
        script.onerror = () => {
            clearTimeout(timer);
            api = undefined;
            reject(new Error('spotify api failed to load'));
        };
        document.head.append(script);
    });
    return api;
}

export async function spotify_controller(element, uri) {
    const IFrameAPI = await load_api();
    return new Promise((resolve) =>
        IFrameAPI.createController(element, { uri, width: 300, height: 80 }, resolve),
    );
}
