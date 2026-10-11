"""Install the exact four buyer ZIPs, edit content/art, and publish to a local HTTP host.
Run from repo root. No email is sent. --out may point to a larger local volume.
"""
import argparse
import functools
import hashlib
import http.server
import json
import threading
import traceback
import zipfile
from urllib.parse import unquote
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--out', default='artifacts/templates/buyer-install-fixtures')
args = parser.parse_args()
out = Path(args.out).resolve()
out.mkdir(parents=True, exist_ok=True)
catalog = json.loads(Path('products/templates/catalog.json').read_text(encoding='utf-8'))
receipt = {'scope': 'buyer developer source installation; local published HTTP test, no remote deployment or email send', 'checks': [], 'failures': []}

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(out)))
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        for product in catalog['products']:
            slug = product['slug']
            edition = next(e for e in product['editions'] if e['platform'] == 'developer')
            archive = Path(edition['packagePath'])
            before = hashlib.sha256(archive.read_bytes()).hexdigest()
            install = out / slug
            install.mkdir(exist_ok=True)
            try:
                with zipfile.ZipFile(archive) as z:
                    for member in z.infolist():
                        target = (install / member.filename).resolve()
                        if not target.is_relative_to(install):
                            raise ValueError('Unsafe archive traversal')
                    z.extractall(install)
                home = next(install.rglob('index.html'))
                root = home.parent
                # Follow INSTALL.md: keep static HTML and progressive configuration in sync.
                config = root / 'site-config.js'
                raw = config.read_text(encoding='utf-8')
                data = json.loads(raw[raw.index('{'):].rstrip().rstrip(';'))
                original_brand = data['brand']
                data['brand'] = 'QA Studio — installation fixture'
                data['email'] = 'qa@example.com'
                data['pages']['index']['title'] = 'Our edited business, ready to explore.'
                data['pages']['index']['image'] = 'assets/qa-original.svg'
                data['pages']['index']['imageAlt'] = 'QA original circle illustration'
                config.write_text('window.SITE_CONFIG = ' + json.dumps(data) + ';\n', encoding='utf-8')
                (root / 'assets/qa-original.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#e3eee8"/><circle cx="600" cy="400" r="250" fill="#255a47"/></svg>', encoding='utf-8')
                for html in root.glob('*.html'):
                    text = html.read_text(encoding='utf-8').replace(original_brand, data['brand']).replace('hello@example.com', data['email'])
                    html.write_text(text, encoding='utf-8')
                path = home.relative_to(out).as_posix()
                response = page.goto(f'http://127.0.0.1:{server.server_port}/{path}', wait_until='load')
                assert response.status == 200
                assert page.locator('h1').text_content().strip() == data['pages']['index']['title'], 'Edited heading not applied'
                assert page.locator('[data-brand]').first.text_content().strip() == data['brand'], 'Edited brand not applied'
                assert page.locator('[data-hero-image]').get_attribute('src') == 'assets/qa-original.svg'
                assert page.locator('[data-hero-image]').evaluate('(i)=>i.complete&&i.naturalWidth>0')
                response = page.goto(f'http://127.0.0.1:{server.server_port}/{root.relative_to(out).as_posix()}/contact.html', wait_until='load')
                assert response.status == 200
                page.get_by_label('Your name', exact=True).fill('QA install fixture')
                page.get_by_label('Email address', exact=True).fill('qa@example.com')
                page.get_by_label('Your message', exact=True).fill('Local installation test only; no message is sent.')
                page.get_by_role('button', name='Prepare email draft').click()
                link = page.locator('[data-prepared-email]')
                assert link.is_visible() and unquote(link.get_attribute('href')).startswith('mailto:qa@example.com?')
                assert hashlib.sha256(archive.read_bytes()).hexdigest() == before
                receipt['checks'].append({'editionId': edition['id'], 'version': edition.get('version', '1.0.0'), 'archiveSha256': before, 'install': 'passed', 'editedBusiness': 'passed', 'editedImage': 'passed', 'publishedTestPage': 'local HTTP passed', 'mainAction': 'email draft prepared to configured recipient; not sent', 'archiveUnchanged': True})
            except Exception as error:
                receipt['failures'].append({'editionId': edition['id'], 'error': str(error), 'trace': traceback.format_exc()})
        browser.close()
finally:
    server.shutdown()
receipt['result'] = 'passed' if not receipt['failures'] else 'failed'
Path('artifacts/templates/source-install-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8')
print(json.dumps(receipt, indent=2))
raise SystemExit(1 if receipt['failures'] else 0)
