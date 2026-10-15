import {affiliatePilot,approvedRecommendation} from '../data/affiliatePilot';
import {consent,safePagePath} from '../lib/analytics';
export function ToolsUsed({article}:{article:string}){
 const items=affiliatePilot.items.filter(i=>i.article===article&&approvedRecommendation(i));
 if(!affiliatePilot.enabled||!affiliatePilot.identityApproved||!items.length)return null;
 return <aside className="insight-article__sources" aria-label="Tools for this task"><h2>Tools for this task</h2><p>As an Amazon Associate I earn from qualifying purchases.</p>{items.map(item=><article key={item.id}><h3>{item.title}</h3><p>{item.reason}</p><p>This is an affiliate link. Eidos Works may earn a commission if you buy through it.</p><a href={item.url} rel="sponsored nofollow noopener noreferrer" onClick={()=>{if(consent()==='granted')window.gtag?.('event','affiliate_click',{article,placement:'tools_used',category:item.id,page_location:location.origin+safePagePath()});}}>View the item at Amazon ↗</a></article>)}</aside>;
}
