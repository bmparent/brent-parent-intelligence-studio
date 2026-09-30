// Local visual preview. Billing and sign-in stay unavailable; no fake account is offered.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('public');const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
  res.setHeader('content-security-policy',"default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self'; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  res.setHeader('x-content-type-options','nosniff');
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/')){res.setHeader('content-type','application/json');res.setHeader('cache-control','no-store');
    if(url.pathname==='/api/config'){res.end(JSON.stringify({environment:'test',priceCents:1900,checkoutEnabled:false,signInEnabled:false}));return;}
    res.statusCode=url.pathname==='/api/me'?401:503;res.end(JSON.stringify({error:'Saved workspaces and billing are not configured in this local preview.'}));return;
  }
  try{const path=resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!path.startsWith(root+'/'))throw Error();const data=await readFile(path);res.setHeader('content-type',types[extname(path)]||'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end('Not found');}
});
server.listen(Number(process.env.QUOTE_PREVIEW_PORT||4178),'0.0.0.0',()=>process.stdout.write('Quote Desk local preview: http://localhost:4178\n'));
