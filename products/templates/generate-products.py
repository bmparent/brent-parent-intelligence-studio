"""Regenerate only the four original source and WordPress editions. No dependencies.
Run from repository root: python products/templates/generate-products.py
Catalog, builder pilots, and evidence are deliberately not modified by this script.
"""
from pathlib import Path
import json
import html
import xml.sax.saxutils as xml

ROOT = Path(__file__).resolve().parent
FAMILIES = {
    'switchboard': {'name': 'Switchboard', 'tag': 'A clear next step.', 'business': 'Switchboard Services', 'links': [('index.html','Home'),('services.html','Services'),('service-detail.html','Service detail'),('process.html','Our process'),('contact.html','Contact')], 'color': '#14302b', 'paper':'#f6f6ee', 'accent':'#d8f35f', 'font':'system-ui, -apple-system, "Segoe UI", sans-serif', 'hero':'Good work starts with\na clear conversation.', 'intro':'Practical help for the places you live and work. Tell us what needs attention. We will help you understand the next step.', 'image':'service-plan.svg', 'cta':'Explore services', 'target':'services.html'},
    'tideglass': {'name': 'Tideglass', 'tag': 'Make room for quiet.', 'business':'Tideglass House', 'links':[('index.html','Home'),('stays.html','Stays'),('stay-detail.html','The house'),('guide.html','Local guide'),('contact.html','Plan your stay')], 'color':'#182f38','paper':'#eff3ed','accent':'#d3b27f','font':'Georgia, "Times New Roman", serif','hero':'A little closer\nto the horizon.', 'intro':'Slow mornings. Long walks. A place to spend time well. Explore a sample coastal retreat designed around the rhythm of the day.', 'image':'coast.svg','cta':'Find your place','target':'stays.html'},
    'matter': {'name':'Matter','tag':'Objects, thoughtfully made.','business':'Matter Studio','links':[('index.html','Home'),('collection.html','Collection'),('object.html','Object detail'),('process.html','Our process'),('contact.html','Contact')], 'color':'#34261f','paper':'#f0e8dc','accent':'#a4472b','font':'Georgia, "Times New Roman", serif','hero':'Made slowly.\nHeld onto.', 'intro':'Useful objects with a visible hand. An independent studio exploring clay, timber, and the texture of everyday life.', 'image':'vessel.svg','cta':'Explore the collection','target':'collection.html'},
    'nightjar': {'name':'Nightjar','tag':'Come for the unexpected.','business':'Nightjar Assembly','links':[('index.html','Home'),('program.html','Program'),('event.html','Event detail'),('about.html','About'),('contact.html','Contact')], 'color':'#201e39','paper':'#fff5d8','accent':'#ff7553','font':'"Arial Black", "Segoe UI", sans-serif','hero':'A gathering\nof good noise.', 'intro':'Music, moving images, and conversations after dark. An independent cultural program built for curious people.', 'image':'poster.svg','cta':'Explore the program','target':'program.html'}
}

BASE_CSS = '''/* Original Eidos Works source. See LICENSE.txt. No remote fonts or assets. */
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--body-font,system-ui,-apple-system,"Segoe UI",sans-serif);line-height:1.6}a{color:inherit;text-underline-offset:.25em}button,input,textarea,select{font:inherit}button{cursor:pointer}img{display:block;max-width:100%;height:auto}a,button,input,textarea,select{touch-action:manipulation}button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid var(--focus,#1473e6);outline-offset:5px}button{min-height:44px}p{max-width:65ch}h1,h2,h3{font-family:var(--heading-font);font-weight:500;letter-spacing:-.045em;line-height:1.06;margin:0 0 .6em}h1{font-size:clamp(3.3rem,7.5vw,7.7rem)}h2{font-size:clamp(2rem,4.7vw,4rem)}h3{font-size:clamp(1.4rem,2.7vw,2.1rem)}.eyebrow{font:650 .75rem/1.4 system-ui,sans-serif;text-transform:uppercase;letter-spacing:.14em;margin:0 0 1.3rem}.skip-link{position:absolute;left:1rem;top:-8rem;z-index:20;padding:.75rem;background:var(--accent);color:var(--ink)}.skip-link:focus{top:1rem}.site-header{max-width:1440px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:2rem;padding:1.6rem 4vw;border-bottom:1px solid var(--line)}.wordmark{font:750 1.25rem/1.1 system-ui,sans-serif;text-decoration:none;letter-spacing:-.04em;display:flex;gap:.6rem;align-items:center}.mark{width:1.3rem;height:1.3rem;border:3px solid currentColor;transform:rotate(-8deg)}.site-nav{display:flex;gap:1.6rem;align-items:center;flex-wrap:wrap}.site-nav a{font-size:.83rem;text-decoration:none;padding:.5rem 0;border-bottom:2px solid transparent}.site-nav a[aria-current=page]{border-color:var(--ink)}.nav-toggle{display:none;border:1px solid var(--line);background:transparent;padding:.5rem 1rem}.shell{max-width:1440px;margin:auto;padding:5rem 4vw}.hero{display:grid;grid-template-columns:1.08fr 1fr;align-items:center;gap:5vw;min-height:650px}.hero p.lede{font-size:1.1rem}.hero-image{width:100%;aspect-ratio:1/1.1;object-fit:cover}.hero-actions{display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-top:2rem}.button,.wp-element-button{display:inline-flex;align-items:center;justify-content:center;gap:1rem;background:var(--ink);color:var(--paper);padding:.9rem 1.3rem;border:1px solid var(--ink);text-decoration:none;border-radius:0;min-height:48px;font:600 .87rem/1.3 system-ui,sans-serif}.button.secondary{background:transparent;color:var(--ink);border-color:var(--line)}.text-link{font:600 .9rem system-ui,sans-serif}.section-head{display:flex;justify-content:space-between;align-items:end;gap:2rem;margin-bottom:2.5rem}.section-head p{max-width:33rem}.section-divider{border-top:1px solid var(--line)}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.5rem}.grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.card{padding:2rem;border:1px solid var(--line)}.card img{width:100%;aspect-ratio:1.3;object-fit:cover;margin-bottom:1.6rem}.number{font:500 .8rem system-ui,sans-serif;display:block;margin-bottom:3rem}.card h3{margin-bottom:.65rem}.card p{font-size:.95rem}.split{display:grid;grid-template-columns:1fr 1fr;gap:6vw;align-items:start}.detail-list{margin:0;padding:0;list-style:none}.detail-list li{border-top:1px solid var(--line);padding:1.2rem 0}.detail-list strong{display:block;font:650 .8rem system-ui,sans-serif;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem}.callout{background:var(--ink);color:var(--paper);padding:4rem;display:flex;align-items:center;justify-content:space-between;gap:3rem}.callout .button{background:var(--accent);color:var(--ink);border-color:var(--accent)}.callout h2{max-width:14ch;margin-bottom:0}.callout p{max-width:40ch}.site-footer{border-top:1px solid var(--line);max-width:1440px;margin:auto;padding:3rem 4vw;display:grid;grid-template-columns:1fr 1fr;gap:2rem;font-size:.85rem}.site-footer p{margin:.3rem 0}.site-footer .footer-links{display:flex;gap:1.25rem;flex-wrap:wrap;justify-content:flex-end}.demo-note{font:400 .73rem/1.5 system-ui,sans-serif;opacity:.8;max-width:60ch}.flow{display:grid;gap:1.5rem}.flow>div{display:grid;grid-template-columns:3rem 1fr;gap:1rem;border-top:1px solid var(--line);padding-top:1.5rem}.flow h3{font-size:1.45rem}.flow p{margin:.4rem 0}.contact-card{padding:2.5rem;background:var(--panel);border:1px solid var(--line)}.contact-card .email{font-size:clamp(1.1rem,3vw,1.6rem);overflow-wrap:anywhere}.inquiry-form{display:grid;gap:1rem;margin-top:2rem}.inquiry-form label{display:grid;gap:.4rem;font-size:.85rem}.inquiry-form input,.inquiry-form textarea,.inquiry-form select{width:100%;border:1px solid var(--line);background:var(--paper);color:var(--ink);padding:.75rem;min-height:48px}.inquiry-form textarea{min-height:140px;resize:vertical}.form-status{font-size:.85rem}.screen-reader-text,.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}details{border-top:1px solid var(--line);padding:1.2rem 0}summary{font-weight:600;cursor:pointer;min-height:44px}.legal{max-width:65rem}.legal h2{font-size:2rem;margin-top:2rem}.legal h1{font-size:3rem}[hidden]{display:none!important}.enhancement{display:none}.js-ready .enhancement{display:flex}.no-js-note{font-size:.8rem;padding:.8rem;border:1px solid var(--line)}.js-ready .no-js-note{display:none}.wide-art{width:100%;aspect-ratio:2.1;object-fit:cover}.page-intro{max-width:60rem}.page-intro h1{font-size:clamp(3rem,6.8vw,6.5rem)}.page-intro p{font-size:1.1rem}.badge{display:inline-block;padding:.35rem .6rem;border:1px solid var(--line);font:600 .7rem system-ui,sans-serif;text-transform:uppercase;letter-spacing:.05em}.caption{font-size:.8rem;margin-top:.8rem}.visually-muted{opacity:.75}@media(max-width:900px){.site-header{align-items:start}.site-nav{gap:.75rem 1.2rem;justify-content:flex-end;max-width:65%}.hero{min-height:0;gap:3rem}.shell{padding:3.5rem 5vw}.grid{grid-template-columns:1fr 1fr}.callout{padding:2.5rem}.hero h1{font-size:clamp(3rem,7vw,5.5rem)}}@media(max-width:640px){.site-header{padding:1.2rem 5vw;flex-wrap:wrap;gap:1rem}.site-nav{max-width:none;width:100%;justify-content:flex-start;gap:.25rem 1rem}.js-ready .nav-toggle{display:block}.js-ready .site-nav{display:none}.js-ready .site-nav.is-open{display:flex}.hero,.split,.grid,.grid.two{grid-template-columns:1fr}.hero{gap:2rem}.hero-image{aspect-ratio:1.2}.shell{padding:2.8rem 5vw}.section-head{display:block}.section-head p{margin-bottom:0}.card{padding:1.5rem}.callout{padding:2rem;display:block}.callout .button{margin-top:1rem}.site-footer{grid-template-columns:1fr}.site-footer .footer-links{justify-content:flex-start}h1{font-size:3.2rem}.wide-art{aspect-ratio:1.2}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{animation:none!important;transition:none!important}}
'''

