<script>
    import { strokes } from '$lib/geometry/strokes.js';

    let { open = false, class: classes = '' } = $props();

    const [envelope, flap] = strokes.mail;
</script>

<svg
    class="icon {classes}"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
>
    <g class="stroke-squeeze">
        <path d={envelope} />
        <path
            class="flap"
            class:open
            style:--flap={`path('${flap}')`}
            style:--flap-open={`path('${strokes.mail_open}')`}
        />
    </g>
</svg>

<style>
    .icon {
        flex-shrink: 0;
        overflow: visible;
        opacity: var(--icon-opacity, 1);
    }

    .flap {
        d: var(--flap);
    }

    .flap.open {
        d: var(--flap-open);
    }

    @media (prefers-reduced-motion: no-preference) {
        .flap {
            transition: d var(--duration-quick) var(--ease-press);
        }
    }
</style>
