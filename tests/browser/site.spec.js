import { test, expect } from '@playwright/test';
import { selected_work } from '../../src/lib/content/work.js';

const page_errors = new WeakMap();

test.beforeEach(async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page_errors.set(page, errors);
});

test.afterEach(async ({ page }) => {
    expect(page_errors.get(page)).toEqual([]);
});

test('homepage keeps project geometry and renders gallery only once', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.site_content')).toHaveCSS('opacity', '1');
    await expect(page.locator('.project_entry')).toHaveCount(2);
    await expect(page.locator('.gallery_item')).toHaveCount(8);
    await expect(page.locator('.project_logo').first()).toHaveCSS('height', '32px');
    await expect(page.locator('.project_logo').last()).toHaveCSS('height', '48px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const tops = await page
        .locator('.project_description')
        .evaluateAll((items) => items.map((node) => node.getBoundingClientRect().top));
    if (
        await page
            .locator('.project_entry')
            .evaluateAll(
                (items) =>
                    Math.abs(items[0].getBoundingClientRect().top - items[1].getBoundingClientRect().top) < 2,
            )
    ) {
        expect(Math.abs(tops[0] - tops[1])).toBeLessThan(1);
    }
});

test('case, slider, zoom and browser history work together', async ({ page }) => {
    await page.goto('/');
    await page.locator('#case-studies').scrollIntoViewIfNeeded();
    await page.locator('figure button').filter({ hasText: 'hud elements redesign concept' }).click();
    await expect(page).toHaveURL(/\/palia_concept$/);
    const panel = page.locator('.panel');
    await expect(panel).toBeVisible();
    await panel.getByRole('button', { name: 'Show image 2', exact: true }).click();
    await expect(panel.getByRole('button', { name: 'Show image 2', exact: true })).toHaveAttribute(
        'aria-current',
        'true',
    );
    await panel.getByRole('button', { name: 'Enlarge current image' }).click();
    await expect(page.getByRole('button', { name: 'Close image', exact: true })).toBeVisible();
    const viewport = page.locator('.gallery_image_viewport');
    const image = viewport.locator('img');
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
    const box = await image.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -240);
    await expect
        .poll(() =>
            viewport.locator('.gallery_image_layer').evaluate((node) => getComputedStyle(node).transform),
        )
        .not.toBe('matrix(1, 0, 0, 1, 0, 0)');
    await page.getByRole('button', { name: 'Close image', exact: true }).click();
    await expect(viewport).toHaveCount(0);
    await expect(panel).toBeVisible();
    await page.goBack();
    await expect(viewport).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(viewport).toHaveCount(0);
    await page.getByRole('button', { name: 'Close case study', exact: true }).click();
    await expect(panel).toHaveCount(0);
    expect(await page.evaluate(() => document.activeElement?.matches('.card_trigger'))).toBe(false);
});

test('direct picture links select the right slide and close back into the case', async ({ page }) => {
    await page.goto('/palia_concept/palia_quest_log');
    await expect(page.locator('.gallery_image_viewport img')).toHaveAttribute(
        'data-src',
        '/palia_concept/palia_quest_log.webp',
    );
    await page.getByRole('button', { name: 'Close image', exact: true }).click();
    await expect(page.locator('.panel')).toBeVisible();
    await expect(
        page.locator('.panel').getByRole('button', { name: 'Show image 2', exact: true }),
    ).toHaveAttribute('aria-current', 'true');
});

test('gallery opens a single image layer and outside click closes it', async ({ page }) => {
    await page.goto('/gallery/sq');
    await expect(page.locator('.gallery_image_viewport img')).toBeVisible();
    await expect(page.locator('.overlay_root')).toHaveCount(1);
    await page.mouse.click(3, 3);
    await expect(page.locator('.overlay_root')).toHaveCount(0);
});

