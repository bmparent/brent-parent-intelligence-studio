import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createProject,
  LEGACY_RENDERER,
  RENDERER,
  validateProject,
  safeHref,
  contrast,
} from "../src/playground/model";
import { pageDocument, pageMarkup } from "../src/playground/renderer";
import { exportFiles, headerFiles, zipFiles } from "../src/playground/export";

test('Legacy projects stay legacy and component exports require explicit upgrade', () => {
  const original=createProject(),legacy={...original,rendererVersion:LEGACY_RENDERER};
  assert.equal(validateProject(legacy).rendererVersion,LEGACY_RENDERER);
  assert.match(pageDocument(original),/ew-liquid-optics/);
  assert.doesNotMatch(pageMarkup(legacy),/ew-liquid-optics/);
  assert.throws(()=>headerFiles(legacy),/Upgrade/);
  assert.equal(original.rendererVersion,RENDERER);
  const files=headerFiles(original);assert.ok(files.some(f=>f.name==='eidos-header.js'));
  const readme=new TextDecoder().decode(exportFiles(original).find(f=>f.name==='README.md')!.data);
  assert.ok(readme.includes(RENDERER));assert.doesNotMatch(readme,/is not included/);
});

test("all starter projects round trip and reject incompatible versions", () => {
  for (const template of ["landing", "homepage", "portfolio"] as const) {
    const p = createProject(template);
    assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))), p);
  }
  const p = createProject();
  assert.throws(() => validateProject({ ...p, schemaVersion: 2 }));
  assert.throws(() => validateProject({ ...p, rendererVersion: "future" }));
  assert.throws(() =>
    validateProject({
      ...p,
      sections: [p.sections[0], ...p.sections.slice(0, 5)],
    }),
  );
  assert.throws(() =>
    validateProject({ ...p, glass: { ...p.glass, frost: Infinity } }),
  );
  assert.throws(() =>
    validateProject({
      ...p,
      tokens: { ...p.tokens, background: "#fff;}</style><script>" },
    }),
  );
});
test("untrusted copy and links never become executable markup", () => {
  const p = createProject();
  p.name = "</title><script>alert(1)</script>";
  p.sections[1].title = "<img src=x onerror=alert(1)>";
  p.sections[1].href = "javascript:alert(1)";
  const html = pageDocument(p);
  assert.ok(!html.includes("<img src=x"));
  assert.ok(html.includes("&lt;img"));
  assert.ok(!html.includes("</title><script>alert"));
  assert.equal(safeHref("javascript:alert(1)"), "#");
  assert.equal(safeHref("data:text/html,hello"), "#");
  assert.equal(
    safeHref("https://example.com/work"),
    "https://example.com/work",
  );
  assert.throws(() => validateProject(p));
});
test("exports use identical markup and package uploaded image bytes", () => {
  const p = createProject();
  const files = exportFiles(p);
  const decode = (name: string) =>
    new TextDecoder().decode(files.find((f) => f.name === name)!.data);
  assert.ok(decode("index.html").includes(pageMarkup(p)));
  assert.deepEqual(JSON.parse(decode("project.json")), p);
  assert.ok(!decode("index.html").includes("playground-ready"));
  assert.ok(decode("AI-HANDOFF.md").includes("fully glass at 72px"));
  p.sections[1].image = "data:image/png;base64,iVBORw0KGgo=";
  p.sections[1].alt = "Test asset";
  const withImage = exportFiles(p);
  assert.equal(
    new TextDecoder().decode(
      withImage.find((f) => f.name === "assets/hero.png")!.data,
    ),
    "�PNG\r\n\u001a\n",
  );
  assert.ok(
    new TextDecoder()
      .decode(withImage[0].data)
      .includes('src="assets/hero.png"'),
  );
  assert.equal(p.sections[1].image, "data:image/png;base64,iVBORw0KGgo=");
});
test("stored ZIP carries central directory and correct file count", () => {
  const files = exportFiles(createProject()),
    zip = zipFiles(files),
    view = new DataView(zip.buffer);
  assert.equal(view.getUint32(0, true), 0x04034b50);
  assert.equal(view.getUint32(zip.length - 22, true), 0x06054b50);
  assert.equal(view.getUint16(zip.length - 12, true), files.length);
});
test("contrast and visibility produce accessible baseline content", () => {
  const p = createProject();
  assert.ok(contrast(p.tokens.background, p.tokens.foreground) > 7);
  p.sections[2].visible = false;
  const html = pageMarkup(p);
  assert.ok(!html.includes('href="#services"'));
  assert.ok(!html.includes('class="pg-services"'));
});

test("imports reject malformed base64 and mismatched image signatures", () => {
  for (const image of ["data:image/png;base64,a", "data:image/png;base64,aGVsbG8=", "data:image/webp;base64,iVBORw0KGgo=", "data:image/png;base64,iVBORw0KGgo==="]) {
    const project = createProject();
    project.sections[1].image = image;
    assert.throws(() => validateProject(project));
  }
});