FAMILY_CSS = {
'switchboard': '''body{--ink:#14302b;--paper:#f6f6ee;--accent:#d8f35f;--panel:#e5ece4;--line:#b5c4b7;--heading-font:system-ui,-apple-system,"Segoe UI",sans-serif}.hero h1{font-weight:650;letter-spacing:-.065em}.hero-image{background:var(--panel);border-radius:0 7rem 0 0}.wordmark .mark{border-color:var(--ink);border-right-color:var(--accent);transform:none}.service-picker{display:flex;flex-wrap:wrap;gap:.6rem;margin:1.6rem 0 2rem}.service-picker button{padding:.8rem 1.15rem;border:1px solid var(--ink);background:transparent;color:var(--ink);border-radius:5rem;font-size:.9rem}.service-picker button[aria-pressed=true]{background:var(--accent)}.service-card{border-top:5px solid var(--ink)}.service-card .number{color:var(--ink)}.service-card[aria-live]{min-height:15rem}.contact-strip{background:var(--accent);padding:1rem 4vw;font:600 .8rem system-ui,sans-serif;text-align:center}.switchboard-detail{background:var(--panel)}.problem-results{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem}@media(max-width:640px){.problem-results{grid-template-columns:1fr}.hero-image{border-radius:0 4rem 0 0}}''',
'tideglass': '''body{--ink:#182f38;--paper:#eff3ed;--accent:#d3b27f;--panel:#e0e9e5;--line:#afc2c2;--heading-font:Georgia,"Times New Roman",serif;--body-font:system-ui,-apple-system,"Segoe UI",sans-serif}.wordmark{font-family:Georgia,serif;font-size:1.65rem;font-weight:400}.mark{border-radius:50%;border-width:1px;position:relative}.mark:after{content:"";position:absolute;left:-.3rem;right:-.3rem;top:.5rem;border-top:1px solid}.tideglass .hero{position:relative;display:block;min-height:740px;color:#fff;isolation:isolate;padding-top:7rem;padding-bottom:7rem}.tideglass .hero:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,32,43,.8),rgba(11,32,43,.1));z-index:-1}.tideglass .hero-copy{max-width:650px}.tideglass .hero h1{font-size:clamp(3.8rem,8vw,8rem);letter-spacing:-.04em}.tideglass .hero-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2;aspect-ratio:auto}.tideglass .hero .button{background:#eff3ed;color:#182f38;border-color:#eff3ed}.tideglass .hero .text-link{color:white}.time-control{gap:.4rem;flex-wrap:wrap;padding:.5rem;background:rgba(17,40,46,.75);backdrop-filter:blur(10px);width:fit-content;margin-top:3rem;border:1px solid rgba(255,255,255,.45)}.time-control button{background:transparent;border:0;color:white;padding:.6rem 1rem;font:500 .8rem system-ui,sans-serif}.time-control button[aria-pressed=true]{background:#eff3ed;color:#182f38}.scene-caption{font-size:.8rem;max-width:48ch}.tideglass .card{padding:0 0 2rem;border-width:0 0 1px}.tideglass .card h3,.tideglass .card p,.tideglass .card .text-link{margin-left:0}.tideglass .card img{aspect-ratio:1.2}.tideglass .grid{gap:2rem}.tideglass .callout{background:#dce6e1;color:var(--ink)}.tideglass .callout .button{background:var(--ink);color:var(--paper)}.quiet-note{border-left:1px solid var(--ink);padding-left:2rem;font-family:Georgia,serif;font-size:1.5rem}.tideglass .page-intro{padding-top:1rem}.tideglass .hero[data-time=morning] .hero-image{filter:saturate(.8) brightness(1.06)}.tideglass .hero[data-time=evening] .hero-image{filter:sepia(.35) saturate(1.15) brightness(.78)}@media(max-width:640px){.tideglass .hero{min-height:690px;padding-top:4rem}.tideglass .hero h1{font-size:3.6rem}.time-control{margin-top:2rem}.time-control button{padding:.5rem .8rem}}''',
'matter': '''body{--ink:#34261f;--paper:#f0e8dc;--accent:#a4472b;--panel:#e5d7c6;--line:#bfb09a;--heading-font:Georgia,"Times New Roman",serif;--body-font:system-ui,-apple-system,"Segoe UI",sans-serif}.wordmark{font-family:Georgia,serif;font-size:2rem;font-weight:400}.matter .mark{display:none}.matter .site-header{border:0}.matter .hero{grid-template-columns:.85fr 1.15fr;align-items:start;padding-top:2rem}.matter .hero-copy{padding-top:4rem}.matter h1{font-size:clamp(4.1rem,8vw,8.7rem)}.matter .hero-image{aspect-ratio:.9;object-fit:cover}.matter .hero p.lede{max-width:35ch}.matter .button{background:var(--accent);border-color:var(--accent);color:#fff}.matter .grid{gap:3rem}.matter .card{padding:0;border:0}.matter .card:nth-child(even){padding-top:5rem}.matter .card img{aspect-ratio:.85}.material-control{gap:.5rem;margin:2rem 0;flex-wrap:wrap}.material-control button{padding:.7rem 1rem;border:1px solid var(--line);background:transparent;color:var(--ink)}.material-control button[aria-pressed=true]{border-color:var(--accent);background:var(--accent);color:#fff}.material-stage{position:relative;overflow:hidden;background:#ded0ba}.material-stage img{width:100%;aspect-ratio:1.05;object-fit:cover;transform-origin:var(--lens-x,50%) var(--lens-y,50%);transition:transform .25s}.material-stage.is-close img{transform:scale(1.65)}.lens-toggle{position:absolute;bottom:1rem;right:1rem;z-index:1;border:1px solid var(--ink);background:var(--paper);color:var(--ink);padding:.6rem 1rem;min-height:44px}.material-notes{border-top:1px solid var(--line);padding-top:1.2rem}.matter .callout{background:var(--panel);color:var(--ink)}.matter .callout .button{background:var(--accent);color:#fff}.matter .collection-grid{grid-template-columns:1.25fr .75fr}.object-facts{font-size:.9rem}.object-facts div{display:flex;justify-content:space-between;gap:1rem;padding:.9rem 0;border-bottom:1px solid var(--line)}.object-facts dt{font-weight:600}.object-facts dd{margin:0;text-align:right}@media(max-width:640px){.matter .hero,.matter .collection-grid{grid-template-columns:1fr}.matter .hero-copy{padding-top:0}.matter .card:nth-child(even){padding-top:0}.matter h1{font-size:4rem}}''',
'nightjar': '''body{--ink:#201e39;--paper:#fff5d8;--accent:#ff7553;--panel:#e5d6f4;--line:#b7a2ad;--heading-font:"Arial Black","Segoe UI",sans-serif;--body-font:system-ui,-apple-system,"Segoe UI",sans-serif}.nightjar .site-header{background:var(--ink);color:var(--paper);border:0;max-width:none}.nightjar .wordmark{font-size:1.5rem;text-transform:uppercase;font-weight:900}.nightjar .mark{border-radius:50%;border-right-color:var(--accent);transform:rotate(30deg)}.nightjar h1,.nightjar h2{font-weight:900;line-height:.98;letter-spacing:-.065em}.nightjar .hero{grid-template-columns:1.1fr 1fr;padding-top:4rem;background:var(--accent);max-width:none}.nightjar .hero h1{font-size:clamp(4.2rem,8.5vw,9rem);text-transform:uppercase}.nightjar .hero .eyebrow{display:inline-block;border:1px solid var(--ink);padding:.4rem .6rem}.nightjar .hero-image{aspect-ratio:1;transform:rotate(4deg);box-shadow:-12px 15px 0 var(--ink)}.nightjar .button{border-radius:5rem}.nightjar .card{background:var(--panel);border:0;padding:1.5rem}.nightjar .card:nth-child(2){background:#cbdc79}.nightjar .card:nth-child(3){background:#ffb9a1}.nightjar .card img{aspect-ratio:1.05}.program-control{gap:.6rem;flex-wrap:wrap;margin:1.6rem 0 2rem}.program-control button,.theme-toggle{padding:.65rem 1rem;border:1px solid var(--ink);background:transparent;color:var(--ink);border-radius:3rem;font:600 .8rem system-ui,sans-serif}.program-control button[aria-pressed=true]{background:var(--ink);color:var(--paper)}.nightjar .site-header .theme-toggle{color:var(--paper);border-color:var(--paper)}.program-poster{position:relative;isolation:isolate;overflow:hidden}.program-poster:before{content:"";position:absolute;width:11rem;height:11rem;border:1px solid currentColor;border-radius:50%;right:-4rem;top:2rem;z-index:-1}.program-poster .number{margin-bottom:2rem}.nightjar[data-theme=night]{--paper:#201e39;--ink:#fff5d8;--panel:#3e355b;--line:#776980;--accent:#674bad}.nightjar[data-theme=night] .hero{background:#674bad}.nightjar[data-theme=night] .card:nth-child(2){background:#3f563b}.nightjar[data-theme=night] .card:nth-child(3){background:#6b3c50}.nightjar .callout{background:#cbdc79;color:#201e39}.nightjar .callout .button{background:#201e39;color:#fff5d8;border-color:#201e39}.event-facts{display:flex;gap:1rem;flex-wrap:wrap;margin:2rem 0}.event-facts span{padding:.5rem .8rem;border:1px solid var(--line)}@media(max-width:640px){.nightjar .hero{grid-template-columns:1fr;overflow:hidden;padding-bottom:4rem}.nightjar .hero h1{font-size:4.1rem}.nightjar .hero-image{max-width:90%;margin:auto}.nightjar .site-header .theme-toggle{font-size:.7rem;padding:.5rem .65rem}}'''
}

SVG = {
'service-plan.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" role="img" aria-labelledby="title desc"><title id="title">A clear plan for good work</title><desc id="desc">Original geometric drawing of a house with planning lines, a sun, and a highlighted next step.</desc><rect width="800" height="900" fill="#dce9e2"/><g stroke="#b4c7b9" stroke-width="1"><path d="M0 150H800M0 300H800M0 450H800M0 600H800M0 750H800M150 0V900M300 0V900M450 0V900M600 0V900M750 0V900"/></g><circle cx="610" cy="180" r="80" fill="#d8f35f"/><path d="M135 470L400 245L665 470V750H135Z" fill="#f6f6ee" stroke="#14302b" stroke-width="7"/><path d="M110 480L400 230L690 480M250 750V490H400V750M475 510H580V620H475Z" fill="none" stroke="#14302b" stroke-width="7"/><path d="M400 245V190M135 750V810M665 750V810M135 790H665" fill="none" stroke="#14302b" stroke-width="2" stroke-dasharray="8 9"/><rect x="370" y="685" width="325" height="90" fill="#14302b"/><circle cx="415" cy="730" r="16" fill="#d8f35f"/><path d="M405 730L412 737L425 722" stroke="#14302b" stroke-width="4" fill="none"/><text x="450" y="738" font-family="Arial,sans-serif" font-size="24" fill="#f6f6ee">A useful next step</text></svg>''',
'coast.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1100" role="img" aria-labelledby="title desc"><title id="title">The quiet edge of the coast</title><desc id="desc">Original vector landscape of a reflective bay, layered coastal hills, warm sky, and a small retreat house.</desc><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#a1b8bc"/><stop offset="1" stop-color="#efdbb6"/></linearGradient><linearGradient id="water" x2="0" y2="1"><stop stop-color="#adcbc8"/><stop offset="1" stop-color="#2e6873"/></linearGradient></defs><rect width="1600" height="1100" fill="url(#sky)"/><circle cx="1110" cy="355" r="110" fill="#f1dfb8"/><path d="M0 620Q220 300 490 495T1000 445T1600 415V1100H0" fill="#829c98"/><path d="M0 710Q360 390 650 650T1250 530T1600 560V1100H0" fill="#486c6a"/><path d="M0 760Q420 660 770 740T1600 730V1100H0" fill="url(#water)"/><g fill="none" stroke="#d4e2d4" opacity=".45"><path d="M900 810H1350M780 850H1450M900 900H1300M750 965H1450"/></g><path d="M0 840Q300 740 460 860T950 1100H0" fill="#294d50"/><path d="M240 820V730L350 665L460 730V820Z" fill="#d6c6a7"/><path d="M220 735L350 645L480 735" stroke="#233f43" stroke-width="20" fill="none"/><path d="M315 820V750H380V820" fill="#35585a"/><path d="M0 860Q180 775 285 865T650 1100H0" fill="#203f43"/><g stroke="#60837b" stroke-width="4"><path d="M90 820V650M90 680L35 750M90 700L150 775M155 810V690M155 720L120 765M155 750L185 795"/></g></svg>''',
'vessel.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1100" role="img" aria-labelledby="title desc"><title id="title">Clay vessel study</title><desc id="desc">Original vector still life of a terracotta vessel with softly layered surface lines on a warm studio plinth.</desc><defs><linearGradient id="wall" x2="1" y2="1"><stop stop-color="#e9d7c0"/><stop offset="1" stop-color="#c4a88c"/></linearGradient><linearGradient id="clay"><stop stop-color="#a25639"/><stop offset=".5" stop-color="#c77a55"/><stop offset="1" stop-color="#8d452c"/></linearGradient></defs><rect width="900" height="1100" fill="url(#wall)"/><path d="M0 800L900 675V1100H0" fill="#e7d7bc"/><ellipse cx="475" cy="878" rx="255" ry="55" fill="#9b7962" opacity=".3"/><path d="M340 275Q290 290 320 380L245 710Q205 860 460 875Q715 860 675 710L600 380Q630 290 580 275Z" fill="url(#clay)"/><ellipse cx="460" cy="280" rx="120" ry="34" fill="#7b3926"/><ellipse cx="460" cy="277" rx="103" ry="22" fill="#4a3025"/><g fill="none" stroke="#d49a77" stroke-width="2" opacity=".45"><path d="M310 430Q460 480 610 430M300 470Q460 520 620 470M290 510Q460 560 630 510M280 550Q460 600 640 550M270 590Q460 640 650 590M260 630Q460 680 660 630M250 670Q460 720 670 670M242 710Q460 760 678 710M240 750Q460 800 680 750M250 790Q460 840 670 790"/></g><path d="M150 240V870M130 870H180M130 240H180" fill="none" stroke="#6e5745" stroke-width="1"/><text transform="translate(110 600) rotate(-90)" font-family="Arial,sans-serif" font-size="18" fill="#6e5745" letter-spacing="3">SURFACE / FORM / USE</text></svg>''',
'timber.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1100" role="img" aria-labelledby="title desc"><title id="title">Timber stool study</title><desc id="desc">Original vector drawing of an oak stool with visible grain and a shaped seat.</desc><rect width="900" height="1100" fill="#d6d0bc"/><path d="M0 820L900 690V1100H0" fill="#eee6d2"/><ellipse cx="470" cy="900" rx="250" ry="50" fill="#8d8061" opacity=".2"/><path d="M310 470L265 900H335L390 470M570 460L635 880H705L650 460" fill="#94744b"/><path d="M350 520L480 900H550L425 520" fill="#b38c57"/><ellipse cx="465" cy="450" rx="270" ry="100" fill="#a07c4c"/><ellipse cx="465" cy="425" rx="270" ry="90" fill="#c5a36e"/><g fill="none" stroke="#9a774d" stroke-width="2"><ellipse cx="465" cy="425" rx="220" ry="65"/><ellipse cx="465" cy="425" rx="170" ry="43"/><ellipse cx="465" cy="425" rx="110" ry="25"/><path d="M300 620L290 850M320 590L309 840M651 570L683 830M400 630L480 860"/></g></svg>''',
'poster.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1000" role="img" aria-labelledby="title desc"><title id="title">Nightjar assembly poster</title><desc id="desc">Original geometric music and culture poster with circles, orbit lines and a large abstract bird.</desc><rect width="900" height="1000" fill="#201e39"/><circle cx="450" cy="430" r="310" fill="#cbdc79"/><circle cx="450" cy="430" r="220" fill="#ff7553"/><circle cx="450" cy="430" r="130" fill="#201e39"/><path d="M100 440Q390 190 750 520Q560 470 450 760Q320 550 100 440" fill="#bda3e1"/><circle cx="530" cy="465" r="13" fill="#201e39"/><path d="M570 495L690 520L570 545" fill="#fff5d8"/><g fill="none" stroke="#fff5d8" stroke-width="2"><ellipse cx="450" cy="430" rx="400" ry="95" transform="rotate(-35 450 430)"/><path d="M80 850H820"/></g><text x="75" y="95" font-family="Arial Black,Arial,sans-serif" font-size="53" font-weight="900" letter-spacing="-2" fill="#fff5d8">NIGHTJAR / ASSEMBLY</text><text x="80" y="925" font-family="Arial,sans-serif" font-size="35" fill="#fff5d8">SOUND. FILM. IDEAS.</text></svg>'''
}

