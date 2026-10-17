import {applyProposal,type Proposal} from './aiOperations';
import type {Project} from './model';
import {validateProject} from './model';
import {moveSectionBefore} from './composition';
import {motionPose,putMotionFrame} from './motionSchema';
export type StudioOperation =
 | {type:'effect';patch:Record<string,unknown>}
 | {type:'artwork-object';id:string;patch:Record<string,unknown>}
 | {type:'motion-keyframe';id:string;time:number;patch:Record<string,unknown>}
 | {type:'section-order';id:string;before:string};
export type StudioEditRequest={documentId:string;revision:number;operation:StudioOperation};
export function applyStudioCommand(project:Project,actual:Envelope,request:StudioEditRequest):Project {
 assertCurrent(request,actual);
 const op=request.operation;
 if(!op||typeof op!=='object'||Array.isArray(op))throw Error('Invalid bounded studio operation.');
 const next=structuredClone(project);
 const patch=(value:Record<string,unknown>,allowed:string[])=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length===0||Object.keys(value).some(k=>!allowed.includes(k)))throw Error('Unsupported studio property.');return value;};
 if(op.type==='effect')Object.assign(next.glass,patch(op.patch,['enabled','frost','edge','prism','touch','radius','response','solid','start','end','reducedMotion']));
 else if(op.type==='artwork-object'){
  const object=next.studios?.artwork?.objects.find(o=>o.id===op.id);if(!object)throw Error('Artwork object is unavailable. Read the current source again.');
  Object.assign(object,patch(op.patch,['x','y','size','scale','rotation','opacity','color','text','weight','opticalSize']));
 }else if(op.type==='motion-keyframe'){
  const motion=next.studios?.motion,object=motion?.objects.find(o=>o.id===op.id);if(!motion||!object)throw Error('Motion object is unavailable.');
  if(typeof op.time!=='number'||!Number.isFinite(op.time)||op.time<0||op.time>motion.duration)throw Error('Keyframe time is outside the animation.');
  next.studios!.motion=putMotionFrame(motion,op.id,{...motionPose(object,op.time),...patch(op.patch,['x','y','scale','rotation','opacity']),time:op.time});
 }else if(op.type==='section-order')return moveSectionBefore(project,op.id,op.before);
 else throw Error('Unsupported studio operation.');
 return validateProject(next);
}
export type Envelope={documentId:string;revision:number};
export type EditRequest=Envelope&{selected:string;scope:'section'|'page';proposal:Proposal};
export function assertCurrent(expected: Envelope, actual: Envelope) {
  if(expected.documentId!==actual.documentId||expected.revision!==actual.revision)throw Error('Stale command. Read the current document again; your manual edits are safe.');
}
export function applyLocalCommand(project:Project,actual:Envelope,request:EditRequest):Project {
  assertCurrent(request,actual);
  return applyProposal(project,request.selected,request.scope,request.proposal);
}
