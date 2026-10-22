#!/usr/bin/env python3
"""Create one portable review HTML from the versioned, working template sources."""
import base64
import html
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "products/value-templates"
OUTPUT = ROOT / "artifacts/value-templates/Eidos_Affordable_Template_Preview_2026-10-22.html"


def main():
    catalog = json.loads((SOURCE / "catalog.json").read_text())
    documents = {}
    runtime = (SOURCE / "shared/runtime.js").read_text()
    for product in catalog["products"]:
        slug = product["slug"]
        for filename in product["pages"]:
            source = SOURCE / slug
            document = (source / filename).read_text()
            for stylesheet in re.findall(r'<link rel="stylesheet" href="([^"]+)">', document):
                document = document.replace(f'<link rel="stylesheet" href="{stylesheet}">', '<style>' + (source / stylesheet).read_text() + '</style>')
            document = re.sub(r'<script src="[^"]+" defer></script>', '', document)
            for image in re.findall(r'<img[^>]+src="([^"]+)"', document):
                path = source / image
                mime = 'image/webp' if path.suffix == '.webp' else 'image/png'
                data = f'data:{mime};base64,' + base64.b64encode(path.read_bytes()).decode()
                document = document.replace(f'src="{image}"', f'src="{data}"')
            navigation = '''
document.addEventListener('click', event => {
 const link = event.target.closest('a[href]');
 if (!link) return;
 const href = link.getAttribute('href');
 if (/^(index|services|contact)\\.html(?:[?#].*)?$/.test(href)) {
  event.preventDefault(); parent.postMessage({type:'eidos-template-page',href},'*');
 }
});'''
            scripts = '<script>' + (source / 'config.js').read_text() + '</script>'
            scripts += '<script>' + runtime.replace('window.location.search', '(window.TEMPLATE_PREVIEW_QUERY || "")') + '</script>'
            scripts += '<script>' + navigation + '</script>'
            document = document.replace('</body>', scripts + '</body>')
            documents[f'{slug}/{filename}'] = document
    data = json.dumps(documents, ensure_ascii=False).replace('<', '\\u003c')
    products = json.dumps(catalog['products'], ensure_ascii=False).replace('<', '\\u003c')
    page = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Eidos Works — affordable template review</title><style>
*{box-sizing:border-box}:root{font:16px/1.5 Arial,Helvetica,sans-serif;color:#edf2eb;background:#12211f}body{margin:0}header{padding:24px 28px 20px;border-bottom:1px solid #71837a}h1{font:400 clamp(28px,4vw,43px)/1.15 Georgia,serif;margin:0 0 8px}p{margin:5px 0;color:#c8d3ca}nav{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}button{padding:12px 18px;border:1px solid #71837a;background:transparent;color:#edf2eb;font:400 16px/1.3 Arial,Helvetica,sans-serif;cursor:pointer}button[aria-pressed=true]{background:#d0dfa8;color:#12211f;border-color:#d0dfa8}.toolbar{display:flex;justify-content:space-between;gap:15px;align-items:center;flex-wrap:wrap;padding:14px 28px}.toolbar label{display:flex;gap:10px;align-items:center}select{font:16px/1.3 Arial,Helvetica,sans-serif;padding:9px 12px;border:1px solid #71837a;background:#12211f;color:#edf2eb}.stage{max-width:100%;margin:auto;background:white}iframe{display:block;border:0;width:100%;height:calc(100vh - 295px);min-height:560px;background:white}footer{padding:14px 28px;font-size:14px;color:#c8d3ca}:focus-visible{outline:3px solid #d0dfa8;outline-offset:4px}@media(max-width:650px){header{padding:20px}button{padding:11px 12px}.toolbar{padding:12px 20px}iframe{height:70vh;min-height:520px}footer{padding:14px 20px}}
</style></head><body><header><h1>Good design. A smaller starting point.</h1><p>Working template drafts for Eidos Works. Proposed one-time USD prices; not available to purchase.</p><nav aria-label="Choose a template" id="products"></nav></header><div class="toolbar"><span id="scope"></span><label>Page<select id="page" aria-label="Template page"></select></label><label>Preview width<select id="width" aria-label="Preview width"><option value="full">Full width</option><option value="390">390px phone layout</option><option value="320">320px narrow layout</option></select></label></div><div class="stage" id="stage"><iframe id="preview" title="Interactive template preview" sandbox="allow-scripts allow-downloads"></iframe></div><footer id="note">All example businesses are fictional. The form tools prepare local drafts; nothing is sent. Basic source editing is required. Hosting and installation are outside these packages.</footer><script>
const documents=__DOCUMENTS__,products=__PRODUCTS__;
const frame=document.getElementById('preview'),pages=document.getElementById('page');
let selected=products[0];
function showPage(filename,query='',fragment=''){
 const key=selected.slug+'/'+filename;
 if(!Object.hasOwn(documents,key))return;
 pages.value=filename;
 const setup='<script>window.TEMPLATE_PREVIEW_QUERY='+JSON.stringify(query).replace(/</g,'\\u003c')+';<\\/script>';
 const jump=fragment?'<script>document.getElementById('+JSON.stringify(fragment).replace(/</g,'\\u003c')+')?.scrollIntoView();<\\/script>':'';
 frame.srcdoc=documents[key].replace('</head>',setup+'</head>').replace('</body>',jump+'</body>');
 frame.title=selected.name+' interactive template preview';
}
function choose(product){
 selected=product;pages.replaceChildren();
 product.pages.forEach(name=>{const option=document.createElement('option');option.value=name;option.textContent=name==='index.html'?'Home':name.replace('.html','').replace(/^./,s=>s.toUpperCase());pages.appendChild(option)});
 document.querySelectorAll('[data-product]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.product===product.slug)));
 document.getElementById('scope').textContent=product.name+' · $'+product.draftPriceCents/100+' proposed · '+product.kind.replaceAll('-',' ');
 showPage('index.html');
}
products.forEach(product=>{const button=document.createElement('button');button.type='button';button.dataset.product=product.slug;button.textContent=product.name+' · $'+product.draftPriceCents/100;button.addEventListener('click',()=>choose(product));document.getElementById('products').appendChild(button)});
pages.addEventListener('change',()=>showPage(pages.value));
document.getElementById('width').addEventListener('change',event=>{document.getElementById('stage').style.width=event.target.value==='full'?'100%':event.target.value+'px'});
window.addEventListener('message',event=>{
 if(event.source!==frame.contentWindow||event.data?.type!=='eidos-template-page'||typeof event.data.href!=='string')return;
 const match=/^(index|services|contact)\\.html(\\?service=(?:review|plan|support))?(?:#([a-z]+))?$/.exec(event.data.href);
 if(match)showPage(match[1]+'.html',match[2]||'',match[3]||'');
});
choose(products[0]);
</script></body></html>'''
    page = page.replace('__DOCUMENTS__', data).replace('__PRODUCTS__', products)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(page)
    print(f'Portable review: {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)')


if __name__ == '__main__':
    main()
