import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const ts=require('typescript');
const out=process.env.PG_LIST_EVIDENCE||'artifacts/playground-unified/list-move';
await mkdir(out,{recursive:true});
const source=ts.transpileModule(await readFile('src/playground/listMove.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace('export function startListMove','function startListMove');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1000,height:800}});
const receipt={kind:'real pointer input, isolated list harness',checks:[],failures:[]};
try {
 await page.setContent(`<style>body{margin:40px}ul{width:330px;padding:8px 10px 32px;list-style:none;border:1px solid #999;margin:8px}li>div{height:38px;display:flex;align-items:center;gap:8px}button{touch-action:none}li>ul{width:270px;margin:2px 0 10px 18px}.pg-list-target{outline:2px solid green}</style><aside class="pg-sidebar pg-block-tree"><ul data-sort-container="root" data-sort-name="Root"><li data-sort-id="a"><div><button id="a">Drag A</button>A</div></li><li data-sort-id="b"><div><button id="b">Drag B</button>B</div></li><li data-sort-id="stack"><div>Nested stack</div><ul data-sort-container="nested" data-sort-name="Nested stack"><li data-sort-id="c"><div><button id="c">Drag C</button>C</div></li></ul></li><li data-sort-id="empty-stack"><div>Empty stack</div><ul data-sort-container="empty" data-sort-name="Empty stack"></ul></li></ul></aside>`);
 await page.addScriptTag({content:source+`;window.moves=[];window.current=true;document.querySelectorAll('button').forEach(button=>button.addEventListener('pointerdown',event=>startListMove(event,()=>window.current,(id,before,parent)=>window.moves.push({id,before,parent}),{nested:true})));`});
 const move=async(id,container,where='end',cancel=false)=>{
   const from=await page.locator('#'+id).boundingBox(), to=await page.locator('[data-sort-container="'+container+'"]').boundingBox();
   await page.mouse.move(from.x+8,from.y+8);await page.mouse.down();
   await page.mouse.move(to.x+20,where==='end'?to.y+to.height-10:to.y+12,{steps:12});
   await page.waitForTimeout(40);if(cancel)await page.keyboard.press('Escape');await page.mouse.up();
 };
 for(const [name,id,parent,before,position] of [['final nested position','c','nested','','end'],['cross-container final position','a','nested','','end'],['empty container','b','empty','','end'],['before first sibling','b','root','a','start']]) {
   const count=await page.evaluate(()=>window.moves.length);await move(id,parent,position);
   const result=await page.evaluate(()=>window.moves.at(-1));
   try{assert.equal(await page.evaluate(()=>window.moves.length),count+1);assert.deepEqual(result,{id,before,parent});receipt.checks.push(name);}catch(e){receipt.failures.push({name,error:e.message,observed:result??null});}
 }
 const count=await page.evaluate(()=>window.moves.length);await move('a','nested','end',true);assert.equal(await page.evaluate(()=>window.moves.length),count);receipt.checks.push('Escape creates no mutation');
 for (const cancellation of ['outside','pointercancel','lostpointercapture','blur','project-switch']) {
   const from=await page.locator('#a').boundingBox(),to=await page.locator('[data-sort-container="nested"]').boundingBox();
   await page.mouse.move(from.x+8,from.y+8);await page.mouse.down();await page.mouse.move(to.x+20,to.y+to.height-10,{steps:8});await page.waitForTimeout(30);
   if(cancellation==='outside')await page.mouse.move(900,700);
   else await page.evaluate(kind=>{if(kind==='blur')window.dispatchEvent(new Event('blur'));else if(kind==='project-switch')window.current=false;else if(kind==='lostpointercapture')document.getElementById('a').dispatchEvent(new PointerEvent('lostpointercapture'));else document.dispatchEvent(new PointerEvent('pointercancel'));},cancellation);
   await page.waitForTimeout(30);await page.mouse.up();assert.equal(await page.evaluate(()=>window.moves.length),count,cancellation);await page.evaluate(()=>window.current=true);receipt.checks.push(cancellation+' creates no mutation');
 }
 await page.screenshot({path:out+'/list-harness.png'});
} finally {await browser.close();await writeFile(out+'/receipt.json',JSON.stringify(receipt,null,2)+'\n');}
console.log(JSON.stringify(receipt,null,2));if(receipt.failures.length)process.exitCode=1;
