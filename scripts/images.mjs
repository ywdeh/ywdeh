import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { cases, gallery, selected_work } from '../src/lib/content/work.js';
import { projects } from '../src/lib/content/projects.js';

const PICTURE = /\.(webp|png|jpe?g|gif|avif)$/i;
const WIDTHS = [640, 960, 1280, 1920];
const ANIMATION_WIDTHS = [480, 960];
const PIXEL_ART = /^\/pixel_icons_pack\//;
const folders = ['projects', ...Object.keys(cases)].filter((folder) => existsSync(`static/${folder}`));
const hex = (value) => Math.round(value).toString(16).padStart(2, '0');

async function average_color(file) {
    const data = await sharp(file).resize(32, 32, { fit: 'fill' }).ensureAlpha().raw().toBuffer();
    let red = 0;
    let green = 0;
    let blue = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        red += data[i];
        green += data[i + 1];
        blue += data[i + 2];
        count++;
    }
    return count ? `#${hex(red / count)}${hex(green / count)}${hex(blue / count)}` : null;
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
        const entry = { width, height: pageHeight ?? height, color: await average_color(file) };
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
