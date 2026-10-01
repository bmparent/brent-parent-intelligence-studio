import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,estimate,capacity} from '../public/estimator.mjs';
test('independent one-head, one-item job matches hand calculation',()=>{
  const p={...defaults,quantity:1,stitches:1000,heads:1,rpm:1000,efficiency:1,colorChanges:0,breakSecondsPerThousand:0,setupSeconds:60,hoopSeconds:30,removeSeconds:10,finishSeconds:20,buffer:0,laborHourly:20,machineHourly:6,overheadHourly:0,blankUnit:10,materialsUnit:0,digitizing:0,shipping:0,spoilage:0,margin:0.5};
  const r=estimate(p);assert.equal(r.elapsedSeconds,180);assert.equal(r.laborSeconds,180);assert.equal(r.totalCost,11.1);assert.equal(r.suggestedTotal,22.2);assert.equal(r.margin,0.5);
});
test('partial last cycle and color changes are charged per machine cycle',()=>{
  const r=estimate({...defaults,quantity:7,heads:6,stitches:1000,rpm:1000,efficiency:1,colorChanges:2,colorChangeSeconds:5,breakSecondsPerThousand:0});
  assert.equal(r.cycles,2);assert.equal(r.cycleSeconds,70);assert.equal(r.machineSeconds,140);
});
test('adding operators shortens handling elapsed time without erasing labor',()=>{
  const a=estimate(defaults),b=estimate({...defaults,operators:2});assert(b.elapsedSeconds<a.elapsedSeconds);assert.equal(a.costs.labor,b.costs.labor);assert.equal(a.machineSeconds,b.machineSeconds);
});
test('gross margin pricing differs from markup and rounds up per item',()=>{
  const result=estimate({...defaults,margin:0.4});assert(result.suggestedTotal>=result.totalCost/0.6);assert(result.margin>=0.4);assert.equal(Number((result.unitPrice*defaults.quantity).toFixed(2)),result.suggestedTotal);
});
test('invalid quantity, zero efficiency, 100% margin, missing and nonnumeric inputs fail',()=>{
  for(const bad of [{quantity:1.5},{efficiency:0},{margin:1},{rpm:Infinity},{heads:0},{quantity:'48'},{blankUnit:-1}])assert.throws(()=>estimate({...defaults,...bad}));assert.throws(()=>estimate({}));
});
test('all-zero costs have finite output and transparent zero margin',()=>{
  const r=estimate({...defaults,laborHourly:0,machineHourly:0,overheadHourly:0,blankUnit:0,materialsUnit:0,digitizing:0,shipping:0});assert.equal(r.totalCost,0);assert.equal(r.margin,0);assert.equal(r.unitPrice,0);
});
test('capacity sums actual saved job durations against the selected workday',()=>{
  const seconds=estimate(defaults).elapsedSeconds;assert.equal(capacity([defaults,defaults],8).seconds,2*seconds);assert.equal(capacity([defaults],8).days,seconds/28800);assert.throws(()=>capacity([defaults],0));
});