JS = r'''/* Progressive enhancement only. Static content and navigation work without this file. */
(() => {
  'use strict';
  const config = window.SITE_CONFIG || {};
  const page = document.body.dataset.page;
  const text = (selector, value) => { if (typeof value === 'string') document.querySelectorAll(selector).forEach(el => { el.textContent = value; }); };
  const safeHref = value => typeof value === 'string' && /^(https?:\/\/|mailto:|tel:|[a-zA-Z0-9_./#?-])/i.test(value) && !/^(javascript:|data:|vbscript:)/i.test(value);
  if (config.brand) text('[data-brand]', config.brand);
  if (config.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) document.querySelectorAll('[data-email]').forEach(a => { a.textContent = config.email; a.href = 'mailto:' + config.email; });
  if (config.phone && /^[+\d() .-]{6,30}$/.test(config.phone)) document.querySelectorAll('[data-phone]').forEach(a => { a.textContent = config.phone; a.href = 'tel:' + config.phone.replace(/[^+\d]/g, ''); });
  for (const [key, value] of Object.entries(config.colors || {})) if (['ink','paper','accent','panel','line'].includes(key) && /^#[0-9a-f]{3,8}$/i.test(value)) document.body.style.setProperty('--' + key, value);
  if (config.fonts?.heading) document.body.style.setProperty('--heading-font', config.fonts.heading);
  if (config.fonts?.body) document.body.style.setProperty('--body-font', config.fonts.body);
  const content = config.pages?.[page];
  if (content) {
    text('[data-hero-title]', content.title); text('[data-hero-intro]', content.intro); text('[data-primary-link]', content.ctaLabel);
    if (safeHref(content.ctaHref)) document.querySelectorAll('[data-primary-link]').forEach(a => { a.href = content.ctaHref; });
    if (content.image && safeHref(content.image)) document.querySelectorAll('[data-hero-image]').forEach(img => { img.src = content.image; if (content.imageAlt) img.alt = content.imageAlt; });
  }
  document.documentElement.classList.add('js-ready');
  if (config.motion === false) { document.documentElement.style.scrollBehavior = 'auto'; document.documentElement.classList.add('motion-off'); }
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  toggle?.addEventListener('click', () => { const expanded = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(expanded)); nav?.classList.toggle('is-open', expanded); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { toggle.setAttribute('aria-expanded','false'); nav?.classList.remove('is-open'); toggle.focus(); } });
  const announce = value => text('[data-interaction-status]', value);
  document.querySelectorAll('[data-problem]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-problem]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    document.querySelectorAll('[data-service]').forEach(card => { card.hidden = button.dataset.problem !== 'all' && card.dataset.service !== button.dataset.problem; });
    announce(button.textContent.trim() + ': matching service shown. Follow its link to see the process and contact path.');
  }));
  document.querySelectorAll('[data-time]').forEach(button => { if (button.tagName !== 'BUTTON') return; button.addEventListener('click', () => {
    document.querySelectorAll('button[data-time]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    document.querySelector('.hero')?.setAttribute('data-time', button.dataset.time);
    const captions = { morning:'Morning: quiet light, a slow breakfast, and a walk before the day fills.', day:'Day: explore the coast, find a table outside, or leave the afternoon unplanned.', evening:'Evening: return to warm light and make time for dinner together.' };
    text('[data-scene-caption]', captions[button.dataset.time]); announce(captions[button.dataset.time]);
  }); });
  const materialDescriptions = { clay:'Clay: an unglazed outer surface shows the turning lines. A glazed interior is easier to clean.', timber:'Timber: visible grain and a shaped seat. Use indoors and wipe spills promptly.' };
  document.querySelectorAll('[data-material]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-material]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    const img = document.querySelector('[data-material-image]'); if (img) { img.src = 'assets/' + (button.dataset.material === 'clay' ? 'vessel.svg' : 'timber.svg'); img.alt = button.dataset.material === 'clay' ? 'Original study of a clay vessel, showing its surface lines.' : 'Original study of a timber stool, showing its seat and grain.'; }
    text('[data-material-notes]', materialDescriptions[button.dataset.material]); announce(materialDescriptions[button.dataset.material]);
  }));
  const lens = document.querySelector('[data-lens]');
  lens?.addEventListener('click', () => { const expanded = lens.getAttribute('aria-pressed') !== 'true'; lens.setAttribute('aria-pressed',String(expanded)); lens.textContent = expanded ? 'Show whole object' : 'Inspect surface'; document.querySelector('.material-stage')?.classList.toggle('is-close',expanded); announce(expanded ? 'Close inspection enabled. The object description remains below.' : 'Whole object shown.'); });
  document.querySelector('.material-stage')?.addEventListener('pointermove', event => { if (!document.querySelector('.material-stage')?.classList.contains('is-close')) return; const bounds = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty('--lens-x', ((event.clientX - bounds.left) / bounds.width * 100) + '%'); event.currentTarget.style.setProperty('--lens-y', ((event.clientY - bounds.top) / bounds.height * 100) + '%'); });
  document.querySelectorAll('[data-program]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-program]').forEach(other => other.setAttribute('aria-pressed',String(other === button))); document.querySelectorAll('[data-event]').forEach(card => { card.hidden = button.dataset.program !== 'all' && card.dataset.event !== button.dataset.program; }); announce(button.textContent.trim() + ' program shown. Event links remain available.'); }));
  document.querySelector('[data-theme-toggle]')?.addEventListener('click', event => { const night = document.body.dataset.theme !== 'night'; document.body.dataset.theme = night ? 'night' : 'day'; event.currentTarget.setAttribute('aria-pressed',String(night)); event.currentTarget.textContent = night ? 'Day mode' : 'Night mode'; });
  const interest = new URLSearchParams(window.location.search).get('interest');
  const inquirySelect = document.querySelector('.inquiry-form select');
  if (interest && inquirySelect) {
    const keywords = { improvements:'Space', repair:'Repair', planning:'Project', 'shore-house':'Stay', vessel:'Object', 'listening-room':'Program', film:'Program', conversation:'Program' };
    const option = Array.from(inquirySelect.options).find(item => keywords[interest] && item.textContent.startsWith(keywords[interest]));
    if (option) inquirySelect.value = option.value;
  }
  document.querySelector('.inquiry-form')?.addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
    const data = new FormData(form); const email = config.email || 'hello@example.com';
    const body = ['Name: ' + data.get('name'),'Email: ' + data.get('email'),'Interest: ' + (data.get('interest') || ''),'',data.get('message') || ''].join('\n');
    const link = document.querySelector('[data-prepared-email]'); if (link) { link.href = 'mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent('Website inquiry') + '&body=' + encodeURIComponent(body); link.hidden = false; }
    text('.form-status','Your draft is ready. Open the email draft below, then review and send it in your email app. Nothing has been sent or stored by this website.');
  });
})();
'''

def e(value): return html.escape(str(value), quote=True)
def a(href,label,cls='text-link'): return f'<a class="{cls}" href="{href}">{label} <span aria-hidden="true">↗</span></a>'
def intro(kicker,title,body): return f'<section class="shell page-intro"><p class="eyebrow">{kicker}</p><h1 data-hero-title>{title}</h1><p data-hero-intro>{body}</p></section>'
def callout(title,body,label='Start a conversation'): return f'<section class="shell"><div class="callout"><div><h2>{title}</h2><p>{body}</p></div>{a("contact.html",label,"button")}</div></section>'
def facts(items): return '<ul class="detail-list">'+''.join(f'<li><strong>{key}</strong>{value}</li>' for key,value in items)+'</ul>'
def card(num,title,body,href,label,image=None,attrs=''):
    illustration = f'<img src="assets/{image}" alt="Original {title.lower()} illustration" loading="lazy" width="900" height="1100">' if image else ''
    return f'<article class="card" {attrs}>{illustration}<span class="number">{num}</span><h3>{title}</h3><p>{body}</p>{a(href,label)}</article>'

def service_picker():
    return '''<div class="service-picker enhancement" aria-label="Find a service"><button type="button" data-problem="all" aria-pressed="true">All services</button><button type="button" data-problem="comfort" aria-pressed="false">Improve a space</button><button type="button" data-problem="repair" aria-pressed="false">Fix a problem</button><button type="button" data-problem="planning" aria-pressed="false">Plan a project</button></div><p class="no-js-note">All services are shown below. Each has a direct link to the next step.</p><p class="sr-only" role="status" aria-live="polite" data-interaction-status></p><div class="problem-results">'''+''.join([
    card('01 / Improve','Space improvements','Small changes to layout, storage, and everyday use. Start with your priorities, then agree on a clear scope.','service-detail.html#comfort','See the approach',attrs='class="" data-service="comfort"'),
    card('02 / Repair','Repair & maintenance','Describe what is happening and share any useful photos. An inquiry starts a conversation; it is not a remote diagnosis.','service-detail.html#repair','Discuss a repair',attrs='data-service="repair"'),
    card('03 / Plan','Project planning','Make the brief concrete before work begins. Review access, materials, sequence, and the questions still unanswered.','service-detail.html#planning','Plan the next step',attrs='data-service="planning"')])+'</div>'

def material_explorer(): return '''<section class="shell section-divider"><div class="split"><div><p class="eyebrow">Up close</p><h2>What the surface tells you.</h2><p>Choose a material, then inspect its surface. The details below stay readable while you explore.</p><div class="material-control enhancement" aria-label="Choose material"><button type="button" data-material="clay" aria-pressed="true">Clay</button><button type="button" data-material="timber" aria-pressed="false">Timber</button></div><p class="material-notes" data-material-notes>Clay: an unglazed outer surface shows the turning lines. A glazed interior is easier to clean.</p><p>Timber: visible grain and a shaped seat. Use indoors and wipe spills promptly.</p><p class="caption">Illustrative materials only. Replace these notes with your real specifications and care guidance.</p><p class="sr-only" role="status" aria-live="polite" data-interaction-status></p></div><div class="material-stage"><img data-material-image src="assets/vessel.svg" alt="Original study of a clay vessel, showing its surface lines." width="900" height="1100"><button class="lens-toggle enhancement" type="button" data-lens aria-pressed="false">Inspect surface</button></div></div></section>'''

def program_cards():
    return '<div class="program-control enhancement" aria-label="Explore the program"><button type="button" data-program="all" aria-pressed="true">Everything</button><button type="button" data-program="sound" aria-pressed="false">Sound</button><button type="button" data-program="film" aria-pressed="false">Film</button><button type="button" data-program="ideas" aria-pressed="false">Ideas</button></div><p class="sr-only" role="status" aria-live="polite" data-interaction-status></p><div class="grid">'+''.join([
        card('SOUND / PROGRAM EXAMPLE','Listening room','A close listening session followed by a conversation about sound, place, and making together.','event.html#sound','Explore the session',attrs='data-event="sound"'),
        card('FILM / PROGRAM EXAMPLE','After the light','A screening format for short films and an open discussion with their makers. Running time and access notes belong here.','event.html#film','Read the film notes',attrs='data-event="film"'),
        card('IDEAS / PROGRAM EXAMPLE','An open table','A small-group conversation about the things a creative community can make possible.','event.html#ideas','Find out more',attrs='data-event="ideas"')])+'</div>'

