import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { cases, gallery, selected_work } from '../src/lib/content/work.js';
import { projects } from '../src/lib/content/projects.js';

const PICTURE = /\.(webp|png|jpe?g|gif|avif)$/i;
const WIDTHS = [640, 960, 1280, 1920];
const ANIMATION_WIDTHS = [480, 960];
const PIXEL_ART = /^\/pixel_icons_pack\//;
const folders = ['projects', ...Object.keys(cases)].filter((folder) => existsSync(`static/${folder}`));
const COLOR_SAMPLE = 128;
const HUE_BINS = 12;
const COLORFUL_CHROMA = 0.03;
const hex = (value) => Math.round(value).toString(16).padStart(2, '0');

const to_linear = (value) => ((value /= 255) <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
const from_linear = (value) =>
    255 * Math.min(1, Math.max(0, value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055));

function to_oklab(red, green, blue) {
    const [r, g, b] = [red, green, blue].map(to_linear);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [
        0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ];
}

function from_oklab(lightness, a, b) {
    const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ].map(from_linear);
}

async function picture_color(file) {
    const data = await sharp(file).resize(COLOR_SAMPLE, COLOR_SAMPLE, { fit: 'fill' }).ensureAlpha().raw().toBuffer();
    const hues = Array.from({ length: HUE_BINS }, () => ({ a: 0, b: 0, count: 0 }));
    let lightness = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        const [l, a, b] = to_oklab(data[i], data[i + 1], data[i + 2]);
        lightness += l;
        count++;
        if (Math.hypot(a, b) < COLORFUL_CHROMA) continue;
        const bin = hues[Math.floor(((Math.atan2(b, a) / (2 * Math.PI) + 1) % 1) * HUE_BINS)];
        bin.a += a;
        bin.b += b;
        bin.count++;
    }
    if (!count) return null;
    const spans = hues.map((_, i) =>
        [-1, 0, 1]
            .map((offset) => hues[(i + offset + HUE_BINS) % HUE_BINS])
            .reduce((sum, bin) => ({ a: sum.a + bin.a, b: sum.b + bin.b, count: sum.count + bin.count })),
    );
    const top = spans.reduce((best, span) => (span.count > best.count ? span : best));
    const color = from_oklab(lightness / count, top.count && top.a / top.count, top.count && top.b / top.count);
    return `#${color.map(hex).join('')}`;
}

async function variants_of(src, original_width, animated) {
    const widths = (animated ? ANIMATION_WIDTHS : WIDTHS).filter((width) => width < original_width);
    const made = [];
    for (const width of widths) {
        const path = `/sizes${src.replace(/\.\w+$/, `-${width}.webp`)}`;
        const file = `static${path}`;
        made.push([path, width]);
        if (existsSync(file) && statSync(file).mtimeMs > statSync(`static${src}`).mtimeMs) continue;
        mkdirSync(file.slice(0, file.lastIndexOf('/')), { recursive: true });
        await sharp(`static${src}`, { animated })
            .resize({ width })
            .webp({ quality: animated ? 80 : 88 })
            .toFile(file);
    }
    return made;
}

const referenced = [
    ...projects.map(({ logo }) => logo.src),
    ...selected_work.map(({ cover }) => cover),
    ...gallery.flatMap(({ src, full }) => [src, full]),
];
for (const slug of Object.keys(cases)) {
    const { default: blocks } = await import(`../src/lib/content/cases/${slug}.js`);
    for (const block of blocks) referenced.push(block.image, ...(block.slider ?? []).map(({ src }) => src));
}
const missing = [...new Set(referenced.filter((src) => src && !existsSync(`static${src}`)))];
if (missing.length) {
    console.error(`Missing pictures referenced in src/lib/content:\n${missing.map((src) => `  static${src}`).join('\n')}`);
    process.exit(1);
}

const gallery_names = gallery.map(({ src }) => src.slice(src.lastIndexOf('/') + 1).replace(/\.\w+$/, ''));
const repeated = gallery_names.filter((name, i) => gallery_names.indexOf(name) !== i);
if (repeated.length) {
    console.error(`Gallery pictures need unique file names, repeated: ${[...new Set(repeated)].join(', ')}`);
    process.exit(1);
}

const animations = new Set(gallery.map(({ full }) => full).filter(Boolean));
const responsive = new Set(
    [...selected_work.map(({ cover }) => cover), ...gallery.map(({ src }) => src), ...animations].filter(
        (src) => !PIXEL_ART.test(src),
    ),
);

const entries = [];
for (const folder of folders) {
    const names = readdirSync(`static/${folder}`)
        .filter((name) => PICTURE.test(name))
        .sort();
    for (const name of names) {
        const src = `/${folder}/${name}`;
        const file = `static${src}`;
        const { width, height, pageHeight } = await sharp(file).metadata();
        const entry = { width, height: pageHeight ?? height, color: await picture_color(file) };
        if (responsive.has(src)) entry.variants = await variants_of(src, width, animations.has(src));
        entries.push(`    ${JSON.stringify(src)}: ${JSON.stringify(entry)},`);
    }
}

const kept = new Set(entries.flatMap((line) => [...line.matchAll(/"(\/sizes\/[^"]+)"/g)].map(([, path]) => path)));
if (existsSync('static/sizes')) {
    for (const file of readdirSync('static/sizes', { recursive: true })) {
        const path = `/sizes/${file.replaceAll('\\', '/')}`;
        if (PICTURE.test(path) && !kept.has(path)) rmSync(`static${path}`);
    }
}

writeFileSync('src/lib/media/manifest.js', `export const manifest = {\n${entries.join('\n')}\n};\n`);
console.log(`manifest.js: ${entries.length} pictures, ${responsive.size} with responsive variants`);
