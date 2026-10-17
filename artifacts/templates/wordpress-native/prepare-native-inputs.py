import hashlib, json, pathlib, subprocess, sys, urllib.request, zipfile
from runtime_args import arguments
root, _ = arguments();root.mkdir(parents=True,exist_ok=True)
inputs=[{'name':'php-8.1.34-nts-Win32-vs16-x64.zip','url':'https://downloads.php.net/~windows/releases/php-8.1.34-nts-Win32-vs16-x64.zip','algorithm':'sha256','expected':'9cfe246cb144076c16f5913a3ef88a474c3dd7e60f0f0c8bb95faf68674016cc'},{'name':'wordpress-6.6.zip','url':'https://wordpress.org/wordpress-6.6.zip','algorithm':'sha1','expected':'4db7f3f95508fdb5b75c6985869efb0e53ed42a1'}]
for item in inputs:
    target=root/item['name']
    if not target.exists():
        with urllib.request.urlopen(item['url'],timeout=120) as source,target.open('xb') as dest:
            while chunk:=source.read(1024*1024):dest.write(chunk)
    assert hashlib.file_digest(target.open('rb'),item['algorithm']).hexdigest()==item['expected'],'Official input checksum mismatch'
    item.update({'bytes':target.stat().st_size(),'verified':True,'sha256':hashlib.file_digest(target.open('rb'),'sha256').hexdigest()})
php=root/'php81'
if not php.exists():
    php.mkdir()
    with zipfile.ZipFile(root/inputs[0]['name']) as z:
        for info in z.infolist():assert (php/info.filename).resolve().is_relative_to(php.resolve()),'Unsafe ZIP path'
        z.extractall(php)
helper=pathlib.Path(__file__).resolve().parent/'download-mariadb.py'
result=subprocess.run([sys.executable,str(helper),'--runtime-root',str(root)],check=True,capture_output=True,timeout=180)
(root/'native-inputs-receipt.json').write_text(json.dumps(inputs,indent=2),encoding='utf-8')
print(json.dumps({'inputs':inputs,'mariadb_receipt':'mariadb-download-receipt.json'}),flush=True)
