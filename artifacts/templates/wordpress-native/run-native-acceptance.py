import datetime, hashlib, html.parser, json, pathlib, subprocess, sys, urllib.parse, urllib.request

from runtime_args import arguments
ROOT, SITE = arguments(require_site=True)
PRIVATE=ROOT/'private'
ENV=dict(__import__('os').environ,TEMP=str(ROOT/'tmp'),TMP=str(ROOT/'tmp'))
PRODUCTS=['switchboard','tideglass','matter','nightjar']
def native(slug,phase,*args):
    result=subprocess.run([str(ROOT/'php81'/'php.exe'),'-c',str(ROOT/'php.ini'),str(ROOT/'accept-native.php'),str(PRIVATE/'credentials.json'),slug,phase,*map(str,args)],capture_output=True,timeout=180,creationflags=subprocess.CREATE_NO_WINDOW,env=ENV)
    (PRIVATE/(slug+'-'+phase+'-output.log')).write_bytes(result.stdout+result.stderr)
    if result.returncode:
        print(json.dumps({'product':slug,'phase':phase,'status':'failed','returncode':result.returncode,'private_diagnostic_log':str(PRIVATE/(slug+'-'+phase+'-output.log'))}),flush=True)
        raise RuntimeError('Native phase failed; private diagnostics retained')
    receipt=json.loads(result.stdout)
    (ROOT/'receipts'/(slug+'-'+phase+'.json')).write_text(json.dumps(receipt,indent=2),encoding='utf-8')
    return receipt
class Document(html.parser.HTMLParser):
    def __init__(self): super().__init__(); self.links=[]; self.buttons=[]; self.assets=[]; self.h1=[]; self.in_h1=False; self.details=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='a' and 'href' in a:
            self.links.append(a['href'])
            if 'wp-block-button__link' in a.get('class',''):self.buttons.append(a['href'])
        if tag in ['img','script'] and 'src' in a:self.assets.append(a['src'])
        if tag=='link' and a.get('rel') in ['stylesheet','preload','icon'] and 'href' in a:self.assets.append(a['href'])
        if tag=='h1':self.in_h1=True
        if tag=='details':self.details+=1
    def handle_endtag(self,tag):
        if tag=='h1':self.in_h1=False
    def handle_data(self,data):
        if self.in_h1:self.h1.append(data)
def get(url,mobile=False):
    request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1' if mobile else 'Native WordPress acceptance/1.0'})
    with urllib.request.urlopen(request,timeout=45) as response:return response.status,response.headers,response.read()
