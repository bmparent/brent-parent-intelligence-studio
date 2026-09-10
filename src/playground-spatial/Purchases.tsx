import { useRef, useState } from 'react';
import { download } from './export';
type Purchase={id:string;name:string;status:string;mode:string;amount:number};
export function Purchases({active,dirty}:{active:{id:string;head:string}|null;dirty:boolean}) {
  const [items,setItems]=useState<Purchase[]>([]),[amount,setAmount]=useState<number|null>(null),[message,setMessage]=useState('Refresh purchase history after returning from checkout. Payment may still be processing.'),[busy,setBusy]=useState(false);
  const attempt=useRef<{revision:string;requestId:string}|null>(null),lock=useRef(false);
  async function run(action:()=>Promise<void>) {if(lock.current)return;lock.current=true;setBusy(true);try{await action();}catch(e){setMessage((e as Error).message);}finally{lock.current=false;setBusy(false);}}
  async function refresh() {
    const response=await fetch('/api/playground/purchases'),result=await response.json();
    if(!response.ok)throw new Error(result.error || 'Purchase history is unavailable.');
    setItems(result.purchases);setAmount(result.testAmount);setMessage('Purchase history refreshed. Only verified payments enable downloads.');
  }
  async function checkout() {
    if(!active || dirty)return;
    const key=active.id+active.head;
    if(attempt.current?.revision!==key)attempt.current={revision:key,requestId:crypto.randomUUID()};
    const response=await fetch('/api/playground/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({projectId:active.id,revisionId:active.head,requestId:attempt.current.requestId})}),result=await response.json();
    if(!response.ok)throw new Error(result.error || 'Checkout is unavailable.');
    if(result.url){const url=new URL(result.url);if(url.origin!=='https://checkout.stripe.com')throw new Error('Invalid checkout address.');window.location.assign(url.href);}
    else {setMessage('This attempt is '+result.status+'. Start a new attempt if needed.');await refresh();}
  }
  async function get(id:string) {
    const response=await fetch('/api/playground/purchases',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id})});
    if(!response.ok){const result=await response.json();throw new Error(result.error || 'Download unavailable.');}
    download(new Uint8Array(await response.arrayBuffer()),'eidos-purchased-export.zip','application/zip');setMessage('Verified export downloaded.');
  }
  return <details><summary>Purchase history</summary>
    <button disabled={busy} onClick={()=>void run(refresh)}>Refresh purchases</button>
    <p role="status">{message}</p>
    {amount!==null && <><p>Test checkout · ${(amount/100).toFixed(2)} USD in test mode. No live sales. Save your current account revision first.</p>
      <button disabled={busy || !active || dirty} onClick={()=>void run(checkout)}>Test export checkout</button>
      <button disabled={busy} onClick={()=>{attempt.current=null;setMessage('A new checkout attempt will be created.');}}>Start a new checkout attempt</button></>}
    {items.map(item=><div key={item.id}><span>{item.name} · {item.mode} · {item.status}</span><button disabled={busy || item.status!=='paid'} onClick={()=>void run(()=>get(item.id))}>Download purchased revision</button></div>)}
  </details>;
}