test('normal intro completes without external animation scripts', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.route('**/cdn.jsdelivr.net/**', (route) => route.abort());
    await page.goto('/');
    await expect(page.locator('.site_content')).toHaveCSS('opacity', '1', { timeout: 12000 });
    await expect(page.locator('.site_content')).not.toHaveAttribute('inert', '');
});

test('project links retain tint, fold and new-tab behavior', async ({ page, isMobile }) => {
    await page.goto('/');
    const card = page.locator('.project_entry').first();
    const link = card.locator('a').first();
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    if (!isMobile) {
        const initial = await card.locator('.project_outline path').getAttribute('d');
        await link.hover();
        await expect(card).toHaveClass(/link_hovered/);
        await expect.poll(() => card.locator('.project_outline path').getAttribute('d')).not.toBe(initial);
    }
});

test('animated image flight returns its source and removes the temporary image', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/palia_concept');
    const panel = page.locator('.panel');
    await expect(panel).toBeVisible({ timeout: 12000 });
    const source = panel.locator('.gallery_track img').first();
    await expect.poll(() => source.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
    await panel.getByRole('button', { name: 'Enlarge current image' }).click();
    await expect(page.locator('.gallery_image_viewport img')).toBeVisible();
    await page.getByRole('button', { name: 'Close image', exact: true }).click();
    await expect(page.locator('.gallery_image_viewport')).toHaveCount(0);
    await expect(source).toBeVisible();
    await expect(source).not.toHaveCSS('visibility', 'hidden');
    await expect(page.locator('body > img')).toHaveCount(0);
});

test('slider preview outline moves with its picture and main image has none', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/palia_concept');
    const panel = page.locator('.panel');
    await expect(panel).toBeVisible({ timeout: 12000 });
    const thumbnail = panel.getByRole('button', { name: 'Show image 2', exact: true });
    await thumbnail.click();
    await thumbnail.dispatchEvent('pointerenter', { pointerType: 'mouse' });
    await expect
        .poll(() => thumbnail.evaluate((node) => getComputedStyle(node, '::before').inset))
        .toBe('-4px');
    await thumbnail.evaluate((node) => node.classList.add('is_pressed'));
    await expect
        .poll(() => thumbnail.evaluate((node) => getComputedStyle(node, '::before').inset))
        .toBe('2px');
    await expect(thumbnail.locator('img')).toHaveCSS('padding', '6px');
    const main = panel.locator('.gallery_viewport');
    expect(await main.evaluate((node) => getComputedStyle(node, '::before').content)).toBe('none');
});

test('stars drag within the divider and only one hover badge is visible', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse-specific interaction');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await expect(page.locator('.site_content')).toHaveCSS('opacity', '1', { timeout: 12000 });
    const star = page.locator('.category_stars .divider_star').first();
    await star.scrollIntoViewIfNeeded();
    const box = await star.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 180, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
    await expect.poll(async () => (await star.boundingBox()).x).toBeLessThan(box.x - 80);
    const cards = page.locator('.category_grid > figure');
    await cards.nth(0).hover();
    await expect(page.locator('.card_badge.shown')).toHaveCount(1);
    await cards.nth(1).hover();
    await expect(page.locator('.card_badge.shown')).toHaveCount(1);
});

test('all selected-work routes open with their homepage underneath', async ({ page }) => {
    for (const { slug } of selected_work) {
        await page.goto(`/${slug}`);
        await expect(page.locator('.panel')).toBeVisible();
        await expect(page.locator('.project_entry')).toHaveCount(2);
        const image = page.locator('.panel .case_body img').first();
        await expect(image).toBeAttached();
        await expect.poll(() => image.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
        await page.getByRole('button', { name: 'Close case study', exact: true }).click();
        await expect(page.locator('.panel')).toHaveCount(0);
    }
});

test('unknown image URLs show the existing error page', async ({ page }) => {
    const response = await page.goto('/palia_concept/missing_picture');
    expect(response.status()).toBe(404);
    await expect(page.getByText("That's a four o' four")).toBeVisible();
});
