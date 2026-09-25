// Controlled acceptance server: actual Functions handlers + SQLite, explicitly synthetic mail acknowledgement.
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { growthEndpoint } from '../functions/_shared/growth';
import { onRequestGet as report } from '../functions/api/growth/report';
import { onRequestPost as inquiry } from '../functions/api/project-inquiries';
import { withInquiryTurnstile } from './mock-inquiry-turnstile';
import type { Database, Statement } from '../functions/_shared/platform/core';
const sql=new DatabaseSync(':memory:');sql.exec(readFileSync('migrations/growth/0001_growth.sql','utf8'));
sql.exec(readFileSync('migrations/growth/0002_owner_audit.sql','utf8'));
class S implements Statement {
  constructor(private q:string,private v:unknown[]=[] ){}
  bind(...v:unknown[]){return new S(this.q,v);}
  async first<T>(){return (sql.prepare(this.q).get(...this.v as never[])||null) as T|null;}
  async all<T>(){return {results:sql.prepare(this.q).all(...this.v as never[]) as T[]};}
  async run(){return {meta:{changes:Number(sql.prepare(this.q).run(...this.v as never[]).changes)}};}
}
const db:Database={prepare:q=>new S(q),batch:async s=>{sql.exec('BEGIN');try{const r=[];for(const x of s)r.push(await x.run());sql.exec('COMMIT');return r;}catch(e){sql.exec('ROLLBACK');throw e;}}};
const env={EIDOS_GROWTH_DB:db,EIDOS_PLATFORM_TOKEN:'local-controlled-only-secret-0000000000',EIDOS_GROWTH_OWNER_TOKEN:'local-controlled-owner-secret-0000000000',TURNSTILE_SECRET_KEY:'local-controlled-widget-secret',EIDOS_INQUIRY_MAILER:{fetch:(async()=>Response.json({ok:true,receipt:crypto.randomUUID()})) as typeof fetch}};
const root=resolve('dist');
const types:Record<string,string>={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain','.jpg':'image/jpeg','.mp4':'video/mp4'};
createServer(async(req,res)=>{
  try {
    const url=new URL(req.url||'/','http://127.0.0.1:8788');const chunks=[];for await(const c of req)chunks.push(c);const raw=Buffer.concat(chunks);
    const request=new Request(url,{method:req.method,headers:req.headers as Record<string,string>,...(!['GET','HEAD'].includes(req.method||'GET')?{body:raw}:{} )});
    let response:Response;
    if(url.pathname==='/api/growth/events') response=await growthEndpoint({request,env});
    else if(url.pathname==='/api/growth/report') response=await report({request,env});
    else if(url.pathname==='/api/project-inquiries') response=req.method==='POST'?await withInquiryTurnstile(()=>inquiry({request,env}),'127.0.0.1'):Response.json({deliveryConfigured:true,privateMailerConfigured:true});
    else if(url.pathname==='/api/public-config') response=Response.json({gaMeasurementId:'G-8N7Y7EM4CS',turnstileSiteKey:'local-controlled-widget',accountsReady:false,assistantReady:false,aiReady:false,shopReady:false});
    else {
      let file=resolve(root,/^\/(members|snapshot\/result)\//.test(url.pathname) ? 'private-app.html' : '.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+sep)&&file!==root)throw Error('Invalid path');
      if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');
      const exists=existsSync(file);if(!exists)file=resolve(root,'404.html');
      response=new Response(readFileSync(file),{status:exists?200:404,headers:{'content-type':types[extname(file)]||'application/octet-stream'}});
    }
    res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  }catch{res.writeHead(500);res.end('Controlled acceptance server error');}
}).listen(8788,'127.0.0.1',()=>console.log('Controlled growth acceptance server: http://127.0.0.1:8788'));
