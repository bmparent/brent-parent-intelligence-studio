import {readdir,readFile,writeFile,mkdir,copyFile,access} from 'node:fs/promises';
import {constants} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const local=path.resolve('artifacts/playground-unified'),timestamp=new Date().toISOString();
const sha=data=>createHash('sha256').update(data).digest('hex');
async function files(dir,prefix=''){
  const list=[];for(const entry of await readdir(dir,{withFileTypes:true})){
    const name=path.posix.join(prefix,entry.name);
    if(entry.isDirectory())list.push(...await files(path.join(dir,entry.name),name));
    else if(entry.isFile()&&!['artifact_manifest.json','drive_manifest.json'].includes(name))list.push(name);
  }return list.sort();
}
await mkdir(local,{recursive:true});
const sourceFiles=[];
for(const directory of ['src/playground','functions/_shared/platform','functions/api/playground','functions/api/shop','migrations'])for(const relative of await files(directory)){
  const file=directory+'/'+relative,data=await readFile(file);sourceFiles.push({path:file,bytes:data.length,sha256:sha(data)});
}
const taskScripts=(await readdir('scripts')).filter(file=>/playground|project-delivery/.test(file)).map(file=>'scripts/'+file);
for(const file of ['package.json','eslint.config.js','.gitattributes','src/components/TemplateShop.tsx','config/playground-preview.json','.github/workflows/playground-unified-preview.yml','.github/workflows/playground-editor-release.yml',...taskScripts]){const data=await readFile(file);sourceFiles.push({path:file,bytes:data.length,sha256:sha(data)});}
const source={baseCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),workingTreeChanges:execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean),timestampUtc:timestamp,files:sourceFiles};
source.inventorySha256=sha(JSON.stringify(sourceFiles));
await writeFile(path.join(local,'source_inventory.json'),JSON.stringify(source,null,2)+'\n');
const manifest={schemaVersion:1,timestamp_utc:timestamp,sourceCommit:source.baseCommit,sourceInventorySha256:source.inventorySha256,files:[]};
for(const name of await files(local)){const data=await readFile(path.join(local,name));manifest.files.push({path:name,bytes:data.length,sha256:sha(data)});}
await writeFile(path.join(local,'artifact_manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const drive={drive_copy_attempted:false,drive_copy_success:false,drive_root:'unknown',drive_run_dir:'unknown',reason:'No configured writable Drive root.',files_considered:manifest.files.map(f=>f.path),files_copied:[],files_skipped:[],timestamp_utc:timestamp,remote_sync_proven:false};
let root;
for(const candidate of [process.env.EIDOS_PROOF_DRIVE_DIR,process.env.EIDOS_ARTIFACT_ROOT]){if(!candidate)continue;try{await access(candidate,constants.W_OK);root=path.resolve(candidate);break;}catch{/* Try the next configured root. */}}
if(root){
  drive.drive_copy_attempted=true;drive.drive_root=root;
  const destination=path.join(root,'Eidos_Works_Playground',timestamp.slice(0,10),'unified-'+source.baseCommit.slice(0,8)+'-'+timestamp.replace(/[:.]/g,'-'));drive.drive_run_dir=destination;
  try{
    await mkdir(destination,{recursive:true});
    for(const file of manifest.files){const target=path.join(destination,file.path);await mkdir(path.dirname(target),{recursive:true});await copyFile(path.join(local,file.path),target,constants.COPYFILE_EXCL);if(sha(await readFile(target))!==file.sha256)throw Error('Mirror checksum mismatch: '+file.path);drive.files_copied.push({...file,verified:true});}
    await copyFile(path.join(local,'artifact_manifest.json'),path.join(destination,'artifact_manifest.json'),constants.COPYFILE_EXCL);
    drive.drive_copy_success=true;drive.reason='Copied and read back all listed files with matching SHA256. Remote cloud synchronization is not established by this mounted-folder copy.';
  }catch(error){drive.reason=error.message;drive.files_skipped=manifest.files.filter(f=>!drive.files_copied.some(c=>c.path===f.path)).map(f=>({path:f.path,reason:drive.reason}));}
}
await writeFile(path.join(local,'drive_manifest.json'),JSON.stringify(drive,null,2)+'\n');
if(drive.drive_copy_success)await copyFile(path.join(local,'drive_manifest.json'),path.join(drive.drive_run_dir,'drive_manifest.json'),constants.COPYFILE_EXCL);
console.log(JSON.stringify({local,files:manifest.files.length,bytes:manifest.files.reduce((n,f)=>n+f.bytes,0),drive_copy_success:drive.drive_copy_success,drive_run_dir:drive.drive_run_dir,reason:drive.reason}));
