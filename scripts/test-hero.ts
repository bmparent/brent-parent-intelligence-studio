import assert from 'node:assert/strict';
import test from 'node:test';
import { HERO, heroCrop, heroLight } from '../src/lib/hero/scene';

test('cover coordinates preserve the source through portrait and landscape crops', () => {
  for (const [width, height] of [[1672, 941], [320, 310], [390, 310], [768, 422], [1920, 780]]) {
    const crop = heroCrop(width, height);
    assert.ok(crop.x >= 0 && crop.y >= 0);
    assert.ok(crop.x + crop.width <= 1 && crop.y + crop.height <= 1);
    const rect = { left: 31, top: -127, width, height };
    const light = heroLight(rect, 0);
    assert.ok(Math.abs(crop.x + (light.x - rect.left) / width * crop.width - HERO.source[0]) < 1e-12);
    assert.ok(Math.abs(crop.y + (light.y - rect.top) / height * crop.height - HERO.source[1]) < 1e-12);
  }
});
test('light stays restrained and follows viewport translation without changing energy', () => {
  const rect = { left: 0, top: 0, width: 1440, height: 810 };
  for (let t = 0; t < 100; t += .2) {
    const a = heroLight(rect, t), b = heroLight({ ...rect, left: 40, top: -500 }, t);
    assert.ok(a.intensity >= .372 && a.intensity <= .388);
    assert.equal(b.x - a.x, 40); assert.equal(b.y - a.y, -500);
    assert.equal(a.intensity, b.intensity);
  }
});
