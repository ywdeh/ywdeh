import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import sharp from 'sharp';
import {
    work_entries,
    selected_work,
    gallery_layouts,
    gallery_pictures,
    picture_name,
} from '../../src/lib/content/work.js';
import { projects } from '../../src/lib/content/projects.js';
import { image_data, sizes } from '../../src/lib/media/image_data.js';
import { srcset_of } from '../../src/lib/media/image_source.js';

test('every public case has a component and all referenced media exists', () => {
    for (const [slug, entry] of Object.entries(work_entries)) {
        const path = `src/lib/content/cases/${slug}.svelte`;
        assert.ok(existsSync(path), slug);
        const source = readFileSync(path, 'utf8');
        const files = [...source.matchAll(/["'](\/[^"']+\.(?:webp|png|svg|gif|jpe?g|avif))["']/g)].map(
            ([, src]) => src,
        );
        for (const src of [...files, ...(entry.images ?? [])]) assert.ok(existsSync(`static${src}`), src);
    }
    for (const project of projects) {
        assert.ok(existsSync(`static${project.logo}`), project.logo);
        assert.equal(new URL(project.href).protocol, 'https:');
    }
});

test('selected work and gallery layouts contain valid, unique items', () => {
    assert.equal(new Set(selected_work.map(({ slug }) => slug)).size, selected_work.length);
    for (const item of [...selected_work, ...gallery_pictures]) {
        assert.ok(work_entries[item.slug], item.slug);
        assert.ok(image_data[item.src], item.src);
    }
    const names = gallery_pictures.map(({ src }) => picture_name(src)).sort();
    assert.equal(new Set(names).size, names.length);
    for (const rows of Object.values(gallery_layouts)) {
        assert.deepEqual(
            rows
                .flat()
                .map(({ src }) => picture_name(src))
                .sort(),
            names,
        );
    }
});

test('image manifest and responsive variants agree with the real files', async () => {
    for (const [src, [width, height]] of Object.entries(image_data)) {
        const actual = await sharp(`static${src}`).metadata();
        assert.equal(actual.width, width, src);
        assert.equal(actual.pageHeight ?? actual.height, height, src);
        for (const [path, expected_width] of sizes[src] ?? []) {
            assert.equal((await sharp(`static${path}`).metadata()).width, expected_width, path);
        }
        assert.ok(srcset_of(src).includes(`${src} ${width}w`));
    }
});
