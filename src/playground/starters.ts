import { createProject, validateProject, type Project, type Section } from './model';
import { newNode, type BlockNode } from './authoringSchema';
import { defaultMedia } from './media';

export type ProjectGoal = 'business' | 'landing' | 'portfolio';
export type VisitorAction = 'contact' | 'estimate' | 'link';
export type StarterId = 'switchboard' | 'tideglass' | 'matter';
export type StarterBrief = { starter: StarterId; goal: ProjectGoal; action: VisitorAction; name?: string; offer?: string; verifiedLink?: string; linkConfirmed?: boolean; logo?: string; photo?: string; accent?: string };
export const starters: {id:StarterId;name:string;purpose:string;description:string;goal:ProjectGoal;artwork:string;alt:string}[] = [
  {id:'switchboard',name:'Switchboard',purpose:'A clear service business',description:'A split introduction, practical services, and a direct next step.',goal:'business',artwork:'/template-demos/switchboard/assets/service-plan.svg',alt:'Eidos illustration of a house and a project plan'},
  {id:'tideglass',name:'Tideglass',purpose:'One offer, room to breathe',description:'A centered invitation, wide landscape, and a focused call to action.',goal:'landing',artwork:'/template-demos/tideglass/assets/coast.svg',alt:'Eidos illustration of a quiet coastal landscape'},
  {id:'matter',name:'Matter',purpose:'Work with a point of view',description:'An editorial introduction, large work studies, and a studio story.',goal:'portfolio',artwork:'/template-demos/matter/assets/vessel.svg',alt:'Eidos illustration of a clay vessel study'},
];
export function verifiedDestination(value: string, confirmed: boolean): string {
  let url: URL;
  try { url = new URL(value); } catch { throw Error('Add a full https:// booking or purchase link.'); }
  if (!confirmed || url.protocol !== 'https:' || url.username || url.password || !url.hostname.includes('.')) throw Error('Use an https:// link you control, then confirm you have checked its destination.');
  return url.href;
}
function leaf(type: BlockNode['type'], patch: Partial<BlockNode>): BlockNode { return {...newNode(type),...patch}; }
function stack(name: string, children: BlockNode[], patch: Partial<BlockNode> = {}): BlockNode { return leaf('stack',{name,children,...patch}); }

