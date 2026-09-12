/** Pointer sorting for bounded editor lists. Only the dedicated handle suppresses touch scrolling. */
export function startListMove(event: React.PointerEvent<HTMLButtonElement>, valid: () => boolean, commit: (id:string, before:string) => void): () => void {
  if(!event.isPrimary||event.button!==0)return ()=>{};
  const handle=event.currentTarget,row=handle.closest<HTMLElement>('[data-sort-id]'),list=row?.parentElement;
  if(!row||!list)return ()=>{};
  event.preventDefault();event.stopPropagation();
  const abort=new AbortController(),options={signal:abort.signal};
  const pointer=event.pointerId,startX=event.clientX,startY=event.clientY,rect=row.getBoundingClientRect();
  let x=startX,y=startY,moved=false,ghost:HTMLElement|null=null,frame=0,before:string|null=null,marked:HTMLElement|null=null;
  let last=0;
  function cancel(){abort.abort();cancelAnimationFrame(frame);ghost?.remove();row!.style.opacity='';marked?.classList.remove('pg-section-drop');if(handle.hasPointerCapture(pointer))handle.releasePointerCapture(pointer);}
  function locate(){
    const bounds=list!.getBoundingClientRect();if(x<bounds.left||x>bounds.right||y<Math.max(0,bounds.top)||y>Math.min(innerHeight,bounds.bottom))return null;
    const rows=Array.from(list!.children).filter((el):el is HTMLElement=>el instanceof HTMLElement && !!el.dataset.sortId && el!==row);
    return rows.find(el=>{const r=el.getBoundingClientRect();return y<r.top+r.height/2;})||null;
  }
  function paint(time:number){
    if(!valid()){cancel();return;}const dt=Math.min(32,time-(last||time-16));last=time;
    const scroller=list!.closest<HTMLElement>('.pg-sidebar');if(scroller){const r=scroller.getBoundingClientRect();if(y<r.top+36)scroller.scrollTop-=dt*.5;else if(y>r.bottom-36)scroller.scrollTop+=dt*.5;}
    const next=locate();before=next?.dataset.sortId||null;
    if(next!==marked){marked?.classList.remove('pg-section-drop');next?.classList.add('pg-section-drop');marked=next;}
    if(ghost){ghost.style.transform=`translate3d(${x-(startX-rect.left)}px,${y-(startY-rect.top)}px,0)`;ghost.setAttribute('aria-label',before?'Move before '+next?.textContent:'Release outside to cancel');}
    frame=requestAnimationFrame(paint);
  }
  handle.setPointerCapture(pointer);
  document.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;x=e.clientX;y=e.clientY;if(!moved&&Math.hypot(x-startX,y-startY)>=6){moved=true;ghost=row.cloneNode(true) as HTMLElement;ghost.removeAttribute('data-sort-id');ghost.inert=true;ghost.setAttribute('aria-hidden','true');Object.assign(ghost.style,{position:'fixed',left:'0',top:'0',width:rect.width+'px',height:rect.height+'px',zIndex:'10000',pointerEvents:'none',background:'#f4f7ed',boxShadow:'0 8px 24px #0004'});document.body.append(ghost);row.style.opacity='.3';frame=requestAnimationFrame(paint);}if(moved)e.preventDefault();},{...options,passive:false});
  document.addEventListener('pointerup',e=>{if(e.pointerId!==pointer)return;x=e.clientX;y=e.clientY;const target=locate()?.dataset.sortId;const apply=moved&&valid()&&target&&target!==row.dataset.sortId;cancel();if(apply)commit(row.dataset.sortId!,target);},options);
  document.addEventListener('pointercancel',cancel,options);handle.addEventListener('lostpointercapture',cancel,options);window.addEventListener('blur',cancel,options);window.addEventListener('resize',cancel,options);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();},options);document.addEventListener('keydown',e=>{if(e.key==='Escape')cancel();},options);
  return cancel;
}
