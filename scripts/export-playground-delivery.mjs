import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import ts from 'typescript';

// A separate source graph preserves the backend's accepted schema-1 cloud renderer.
// Never use the recursive legacy platform exporter to install this contract.
const destination=process.argv[2],write=process.argv.includes('--write');
if(!destination)throw Error('Supply the explicit Sentinel Lab app directory; --write installs, otherwise checks parity.');
const app=path.resolve(destination),pkg=JSON.parse(await readFile(path.join(app,'package.json'),'utf8'));
if(pkg.name!=='eidos-sentinel-lab')throw Error('Destination is not Sentinel Lab.');
const root=process.cwd(),entry='src/playground/purchaseSnapshot.ts',target=path.join(app,'lib/works/project-delivery');
const files=new Map();
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const sourceBytes=async file=>Buffer.from((await readFile(file,'utf8')).replaceAll('\r\n','\n'),'utf8');
const allowed=file=>file.startsWith('src/playground/') || file==='src/data/buyerArchivePins.json';
async function resolveImport(from,specifier){
  if(!specifier.startsWith('.'))throw Error(`External snapshot dependency is not allowed: ${from} -> ${specifier}`);
  const base=path.resolve(root,path.dirname(from),specifier);
  for(const candidate of [base,base+'.ts',base+'.tsx',base+'.json',path.join(base,'index.ts')]){
    if(await stat(candidate).then(s=>s.isFile()).catch(()=>false)){
      const relative=path.relative(root,candidate).replaceAll('\\','/');
      if(!allowed(relative))throw Error('Snapshot dependency escapes the explicit source allowlist: '+relative);
      return relative;
    }
  }
  throw Error(`Cannot resolve snapshot dependency: ${from} -> ${specifier}`);
}
async function visit(file){
  if(files.has(file))return;
  if(!allowed(file))throw Error('Unexpected snapshot source: '+file);
  const bytes=await sourceBytes(path.resolve(root,file));files.set(file,{path:file,bytes:bytes.length,sha256:digest(bytes)});
  if(file.endsWith('.json'))return;
  const parsed=ts.createSourceFile(file,bytes.toString('utf8'),ts.ScriptTarget.Latest,true),imports=[];
  function scan(node){
    if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier){if(!ts.isStringLiteral(node.moduleSpecifier))throw Error('Nonliteral module source: '+file);imports.push(node.moduleSpecifier.text);}
    if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword){if(node.arguments.length!==1||!ts.isStringLiteral(node.arguments[0]))throw Error('Dynamic snapshot import cannot be audited: '+file);imports.push(node.arguments[0].text);}
    ts.forEachChild(node,scan);
  }
  scan(parsed);
  for(const specifier of imports)await visit(await resolveImport(file,specifier));
}
await visit(entry);
const inventory=[...files.values()].sort((a,b)=>a.path.localeCompare(b.path));
const adapterPath='lib/works/vendor/functions/_shared/platform/projectDeliveryRenderer.ts';
const adapter="// Deliberately separate from the legacy schema-1 cloud renderer.\nexport * from '../../../../project-delivery/src/playground/purchaseSnapshot';\n";
const manifest={schemaVersion:1,entry,encoding:'utf8-lf',scope:'Exact source graph after LF normalization for gated project delivery; legacy cloud renderer is untouched.',inventorySha256:digest(JSON.stringify(inventory)),files:inventory,adapter:{path:adapterPath,sha256:digest(adapter)}};
if(write){
  for(const file of inventory){const to=path.join(target,file.path);await mkdir(path.dirname(to),{recursive:true});await writeFile(to,await sourceBytes(path.join(root,file.path)));}
  await mkdir(path.dirname(path.join(app,adapterPath)),{recursive:true});await writeFile(path.join(app,adapterPath),adapter);
  await writeFile(path.join(target,'source-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
}
for(const file of inventory){const bytes=await readFile(path.join(target,file.path));if(digest(bytes)!==file.sha256)throw Error('Paired snapshot source differs: '+file.path);}
if(digest(await readFile(path.join(app,adapterPath)))!==manifest.adapter.sha256)throw Error('Paired renderer adapter differs.');
const installed=JSON.parse(await readFile(path.join(target,'source-manifest.json'),'utf8'));
if(JSON.stringify(installed)!==JSON.stringify(manifest))throw Error('Paired snapshot manifest differs.');
console.log(JSON.stringify({action:write?'installed-and-verified':'verified',files:inventory.length,inventorySha256:manifest.inventorySha256,legacyCloudRenderer:'untouched'}));
