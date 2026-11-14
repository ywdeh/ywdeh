import { motion_ms, token } from './timing.js';

export const flight_ms = () => motion_ms('--duration-flight');

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

const position_fraction = (value) => {
    if (value?.endsWith('%')) return parseFloat(value) / 100;
    if (value === 'left' || value === 'top') return 0;
    if (value === 'right' || value === 'bottom') return 1;
    return 0.5;
};

function stand_in(src, box, radius) {
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
        zIndex: token('--layer-flight'),
    });
    document.body.append(element);
    return element;
}

export function fly({ image, small, big, direction, src, framing = image }) {
    if (!image || !usable(small) || !usable(big)) return null;
    const scale = Math.max(small.width / big.width, small.height / big.height);
    const [position_x, position_y] = getComputedStyle(framing).objectPosition.split(' ');
    const overflow_x = Math.max(0, big.width * scale - small.width);
    const overflow_y = Math.max(0, big.height * scale - small.height);
    const crop_x = overflow_x * position_fraction(position_x);
    const crop_y = overflow_y * position_fraction(position_y);
    const radius = getComputedStyle(image.closest('.frame') ?? image).borderTopLeftRadius;
    const element = stand_in(src ?? (image.currentSrc || image.src), big, radius);
    const small_radius = `${parseFloat(radius) / scale}px`;
    const shrunk = {
        transform: `translate(${small.left - big.left - crop_x}px, ${small.top - big.top - crop_y}px) scale(${scale})`,
        clipPath: `inset(${crop_y / scale}px ${(overflow_x - crop_x) / scale}px ${(overflow_y - crop_y) / scale}px ${crop_x / scale}px round ${small_radius})`,
    };
    const full = { transform: 'none', clipPath: `inset(0px round ${radius})` };
    const movement = element.animate(direction === 'in' ? [shrunk, full] : [full, shrunk], {
        duration: flight_ms(),
        easing: token('--ease-flight'),
        fill: 'both',
    });
    const finished = new Promise((resolve) => {
        movement.onfinish = resolve;
        movement.oncancel = resolve;
    });
    return {
        element,
        finished,
        reverse: () => movement.reverse(),
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
