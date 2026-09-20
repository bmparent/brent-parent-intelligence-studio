import { readFile, mkdir, writeFile } from 'node:fs/promises';
const campaigns=JSON.parse(await readFile('docs/growth/campaigns.json','utf8'));
const links=campaigns.map(c=>{const url=new URL(c.path,'https://eidos-works.com');for(const k of ['source','medium','campaign','content']) {if(!/^[a-z][a-z0-9_]{0,63}$/.test(c[k]))throw Error('Invalid campaign token');url.searchParams.set('utm_'+k,c[k]);}return {...c,url:url.href};});
await mkdir('artifacts/growth/phase1-20260920',{recursive:true});
await writeFile('artifacts/growth/phase1-20260920/campaign-urls.json',JSON.stringify(links,null,2)+'\n');
for(const c of links) console.log(`${c.id}: ${c.url}`);
