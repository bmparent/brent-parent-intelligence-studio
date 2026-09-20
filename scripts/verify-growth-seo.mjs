import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const routes=['/','/friction-review','/central-florida','/services/digital-experiences','/services/business-systems','/services/intelligent-systems','/work','/contact'];
const sitemap=await readFile('dist/sitemap.xml','utf8');const results=[];
for(const path of routes) {
  const html=await readFile(`dist${path==='/'?'':path}/index.html`,'utf8');
  assert.match(html,/<title>[^<]+<\/title>/);assert.match(html,/<meta name="description" content="[^"]{30,}"/);
  assert.ok(html.includes(`rel="canonical" href="https://eidos-works.com${path==='/'?'/':path}"`),path+' canonical');
  assert.ok(html.includes('property="og:image" content="https://eidos-works.com/social-preview.png"'),path+' raster social preview');
  assert.ok(html.includes('name="twitter:image"'));assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length,1,path+' single h1');
  assert.ok(html.includes('href="/friction-review"'));assert.ok(sitemap.includes(`https://eidos-works.com${path}</loc>`));
  assert.ok(html.includes('application/ld+json'));results.push({path,canonical:true,title:true,description:true,social:true,h1:true,cta:true,sitemap:true});
}
assert.match(await readFile('dist/robots.txt','utf8'),/Sitemap: https:\/\/eidos-works.com\/sitemap.xml/);
const latest=JSON.parse(await readFile('src/data/articles.json','utf8')).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt))[0];
assert.ok((await readFile(`dist/insights/${latest.slug}/index.html`,'utf8')).includes('utm_source=eidos_insights'));
await mkdir('artifacts/growth/phase1-20260920',{recursive:true});
await writeFile('artifacts/growth/phase1-20260920/seo.json',JSON.stringify({results,latestInsight:latest.slug,insightsCta:true},null,2));
console.log('Growth commercial routes, SEO, sitemap, social previews and latest Insight CTA passed.');
