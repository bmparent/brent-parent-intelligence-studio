/* Public thread enhancement. No analytics or user content sent to a model. */
(async()=>{
 const form=document.getElementById('reply-form');if(!form)return;
 const button=document.getElementById('submit-reply'),status=document.getElementById('reply-status');let token='',widget,config,lastResult='';
 try{const response=await fetch('/api/public-config');if(!response.ok)throw Error();config=await response.json();if(!config.communityReady)throw Error();
  if(config.localTest){button.disabled=false;status.textContent='Replies appear after review.';}
  else{const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.onload=()=>{widget=window.turnstile.render(document.getElementById('verification'),{sitekey:config.turnstileSiteKey,action:'community',theme:'light',size:'flexible',callback:value=>{token=value;button.disabled=false;status.textContent=lastResult||'Verification complete.';},'expired-callback':()=>{token='';button.disabled=true;status.textContent=lastResult||'Please verify again.';},'error-callback':()=>{button.disabled=true;status.textContent='Verification is unavailable. Please reload to try again.';}});};script.onerror=()=>{status.textContent='Verification could not load. Please reload or contact the studio.';};document.head.appendChild(script);}
 }catch{status.textContent='Replies are being prepared. Please contact the studio with your question.';return;}
 form.addEventListener('submit',async event=>{event.preventDefault();lastResult='';button.disabled=true;status.textContent='Submitting for review…';const data=new FormData(form);
  try{const response=await fetch('/api/community/replies',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({threadId:form.dataset.thread,author:data.get('author'),body:data.get('body'),website:data.get('website'),challenge:token}),signal:AbortSignal.timeout(20000)});const result=await response.json();if(!response.ok)throw Error(result.error||'Your reply could not be submitted.');lastResult=result.message;status.textContent=lastResult;form.elements.body.value='';}
  catch(error){lastResult=error.message||'Please try again shortly.';status.textContent=lastResult;}
  finally{token='';if(widget!==undefined)window.turnstile.reset(widget);button.disabled=!config.localTest;}
 });
})();
