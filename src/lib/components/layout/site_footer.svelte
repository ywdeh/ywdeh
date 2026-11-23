<script>
    import { press } from '$lib/actions/press.js';
    import { events } from '$lib/content/events.js';
    import { labels } from '$lib/content/labels.js';
    import { site } from '$lib/content/site.js';
    import { context_menu, menus } from '$lib/context_menu';
    import { link_copy } from '$lib/controllers/link_copy.svelte.js';
    import ArrowLink from '$lib/components/ui/arrow_link.svelte';
    import CopyIcon from '$lib/components/ui/copy_icon.svelte';
    import DividerStars from '$lib/components/ui/divider_stars.svelte';
    import HandLine from '$lib/components/ui/hand_line.svelte';

    const email = link_copy(() => ({
        text: site.email,
        event: [events.contact, { method: 'email copy', page: location.pathname }],
    }));


    $effect(() => () => email.destroy());
</script>

<div class="flex flex-col gap-row">
    <div class="flex flex-col gap-inline text-title">
        <p>{site.call_to_action}</p>
        <div class="flex flex-col gap-copy md:flex-row md:items-center md:justify-between">
            <ArrowLink
                menu={menus.email()}
                aria-label={email.copied ? labels.email_copied : labels.copy_email(site.email)}
                onclick={email.copy}
                class="w-fit"
            >
                {#snippet glyph()}<CopyIcon swapped={email.copied} class="size-6" />{/snippet}
                <span class="email" class:copied={email.copied}>
                    <span class="address">{site.email}</span>
                    <span class="done" aria-hidden="true">{labels.copied}</span>
                </span>
            </ArrowLink>
            <ArrowLink href={site.resume} external class="w-fit">{site.resume_label}</ArrowLink>
        </div>
    </div>

    <div class="relative overflow-x-clip">
        <HandLine />
        <DividerStars layout="footer_start" />
        <DividerStars layout="footer_end" />
    </div>

    <footer id={site.contact.id} class="flex flex-col items-start gap-control text-ui">
        <p class="ink-faint">{site.signature}</p>
        <nav aria-label={labels.socials} class="flex flex-wrap items-center gap-x-copy gap-y-inline">
            {#each site.socials as social (social.href)}
                <a
                    use:press
                    use:context_menu={menus.link(social)}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link-quiet tap-target">{social.label}</a
                >
            {/each}
        </nav>
    </footer>
</div>

<style>
    .email {
        display: inline-grid;
    }

    .address,
    .done {
        grid-area: 1 / 1;
    }

    .done {
        justify-self: start;
        opacity: 0;
        translate: 0 0.375rem;
    }

    .copied .address {
        opacity: var(--tone-faint);
        filter: blur(var(--blur-copied));
    }

    .copied .done {
        opacity: 1;
        translate: 0 0;
    }

    @media (prefers-reduced-motion: no-preference) {
        .address,
        .done {
            transition:
                opacity var(--duration-quick) var(--ease-out),
                filter var(--duration-quick) var(--ease-out),
                translate var(--duration-quick) var(--ease-out);
        }
    }
</style>
