import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject} from '../src/playground/model';
import {workspace, workspaceReducer as reduce, type SaveTarget} from '../src/playground/workspace';
import {cloudPreflight, CLOUD_DOCUMENT_BYTES} from '../src/playground/limits';
const target=(id:string):SaveTarget=>({id,head:id+'-head',owner:'alice',name:id,saved:''});
test('open A, open B, Undo restores A save identity; Redo restores B',()=>{
 let s=workspace(createProject(),'local');
 s=reduce(s,{type:'replace',project:{...createProject(),name:'A'},documentId:'A',target:target('A')});
 s=reduce(s,{type:'replace',project:{...createProject(),name:'B'},documentId:'B',target:target('B')});
 s=reduce(s,{type:'undo'}); assert.equal(s.current.project.name,'A');assert.equal(s.current.target?.id,'A');
 s=reduce(s,{type:'redo'});assert.equal(s.current.target?.id,'B');
});
test('template/import/variation replacements detach, ordinary edits and their undo keep target',()=>{
 for(const name of ['template','import','variation']) {
 let s=reduce(workspace(createProject(),'local'),{type:'replace',project:createProject(),documentId:'A',target:target('A')});
 s=reduce(s,{type:'edit',project:p=>({...p,name:'edited'}),time:1});assert.equal(s.current.target?.id,'A');
 s=reduce(s,{type:'undo'});assert.equal(s.current.target?.id,'A');
 s=reduce(s,{type:'replace',project:createProject(),documentId:name});assert.equal(s.current.target,null);
 s=reduce(s,{type:'undo'});assert.equal(s.current.target?.id,'A');
 }
});
test('late saved head updates only the matching document history, and undo after edit uses latest head',()=>{
 let s=reduce(workspace(createProject(),'A'),{type:'edit',project:p=>({...p,name:'edited'}),time:1});
 s=reduce(s,{type:'replace',project:createProject(),documentId:'B',target:target('B')});
 s=reduce(s,{type:'saved',documentId:'A',target:{...target('A'),head:'new-head'}});
 assert.equal(s.current.target?.id,'B');s=reduce(s,{type:'undo'});assert.equal(s.current.target?.head,'new-head');
 s=reduce(s,{type:'undo'});assert.equal(s.current.target?.head,'new-head');
});
test('cloud document preflight counts UTF-8 bytes at exact boundary without changing input',()=>{
 const exact='a'.repeat(CLOUD_DOCUMENT_BYTES-2);assert.equal(cloudPreflight(exact).allowed,true);
 assert.equal(cloudPreflight(exact+'a').allowed,false);
 assert.equal(cloudPreflight('é').bytes,4);
 const p=createProject(),before=JSON.stringify(p);cloudPreflight(p);assert.equal(JSON.stringify(p),before);
});
