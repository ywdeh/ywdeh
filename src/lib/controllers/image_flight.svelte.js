import { untrack } from 'svelte';
import { fly, flight_duration, picture_box, when_painted } from '$lib/motion/image_flight.js';
import { overlay_pace, flight_ease } from '$lib/motion/settings.js';
export function image_flight(options) {
    let flight = null;
    let disposed = false;
    let closing = false;
    let home;
    function landing_box(node) {
        const enlarged = node.querySelector('.artwork img');
        const measured = enlarged?.complete && enlarged.naturalWidth && enlarged.getBoundingClientRect();
        if (measured?.width && measured?.height) return measured;
        const area = node.querySelector('.gallery_image_viewport')?.getBoundingClientRect();
        if (!area?.width || !options.natural?.width || !options.natural?.height) return null;
        const fit = Math.min(1, area.width / options.natural.width, area.height / options.natural.height);
        const width = options.natural.width * fit;
        const height = options.natural.height * fit;
        return {
            left: area.left + (area.width - width) / 2,
            top: area.top + (area.height - height) / 2,
            width,
            height,
        };
    }
    function fly_picture(node, direction) {
        const picture = node.querySelector('.artwork.gallery');
        const enlarged = picture?.querySelector('img');
        if (direction === 'in') home = options.origin;
        if (!picture || !enlarged || !home?.isConnected || !flight_duration()) return false;
        if (direction === 'out') {
            closing = true;
            if (flight) {
                flight.reverse();
                return true;
            }
            flight = fly(enlarged, picture_box(home), picture_box(enlarged), 'out');
        } else {
            const ready = enlarged.complete && enlarged.naturalWidth;
            flight = fly(
                home,
                picture_box(home),
                landing_box(node),
                'in',
                ready ? enlarged.currentSrc : undefined,
            );
            if (flight && !ready) {
                const stand_in = flight.element;
                enlarged.decode().then(
                    () => {
                        if (stand_in.isConnected) stand_in.src = enlarged.currentSrc;
                    },
                    () => {},
                );
            }
        }
        if (!flight) return false;
        const current = flight;
        const spot = home;
        picture.style.visibility = 'hidden';
        if (direction === 'in')
            when_painted(current).then(() => {
                if (!disposed && !closing && current.element.isConnected) spot.style.visibility = 'hidden';
            });
        current.finished.then(async () => {
            if (disposed) return;
            if (direction === 'in' && !closing) await enlarged.decode().catch(() => {});
            if (direction === 'in' && closing)
                await current.element.getAnimations()[0]?.finished.catch(() => {});
            (closing ? spot : picture).style.visibility = '';
            requestAnimationFrame(() => {
                current.remove();
                if (flight === current) flight = null;
            });
        });
        return true;
    }
    $effect(() => () => {
        disposed = true;
        flight?.remove();
        if (home) home.style.visibility = '';
        untrack(() => options.ongone)?.();
    });
    function viewer_pace(direction) {
        const flies = flight_duration() && (direction === 'in' ? options.origin : home)?.isConnected;
        return flies ? { duration: flight_duration(), easing: flight_ease } : overlay_pace();
    }

    return { fly: fly_picture, pace: viewer_pace };
}
