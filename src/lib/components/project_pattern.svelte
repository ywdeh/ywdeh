<script>
    // small clusters of diagonal hatching inside a project card's frame (not in use yet)
    // kind: 'vine' shifts the clusters a little; outline: the frame's path, which clips them
    let { kind, outline } = $props();
    let width = $state(400);
    let height = $state(360);
    const clip_id = $props.id();
    const lines = $derived.by(() => {
        const shift = kind === 'vine' ? 0 : 0.025;
        const paths = [];
        function diagonal(x, y, dx, dy) {
            const sx = x * 1000, sy = y * 400;
            const ex = sx + dx / width * 1000, ey = sy + dy / height * 400;
            return `M${sx} ${sy}Q${(sx + ex) / 2 + 0.8} ${(sy + ey) / 2 - 0.35} ${ex} ${ey}`;
        }
        // the clusters stay in the frame's padding, away from the body copy
        for (const [i, length] of [19, 25, 18, 22].entries()) {
            paths.push(diagonal(0.43 + shift + i * 0.045, 0, -length, length));
        }
        for (const [i, length] of [18, 24, 20].entries()) {
            paths.push(diagonal(0.65 + shift + i * 0.055, 1, length, -length));
        }
        for (const [i, length] of [13, 17, 12].entries()) {
            paths.push(diagonal(1, 0.69 + i * 0.065, -length, length));
        }
        return paths;
    });
    function measure(node) {
        const observer = new ResizeObserver(([entry]) => {
            width = Math.max(1, entry.contentRect.width);
            height = Math.max(1, entry.contentRect.height);
        });
        observer.observe(node);
        return { destroy: () => observer.disconnect() };
    }
</script>

<div use:measure class="project_pattern" aria-hidden="true">
    <svg viewBox="0 0 1000 400" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <defs><clipPath id={clip_id}><path d={outline} /></clipPath></defs>
        <g clip-path={`url(#${clip_id})`}>
            {#each lines as line}<path d={line} vector-effect="non-scaling-stroke" />{/each}
        </g>
    </svg>
</div>

<style>
    .project_pattern {
        position: absolute;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        overflow: clip;
        opacity: var(--project-line-opacity);
    }
    svg { display: block; width: 100%; height: 100%; }
</style>
