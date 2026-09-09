import {
  validateProject,
  projectWarnings,
  RENDERER,
  type Project,
} from "./model";
import { pageDocument, runtimeScript, tokensCss } from "./renderer";
import { pageStyles } from "./pageStyles";
import approved from "./approved-glass-preset.json";
export type ExportFile = { name: string; data: Uint8Array };
const encode = (value: string) => new TextEncoder().encode(value);
export function exportFiles(input: Project): ExportFile[] {
  const p = validateProject(input),
    project = structuredClone(p),
    assets: ExportFile[] = [];
  for (const s of project.sections)
    if (s.image) {
      const match = /^data:image\/(png|jpeg|webp);base64,(.+)$/.exec(s.image)!;
      const name = `assets/${s.id}.${match[1] === "jpeg" ? "jpg" : match[1]}`;
      assets.push({
        name,
        data: Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0)),
      });
      s.image = name;
    }
  const warnings = projectWarnings(p);
  const readme = `# ${p.name}\n\nOpen index.html in a browser. No build step, API key, CDN, or subscription is required. Upload all files together to a static host.\n\n## Included\n- index.html, styles.css, tokens.css, script.js: the same page renderer used by the preview.\n- project.json: editable source, including embedded images; import into Eidos Playground.\n- approved-glass-preset.json: unchanged source reference.\n- assets/: locally packaged uploaded images. No remote image dependencies.\n- AI-HANDOFF.md: design-specific extension instructions.\n\n## Before publishing\n${warnings.length ? warnings.map((v) => "- " + v).join("\n") : "- Review your content and destinations."}\n- Review links, keyboard navigation, and actual mobile devices.\n- Contact links open the visitor’s email app; this package does not include a form backend.\n- Fonts are system Arial/Helvetica and Georgia; no font license files are required.\n- Built-in abstract SVG studies are included. You must have rights to uploaded images and supplied brand content.\n\n## Glass\nRenderer: ${RENDERER}. Uses frosted backdrop and pointer-driven canvas edge lighting. The approved preset is a reference; the unavailable original SVG refraction implementation is not included. Browser rendering varies. Reduced motion and forced colors have fallbacks; no JavaScript leaves a solid header.\n\n## Integration\nThis is a complete standalone page, not a platform-specific embed. Existing site CSS and script policies require separate integration. Do not paste the whole document into a CMS content field.\n`;
  const handoff = `# Extend this design\n\nUse index.html as the working visual reference and project.json / tokens.css as the source of truth.\n\nProject: ${p.name}\nTemplate: ${p.template}\nSchema: ${p.schemaVersion}\nRenderer: ${p.rendererVersion}\n\nPreserve section order: ${p.sections
    .filter((s) => s.visible)
    .map((s) => s.id)
    .join(
      " → ",
    )}.\nPreserve the palette (${p.tokens.background}, ${p.tokens.foreground}, ${p.tokens.accent}), ${p.tokens.font} typography, ${p.tokens.spacing}px section spacing, ${p.tokens.radius}px corners, and responsive single-column mobile layouts.\n\nHeader: ${p.glass.enabled ? `solid through ${p.glass.start}px, fully glass at ${p.glass.end}px` : "solid at every scroll position"}. Frost ${p.glass.frost}px; edge intensity ${p.glass.edge}; prism ${p.glass.prism}; press response ${p.glass.touch}; spring frequency ${p.glass.response}. Keep navigation stationary and edge effects behind links. Respect system reduced motion${p.glass.reducedMotion ? " and the project’s explicit reduced motion preference" : ""}.\n\nUse the supplied working renderer; do not replace it with an unrelated effect. Preserve the original project for reimport. Do not invent client quotes, performance claims, or working backend services. Contact handling, analytics, and payments need explicit implementation if requested. Verify any added pages on keyboard, touch, narrow screens, and at increased text size.\n`;
  return [
    ...Object.entries({
      "index.html": pageDocument(project, { external: true }),
      "styles.css": pageStyles,
      "tokens.css": tokensCss(p),
      "script.js": runtimeScript(p),
      "project.json": JSON.stringify(p, null, 2),
      "approved-glass-preset.json": JSON.stringify(approved, null, 2),
      "README.md": readme,
      "AI-HANDOFF.md": handoff,
    }).map(([name, value]) => ({ name, data: encode(value) })),
    ...assets,
  ];
}
// ZIP STORE format: no dependency or server, with CRC-32 and central directory.
export function zipFiles(files: ExportFile[]): Uint8Array {
  const parts: Uint8Array[] = [],
    central: Uint8Array[] = [];
  let offset = 0;
  const crc32 = (bytes: Uint8Array) => {
    let crc = -1;
    for (const b of bytes) {
      crc ^= b;
      for (let k = 0; k < 8; k++)
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    return (crc ^ -1) >>> 0;
  };
  for (const file of files) {
    const name = encode(file.name),
      crc = crc32(file.data);
    const local = new Uint8Array(30 + name.length),
      l = new DataView(local.buffer);
    l.setUint32(0, 0x04034b50, true);
    l.setUint16(4, 20, true);
    l.setUint16(6, 0x800, true);
    l.setUint16(12, 33, true);
    l.setUint32(14, crc, true);
    l.setUint32(18, file.data.length, true);
    l.setUint32(22, file.data.length, true);
    l.setUint16(26, name.length, true);
    local.set(name, 30);
    const entry = new Uint8Array(46 + name.length),
      c = new DataView(entry.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x800, true);
    c.setUint16(14, 33, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, file.data.length, true);
    c.setUint32(24, file.data.length, true);
    c.setUint16(28, name.length, true);
    c.setUint32(42, offset, true);
    entry.set(name, 46);
    parts.push(local, file.data);
    central.push(entry);
    offset += local.length + file.data.length;
  }
  const size = central.reduce((n, p) => n + p.length, 0),
    end = new Uint8Array(22),
    e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, files.length, true);
  e.setUint16(10, files.length, true);
  e.setUint32(12, size, true);
  e.setUint32(16, offset, true);
  const result = new Uint8Array(offset + size + end.length);
  let index = 0;
  for (const part of [...parts, ...central, end]) {
    result.set(part, index);
    index += part.length;
  }
  return result;
}
export function download(
  data: Uint8Array | string,
  name: string,
  type: string,
) {
  const bytes = typeof data === "string" ? encode(data) : data;
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(bytes).buffer], { type }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
