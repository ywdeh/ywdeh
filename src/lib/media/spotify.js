import { average_color } from './color.js';

const API_SRC = 'https://open.spotify.com/embed/iframe-api/v1';
const API_TIMEOUT_MS = 10000;
const EMBED = { width: 300, height: 80 };

let api;
const covers = new Map();

export const track_url = (id) => `https://open.spotify.com/track/${id}`;
export const track_uri = (id) => `spotify:track:${id}`;

function load_api() {
    api ??= new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('spotify api timed out')), API_TIMEOUT_MS);
        window.onSpotifyIframeApiReady = (IFrameAPI) => {
            clearTimeout(timer);
            resolve(IFrameAPI);
        };
        const script = document.createElement('script');
        script.src = API_SRC;
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

export async function spotify_controller(element, id) {
    const IFrameAPI = await load_api();
    return new Promise((resolve) =>
        IFrameAPI.createController(element, { uri: track_uri(id), ...EMBED }, resolve),
    );
}

export function track_cover(id) {
    if (!covers.has(id)) {
        covers.set(
            id,
            fetch(`https://open.spotify.com/oembed?url=${track_url(id)}`)
                .then((response) => response.json())
                .then(async ({ thumbnail_url }) => ({
                    url: thumbnail_url,
                    color: await average_color(thumbnail_url).catch(() => undefined),
                }))
                .catch(() => ({})),
        );
    }
    return covers.get(id);
}
