export type ToolRecommendation={id:string;article:string;title:string;reason:string;url:string;approved:boolean;rightsConfirmed:boolean};
// No tracking identity, product claim, price, review or third-party image is invented.
export const affiliatePilot:{enabled:boolean;identityApproved:boolean;items:ToolRecommendation[]}={enabled:false,identityApproved:false,items:[]};
export function approvedRecommendation(item:ToolRecommendation){
 if(!item.approved||!item.rightsConfirmed||!/^[-a-z0-9]{1,80}$/.test(item.id))return false;
 try{const u=new URL(item.url);return u.protocol==='https:'&&['www.amazon.com','amazon.com','amzn.to'].includes(u.hostname)&&!u.username&&!u.password}catch{return false}
}
