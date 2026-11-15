<div class="edge top" aria-hidden="true"></div>
<div class="edge bottom" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>

<style>
    .edge {
        position: fixed;
        inset-inline: 0;
        z-index: var(--layer-edge);
        height: var(--edge-fade);
        pointer-events: none;
        background: linear-gradient(to bottom, var(--color-surface), transparent);
    }

    .top {
        top: 0;
    }

    .bottom {
        bottom: 0;
        rotate: 180deg;
    }

    .grain {
        position: fixed;
        inset: 0;
        z-index: var(--layer-grain);
        pointer-events: none;
        background: url(/noise.gif) repeat;
        opacity: var(--tone-grain);
        mix-blend-mode: overlay;
    }

    @media (width < 48rem) {
        .edge {
            display: none;
        }
    }

    @media print {
        .edge,
        .grain {
            display: none;
        }
    }
</style>
