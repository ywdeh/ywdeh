const callbacks = new Map();
let observer;

function shared_observer() {
    observer ??= new IntersectionObserver(
        (entries) => {
            for (const entry of entries) callbacks.get(entry.target)?.(entry.isIntersecting);
        },
        { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    return observer;
}

export function center_reveal(element, callback) {
    callbacks.set(element, callback);
    shared_observer().observe(element);
    return {
        update: (next) => callbacks.set(element, next),
        destroy() {
            observer.unobserve(element);
            callbacks.delete(element);
            if (callbacks.size) return;
            observer.disconnect();
            observer = undefined;
        },
    };
}
