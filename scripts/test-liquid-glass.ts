import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceSpring, scrollProgress, surfacePoint } from '../src/lib/liquid-glass/math';
import { touchColourScale } from '../src/lib/liquid-glass/optics';
import approved from '../src/lib/liquid-glass/preset.json';

test('solid at the top, continuous through the transition, glass after 72px', () => {
  for (const y of [-200, 0, 1, 4]) assert.equal(scrollProgress(y), 0);
  for (const y of [72, 200, 12000]) assert.equal(scrollProgress(y), 1);
  assert.equal(scrollProgress(38), .5);
  let previous = 0;
  for (let y = 0; y <= 100; y += .25) {
    const p = scrollProgress(y);
    assert.ok(p >= previous && p >= 0 && p <= 1); previous = p;
  }
  assert.equal(scrollProgress(0), 0, 'Returning to top never leaves residual transparency');
});
test('spring response agrees across refresh rates and releases without overshoot', () => {
  const positions = [30, 60, 120, 144].map(hz => {
    const state = { x: 0, v: 0 };
    for (let i = 0; i < hz / 2; i++) advanceSpring(state, 1, 28, 1 / hz);
    const halfway = state.x;
    for (let i = 0; i < hz; i++) { advanceSpring(state, 0, 28, 1 / hz); assert.ok(state.x >= 0); }
    assert.equal(state.x, 0); assert.equal(state.v, 0);
    return halfway;
  });
  assert.ok(Math.max(...positions) - Math.min(...positions) < 1e-12);
});
test('hit geometry follows rounded corners and reports the bevel depth', () => {
  assert.ok(surfacePoint(0, 0, 1200, 76, 29).depth < 0, 'Rounded corner is outside the hit surface');
  assert.equal(surfacePoint(600, 0, 1200, 76, 29).depth, 0);
  assert.equal(surfacePoint(600, 38, 1200, 76, 29).depth, 38);
  assert.equal(surfacePoint(600, -170, 1200, 76, 29).depth, -170);
  assert.equal(surfacePoint(600, 75, 1200, 76, 29).ny, 1);
  assert.equal(surfacePoint(600, 1, 1200, 76, 29).ny, -1);
});
test('mobile touch prism ramps from the desktop peak to the approved touch peak', () => {
  const { colourPeak, touchColourPeak } = approved.light;
  assert.equal(colourPeak, .32);
  assert.equal(touchColourPeak, .65);
  assert.equal(touchColourScale(colourPeak, touchColourPeak, 0, true), 1);
  assert.equal(touchColourScale(colourPeak, touchColourPeak, 1, false), 1);
  assert.equal(touchColourScale(colourPeak, touchColourPeak, 1, true), touchColourPeak / colourPeak);
  const halfPeak = colourPeak * touchColourScale(colourPeak, touchColourPeak, .5, true);
  assert.equal(halfPeak, (colourPeak + touchColourPeak) / 2);
});
