import {useEffect,useState} from 'react';
// Explicit local QA only. No network reporting or persistent visitor measurement.
export function LocalPerformance(){
 const [values,setValues]=useState<Record<string,number>|null>(null);
 useEffect(()=>{
  if(!['localhost','127.0.0.1'].includes(location.hostname)||new URLSearchParams(location.search).get('qa')!=='performance')return;
  let active=true;
  void import('web-vitals').then(({onLCP,onINP,onCLS})=>{
    if(!active)return;setValues({});
    const record=(m:{name:string;value:number})=>{if(active)setValues(v=>({...v,[m.name]:Math.round(m.value*1000)/1000}));};
    onLCP(record,{reportAllChanges:true});onINP(record,{reportAllChanges:true});onCLS(record,{reportAllChanges:true});
  });return()=>{active=false};
 },[]);
 if(!values)return null;
 return <details style={{position:'fixed',bottom:8,left:8,zIndex:9999,background:'#fff',color:'#12252d',padding:12,border:'1px solid #52616a',maxWidth:300}}><summary>Local performance sample</summary><p>Unthrottled local browser. Not field or physical-device evidence. Interact with the page before reading INP.</p><output id="local-performance">{JSON.stringify({LCP:values.LCP??null,INP:values.INP??null,CLS:values.CLS??null})}</output><p>Null means not reported yet.</p></details>;
}
