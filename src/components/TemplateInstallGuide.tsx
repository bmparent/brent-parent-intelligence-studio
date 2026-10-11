import guides from '../data/templateGuides.json';

export function TemplateInstallGuide({ path }: { path: string }) {
  const guide = guides.find((g) => g.path.replace(/\/$/, '') === path);
  if (!guide) return <section className="ew-shell et-guide"><h1>Guide unavailable</h1><p><a href="/shop/choose">Choose your edition</a> or contact billing for installation help.</p></section>;
  return <article className="ew-shell ew-reading et-guide et-install"><a href={`/shop/${guide.slug}`}>← {guide.name} editions</a><h1>{guide.name}<br /><em>{guide.platform === 'wordpress' ? 'WordPress installation.' : 'Developer installation.'}</em></h1><p>Candidate instructions · use the INSTALL.md in your downloaded version when a future revision differs.</p>{guide.markdown.split(/\r?\n\r?\n/).filter((block) => !block.startsWith('# ')).map((block, i) => block.startsWith('## ') ? <h2 key={i}>{block.slice(3)}</h2> : <div className="et-install-block" key={i}>{block}</div>)}<p><a href="/shop/start">Purchase recovery and download →</a></p></article>;
}
