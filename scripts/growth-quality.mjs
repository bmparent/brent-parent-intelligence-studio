import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
const out='artifacts/growth/phase1-20260920';await mkdir(out,{recursive:true});const results=[];
const gates=['test:growth','test:analytics','test:platform','test:playground','test:glass','test:snapshot','lint','typecheck','build','verify:prerender','verify:editorial','validate:insights','validate:insights:dist','verify:urls','build:functions','growth:links','verify:growth-seo'];
for(const gate of gates) {
  const args=['run',gate,...(gate==='validate:insights'?['--','--skip-source-fetch']:[])];
  const result=await new Promise(resolve=>{const chunks=[];const start=Date.now();const child=spawn(process.platform==='win32'?'npm.cmd':'npm',args,{shell:process.platform==='win32',stdio:['ignore','pipe','pipe']});child.stdout.on('data',x=>chunks.push(x));child.stderr.on('data',x=>chunks.push(x));child.on('close',code=>resolve({command:'npm '+args.join(' '),code,seconds:Math.round((Date.now()-start)/1000),log:Buffer.concat(chunks).toString()}));});
  await writeFile(`${out}/${gate.replaceAll(':','-')}.log`,result.log);results.push({command:result.command,code:result.code,seconds:result.seconds});await writeFile(`${out}/quality.json`,JSON.stringify(results,null,2));console.log(`${gate}: ${result.code===0?'PASS':'FAIL'} (${result.seconds}s)`);if(result.code!==0){console.error(result.log.slice(-3000));process.exitCode=1;break;}
}
