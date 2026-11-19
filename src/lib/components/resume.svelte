<script>
    import { press } from '$lib/actions/press.js';
    import { bullet, strokes } from '$lib/geometry/strokes.js';
    import { mask_url } from '$lib/geometry/svg.js';
    import { labels } from '$lib/content/labels.js';
    import { cases } from '$lib/content/work.js';
    import { resume } from '$lib/content/resume.js';
    import { site } from '$lib/content/site.js';
    import DividerHeading from '$lib/components/layout/divider_heading.svelte';
    import ArrowLink from '$lib/components/ui/arrow_link.svelte';
    import Icon from '$lib/components/ui/icon.svelte';
    import Range from '$lib/components/ui/range.svelte';

    const { headings } = resume;
    let light = $state(false);

    $effect(() => {
        const root = document.documentElement;
        if (light) root.dataset.theme = 'light';
        else delete root.dataset.theme;
        return () => delete root.dataset.theme;
    });
</script>

<main
    class="resume flex min-h-dvh w-full flex-col gap-row px-page-x py-page-y"
    style:--bullet={mask_url(bullet.path, bullet.box)}
>
    <header class="flex flex-row-reverse justify-between gap-copy md:flex-col">
        <div class="flex items-center gap-copy self-start md:flex-row-reverse md:justify-between md:self-auto">
            <button
                use:press
                type="button"
                class="icon-host link-soft tap-target print:hidden"
                aria-label={light ? labels.theme_dark : labels.theme_light}
                aria-pressed={light}
                onclick={() => (light = !light)}
            >
                <Icon paths={light ? strokes.moon : strokes.sun} class="size-6" />
            </button>
            <img src={site.avatar} width="60" height="60" decoding="async" alt="" class="size-15 rounded-full" />
        </div>
        <h1 class="flex flex-col text-ui">
            <span class="font-normal">{resume.name}</span>
            <span class="ink-soft">{resume.role}</span>
            <span class="ink-muted">{resume.location}</span>
        </h1>
    </header>

    <div class="flex flex-col gap-gutter">
        <p class="lead text-body">{resume.lead}</p>
        <div class="flex flex-wrap items-center justify-between gap-x-gutter gap-y-inline text-ui">
            <nav aria-label={labels.contacts} class="flex flex-wrap gap-x-copy gap-y-inline">
                {#each resume.links as { label, href } (href)}
                    <a use:press {href} class="link-soft tap-target">{label}</a>
                {/each}
            </nav>
            <ArrowLink turn={135} class="print:hidden" onclick={() => print()}>{labels.print}</ArrowLink>
        </div>
    </div>

    <section class="flex flex-col gap-gutter" aria-label={headings.skills.title}>
        <DividerHeading {...headings.skills} />
        <dl class="flex flex-col gap-control text-ui">
            {#each resume.skills as { group, items } (group)}
                <div class="entry grid gap-inline">
                    <dt class="ink-muted">{group}</dt>
                    <dd class="ink-soft">{items}</dd>
                </div>
            {/each}
        </dl>
    </section>

    <section class="flex flex-col gap-gutter" aria-label={headings.experience.title}>
        <DividerHeading {...headings.experience} />
        {#each resume.experience as { place, role, dates, points } (place)}
            <article class="entry grid gap-inline text-ui">
                <p class="dates ink-muted">
                    <Range parts={dates} rule_class="ink-muted" />
                </p>
                <div class="flex flex-col gap-inline">
                    <h3>
                        <span class="font-normal">{place}</span><span class="rule ink-muted" aria-hidden="true"
                        ></span><span class="ink-soft">{role}</span>
                    </h3>
                    <ul class="points ink-soft flex flex-col gap-1">
                        {#each points as point (point)}<li>{point}</li>{/each}
                    </ul>
                </div>
            </article>
        {/each}
    </section>

    <section class="flex flex-col gap-gutter" aria-label={headings.projects.title}>
        <DividerHeading {...headings.projects} />
        {#each resume.projects as { name, href, label, text } (name)}
            <div class="entry grid gap-inline text-ui">
                <p class="font-normal">{name}</p>
                <div class="flex flex-col items-start gap-inline">
                    <p class="ink-soft">{text}</p>
                    <ArrowLink {href} external>{label}</ArrowLink>
                </div>
            </div>
        {/each}
    </section>

    <section class="flex flex-col gap-gutter" aria-label={headings.work.title}>
        <DividerHeading {...headings.work} />
        <ul class="flex flex-col gap-control text-ui">
            {#each resume.work as slug (slug)}
                <li class="entry grid gap-inline">
                    <span class="ink-muted">{cases[slug].client}</span>
                    <a use:press href="{site.url}/{slug}" class="link-soft tap-target w-fit">
                        {cases[slug].title}
                    </a>
                </li>
            {/each}
        </ul>
    </section>
</main>

<style>
    .lead {
        max-width: 60ch;
        text-wrap: pretty;
    }

    @media (prefers-reduced-motion: no-preference) {
        .resume {
            animation: fade var(--duration-page) var(--ease-press) both;
        }
    }

    @keyframes fade {
        from {
            opacity: 0;
        }
    }

    .entry {
        grid-template-columns: minmax(0, 1fr);
        break-inside: avoid;
    }

    .points {
        list-style: none;
    }

    .points li {
        position: relative;
        padding-left: 1.125em;
    }

    .points li::before {
        content: '';
        position: absolute;
        left: 0.05em;
        top: calc(0.5lh - 0.2em);
        width: 0.4em;
        height: 0.4em;
        background: currentColor;
        opacity: 0.5;
        -webkit-mask: var(--bullet) center / contain no-repeat;
        mask: var(--bullet) center / contain no-repeat;
    }

    .points li:nth-child(2n)::before {
        rotate: 110deg;
    }

    .points li:nth-child(3n)::before {
        rotate: 220deg;
        scale: 0.9 1;
    }

    .dates {
        display: flex;
        align-items: center;
        align-self: start;
        width: fit-content;
        white-space: nowrap;
    }

    @media (width >= 40rem) {
        .dates {
            width: auto;
        }

        .dates :global(.rule) {
            flex: 1;
        }

        .entry {
            grid-template-columns: 11rem minmax(0, 1fr);
            gap: var(--spacing-copy);
        }
    }

    @page {
        size: A4;
        margin: 0;
    }

    @media print {
        :global(:root) {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 12px;
            --spacing-row: 1.5rem;
            --spacing-gutter: 1rem;
            --spacing-control: 0.375rem;
        }

        .resume {
            min-height: 0;
            padding: 2rem 3rem;
            animation: none;
        }

        .entry {
            grid-template-columns: 10rem minmax(0, 1fr);
        }

        header {
            break-inside: avoid-page;
        }
    }
</style>
