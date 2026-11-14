import { reduced_motion } from '$lib/motion/settings.js';
export function section_scroll(node, target_id) {
    function click(event) {
        if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        document
            .getElementById(target_id)
            ?.scrollIntoView({ behavior: reduced_motion() ? 'instant' : 'smooth' });
    }
    node.addEventListener('click', click);
    return {
        update(value) {
            target_id = value;
        },
        destroy() {
            node.removeEventListener('click', click);
        },
    };
}
