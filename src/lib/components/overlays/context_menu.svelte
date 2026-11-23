<script>
    import { fly, slide } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { innerHeight, innerWidth } from 'svelte/reactivity/window';
    import { press } from '$lib/actions/press.js';
    import { track } from '$lib/analytics/track.js';
    import { events } from '$lib/content/events.js';
    import { labels } from '$lib/content/labels.js';
    import { site } from '$lib/content/site.js';
    import { close_menu, copy_text, menu, pass_to_native, tint_shown } from '$lib/controllers/context_menu.svelte.js';
    import { strokes } from '$lib/geometry/strokes.js';
    import { motion_ms, token_ms } from '$lib/motion/timing.js';
    import CopyIcon from '$lib/components/ui/copy_icon.svelte';
    import Icon from '$lib/components/ui/icon.svelte';
    import MailIcon from '$lib/components/ui/mail_icon.svelte';

    const EDGE = 16;
    const NEAR = 24;
    const SCROLL_SLACK = 160;    const ITEMS = '[role="menuitem"]';

    let el = $state();
    let width = $state(0);
    let height = $state(0);
    let origin = $state({ x: 0, y: 0 });
    let socials_open = $state(false);
    let copied = $state(null);
    let copied_timer;
    $effect(() => () => clearTimeout(copied_timer));
    let drift = $state({ x: 0, y: 0 });

    const fit = (value, max) => Math.max(EDGE, Math.min(value, max));
    const left = $derived(fit(origin.x + drift.x, (innerWidth.current ?? 0) - EDGE - width));
    const top = $derived(fit(origin.y + drift.y, (innerHeight.current ?? 0) - EDGE - height));
    const copy_rank = (entry) => (entry.track === 'email' ? 1 : 0);
    const entries = $derived(menu.groups.flat());
    const actions = $derived(entries.filter((entry) => !entry.copy));
    const copies = $derived(entries.filter((entry) => entry.copy).sort((a, b) => copy_rank(a) - copy_rank(b)));

    const pace = (name) => ({ duration: motion_ms(name), easing: cubicOut });

    $effect.pre(() => {
        void menu.id;
        socials_open = false;
        copied = null;
        drift = { x: 0, y: 0 };
        origin = { x: menu.x, y: menu.y };
    });

    $effect(() => {
        void menu.id;
        if (!menu.open || !el) return;
        const bounds = el.getBoundingClientRect();
        origin = {
            x: menu.x + bounds.width > innerWidth.current - EDGE ? menu.x - bounds.width : menu.x,
            y: menu.y + bounds.height > innerHeight.current - EDGE ? menu.y - bounds.height : menu.y,
        };
        el.focus({ preventScroll: true });
    });

    $effect(() => {
        if (!menu.open) return;
        addEventListener('scroll', scrolled, true);
        document.addEventListener('visibilitychange', close_menu);
        return () => {
            removeEventListener('scroll', scrolled, true);
            document.removeEventListener('visibilitychange', close_menu);
            if (!el?.contains(document.activeElement)) return;
            if (menu.return_to?.isConnected) menu.return_to.focus({ preventScroll: true });
            else document.activeElement.blur();
        };
    });

    $effect(() => {
        if (!menu.open || !menu.held) return;
        const block = (event) => event.preventDefault();
        const release = (event) => {
            event.preventDefault();
            menu.held = false;
        };
        addEventListener('touchmove', block, { capture: true, passive: false });
        addEventListener('touchend', release, { capture: true, passive: false });
        addEventListener('touchcancel', release, { capture: true, passive: false });
        return () => {
            removeEventListener('touchmove', block, true);
            removeEventListener('touchend', release, true);
            removeEventListener('touchcancel', release, true);
        };
    });

    function scrolled(event) {
        if (menu.held || el?.contains(event.target) || !menu.anchor?.isConnected) return;
        const box = menu.anchor.getBoundingClientRect();
        const next = { x: box.left - menu.anchor_at.x, y: box.top - menu.anchor_at.y };
        if (Math.hypot(next.x, next.y) > SCROLL_SLACK) return close_menu();
        drift = next;
    }

    function run(entry) {
        close_menu();
        entry.run();
    }

    async function copy(entry, key) {
        if (!(await copy_text(entry.copy))) return;
        track(events.menu_copy, { what: entry.track ?? 'link', page: location.pathname });
        copied = key;
        clearTimeout(copied_timer);
        copied_timer = setTimeout(() => copied === key && (copied = null), token_ms('--duration-confirm'));
    }

    const leave = () => setTimeout(close_menu);

    function swallow(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const secondary = (event) => event.button === 2 || (event.button === 0 && event.ctrlKey && /Mac/.test(navigator.userAgent));

    function near_menu({ clientX: x, clientY: y }) {
        if (!el) return false;
        const box = el.getBoundingClientRect();
        const dx = Math.max(box.left - x, 0, x - box.right);
        const dy = Math.max(box.top - y, 0, y - box.bottom);
        return Math.hypot(dx, dy) <= NEAR;
    }

    function outside(event) {
        if (menu.open && event.pointerType === 'mouse' && secondary(event) && near_menu(event)) return pass_to_native();
        if (!menu.open || !el || el.contains(event.target)) return;
        close_menu();
        if (event.button !== 0) return;
        addEventListener('click', swallow, { capture: true, once: true });
        addEventListener('pointerdown', () => removeEventListener('click', swallow, true), {
            capture: true,
            once: true,
        });
    }

    function toggle_socials(open = !socials_open) {
        socials_open = open;
    }

    function keys(event) {
        if (!menu.open || !el) return;
        if (event.key === 'Escape' || event.key === 'Tab') {
            event.preventDefault();
            event.stopPropagation();
            return close_menu();
        }
        const toggle = event.target.closest?.('[aria-expanded]');
        if (event.key === 'ArrowRight' && toggle) return toggle_socials(true);
        if (event.key === 'ArrowLeft' && socials_open) {
            toggle_socials(false);
            return el.querySelector('[aria-expanded]')?.focus();
        }
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        const items = [...el.querySelectorAll(ITEMS)];
        const index = items.indexOf(document.activeElement);
        const next = event.key === 'ArrowDown' ? index + 1 : index < 0 ? -1 : index - 1;
        items.at(next % items.length)?.focus();
    }
</script>

<svelte:window
    onpointerdown={outside}
    onkeydowncapture={keys}
    onresize={close_menu}
    onblur={close_menu}
    onpopstate={close_menu}
/>

{#snippet entry_row(entry, key)}
    {#if entry.href}
        <a
            use:press class="item icon-host own_outline"
            role="menuitem"
            href={entry.href}
            target={entry.href.startsWith('mailto:') ? undefined : '_blank'}
            rel="noopener noreferrer"
            onclick={leave}
        >
            <span class="label">{entry.label}</span>
            {#if !entry.bare}
                <Icon paths={entry.icon ?? strokes.arrow} motion={entry.icon ? 'trim' : 'nudge'} class="size-6" />
            {/if}
        </a>
    {:else if entry.copy}
        {@const done = copied === key}
        <button type="button" use:press class="item icon-host own_outline" class:done role="menuitem" onclick={() => copy(entry, key)}>
            <span class="label swap">
                <span class="face" aria-hidden={done}>{entry.label}</span>
                <span class="face" aria-hidden={!done}>{labels.menu.copied}</span>
            </span>
            {#if entry.track === 'email'}
                <MailIcon open={done} class="size-6" />
            {:else}
                <CopyIcon swapped={done} class="size-6" />
            {/if}
        </button>
    {:else}
        <button type="button" use:press class="item icon-host own_outline" role="menuitem" onclick={() => run(entry)}>
            <span class="label">{entry.label}</span>
            {#if entry.icon}
                <Icon paths={entry.icon} motion={entry.icon === strokes.arrow ? 'nudge' : 'trim'} class="size-6" />
            {/if}
        </button>
    {/if}
{/snippet}

{#if menu.open}
    {#key menu.id}
        <div
            class="menu tinted text-ui"
            class:plain={!menu.tint}
            class:lit={tint_shown()}
            style:--tint={menu.tint || undefined}
            role="menu"
            tabindex="-1"
            bind:this={el}
            bind:offsetWidth={width}
            bind:offsetHeight={height}
            style:left="{left}px"
            style:top="{top}px"
            onpointerenter={() => (menu.engaged = true)}
            onpointerleave={(event) => event.pointerType === 'mouse' && (menu.engaged = false)}
            onfocusin={(event) => event.target.matches(':focus-visible') && (menu.engaged = true)}
            transition:fly|global={{ y: -4, ...pace('--duration-pop') }}
        >
            {#each actions as entry, line (line)}
                {@render entry_row(entry, `action.${line}`)}
            {/each}

            {#if actions.length}<span class="gap" role="separator"></span>{/if}
            <button
                type="button"
                use:press class="item icon-host own_outline"
                role="menuitem"
                aria-haspopup="true"
                aria-expanded={socials_open}
                onclick={() => toggle_socials()}
            >
                <span class="label">{labels.menu.socials}</span>
                <span class="chevron" class:open={socials_open}><Icon paths={strokes.chevron} class="size-6" /></span>
            </button>
            {#if socials_open}
                <div class="socials" role="group" aria-label={labels.socials} transition:slide={pace('--duration-quick')}>
                    {#each site.socials as social (social.href)}
                        {@render entry_row({ label: social.label, href: social.href, bare: true }, social.href)}
                    {/each}
                </div>
            {/if}

            {#each copies as entry, line (line)}
                {@render entry_row(entry, `copy.${line}`)}
            {/each}
        </div>
    {/key}
{/if}

<style>
    .menu {
        --menu-width: 13.5rem;
        --menu-pad: 0.375rem;
        --menu-row: 2.5rem;
        --menu-radius: calc(var(--radius-card) - var(--menu-pad));
        position: fixed;
        z-index: var(--layer-menu);
        display: grid;
        min-width: var(--menu-width);
        padding: var(--menu-pad);
        border-radius: var(--radius-card);
        color: var(--color-ink);
        -webkit-touch-callout: none;
        user-select: none;
    }

    .menu::before,
    .menu::after {
        content: '';
        position: absolute;
        z-index: var(--level-below);
        pointer-events: none;
    }

    .menu::before {
        inset: 0;
        border-radius: var(--radius-card);
        background:
            linear-gradient(var(--color-focus) 0 0),
            var(--color-surface);
    }

    .menu::after {
        inset: 0;
        border-radius: var(--radius-card);
        background: var(--tint-plate);
        opacity: 0;
    }

    .menu.lit {
        color: var(--tint-ink);
    }

    .menu.lit::after {
        opacity: 1;
    }

    .menu.plain {
        --tint-glow: var(--color-focus);
    }

    .menu.plain::after {
        display: none;
    }

    .menu:focus {
        outline: none;
    }

    .item {
        --icon-duration: var(--duration-hint);
        --icon-ease: var(--ease-out);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-control);
        height: var(--menu-row);
        padding-inline: var(--spacing-control) var(--spacing-inline);
        border-radius: var(--menu-radius);
        text-align: left;
        white-space: nowrap;
        opacity: var(--tone-soft);
        clip-path: inset(0 round var(--menu-radius));
    }

    .lit > .item {
        opacity: 1;
    }

    .item:focus-visible,
    .item.done {
        opacity: 1;
        background: var(--tint-glow);
    }

    @media (hover: hover) {
        .item:hover {
            opacity: 1;
            background: var(--tint-glow);
        }
    }

    .item:is(:active, :global(.is_pressed)) {
        clip-path: inset(var(--outline-press) round var(--menu-radius));
    }

    .label {
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .swap {
        display: grid;
        overflow: visible;
    }

    .face {
        grid-area: 1 / 1;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .face + .face,
    .done .face:first-child {
        opacity: 0;
        translate: 0 0.375rem;
    }

    .done .face:first-child {
        translate: 0 -0.375rem;
    }

    .done .face + .face {
        opacity: 1;
        translate: 0 0;
    }

    .chevron {
        display: flex;
    }

    .chevron.open {
        rotate: 90deg;
    }

    .socials {
        display: grid;
        overflow: hidden;
    }

    .gap {
        height: var(--stroke);
        margin: var(--menu-pad) var(--spacing-control);
        border-radius: var(--stroke);
        background: currentColor;
        opacity: var(--tone-line);
    }

    @media (prefers-reduced-motion: no-preference) {
        .menu {
            transition: color var(--duration-press);
        }

        .menu::after {
            transition: opacity var(--duration-press) var(--ease-press);
        }

        .item {
            transition:
                opacity var(--duration-press) var(--ease-out),
                background-color var(--duration-press) var(--ease-out),
                clip-path var(--duration-press) var(--ease-press);
        }

        .chevron {
            transition: rotate var(--duration-quick) var(--ease-press);
        }

        .face {
            transition:
                opacity var(--duration-quick) var(--ease-out),
                translate var(--duration-quick) var(--ease-out);
        }
    }
</style>

