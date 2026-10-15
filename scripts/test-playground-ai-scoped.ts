import test from 'node:test';
import assert from 'node:assert/strict';
import { createStarter } from '../src/playground/starters';
import { flattenNodes } from '../src/playground/authoringSchema';
import { selectStudio } from '../src/playground/studioProject';
import { applyContextProposal, applyProposal, contextProposalDiff, createProposalContext, proposalTargetId, validateProposalContext, validateProposal } from '../src/playground/aiOperations';

function fixture() {
  const project=createStarter({starter:'switchboard',goal:'business',action:'contact',name:'Harbor Workshop'});
  const section=project.sections.find(s=>s.authoring)!;
  const node=flattenNodes(section.authoring!.root).find(n=>n.type==='heading')!;
  return {project,section,node};
}
test('scoped projection preserves target IDs and strips asset bytes, source filenames and standalone studio data',()=>{
 const base=fixture(), project=selectStudio(base.project,'artwork'), {section,node}=base;
 const before=structuredClone(project), context=createProposalContext(project,section.id,node.id,'element');
 assert.deepEqual(project,before);assert.equal(proposalTargetId(context),node.id);
 for(const s of context.project.sections){assert.equal(s.image,'');assert.equal(s.media,undefined);for(const n of s.authoring?flattenNodes(s.authoring.root):[]){assert.equal(n.image,'');assert.equal(n.media,undefined);}}
 assert.deepEqual(context.project.studios,{version:1,active:'page'});
 assert.deepEqual(validateProposalContext(context),context);
 assert.throws(()=>validateProposalContext({...context,owner:'forged'}),/context field/);
 assert.throws(()=>validateProposalContext({...context,nodeId:'gone'}),/element is missing/);
});
test('element proposal changes one stable node in full source, preserving manual content and assets',()=>{
 const {project,section,node}=fixture(), before=structuredClone(project);
 const proposal=validateProposal({ops:[{field:'node.text',value:'A clearer plan for your next project.'}]});
 const context=createProposalContext(project,section.id,node.id,'element');
 applyContextProposal(context,proposal);
 const next=applyProposal(project,section.id,'element',proposal,node.id);
 const expected=structuredClone(before);flattenNodes(expected.sections.find(s=>s.id===section.id)!.authoring!.root).find(n=>n.id===node.id)!.text=proposal.ops[0].value;
 assert.deepEqual(next,expected);assert.deepEqual(project,before);
 assert.deepEqual(contextProposalDiff(context,proposal),[{field:'node.text',before:node.text,after:proposal.ops[0].value}]);
});
test('scope boundaries, locks and executable links reject the entire proposal without mutations',()=>{
 const {project,section,node}=fixture(), before=structuredClone(project);
 for(const value of [{ops:[{field:'tokens.accent',value:'#ffffff'}]},{ops:[{field:'section.title',value:'Wrong scope'}]},{ops:[{field:'node.height',value:'100'}]},{ops:[{field:'node.href',value:'javascript:alert(1)'}]},{ops:[{field:'billing.limit',value:'5'}]}]) assert.throws(()=>applyProposal(project,section.id,'element',value,node.id));
 project.brand!.locks=['palette','name','tone'];
 for(const field of ['tokens.accent','brand.businessName','brand.tone'])assert.throws(()=>applyProposal(project,section.id,'brand',{ops:[{field,value:field==='tokens.accent'?'#ffffff':'Changed'}]}),/locked/);
 project.brand!.locks=before.brand!.locks;assert.deepEqual(project,before);
});
test('mobile container repair is explicit and leaves desktop geometry and siblings intact',()=>{
 const {project,section}=fixture(), node=section.authoring!.root;
 const next=applyProposal(project,section.id,'element',{ops:[{field:'node.mobile.gap',value:'18'},{field:'node.mobile.layout',value:'stack'}]},node.id);
 const expected=structuredClone(project);expected.sections.find(s=>s.id===section.id)!.authoring!.root.mobile={...node.mobile,gap:18,layout:'stack'};
 assert.deepEqual(next,expected);assert.equal(next.sections.find(s=>s.id===section.id)!.authoring!.root.gap,node.gap);
 for(const value of ['NaN','Infinity','-1','1e99',''])assert.throws(()=>applyProposal(project,section.id,'element',{ops:[{field:'node.mobile.gap',value}]},node.id));
});
test('brand/page proposals preserve content and obey common model bounds',()=>{
 const {project,section}=fixture();
 const next=applyProposal(project,section.id,'brand',{ops:[{field:'brand.tone',value:'Clear, warm and practical.'},{field:'tokens.font',value:'modern'}]});
 assert.equal(next.brand!.tone,'Clear, warm and practical.');assert.equal(next.tokens.font,'modern');assert.deepEqual(next.sections,project.sections);
 assert.throws(()=>applyProposal(project,section.id,'section',{ops:[{field:'brand.tone',value:'Wrong scope'}]}),/explicit/);
 assert.throws(()=>applyProposal(project,section.id,'page',{ops:[{field:'tokens.typeScale',value:'99'}]}));
});
test('no-op, duplicate fields and unsafe context assets cannot become usable proposals',()=>{
 const {project,section,node}=fixture(), context=createProposalContext(project,section.id,node.id,'element');
 assert.throws(()=>applyContextProposal(context,{ops:[{field:'node.text',value:node.text}]}),/did not propose a change/);
 assert.throws(()=>validateProposal({ops:[{field:'node.text',value:'A'},{field:'node.text',value:'B'}]}),/repeated/);
 const contaminated=structuredClone(context);contaminated.project.sections[0].media={fit:'cover',x:50,y:50,zoom:1,sourceName:'private-customer.png'} as never;
 assert.throws(()=>validateProposalContext(contaminated));
 assert.throws(()=>validateProposalContext({...context,nodeId:node.id,scope:'page'}),/element target/);
 const hidden=structuredClone(project);hidden.sections.find(s=>s.id===section.id)!.visible=false;assert.throws(()=>createProposalContext(hidden,section.id,node.id,'element'),/Show this section/);
});
test('whole-page structure preserves identities, section data and permanent positions',()=>{
 const {project,section}=fixture(), order=project.sections.map(s=>s.id);[order[1],order[2]]=[order[2],order[1]];
 const next=applyProposal(project,section.id,'page',{ops:[{field:'page.sectionOrder',value:JSON.stringify(order)}]});
 assert.deepEqual(next.sections.map(s=>s.id),order);for(const s of project.sections)assert.deepEqual(next.sections.find(n=>n.id===s.id),s);
 for(const bad of [order.slice(1),[...order.slice(0,-1),order[0]],[...order].reverse(),[...order.slice(0,-1),'forged']])assert.throws(()=>applyProposal(project,section.id,'page',{ops:[{field:'page.sectionOrder',value:JSON.stringify(bad)}]}));
 assert.throws(()=>applyProposal(project,section.id,'section',{ops:[{field:'page.sectionOrder',value:JSON.stringify(order)}]}),/whole-page/);
});
test('explicit visibility changes preserve hidden content and reject removing permanent/all content',()=>{
 const {project,section}=fixture(), id=project.sections.find(s=>!['header','footer',section.id].includes(s.id))!.id;
 const next=applyProposal(project,section.id,'page',{ops:[{field:'page.sectionVisibility',value:JSON.stringify({[id]:false})}]});
 const expected=structuredClone(project);expected.sections.find(s=>s.id===id)!.visible=false;assert.deepEqual(next,expected);
 for(const bad of [{header:false},{forged:true},{[id]:'false'},Object.fromEntries(project.sections.filter(s=>!['header','footer'].includes(s.id)).map(s=>[s.id,false]))])assert.throws(()=>applyProposal(project,section.id,'page',{ops:[{field:'page.sectionVisibility',value:JSON.stringify(bad)}]}));
});
