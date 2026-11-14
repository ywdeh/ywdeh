const callbacks = new Map();
let observer;

export function center_reveal(node, update) {
    if (!observer) {
        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) callbacks.get(entry.target)?.(entry.isIntersecting);
            },
            { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
        );
    }
    callbacks.set(node, update);
    observer.observe(node);
    return {
        update(callback) {
            callbacks.set(node, callback);
        },
        destroy() {
            observer.unobserve(node);
            callbacks.delete(node);
            if (!callbacks.size) {
                observer.disconnect();
                observer = undefined;
            }
        },
    };
}
