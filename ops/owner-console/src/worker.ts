import { createRemoteJWKSet, jwtVerify } from 'jose';
import { html } from './ui';

interface Env {
  EIDOS_OPS_HOST:string;
  EIDOS_OPS_ACCESS_TEAM?:string;
  EIDOS_OPS_ACCESS_AUD?:string;
  EIDOS_OPS_OWNER_SUB?:string;
  EIDOS_OPS_OWNER_EMAIL?:string;
  EIDOS_PLATFORM_URL?:string;
  EIDOS_PLATFORM_TOKEN?:string;
  EIDOS_PLATFORM_PREVIEW_BYPASS?:string;
}
const headers = {'cache-control':'no-store, private','x-content-type-options':'nosniff','x-frame-options':'DENY','referrer-policy':'no-referrer','permissions-policy':'camera=(),microphone=(),geolocation=()','content-security-policy':"default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"};
const response = (body:unknown,status:number) => new Response(JSON.stringify(body),{status,headers:{...headers,'content-type':'application/json; charset=utf-8'}});
const jwks = new Map<string,ReturnType<typeof createRemoteJWKSet>>();
async function owner(request:Request,env:Env) {
  const {EIDOS_OPS_ACCESS_TEAM:team,EIDOS_OPS_ACCESS_AUD:audience,EIDOS_OPS_OWNER_SUB:subject,EIDOS_OPS_OWNER_EMAIL:email} = env;
  const token = request.headers.get('cf-access-jwt-assertion') || '';
  if (!team || !/^[a-z0-9-]{3,80}$/.test(team) || !audience || !subject || !email || !token) return false;
  const issuer = `https://${team}.cloudflareaccess.com`;
  let keys=jwks.get(issuer);
  if (!keys) { keys=createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`)); jwks.set(issuer,keys); }
  try { const {payload}=await jwtVerify(token,keys,{issuer,audience,algorithms:['RS256']}); return payload.sub===subject && payload.email===email; }
  catch { return false; }
}
export default {async fetch(request:Request,env:Env):Promise<Response> {
  const url=new URL(request.url);
  if (url.hostname!==env.EIDOS_OPS_HOST || url.protocol!=='https:') return response({error:'Unrecognized host.'},403);
  if (!await owner(request,env)) return response({error:'Owner access required.'},403);
  if (url.pathname==='/' && request.method==='GET') return new Response(html,{headers:{...headers,'content-type':'text/html; charset=utf-8'}});
  if (url.pathname==='/api/operations' && ['GET','POST'].includes(request.method)) {
    if (!env.EIDOS_PLATFORM_URL || !env.EIDOS_PLATFORM_TOKEN || env.EIDOS_PLATFORM_TOKEN.length<32) return response({error:'Backend connector unavailable.'},503);
    let target:URL;
    try { target=new URL(env.EIDOS_PLATFORM_URL); } catch { return response({error:'Backend connector unavailable.'},503); }
    if (target.protocol!=='https:' || !target.hostname.endsWith('.vercel.app') || target.username || target.password || target.search || target.hash) return response({error:'Backend connector unavailable.'},503);
    if (request.method==='POST' && (request.headers.get('origin')!==url.origin || request.headers.get('content-type')?.split(';')[0]!=='application/json')) return response({error:'Origin or content type denied.'},403);
    const body=request.method==='POST'?await request.text():undefined;
    if (body && body.length>8000) return response({error:'Request too large.'},413);
    target.pathname='/api/works/v1/api/operations/console';
    const forwarded=new Headers({'x-eidos-platform-token':env.EIDOS_PLATFORM_TOKEN,'x-eidos-site-origin':url.origin,'cf-access-jwt-assertion':request.headers.get('cf-access-jwt-assertion') || ''});
    if (body) { forwarded.set('content-type','application/json'); forwarded.set('origin',url.origin); forwarded.set('x-ops-csrf','1'); }
    if (env.EIDOS_PLATFORM_PREVIEW_BYPASS) forwarded.set('x-vercel-protection-bypass',env.EIDOS_PLATFORM_PREVIEW_BYPASS);
    try {
      const upstream=await fetch(target,{method:request.method,headers:forwarded,body,redirect:'manual',signal:AbortSignal.timeout(12000)});
      if (upstream.status>=300 && upstream.status<400) return response({error:'Backend redirect denied.'},503);
      return new Response(upstream.body,{status:upstream.status,headers:{...headers,'content-type':'application/json; charset=utf-8'}});
    } catch { return response({error:'Backend connector timeout or unavailable.'},503); }
  }
  return response({error:'Not found.'},404);
}};
