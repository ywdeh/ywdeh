const modules = import.meta.glob('../content/cases/*.js', { import: 'default' });
const loading = new Map();
const loaded = new Map();

export const loaded_case = (slug) => loaded.get(slug);

export function load_case(slug) {
    const load = modules[`../content/cases/${slug}.js`];
    if (!load) return Promise.reject(new Error(`Unknown case: ${slug}`));
    if (!loading.has(slug)) {
        loading.set(
            slug,
            load().then(
                (blocks) => {
                    loaded.set(slug, blocks);
                    return blocks;
                },
                (error) => {
                    loading.delete(slug);
                    throw error;
                },
            ),
        );
    }
    return loading.get(slug);
}

export async function load_all_cases() {
    const slugs = Object.keys(modules).map((path) => path.slice(path.lastIndexOf('/') + 1, -3));
    await Promise.all(slugs.map(load_case));
}
