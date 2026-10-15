import {writeFile,mkdir} from 'node:fs/promises';
const root='artifacts/implementation/2026-09-21';
await mkdir(root,{recursive:true});
const headers={};
for(const path of ['/','/services/business-systems/','/api/public-config']) {
 const r=await fetch('https://eidos-works.com'+path,{signal:AbortSignal.timeout(20000)});
 headers[path]={status:r.status,headers:Object.fromEntries([...r.headers].filter(([key])=>['content-security-policy','content-security-policy-report-only','x-frame-options','strict-transport-security','referrer-policy','permissions-policy','x-content-type-options','content-type','cache-control'].includes(key)))};
}
await writeFile(root+'/live-headers.json',JSON.stringify({at:new Date().toISOString(),environment:'canonical production before candidate release',headers},null,2));
await writeFile(root+'/payment-inventory.json',JSON.stringify({observed:'2026-09-21',source:'read-only Stripe connector GetWebhookEndpoints',environment:'live',account:'acct_1Rj03gKC8pRG5Tr9',endpoints:[{id:'we_1UCTRjKC8pRG5Tr9KUpT4H8F',destination:'https://eidos-works.com/api/shop/webhook',status:'enabled',apiVersion:null,events:['checkout.session.completed','checkout.session.async_payment_succeeded','charge.refunded','charge.dispute.created']},{id:'we_1S04yaKC8pRG5Tr9lCSZGpLS',destination:'legacy Replit development host /webhook/sale (full host omitted)',status:'enabled',apiVersion:null,events:['checkout.session.completed','payment_intent.succeeded'],purpose:'owner confirmation required'}],changes:'none',limits:'No provider TEST checkout, live charge, API-version change or endpoint deletion performed.'},null,2));
console.log('Saved production header and redacted payment inventory receipts.');
