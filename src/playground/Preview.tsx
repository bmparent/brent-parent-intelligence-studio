import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Project } from "./model";
import { pageDocument, pageMarkup, runtimeConfig, tokensCss, renderedStyles } from "./renderer";
import { applyCompositionOperation, type CompositionOperation } from './composition';
import { compositionParts, imagePlacements, type CompositionPart, type ImagePlacement } from './compositionSchema';
import { imageData } from './storage';
import { defaultMedia } from './media';
export function Preview({
  project,
  editing,
  selected,
  mobile,
  onSelect,
  onLink,
  edit,
  guard,
  notify,
  documentId = 'local',
}: {
  project: Project;
  editing: boolean;
  selected: string;
  mobile: boolean;
  onSelect: (id: string) => void;
  onLink: (href: string) => void;
  edit?: (project: Project | ((current: Project) => Project), group?: string) => void;
  guard?: () => () => boolean;
  notify?: (message: string) => void;
  documentId?: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const revision = useRef(0);
  const sent = useRef<{ stamp: string; valid: () => boolean; consumed: boolean } | null>(null);
  const [channel] = useState(() => crypto.randomUUID());
  const [source] = useState(() => pageDocument(project, { editing, selected, bridge: true, channel }));
  const [loaded, setLoaded] = useState(false);
  useLayoutEffect(() => {
    revision.current++;
    sent.current = null;
  }, [project, editing, documentId]);
  useEffect(() => {
    const message = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || !event.data || typeof event.data !== 'object') return;
      const data = event.data;
      if (data.channel !== channel) return;
      if (data.type === "playground-ready") setLoaded(true);
      if (data.type === "playground-select" && project.sections.some(s => s.id === data.id)) onSelect(data.id);
      if (data.type === "playground-link" && typeof data.href === "string") onLink(data.href);
      if (data.type !== 'playground-composition' || !editing || !edit || !guard || project.schemaVersion !== 3) return;
      const receipt = sent.current;
      if (!receipt || receipt.consumed || data.stamp !== receipt.stamp || !receipt.valid()) return;
      if (data.action === 'error') { notify?.('Drop one PNG, JPEG or WebP image, up to 8 MB.'); return; }
      const section = project.sections.find(s => s.id === data.sectionId && s.composition);
      if (!section) return;
      if (data.action === 'select') { onSelect(section.id); return; }
      if (data.action !== 'move' && data.action !== 'file') return;
      const dest = data.destination;
      if (!dest || typeof dest !== 'object' || Array.isArray(dest)) return;
      const part = data.action === 'file' ? 'image' : data.part;
      if (!compositionParts.includes(part)) return;
      let operation: CompositionOperation;
      if (typeof dest.placement === 'string' && imagePlacements.includes(dest.placement as ImagePlacement) && part === 'image') {
        operation = { type: 'placement', sectionId: section.id, placement: dest.placement as ImagePlacement, mobile: data.mobile === true };
      } else if (dest.before === null || compositionParts.includes(dest.before)) {
        operation = { type: 'move', sectionId: section.id, part: part as CompositionPart, before: dest.before, mobile: data.mobile === true };
      } else return;
      const valid = guard();
      receipt.consumed = true; // One gesture, one history entry; duplicate messages cannot replay it.
      const apply = (next: Project) => {
        if (!valid()) { notify?.('Workspace changed. Repeat this move in the current project.'); return; }
        if (JSON.stringify(next) === JSON.stringify(project)) { receipt.consumed = false; return; }
        edit(current => current === project ? next : current);
        onSelect(section.id);
        notify?.('Hero layout updated. Undo restores the previous arrangement.');
      };
      if (data.action === 'file') {
        const file = data.file;
        if (!(file instanceof File) || file.size > 8_000_000 || !['image/png','image/jpeg','image/webp'].includes(file.type)) { receipt.consumed = false; return; }
        void (async () => {
          try {
            const image = await imageData(file);
            const sourceId = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(image))), b => b.toString(16).padStart(2, '0')).join('');
            if (!valid()) { notify?.('Workspace changed during the upload. Drop the image again.'); return; }
            const withImage = { ...project, sections: project.sections.map(s => s.id === section.id ? { ...s, image, media: { ...(s.media || defaultMedia()), sourceId, sourceName: file.name.slice(0,120) } } : s) };
            apply(applyCompositionOperation(withImage, operation));
          } catch (error) { receipt.consumed = false; notify?.((error as Error).message); }
        })();
      } else {
        try { apply(applyCompositionOperation(project, operation)); }
        catch (error) { receipt.consumed = false; notify?.((error as Error).message); }
      }
    };
    window.addEventListener("message", message);
    return () => window.removeEventListener("message", message);
  }, [onSelect, onLink, project, editing, edit, guard, notify, channel]);
  useEffect(() => {
    if (!loaded) return;
    // Synchronization must also run while the preview panel is hidden or paint is throttled.
    const stamp = `${documentId}:${++revision.current}`;
    sent.current = { stamp, valid: guard?.() || (() => false), consumed: false };
    frame.current?.contentWindow?.postMessage({
      type: "playground-update",
      channel,
      html: pageMarkup(project),
      css: tokensCss(project) + renderedStyles(project),
      config: { ...runtimeConfig(project, editing, '', true), compositionStamp: stamp, channel, revision: revision.current },
    }, "*");
  }, [project, editing, loaded, documentId, guard, channel]);
  useEffect(() => {
    if (loaded) frame.current?.contentWindow?.postMessage({ type: 'playground-selection', channel, selected }, '*');
  }, [selected, loaded, channel, project, editing]);
  return <iframe ref={frame} onLoad={() => setLoaded(true)} title="Your page preview" className={mobile ? "pg-preview mobile" : "pg-preview"} sandbox="allow-scripts" srcDoc={source} />;
}
