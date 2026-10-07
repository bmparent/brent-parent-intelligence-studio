import Stripe from 'stripe';
import { normalize, estimate } from './public/estimator.mjs';

const API_VERSION='2026-08-26.dahlia';
const DAY=86400;
const objectId=value=>typeof value==='string'?value:value?.id;
class HttpError extends Error { constructor(status,message){super(message);this.status=status;} }
const fail=(status,message)=>{throw new HttpError(status,message);};
const now=()=>Math.floor(Date.now()/1000);
const bounded=(value,fallback,min,max)=>{const n=Number(value);return Number.isInteger(n)&&n>=min&&n<=max?n:fallback;};
const randomToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer','x-content-type-options':'nosniff'}});
export async function hash(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),x=>x.toString(16).padStart(2,'0')).join('');}
async function textBody(request,max=20000){
  if(Number(request.headers.get('content-length'))>max)fail(413,'The request is too large.');
  const reader=request.body?.getReader();if(!reader)return '';
  const chunks=[];let size=0;
  try {for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();fail(413,'The request is too large.');}chunks.push(value);}}
  finally{reader.releaseLock();}
  const output=new Uint8Array(size);let offset=0;for(const c of chunks){output.set(c,offset);offset+=c.length;}return new TextDecoder().decode(output);
}
async function body(request){
  if(!request.headers.get('content-type')?.startsWith('application/json'))fail(415,'Send a JSON request.');
  let result;try{result=JSON.parse(await textBody(request));}catch(e){if(e instanceof HttpError)throw e;fail(400,'The request could not be read.');}
  if(!result||typeof result!=='object'||Array.isArray(result))fail(400,'The request could not be read.');return result;
}
function database(env){if(!env.QUOTE_DB)fail(503,'Saved workspaces are being prepared.');return env.QUOTE_DB;}
function site(env){try{const u=new URL(env.QUOTE_SITE_ORIGIN);if(u.protocol==='https:'||(env.QUOTE_ENVIRONMENT==='test'&&['localhost','127.0.0.1'].includes(u.hostname)))return u.origin;}catch{}fail(503,'This workspace is being prepared.');}
function assertOrigin(request,env){if(request.headers.get('origin')!==site(env)||new URL(request.url).origin!==site(env))fail(403,'Use the Quote Desk website for this request.');}
function local(request,env){return env.QUOTE_ENVIRONMENT==='test'&&['localhost','127.0.0.1'].includes(new URL(request.url).hostname);}
function cookieName(request,env){return local(request,env)?'quote_local':'__Host-quote_session';}
function sessionCookie(request,env,token,age=30*DAY){return `${cookieName(request,env)}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${local(request,env)?'':'; Secure'}`;}
async function account(request,env){
  const cookies=request.headers.get('cookie')||'';const token=cookies.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName(request,env)+'='))?.split('=')[1];
  if(!/^[a-f0-9]{64}$/.test(token||''))fail(401,'Sign in to your workspace.');
  const row=await database(env).prepare('SELECT a.* FROM quote_accounts a JOIN quote_sessions s ON s.account_id=a.id WHERE s.token_hash=? AND s.expires_at>?').bind(await hash(token),now()).first();
  if(!row)fail(401,'Sign in to your workspace.');return row;
}
async function quota(env,bucket,limit,seconds=DAY){
  const period=Math.floor(now()/seconds);
  const row=await database(env).prepare('INSERT INTO quote_quotas(bucket,period,used,expires_at) VALUES(?,?,1,?) ON CONFLICT(bucket,period) DO UPDATE SET used=used+1 WHERE used<? RETURNING used').bind(bucket,period,(period+2)*seconds,limit).first();
  if(!row)fail(429,'Please wait before trying again.');
}
async function fingerprint(request,env){
  if(!env.QUOTE_RATE_SECRET||env.QUOTE_RATE_SECRET.length<32)fail(503,'Sign in is being prepared.');
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.QUOTE_RATE_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${Math.floor(now()/DAY)}:${request.headers.get('CF-Connecting-IP')||'unknown'}`))),x=>x.toString(16).padStart(2,'0')).join('');
}
async function challenge(request,env,token,fetcher){
  if(local(request,env))return;
  if(!env.TURNSTILE_SECRET_KEY||typeof token!=='string'||!token||token.length>2048)fail(400,'Complete the sign in verification.');
  const res=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:token,remoteip:request.headers.get('CF-Connecting-IP')||''}),signal:AbortSignal.timeout(8000)});
  const value=await res.json();if(!res.ok||!value.success||value.hostname!==new URL(site(env)).hostname||value.action!=='quote_login')fail(400,'Verification expired. Please try again.');
}
export function getStripe(env){
  const live=env.QUOTE_ENVIRONMENT==='live';
  if(!['live','test'].includes(env.QUOTE_ENVIRONMENT)||!env.STRIPE_RESTRICTED_KEY?.startsWith(live?'rk_live_':'rk_test_'))fail(503,'Billing is being prepared.');
  return new Stripe(env.STRIPE_RESTRICTED_KEY,{apiVersion:API_VERSION,httpClient:Stripe.createFetchHttpClient(),maxNetworkRetries:1,timeout:10000});
}
export function subscriptionAccess(sub,env,time=now()){
  const item=sub.items?.data?.[0];const invoice=sub.latest_invoice;
  return sub.status==='active'&&!sub.pause_collection&&sub.livemode===(env.QUOTE_ENVIRONMENT==='live')&&
    sub.items?.data?.length===1&&item?.price?.id===env.STRIPE_PRICE_ID&&item.quantity===1&&
    item.price.currency==='usd'&&item.price.unit_amount===1900&&item.price.recurring?.interval==='month'&&
    (item.price.recurring.interval_count||1)===1&&item.current_period_end>time&&
    invoice&&typeof invoice==='object'&&invoice.status==='paid'&&invoice.amount_paid>0;
}
async function syncSubscription(env,stripe,id){
  if(!/^sub_[A-Za-z0-9]+$/.test(id||''))return null;
  const sub=await stripe.subscriptions.retrieve(id,{expand:['latest_invoice','items.data.price']});
  if(sub.livemode!==(env.QUOTE_ENVIRONMENT==='live'))fail(400,'The billing environment does not match.');
  const customer=objectId(sub.customer);
  const deleted=await database(env).prepare('SELECT customer_id FROM quote_deleted_customers WHERE customer_id=?').bind(customer).first();
  if(deleted){
    if(sub.items?.data?.some(i=>i.price?.id===env.STRIPE_PRICE_ID)&&!['canceled','incomplete_expired'].includes(sub.status))await stripe.subscriptions.cancel(sub.id);
    await database(env).prepare('UPDATE quote_subscriptions SET access_blocked=1,paid_through=0 WHERE customer_id=?').bind(customer).run();
    return null;
  }
  const owner=await database(env).prepare('SELECT * FROM quote_accounts WHERE stripe_customer_id=?').bind(customer).first();
  if(!owner)return null;
  const valid=subscriptionAccess(sub,env);const through=valid?sub.items.data[0].current_period_end:0;
  await database(env).prepare('INSERT INTO quote_subscriptions(id,account_id,customer_id,status,paid_through,checked_at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,paid_through=excluded.paid_through,checked_at=excluded.checked_at WHERE account_id=excluded.account_id AND customer_id=excluded.customer_id').bind(sub.id,owner.id,customer,sub.status,through,now()).run();
  return {sub,owner};
}
async function refreshAccount(env,stripe,owner){
  if(!owner.stripe_customer_id)return false;
  if(await database(env).prepare('SELECT customer_id FROM quote_deleted_customers WHERE customer_id=?').bind(owner.stripe_customer_id).first())return false;
  const subscriptions=await stripe.subscriptions.list({customer:owner.stripe_customer_id,status:'all',limit:100});
  if(subscriptions.has_more)fail(503,'Your billing history needs a support review.');
  for(const sub of subscriptions.data){if(sub.items?.data?.some(i=>i.price?.id===env.STRIPE_PRICE_ID))await syncSubscription(env,stripe,sub.id);}
  const row=await database(env).prepare("SELECT id FROM quote_subscriptions WHERE account_id=? AND status='active' AND paid_through>? AND access_blocked=0 LIMIT 1").bind(owner.id,now()).first();
  return Boolean(row);
}
async function requirePaid(request,env,stripe,owner){await quota(env,'billing-read:'+owner.id,60,3600);if(!await refreshAccount(env,stripe,owner))fail(402,'An active paid subscription is required to save work. Your saved data can still be exported.');}
export function liveMerchantReady(owner){
  const requirements=owner?.requirements||{};
  const unresolved=['currently_due','past_due','pending_verification'].some(key=>Array.isArray(requirements[key])&&requirements[key].length>0);
  const usableBankStatuses=new Set(['new','validated','verified']);
  const payoutBank=owner?.external_accounts?.data?.some(account=>account?.object==='bank_account'&&account.deleted!==true&&usableBankStatuses.has(account.status));
  return owner?.details_submitted===true&&owner?.charges_enabled===true&&owner?.payouts_enabled===true&&!requirements.disabled_reason&&!unresolved&&payoutBank===true;
}
export function productAttributionReady(price,expectedName){
  const product=price?.product;
  return Boolean(typeof expectedName==='string'&&expectedName.length>0&&product&&typeof product==='object'&&product.deleted!==true&&product.active===true&&product.name===expectedName);
}
async function checkoutReady(env,stripe){
  if(env.QUOTE_CHECKOUT_ENABLED!=='true'||!env.STRIPE_PRICE_ID||!env.STRIPE_PRODUCT_NAME||!env.STRIPE_ACCOUNT_ID||!env.STRIPE_WEBHOOK_SECRET||!env.STRIPE_PORTAL_CONFIGURATION_ID||(env.QUOTE_ENVIRONMENT==='live'&&!env.STRIPE_MERCHANT_PROFILE_NAME))fail(503,'Checkout is being prepared. The free estimator is available now.');
  const [price,owner,portal]=await Promise.all([stripe.prices.retrieve(env.STRIPE_PRICE_ID,{expand:['product']}),stripe.accounts.retrieve(null,{expand:['external_accounts']}),stripe.billingPortal.configurations.retrieve(env.STRIPE_PORTAL_CONFIGURATION_ID)]);
  if(owner.id!==env.STRIPE_ACCOUNT_ID)fail(503,'The payment account has not been verified.');
  if(env.QUOTE_ENVIRONMENT==='live'&&owner.business_profile?.name!==env.STRIPE_MERCHANT_PROFILE_NAME)fail(503,'The payment account has not been attributed to Eidos Works.');
  if(env.QUOTE_ENVIRONMENT==='live'&&!liveMerchantReady(owner))fail(503,'The payment account is not ready to accept and settle funds.');
  if(!productAttributionReady(price,env.STRIPE_PRODUCT_NAME))fail(503,'The subscription product has not been verified.');
  if(!price.active||price.livemode!==(env.QUOTE_ENVIRONMENT==='live')||price.currency!=='usd'||price.unit_amount!==1900||price.recurring?.interval!=='month'||price.recurring.interval_count!==1)fail(503,'The subscription price has not been verified.');
  if(!portal.active||portal.features?.subscription_cancel?.enabled!==true||portal.features.subscription_cancel.mode!=='at_period_end')fail(503,'Self-service cancellation has not been verified.');
  if(portal.features?.payment_method_update?.enabled!==true)fail(503,'Self-service payment recovery has not been verified.');
}
function hostedUrl(value,host){let u;try{u=new URL(value);}catch{fail(502,'The billing link was invalid.');}if(u.protocol!=='https:'||u.hostname!==host)fail(502,'The billing link was invalid.');return u.href;}
async function chargeSubscriptions(stripe,chargeId){
  const charge=await stripe.charges.retrieve(chargeId);const intent=objectId(charge.payment_intent);if(!intent)return {charge,ids:[]};
  const payments=await stripe.invoicePayments.list({payment:{type:'payment_intent',payment_intent:intent},limit:100});
  if(payments.has_more)fail(503,'The payment mapping needs review.');
  const ids=new Set();
  for(const payment of payments.data){const invoice=await stripe.invoices.retrieve(objectId(payment.invoice));const id=objectId(invoice.parent?.subscription_details?.subscription);if(id)ids.add(id);}
  return {charge,ids:[...ids]};
}
export async function processEvent(env,stripe,event){
  if(event.livemode!==(env.QUOTE_ENVIRONMENT==='live')||(event.account&&event.account!==env.STRIPE_ACCOUNT_ID)||event.api_version!==API_VERSION)fail(400,'The webhook environment or version does not match.');
  const db=database(env);const previous=await db.prepare('SELECT processed_at FROM quote_webhook_events WHERE id=?').bind(event.id).first();if(previous?.processed_at)return;
  await db.prepare('INSERT INTO quote_webhook_events(id,type,received_at) VALUES(?,?,?) ON CONFLICT(id) DO NOTHING').bind(event.id,event.type,now()).run();
  const value=event.data.object;let subId;
  if(event.type.startsWith('customer.subscription.'))subId=value.id;
  if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)&&value.mode==='subscription'&&value.payment_status==='paid')subId=objectId(value.subscription);
  if(['invoice.paid','invoice.payment_failed','invoice.finalization_failed'].includes(event.type))subId=objectId(value.parent?.subscription_details?.subscription);
  if(subId)await syncSubscription(env,stripe,subId);
  if(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.expired'].includes(event.type))await db.prepare('DELETE FROM quote_checkout_locks WHERE attempt_id IN (SELECT id FROM quote_checkout_attempts WHERE session_id=?)').bind(value.id).run();
  if(['charge.refunded','charge.dispute.created','radar.early_fraud_warning.created'].includes(event.type)){
    const chargeId=event.type==='charge.refunded'?value.id:objectId(value.charge);
    const {charge,ids}=await chargeSubscriptions(stripe,chargeId);
    const revoke=event.type==='charge.refunded'?charge.refunded===true: event.type==='radar.early_fraud_warning.created'?value.actionable===true:true;
    if(revoke){for(const id of ids){const result=await syncSubscription(env,stripe,id);if(!result||!result.sub.items.data.some(i=>i.price.id===env.STRIPE_PRICE_ID))continue;
      await db.prepare('UPDATE quote_subscriptions SET access_blocked=1 WHERE id=? AND account_id=?').bind(id,result.owner.id).run();
      if(!['canceled','incomplete_expired'].includes(result.sub.status))await stripe.subscriptions.cancel(id);
      await syncSubscription(env,stripe,id);
    }}
  }
  await db.prepare('UPDATE quote_webhook_events SET processed_at=? WHERE id=?').bind(now(),event.id).run();
}
export function createWorker(services={}){
  const stripeFor=services.stripeFactory||getStripe;const fetcher=services.fetch||fetch;
  return {
    async fetch(request,env){
      const url=new URL(request.url);const path=url.pathname;
      try {
        if(!path.startsWith('/api/')){
          const res=await env.ASSETS.fetch(request);const headers=new Headers(res.headers);
          headers.set('content-security-policy',"default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self'; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
          headers.set('referrer-policy','no-referrer');headers.set('x-content-type-options','nosniff');return new Response(res.body,{status:res.status,headers});
        }
        if(path==='/api/config'&&request.method==='GET')return json({environment:env.QUOTE_ENVIRONMENT||'test',priceCents:1900,checkoutEnabled:env.QUOTE_CHECKOUT_ENABLED==='true',signInEnabled:Boolean(env.QUOTE_DB&&env.RESEND_API_KEY&&env.QUOTE_MAIL_FROM&&env.QUOTE_RATE_SECRET),turnstileSiteKey:env.TURNSTILE_SITE_KEY||null});
        if(path==='/api/webhook'&&request.method==='POST'){
          if(!env.STRIPE_WEBHOOK_SECRET)fail(503,'Webhook verification is not configured.');
          const raw=await textBody(request,256000);const stripe=stripeFor(env);let event;
          try{event=await stripe.webhooks.constructEventAsync(raw,request.headers.get('stripe-signature')||'',env.STRIPE_WEBHOOK_SECRET,300,Stripe.createSubtleCryptoProvider());}catch{fail(400,'The webhook signature was invalid.');}
          await processEvent(env,stripe,event);return json({received:true});
        }
        if(!['GET','POST','PUT','DELETE'].includes(request.method))fail(405,'Method not supported.');
        if(request.method!=='GET')assertOrigin(request,env);
        if(path==='/api/login'&&request.method==='POST'){
          const input=await body(request);const email=typeof input.email==='string'?input.email.trim().toLowerCase():'';
          if(!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,63}$/.test(email)||email.length>254)fail(400,'Enter your email address.');
          if(!env.RESEND_API_KEY||!env.QUOTE_MAIL_FROM)fail(503,'Email sign in is being prepared.');
          await challenge(request,env,input.challenge,fetcher);
          await quota(env,'login-ip:'+await fingerprint(request,env),10);
          await quota(env,'login-email:'+await hash(env.QUOTE_RATE_SECRET+email),5);
          await quota(env,'login-global',bounded(env.QUOTE_MAX_EMAILS_PER_DAY,100,1,1000));
          const token=randomToken();await database(env).prepare('INSERT INTO quote_login_links(token_hash,email,expires_at) VALUES(?,?,?)').bind(await hash(token),email,now()+900).run();
          const link=site(env)+'/#login='+token;
          const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{authorization:'Bearer '+env.RESEND_API_KEY,'content-type':'application/json','idempotency-key':'quote-login-'+await hash(token)},body:JSON.stringify({from:env.QUOTE_MAIL_FROM,to:[email],subject:'Sign in to Eidos Quote Desk',text:`Open this link to sign in. It expires in 15 minutes and works once.\n\n${link}\n\nIf you did not request this, ignore this email.`}),signal:AbortSignal.timeout(10000)});
          if(!response.ok)fail(503,'The sign in email could not be delivered. Please try again shortly.');
          return json({message:'Check your email for a sign in link.'});
        }
        if(path==='/api/login/verify'&&request.method==='POST'){
          const input=await body(request);if(!/^[a-f0-9]{64}$/.test(input.token||''))fail(400,'The sign in link is invalid.');
          const db=database(env);const link=await db.prepare('UPDATE quote_login_links SET used_at=? WHERE token_hash=? AND used_at IS NULL AND expires_at>? RETURNING email').bind(now(),await hash(input.token),now()).first();
          if(!link)fail(400,'This sign in link expired or was already used.');
          await db.prepare('INSERT INTO quote_accounts(id,email,created_at) SELECT ?,?,? WHERE (SELECT COUNT(*) FROM quote_accounts)<? ON CONFLICT(email) DO NOTHING').bind(crypto.randomUUID(),link.email,now(),bounded(env.QUOTE_MAX_ACCOUNTS,5000,1,50000)).run();
          const owner=await db.prepare('SELECT * FROM quote_accounts WHERE email=?').bind(link.email).first();if(!owner)fail(503,'New workspaces are temporarily full. Contact Eidos Works.');
          const token=randomToken();await db.prepare('INSERT INTO quote_sessions(token_hash,account_id,expires_at) VALUES(?,?,?)').bind(await hash(token),owner.id,now()+30*DAY).run();
          const response=json({email:owner.email});response.headers.set('set-cookie',sessionCookie(request,env,token));return response;
        }
        const owner=await account(request,env);const db=database(env);
        if(path==='/api/logout'&&request.method==='POST'){
          const token=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName(request,env)+'='))?.split('=')[1];
          await db.prepare('DELETE FROM quote_sessions WHERE token_hash=?').bind(await hash(token)).run();const res=json({signedOut:true});res.headers.set('set-cookie',sessionCookie(request,env,'',0));return res;
        }
        if(path==='/api/me'&&request.method==='GET'){
          await quota(env,'me:'+owner.id,120,3600);
          let paid=false,billingStatus='not_started';
          if(owner.stripe_customer_id){
            try{paid=await refreshAccount(env,stripeFor(env),owner);billingStatus=paid?'active':'inactive';}
            catch{paid=null;billingStatus='unavailable';}
          }
          return json({email:owner.email,paid,billingStatus,hasBillingAccount:Boolean(owner.stripe_customer_id)});
        }
        if(path==='/api/checkout'&&request.method==='POST'){
          const input=await body(request);if(input.acceptTerms!==true)fail(400,'Accept the subscription terms first.');
          if(!/^[a-f0-9-]{36}$/.test(input.attemptId||''))fail(400,'Start a new checkout.');
          const stripe=stripeFor(env);await checkoutReady(env,stripe);await quota(env,'checkout:'+owner.id,5);
          if(owner.stripe_customer_id&&await db.prepare('SELECT customer_id FROM quote_deleted_customers WHERE customer_id=?').bind(owner.stripe_customer_id).first())fail(409,'Account deletion is pending. Complete deletion before opening a new workspace.');
          if(!owner.stripe_customer_id){const customer=await stripe.customers.create({email:owner.email},{idempotencyKey:'quote-customer-'+owner.id});await db.prepare('UPDATE quote_accounts SET stripe_customer_id=? WHERE id=? AND stripe_customer_id IS NULL').bind(customer.id,owner.id).run();owner.stripe_customer_id=customer.id;}
          const subscriptions=await stripe.subscriptions.list({customer:owner.stripe_customer_id,status:'all',limit:100});
          if(subscriptions.has_more||subscriptions.data.some(s=>s.items.data.some(i=>i.price.id===env.STRIPE_PRICE_ID)&&!['canceled','incomplete_expired'].includes(s.status)))fail(409,'You already have a subscription or pending payment. Use Manage billing.');
          const prior=await db.prepare('SELECT * FROM quote_checkout_attempts WHERE id=?').bind(input.attemptId).first();
          if(prior&&prior.account_id!==owner.id)fail(409,'Start a new checkout.');
          if(prior&&prior.expires_at<=now())fail(409,'This checkout expired. Start a new checkout.');
          const lock=await db.prepare('INSERT INTO quote_checkout_locks(account_id,attempt_id,expires_at) VALUES(?,?,?) ON CONFLICT(account_id) DO UPDATE SET attempt_id=excluded.attempt_id,expires_at=excluded.expires_at WHERE expires_at<=? OR attempt_id=excluded.attempt_id RETURNING attempt_id').bind(owner.id,input.attemptId,prior?.expires_at||now()+1800,now()).first();
          if(!lock){
            const current=await db.prepare('SELECT a.url FROM quote_checkout_attempts a JOIN quote_checkout_locks l ON l.attempt_id=a.id AND l.account_id=a.account_id WHERE l.account_id=?').bind(owner.id).first();
            if(current?.url)return json({url:current.url});
            fail(409,'A checkout is already being prepared for this workspace. Wait a moment and try again.');
          }
          if(prior?.url)return json({url:prior.url});
          const tag=Array.from(crypto.getRandomValues(new Uint8Array(8)),x=>String.fromCharCode(97+x%26)).join('');
          await db.prepare('INSERT INTO quote_checkout_attempts(id,account_id,created_at,expires_at,integration_tag) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(input.attemptId,owner.id,now(),now()+1800,tag).run();
          const attempt=await db.prepare('SELECT * FROM quote_checkout_attempts WHERE id=? AND account_id=?').bind(input.attemptId,owner.id).first();
          if(!attempt)fail(409,'Start a new checkout.');
          if(await db.prepare('SELECT customer_id FROM quote_deleted_customers WHERE customer_id=?').bind(owner.stripe_customer_id).first())fail(409,'Account deletion is pending.');
          const session=await stripe.checkout.sessions.create({mode:'subscription',customer:owner.stripe_customer_id,client_reference_id:owner.id,line_items:[{price:env.STRIPE_PRICE_ID,quantity:1}],success_url:site(env)+'/?checkout=returned',cancel_url:site(env)+'/?checkout=cancelled',expires_at:attempt.expires_at,integration_identifier:'eidos-quote-desk-'+attempt.integration_tag},{idempotencyKey:'quote-checkout-'+input.attemptId});
          const checkoutUrl=hostedUrl(session.url,'checkout.stripe.com');
          await db.prepare('UPDATE quote_checkout_attempts SET session_id=?,url=? WHERE id=? AND account_id=?').bind(session.id,checkoutUrl,input.attemptId,owner.id).run();return json({url:checkoutUrl});
        }
        if(path==='/api/portal'&&request.method==='POST'){
          if(!owner.stripe_customer_id||!env.STRIPE_PORTAL_CONFIGURATION_ID)fail(409,'There is no billing account to manage yet.');
          await quota(env,'portal:'+owner.id,20,3600);
          const portal=await stripeFor(env).billingPortal.sessions.create({customer:owner.stripe_customer_id,configuration:env.STRIPE_PORTAL_CONFIGURATION_ID,return_url:site(env)+'/'});
          return json({url:hostedUrl(portal.url,'billing.stripe.com')});
        }
        if(path==='/api/records'&&request.method==='GET'){
          const {results}=await db.prepare('SELECT id,kind,name,payload,revision,created_at,updated_at FROM quote_records WHERE account_id=? ORDER BY updated_at DESC LIMIT 500').bind(owner.id).all();
          return json({records:results.map(r=>({...r,input:JSON.parse(r.payload),payload:undefined}))});
        }
        if(path==='/api/records'&&request.method==='POST'){
          const input=await body(request);await requirePaid(request,env,stripeFor(env),owner);
          if(!['quote','preset'].includes(input.kind)||typeof input.name!=='string'||!input.name.trim()||input.name.length>150)fail(400,'Give this quote or preset a name.');
          let parameters;try{parameters=normalize(input.input);}catch(e){fail(400,e.message);}
          const id=crypto.randomUUID();const created=now();
          const record=await db.prepare('INSERT INTO quote_records(id,account_id,kind,name,payload,created_at,updated_at) SELECT ?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM quote_records WHERE account_id=?)<? RETURNING id').bind(id,owner.id,input.kind,input.name.trim(),JSON.stringify(parameters),created,created,owner.id,bounded(env.QUOTE_MAX_RECORDS,500,1,500)).first();
          if(!record)fail(409,'This workspace has reached 500 saved records. Export or remove old records first.');
          return json({id,revision:1,estimate:estimate(parameters)},201);
        }
        const match=path.match(/^\/api\/records\/([a-f0-9-]{36})$/);
        if(match&&['PUT','DELETE'].includes(request.method)){
          const input=await body(request);if(!Number.isInteger(input.revision)||input.revision<1)fail(400,'Reload this saved record first.');
          if(request.method==='DELETE'){
            const deleted=await db.prepare('DELETE FROM quote_records WHERE id=? AND account_id=? AND revision=? RETURNING id').bind(match[1],owner.id,input.revision).first();if(!deleted)fail(409,'This record changed or is unavailable. Reload your saved work.');return json({deleted:true});
          }
          await requirePaid(request,env,stripeFor(env),owner);let parameters;try{parameters=normalize(input.input);}catch(e){fail(400,e.message);}
          if(typeof input.name!=='string'||!input.name.trim()||input.name.length>150)fail(400,'Give this record a name.');
          const changed=await db.prepare('UPDATE quote_records SET name=?,payload=?,revision=revision+1,updated_at=? WHERE id=? AND account_id=? AND revision=? RETURNING revision').bind(input.name.trim(),JSON.stringify(parameters),now(),match[1],owner.id,input.revision).first();if(!changed)fail(409,'This record changed or is unavailable. Reload your saved work.');return json(changed);
        }
        if(path==='/api/account'&&request.method==='DELETE'){
          const input=await body(request);if(input.confirmEmail!==owner.email)fail(400,'Confirm your account email before deleting.');
          if(owner.stripe_customer_id){const stripe=stripeFor(env);
            await db.prepare('INSERT INTO quote_deleted_customers(customer_id,requested_at) VALUES(?,?) ON CONFLICT(customer_id) DO NOTHING').bind(owner.stripe_customer_id,now()).run();
            await db.prepare('UPDATE quote_subscriptions SET access_blocked=1,paid_through=0 WHERE account_id=?').bind(owner.id).run();
            const pending=await db.prepare('SELECT session_id FROM quote_checkout_attempts WHERE account_id=? AND expires_at>? AND session_id IS NOT NULL').bind(owner.id,now()).all();
            for(const attempt of pending.results){const session=await stripe.checkout.sessions.retrieve(attempt.session_id);if(session.status==='open')await stripe.checkout.sessions.expire(session.id);}
            const subs=await stripe.subscriptions.list({customer:owner.stripe_customer_id,status:'all',limit:100});if(subs.has_more)fail(503,'Billing deletion needs support review.');for(const s of subs.data){if(s.items.data.some(i=>i.price.id===env.STRIPE_PRICE_ID)&&!['canceled','incomplete_expired'].includes(s.status))await stripe.subscriptions.cancel(s.id);}}
          await db.batch([
            db.prepare('DELETE FROM quote_sessions WHERE account_id=?').bind(owner.id),
            db.prepare('DELETE FROM quote_records WHERE account_id=?').bind(owner.id),
            db.prepare('DELETE FROM quote_subscriptions WHERE account_id=?').bind(owner.id),
            db.prepare('DELETE FROM quote_checkout_locks WHERE account_id=?').bind(owner.id),
            db.prepare('DELETE FROM quote_checkout_attempts WHERE account_id=?').bind(owner.id),
            db.prepare('DELETE FROM quote_login_links WHERE email=?').bind(owner.email),
            db.prepare('DELETE FROM quote_accounts WHERE id=?').bind(owner.id)
          ]);const res=json({deleted:true});res.headers.set('set-cookie',sessionCookie(request,env,'',0));return res;
        }
        fail(404,'This endpoint does not exist.');
      }catch(error){return json({error:error instanceof HttpError?error.message:'This service is temporarily unavailable. Your unsaved estimate remains on this page.'},error instanceof HttpError?error.status:503);}
    },
    async scheduled(_controller,env){const db=database(env);await db.batch([
      db.prepare('DELETE FROM quote_login_links WHERE expires_at<?').bind(now()-DAY),
      db.prepare('DELETE FROM quote_sessions WHERE expires_at<?').bind(now()),
      db.prepare('DELETE FROM quote_quotas WHERE expires_at<?').bind(now())
    ]);}
  };
}
export default createWorker();
