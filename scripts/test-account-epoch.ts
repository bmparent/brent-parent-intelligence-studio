import {test} from 'node:test';
import assert from 'node:assert/strict';
import {changesAccountSession} from '../src/lib/accountEpoch';
test('only successful session-changing operations announce account invalidation',()=>{
 for(const [url,action] of [['auth','logout'],['auth','verify'],['credentials','login'],['credentials','verify-signup'],['credentials','reset'],['credentials','change-password'],['google','complete-signup'],['account','signout-all']])assert.equal(changesAccountSession('/api/members/'+url,{action}),true);
 for(const [url,action] of [['credentials','signup'],['credentials','forgot'],['auth','request'],['account','update'],['google','start']])assert.equal(changesAccountSession('/api/members/'+url,{action}),false);
 assert.equal(changesAccountSession('/api/playground/projects',{action:'login'}),false);
 assert.equal(changesAccountSession('/api/members/auth',null),false);
});
