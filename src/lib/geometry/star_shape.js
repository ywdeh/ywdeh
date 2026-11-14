export const star_shapes = [
    'M11 1C12.5 1 12.6 7.5 15.2 8.8C17 10.2 24.2 10.7 24.2 12C24.2 13.1 17.6 12.7 16.2 15C14.7 17.4 16.1 22.3 14.8 23C13.4 23.7 12.1 17 10 15.4C8.1 13.9 1.4 13.1 1.4 12C1.4 10.9 7.2 10.3 8.8 8C10.4 5.8 9.9 1.2 11 1Z',
    'M33.6 4.4C34.7 4.1 34 8.2 35.5 9.6C36.6 10.5 39.1 10.5 39 12C38.8 12.8 35.5 12.3 34.5 13.6C33.4 15 33.8 18.4 32.8 18.3C31.8 18.3 32.1 14.8 30.7 13.6C29.4 12.4 26.8 12.3 27 12C27.1 11.1 30.6 10.4 31.5 9C32.5 7.6 32.6 4.6 33.6 4.4Z',
];
export function redraw(d, seed) {
    let n = seed;
    const random = () => (n = (n * 9301 + 49297) % 233280) / 233280;
    return d.replace(/-?\d*\.?\d+/g, (number) => (parseFloat(number) + (random() - 0.5) * 1.3).toFixed(2));
}
export function stretch_tips(drawing, amount) {
    if (Math.abs(amount) < 0.01) return drawing;
    const pairs = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g;
    const points = Array.from(drawing.matchAll(pairs), ([, x, y]) => [Number(x), Number(y)]);
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const left = Math.min(...xs);
    const right = Math.max(...xs);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    const tip = amount < 0 ? left : right;
    const tip_width = (right - left) * 0.35;
    const tip_height = (bottom - top) * 0.25;
    return drawing.replace(pairs, (pair, x, y) => {
        const px = Number(x);
        const py = Number(y);
        const side = Math.max(0, 1 - Math.abs(px - tip) / tip_width) * Math.max(0, 1 - Math.abs(py - 12) / 7);
        const vertical = Math.max(0, 1 - Math.min(py - top, bottom - py) / tip_height);
        const weight = Math.max(side, vertical * 0.8);
        return weight ? `${(px + amount * weight).toFixed(2)} ${y}` : pair;
    });
}
