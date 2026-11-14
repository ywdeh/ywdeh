import { FLIGHT_EASE, FLIGHT_MS, motion_time } from '$lib/motion/settings.js';
export function flight_duration() {
    return motion_time(FLIGHT_MS);
}
export function picture_box(image) {
    const rect = image.getBoundingClientRect();
    const style = getComputedStyle(image);
    const left = parseFloat(style.paddingLeft) || 0;
    const top = parseFloat(style.paddingTop) || 0;
    return {
        left: rect.left + left,
        top: rect.top + top,
        width: rect.width - left - (parseFloat(style.paddingRight) || 0),
        height: rect.height - top - (parseFloat(style.paddingBottom) || 0),
    };
}
const usable = (box) =>
    box && box.width > 0 && box.height > 0 && Number.isFinite(box.left) && Number.isFinite(box.top);
function make_stand_in(src, box, radius) {
    const element = new Image();
    element.decoding = 'sync';
    element.alt = '';
    element.src = src;
    element.setAttribute('aria-hidden', 'true');
    Object.assign(element.style, {
        position: 'fixed',
        left: `${box.left}px`,
        top: `${box.top}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
        margin: '0',
        objectFit: 'cover',
        borderRadius: radius,
        transformOrigin: '0 0',
        willChange: 'transform',
        pointerEvents: 'none',
        zIndex: '100',
    });
    document.body.append(element);
    return element;
}
export function fly(image, small, big, direction, src) {
    if (!image || !usable(small) || !usable(big)) return null;
    src ??= image.currentSrc || image.src;
    const scale_x = small.width / big.width;
    const scale_y = small.height / big.height;
    const shrunk = `translate(${small.left - big.left}px, ${small.top - big.top}px) scale(${scale_x}, ${scale_y})`;
    const radius = getComputedStyle(image.closest('.artwork') ?? image).borderTopLeftRadius;
    const element = make_stand_in(src, big, radius);
    const timing = { duration: flight_duration(), fill: 'both' };
    const opening = direction === 'in';
    const movement = element.animate(
        opening
            ? [{ transform: shrunk }, { transform: 'none' }]
            : [{ transform: 'none' }, { transform: shrunk }],
        { ...timing, easing: FLIGHT_EASE },
    );
    let arrive;
    const finished = new Promise((resolve) => (arrive = resolve));
    movement.onfinish = () => arrive();
    movement.oncancel = () => arrive();
    return {
        element,
        finished,
        reverse() {
            movement.reverse();
        },
        remove() {
            movement.cancel();
            element.remove();
        },
    };
}
export function when_painted(flight) {
    return flight.element
        .decode()
        .catch(() => {})
        .then(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
}
