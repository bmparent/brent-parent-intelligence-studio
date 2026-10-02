import { readFile, writeFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { mkdir } from 'node:fs/promises';
const backend = process.argv[2];
if (!backend) throw new Error('Usage: node scripts/verify-works-contract.mjs <backend-repo-root>');
const out = process.argv[3] || 'artifacts/implementation/2026-09-21/compatibility.json';
const vendorRoot = resolve(backend, 'apps/sentinel-lab/lib/works/vendor');
async function walk(directory, prefix='') {
  const results=[];
  for(const item of await readdir(directory,{withFileTypes:true})) {
    const path=prefix+item.name;
    if(item.isDirectory()) results.push(...await walk(resolve(directory,item.name),path+'/'));
    else if(path!=='README.md') results.push(path);
  }
  return results;
}
const paths = await walk(vendorRoot);
const files = [];
for (const path of paths) {
  let source;
  try { source = await readFile(path); } catch { files.push({path,matches:false,reason:'No frontend source for vendored file'}); continue; }
  // Git may check out the same text with CRLF on Windows. Compare canonical source text.
  const normalization=/\.(?:ts|tsx|sql|json|mjs|js|css|html|md)$/.test(path)?'UTF-8 LF':'exact bytes';
  const canonical=bytes=>normalization==='UTF-8 LF'?Buffer.from(bytes.toString('utf8').replace(/\r\n/g,'\n')):bytes;
  source=canonical(source);
  const vendor = canonical(await readFile(resolve(backend, 'apps/sentinel-lab/lib/works/vendor', path)));
  files.push({ path, normalization, sha256: createHash('sha256').update(source).digest('hex'), matches: source.equals(vendor) });
}
const revision=cwd=>execFileSync('git',['rev-parse','HEAD'],{cwd,encoding:'utf8'}).trim();
const receipt = { timestamp: new Date().toISOString(), contract: 'works-v1/catalogue-2026-09-21.1', scope: 'All vendored platform/API/editor contract files; working-tree hashes, not deployed acceptance', frontendBase:revision(process.cwd()),backendBase:revision(backend), files, passed: files.every(file => file.matches) };
await mkdir(dirname(out),{recursive:true});
await writeFile(out, JSON.stringify(receipt, null, 2));
console.log(JSON.stringify({passed:receipt.passed,files:files.length,mismatches:files.filter(file=>!file.matches)}, null, 2));
if (!receipt.passed) process.exitCode = 1;
