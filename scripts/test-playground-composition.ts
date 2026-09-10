import { applyProposal } from '../src/playground/aiOperations';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject, validateProject, upgradeProject, sectionKind, mediaSlots, projectWarnings, type Project } from '../src/playground/model';
import { defaultComposition, validateComposition, effectivePlacement, compositionParts, imagePlacements, type Composition } from '../src/playground/compositionSchema';
import { enableComposition, applyCompositionOperation, moveSectionBefore } from '../src/playground/composition';
import { compositionMarkup, compositionStyles } from '../src/playground/compositionRenderer';
const fixture = () => enableComposition(createProject());
const hero = (p: Project) => p.sections.find(s => sectionKind(s) === 'hero')!;
const change = (patch: Partial<Composition>) => applyCompositionOperation(fixture(), {type:'settings',sectionId:'hero',patch});

test('legacy templates retain their versions and do not gain layout data on validation', () => {
  for (const template of ['landing','homepage','portfolio','about','contact'] as const) {
    const old = createProject(template), copy = structuredClone(old), result = validateProject(old);
    assert.equal(result.schemaVersion, template === 'about' || template === 'contact' ? 2 : 1);
    assert.equal(hero(result).composition, undefined);
    assert.deepEqual(old, copy);
  }
});
test('upgrade preserves identities, content, media, renderer, brand and page tokens', () => {
  const old = upgradeProject(createProject()), before = structuredClone(old);
  old.sections[1].image='data:image/png;base64,iVBORw0KGgo=';
  old.sections[1].alt='My original photo';
  const upgraded=enableComposition(old);
  assert.equal(upgraded.schemaVersion,3);
  assert.equal(upgraded.rendererVersion,old.rendererVersion);
  assert.deepEqual(upgraded.tokens,old.tokens);
  assert.deepEqual(upgraded.glass,old.glass);
  assert.deepEqual(upgraded.sections.map(s=>s.id),old.sections.map(s=>s.id));
  assert.equal(hero(upgraded).image,hero(old).image);
  assert.equal(hero(upgraded).alt,'My original photo');
  assert.equal(old.schemaVersion,before.schemaVersion);
  assert.equal(hero(old).composition,undefined);
  assert.equal(enableComposition(upgraded),upgraded);
  assert.equal(upgradeProject(upgraded),upgraded);
});
test('all placements survive JSON save/reopen with one media slot per original section', () => {
  for(const placement of imagePlacements) {
    const p=change({placement}), restored=validateProject(JSON.parse(JSON.stringify(p)));
    assert.equal(hero(restored).composition?.placement,placement);
    assert.equal(mediaSlots(restored).length,6);
    assert.deepEqual(restored,p);
  }
});
test('moving image within copy changes both reading order and placement without editing text', () => {
  const p=fixture(), next=applyCompositionOperation(p,{type:'move',sectionId:'hero',part:'image',before:'description'});
  assert.deepEqual(hero(next).composition?.order,['title','image','description','cta']);
  assert.equal(hero(next).composition?.placement,'inline');
  assert.equal(hero(next).title,hero(p).title);
  assert.deepEqual(hero(p).composition?.order,compositionParts);
});
test('moving heading, description and button preserves each exactly once', () => {
  let p=fixture();
  p=applyCompositionOperation(p,{type:'move',sectionId:'hero',part:'cta',before:'description'});
  assert.deepEqual(hero(p).composition?.order,['title','cta','description','image']);
  p=applyCompositionOperation(p,{type:'move',sectionId:'hero',part:'title',before:null});
  assert.deepEqual(hero(p).composition?.order,['cta','description','image','title']);
  assert.equal(new Set(hero(p).composition!.order).size,4);
});
test('mobile placement is independent; automatic side images stack and text order is shared', () => {
  const p=fixture(), mobile=applyCompositionOperation(p,{type:'placement',sectionId:'hero',placement:'background',mobile:true});
  assert.equal(hero(mobile).composition?.placement,'right');
  assert.equal(effectivePlacement(hero(mobile).composition!,true),'background');
  assert.equal(effectivePlacement(hero(p).composition!,true),'below');
  const inline=applyCompositionOperation(p,{type:'move',sectionId:'hero',part:'image',before:'description',mobile:true});
  assert.equal(hero(inline).composition?.placement,'right');
  assert.equal(hero(inline).composition?.mobilePlacement,'inline');
  assert.throws(()=>applyCompositionOperation(p,{type:'placement',sectionId:'hero',placement:'left',mobile:true}));
});
test('validation rejects unknown versions, duplicate/missing parts and unexpected fields', () => {
  const c=defaultComposition();
  for(const bad of [{...c,version:2},{...c,order:['title','title','cta','image']},{...c,order:['title']},{...c,order:['title','description','cta','script']},{...c,css:'position:fixed'},{...c,overlay:'url(https://example.test)'}])
    assert.throws(()=>validateComposition(bad));
});
test('all numeric settings reject non-finite and out-of-range values', () => {
  const c=defaultComposition();
  for(const key of ['gap','contentWidth','minHeight','imageOpacity','overlayOpacity','blur','offsetX','offsetY','rotation','scale']) {
    for(const value of [NaN,Infinity,-Infinity,10000,'1',null]) assert.throws(()=>validateComposition({...c,[key]:value}));
  }
});
test('version 3 cannot silently downgrade or attach composition to other sections', () => {
  const p=fixture();
  assert.throws(()=>validateProject({...p,schemaVersion:2}));
  assert.throws(()=>validateProject({...p,schemaVersion:'3'}));
  assert.throws(()=>validateProject({...p,sections:p.sections.map(s=>s.id==='services'?{...s,composition:defaultComposition()}:s)}));
  assert.throws(()=>validateProject({...p,sections:p.sections.map(s=>s.id==='hero'?{...s,composition:undefined}:s)}));
});
test('operations refuse legacy projects and non-hero destinations', () => {
  assert.throws(()=>applyCompositionOperation(createProject(),{type:'placement',sectionId:'hero',placement:'background'}));
  assert.throws(()=>applyCompositionOperation(fixture(),{type:'placement',sectionId:'header',placement:'background'}));
});
test('renderer uses selected element order and exactly one image node', () => {
  const p=applyCompositionOperation(fixture(),{type:'move',sectionId:'hero',part:'image',before:'description'});
  const markup=compositionMarkup(hero(p),{title:'<h1>Title</h1>',description:'<p>Description</p>',cta:'<a href="#contact">Go</a>',image:'<img src="local.png" alt="Photo">'});
  assert.ok(markup.indexOf('<h1>')<markup.indexOf('<img'));
  assert.ok(markup.indexOf('<img')<markup.indexOf('<p>'));
  assert.equal((markup.match(/<img/g)||[]).length,1);
  assert.ok(!markup.includes('pg-compose-handle'));
});
test('CSS supplies bounded background stacking, responsive override and static mobile transforms', () => {
  const css=compositionStyles(change({placement:'background',rotation:10,offsetX:5}).sections);
  assert.match(css,/position:absolute;inset:0;grid-area:auto;z-index:0;pointer-events:none/);
  assert.match(css,/@media\(max-width:640px\)/);
  assert.match(css,/transform:none/);
  assert.match(css,/translate\(5%,0%\) rotate\(10deg\)/);
});
test('legacy sections produce no composition CSS', () => assert.equal(compositionStyles(createProject().sections),''));
test('background placement adds an honest publishing contrast note', () => {
  assert.ok(projectWarnings(change({placement:'background'})).some(v=>v.includes('actual image')));
});
test('page section moves keep permanent identities, header/footer and original data', () => {
  const p=fixture(), next=moveSectionBefore(p,'contact','services');
  assert.equal(next.sections[0].id,'header');assert.equal(next.sections.at(-1)?.id,'footer');
  assert.ok(next.sections.findIndex(s=>s.id==='contact')<next.sections.findIndex(s=>s.id==='services'));
  assert.equal(p.sections[4].id,'contact');
  assert.throws(()=>moveSectionBefore(p,'header','hero'));
  assert.throws(()=>moveSectionBefore(p,'hero','header'));
  assert.equal(moveSectionBefore(p,'hero','footer').sections.at(-2)?.id,'hero');
});

test('legacy AI layout fields cannot silently change an inactive hero layout', () => {
  const p=enableComposition(createProject());
  assert.throws(()=>applyProposal(p,'hero','section',{ops:[{field:'section.layout',value:'center'}]}),/spatial/);
  const text=applyProposal(p,'hero','section',{ops:[{field:'section.title',value:'A new heading'}]});
  assert.deepEqual(text.sections[1].composition,p.sections[1].composition);
  assert.equal(text.sections[1].title,'A new heading');
  const section=applyProposal(p,'work','section',{ops:[{field:'section.spacing',value:'42'}]});
  assert.equal(section.sections.find(s=>s.id==='work')?.style?.spacing,42);
});
