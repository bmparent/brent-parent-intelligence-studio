import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

await test('Reply acknowledgement survives the next verification callback', async () => {
  const button = { disabled: true }, status = { textContent: '' };
  let submit, challenge;
  const form = { dataset: { thread: 'test-thread' }, elements: { body: { value: 'Test reply' } }, addEventListener: (_name, callback) => { submit = callback; } };
  const document = { getElementById: id => ({'reply-form':form,'submit-reply':button,'reply-status':status}[id] || {}),createElement:()=>({}),head:{appendChild:script=>script.onload()} };
  const window = {turnstile:{render:(_element,options)=>{challenge=options;options.callback('test-token');return 'widget';},reset:()=>challenge.callback('fresh-token')} };
  const fetch = async url => ({ok:true,json:async()=>url==='/api/public-config'?{communityReady:true,turnstileSiteKey:'test-site'}:{message:'Your reply has been saved for review.'}});
  class FormData { get(name) {return name === 'body'?'Test reply':name === 'author'?'Release QA':'';} }
  await vm.runInNewContext(fs.readFileSync('public/community-thread.js','utf8'),{document,window,fetch,FormData,AbortSignal});
  await submit({preventDefault(){}});
  assert.equal(status.textContent,'Your reply has been saved for review.');
  assert.equal(form.elements.body.value,'');
  challenge.callback('another-token');
  assert.equal(status.textContent,'Your reply has been saved for review.');
  assert.equal(button.disabled,false);
});