def http_check(slug,receipt,phase):
    assert len(set(p['id'] for p in receipt['pages'].values()))==5,'Five pages must have independent records'
    assert len(set(p['url'] for p in receipt['pages'].values()))==5,'Five pages must have independent URLs'
    pages=[];asset_results={};base=receipt['url']; contact_links=[];primary_action=None
    for name,page in receipt['pages'].items():
        url=base+'/' if name=='home' else page['url']
        status,headers,body=get(url);doc=Document();doc.feed(body.decode('utf-8'))
        assert status==200 and doc.h1,(slug,name,'Page did not render')
        assert not b'wp-die-message' in body,(slug,name,'WordPress fatal response')
        if name=='home':
            assert receipt['headline'] in ''.join(doc.h1),'Saved native heading missing'
            assert receipt['image_url'] in doc.assets,'Saved native image missing'
            expected={base+'/' if n=='home' else p['url'] for n,p in receipt['pages'].items()}
            assert expected.issubset({urllib.parse.urljoin(base+'/',link) for link in doc.links}),'Saved navigation missing page URLs'
            assert doc.buttons,'Home primary action missing'
            primary_action=urllib.parse.urljoin(base+'/',doc.buttons[0])
        if name=='contact':
            contact_links=[v for v in doc.links if v.startswith('mailto:')]
            assert any('mailto:'+receipt['contact_email'] in v for v in contact_links),'Saved contact mailto missing'
        for asset in doc.assets:
            target=urllib.parse.urljoin(url,asset)
            if urllib.parse.urlparse(target).netloc!=urllib.parse.urlparse(base).netloc:continue
            if target not in asset_results:
                asset_status,asset_headers,asset_body=get(target)
                assert asset_status==200 and asset_body,'Missing local asset'
                asset_results[target]={'status':asset_status,'bytes':len(asset_body),'sha256':hashlib.sha256(asset_body).hexdigest()}
        pages.append({'page':name,'url':url,'http_status':status,'h1':''.join(doc.h1),'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest(),'native_details_count':doc.details})
    mobile_status,_,mobile_body=get(base+'/',True)
    assert mobile_status==200 and receipt['headline'].encode() in mobile_body
    action_status,_,action_body=get(primary_action);action_doc=Document();action_doc.feed(action_body.decode('utf-8'))
    assert action_status==200,'Home primary action failed'
    contact_action=next((urllib.parse.urljoin(primary_action,v) for v in action_doc.buttons if urllib.parse.urlparse(urllib.parse.urljoin(primary_action,v)).path=='/contact/'),None)
    assert contact_action,'Primary section has no contact action'
    contact_status,_,contact_body=get(contact_action);assert contact_status==200 and ('mailto:'+receipt['contact_email']).encode() in contact_body,'Primary-to-contact action failed'
    summary={'product':slug,'phase':phase,'pages':pages,'all_five_pages_http_200':len(pages)==5,'all_html_referenced_local_assets_http_200':True,'assets':asset_results,'phone_user_agent_html_200':True,'phone_visual_render_test':False,'saved_navigation_links_verified':True,'primary_action_http_chain':[{'url':primary_action,'status':action_status},{'url':contact_action,'status':contact_status},{'target':'mailto:'+receipt['contact_email'],'verified':'href only; not opened or sent'}],'contact_mailto_verified':True,'contact_mailto':contact_links,'email_sent':False,'email_client_opened':False}
    (ROOT/'receipts'/(slug+'-'+phase+'-http.json')).write_text(json.dumps(summary,indent=2),encoding='utf-8')
    return summary

if __name__=='__main__':
    phase=sys.argv[1] if len(sys.argv)>1 else 'install-configure'
    report=json.loads((SITE/'artifacts/templates/package-report.json').read_text(encoding='utf-8'))
    (ROOT/'fixtures').mkdir(exist_ok=True);(ROOT/'exports').mkdir(exist_ok=True)
    for slug in PRODUCTS:
        if phase=='install-configure':
            package=next(p for p in report['packages'] if p['editionId']==slug+'-wordpress-v1')
            assert package['version']=='1.0.2','Inventory not final WP1.0.2'
            archive=SITE/package['packagePath'];assert hashlib.file_digest(archive.open('rb'),'sha256').hexdigest()==package['sha256']
            install_receipt=ROOT/'receipts'/(slug+'-install.json'); config_receipt=ROOT/'receipts'/(slug+'-configure.json')
            installed=json.loads(install_receipt.read_text()) if install_receipt.exists() else native(slug,'install',archive,package['sha256'])
            assert installed['archive_sha256']==package['sha256']
            configured=json.loads(config_receipt.read_text()) if config_receipt.exists() else native(slug,'configure',ROOT/'fixtures'/(slug+'-replacement.png'),ROOT/'exports'/(slug+'-customized-site-editor.zip'))
            http=http_check(slug,configured,'before-restart')
            print(json.dumps({'product':slug,'status':'installed_configured_exported_http_verified','version':installed['version'],'archive_sha256':installed['archive_sha256'],'pages':len(http['pages']),'assets':len(http['assets']),'native_text_image_save':True,'core_site_editor_export':True}),flush=True)
        elif phase=='after-restart':
            configured=json.loads((ROOT/'receipts'/(slug+'-configure.json')).read_text(encoding='utf-8'))
            inspected=native(slug,'inspect'); assert inspected['active_theme']==slug and inspected['version']=='1.0.2' and inspected['media']==1 and inspected['five_designed_pages']==5
            http=http_check(slug,configured,'after-restart')
            print(json.dumps({'product':slug,'status':'restart_persistence_verified','pages':len(http['pages']),'active_theme':inspected['active_theme'],'version':inspected['version'],'native_text_image_navigation_contact_preserved':True}),flush=True)
        else:raise RuntimeError('Unknown acceptance phase')
