// Flies a picture between its spot on the page and the image viewer.
//
// A stand-in copy of the picture moves above everything else. Its movement is a transform-only Web
// Animation, which the browser runs on the compositor (GPU), so it stays smooth even while the main
// thread is busy mounting the viewer or decoding the full-size image. The stand-in is always laid out at
// the big size and scaled down, so it's never blurry from being scaled up.

const DURATION = 450; // ms
const EASING = 'cubic-bezier(0.65, 0, 0.35, 1)'; // ease in-out
const RADIUS = 12; // px: the pictures' corner radius (rounded-xl)

// same curve as EASING, to keep the corner animation in step with the movement
function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function flight_duration() {
    return matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : DURATION;
}

// the picture itself, without padding (a pressed card insets its picture with 6px of padding)
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

const usable = (box) => box && box.width > 0 && box.height > 0 && Number.isFinite(box.left) && Number.isFinite(box.top);

// A copy of the picture laid out at `box`. Animated pictures (GIFs) are copied as a still of the frame
// they're on, so they hold still mid-air instead of playing; anything else reuses the already-decoded file.
function make_stand_in(image, box) {
    const src = image.currentSrc || image.src;
    let element = null;
    if (/\.gif(\?|#|$)/i.test(src)) {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(box.width * ratio));
        canvas.height = Math.max(1, Math.round(box.height * ratio));
        try {
            canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
            element = canvas;
        } catch {
            element = null;
        }
    }
    if (!element) {
        element = new Image();
        element.decoding = 'sync';
        element.alt = '';
        element.src = src;
    }
    element.setAttribute('aria-hidden', 'true');
    Object.assign(element.style, {
        position: 'fixed',
        left: `${box.left}px`,
        top: `${box.top}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
        margin: '0',
        objectFit: 'cover',
        borderRadius: `${RADIUS}px`,
        transformOrigin: '0 0',
        willChange: 'transform',
        pointerEvents: 'none',
        zIndex: '100',
    });
    document.body.append(element);
    return element;
}

// Flies `image` between a small box (its spot on the page) and a big box (its spot in the viewer):
// direction 'in' goes small → big, 'out' big → small. Returns null if the boxes can't be used.
//   finished: resolves once it has arrived (whichever way it's going by then)
//   reverse(): turns round mid-flight, from wherever it is
//   remove(): takes the stand-in away
export function fly(image, small, big, direction) {
    if (!image || !usable(small) || !usable(big)) return null;
    const scale_x = small.width / big.width;
    const scale_y = small.height / big.height;
    const shrunk = `translate(${small.left - big.left}px, ${small.top - big.top}px) scale(${scale_x}, ${scale_y})`;

    // the corners are counter-scaled so they look the same 12px round all the way, instead of shrinking
    // and stretching with the picture. It's a separate animation, so it can't hold the movement back
    // (only transform-only animations run on the compositor)
    const corners = [];
    for (let step = 0; step <= 12; step++) {
        const shrink = 1 - ease(step / 12); // 1 = fully on the page spot, 0 = fully in the viewer
        const sx = 1 + (scale_x - 1) * shrink;
        const sy = 1 + (scale_y - 1) * shrink;
        corners.push({ borderRadius: `${RADIUS / sx}px / ${RADIUS / sy}px` });
    }

    const element = make_stand_in(image, big);
    const timing = { duration: flight_duration(), fill: 'both' };
    const opening = direction === 'in';
    const movement = element.animate(
        opening ? [{ transform: shrunk }, { transform: 'none' }] : [{ transform: 'none' }, { transform: shrunk }],
        { ...timing, easing: EASING }
    );
    const rounding = element.animate(opening ? corners : [...corners].reverse(), { ...timing, easing: 'linear' });

    // resolves on arrival even after a reverse() (the movement's `finished` promise is replaced then)
    let arrive;
    const finished = new Promise((resolve) => (arrive = resolve));
    movement.onfinish = () => arrive();
    movement.oncancel = () => arrive();

    return {
        element,
        finished,
        reverse() {
            movement.reverse();
            rounding.reverse();
        },
        remove() {
            movement.cancel();
            rounding.cancel();
            element.remove();
        },
    };
}

// Waits until the stand-in has something to show, then a frame more so it's on screen: only then can
// the picture under it step aside without leaving a blank frame.
export function when_painted(flight) {
    const ready = flight.element instanceof HTMLImageElement ? flight.element.decode().catch(() => {}) : Promise.resolve();
    return ready.then(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
}
