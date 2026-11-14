import { image_data } from './image_data.js';
import { srcset_of } from './image_source.js';
const AT_ONCE = 2;
const STALL_MS = 4000;
const pending = new Map();
const near = new Set();
const loading = new Map();
const observers = new Map();
const watched_by = new Map();
const versions = new WeakMap();
const reveals = new WeakMap();
function watch(image) {
    const root = image.closest('[role="dialog"]');
    const key = root ?? document;
    let group = observers.get(key);
    if (!group) {
        group = {
            images: new Set(),
            observer: new IntersectionObserver(
                (entries) => {
                    for (const { target, isIntersecting } of entries) {
                        if (!pending.has(target)) continue;
                        if (isIntersecting) near.add(target);
                        else near.delete(target);
                    }
                    next();
                },
                { root, rootMargin: '200px' },
            ),
        };
        observers.set(key, group);
    }
    group.images.add(image);
    watched_by.set(image, key);
    group.observer.observe(image);
}
function forget(image) {
    pending.delete(image);
    near.delete(image);
    const key = watched_by.get(image);
    const group = observers.get(key);
    if (group) {
        group.observer.unobserve(image);
        group.images.delete(image);
        if (!group.images.size) {
            group.observer.disconnect();
            observers.delete(key);
        }
    }
    watched_by.delete(image);
}
function put(image, src) {
    const box = image.getBoundingClientRect();
    const [width, height] = image_data[src] ?? [];
    const shown =
        width && height && box.height ? Math.max(box.width, (box.height * width) / height) : box.width;
    if (shown) image.sizes = `${Math.ceil(shown)}px`;
    image.srcset = srcset_of(src);
    image.src = src;
}
async function show(image, src) {
    const version = (versions.get(image) ?? 0) + 1;
    versions.set(image, version);
    put(image, src);
    try {
        await image.decode();
    } catch {}
    if (!image.isConnected || versions.get(image) !== version) return;
    image.classList.replace('is_waiting', 'is_revealing');
    clearTimeout(reveals.get(image));
    reveals.set(
        image,
        setTimeout(() => image.classList.remove('is_revealing'), 400),
    );
}
function first() {
    let best;
    for (const image of near) {
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
        const image = first();
        if (!image) return;
        const src = pending.get(image);
        forget(image);
        loading.set(
            image,
            setTimeout(() => finish(image), STALL_MS),
        );
        void show(image, src).then(() => finish(image));
    }
}
export function queued(image, src) {
    image.classList.add('is_waiting');
    pending.set(image, src);
    watch(image);
    return {
        update(value) {
            if (value === src) return;
            src = value;
            if (pending.has(image)) forget(image);
            void show(image, value);
        },
        destroy() {
            versions.set(image, (versions.get(image) ?? 0) + 1);
            clearTimeout(reveals.get(image));
            forget(image);
            finish(image);
        },
    };
}
