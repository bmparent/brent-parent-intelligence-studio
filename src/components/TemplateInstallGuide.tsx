import guides from '../data/templateGuides.json';
import type { ReactNode } from 'react';

function inlineCode(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part,
  );
}

// The bundled guides use headings, soft-wrapped paragraphs, and flat lists.
// Read heading lines independently: INSTALL.md does not require a blank line
// between a heading and its instructions. React escapes all source text.
function guideContent(markdown: string) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const content: ReactNode[] = [];
  let i = 0;
  const listItem = (line: string) => line.match(/^(-|\d+\.) (.+)$/);
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.startsWith('# ')) { i++; continue; }
    if (line.startsWith('## ')) {
      content.push(<h2 key={i}>{inlineCode(line.slice(3))}</h2>);
      i++;
      continue;
    }
    const first = listItem(line);
    if (first) {
      const ordered = first[1] !== '-';
      const start = ordered ? Number.parseInt(first[1], 10) : undefined;
      const items: ReactNode[] = [];
      const key = i;
      while (i < lines.length) {
        const item = listItem(lines[i]);
        if (!item || (item[1] !== '-') !== ordered) break;
        const itemKey = i;
        let text = item[2];
        i++;
        while (i < lines.length && /^\s{2,}\S/.test(lines[i])) {
          text += ' ' + lines[i].trim();
          i++;
        }
        items.push(<li key={itemKey}>{inlineCode(text)}</li>);
      }
      content.push(ordered ? <ol key={key} start={start === 1 ? undefined : start}>{items}</ol> : <ul key={key}>{items}</ul>);
      continue;
    }
    const key = i;
    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^#{1,2} /.test(lines[i]) && !listItem(lines[i])) {
      paragraph.push(lines[i].trim());
      i++;
    }
    content.push(<p key={key}>{inlineCode(paragraph.join(' '))}</p>);
  }
  return content;
}

export function TemplateInstallGuide({ path }: { path: string }) {
  const guide = guides.find((g) => g.path.replace(/\/$/, '') === path);
  if (!guide) return <section className="ew-shell et-guide"><h1>Guide unavailable</h1><p><a href="/shop/choose">Choose your edition</a> or contact billing for installation help.</p></section>;
  return <article className="ew-shell ew-reading et-guide et-install"><a href={`/shop/${guide.slug}`}>← {guide.name} editions</a><h1>{guide.name}<br /><em>{guide.platform === 'wordpress' ? 'WordPress installation.' : 'Developer installation.'}</em></h1><p>Candidate instructions · use the INSTALL.md in your downloaded version when a future revision differs.</p>{guideContent(guide.markdown)}<p><a href="/shop/start">Purchase recovery and download →</a></p></article>;
}
