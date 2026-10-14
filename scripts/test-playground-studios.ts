import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createArtwork, artworkColor, artworkPoster, duplicateArtwork, newArtworkObject, validateArtwork } from '../src/playground/artworkSchema';
import { artworkFiles, artworkSvg, artworkTextLayout } from '../src/playground/artworkRenderer';
import { createMotion, duplicateMotion, motionPose, putMotionFrame, resizeMotionDuration, validateMotion } from '../src/playground/motionSchema';
import { motionFiles, motionHtml, motionSvg } from '../src/playground/motionRenderer';
import { studioFontBytes } from '../src/playground/studioFont';
import font from '../src/playground/studioFont.json';

test('artwork source preserves stable IDs, linked colors and independent overrides through JSON reopen', () => {
  const original = createArtwork();
  const a = validateArtwork(JSON.parse(JSON.stringify({ ...original, objects: original.objects.map((o, i) => ({ ...o, group: 'group-original', ...(i === 0 ? { color: '#ff00cc' } : {}) })) })));
  const next = { ...a, palette: { ...a.palette, accent: '#112233', ink: '#445566' } };
  assert.equal(artworkColor(next, next.objects[0]), '#ff00cc');
  assert.equal(artworkColor(next, next.objects[1]), '#112233');
  const copy = duplicateArtwork(next, next.objects.map(o => o.id));
  assert.deepEqual(copy.objects.slice(0, 3), next.objects);
  assert.equal(new Set(copy.objects.map(o => o.id)).size, 6);
  assert.equal(new Set(copy.objects.slice(3).map(o => o.group)).size, 1);
  assert.notEqual(copy.objects[3].group, copy.objects[0].group);
  assert.deepEqual(validateArtwork(JSON.parse(JSON.stringify(copy))), copy);
});

test('artwork validation rejects malformed, excessive, unsafe and unsupported input without mutating source', () => {
  const original = createArtwork(), frozen = JSON.stringify(original);
  for (const patch of [ { version: 99 }, { width: Number.NaN }, { height: 99999 }, { unknown: true }, { objects: [original.objects[0], original.objects[0]] }, { objects: Array.from({ length: 49 }, (_, i) => ({ ...original.objects[0], id: `artwork-${i}` })) }, { palette: { ...original.palette, ink: 'url(javascript:alert(1))' } }, { objects: [{ ...original.objects[0], id: '" onload="alert(1)' }] }, { objects: [{ ...newArtworkObject('text'), text: 'Unsupported 漢字' }] }, { objects: [{ ...newArtworkObject('image'), image: 'data:image/svg+xml,<svg onload="alert(1)"></svg>' }] }, { objects: [{ ...newArtworkObject('image'), image: 'data:image/png;base64,YWJjZA==' }] } ]) assert.throws(() => validateArtwork({ ...original, ...patch }));
  assert.equal(JSON.stringify(original), frozen);
});

