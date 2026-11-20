import { events } from '$lib/content/events.js';

export function track(name, data) {
    if (typeof window === 'undefined') return;
    try {
        window.umami?.track(name, data);
    } catch {}
}

const label_of = (link) => (link.getAttribute('aria-label') || link.textContent || '').trim().replace(/\s+/g, ' ');

function link_event(link) {
    if (link.hasAttribute('data-track-skip')) return null;
    const href = link.getAttribute('href');
    const page = location.pathname;
    if (href.startsWith('mailto:')) return [events.contact, { method: 'email', page }];
    if (href.startsWith('tel:')) return [events.contact, { method: 'phone', page }];
    if (href.startsWith('#')) return [events.section, { id: href.slice(1), page }];
    const url = new URL(link.href, location.href);
    if (url.host !== location.host) return [events.outbound, { url: url.href, label: label_of(link), page }];
    return [events.internal, { path: url.pathname, label: label_of(link), page }];
}

export function track_links(root = document) {
    const click = (event) => {
        const link = event.target.closest?.('a[href]');
        if (!link) return;
        const found = link_event(link);
        if (found) track(...found);
    };
    root.addEventListener('click', click, { capture: true });
    return () => root.removeEventListener('click', click, { capture: true });
}
