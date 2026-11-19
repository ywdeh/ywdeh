export function mask_url(d, size) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}'><path d='${d}'/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export const css_path = (d) => `path('${d}')`;