def homepage(slug,f):
    time = '''<div class="time-control enhancement" aria-label="Explore the time of day"><button type="button" data-time="morning" aria-pressed="true">Morning</button><button type="button" data-time="day" aria-pressed="false">Day</button><button type="button" data-time="evening" aria-pressed="false">Evening</button></div><p class="scene-caption" data-scene-caption>Morning: quiet light, a slow breakfast, and a walk before the day fills.</p><p class="sr-only" role="status" aria-live="polite" data-interaction-status></p>''' if slug=='tideglass' else ''
    hero = f'<section class="shell hero" data-time="morning"><div class="hero-copy"><p class="eyebrow">{f["tag"]}</p><h1 data-hero-title>{f["hero"].replace(chr(10),"<br>")}</h1><p class="lede" data-hero-intro>{f["intro"]}</p><div class="hero-actions"><a class="button" data-primary-link href="{f["target"]}">{f["cta"]} <span aria-hidden="true">↗</span></a>{a("contact.html","Get in touch")}</div>{time}</div><img class="hero-image" data-hero-image src="assets/{f["image"]}" alt="{ {"switchboard":"Original house planning illustration with a highlighted next step.","tideglass":"Original coastal landscape with calm water, layered hills, and a small retreat house.","matter":"Original clay vessel study with visible turning lines.","nightjar":"Original Nightjar poster with layered circles and an abstract bird."}[slug]}" width="{1600 if slug=="tideglass" else 900}" height="1100"></section>'
    if slug=='switchboard': return hero+'<section class="shell section-divider"><div class="section-head"><div><p class="eyebrow">Find a useful starting point</p><h2>What needs attention?</h2></div><p>Choose the closest description. This helps frame an inquiry; it does not generate a diagnosis or a quote.</p></div>'+service_picker()+'</section><section class="shell section-divider"><div class="split"><div><p class="eyebrow">How we work</p><h2>No mystery between hello and handover.</h2><p>A visible process makes it easier to ask a good question and agree on what comes next.</p>'+a('process.html','See the complete process')+'</div><div class="flow"><div><span>01</span><section><h3>Share the situation</h3><p>Tell us what you want to change, where it is, and when you need help.</p></section></div><div><span>02</span><section><h3>Agree on the scope</h3><p>Review what is included, what needs an on-site look, and how work will be scheduled.</p></section></div><div><span>03</span><section><h3>Leave a clear handover</h3><p>Know what was done, how to care for it, and whom to contact with a question.</p></section></div></div></div></section>'+callout('Let’s make the next step clear.','Send a few details about your project. This sample site uses an email inquiry, with no automated quotation.')
    if slug=='tideglass': return hero+'<section class="shell"><div class="section-head"><div><p class="eyebrow">Space for your kind of stay</p><h2>Less itinerary. More time.</h2></div><p>Start with a place to sleep, then choose how much to leave unplanned. This is a fictional retreat used to demonstrate the design.</p></div><div class="grid two">'+card('01 / Stay','The shore house','A quiet base for a few days together, with generous shared space and a view that changes with the light.','stay-detail.html','Explore the house','coast.svg')+card('02 / Experience','The slow afternoon','A flexible experience page for guided walks, hosted meals, or independent exploring. Replace sample offerings with your own.','stays.html#experiences','Explore experiences','coast.svg')+'</div></section><section class="shell section-divider"><div class="split"><div><p class="eyebrow">Around here</p><h2>Follow the local rhythm.</h2><p>A useful guide helps guests plan around daylight, weather, access, and their own pace.</p>'+a('guide.html','Open the local guide')+'</div><p class="quiet-note">A morning outside. A table with room. An evening that does not need filling.</p></div></section>'+callout('Stay a little longer.','Send your dates and questions. Availability and booking terms are confirmed by the property, not by this sample website.','Ask about a stay')
    if slug=='matter': return hero+material_explorer()+'<section class="shell section-divider"><div class="section-head"><div><p class="eyebrow">The collection</p><h2>For the everyday ritual.</h2></div>'+a('collection.html','View all objects')+'</div><div class="grid two collection-grid">'+card('01 / Clay','Turned vessel','A quietly expressive form for a shelf, a stem, or an everyday arrangement.','object.html','View object','vessel.svg')+card('02 / Timber','Low stool','A compact seat with a shaped top and a straightforward structure.','collection.html#timber','Explore timber','timber.svg')+'</div></section>'+callout('A considered question is a good start.','Ask about an object, a finish, or a studio commission. This design includes an inquiry path; it does not include a connected cart.')
    return hero+'<section class="shell"><div class="section-head"><div><p class="eyebrow">Make your own route</p><h2>One program. Many ways in.</h2></div><p>Explore by interest. Every program item has an ordinary link and remains available without JavaScript.</p></div>'+program_cards()+'</section><section class="shell section-divider"><div class="split"><div><p class="eyebrow">Why we gather</p><h2>Good culture leaves room.</h2></div><div><p>Room for an unexpected conversation. For a first-time performer. For the person who came alone. A program should make all of that easier to enter.</p>'+a('about.html','Read about the assembly')+'</div></div></section>'+callout('Bring your curiosity.','This is a sample program, with no scheduled dates or ticket inventory. Add verified ticket destinations before announcing an event.','Talk to the organizers')

def inner_pages(slug,f):
    if slug=='switchboard': return {
        'services.html':intro('Services','Useful help, clearly explained.','Choose a starting point below. Every inquiry is reviewed before scope, timing, and any price are confirmed.')+'<section class="shell section-divider">'+service_picker()+'</section><section class="shell"><div class="split"><div><h2>Not sure where it fits?</h2><p>You do not need technical language to ask for help. Describe what is happening and what a better outcome would look like.</p></div>'+facts([('Before you inquire','Include a location, a short description, and any access or timing constraints.'),('What happens next','The team reviews the inquiry and explains whether a visit or further information is needed.'),('Urgent situations','Replace this note with your genuine emergency policy. This sample site does not provide emergency dispatch.')])+'</div></section>'+callout('Start with what you know.','A few clear details are enough to begin.'),
        'service-detail.html':intro('Service detail','A better space, step by step.','A sample detail page for explaining one service in depth. Describe real capabilities, qualifications, and service boundaries before launch.')+'<section class="shell section-divider"><div class="split"><div><img src="assets/service-plan.svg" alt="Original house planning diagram" width="800" height="900"><p class="caption">Original illustrative planning drawing. It is not a technical specification.</p></div><div><section id="comfort"><p class="eyebrow">01 / Space improvements</p><h2>Make the everyday work better.</h2><p>Begin with the practical friction: a crowded corner, hard-to-reach storage, or a room that no longer fits its use.</p>'+facts([('Typical scope','Layout planning, small installations, and finishing details. Replace with services you actually offer.'),('Before work begins','A written scope, access needs, and agreed schedule. No work is authorized by this demonstration.'),('Your next step','Describe the space and what you want to make easier. Photos can be shared privately after first contact.')])+a('contact.html?interest=improvements','Ask about an improvement','button')+'</section><section id="repair" class="shell"><h3>Repair & maintenance</h3><p>Tell us the visible symptoms and when they started. The team confirms whether the issue is within its scope; this page does not supply diagnostic advice.</p>'+a('contact.html?interest=repair','Discuss a repair')+'</section><section id="planning"><h3>Project planning</h3><p>A clear brief identifies goals, access, constraints, and open questions. It helps the right people agree on the next action.</p>'+a('contact.html?interest=planning','Talk about planning')+'</section></div></div></section>',
        'process.html':intro('Work / process','A process you can follow.','Make the journey visible, from the first message to the final handover. These are sample operating steps, not a record of completed client projects.')+'<section class="shell section-divider"><div class="split"><div><p class="eyebrow">The four steps</p><h2>Clear at every stage.</h2><p>Use this page to explain your own working method. Add real project photography only when you have permission.</p></div><div class="flow">'+''.join(f'<div><span>0{i+1}</span><section><h3>{title}</h3><p>{body}</p></section></div>' for i,(title,body) in enumerate([('Listen first','Review the situation, desired outcome, location, and timing.'),('Confirm the scope','Separate confirmed work from the questions that need a visit or specialist review.'),('Do the agreed work','Explain access needs, working hours, and how changes are approved.'),('Leave a useful handover','Document the work, care instructions, and the support contact.')]))+'</div></div></section><section class="shell section-divider"><h2>Questions before the first visit.</h2><details><summary>Will this website give me an instant quote?</summary><p>No. It helps frame an inquiry. Quotes need a reviewed scope and are issued separately.</p></details><details><summary>What should I send?</summary><p>A short description, your general location, and the timing you have in mind. Keep sensitive documents out of your first email.</p></details><details><summary>Can I add completed work?</summary><p>Yes. Replace this process section with genuine projects and obtain permission for any customer names, photos, and location details.</p></details></section>'+callout('Ready for a clearer plan?','Start with a question. Agree on the work once the details are understood.')}
    if slug=='tideglass': return {
        'stays.html':intro('Stays / experiences','Choose your own pace.','A place to land, a little time outdoors, and room for the unplanned. These are sample offerings for a fictional retreat.')+'<section class="shell"><div class="grid two">'+card('THE HOUSE','Shore house','A standalone stay page with room for layout, accessibility, amenities, and important house notes.','stay-detail.html','Explore the house','coast.svg')+card('THE DAY','Coastal days','A flexible experience layout for walks, shared meals, and quiet afternoons. Confirm actual accessibility and availability with the operator.','contact.html','Ask about experiences','coast.svg')+'</div></section><section id="experiences" class="shell section-divider"><div class="split"><div><p class="eyebrow">Make time</p><h2>Choose less. Notice more.</h2><p>Use these sections for real experiences. Include duration, meeting point, access information, weather policy, and what a guest should bring.</p></div>'+facts([('Outside','A self-guided walk or a hosted route, with current local advice supplied by the property.'),('At the table','Describe what meals are included and how dietary requests can be discussed.'),('Inside','Quiet reading, shared space, and a comfortable place to return to. List real amenities here.')])+'</div></section>'+callout('Find the right stay.','Tell the property who is coming, the dates you are considering, and any access needs.','Plan a stay'),
        'stay-detail.html':intro('The house','A generous place to slow down.','This fictional shore house demonstrates a detailed accommodation page. Replace all room counts, amenities, policies, and location information with verified details.')+'<section class="shell"><img class="wide-art" src="assets/coast.svg" alt="Original coastal landscape illustration" width="1600" height="1100"><p class="caption">Original landscape artwork, included with the template. It does not depict an actual property.</p></section><section class="shell section-divider"><div class="split"><div><p class="eyebrow">The essentials</p><h2>Know the place before you arrive.</h2><p>Good stay information reduces uncertainty. Be precise about sleeping arrangements, access, heating, bathrooms, and what is included.</p>'+a('contact.html?interest=shore-house','Ask about the house','button')+'</div>'+facts([('Rooms & capacity','Add the actual bedroom layout, bed sizes, and maximum permitted occupancy.'),('Access','Add step-free routes, doorway measurements, bathroom details, and parking information. Do not claim full accessibility without checking.'),('Included','List actual linens, kitchen equipment, connectivity, and outdoor space.'),('Before you book','State your check-in times, cancellation policy, deposit terms, and whether taxes or fees are additional.')])+'</div></section><section class="shell section-divider"><h2>Useful questions.</h2><details><summary>Can I book instantly?</summary><p>This source edition includes an inquiry path. It has no booking engine or live availability. Connect a verified booking service before offering instant reservations.</p></details><details><summary>Can I bring a pet?</summary><p>The property must publish its actual policy, including any spaces or charges that apply.</p></details><details><summary>What if I have an access requirement?</summary><p>Contact the property before booking so it can give specific measurements and confirm suitable arrangements.</p></details></section>',
        'guide.html':intro('Local guide','Begin with the nearby.','A guide should help guests make good decisions. This sample deliberately avoids invented businesses, distances, and local endorsements.')+'<section class="shell section-divider"><div class="grid">'+card('01 / Outdoors','Along the water','Add a real route with verified distance, terrain, daylight guidance, and accessibility. Link to the relevant official local information.','contact.html','Ask for local guidance')+card('02 / Food','A table worth finding','Introduce places you genuinely know. Confirm opening hours and describe reservation needs without promising availability.','contact.html','Ask for current options')+card('03 / Culture','A different afternoon','Add a real gallery, market, or cultural venue. Include current access information and a source link to its own website.','contact.html','Ask what is nearby')+'</div></section><section class="shell"><div class="split"><div><h2>A useful guide keeps changing.</h2><p>Weather, transport, and seasonal opening times matter. Review this page regularly and point guests to the operator for current information.</p></div>'+facts([('Getting here','Publish actual transport options, parking notes, and directions after checking them.'),('Before setting out','Use official weather and local safety guidance. This demonstration is not an outdoor safety guide.'),('Access & comfort','Describe terrain, seating, toilets, and shelter wherever the information is known.')])+'</div></section>'+callout('Ask a local question.','Tell the property what you enjoy and what you need to plan comfortably.','Contact the property')}
    if slug=='matter': return {
        'collection.html':intro('Collection','Good objects earn their place.','A sample collection in clay and timber. The illustrations are original studies; they are not photographs of available inventory.')+'<section class="shell"><div class="grid two collection-grid">'+card('01 / CLAY','Turned vessel','Visible turning lines. A calm form. A sample object page with room for dimensions, materials, finish, and care.','object.html','View object','vessel.svg')+card('02 / TIMBER','Low stool','A compact seat designed as a material study. Replace with your actual product, dimensions, and load guidance.','object.html#timber','View the material notes','timber.svg')+'</div></section><section id="timber" class="shell section-divider"><div class="split"><div><p class="eyebrow">Beyond the image</p><h2>Show the details that matter.</h2><p>Help a buyer understand what an object is made from, how it is used, and how it changes with time.</p></div>'+facts([('Materials','Name actual species, clay bodies, finishes, and sourcing you can verify.'),('Dimensions','Use exact measurements and a clear unit. Explain tolerances for handmade work.'),('Availability','Show real made-to-order lead times or link to a connected store. No inventory is included in this template.')])+'</div></section>'+callout('Something in mind?','Ask about a form, a finish, or a commission. Prices and availability are confirmed by the studio.'),
        'object.html':intro('Object / 01','The turned vessel.','A sample product detail with space for the facts a considered purchase needs. This demonstration does not offer an actual item for sale.')+'<section class="shell"><div class="split"><div><img src="assets/vessel.svg" alt="Original terracotta vessel study with visible turning lines" width="900" height="1100"><p class="caption">Original artwork. Replace with your own product photography before taking orders.</p></div><div><p class="eyebrow">Clay / surface study</p><h2>Quiet form. Visible process.</h2><p>The rhythm of the turning remains visible on the outside. Use this section to describe actual making and finish details without overstating durability or provenance.</p><dl class="object-facts"><div><dt>Material</dt><dd>Sample terracotta study</dd></div><div><dt>Dimensions</dt><dd>Add verified height × width</dd></div><div><dt>Finish</dt><dd>Specify actual glaze and seal</dd></div><div><dt>Availability</dt><dd>Inquiry only; no live inventory</dd></div><div><dt>Price</dt><dd>Set by the maker</dd></div></dl><div class="hero-actions">'+a('contact.html?interest=vessel','Ask about this object','button')+'</div><p class="caption">No cart or payment service is connected. A commerce link can be added after its checkout is tested.</p><details><summary>Care & use</summary><p>Replace this with care guidance appropriate to the finished object. Do not claim food, dishwasher, microwave, or outdoor safety without substantiation.</p></details><details><summary>Delivery & returns</summary><p>Publish actual dispatch timing, packaging, damage reporting, return terms, and applicable consumer rights before selling.</p></details></div></div></section><section id="timber" class="shell section-divider"><div class="split"><div><h2>Also in timber.</h2><p>A low stool study explores grain, edge, and structure. Give every real object its own accurate specification and usage notes.</p>'+a('collection.html#timber','Return to the collection')+'</div><img src="assets/timber.svg" alt="Original timber stool study" width="900" height="1100" loading="lazy"></div></section>',
        'process.html':intro('Our process','Let the making stay visible.','Explain the decisions behind the object: what you use, what you change, and what you choose to leave in.')+'<section class="shell section-divider"><div class="split"><div><h2>From material to useful form.</h2><p>These sample stages give you a structure for an honest process story. Replace them with your own working method and original images.</p></div><div class="flow">'+''.join(f'<div><span>0{i+1}</span><section><h3>{title}</h3><p>{body}</p></section></div>' for i,(title,body) in enumerate([('Observe','Begin with a use, a gesture, or a repeated everyday need.'),('Shape','Work through proportions, material constraints, and small prototypes.'),('Refine','Check surfaces, connections, and the details that affect use.'),('Finish','Explain care, variation, and the part of the process a buyer can still see.')]))+'</div></div></section>'+material_explorer()+callout('Start a studio conversation.','Share your intended use, approximate size, timing, and the questions you are still exploring.')}
    return {
        'program.html':intro('Program','Follow what catches your ear.','A sample cultural program in sound, film, and ideas. Replace every session with confirmed information before publishing a live event.')+'<section class="shell section-divider">'+program_cards()+'</section><section class="shell"><div class="split"><div><h2>Before you make a plan.</h2><p>Put the practical details close to the program: dates, locations, age guidance, accessibility, and the organizer contact.</p></div>'+facts([('Dates & locations','Not scheduled in this demonstration. Publish only confirmed dates and venue addresses.'),('Tickets','No ticket inventory is connected. Add verified ticket links on the event detail page.'),('Access','State known access arrangements and provide a contact for specific questions.')])+'</div></section>'+callout('Ask before you arrive.','The right details help more people feel comfortable joining in.'),
        'event.html':intro('Event detail','A room for close listening.','An example event page that gives the experience and its practical details equal attention.')+'<section class="shell"><div class="split"><img src="assets/poster.svg" alt="Original Nightjar event poster illustration" width="900" height="1000"><div><section id="sound"><p class="eyebrow">Sound / Listening room</p><h2>Hear it together.</h2><p>A sample format for an attentive listening session and a conversation about how sound changes a space. Replace this description with the real performer and program details.</p><div class="event-facts"><span>Date: to be confirmed</span><span>Venue: to be confirmed</span><span>Tickets: not on sale</span></div>'+facts([('Running time','Add the confirmed performance and discussion duration.'),('Access','Add step-free access, seating, hearing provision, sensory information, and a contact for questions.'),('Audience information','State age policy, content guidance, admission rules, and whether late arrival is possible.')])+a('contact.html?interest=listening-room','Ask the organizers','button')+'<p class="caption">There is no ticket service or live availability in this source edition. Replace this inquiry action with a verified ticket destination only when ready.</p></section></div></div></section><section id="film" class="shell section-divider"><div class="split"><div><p class="eyebrow">Film / After the light</p><h2>See something, then talk.</h2><p>Use this section for confirmed film titles, creators, running times, screening rights, captioning, and discussion details.</p></div>'+a('contact.html?interest=film','Ask about the screening')+'</div></section><section id="ideas" class="shell section-divider"><div class="split"><div><p class="eyebrow">Ideas / An open table</p><h2>Leave space for a different view.</h2><p>Describe the conversation format, host, capacity, and how participation works. Do not promise an available place until the actual registration route is connected.</p></div>'+a('contact.html?interest=conversation','Ask about the conversation')+'</div></section>',
        'about.html':intro('About','Culture is something we do together.','Nightjar Assembly is a fictional cultural organization created to demonstrate this design. Replace this story with your real purpose and people.')+'<section class="shell section-divider"><div class="split"><div><p class="eyebrow">A shared space</p><h2>Open doors. Clear information.</h2></div><div><p>A welcoming program starts before anyone enters the room. It gives people enough information to decide whether an event is for them, how to get there, and whom to ask.</p><p>Use this page to introduce your real organizing team, explain your approach, and link to the policies that make participation safer and clearer.</p>'+a('contact.html','Meet through a conversation')+'</div></div></section><section class="shell section-divider"><div class="grid">'+card('01 / Curiosity','Leave room for discovery','Make space for new work and unfamiliar forms. Describe your selection process rather than inventing a track record.','program.html','Explore the sample program')+card('02 / Care','Make the practical visible','Access, timing, venue information, and audience guidance belong beside the creative work.','event.html','See an event page')+card('03 / Participation','Offer a way in','Explain how artists, partners, and visitors can get in touch. Make permissions and response expectations clear.','contact.html','Start a conversation')+'</div></section>'+callout('A good program starts with people.','Tell the organizers what you are making, exploring, or hoping to attend.')}

