import { untrack } from 'svelte';
import { fly, flight_ms, picture_box, when_painted } from '$lib/motion/flight.js';
import { flight_pace, overlay_pace } from '$lib/motion/timing.js';

export function image_flight(options) {
    let flight = null;
    let disposed = false;
    let closing = false;
    let home;

    function landing_box(dialog, enlarged) {
        const measured = enlarged.complete && enlarged.naturalWidth && enlarged.getBoundingClientRect();
        if (measured?.width && measured?.height) return measured;
        const area = dialog.querySelector('.viewer_viewport')?.getBoundingClientRect();
        const { width, height } = options.natural ?? {};
        if (!area?.width || !width || !height) return null;
        const fit = Math.min(1, area.width / width, area.height / height);
        return {
            left: area.left + (area.width - width * fit) / 2,
            top: area.top + (area.height - height * fit) / 2,
            width: width * fit,
            height: height * fit,
        };
    }

    function launch(dialog, direction) {
        const frame = dialog.querySelector('.viewer_frame');
        const enlarged = frame?.querySelector('img');
        if (direction === 'in') home = options.origin;
        if (!frame || !enlarged || !home?.isConnected || !flight_ms()) return false;
        if (direction === 'out') {
            closing = true;
            if (flight) {
                flight.reverse();
                return true;
            }
            flight = fly({
                image: enlarged,
                small: picture_box(home),
                big: picture_box(enlarged),
                direction,
                framing: home,
            });
        } else {
            const ready = enlarged.complete && enlarged.naturalWidth;
            flight = fly({
                image: home,
                small: picture_box(home),
                big: landing_box(dialog, enlarged),
                direction,
                src: ready ? enlarged.currentSrc : undefined,
            });
            if (flight && !ready) {
                const stand_in = flight.element;
                enlarged.decode().then(
                    () => stand_in.isConnected && (stand_in.src = enlarged.currentSrc),
                    () => {},
                );
            }
        }
        if (!flight) return false;
        const current = flight;
        const spot = home;
        frame.style.visibility = 'hidden';
        if (direction === 'in') {
            when_painted(current).then(() => {
                if (!disposed && !closing && current.element.isConnected) spot.style.visibility = 'hidden';
            });
        }
        current.finished.then(async () => {
            if (disposed) return;
            if (direction === 'in' && !closing) await enlarged.decode().catch(() => {});
            if (direction === 'in' && closing)
                await current.element.getAnimations()[0]?.finished.catch(() => {});
            (closing ? spot : frame).style.visibility = '';
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

    return {
        launch,
        pace(direction) {
            const source = direction === 'in' ? options.origin : home;
            return flight_ms() && source?.isConnected ? flight_pace() : overlay_pace();
        },
    };
}
