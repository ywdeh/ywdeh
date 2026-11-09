<script>
    let { class: class_name = "" } = $props();
</script>

<!-- a divider that looks drawn by hand, to match the handwritten intro font: a gently wobbling stroke with
     round ends. It stretches to any width while vector-effect keeps the stroke itself the same thickness. -->
<svg class="hand_line {class_name}" viewBox="0 0 1000 12" preserveAspectRatio="none" aria-hidden="true">
    <path d="M3 7.4 C 60 5.2, 130 4.6, 220 6.1 S 390 8.6, 520 6.3 S 700 3.4, 810 5.6 S 950 7.9, 997 5.1"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        vector-effect="non-scaling-stroke" />
</svg>

<style>
    .hand_line { display: block; height: 12px; color: var(--color-mauve-100); opacity: 0.072; overflow: visible; }
</style>