test('SVG exports retain dimensions, transparent backgrounds, seamless edge wraps, selected repeat and safe text', () => {
  const a = createArtwork(); a.transparent = true; a.objects[0].x = 0;
  const tile = artworkSvg(a), repeat = artworkSvg({ ...a, repeat: 'half-drop' }, 'repeat');
  assert.match(tile, /width="720" height="720"/);
  assert.doesNotMatch(tile, /fill="#f0eadc"/);
  assert.match(tile, /translate\(720 /);
  assert.match(repeat, /width="2160" height="2160"/);
  assert.match(repeat, /translate\(720 360\)/);
  const poster = artworkPoster('editorial'); poster.objects[1].text = '<script>alert("x")</script> & words';
  assert.match(artworkSvg(poster), /&lt;script&gt;/); assert.doesNotMatch(artworkSvg(poster), /<script>/);
  poster.objects[1].text = ''; assert.doesNotMatch(artworkSvg(poster), /Good things/);
  poster.objects[1].text = 'W'.repeat(300); assert.match(artworkSvg(poster), /lengthAdjust="spacingAndGlyphs"/);
  poster.objects[1].text = Array.from({ length: 100 }, () => 'a').join('\n'); assert.ok(artworkTextLayout(poster.objects[1], 720, 960).fit < 1);
  const files = artworkFiles(poster), source = files.find(f => f.name === 'artwork.json');
  assert.ok(source); assert.deepEqual(validateArtwork(JSON.parse(new TextDecoder().decode(source.data))), poster);
  assert.match(new TextDecoder().decode(files.find(f => f.name === 'README.md')!.data), /not advertised as a seamless tile/);
});

test('wrapped artwork embeds uploaded bytes once and reuses stable shape references', () => {
  const a = createArtwork(), image = 'data:image/png;base64,iVBORw0KGgo=';
  a.objects = [{ ...newArtworkObject('image'), image }];
  const svg = artworkSvg(a, 'repeat');
  assert.equal(svg.split(image).length - 1, 1);
  assert.ok(svg.split(`<use href="#shape-${a.objects[0].id}"`).length > 5);
});

test('licensed font bytes and real variable axes are captured and embedded identically', () => {
  const bytes = studioFontBytes(); assert.equal(createHash('sha256').update(bytes).digest('hex'), font.sha256);
  assert.deepEqual(font.axes.wght, { min: 100, default: 400, max: 1000 });
  assert.deepEqual(font.axes.opsz, { min: 9, default: 9, max: 40 });
  assert.match(font.license, /SIL OPEN FONT LICENSE Version 1.1/);
  assert.ok(artworkSvg(createArtwork()).includes(font.data));
  assert.ok(motionHtml(createMotion()).includes(font.data));
  assert.ok(artworkFiles(createArtwork()).some(f => f.name === 'OFL.txt'));
  assert.ok(motionFiles(createMotion()).some(f => f.name === 'OFL.txt'));
});

test('motion keyframes interpolate, hold boundaries, preserve duration ratios and reopen exactly', () => {
  const m = createMotion(), shape = m.objects[0];
  const midpoint = motionPose(shape, 1);
  assert.equal(midpoint.x, 50); assert.ok(Math.abs(midpoint.scale - .9) < .000001); assert.equal(midpoint.rotation, 0);
  assert.equal(motionPose(shape, -1).x, 25); assert.equal(motionPose(shape, 10).x, 25);
  const edited = putMotionFrame(m, shape.id, { ...midpoint, x: 42 });
  assert.equal(edited.objects[0].keyframes.length, 4); assert.equal(motionPose(edited.objects[0], 1).x, 42);
  const replaced = putMotionFrame(edited, shape.id, { ...midpoint, x: 60 });
  assert.equal(replaced.objects[0].keyframes.length, 4);
  const resized = resizeMotionDuration(replaced, 8);
  assert.equal(motionPose(resized.objects[0], 2).x, 60); assert.equal(resized.objects[0].keyframes.at(-1)?.time, 8);
  const copied = duplicateMotion(resized, shape.id);
  assert.notEqual(copied.objects[0].id, copied.objects.at(-1)?.id);
  assert.notEqual(copied.objects[0].keyframes, copied.objects.at(-1)?.keyframes);
  assert.deepEqual(validateMotion(JSON.parse(JSON.stringify(copied))), copied);
});

test('motion rejects stale format, duplicate time/identity, invalid properties and script injection stays inert', () => {
  const m = createMotion(), before = JSON.stringify(m), shape = m.objects[0];
  assert.throws(() => validateMotion({ ...m, duration: 0 }));
  assert.throws(() => validateMotion({ ...m, speed: 5 }));
  assert.throws(() => validateMotion({ ...m, objects: [shape, shape] }));
  assert.throws(() => validateMotion({ ...m, objects: [{ ...shape, keyframes: [shape.keyframes[0], shape.keyframes[0]] }] }));
  assert.throws(() => validateMotion({ ...m, objects: [{ ...shape, keyframes: [{ ...shape.keyframes[0], time: 5 }] }] }));
  assert.throws(() => validateMotion({ ...m, objects: [{ ...shape, keyframes: [{ ...shape.keyframes[0], scale: Infinity }] }] }));
  assert.throws(() => validateMotion({ ...m, objects: [{ ...shape, keyframes: [] }] }));
  assert.equal(JSON.stringify(m), before);
  m.objects[1].text = '</script><script>alert(1)</script>';
  const html = motionHtml(m); assert.doesNotMatch(html, /<script>alert\(1\)/); assert.match(html, /\\u003c\/script>/);
  assert.match(html, /document\.hidden/); assert.match(html, /prefers-reduced-motion/); assert.match(html, /requestAnimationFrame/);
  assert.doesNotMatch(html, /src="https?:/); assert.doesNotMatch(html, /fetch\(/);
  const exported = motionFiles(m).find(f => f.name === 'motion.json')!;
  assert.deepEqual(validateMotion(JSON.parse(new TextDecoder().decode(exported.data))), m);
  assert.match(motionSvg(m, 1), /translate\(480 320\)/);
});

test('empty artwork and motion remain useful valid documents with independent outputs', () => {
  const a = validateArtwork({ ...createArtwork(), objects: [] }), m = validateMotion({ ...createMotion(), objects: [] });
  assert.ok(artworkFiles(a).length >= 5); assert.ok(motionFiles(m).length >= 4); assert.match(motionHtml(m), /Self-contained browser animation/);
});
