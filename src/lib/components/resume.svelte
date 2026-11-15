<script>
    import { press } from '$lib/actions/press.js';
    import { strokes } from '$lib/geometry/strokes.js';
    import { cases } from '$lib/content/work.js';
    import { resume } from '$lib/content/resume.js';
    import { site } from '$lib/content/site.js';
    import ArrowLink from '$lib/components/ui/arrow_link.svelte';
    import DividerStars from '$lib/components/ui/divider_stars.svelte';
    import HandLine from '$lib/components/ui/hand_line.svelte';

    let light = $state(false);

    $effect(() => {
        const root = document.documentElement;
        if (light) root.dataset.theme = 'light';
        else delete root.dataset.theme;
        return () => delete root.dataset.theme;
    });
</script>

{#snippet rule()}
    <span class="rule" aria-hidden="true"></span>
{/snippet}

{#snippet heading(title, stars)}
    <div class="flex items-center justify-between gap-copy text-title">
        <h2 class="whitespace-nowrap">{title}</h2>
        <div class="relative min-w-0 flex-1 overflow-x-clip">
            <HandLine />
            <div class="absolute inset-0"><DividerStars layout={stars} /></div>
        </div>
    </div>
{/snippet}

<main class="resume flex min-h-dvh w-full flex-col gap-row px-page-x py-page-y">
    <header class="flex flex-row-reverse justify-between gap-copy md:flex-col">
        <div
            class="flex items-center gap-copy self-start md:flex-row-reverse md:justify-between md:self-auto"
        >
            <button
                use:press
                type="button"
                class="theme_toggle link-soft tap-target print:hidden"
                aria-label={light ? 'dark version' : 'light version'}
                aria-pressed={light}
                onclick={() => (light = !light)}
            >
                <svg
                    class="size-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    {#each light ? strokes.moon : strokes.sun as d, index (d)}<path
                            {d}
                            pathLength="1"
                            class:body={index === 0}
                        />{/each}
                </svg>
            </button>
            <img
                src={site.avatar}
                width="60"
                height="60"
                decoding="async"
                alt=""
                class="size-15 rounded-full"
            />
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
            <nav aria-label="Contacts" class="flex flex-wrap gap-x-copy gap-y-inline">
                {#each resume.links as { label, href } (href)}
                    <a use:press {href} class="link-soft tap-target">{label}</a>
                {/each}
            </nav>
            <button
                use:press
                type="button"
                class="download link-soft tap-target flex items-center gap-inline print:hidden"
                onclick={() => print()}
            >
                download as pdf
                <svg
                    class="size-6 shrink-0 rotate-135"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    aria-hidden="true"
                >
                    {#each strokes.arrow as d (d)}<path {d} pathLength="1" />{/each}
                </svg>
            </button>
        </div>
    </div>

    <section class="flex flex-col gap-gutter" aria-label="skills">
        {@render heading('skills', 'personal-projects')}
        <dl class="flex flex-col gap-control text-ui">
            {#each resume.skills as { group, items } (group)}
                <div class="entry grid gap-inline">
                    <dt class="ink-muted">{group}</dt>
                    <dd class="ink-soft">{items}</dd>
                </div>
            {/each}
        </dl>
    </section>

    <section class="flex flex-col gap-gutter" aria-label="experience">
        {@render heading('experience', 'case-studies')}
        {#each resume.experience as { place, role, dates, points } (place)}
            <article class="entry grid gap-inline text-ui">
                <p class="dates ink-muted">
                    {dates[0]}{@render rule()}<span class="sr-only">to</span>{dates[1]}
                </p>
                <div class="flex flex-col gap-inline">
                    <h3>
                        <span class="font-normal">{place}</span>{@render rule()}<span class="ink-soft"
                            >{role}</span
                        >
                    </h3>
                    <ul class="points ink-soft flex flex-col gap-1">
                        {#each points as point (point)}<li>{point}</li>{/each}
                    </ul>
                </div>
            </article>
        {/each}
    </section>

    <section class="flex flex-col gap-gutter" aria-label="personal projects">
        {@render heading('personal projects', 'gallery')}
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

    <section class="flex flex-col gap-gutter" aria-label="selected work">
        {@render heading('selected work on site', 'footer_end')}
        <ul class="flex flex-col gap-control text-ui">
            {#each resume.work as slug (slug)}
                <li class="entry grid gap-inline">
                    <span class="ink-muted">{cases[slug].client}</span>
                    <a use:press href="https://hedwy.art/{slug}" class="link-soft tap-target w-fit">
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
        mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M5.3 1.4C7.6 1.2 9 3.1 8.7 5.3C8.5 7.4 6.6 8.8 4.6 8.6C2.5 8.4 1.2 6.9 1.4 4.8C1.6 2.9 3.2 1.6 5.3 1.4Z'/%3E%3C/svg%3E")
            center / contain no-repeat;
    }

    .points li:nth-child(2n)::before {
        rotate: 110deg;
    }

    .points li:nth-child(3n)::before {
        rotate: 220deg;
        scale: 0.9 1;
    }

    .rule {
        display: inline-block;
        width: 0.5em;
        height: 2px;
        margin-inline: 0.5em;
        vertical-align: middle;
        background: currentColor;
        opacity: 0.4;
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

        .dates .rule {
            flex: 1;
        }

        .entry {
            grid-template-columns: 11rem minmax(0, 1fr);
            gap: var(--spacing-copy);
        }
    }

    .download path {
        stroke-dasharray: 1 1;
    }

    @media (prefers-reduced-motion: no-preference) {
        .download path {
            transition:
                stroke-dasharray 120ms var(--ease-out),
                translate 120ms var(--ease-out);
        }

        @media (hover: hover) and (pointer: fine) {
            .download:hover path {
                stroke-dasharray: 0.8 1;
                translate: -1.06px 1.06px;
            }
        }

        .download:is(:active, :global(.is_pressed)) path {
            stroke-dasharray: 0.6 1;
            translate: -2.12px 2.12px;
        }
    }

    .theme_toggle path {
        stroke-dasharray: 1 1;
        stroke-dashoffset: 0;
        transform-box: fill-box;
        transform-origin: center;
    }

    .theme_toggle .body {
        stroke-dasharray: none;
    }

    @media (prefers-reduced-motion: no-preference) {
        .theme_toggle path {
            transition:
                stroke-dasharray var(--duration-press) var(--ease-press),
                stroke-dashoffset var(--duration-press) var(--ease-press),
                scale var(--duration-press) var(--ease-press);
        }

        @media (hover: hover) and (pointer: fine) {
            .theme_toggle:hover path {
                stroke-dasharray: 0.8 1;
                stroke-dashoffset: -0.1;
            }

            .theme_toggle:hover .body {
                stroke-dasharray: none;
                scale: 0.92;
            }
        }

        .theme_toggle:is(:active, :global(.is_pressed)) path {
            stroke-dasharray: 0.6 1;
            stroke-dashoffset: -0.2;
        }

        .theme_toggle:is(:active, :global(.is_pressed)) .body {
            stroke-dasharray: none;
            scale: 0.84;
        }
    }

    @media (prefers-reduced-motion: no-preference) {
        :global(:root) {
            transition-property:
                --color-surface, --color-ink, --project-ink, --tone-soft, --tone-muted, --tone-faint,
                --tone-line, font-weight;
            transition-duration: 600ms;
            transition-timing-function: var(--ease-press);
        }
    }

    :global(:root[data-theme='light']) {
        --color-surface: oklch(98.5% 0.002 325.6);
        --color-ink: oklch(20.5% 0 0);
        --project-ink: oklch(20.5% 0 0);
        --tone-soft: 0.75;
        --tone-muted: 0.55;
        --tone-faint: 0.45;
        --tone-line: 0.16;
        font-weight: 350;
    }

    :global(:root[data-theme='light']) .resume :global(.font-normal) {
        font-weight: 450;
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
        }

        .entry {
            grid-template-columns: 10rem minmax(0, 1fr);
        }

        header {
            break-inside: avoid-page;
        }
    }
</style>
