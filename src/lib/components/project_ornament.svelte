<script>
    import DividerStars from "./divider_stars.svelte";
    import { ornament_drawings, ornament_width } from "$lib/project_ornaments.js";

    // a draggable doodle on a project card's bottom edge (not in use yet: pass `ornament` to ProjectCard)
    // kind: one of ornament_drawings' names
    let { kind } = $props();
    let start_inset = $state(0);

    // keeps the doodle clear of the card's links, which sit on the same edge
    function safe_link_gap(node) {
        const track = node.parentElement;
        const link = track.querySelector('.project_links');
        const observer = new ResizeObserver(() => {
            start_inset = link.getBoundingClientRect().right - track.getBoundingClientRect().left + ornament_width / 2 + 12;
        });
        observer.observe(track);
        observer.observe(link);
        return { destroy: () => observer.disconnect() };
    }
</script>

<div use:safe_link_gap class="project_ornament" aria-hidden="true">
    <DividerStars single_star star_position="90%" line_drawings={ornament_drawings[kind]} {start_inset} />
</div>

<style>
    .project_ornament {
        position: absolute;
        inset-inline: 0;
        bottom: 5px;
        height: 0;
    }
</style>
