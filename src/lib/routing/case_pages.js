const pages = import.meta.glob('../content/cases/*.svelte');
const loaded = new Map();
export function case_page(slug) {
    const loader = pages[`../content/cases/${slug}.svelte`];
    if (!loader) return Promise.reject(new Error('Unknown case'));
    if (!loaded.has(slug)) {
        loaded.set(
            slug,
            loader().catch((error) => {
                loaded.delete(slug);
                throw error;
            }),
        );
    }
    return loaded.get(slug);
}
