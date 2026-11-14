import test from 'node:test';
import assert from 'node:assert/strict';
import { project_frame } from '../../src/lib/geometry/project_frame.js';

test('project outlines stay finite through a fold at mobile and desktop sizes', () => {
    for (const width of [280, 340, 613, 822]) {
        for (const height of [280, 352, 408, 600]) {
            for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
                const path = project_frame({ width, height }, { start: 40, end: 600 }, progress);
                assert.doesNotMatch(path, /NaN|Infinity|undefined/);
                assert.ok(path.startsWith('M40 395'));
                assert.ok(path.includes('L600 395'));
            }
        }
    }
});
