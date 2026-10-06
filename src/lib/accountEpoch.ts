/** Session-change signal only: no identity, credentials or project contents are stored. */
const key='eidos-account-epoch';let memory='';
export function accountEpoch(){if(typeof window==='undefined')return '';try{return localStorage.getItem(key)||memory;}catch{return memory;}}
export function announceAccountChange(){if(typeof window==='undefined')return;memory=crypto.randomUUID();try{localStorage.setItem(key,memory);}catch{/* Private browsing still has the in-tab signal. */}window.dispatchEvent(new Event('eidos:account-change'));if(typeof BroadcastChannel!=='undefined'){const channel=new BroadcastChannel(key);channel.postMessage(memory);channel.close();}}
export function subscribeAccountChanges(change:()=>void){
 let seen=accountEpoch();const notify=()=>{const current=accountEpoch();if(current!==seen){seen=current;change();}};
 const storage=(event:StorageEvent)=>{if(event.key===key){memory=event.newValue||'';notify();}};
 const channel=typeof BroadcastChannel==='undefined'?null:new BroadcastChannel(key);if(channel)channel.onmessage=event=>{if(typeof event.data==='string' && /^[a-f0-9-]{36}$/.test(event.data)){memory=event.data;notify();}};
 window.addEventListener('storage',storage);window.addEventListener('eidos:account-change',notify);
 return()=>{window.removeEventListener('storage',storage);window.removeEventListener('eidos:account-change',notify);channel?.close();};
}
export function changesAccountSession(url:string,data:unknown){const action=data && typeof data==='object' && 'action' in data?data.action:null;return (url==='/api/members/auth'&&['logout','verify'].includes(String(action)))||(url==='/api/members/credentials'&&['login','verify-signup','reset','change-password'].includes(String(action)))||(url==='/api/members/google'&&action==='complete-signup')||(url==='/api/members/account'&&action==='signout-all');}
