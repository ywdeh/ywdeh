import { reduced_motion } from '$lib/motion/timing.js';

export function section_scroll(link, id) {
    function click(event) {
        if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: reduced_motion() ? 'instant' : 'smooth' });
    }
    link.addEventListener('click', click);
    return {
        update: (next) => (id = next),
        destroy: () => link.removeEventListener('click', click),
    };
}