def contact_page(slug,f):
    subjects = {'switchboard':['Space improvement','Repair inquiry','Project planning'], 'tideglass':['Stay inquiry','Experience inquiry','Access question'], 'matter':['Object inquiry','Commission inquiry','Material question'], 'nightjar':['Program question','Access question','Artist inquiry']}[slug]
    return intro('Contact',{'switchboard':'Start with the situation.','tideglass':'Make a little room.','matter':'A thoughtful question.','nightjar':'Let’s talk about it.'}[slug], 'This is a demonstration contact page. The sample email address must be replaced before launch. No messages are sent to an Eidos service.')+f'''<section class="shell section-divider"><div class="split"><div><h2>{'Tell us what you have in mind.' if slug!='tideglass' else 'Tell us about your stay.'}</h2><p>A short message is enough to begin. Include relevant timing and any practical needs. Please keep payment details, identity documents, health information, and other sensitive data out of the inquiry.</p><div class="contact-card"><p class="eyebrow">Email</p><a class="email" data-email href="mailto:hello@example.com">hello@example.com</a><p class="caption">Placeholder address — configure your own before publishing.</p><p><strong>Response time</strong><br>Add your actual working hours and response expectations.</p><p><strong>Location / service area</strong><br>Add your verified location or service area. Do not publish a private home address unless intended.</p></div><p class="no-js-note">Without JavaScript, use the email link above. It opens your email application; this website has no message server.</p></div><div><p class="eyebrow">Optional email draft</p><p>This form prepares a draft in your email application. It does not submit to a server or confirm a booking, order, or ticket.</p><form class="inquiry-form enhancement"><label>Your name<input name="name" autocomplete="name" required maxlength="120"></label><label>Email address<input name="email" type="email" autocomplete="email" required maxlength="254"></label><label>What is this about?<select name="interest">{''.join('<option>'+s+'</option>' for s in subjects)}</select></label><label>Your message<textarea name="message" required maxlength="2500"></textarea></label><button class="button" type="submit">Prepare email draft</button><p class="form-status" role="status" aria-live="polite">Your message stays in this browser until you choose to open your email app.</p><a class="button secondary" data-prepared-email href="mailto:hello@example.com" hidden>Open prepared email</a><p class="caption">Review the recipient and text before sending. You can also copy your message into an email yourself.</p></form></div></div></section><section class="shell section-divider"><h2>Practical questions.</h2><details><summary>Is an inquiry a confirmed booking or order?</summary><p>No. Dates, scope, prices, terms, and availability must be confirmed by the business through its actual process.</p></details><details><summary>Where does this form send my information?</summary><p>It prepares a mailto draft locally. It does not store or send your information to a website server. Your email provider processes messages you choose to send.</p></details><details><summary>Can this connect to my existing form or booking tool?</summary><p>Yes, after you add and test your chosen integration. This template includes no paid service, account, credentials, or integration configuration.</p></details></section>'''

def document(slug,f,filename,body,title=None):
    nav = ''.join('<a href="'+url+'"'+ (' aria-current="page"' if url==filename else '')+'>'+label+'</a>' for url,label in f['links'])
    switch = '<button type="button" class="theme-toggle enhancement" data-theme-toggle aria-pressed="false">Night mode</button>' if slug=='nightjar' else ''
    page_descriptions = {
        'index.html': f['intro'],
        'services.html': 'Explore sample space improvements, repairs, and project planning. Choose a useful starting point for an inquiry; no automated diagnosis or quote.',
        'service-detail.html': 'A sample service detail with scope, preparation, process, and an ordinary contact path. Replace examples with your verified business information.',
        'stays.html': 'Explore a fictional shore house and coastal experiences, with clear inquiry links and sample details ready for your own property information.',
        'stay-detail.html': 'A fictional accommodation detail with room for layout, access, amenities, and booking policies. No live availability or booking engine is connected.',
        'guide.html': 'An editable local guide structure for real routes, food, culture, transport, and access information. No invented local endorsements are included.',
        'collection.html': 'Explore original clay and timber illustrations in a sample studio collection. Product descriptions link to details and an inquiry path; no live inventory.',
        'object.html': 'Inspect an original vessel study and sample object specification, care, delivery, and inquiry information. No connected cart or actual item for sale.',
        'program.html': 'Explore a fictional cultural program in sound, film, and ideas. Every sample session has an ordinary accessible event detail link.',
        'event.html': 'A sample event detail with space for confirmed artists, date, venue, access information, and ticket destination. No tickets are currently offered.',
        'about.html': 'Meet the purpose behind a fictional cultural assembly and the structure for an honest organizing-team, participation, and access story.',
        'process.html': 'Follow the sample working process and its practical next steps. Replace the example method with your own verified services or studio practices.',
        'contact.html': 'A clear sample inquiry path and optional locally prepared email draft. No website message server, booking, payment, or ticket service is connected.',
        'legal.html': 'Editable privacy and site notes for this fictional demonstration, explaining local email drafts, sample content, and the services not included.'
    }
    description = page_descriptions[filename]
    page_title = (title or f['name'])+' — '+f['business']
    schema = json.dumps({'@context':'https://schema.org','@type':'WebPage','name':page_title,'description':description,'inLanguage':'en'},ensure_ascii=False).replace('<','\\u003c')
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="{e(description)}"><meta name="color-scheme" content="light"><title>{e(page_title)}</title><meta property="og:title" content="{e(page_title)}"><meta property="og:description" content="{e(description)}"><meta property="og:type" content="website"><meta property="og:image" content="assets/{f['image']}"><meta property="og:image:alt" content="Original {e(f['name'])} demonstration illustration"><!-- Before publication set your real canonical URL, og:url, and an absolute supported social image URL. No fictional business domain is asserted. --><script type="application/ld+json">{schema}</script><link rel="stylesheet" href="styles.css"><script src="site-config.js" defer></script><script src="script.js" defer></script></head>
<body class="{slug}" data-page="{filename[:-5]}" data-theme="day"><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><a class="wordmark" href="index.html"><span class="mark" aria-hidden="true"></span><span data-brand>{f['business']}</span></a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav">Menu</button><nav id="main-nav" class="site-nav" aria-label="Main navigation">{nav}</nav>{switch}</header><main id="main">{body}</main><footer class="site-footer"><div><a class="wordmark" href="index.html" data-brand>{f['business']}</a><p>{f['tag']}</p><p class="demo-note">Fictional demonstration content. Original artwork. Replace sample details, policies, and contact information before launch.</p></div><div><div class="footer-links">{a('contact.html','Contact')}{a('legal.html','Privacy & site notes')}{a('index.html','Back to start')}</div><p class="demo-note">Template design by Eidos Works. No analytics, remote fonts, cookies, or connected transactions are included.</p></div></footer></body></html>'''

