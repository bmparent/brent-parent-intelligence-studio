import test from 'node:test';import assert from 'node:assert/strict';
import {createProject,validateProject,projectWarnings} from '../src/playground/model';
import {defaultMedia} from '../src/playground/media';
import {exportFiles} from '../src/playground/export';
import {pageMarkup,renderedStyles} from '../src/playground/renderer';
test('media placement and brand metadata roundtrip without rewriting legacy documents',()=>{
 const old=createProject();assert.deepEqual(validateProject(old),old);
 const p=createProject();p.sections[1].media={...defaultMedia(),x:24,mobileX:72,decorative:true};p.sections[1].image='data:image/png;base64,iVBORw0KGgo=';p.brand={businessName:'Test business',tone:'Warm',locks:['palette','logo']};
 assert.deepEqual(validateProject(p),p);assert.ok(!projectWarnings(p).some(v=>v.includes('description')));
 assert.match(renderedStyles(p),/object-position:72% 50%/);assert.match(pageMarkup(p),/alt=""/);
 assert.equal(exportFiles(p).find(f=>f.name==='assets/hero.png')?.data.length,8);
 assert.throws(()=>validateProject({...p,sections:p.sections.map(s=>({...s,media:{...defaultMedia(),zoom:99}}))}));
 assert.throws(()=>validateProject({...p,brand:{...p.brand,locks:['execute']}}));
});
