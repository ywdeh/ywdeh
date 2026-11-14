import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { selected_work, gallery_pictures, work_entries } from '../src/lib/content/work.js';
const FOLDERS = ['projects', ...Object.keys(work_entries).filter((slug) => existsSync(`static/${slug}`))];
const PICTURE = /\.(webp|png|jpe?g|gif|avif)$/i;
const WIDTHS = [640, 960, 1280, 1920];
const ANIMATION_WIDTHS = [480, 960];
const PIXEL_ART = /iconsvol/;
const hex = (value) => Math.round(value).toString(16).padStart(2, '0');
const lines = [];
const known = {};
for (const folder of FOLDERS) {
    for (const name of readdirSync(`static/${folder}`)
        .filter((file) => PICTURE.test(file))
        .sort()) {
        const file = `static/${folder}/${name}`;
        const { width, height, pageHeight } = await sharp(file).metadata();
        const { data } = await sharp(file)
            .resize(32, 32, { fit: 'fill' })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });
        let red = 0,
            green = 0,
            blue = 0,
            count = 0;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] === 0) continue;
            red += data[i];
            green += data[i + 1];
            blue += data[i + 2];
            count++;
        }
        const color = count ? `#${hex(red / count)}${hex(green / count)}${hex(blue / count)}` : null;
        known[`/${folder}/${name}`] = width;
        lines.push(
            `    '/${folder}/${name}': [${width}, ${pageHeight ?? height}, ${color ? `'${color}'` : 'null'}],`,
        );
    }
}
const animations = gallery_pictures.map(({ full_src }) => full_src).filter(Boolean);
const card_pictures = [
    ...new Set([
        ...selected_work.map(({ src }) => src),
        ...gallery_pictures.map(({ src }) => src),
        ...animations,
    ]),
].filter((src) => !PIXEL_ART.test(src));
const size_lines = [];
for (const src of card_pictures) {
    const original = `static${src}`;
    const animated = animations.includes(src);
    const widths = (animated ? ANIMATION_WIDTHS : WIDTHS).filter((width) => width < known[src]);
    const made = [];
    for (const width of widths) {
        const path = `/sizes${src.replace(/\.\w+$/, `-${width}.webp`)}`;
        made.push(`['${path}', ${width}]`);
        const file = `static${path}`;
        if (existsSync(file) && statSync(file).mtimeMs > statSync(original).mtimeMs) continue;
        mkdirSync(file.slice(0, file.lastIndexOf('/')), { recursive: true });
        await sharp(original, { animated })
            .resize({ width })
            .webp({ quality: animated ? 80 : 88 })
            .toFile(file);
    }
    size_lines.push(`    '${src}': [${made.join(', ')}],`);
}
writeFileSync(
    'src/lib/media/image_data.js',
    `export const image_data = {
${lines.join('\n')}
};

export const sizes = {
${size_lines.join('\n')}
};

`,
);
console.log(`image_data.js: ${lines.length} pictures, ${card_pictures.length} with extra sizes`);
