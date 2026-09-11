import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject,upgradeProject,newBlock,validateProject,LEGACY_RENDERER,projectWarnings} from '../src/playground/model';
import {exportFiles} from '../src/playground/export';
import {pageMarkup,renderedStyles} from '../src/playground/renderer';
import {cloudPreflight} from '../src/playground/limits';
test('explicit v2 migration preserves v1 bytes, renderer and destinations',()=>{
 const old=createProject();old.rendererVersion=LEGACY_RENDERER;const bytes=JSON.stringify(old),p=upgradeProject(old);
 assert.equal(JSON.stringify(old),bytes);assert.equal(p.schemaVersion,2);assert.equal(p.rendererVersion,LEGACY_RENDERER);
 assert.deepEqual(p.sections.map(s=>s.id),old.sections.map(s=>s.id));assert.equal(p.sections[1].href,old.sections[1].href);
 assert.deepEqual(validateProject(JSON.parse(bytes)),old);assert.deepEqual(validateProject(p),p);
 for(const name of ['about','contact'] as const){const preset=createProject(name);assert.deepEqual(validateProject(preset),preset);}
});
test('repeated block/card identities roundtrip through renderer, export and validation',()=>{
 const p=upgradeProject(createProject()),a=newBlock('gallery'),b=newBlock('gallery');
 a.cards=[{id:'card-one',title:'Owned work',description:'Details',alt:'Sample',image:'data:image/png;base64,iVBORw0KGgo='}];
 b.cards=[{id:'card-two',title:'Another',description:'',alt:'',image:''}];
 a.style={spacing:48,align:'center',background:'#ffffff',mobileSpacing:24,mobileAlign:'left'};
 p.sections.splice(3,0,a,b);p.sections[0].navigation=[{label:'Gallery',href:'#'+b.id}];
 assert.deepEqual(validateProject(p),p);assert.match(pageMarkup(p),new RegExp('href="#'+b.id+'"'));assert.match(renderedStyles(p),/padding-block:24px/);
 assert.ok(exportFiles(p).some(f=>f.name==='assets/card-one.png'));assert.ok(cloudPreflight(p).allowed);
 assert.throws(()=>validateProject({...p,sections:[...p.sections.slice(0,-1),{...b,id:a.id},p.sections.at(-1)!]}),/Duplicate/);
 const bad=structuredClone(p);bad.sections[0].navigation![0].href='javascript:alert(1)';assert.throws(()=>validateProject(bad),/Unsafe/);
 bad.sections[0].navigation=[];bad.sections[3].cards![0].image='data:image/svg+xml;base64,abcd';assert.throws(()=>validateProject(bad),/Images/);
 const warnings=projectWarnings(p);assert.ok(warnings.some(v=>v.includes('contact')||v.includes('Contact')));
});