def legal_page(): return '<section class="shell legal"><p class="eyebrow">Before launch</p><h1>Privacy & site notes.</h1><p>This is an editable example, not legal advice or a final policy for your business. Replace it with an accurate policy for your location, services, and integrations.</p><h2>Information on this demonstration</h2><p>The static pages contain fictional business content and original illustrations. They do not describe available products, real scheduled events, genuine accommodation, customer results, qualifications, or inventory.</p><h2>Contact inquiries</h2><p>The optional form creates a local email draft. It has no server endpoint. Information is only sent if you review and send the draft through your email provider. State your real retention, use, and deletion practices before launch.</p><h2>Cookies and third parties</h2><p>This source edition includes no analytics, remote fonts, cookies, or third-party scripts. Hosting providers may keep server access logs. Adding an embed, payment link, form service, or analytics can change what your final policy needs to say.</p><h2>Booking, buying, and tickets</h2><p>No booking engine, cart, payment processing, ticket inventory, emergency response, or automated quotation is included. Add tested services and publish their actual terms before accepting transactions.</p><h2>Accessibility and feedback</h2><p>The design includes keyboard navigation, visible focus, responsive layouts, reduced-motion rules, meaningful links, and readable static fallback. Replace this paragraph with a real accessibility contact and the results of your own content and device checks.</p>'+a('contact.html','Return to contact')+'</section>'

DEVELOPER_LICENSE = '''Eidos Works Commercial Template License — Developer Source, version 1.0
Draft product terms, October 10, 2026. Purchase availability is controlled by the shop.

Copyright (c) 2026 Eidos Works. Original HTML, CSS, JavaScript, and illustrations.
For a valid purchase, you may modify and publish one finished website for yourself
or one client. You may keep backups and use local/staging copies for that website.
You may transfer the finished website to that client and give them its source for
maintenance. The license does not permit reselling or redistributing the template
or its artwork as a standalone template, theme, asset pack, or competing library.
Buy a separate license for each additional finished website. System fonts are not
redistributed and remain governed by their own operating-system licenses.

No third-party brand, client data, stock photo, remote font, or dependency is bundled.
Original illustrations may be used and modified within the licensed finished site.
Fictional sample names and offerings are examples, not verified business claims.

Support: see SUPPORT.md. Hosting, domains, platform subscriptions, paid plugins,
booking, commerce, ticketing, email delivery, content entry, and legal advice are
not included. No lifetime updates, uptime, conversion result, or support response
time is promised. Mandatory consumer rights are unaffected by these terms.

Provided as-is to the extent permitted by law, without warranty of fitness for a
particular purpose. Review the implementation and your final content before launch.
'''

SUPPORT = '''# Support and updates

This is a release candidate. Commercial availability and any supported platform
acceptance are stated on the product page, separately from these source files.

For a valid purchase, template-file defects and clarification of the included
installation guide may be reported through https://eidos-works.com/contact/.
Draft support windows are 30 days after purchase for installation guidance and
90 days after purchase for reproducible defects in the supplied template files.
Include your order reference, edition/version, browser or platform version,
reproduction steps, and a screenshot without personal data or credentials.

Custom design, content writing, content entry, hosting, domain/DNS setup, server
administration, third-party integration, and migrations are not included. No
response-time SLA, recurring maintenance, lifetime updates, or compatibility
with every plugin or hosted editor is promised. If a fix or update is provided,
back up customizations and review its change notes before replacing files.

The source edition runs independently of Eidos services. Your downloaded version
continues to be editable if support or update distribution changes. WordPress
code remains subject to its included GPL license. Platform subscriptions and any
optional third-party services are purchased and managed separately by the owner.
'''

