import {defaults,inputLimits,normalize,estimate,capacity} from './estimator.mjs';
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const duration=n=>`${(n/3600).toFixed(1)} h`;
const labels={quantity:'Quantity',stitches:'Stitches per item',heads:'Active machine heads',rpm:'Stitches per minute',efficiency:'Run efficiency (%)',margin:'Target gross margin (%)',colorChanges:'Color changes per cycle',colorChangeSeconds:'Seconds per color change',breakSecondsPerThousand:'Break seconds / 1,000 stitches',setupSeconds:'Setup seconds / job',hoopSeconds:'Hoop seconds / item',removeSeconds:'Unhoop seconds / item',finishSeconds:'Finish + pack seconds / item',operators:'Handling operators',buffer:'Time buffer (%)',laborHourly:'Labor cost / hour ($)',machineHourly:'Machine cost / hour ($)',overheadHourly:'Other overhead / hour ($)',blankUnit:'Blank cost / item ($)',materialsUnit:'Materials / item ($)',digitizing:'Digitizing cost / job ($)',shipping:'Shipping cost / job ($)',spoilage:'Materials spoilage (%)'};
const percent=new Set(['efficiency','margin','buffer','spoilage']);
const integer=new Set(['quantity','stitches','heads','operators','colorChanges']);
const mainKeys=['quantity','stitches','heads','rpm','efficiency','margin'];
let parameters={...defaults},saved=[],user=null,config=null,challengeToken=null,loginToken=null,quoteResult=null,checkoutAttempt=null;
try { const stored=JSON.parse(localStorage.getItem('eidos-quote-draft'));if(stored){parameters=normalize(stored.input||stored);if(stored.schema==='eidos_quote_draft_v2'&&typeof stored.name==='string')$('job-name').value=stored.name.slice(0,150);} } catch{}
for(const [key,label]of Object.entries(labels)){
  const wrapper=document.createElement('label');wrapper.textContent=label;
  const input=document.createElement('input');input.type='number';input.name=key;input.id='field-'+key;input.step=integer.has(key)?'1':'0.01';
  const [min,max]=inputLimits[key],scale=percent.has(key)?100:1;input.min=String(min*scale);input.max=String(max*scale);input.required=true;input.setAttribute('aria-label',label);
  const error=document.createElement('span');error.id='error-'+key;error.className='field-error';error.hidden=true;
  input.value=String(percent.has(key)?parameters[key]*100:parameters[key]);wrapper.append(input,error);$(mainKeys.includes(key)?'main-fields':'advanced-fields').append(wrapper);
}
function notice(message){$('status').textContent=message;clearTimeout(notice.timer);notice.timer=setTimeout(()=>{$('status').textContent='';},13000);}
function readForm(){const output={};for(const key of Object.keys(labels)){const value=$('field-'+key).value;output[key]=value===''?NaN:Number(value)/(percent.has(key)?100:1);}return normalize(output);}
function clearErrors(){for(const key of Object.keys(labels)){$('field-'+key).removeAttribute('aria-invalid');$('field-'+key).removeAttribute('aria-describedby');$('error-'+key).hidden=true;}$('input-error').hidden=true;}
function showInputError(error){
  if(!error.field)return error.message;
  const key=error.field,[min,max,whole]=inputLimits[key],scale=percent.has(key)?100:1;
  const range=n=>new Intl.NumberFormat('en-US').format(n*scale)+(percent.has(key)?'%':'');
  const message=`${labels[key]}: enter ${whole?'a whole number':'a number'} from ${range(min)} to ${range(max)}.`;
  $('field-'+key).setAttribute('aria-invalid','true');$('field-'+key).setAttribute('aria-describedby','error-'+key);
  $('error-'+key).textContent=message;$('error-'+key).hidden=false;
  if(!mainKeys.includes(key))$('advanced-fields').closest('details').open=true;
  $('input-error').hidden=false;$('fix-input').textContent='Fix '+labels[key];$('fix-input').onclick=()=>{$('field-'+key).focus();$('field-'+key).scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});};
  return message;
}
function drawPrintDetails(){
  $('estimate-name').textContent=$('job-name').value.trim()||'Untitled estimate';
  $('estimate-job').textContent=`${parameters.quantity.toLocaleString('en-US')} items · ${parameters.stitches.toLocaleString('en-US')} stitches per item · ${parameters.heads} active head(s)`;
  $('print-assumptions').replaceChildren();
  for(const [key,label] of Object.entries(labels)){
    const term=document.createElement('dt');term.textContent=label;
    const value=document.createElement('dd');value.textContent=new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(parameters[key]*(percent.has(key)?100:1));
    $('print-assumptions').append(term,value);
  }
}
function draw(){
  clearErrors();
  try {parameters=readForm();quoteResult=estimate(parameters);
    try {localStorage.setItem('eidos-quote-draft',JSON.stringify({schema:'eidos_quote_draft_v2',name:$('job-name').value,input:parameters}));$('draft-status').textContent='Job name and inputs are kept in this browser when storage is available. Print or save a PDF to keep this estimate.';}
    catch {$('draft-status').textContent='Browser storage is unavailable. You can still calculate and print; this job name and these inputs will not be kept after you leave.';}
    drawPrintDetails();
    $('quote-price').textContent=money(quoteResult.suggestedTotal);$('unit-price').textContent=money(quoteResult.unitPrice);$('production-time').textContent=duration(quoteResult.elapsedSeconds);$('margin').textContent=(quoteResult.margin*100).toFixed(1)+'%';$('cycles').textContent=String(quoteResult.cycles);
    $('profit').textContent=`${money(quoteResult.grossProfit)} estimated gross profit · ${money(quoteResult.totalCost)} estimated cost`;
    $('cost-bars').replaceChildren();const names={goods:'Goods',labor:'Labor',machine:'Machine',overhead:'Overhead',digitizing:'Digitizing',shipping:'Shipping'};
    for(const [key,value]of Object.entries(quoteResult.costs)){
      const row=document.createElement('div');row.className='cost-row';const label=document.createElement('span');label.textContent=names[key];
      const track=document.createElement('div');track.className='bar-track';track.setAttribute('aria-hidden','true');const bar=document.createElement('div');bar.className='bar';bar.style.width=Math.max(0,value/(quoteResult.totalCost||1)*100)+'%';track.append(bar);
      const amount=document.createElement('span');amount.textContent=money(value);row.append(label,track,amount);$('cost-bars').append(row);
    }
    $('print').disabled=false;
  }catch(error){
    quoteResult=null;$('quote-price').textContent='Check inputs';$('print').disabled=true;$('profit').textContent=showInputError(error);
    for(const id of ['unit-price','production-time','margin','cycles'])$(id).textContent='—';
    $('cost-bars').replaceChildren();
  }
}
$('job-form').addEventListener('submit',event=>event.preventDefault());$('job-form').addEventListener('input',draw);
function apply(input,name){parameters=normalize(input);for(const key of Object.keys(labels))$('field-'+key).value=String(percent.has(key)?parameters[key]*100:parameters[key]);if(name)$('job-name').value=name;draw();$('desk').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});}
$('reset').onclick=()=>apply(defaults,'Sample · 48 embroidered hats');
$('print').onclick=()=>{if(!quoteResult)return;const title=document.title;document.title=($('job-name').value.trim()||'Embroidery estimate')+' — Eidos Quote Desk';window.print();document.title=title;};
async function api(path,options={}){
  const response=await fetch('/api/'+path,{credentials:'same-origin',...options,headers:{'content-type':'application/json',...options.headers}});let payload;
  try{payload=await response.json();}catch{throw Error('This service could not be reached. Your estimate remains on this page.');}
  if(!response.ok){const error=Error(payload.error||'The request could not be completed.');error.status=response.status;throw error;}return payload;
}
function openWorkspace(){$('workspace').hidden=false;$('workspace').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});}
$('account-toggle').onclick=openWorkspace;$('pricing-start').onclick=openWorkspace;$('close-workspace').onclick=()=>{$('workspace').hidden=true;};
async function busy(button,action){button.disabled=true;try{await action();}catch(e){notice(e.message);}finally{button.disabled=false;}}
function drawAccount(){
  $('login-form').hidden=Boolean(user)||Boolean(loginToken);$('verify-panel').hidden=!loginToken;$('signed-in').hidden=!user;
  $('account-toggle').textContent=user?'Saved workspace':'Your workspace';
  if(user){
    const unavailable=user.billingStatus==='unavailable';
    $('identity').textContent=user.email+' · '+(unavailable?'Billing could not be checked. You can still open and export saved work.':user.paid?'Paid access active':'Free estimator · saved data remains exportable');
    $('subscribe').hidden=user.paid||unavailable;$('accept-terms').closest('label').hidden=user.paid||unavailable;
    $('portal').hidden=!user.hasBillingAccount;$('billing-refresh').hidden=false;
  }
}
function attemptId(){if(!checkoutAttempt){try{checkoutAttempt=sessionStorage.getItem('quote-checkout-attempt');}catch{}if(!/^[a-f0-9-]{36}$/.test(checkoutAttempt||''))checkoutAttempt=crypto.randomUUID();try{sessionStorage.setItem('quote-checkout-attempt',checkoutAttempt);}catch{}}return checkoutAttempt;}
function clearAttempt(){checkoutAttempt=null;try{sessionStorage.removeItem('quote-checkout-attempt');}catch{}}
async function refreshWorkspace(){user=await api('me');drawAccount();await loadSaved();return user;}
$('billing-refresh').onclick=()=>busy($('billing-refresh'),async()=>{await refreshWorkspace();notice(user.paid?'Paid access verified. You can save quotes.':user.billingStatus==='unavailable'?'Billing is temporarily unavailable. Your saved work remains available.':'Billing checked. New saves require an active subscription.');});
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}
async function loadSaved(){const result=await api('records');saved=result.records;drawSaved();}
function plan(){const ids=[...document.querySelectorAll('.plan-check:checked')].map(x=>x.value);try{const selected=saved.filter(x=>ids.includes(x.id)&&x.kind==='quote').map(x=>x.input);const result=capacity(selected,Number($('hours-per-day').value));$('capacity-result').textContent=selected.length?`${selected.length} saved job(s) · ${duration(result.seconds)} sequential production · ${result.days.toFixed(2)} production day(s) at your selected hours.`:'Select saved quotes to plan sequential machine time.';}catch(e){$('capacity-result').textContent=e.message;}}
function drawSaved(){
  $('saved-list').replaceChildren();if(!saved.length){const p=document.createElement('p');p.className='small';p.textContent='No saved records yet. Create an estimate, then save a quote or preset.';$('saved-list').append(p);}
  for(const record of saved){
    const row=document.createElement('div');row.className='saved-row';
    if(record.kind==='quote'){const check=document.createElement('input');check.type='checkbox';check.className='plan-check';check.value=record.id;check.setAttribute('aria-label','Include '+record.name+' in capacity plan');check.onchange=plan;row.append(check);}
    const name=document.createElement('span');name.className='name';name.textContent=record.name+' · '+record.kind;row.append(name);
    const open=document.createElement('button');open.type='button';open.className='quiet';open.textContent='Open';open.onclick=()=>{try{apply(record.input,record.name);}catch(e){notice(e.message);}};
    const remove=document.createElement('button');remove.type='button';remove.className='quiet';remove.textContent='Delete';remove.setAttribute('aria-label','Delete '+record.name);
    remove.onclick=()=>{if(!window.confirm(`Delete “${record.name}”? This saved record will be removed.`))return;busy(remove,async()=>{await api('records/'+record.id,{method:'DELETE',body:JSON.stringify({revision:record.revision})});await loadSaved();notice('Saved record deleted.');});};row.append(open,remove);$('saved-list').append(row);
  }plan();
}
$('hours-per-day').oninput=plan;
async function save(kind,button){await busy(button,async()=>{if(!user){openWorkspace();throw Error('Sign in to save quotes and presets.');}const input=readForm();await api('records',{method:'POST',body:JSON.stringify({kind,name:$('job-name').value.trim(),input})});await loadSaved();openWorkspace();notice(kind==='quote'?'Quote saved.':'Preset saved.');});}
$('save-quote').onclick=()=>save('quote',$('save-quote'));$('save-preset').onclick=()=>save('preset',$('save-preset'));
$('login-form').onsubmit=event=>{event.preventDefault();busy($('send-login'),async()=>{const result=await api('login',{method:'POST',body:JSON.stringify({email:$('email').value,challenge:challengeToken})});notice(result.message);if(window.turnstile){window.turnstile.reset();challengeToken=null;}});};
$('verify-login').onclick=()=>busy($('verify-login'),async()=>{
  try{await api('login/verify',{method:'POST',body:JSON.stringify({token:loginToken})});}
  catch(error){if(error.status===400){loginToken=null;drawAccount();$('email').focus();}throw error;}
  loginToken=null;drawAccount();await refreshWorkspace();notice('Signed in. Your workspace is ready.');
});
$('subscribe').onclick=()=>busy($('subscribe'),async()=>{
  if(!$('accept-terms').checked)throw Error('Read and accept the monthly subscription terms first.');
  try{const result=await api('checkout',{method:'POST',body:JSON.stringify({acceptTerms:true,attemptId:attemptId()})});location.assign(result.url);}catch(e){if(e.status===409)clearAttempt();throw e;}
});
$('portal').onclick=()=>busy($('portal'),async()=>{const result=await api('portal',{method:'POST',body:'{}'});location.assign(result.url);});
$('export').onclick=()=>busy($('export'),async()=>{await loadSaved();download('Eidos_Quote_Desk_Backup_'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({schema:'eidos_quote_desk_v1',exportedAt:new Date().toISOString(),records:saved},null,2),'application/json');notice('Your saved data was exported.');});
$('logout').onclick=()=>busy($('logout'),async()=>{await api('logout',{method:'POST',body:'{}'});user=null;saved=[];drawAccount();drawSaved();notice('Signed out.');});
$('delete-account').onclick=()=>busy($('delete-account'),async()=>{if(!confirm('Delete all saved work and cancel this subscription? Export your data first.'))return;await api('account',{method:'DELETE',body:JSON.stringify({confirmEmail:$('delete-email').value})});user=null;saved=[];drawAccount();drawSaved();notice('Account deleted and subscription cancellation requested successfully.');});
async function start(){
  draw();
  const fragment=new URLSearchParams(location.hash.slice(1));loginToken=fragment.get('login');if(loginToken){history.replaceState(null,'',location.pathname+location.search);openWorkspace();}
  drawAccount();
  try{config=await api('config');if(config.environment!=='live'||!config.checkoutEnabled){$('environment').hidden=false;$('environment').textContent='Preview · The free estimator works. Paid checkout is being prepared; no live payment is available here.';}
    if(!config.signInEnabled){$('send-login').disabled=true;$('send-login').textContent='Saved workspace sign in is being prepared';}
    if(config.turnstileSiteKey){const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.onload=()=>window.turnstile.render('#turnstile',{sitekey:config.turnstileSiteKey,action:'quote_login',callback:token=>{challengeToken=token;},'expired-callback':()=>{challengeToken=null;}});document.head.append(script);}
    if(config.signInEnabled){try{await refreshWorkspace();}catch(e){if(e.status!==401)notice(e.message);}}
    const returned=new URLSearchParams(location.search).get('checkout');
    if(returned==='returned'){clearAttempt();openWorkspace();notice(user?.paid?'Paid access verified. You can save quotes.':user?'Your payment is being verified. Choose Check billing status to try again. Your estimate is still here.':'Sign in again to check your payment. This will not start another charge. Your estimate is still here.');}
    if(returned==='cancelled'){openWorkspace();notice('Checkout was cancelled. Your estimate is still here. You can resume checkout when you are ready.');}
  }catch(e){notice(e.message);}
}
start();
