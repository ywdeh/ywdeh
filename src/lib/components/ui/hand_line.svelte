<script>
    import { strokes } from '$lib/geometry/strokes.js';
</script>

<svg class="hand_line" viewBox="0 0 1000 12" preserveAspectRatio="none" aria-hidden="true">
    <path
        d={strokes.hand_line[0]}
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
    />
</svg>

<style>
    .hand_line {
        display: block;
        width: 100%;
        height: 12px;
        color: var(--color-ink);
        opacity: var(--tone-line);
        overflow: visible;
    }
</style>