def write(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(value,encoding='utf-8',newline='\n')

def developer(slug,f):
    out=ROOT/slug/'developer'
    css = BASE_CSS+FAMILY_CSS[slug]+RESPONSIVE_FIXES+'\n.js-ready .inquiry-form.enhancement{display:grid}.motion-off *,.motion-off *:before,.motion-off *:after{transition:none!important;animation:none!important}\n'
    if slug == 'switchboard':
        css += '\n.switchboard .hero h1{font-size:clamp(2.2rem,6vw,6rem)}@media(max-width:640px){.switchboard .hero h1{font-size:clamp(2.4rem,12.3vw,3rem)}}\n'
    if slug == 'nightjar':
        css = css.replace('.nightjar[data-theme=night]{--paper:#201e39;--ink:#fff5d8;--panel:#3e355b;--line:#776980;--accent:#674bad}', '.nightjar[data-theme=night]{--paper:#201e39!important;--ink:#fff5d8!important;--panel:#3e355b!important;--line:#776980!important;--accent:#674bad!important}')
        css = css.replace('.nightjar .hero h1{font-size:clamp(4.2rem,8.5vw,9rem)', '.nightjar .hero h1{font-size:clamp(2.7rem,7vw,7rem)')
    pages={'index.html':homepage(slug,f),**inner_pages(slug,f),'contact.html':contact_page(slug,f),'legal.html':legal_page()}
    for filename,body in pages.items():
        title=next((label for url,label in f['links'] if url==filename),'Privacy and site notes')
        # Prevent accidental duplicate class attributes in generated card markup.
        body=body.replace('class="card" class=""','class="card service-card"')
        write(out/filename,document(slug,f,filename,body,title))
    write(out/'styles.css',css)
    write(out/'script.js',JS)
    config={'version':1,'brand':f['business'],'email':'hello@example.com','phone':'','motion':True,'colors':{'ink':f['color'],'paper':f['paper'],'accent':f['accent']},'fonts':{'heading':f['font'],'body':'system-ui, -apple-system, "Segoe UI", sans-serif'},'pages':{'index':{'title':f['hero'].replace('\n',' '),'intro':f['intro'],'ctaLabel':f['cta'],'ctaHref':f['target'],'image':'assets/'+f['image'],'imageAlt':'Original '+f['name']+' illustration'}}}
    write(out/'site-config.js','/* Edit values below. Keep the static HTML in sync for visitors without JavaScript. */\nwindow.SITE_CONFIG = '+json.dumps(config,indent=2)+';\n')
    for name,svg in SVG.items():
        if name==f['image'] or slug=='matter' and name=='timber.svg': write(out/'assets'/name,svg+'\n')
    write(out/'LICENSE.txt',DEVELOPER_LICENSE)
    write(out/'SUPPORT.md',SUPPORT)
    write(out/'ASSETS.md',f'''# Asset and dependency receipt — {f['name']}

All bundled SVG illustrations were drawn as original vector code for Eidos Works,
October 10, 2026. No stock, customer, Disney, DG Promo, gallery, or third-party brand
assets were reused. They are illustrative art, not photographs or product proof.

Files: {', '.join(p.name for p in sorted((out/'assets').glob('*.svg')))}.
Developer-source artwork use is included within the licensed finished website;
standalone asset resale is excluded. WordPress edition artwork is GPL-2.0-or-later.
System font stacks load fonts already available on the visitor's device. No font
files, third-party scripts, npm packages, proprietary service, or build dependency
are bundled. File hashes and exact byte sizes are recorded in PACKAGE_MANIFEST.json.
''')
    write(out/'INSTALL.md',f'''# {f['name']} — Developer source installation

## What this edition is
A complete portable five-page website design, plus a legal-notes page, editable
HTML/CSS/JavaScript, original SVG artwork, and this guide. It requires code editing.
It is not a WordPress, Squarespace, or GoDaddy theme importer. Choose the separately
verified native/platform edition if that is what you need.

## Quick start
1. Extract the ZIP to a new folder. Keep a copy of the original ZIP as a backup.
2. Open `index.html` in a current browser. No account, build, or server is needed
   for the included local pages and interactions.
3. Optional local preview: from the extracted folder run
   `python -m http.server 8080` and visit `http://localhost:8080`. Python is optional.
4. Edit with a plain-text editor. Copy this folder to your chosen static hosting
   provider or upload its contents to the website document root using its normal
   file manager/SFTP workflow. Hosting and domain costs are separate.
5. Open the hosted URL and test every page, inquiry link, and responsive layout.

## Editing surface
- Copy: every page is ordinary HTML. Change headings, paragraphs, lists, captions,
  and policy notes directly; no template language is required.
- Branding, links, hero copy and artwork, colors, system-font stacks, and motion:
  edit `site-config.js`. The `pages` object accepts the filename without `.html`;
  each page can override `title`, `intro`, `ctaLabel`, `ctaHref`, `image`, `imageAlt`.
  Keep the corresponding HTML default and the CSS color variables in sync so the
  no-JavaScript version presents the same business information.
- Colors and detailed layout: edit `styles.css`. The last family-specific block
  defines design tokens. Check contrast after changing colors.
- Images: put your own licensed files in `assets/` and replace the HTML `src`,
  width/height, and meaningful `alt` text. Original included SVGs can be edited.
- Navigation: update links in each page header/footer. Preserve the skip link.
- Contact: replace every `hello@example.com` with your real public address, and
  set `email` in `site-config.js`. The form prepares an email draft only. The
  visitor must review and send it in an email app. There is no message database.
- Integrations: add your actual tested form/booking/store/ticket destination.
  Do not label it connected until you complete its real transaction flow.

## Search and social metadata before publishing
Each page has its own title, description, Open Graph title/description/type/image,
and minimal WebPage JSON-LD. No fictional domain, price, availability, rating,
business address, or organization credential is asserted. Canonical and `og:url`
are intentionally omitted until your actual domain and page URLs are known.
Set those absolute URLs in each HTML head before publication. The bundled
`og:image` is a relative path to original SVG art for local preview. Social
services vary in SVG support; export your original artwork to their supported
raster format, publish it on your host, and set an absolute image URL before
relying on link previews. Update the metadata and JSON-LD descriptions with your
real content. JavaScript configuration does not rewrite static metadata; edit
the HTML head so crawlers and no-JavaScript visitors get accurate information.

## Included pages
{chr(10).join('- `'+url+'` — '+label for url,label in f['links'])}
- `legal.html` — editable privacy and site notes; not legal advice.

## Accessibility and fallbacks
All pages, service/object/event information, and contact email remain available
without JavaScript. Enhancements use ordinary keyboard-focusable buttons, pressed
states, live status, and touch targets. Reduced motion is respected. The menu is
fully visible without JavaScript. Test your final copy/images by keyboard and on
real mobile devices; the included checks do not certify legal accessibility.

## Before publishing
- Replace fictional content, unconfirmed facts, and placeholder contact details.
- Publish real business policies, dimensions/access notes, terms, and prices.
- Replace sample branding where required. Confirm image/content permissions.
- Test links and email on your actual host; test any integrated checkout/booking.
- Add analytics only intentionally and update your privacy/cookie disclosures.
- Keep secrets and credentials out of these public source files.

## Requirements, support, and rights
A browser, text editor, and static hosting are sufficient. No paid font, plugin,
Eidos service, analytics, backend, booking engine, cart, or mandatory build is included.
The developer license covers one finished website, including a client handoff.
Read `LICENSE.txt`, `SUPPORT.md`, and `ASSETS.md` before purchasing or publishing.
''')
    write(out/'README.md',f'# {f["name"]} — Developer source v1\n\n{f["intro"]}\n\nStart with [INSTALL.md](INSTALL.md). Six linked static pages including legal notes,\none signature interaction, original artwork, and no mandatory build.\n\nStatus: release candidate. Prices and availability are controlled by the catalog.\nNo connected booking, payment, ticketing, emergency dispatch, or message server.\n')
    if slug == 'switchboard':
        guide = out/'INSTALL.md'
        write(guide, guide.read_text(encoding='utf-8') + '\n## Hero typography\n\nVersion 1.0.1 sizes the hero headline with `clamp(2.2rem,6vw,6rem)` and a\nphone rule of `clamp(2.4rem,12.3vw,3rem)`. Ordinary sample words stay intact\nin the tested layouts; the phone rule retains the original 3rem ceiling.\nAfter changing the headline or font, check individual words at phone, tablet,\nand desktop widths as well as the overall text box. Long custom words may\nneed a smaller font or shorter copy.\n')
    if slug == 'nightjar':
        guide = out/'INSTALL.md'
        write(guide, guide.read_text(encoding='utf-8') + '\n## Day and night palette\n\nThe `colors` values in `site-config.js` configure the day palette. Night mode\nuses the fixed high-contrast token set in `.nightjar[data-theme=night]` in\n`styles.css`; those tokens intentionally override configured day colors. Change\nthe night palette in that CSS rule if needed, and check normal text, cards,\nbuttons, navigation, and contact fields in both modes after editing. Version\n1.0.1 corrects the original day-token precedence in night mode.\n')
        write(guide, guide.read_text(encoding='utf-8') + '\n## Hero typography\n\nVersion 1.0.3 uses `clamp(2.7rem,7vw,7rem)` for the desktop hero headline and\nretains the existing phone override. This keeps ordinary sample words intact\nacross the tested browser fonts. After changing the headline or heading font,\ncheck individual words on phone and desktop as well as the overall text box.\nLong custom words still need an appropriately sized font or shorter copy.\n')
        write(guide, guide.read_text(encoding='utf-8') + '\nThe 1.0.3 minimum also keeps the sample word intact immediately above the phone\nbreakpoint (641px), where the prior 3rem minimum was still too large.\n')
    return pages

# WordPress output uses native blocks. HTML is confined to a block's valid saved
# markup; no core/html iframe or whole-page block is used to imitate editability.
def block(name,attrs,content):
    return f'<!-- wp:{name} {json.dumps(attrs,separators=(",",":"))} -->\n{content}\n<!-- /wp:{name} -->\n'
def p(content,cls=''):
    attribute = ' class="'+cls+'"' if cls else ''
    return block('paragraph',{'className':cls} if cls else {},f'<p{attribute}>{content}</p>')
def heading(content,level=2): return block('heading',{'level':level},f'<h{level} class="wp-block-heading">{content}</h{level}>')
def group(content,cls='',tag='div'): return block('group',{'className':cls,'tagName':tag,'layout':{'type':'default'}},f'<{tag} class="wp-block-group {cls}">{content}</{tag}>')
def buttons(href,label): return block('buttons',{},'<div class="wp-block-buttons">'+block('button',{},f'<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="{href}">{label}</a></div>')+'</div>')
def columns(items): return block('columns',{},'<div class="wp-block-columns">'+''.join(block('column',{},'<div class="wp-block-column">'+item+'</div>') for item in items)+'</div>')
def wp_image(file,alt):
    src=f"<?php echo esc_url( get_theme_file_uri( '/assets/{file}' ) ); ?>"
    return block('image',{'sizeSlug':'full','linkDestination':'none'},f'<figure class="wp-block-image size-full"><img src="{src}" alt="{e(alt)}"/><figcaption class="wp-element-caption">Original Eidos Works illustration; replace with your own licensed image.</figcaption></figure>')
def details(title,body): return block('details',{},f'<details class="wp-block-details"><summary>{title}</summary>{p(body)}</details>')
def wp_card(title,body,href,label): return group(heading(title,3)+p(body)+buttons(href,label),'card')

def wp_content(slug,f,filename):
    title = f['hero'].replace('\n',' ') if filename=='index.html' else next(label for url,label in f['links'] if url==filename)
    pages=inner_pages(slug,f)
    desc=f['intro'] if filename=='index.html' else {'switchboard':'Make the scope and the next action clear. This fictional sample is ready for your own verified services and contact details.','tideglass':'A fictional coastal retreat. Replace this sample with verified property details, access information, policies, and booking instructions.','matter':'Original material studies for a fictional studio. Replace with your actual product, measurements, finish, and inquiry details.','nightjar':'A fictional cultural program. Replace with confirmed artists, dates, access details, venues, and verified ticket destinations.'}[slug]
    hero=group(p(f['tag'],'eyebrow')+heading(title,1)+p(desc)+buttons('/contact/','Start a conversation'),'page-intro')
    if filename=='index.html':
        hero=group(columns([p(f['tag'],'eyebrow')+heading(title,1)+p(desc)+buttons('/'+f['target'][:-5]+'/',f['cta']),wp_image(f['image'],'Original '+f['name']+' illustration')]),'hero wp-hero')
    if slug=='switchboard':
        body=heading('What needs attention?')+p('Choose the closest description. These native expandable sections provide a keyboard and touch alternative to the developer edition selector; they do not diagnose or quote.')+details('Space improvements','Explain the practical problem and the outcome you want. Add your location and timing to the inquiry.')+details('Repair & maintenance','Describe what is happening. The business reviews whether the issue is within its scope before advising on a next step.')+details('Project planning','Agree on the brief, access needs, schedule, and open questions before work begins.')
        if filename=='service-detail.html': body=columns([wp_image(f['image'],'Original service planning illustration'),heading('Make the everyday work better.')+p('Use this service detail to explain your verified capabilities, limitations, and actual service area.')+heading('What is included',3)+p('Replace with your actual scope. Add qualifications only when confirmed. This website does not provide emergency dispatch, diagnostic advice, or an instant quote.')+buttons('/contact/','Ask about this service')])
        if filename=='process.html': body=heading('A process you can follow.')+''.join(heading(t,3)+p(b) for t,b in [('01 / Share the situation','Describe the practical need, location, desired outcome, and timing.'),('02 / Confirm the scope','Review what is included and which questions need a visit or specialist.'),('03 / Do the agreed work','Publish actual working hours, access arrangements, and change approval process.'),('04 / Leave a useful handover','Document the work, care guidance, and support contact.')])
    elif slug=='tideglass':
        body=heading('Less itinerary. More time.')+columns([wp_card('The shore house','A quiet sample stay with room for your actual layout, amenities, and access notes.','/stay-detail/','Explore the house'),wp_card('Coastal days','Replace with real experiences, duration, meeting point, weather policy, and guidance.','/guide/','Read the local guide')])+heading('The rhythm of the day')+details('Morning','Quiet light, a slow breakfast, and a walk before the day fills. Native details remain editable without custom blocks.')+details('Day','Explore nearby, find a table outside, or leave the afternoon unplanned.')+details('Evening','Return to warm light and make time for dinner together.')
        if filename=='stay-detail.html': body=wp_image(f['image'],'Original coastal landscape')+heading('Know the place before you arrive.')+''.join(heading(t,3)+p(b) for t,b in [('Rooms & capacity','Add real room counts, bed sizes, and maximum permitted occupancy.'),('Access','Publish exact step-free routes, doorway and bathroom measurements, and parking.'),('Included','List actual amenities, kitchen equipment, connectivity, and outdoor space.'),('Before booking','Publish actual check-in, cancellation, deposit, tax, and fee terms. No booking engine or live availability is included.')])+buttons('/contact/','Ask about a stay')
        if filename=='guide.html': body=heading('Begin with the nearby.')+columns([wp_card('Along the water','Add a real route, verified terrain and access information, and official guidance.','/contact/','Ask for local guidance'),wp_card('At the table','Use genuine local recommendations and verify current opening hours.','/contact/','Ask for current options'),wp_card('A different afternoon','Add an actual cultural venue and its own current information link.','/contact/','Ask what is nearby')])+p('This sample does not invent businesses, distances, endorsements, or weather advice. Review your real guide regularly.')
    elif slug=='matter':
        body=heading('For the everyday ritual.')+columns([wp_image('vessel.svg','Original clay vessel illustration')+heading('Turned vessel',3)+p('Visible turning lines. A calm form. Original sample art, not actual inventory.')+buttons('/object/','View the object'),wp_image('timber.svg','Original timber stool illustration')+heading('Low stool',3)+p('A material study exploring grain, edge, and a straightforward structure.')+buttons('/collection/','Explore the collection')])+heading('What the surface tells you.')+details('Clay / surface notes','Explain your real clay body, glaze, finish, care, and appropriate use. Do not claim food or dishwasher safety without substantiation.')+details('Timber / material notes','Explain actual species, finish, verified sourcing, care, and intended use.')
        if filename=='object.html': body=columns([wp_image('vessel.svg','Original clay vessel study'),heading('Quiet form. Visible process.')+p('This sample product is not for sale. Replace its description and image with your actual object.')+heading('Object specification',3)+p('Material: sample clay study. Dimensions: add exact height × width and unit. Finish: specify real glaze and seal. Availability: inquiry only, no connected inventory. Price: set by the maker.')+buttons('/contact/','Ask about this object')+details('Care & use','Publish care appropriate to the finished object; do not invent safety claims.')+details('Delivery & returns','Publish your dispatch, packaging, damage reporting, return terms, and applicable consumer rights.')])
        if filename=='process.html': body=heading('Let the making stay visible.')+''.join(heading(t,3)+p(b) for t,b in [('01 / Observe','Begin with an everyday use, gesture, or need.'),('02 / Shape','Work through proportion, material constraints, and prototypes.'),('03 / Refine','Check surfaces, connections, and details that affect use.'),('04 / Finish','Explain care, variation, and the process a buyer can still see.')])+wp_image('timber.svg','Original timber stool and visible grain')
    else:
        body=heading('One program. Many ways in.')+columns([wp_card('Sound / Listening room','A sample close listening session and a conversation about sound and place.','/event/#sound','Explore the session'),wp_card('Film / After the light','A sample screening format. Add actual titles, creators, running times, and screening rights.','/event/#film','Read the film notes'),wp_card('Ideas / An open table','A sample conversation format. Add the actual host, topic, and participation details.','/event/#ideas','Explore the conversation')])+p('Dates, venues, and ticket inventory are not connected. Add confirmed details and verified ticket links before announcing a real event.')
        if filename=='event.html': body=columns([wp_image(f['image'],'Original Nightjar program poster'),heading('Hear it together.')+p('Sample event only. Date: to be confirmed. Venue: to be confirmed. Tickets: not on sale.')+heading('Before attending',3)+p('Publish running time, age policy, content guidance, admission rules, seating, step-free access, hearing provision, and sensory notes.')+buttons('/contact/','Ask the organizers')])+details('Sound / Listening room','Replace this with the actual session, artists, confirmed date, and verified ticket destination.')+details('Film / After the light','Include screening rights, titles, credits, running time, captioning, and discussion notes.')+details('Ideas / An open table','Describe the host, capacity, and format; connect an actual tested registration route before offering places.')
        if filename=='about.html': body=heading('Good culture leaves room.')+p('Room for an unexpected conversation, a first-time performer, and the person who came alone. Replace this fictional organization with your real purpose and people.')+columns([wp_card('Curiosity','Describe your actual curation process without inventing a track record.','/program/','Explore the program'),wp_card('Care','Place access, timing, and audience guidance beside creative details.','/event/','See an event page'),wp_card('Participation','Explain how artists and visitors can reach your real organizing team.','/contact/','Start a conversation')])
    if filename=='contact.html':
        body=columns([heading('Tell us what you have in mind.')+p('This is a sample contact page. Replace this address and all sample information before launch.')+p('<a href="mailto:hello@example.com">hello@example.com</a>')+p('Response time: publish your real working hours. Location or service area: add verified details. Avoid publishing a private address unless intended.'),heading('A clear inquiry',3)+p('Include a short description, relevant timing, and practical needs. Keep payment details, identity documents, health information, and other sensitive material out of the inquiry.')+buttons('mailto:hello@example.com','Open your email app')+p('The link opens an email app. No form server, message storage, booking, payment, or ticket service is connected.')])+details('Is an inquiry a confirmed booking or order?','No. Scope, dates, availability, prices, and terms must be confirmed through your actual process.')
    return hero+group(body,'shell section-divider')+group(p('Fictional demonstration content. Replace sample details and policies before launch. No live booking, commerce, ticketing, or messaging service is included.','demo-note'),'shell')

WP_CSS='''
/* Native block theme additions. Individual blocks remain editable in Site Editor. */
.wp-site-blocks{max-width:1440px;margin:auto}.wp-site-blocks>header,.wp-site-blocks>footer{padding:1.5rem 4vw}.wp-site-blocks main{margin:0}.wp-site-blocks .shell{padding:3rem 4vw}.wp-site-blocks .page-intro{padding:4rem 4vw 2rem}.wp-site-blocks .hero{display:block;min-height:0}.wp-site-blocks .wp-hero{padding:4rem 4vw;color:var(--ink)}.wp-site-blocks .wp-hero:before{display:none}.wp-site-blocks .wp-block-site-title a{text-decoration:none;font-size:1.6rem;font-weight:700}.wp-site-blocks .wp-block-navigation a{font:500 .9rem system-ui,sans-serif}.wp-site-blocks .wp-block-columns{gap:3rem}.wp-site-blocks .wp-block-image img{width:100%;height:auto}.wp-site-blocks .wp-block-image{margin:0 0 2rem}.wp-site-blocks .wp-element-caption{font:400 .8rem/1.5 system-ui,sans-serif}.wp-site-blocks h1{font-size:clamp(3rem,7vw,6.6rem)}.wp-site-blocks h2{font-size:clamp(2rem,4vw,3.5rem)}.wp-site-blocks .card{height:100%}.wp-site-blocks .wp-block-details{padding:1rem 0}.wp-site-blocks .wp-block-buttons{margin-top:1.5rem}.wp-site-blocks .wp-block-group>p{margin-top:1rem}.wp-site-blocks .wp-block-navigation__responsive-container.is-menu-open{background:var(--paper);color:var(--ink);padding:2rem}.wp-site-blocks footer{border-top:1px solid var(--line);margin-top:3rem}.wp-site-blocks .wp-hero .wp-block-columns{align-items:center}.wp-site-blocks .wp-hero .wp-block-image img{max-height:620px;object-fit:cover}@media(max-width:781px){.wp-site-blocks .wp-block-columns{gap:2rem}.wp-site-blocks h1{font-size:3rem}.wp-site-blocks .hero{padding-top:2rem}}
'''

# Ordinary long content must stay within its grid track. Nightjar's original
# mobile all-caps word GATHERING was clipped by overflow:hidden; preserve the
# full word at phone sizes and keep an emergency wrap for customer headlines.
RESPONSIVE_FIXES='''
.hero>*,.split>*,.grid>*{min-width:0}h1,h2,h3{overflow-wrap:anywhere}.nav-toggle{color:inherit}
@media(max-width:640px){.nightjar .hero h1{font-size:clamp(2.7rem,10.7vw,4.1rem)}}
'''

def wordpress(slug,f):
    out=ROOT/slug/'wordpress'
    write(out/'style.css',f'''/*
Theme Name: {f['name']} by Eidos Works
Theme URI: https://eidos-works.com/shop/templates/{slug}/
Author: Eidos Works
Author URI: https://eidos-works.com/
Description: Original editable five-page block theme for {f['business']}. Native core blocks, original artwork, no paid page builder. Candidate pending declared clean-install verification.
Version: 1.0.1
Update URI: https://eidos-works.com/shop/templates/{slug}/
Requires at least: 6.6
Requires PHP: 8.1
License: GNU General Public License v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: eidos-{slug}
Tags: block-patterns, full-site-editing, custom-colors, custom-logo, editor-style
*/
'''+BASE_CSS+FAMILY_CSS[slug]+WP_CSS+RESPONSIVE_FIXES)
    theme={'$schema':'https://schemas.wp.org/wp/6.6/theme.json','version':3,'settings':{'appearanceTools':True,'useRootPaddingAwareAlignments':True,'layout':{'contentSize':'760px','wideSize':'1280px'},'color':{'palette':[{'slug':'ink','name':'Ink','color':f['color']},{'slug':'paper','name':'Paper','color':f['paper']},{'slug':'accent','name':'Accent','color':f['accent']}]},'typography':{'fontFamilies':[{'slug':'heading','name':'Heading','fontFamily':f['font']},{'slug':'body','name':'System sans','fontFamily':'system-ui, -apple-system, "Segoe UI", sans-serif'}],'fluid':True,'fontSizes':[{'slug':'small','name':'Small','size':'.875rem'},{'slug':'medium','name':'Medium','size':'1rem'},{'slug':'large','name':'Large','size':'1.4rem'},{'slug':'x-large','name':'Extra large','size':'2.8rem'}]}},'styles':{'color':{'background':'var:preset|color|paper','text':'var:preset|color|ink'},'typography':{'fontFamily':'var:preset|font-family|body','lineHeight':'1.6'},'elements':{'heading':{'typography':{'fontFamily':'var:preset|font-family|heading'}},'link':{'color':{'text':'var:preset|color|ink'}}}},'customTemplates':[{'name':filename[:-5],'title':f['name']+' — '+label,'postTypes':['page']} for filename,label in f['links'] if filename!='index.html'],'templateParts':[{'name':'header','title':'Header','area':'header'},{'name':'footer','title':'Footer','area':'footer'}]}
    write(out/'theme.json',json.dumps(theme,indent=2)+'\n')
    write(out/'functions.php',f'''<?php
/** Native block theme assets. No tracking, endpoints, or proprietary services. */
if ( ! defined( 'ABSPATH' ) ) {{ exit; }}
add_action( 'after_setup_theme', function () {{
    add_theme_support( 'wp-block-styles' );
    add_editor_style( 'style.css' );
}} );
add_action( 'wp_enqueue_scripts', function () {{
    wp_enqueue_style( 'eidos-{slug}', get_stylesheet_uri(), array(), '1.0.1' );
}} );
add_filter( 'body_class', function ( $classes ) {{ $classes[] = '{slug}'; return $classes; }} );
''')
    nav=''.join(f'<!-- wp:navigation-link {json.dumps({"label":label,"url":"/" if file=="index.html" else "/"+file[:-5]+"/","kind":"custom","isTopLevelLink":True})} /-->' for file,label in f['links'])
    header=group(columns(['<!-- wp:site-title {"level":0} /-->','<!-- wp:navigation {"overlayMenu":"mobile","ariaLabel":"Main navigation","layout":{"type":"flex","justifyContent":"right"}} -->'+nav+'<!-- /wp:navigation -->']),'','div')
    write(out/'parts'/'header.html',header)
    write(out/'parts'/'footer.html',group(p(f['business'])+p('Fictional demonstration content. Replace all sample information before launch.','demo-note')+p('<a href="/contact/">Contact</a> · <a href="/privacy-policy/">Privacy policy</a>'),'','div'))
    for file,label in f['links']:
        key=file[:-5]
        pattern=wp_content(slug,f,file)
        write(out/'patterns'/f'{key}.php',f'''<?php
/**
 * Title: {f['name']} — {label}
 * Slug: eidos-{slug}/{key}
 * Categories: featured
 * Description: Editable original {label.lower()} layout built with WordPress core blocks.
 * Inserter: true
 */
?>
'''+pattern)
        template='<!-- wp:template-part {"slug":"header","tagName":"header"} /-->\n'+group(f'<!-- wp:pattern {{"slug":"eidos-{slug}/{key}"}} /-->','', 'main')+'<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->\n'
        write(out/'templates'/('front-page.html' if key=='index' else key+'.html'),template)
    content='<!-- wp:template-part {"slug":"header","tagName":"header"} /-->\n'+group('<!-- wp:post-title {"level":1} /-->\n<!-- wp:post-content {"layout":{"type":"constrained"}} /-->','shell','main')+'<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->\n'
    write(out/'templates'/'page.html',content)
    write(out/'templates'/'single.html',content)
    write(out/'templates'/'index.html','<!-- wp:template-part {"slug":"header","tagName":"header"} /-->\n'+group('<!-- wp:query {"query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","inherit":true}} -->\n<div class="wp-block-query"><!-- wp:post-template --><!-- wp:post-title {"isLink":true} /--><!-- wp:post-excerpt /--><!-- /wp:post-template --><!-- wp:query-pagination --><div class="wp-block-query-pagination"><!-- wp:query-pagination-previous /--><!-- wp:query-pagination-next /--></div><!-- /wp:query-pagination --></div><!-- /wp:query -->','shell','main')+'<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->\n')
    write(out/'templates'/'404.html','<!-- wp:template-part {"slug":"header","tagName":"header"} /-->\n'+group(heading('This page is elsewhere.',1)+p('Use the navigation or return to the home page.')+buttons('/','Back to home'),'shell','main')+'<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->\n')
    for name,svg in SVG.items():
        if name==f['image'] or slug=='matter' and name=='timber.svg':write(out/'assets'/name,svg+'\n')
    # WXR page content is intentionally plain core blocks; no author/account data.
    items=[]
    for index,(file,label) in enumerate(f['links'],start=1):
        key=file[:-5]
        page_body=heading(label,1)+p('Edit this page with your own content. To start from the supplied layout, insert the '+f['name']+' — '+label+' pattern.')
        items.append(f'''<item><title>{xml.escape(label)}</title><link>https://example.com/{'' if key=='index' else key+'/'}</link><dc:creator><![CDATA[template-owner]]></dc:creator><content:encoded><![CDATA[{page_body}]]></content:encoded><wp:post_id>{index}</wp:post_id><wp:post_date>2026-10-10 00:00:00</wp:post_date><wp:post_date_gmt>2026-10-10 00:00:00</wp:post_date_gmt><wp:post_name>{'home' if key=='index' else key}</wp:post_name><wp:status>publish</wp:status><wp:post_parent>0</wp:post_parent><wp:menu_order>{index}</wp:menu_order><wp:post_type>page</wp:post_type><wp:is_sticky>0</wp:is_sticky><wp:postmeta><wp:meta_key>_wp_page_template</wp:meta_key><wp:meta_value><![CDATA[{'default' if key=='index' else key}]]></wp:meta_value></wp:postmeta></item>''')
    write(out/'demo-content.xml','''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wfw="http://wellformedweb.org/CommentAPI/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:wp="http://wordpress.org/export/1.2/"><channel><title>'''+f['business']+'''</title><link>https://example.com</link><description>Original fictional demo pages; no users, customer data, media downloads, or third-party service.</description><pubDate>Sat, 10 Oct 2026 00:00:00 +0000</pubDate><language>en</language><wp:wxr_version>1.2</wp:wxr_version><wp:base_site_url>https://example.com</wp:base_site_url><wp:base_blog_url>https://example.com</wp:base_blog_url>'''+''.join(items)+'</channel></rss>\n')
    write(out/'SUPPORT.md',SUPPORT)
    write(out/'LICENSE.txt','''GNU GENERAL PUBLIC LICENSE — version 2 or (at your option) any later version.
Copyright (c) 2026 Eidos Works.

All WordPress edition PHP, HTML, CSS, JSON, block patterns, and original SVG
artwork in this theme are licensed under GPL-2.0-or-later. You may use, study,
modify, and redistribute them under that license. No commercial one-site limit
removes the rights this license grants. The purchase price is for the packaged
design, documentation, and support described in SUPPORT.md.

The complete GPL v2 text is included in COPYING. Theme provided without warranty.
System fonts are not redistributed. No third-party plugins or dependencies are
bundled. The original fictional sample content is included under the same license.
''')
    write(out/'ASSETS.md','''# Asset receipt

All bundled SVG artwork is original Eidos Works vector illustration, October 10,
2026, and is licensed GPL-2.0-or-later in this WordPress edition. It contains no
stock, customer, Disney, DG Promo, or third-party brand assets. Images are
illustrations, not photographs of real products, events, or accommodation.
No font files or plugins are bundled. System fonts use the visitor device.
''')
    write(out/'INSTALL.md',f'''# {f['name']} — Native WordPress block theme

## What this edition is
A native block theme with five designed pages, editable core-block patterns,
header/footer parts, global styles, original artwork, and optional demo page XML.
No paid page builder, proprietary service, or remote font is required. It does
not import the developer edition JavaScript. Its signature exploration uses
native expandable Details blocks rather than the source edition's live effects.

## Supported environment and status
Source minimums: WordPress 6.6+ and PHP 8.1+. These are declared requirements,
not a blanket compatibility claim. Consult the shop compatibility record and
clean-install receipt for the exact WordPress/PHP versions actually tested.
This package is a release candidate until that verification is accepted.
Self-hosted WordPress needs permission to upload themes. WordPress.com hosting
plan/upload eligibility must be checked separately; this theme does not provide
a plan or bypass host restrictions. GoDaddy-hosted WordPress is a WordPress host;
GoDaddy Websites + Marketing is a separate product and cannot import this ZIP.

## Install on a fresh or backed-up site
1. Back up the existing site and test in staging. Do not replace an active theme
   on a customer site without reviewing its existing templates, menus, and content.
2. In Appearance → Themes → Add New → Upload Theme, select the separately
   supplied `{slug}-wordpress-v1.0.1.zip`. Install and activate `{f['name']} by Eidos Works`.
3. In Settings → General, set your site title and tagline. In Appearance → Editor,
   open Styles to edit the palette, typography, and spacing. Header site title and
   Navigation are ordinary core blocks. No account or key is needed.
4. Create Pages with these slugs: `home`, {', '.join('`'+file[:-5]+'`' for file,label in f['links'] if file!='index.html')}.
   Set Settings → Reading → a static homepage → Home. The `front-page` template
   provides the designed home. Select the corresponding `{f['name']} — [page]`
   template for each other page. All designed templates are editable in Site Editor.
5. Edit the header Navigation block to match your actual page URLs. Included
   example links assume installation at the domain root. For a subdirectory or
   non-pretty permalink site, select your actual pages from the Navigation editor.
6. Open each template in Appearance → Editor → Design → Templates to change
   its native headings, paragraphs, columns, images, buttons, and Details blocks.
   Select an Image block → Replace → Media Library/Upload for your own artwork.
   Save the template and verify the published frontend.
7. To edit content in the regular Page editor instead, choose the default Page
   template, then insert the matching `{f['name']} — [page]` pattern. Patterns are
   ordinary core blocks after insertion. Do not add both a designed template and
   a full page pattern expecting both to render; the designed template is the layout.

## Optional demo page import
Tools → Import → WordPress uses the free WordPress Importer plugin, installed
only if you choose this route. Import `demo-content.xml`; map the sample creator
to your own account. No attachments or external media are downloaded. Then set
the homepage and review the page-template assignments and navigation as above.
Manual page creation requires no plugin. XML creates page records; designed
content is supplied by the selected native templates, not hidden post HTML.

## Replace before launch
Replace fictional names, contact address `hello@example.com`, sample offerings,
unconfirmed dimensions/amenities/events, and policy notes. Create a real Privacy
Policy page and set its footer link. Contact buttons open email only. Booking,
commerce, ticketing, SMTP, forms, inventory, analytics, and live availability are
not included. Install a suitable plugin/service only if you need it and verify
the complete flow. Do not put secrets in blocks, theme files, or public pages.

## Updates, rollback, and rights
Back up customizations first. Site Editor changes are stored in the WordPress
database and can override bundled templates. Review those saved changes when
installing an update; preserve or export them before resetting a template.
Rollback by restoring the backup or reactivating the previous theme.
All WordPress edition code and original art are GPL-2.0-or-later. Read `LICENSE.txt`,
`COPYING`, `ASSETS.md`, and `SUPPORT.md`. No one-site commercial restriction limits
your GPL rights. Hosting and optional services cost extra.
''')
    write(out/'README.md',f'# {f["name"]} — WordPress block theme 1.0.1\n\nRead [INSTALL.md](INSTALL.md). Core blocks, five editable page designs, shared\nparts, patterns, original art, and no mandatory plugins. Candidate pending\ndeclared clean-install validation. No live payments, booking, or ticket service.\n')

def main():
    for slug,f in FAMILIES.items():
        developer(slug,f)
        wordpress(slug,f)
        print(f'{slug}: 6 linked static pages, native block theme, and guides generated')

if __name__=='__main__': main()