/** Uses the existing authoring/renderer contract; no separate starter document. */
export function createStarter(brief: StarterBrief, artwork = ''): Project {
  const starter = starters.find(s => s.id === brief.starter);
  if (!starter) throw Error('Choose an available starting point.');
  const base = createProject(brief.goal === 'business' ? 'homepage' : brief.goal);
  const name = brief.name?.trim() || (brief.starter === 'switchboard' ? 'Your business' : brief.starter === 'tideglass' ? 'Your next chapter' : 'Your creative studio');
  const title = brief.offer?.trim() || (brief.starter === 'switchboard' ? 'Good work starts\nwith a clear plan.' : brief.starter === 'tideglass' ? 'Make room for\nsomething good.' : 'Objects, ideas,\nand a point of view.');
  const action = brief.action === 'estimate' ? 'Request an estimate' : brief.action === 'link' ? 'See the details' : 'Start a conversation';
  const destination = brief.action === 'link' ? verifiedDestination(brief.verifiedLink || '', brief.linkConfirmed === true) : '#contact';
  const image = brief.photo || artwork;
  const imageNode = leaf('image',{name:'Hero image',image,alt:brief.photo?'Add a description of your photo':starter.alt,height:brief.starter === 'tideglass'?420:560,media:{...defaultMedia(),sourceName:brief.photo?'Your uploaded photo':`Eidos ${starter.name} illustration`}});
  const heading = leaf('heading',{name:'Headline',text:title});
  const description = leaf('text',{name:'Introduction',text:brief.starter === 'switchboard' ? 'Tell people what you do, who you help, and how to get started.' : brief.starter === 'tideglass' ? 'A thoughtful introduction to your offer. Make this space your own.' : 'Independent creative work, made with care. Introduce your practice here.'});
  const button = leaf('button',{name:'Primary action',text:action,href:destination});
  const copy = stack('Introduction',[heading,description,button],{gap:28});
  const root = brief.starter === 'tideglass' ? stack('Offer introduction',[heading,description,button,imageNode],{align:'center',gap:32}) : leaf('columns',{name:'Introduction and image',children:brief.starter === 'matter'?[imageNode,copy]:[copy,imageNode],split:brief.starter === 'matter'?45:55,gap:48,mobile:{layout:'stack',gap:28}});
  if (brief.starter === 'tideglass') for (const node of root.children || []) node.align = 'center';
  const sections: Section[] = base.sections.map(s => ({...s,type:s.id as Section['type']}));
  sections[0] = {...sections[0],title:name,description:'',navigation:brief.starter === 'matter'?[{label:'Work',href:'#work'},{label:'About',href:'#about'}]:[{label:'Details',href:'#services'}],cta:action,href:destination,...(brief.logo?{image:brief.logo,alt:name,media:{...defaultMedia(),fit:'contain',sourceName:'Your uploaded logo'}}:{})};
  sections[1] = {...sections[1],title,description:description.text,cta:action,href:destination,authoring:{version:1,root}};
  sections[2] = {...sections[2],title:'What you can expect',description:brief.goal === 'business'?'A clear first conversation\nA plan built around your needs\nCareful work, from start to finish':'The idea\nThe experience\nYour next step'};
  sections[3] = {...sections[3],title:brief.starter === 'matter'?'Selected work':'A closer look',description:brief.starter === 'matter'?'Replace this original Eidos study with a project of your own.':'Add a photo and a short example that helps people understand your work.',image:brief.starter === 'matter'?image:'',alt:brief.starter === 'matter'?imageNode.alt:'',visible:brief.starter === 'matter'};
  sections[4] = {...sections[4],title:brief.action === 'estimate'?'Tell us about\nyour project.':'Let’s make\nsomething happen.',description:brief.action === 'link'?'Continue to the destination you reviewed.': 'Add your email or phone link in the editor. This page has no connected contact form.',cta:brief.action === 'link'?action:'Add your contact destination',href:brief.action === 'link'?destination:'#'};
  sections[5] = {...sections[5],title:name,description:'Made with care.'};
  if (brief.starter === 'matter') {
    sections[2].visible = false;
    const about = {...base.sections[2],id:'about',type:'about' as const,title:'A little about the practice.',description:'Share the approach, interests, and experience behind your work.'};
    sections.splice(4,0,about);
  }
  const palette = brief.starter === 'switchboard'?{background:'#f5f5ed',foreground:'#17372f',accent:'#d8f35f'}:brief.starter === 'tideglass'?{background:'#edf2ed',foreground:'#254b50',accent:'#b5d1c4'}:{background:'#eee4d6',foreground:'#402f24',accent:'#b66b48'};
  // Preserve every approved glass setting. Page branding is scoped to the page.
  return validateProject({...base,schemaVersion:5,name,brand:{businessName:name,tone:'',locks:[]},tokens:{...base.tokens,...palette,...(brief.accent?{accent:brief.accent}:{}),font:brief.starter==='switchboard'?'modern':'editorial',radius:brief.starter==='matter'?2:brief.starter==='tideglass'?12:8,spacing:brief.starter==='matter'?100:72,typeScale:brief.starter==='matter'?0.95:1},sections});
}

/** Rasterize only the bundled, Eidos-owned illustration into portable image bytes. */
export async function loadStarterArtwork(id: StarterId): Promise<string> {
  const starter = starters.find(s => s.id === id)!;
  const response = await fetch(starter.artwork);
  if (!response.ok) throw Error('Starter artwork could not load. Try again or add your own photo.');
  const svg = await response.text(), source = new DOMParser().parseFromString(svg,'image/svg+xml').documentElement;
  const viewBox = source.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number);
  const blob = new Blob([svg],{type:'image/svg+xml'}), url = URL.createObjectURL(blob);
  try {
    const image = new Image(); image.src = url; await image.decode();
    const width = viewBox?.length === 4 && viewBox[2] > 0 ? viewBox[2] : image.naturalWidth;
    const height = viewBox?.length === 4 && viewBox[3] > 0 ? viewBox[3] : image.naturalHeight;
    const canvas = document.createElement('canvas'), scale = Math.min(1,1200/Math.max(width,height));
    canvas.width = Math.round(width*scale); canvas.height = Math.round(height*scale);
    const context = canvas.getContext('2d'); if (!context) throw Error('Starter image processing is unavailable.');
    context.drawImage(image,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/webp',0.9);
  } finally { URL.revokeObjectURL(url); }
}
