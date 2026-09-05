/* No dependencies, model calls, analytics, or external requests. */
const toggle=document.querySelector('.menu');
const navigation=document.getElementById('navigation');
function closeMenu(restoreFocus=false){navigation.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu +';if(restoreFocus)toggle.focus();}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';navigation.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Close −':'Menu +';});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true')closeMenu(true);});
document.addEventListener('click',event=>{if(!navigation.contains(event.target)&&!toggle.contains(event.target))closeMenu();});
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>closeMenu()));
matchMedia('(min-width:701px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
