import test from 'node:test';
import assert from 'node:assert/strict';
import { picture_source } from '../../src/lib/routing/picture_source.js';

test('picture URLs resolve only known files within their case', () => {
    assert.equal(picture_source('palia_concept', 'palia_quest_log'), '/palia_concept/palia_quest_log.webp');
    assert.equal(picture_source('paladins_concept', 'palia_quest_log'), undefined);
    assert.equal(picture_source('../projects', 'patter_logo'), undefined);
    assert.equal(picture_source('palia_concept', 'missing'), undefined);
});
