"use strict";var EidosGlass=(()=>{var et=Object.defineProperty;var Mt=Object.getOwnPropertyDescriptor;var Pt=Object.getOwnPropertyNames;var wt=Object.prototype.hasOwnProperty;var vt=(t,n)=>{for(var o in n)et(t,o,{get:n[o],enumerable:!0})},St=(t,n,o,i)=>{if(n&&typeof n=="object"||typeof n=="function")for(let h of Pt(n))!wt.call(t,h)&&h!==o&&et(t,h,{get:()=>n[h],enumerable:!(i=Mt(n,h))||i.enumerable});return t};var Et=t=>St(et({},"__esModule",{value:!0}),t);var Ct={};vt(Ct,{mount:()=>Rt});var T={id:"eidos-edge-light-v5",name:"Eidos liquid glass \u2014 approved edge light + mobile touch prism",approvedDate:"2026-09-10",lens:{edgeBend:16,magnification:1.03,frostPx:1.2,saturation:1.2,rimWidthPx:19,rimHeightRatio:.25,mapSmoothingPx:.55},light:{reachPx:170,falloffPx:115,bevelPx:7,whitePeak:.72,colourPeak:.32,touchColourPeak:.65,whiteDepthPx:.9,whiteWidthPx:.85,colourDepthPx:2.8,colourWidthPx:1.35,spectralSpreadPx:48,spectralSeparationPx:30,greenBalance:.84,pressBoost:.18,darkDimming:.12,pixelRatioCap:1.5},contact:{hoverScale:.5,pressScale:4.3,fullDepthPx:3,zeroDepthPx:22,textureSize:96,minFootprintPx:150,maxFootprintPx:240,widthRatio:.24},springs:{x:48,y:48,light:28,hover:25,press:32,flow:18,material:24},scroll:{velocityScale:1100,bendBoost:.014,rimRest:.42,rimBoost:.1},site:{solidThroughPx:4,fullyLiquidAtPx:72,solidColour:"#0f2530",desktopRadiusPx:29,mobileRadiusPx:23}};var S=(t,n=0,o=1)=>Math.max(n,Math.min(o,t)),K=t=>{let n=S(t);return n*n*(3-2*n)},dt=(t,n=T.site)=>K((t-n.solidThroughPx)/(n.fullyLiquidAtPx-n.solidThroughPx));function ut(t,n,o,i){let h=t.x-n,s=t.v+o*h,c=Math.exp(-o*i);t.x=n+(h+s*i)*c,t.v=(t.v-o*s*i)*c,Math.abs(t.x-n)<1e-4&&Math.abs(t.v)<.001&&(t.x=n,t.v=0)}function J(t,n,o,i,h){let s=t-o/2,c=n-i/2,p=Math.abs(s)-(o/2-h),y=Math.abs(c)-(i/2-h),C=Math.max(p,0),x=Math.max(y,0),f=Math.hypot(C,x),b=h-f-Math.min(Math.max(p,y),0),D=0,r=0;return f?(D=C/f*Math.sign(s),r=x/f*Math.sign(c)):p>y?D=Math.sign(s):r=Math.sign(c),{depth:b,nx:D,ny:r}}function nt(t,n){let o=document.createElement("canvas");o.width=t,o.height=n;let i=o.getContext("2d");if(!i)throw new Error("Canvas unavailable");return{canvas:o,ctx:i,pixels:i.createImageData(t,n)}}function Lt(t,n,o,i){return i&&t>0?1+S(o)*(n/t-1):1}function ht(t,n,o,i=T){let h=nt(t,n),s=nt(t,n),{edgeBend:c,magnification:p}=i.lens,y=Math.max(64,(95*(1-1/p)+c+5)*2.05),C=Math.min(i.lens.rimWidthPx,n*i.lens.rimHeightRatio);for(let x=0;x<n;x++)for(let f=0;f<t;f++){let{depth:b,nx:D,ny:r}=J(f+.5,x+.5,t,n,o),M=Math.pow(1-S(Math.max(0,b)/C),2),E=C*.62*(1-Math.exp(-c/22))*M,A=-95*Math.tanh((f+.5-t/2)/95)*(1-1/p)-D*E,q=-(x+.5-n/2)*(1-1/p)-r*E,g=(x*t+f)*4;h.pixels.data.set([Math.round(255*(.5+A/y)),Math.round(255*(.5+q/y)),128,255],g);let Y=1-K((Math.max(0,b)-i.contact.fullDepthPx)/(i.contact.zeroDepthPx-i.contact.fullDepthPx));s.pixels.data.set([255,255,255,Math.round(255*Y)],g)}return h.ctx.putImageData(h.pixels,0,0),s.ctx.putImageData(s.pixels,0,0),{lens:h.canvas.toDataURL(),mask:s.canvas.toDataURL(),scale:y}}function mt(){let t=T.contact.textureSize,{canvas:n,ctx:o,pixels:i}=nt(t,t);for(let h=0;h<t;h++)for(let s=0;s<t;s++){let c=(s+.5-t/2)/(t/2),p=(h+.5-t/2)/(t/2),y=Math.exp(-(c*c+p*p)*4)*1.65*Math.pow(Math.max(0,1-Math.max(c*c,p*p)),2);i.data.set([S(Math.round(128+255*c*y),0,255),S(Math.round(128+255*p*y),0,255),128,255],(h*t+s)*4)}return o.putImageData(i,0,0),n.toDataURL()}function pt(t,n=T){let o=t.getContext("2d");if(!o)return null;let i=n.light,h=typeof matchMedia=="function"&&matchMedia("(hover: none) and (pointer: coarse)").matches,s,c=[];return{resize(p,y,C){let x=Math.min(devicePixelRatio||1,i.pixelRatioCap);t.width=Math.ceil(p*x),t.height=Math.ceil(y*x),s=o.createImageData(t.width,t.height),c=[];for(let f=0;f<t.height;f++)for(let b=0;b<t.width;b++){let D=(b+.5)/x,r=(f+.5)/x,{depth:M,nx:E,ny:A}=J(D,r,p,y,C);if(M<0||M>i.bevelPx)continue;let q=S(M*x);c.push({i:(f*t.width+b)*4,x:D,y:r,nx:E,ny:A,white:Math.exp(-Math.pow((M-i.whiteDepthPx)/i.whiteWidthPx,2))*i.whitePeak*q,colour:Math.exp(-Math.pow((M-i.colourDepthPx)/i.colourWidthPx,2))*i.colourPeak*q})}},render(p,y,C,x,f,b){if(t.style.opacity=b?"1":C.toFixed(4),!s||!b&&C<.001)return;let D=Lt(i.colourPeak,i.touchColourPeak,x,h);for(let r of c){let M=p-r.x,E=y-r.y,A=M*r.nx+E*r.ny,q=-M*r.ny+E*r.nx,g=.4+.6*S(.5+A/110),Y=Math.exp(-(M*M+E*E)/(2*i.falloffPx*i.falloffPx)),H=g*Y*(1+x*i.pressBoost)*(1-f*i.darkDimming),d=i.spectralSpreadPx+Math.min(45,Math.abs(A)*.25),u=i.spectralSeparationPx+S(Math.abs(A)/90)*12,B=Math.exp(-Math.pow((q-u)/d,2)*.5),N=Math.exp(-Math.pow(q/d,2)*.5)*i.greenBalance,j=Math.exp(-Math.pow((q+u)/d,2)*.5),V=(b?.x??0)-r.x,z=(b?.y??0)-r.y,I=Math.hypot(V,z,160),X=Math.pow(S((V*r.nx+z*r.ny+80)/I),2),Q=1/(1+Math.pow(I/(i.reachPx*4),2)),w=(b?.intensity??0)*X*Q,k=b?C:1,F=r.white*H*k,O=r.colour*H*D*k,_=F+O*B+w*(r.white+r.colour*.38),Z=F+O*N+w*(r.white+r.colour*.78),v=F+O*j+w*(r.white+r.colour),$=Math.max(_,Z,v);s.data[r.i]=$?Math.round(255*_/$):0,s.data[r.i+1]=$?Math.round(255*Z/$):0,s.data[r.i+2]=$?Math.round(255*v/$):0,s.data[r.i+3]=Math.round(255*S($))}o.putImageData(s,0,0)}}}function xt(t,n={}){let o={...T,lens:{...T.lens,...n.lens},light:{...T.light,...n.light},contact:{...T.contact,...n.contact},springs:{...T.springs,...n.springs},scroll:{...T.scroll,...n.scroll},site:{...T.site,...n.site}},i=e=>n.disabled?0:n.tile?1:dt(e,o.site),h=t.closest("header")??t,s,c=e=>t.querySelector(e),p=c("filter"),y=c("[data-lens-map]"),C=c("[data-edge-mask]"),x=c("[data-contact-map]"),f=c("[data-base-displacement]"),b=c("[data-contact-displacement]"),D=c("canvas"),r=c(".ew-liquid-optics"),M=matchMedia("(prefers-reduced-motion: reduce)"),E=matchMedia("(forced-colors: active)"),A=/Chrome|Chromium|Edg\//.test(navigator.userAgent)&&!/iPhone|iPad|iPod/.test(navigator.userAgent)&&CSS.supports("backdrop-filter",`url(#${p.id})`),q=new AbortController,g={passive:!0,signal:q.signal},Y=pt(D,o),H=Object.keys(o.springs),d=Object.fromEntries(H.map(e=>[e,{x:e==="x"?.3:e==="y"?.5:0,v:0}])),u=Object.fromEntries(H.map(e=>[e,d[e].x])),B=0,N=0,j=Math.max(0,window.scrollY),V=!1,z=!0,I=!0,X=29,Q=64,w=null,k=null,F=null,O=!1,_=[],Z=i(j);t.style.setProperty("--ew-liquid",String(Z)),t.style.setProperty("--ew-glass-frost",`${o.lens.frostPx}px`),t.style.setProperty("--ew-glass-saturation",String(o.lens.saturation)),t.style.setProperty("--ew-glass-solid",o.site.solidColour),t.style.setProperty("--ew-glass-radius",`${o.site.desktopRadiusPx}px`),t.style.setProperty("--ew-glass-mobile-radius",`${o.site.mobileRadiusPx}px`);function v(){!B&&!V&&!document.hidden&&(N=performance.now(),B=requestAnimationFrame(rt))}function $(e,l,a){return J(e-a.left,l-a.top,a.width,a.height,X).depth}function gt(e){if(u.light=0,u.hover=0,u.press=0,F?.isConnected){let m=F.getBoundingClientRect();u.x=(m.left+m.width/2-e.left)/e.width,u.y=(m.top+m.height/2-e.top)/e.height,u.light=1,u.hover=1,u.press=O?1:0;return}if(!w||w.kind==="touch"&&k===null)return;let l=$(w.x,w.y,e),a=l>=0;u.light=K(1-Math.max(0,-l)/o.light.reachPx),u.hover=a?1:0,u.press=a&&k!==null?1:0,u.light>0&&(u.x=(w.x-e.left)/e.width,u.y=(w.y-e.top)/e.height,d.light.x<.025&&(d.x={x:u.x,v:0},d.y={x:u.y,v:0}))}function ot(e,l){let a=0,m=1;for(let L of document.elementsFromPoint(e,l)){if(h.contains(L))continue;let G=L.closest("[data-glass-tone]")?.dataset.glassTone;if(G){a+=m*(G==="dark"?25:245),m=0;break}let P=getComputedStyle(L).backgroundColor.match(/[\d.]+/g)?.map(Number);if(!P||P.length<3)continue;let R=P[3]??1;if(a+=m*R*(P[0]*.2126+P[1]*.7152+P[2]*.0722),m*=1-R,m<.01)break}return a+m*245}function it(e){if(n.tile){u.material=1,I=!1;return}_=[...t.querySelectorAll(".ew-brand,.ew-nav a,.ew-header__cta,.ew-menu-toggle")].filter(a=>a.getClientRects().length>0).map(a=>{let m=a.getBoundingClientRect(),L=!!a.closest(".ew-nav.is-open")&&getComputedStyle(a.parentElement).position==="absolute";return{el:a,brightness:L?25:ot(m.left+m.width/2,m.top+m.height/2)}});let l=ot(e.left+e.width/2,e.top+e.height/2);u.material=l<135?1:0,I=!1}function ft(e){let l=Math.round(t.clientWidth),a=Math.round(t.clientHeight);if(!(l<2||a<2)){if(X=Math.min(a/2,parseFloat(getComputedStyle(t).borderTopLeftRadius)),Y?.resize(l,a,X),A)try{let m=ht(l,a,X,o);Q=m.scale,p.setAttribute("width",String(l)),p.setAttribute("height",String(a));for(let L of[y,C])L.setAttribute("width",String(l)),L.setAttribute("height",String(a));y.setAttribute("href",m.lens),C.setAttribute("href",m.mask),x.setAttribute("href",mt()),r.style.backdropFilter=`url(#${p.id}) blur(${o.lens.frostPx}px) saturate(${o.lens.saturation})`}catch{A=!1,r.style.removeProperty("backdrop-filter")}t.dataset.glassEngine=A?"refraction":"frosted",z=!1,it(e)}}function bt(e,l){let a=!M.matches&&!n.reducedMotion&&!E.matches,m=a?S(d.light.x)*l:0,L=a?S(d.press.x):0,G=a?S(d.flow.x,-1,1):0,P=S(d.material.x);t.style.setProperty("--ew-liquid",l.toFixed(4)),t.style.setProperty("--ew-rim-energy",String(o.scroll.rimRest+Math.abs(G)*o.scroll.rimBoost)),t.style.setProperty("--ew-glass-top",`rgba(${Math.round(255-238*P)},${Math.round(255-224*P)},${Math.round(255-200*P)},${.15+.07*P})`),t.style.setProperty("--ew-glass-bottom",`rgba(${Math.round(209-21*P)},${Math.round(233+11*P)},${Math.round(228+5*P)},${.07-.025*P})`),t.dataset.glassState=l===0?"solid":l===1?"liquid":"transition",t.dataset.glassContact=k!==null?"pressed":u.hover?"hover":"rest";for(let{el:W,brightness:yt}of _){let ct=34*(1-l)+yt*l;ct<125?W.dataset.glassTone="dark":ct>145&&(W.dataset.glassTone="light")}let R=s&&!E.matches?{...s,x:s.x-e.left,y:s.y-e.top}:void 0;if(Y?.render(d.x.x*e.width,d.y.x*e.height,m*(n.tile?.3:1),L,P,R),A){let W=S(e.width*o.contact.widthRatio,o.contact.minFootprintPx,o.contact.maxFootprintPx);x.setAttribute("x",(d.x.x*e.width-W/2).toFixed(3)),x.setAttribute("y",(d.y.x*e.height-W/2).toFixed(3)),x.setAttribute("width",String(W)),x.setAttribute("height",String(W)),b.setAttribute("scale",(a?l*(d.hover.x*o.contact.hoverScale+L*o.contact.pressScale):0).toFixed(4)),f.setAttribute("scale",(Q*(1+Math.abs(G)*o.scroll.bendBoost)).toFixed(4))}}function rt(e){if(B=0,V||document.hidden)return;let l=Math.max(.001,(e-N)/1e3);N=e;let a=t.getBoundingClientRect();z?ft(a):I&&it(a),gt(a);let m=Math.max(0,window.scrollY),L=i(m);if(u.flow=n.tile?0:Math.tanh((m-j)/Math.max(1/120,l)/o.scroll.velocityScale),j=m,M.matches||n.reducedMotion||E.matches||L===0){for(let R of H)d[R].x=u[R],d[R].v=0;d.light.x=0,d.hover.x=0,d.press.x=0,d.flow.x=0}else for(let R of H)ut(d[R],u[R],o.springs[R],l);bt(a,L);let G=L>0&&!M.matches&&!n.reducedMotion&&!E.matches&&H.some(R=>Math.abs(d[R].x-u[R])>1e-4||Math.abs(d[R].v)>.001),P=L>0&&!M.matches&&!n.reducedMotion&&!E.matches&&Math.abs(u.flow)>1e-4;(G||P)&&(B=requestAnimationFrame(rt))}function tt(e=!1){k=null,O=!1,(e||w?.kind==="touch")&&(w=null),v()}function U(){w=null,k=null,F=null,O=!1;for(let e of["light","hover","press","flow"])d[e]={x:0,v:0},u[e]=0;D.style.opacity="0",b.setAttribute("scale","0"),B&&cancelAnimationFrame(B),B=0,I=!0,j=Math.max(0,window.scrollY),v()}document.addEventListener("pointermove",e=>{if(!e.isPrimary||k!==null&&e.pointerId!==k||e.pointerType==="touch"&&k===null)return;w={x:e.clientX,y:e.clientY,kind:e.pointerType},F=null;let l=t.getBoundingClientRect();($(e.clientX,e.clientY,l)>-o.light.reachPx||d.light.x>.001||k!==null)&&v()},g),t.addEventListener("pointerdown",e=>{!e.isPrimary||e.button!==0||k!==null||$(e.clientX,e.clientY,t.getBoundingClientRect())<0||(k=e.pointerId,F=null,w={x:e.clientX,y:e.clientY,kind:e.pointerType},v())},g),document.addEventListener("pointerup",e=>{e.pointerId===k&&(w={x:e.clientX,y:e.clientY,kind:e.pointerType},tt())},g),document.addEventListener("pointercancel",e=>{e.pointerId===k&&tt(!0)},g),document.documentElement.addEventListener("pointerleave",()=>tt(!0),g),t.addEventListener("lostpointercapture",()=>tt(!0),g),t.addEventListener("focusin",e=>{let l=e.target;l.matches(":focus-visible")&&(F=l,w=null,v())},g),t.addEventListener("focusout",e=>{t.contains(e.relatedTarget)||(F=null,O=!1,v())},g),t.addEventListener("keydown",e=>{F&&e.key==="Enter"&&(O=!0,v())},g),t.addEventListener("keyup",()=>{O=!1,v()},g),window.addEventListener("scroll",()=>{I=!0,v()},g),window.addEventListener("resize",()=>{z=!0,I=!0,v()},g),window.addEventListener("pageshow",U,g),window.addEventListener("blur",U,g),document.addEventListener("visibilitychange",U,g),M.addEventListener("change",U,g),E.addEventListener("change",U,g);let at=new ResizeObserver(()=>{z=!0,v()});at.observe(t);let st=new MutationObserver(()=>{I=!0,v()}),lt=t.querySelector("nav");return lt&&st.observe(lt,{attributes:!0,attributeFilter:["class"]}),n.tile&&t.closest(".ew-cinema")?.addEventListener("hero-light",e=>{s=e.detail,v()},g),v(),()=>{V=!0,q.abort(),at.disconnect(),st.disconnect(),B&&cancelAnimationFrame(B),D.style.opacity="0",r.style.removeProperty("backdrop-filter")}}function Rt(t,n=document){let o=n.querySelector(".pg-header .ew-header__inner");return o?xt(o,{disabled:!t.enabled,reducedMotion:t.reducedMotion,lens:{frostPx:t.frost},light:{whitePeak:t.edge,colourPeak:t.prism},contact:{pressScale:t.touch},springs:{light:t.response},site:{solidColour:t.solid,solidThroughPx:t.start,fullyLiquidAtPx:t.end,desktopRadiusPx:t.radius,mobileRadiusPx:Math.min(23,t.radius)}}):()=>{}}return Et(Ct);})();

(function pageRuntime(initial) {
  let config = initial;
  let dispose = () => {
  };
  let headerSource = document.querySelector(".pg-header")?.outerHTML || "";
  function patch(target, source) {
    for (const attr of Array.from(target.attributes)) if (!source.hasAttribute(attr.name)) target.removeAttribute(attr.name);
    for (const attr of Array.from(source.attributes)) if (target.getAttribute(attr.name) !== attr.value) target.setAttribute(attr.name, attr.value);
    let cursor = target.firstChild;
    for (const desired of Array.from(source.childNodes)) {
      const key = desired instanceof Element ? desired.id || desired.getAttribute("data-composition-part") : null;
      let current = cursor;
      if (key) current = Array.from(target.childNodes).find((n) => n instanceof Element && (n.id || n.getAttribute("data-composition-part")) === key) || null;
      if (!current || current.nodeName !== desired.nodeName) {
        const clone = desired.cloneNode(true);
        target.insertBefore(clone, cursor);
        cursor = clone.nextSibling;
        continue;
      }
      if (current !== cursor) target.insertBefore(current, cursor);
      if (current instanceof Element && desired instanceof Element) {
        if (!current.matches(".ew-glass-header")) patch(current, desired);
      } else if (current.nodeValue !== desired.nodeValue) current.nodeValue = desired.nodeValue;
      cursor = current.nextSibling;
    }
    while (cursor) {
      const next = cursor.nextSibling;
      cursor.remove();
      cursor = next;
    }
  }
  function mount() {
    dispose();
    const disposeGlass = config.originalGlass ? EidosGlass.mount(config.glass) : () => {
    };
    const header = config.originalGlass ? null : document.querySelector(".pg-header");
    const canvas = header?.querySelector("canvas");
    const context = canvas?.getContext("2d");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const abort = new AbortController(), options = { signal: abort.signal };
    const g = config.glass;
    let frame = 0, last = 0, active = false, pressed = false, targetX = 0, targetY = 0, x = 0, y = 0, vx = 0, vy = 0, light = 0, lv = 0, press = 0, pv = 0, material = 0;
    const motion = () => !reduced.matches && !g.reducedMotion;
    const smooth = (n) => {
      const t = Math.max(0, Math.min(1, n));
      return t * t * (3 - 2 * t);
    };
    const spring = (v, velocity, target, frequency, dt) => {
      const d = v - target, j = velocity + frequency * d, e = Math.exp(-frequency * dt);
      return [target + (d + j * dt) * e, (velocity - frequency * j * dt) * e];
    };
    function draw(time) {
      frame = 0;
      const dt = Math.min((time - (last || time - 16)) / 1e3, 0.04);
      last = time;
      [x, vx] = spring(x, vx, targetX, 48, dt);
      [y, vy] = spring(y, vy, targetY, 48, dt);
      [light, lv] = spring(
        light,
        lv,
        active && motion() ? 1 : 0,
        g.response,
        dt
      );
      [press, pv] = spring(press, pv, pressed && motion() ? 1 : 0, 32, dt);
      if (header && canvas && context) {
        const { width: w, height: h } = header.getBoundingClientRect();
        const dpr = Math.min(devicePixelRatio || 1, 1.5);
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
        }
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, w, h);
        if (material > 0 && light > 1e-3) {
          const radius = Math.min(g.radius, h / 2, w / 2), perimeter = 2 * (w + h - 4 * radius) + 2 * Math.PI * radius;
          for (let t = 0; t < perimeter; t += 2) {
            let d = t, px, py, nx = 0, ny = -1;
            const lengths = [
              w - 2 * radius,
              Math.PI * radius / 2,
              h - 2 * radius,
              Math.PI * radius / 2,
              w - 2 * radius,
              Math.PI * radius / 2,
              h - 2 * radius,
              Math.PI * radius / 2
            ];
            let edge = 0;
            while (edge < 7 && d > lengths[edge]) d -= lengths[edge++];
            if (edge === 0) {
              px = radius + d;
              py = 0;
            } else if (edge === 2) {
              px = w;
              py = radius + d;
              nx = 1;
              ny = 0;
            } else if (edge === 4) {
              px = w - radius - d;
              py = h;
              nx = 0;
              ny = 1;
            } else if (edge === 6) {
              px = 0;
              py = h - radius - d;
              nx = -1;
              ny = 0;
            } else {
              const corner = (edge - 1) / 2, angle = -Math.PI / 2 + corner * Math.PI / 2 + (radius ? d / radius : 0);
              nx = Math.cos(angle);
              ny = Math.sin(angle);
              px = (corner < 2 ? w - radius : radius) + radius * nx;
              py = (corner === 0 || corner === 3 ? radius : h - radius) + radius * ny;
            }
            const dx = x - px, dy = y - py, distance = Math.hypot(dx, dy);
            const orientation = 0.3 + 0.7 * Math.abs((dx * nx + dy * ny) / Math.max(distance, 1));
            const power = Math.exp(-distance * distance / (2 * 115 * 115)) * orientation * light * material * (1 + press * 0.18);
            if (power < 2e-3) continue;
            const deformation = press * g.touch * power * 0.3;
            context.fillStyle = `rgba(255,255,255,${power * g.edge})`;
            context.beginPath();
            context.arc(
              px - nx * (0.9 + deformation),
              py - ny * (0.9 + deformation),
              0.85,
              0,
              Math.PI * 2
            );
            context.fill();
            const hue = 180 + 110 * Math.sin((dx * -ny + dy * nx) / 48);
            context.fillStyle = `hsla(${hue},95%,75%,${power * g.prism})`;
            context.beginPath();
            context.arc(
              px - nx * (2.8 + deformation),
              py - ny * (2.8 + deformation),
              1.35,
              0,
              Math.PI * 2
            );
            context.fill();
          }
        }
      }
      if (Math.abs(x - targetX) + Math.abs(y - targetY) + Math.abs(lv) + Math.abs(pv) > 0.02 || Math.abs(light - (active && motion() ? 1 : 0)) > 2e-3)
        schedule();
    }
    function schedule() {
      if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
    }
    function scroll() {
      material = g.enabled ? smooth((scrollY - g.start) / (g.end - g.start)) : 0;
      header?.style.setProperty("--liquid", String(material));
      schedule();
    }
    function reset() {
      active = false;
      pressed = false;
      schedule();
    }
    function pointer(event) {
      if (!header || !motion()) return;
      const r = header.getBoundingClientRect();
      targetX = event.clientX - r.left;
      targetY = event.clientY - r.top;
      const distance = Math.hypot(
        Math.max(0, -targetX, targetX - r.width),
        Math.max(0, -targetY, targetY - r.height)
      );
      active = distance < 170;
      if (last === 0) {
        x = targetX;
        y = targetY;
      }
      schedule();
    }
    document.addEventListener("pointermove", pointer, {
      ...options,
      passive: true
    });
    header?.addEventListener(
      "pointerdown",
      (e) => {
        pointer(e);
        pressed = true;
        schedule();
      },
      options
    );
    window.addEventListener(
      "pointerup",
      () => {
        pressed = false;
        schedule();
      },
      options
    );
    window.addEventListener("pointercancel", reset, options);
    window.addEventListener("blur", reset, options);
    document.addEventListener("pointerleave", reset, options);
    document.addEventListener(
      "visibilitychange",
      () => {
        reset();
        if (document.hidden) {
          cancelAnimationFrame(frame);
          frame = 0;
          last = 0;
        } else scroll();
      },
      options
    );
    window.addEventListener("scroll", scroll, { ...options, passive: true });
    window.addEventListener("pageshow", scroll, options);
    reduced.addEventListener("change", reset, options);
    const observer = new ResizeObserver(() => schedule());
    if (header) observer.observe(header);
    const menu = document.querySelector(".pg-menu");
    const nav = document.querySelector(".pg-nav");
    const closeMenu = () => {
      nav?.classList.remove("open");
      nav?.classList.remove("is-open");
      menu?.setAttribute("aria-expanded", "false");
    };
    menu?.addEventListener(
      "click",
      () => {
        const open = nav?.classList.toggle("open");
        nav?.classList.toggle("is-open", !!open);
        menu.setAttribute("aria-expanded", String(!!open));
      },
      options
    );
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape") {
          closeMenu();
          menu?.focus();
        }
      },
      options
    );
    document.addEventListener(
      "click",
      (e) => {
        const target = e.target;
        const section = target.closest("[data-section]");
        if (config.editing && config.bridge) {
          e.preventDefault();
          if (section)
            parent.postMessage(
              { type: "playground-select", channel: config.channel, id: section.dataset.section },
              "*"
            );
          return;
        }
        const link = target.closest("a");
        if (link) {
          closeMenu();
          const href = link.getAttribute("href") || "";
          if (config.bridge && href.startsWith("#")) {
            e.preventDefault();
            document.getElementById(href.slice(1) || "page-main")?.scrollIntoView({
              behavior: motion() ? "smooth" : "instant",
              block: "start"
            });
          }
          if (config.bridge && !href.startsWith("#")) {
            e.preventDefault();
            parent.postMessage(
              { type: "playground-link", channel: config.channel, href: link.getAttribute("href") },
              "*"
            );
          }
        }
      },
      options
    );
    document.body.dataset.editing = String(config.editing);
    document.body.dataset.reduced = String(g.reducedMotion);
    document.querySelectorAll("[data-section]").forEach(
      (s) => s.classList.toggle(
        "pg-selected",
        s.getAttribute("data-section") === config.selected && config.editing
      )
    );
    scroll();
    dispose = () => {
      disposeGlass();
      abort.abort();
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }
  mount();
  if (initial.bridge) {
    window.addEventListener("message", (e) => {
      if (e.source !== parent || !e.data || typeof e.data !== "object") return;
      if (e.data.channel !== initial.channel) return;
      if (e.data.type === "playground-selection" && typeof e.data.selected === "string") {
        config.selected = e.data.selected;
        document.querySelectorAll("[data-section]").forEach((s) => s.classList.toggle("pg-selected", config.editing && s.getAttribute("data-section") === config.selected));
        return;
      }
      if (e.data.type === "playground-update" && typeof e.data.html === "string" && typeof e.data.css === "string") {
        if (!e.data.config || e.data.config.channel !== initial.channel || !Number.isSafeInteger(e.data.config.revision) || e.data.config.revision <= (config.revision || 0)) return;
        window.dispatchEvent(new Event("playground-before-update"));
        const y = scrollY;
        const oldHeader = document.querySelector(".pg-header");
        const template = document.createElement("template");
        template.innerHTML = e.data.html;
        const nextHeader = template.content.querySelector(".pg-header");
        const glassChanged = JSON.stringify(config.glass) !== JSON.stringify(e.data.config.glass) || config.originalGlass !== e.data.config.originalGlass;
        const headerMarkup = nextHeader?.outerHTML || "";
        const headerChanged = headerMarkup !== headerSource;
        if (glassChanged || headerChanged) dispose();
        const pageStyle = document.getElementById("page-style");
        if (pageStyle.textContent !== e.data.css) pageStyle.textContent = e.data.css;
        const pageRoot = document.getElementById("page-root");
        const incoming = document.createElement("div");
        incoming.id = "page-root";
        incoming.append(template.content);
        patch(pageRoot, incoming);
        if (headerChanged && oldHeader?.isConnected && nextHeader) oldHeader.replaceWith(nextHeader.cloneNode(true));
        headerSource = headerMarkup;
        config = e.data.config;
        if (glassChanged || headerChanged) mount();
        document.body.dataset.editing = String(config.editing);
        document.body.dataset.reduced = String(config.glass.reducedMotion);
        window.scrollTo(0, y);
      }
      if (e.data.type === "playground-focus" && typeof e.data.id === "string")
        document.getElementById(e.data.id)?.scrollIntoView({ behavior: "instant", block: "start" });
    });
    parent.postMessage({ type: "playground-ready", channel: initial.channel }, "*");
  }
})({"glass":{"presetId":"eidos-edge-light-v5","enabled":true,"frost":1.2,"edge":0.72,"prism":0.32,"touch":4.3,"radius":29,"response":28,"solid":"#172632","start":4,"end":72,"reducedMotion":false},"editing":false,"selected":"","bridge":false,"originalGlass":true});