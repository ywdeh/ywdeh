// Pictures load a couple at a time, in reading order, as they come near the screen. Until its turn a
// picture's spot is a soft grey block; then it loads, is decoded before it's shown (so the fade never
// stutters), and fades in over the block, and the next one starts. Taking them in turn keeps the
// connection and the decoding from piling up, which is what made scrolling into the gallery lag; two at
// once keeps the connection busy while the other one is still on its way or decoding.
//
// Use as an action on an <img> rendered without a src: `<img use:queued={src}>` (styles in layout.css).
// Changing the src later (a card swapping to its animation) loads it at once, outside the line.

const NEAR_SCREEN = '200px';
const AT_ONCE = 2;
const STALL_MS = 4000; // a picture that takes this long stops holding up the rest

const pending = new Map(); // img → the src it's waiting to load
const near = new Set(); // waiting pictures near the screen
const loading = new Map(); // pictures whose turn it is → their stall timer

// the page and the case study panel each scroll on their own, so "near the screen" is measured against
// whichever one a picture is in (a margin only reaches past its own observer's edges)
const observers = new WeakMap(); // scroller (or the document) → its observer
const watched_by = new Map(); // img → the observer watching it

function on_change(entries) {
    for (const { target, isIntersecting } of entries) {
        if (isIntersecting) near.add(target);
        else near.delete(target);
    }
    next();
}

function watch(image) {
    const root = image.closest('.page_scroll, [role="dialog"]');
    const key = root ?? document;
    if (!observers.has(key)) observers.set(key, new IntersectionObserver(on_change, { root, rootMargin: NEAR_SCREEN }));
    watched_by.set(image, observers.get(key));
    observers.get(key).observe(image);
}

function forget(image) {
    pending.delete(image);
    near.delete(image);
    watched_by.get(image)?.unobserve(image);
    watched_by.delete(image);
}

// loads a picture and fades it in once it's decoded
async function show(image, src) {
    image.src = src;
    try {
        await image.decode();
    } catch {
        // failed or replaced: just show whatever is there
    }
    image.classList.replace('is_waiting', 'is_revealing');
    setTimeout(() => image.classList.remove('is_revealing'), 400);
}

// the nearest-to-the-top picture
function first(images) {
    let best = null;
    for (const image of images) {
        if (!best || best.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_PRECEDING) best = image;
    }
    return best;
}

function finish(image) {
    if (!loading.has(image)) return;
    clearTimeout(loading.get(image));
    loading.delete(image);
    next();
}

function next() {
    while (loading.size < AT_ONCE) {
        const image = first(near);
        if (!image) return;
        const src = pending.get(image);
        forget(image);
        loading.set(image, setTimeout(() => finish(image), STALL_MS));
        show(image, src).then(() => finish(image));
    }
}

export function queued(image, src) {
    image.classList.add('is_waiting');
    pending.set(image, src);
    watch(image);
    return {
        update(new_src) {
            if (pending.has(image)) {
                forget(image);
                show(image, new_src);
            } else if (image.getAttribute('src') !== new_src) {
                image.src = new_src; // already showing: the old picture stays up until the new one is in
            }
        },
        destroy() {
            forget(image);
            finish(image); // gone mid-load: let the next one go
        },
    };
}
