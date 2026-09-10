"""Run from the repository root after deployment; reads public pages only."""
import html
import json
import pathlib
import re
import urllib.request
from datetime import datetime, timezone

out = pathlib.Path(__file__).parent
article = next(a for a in json.loads(pathlib.Path('src/data/articles.json').read_text(encoding='utf-8')) if a['slug'] == 'accessible-quote-form-errors-recovery')
base = 'https://eidos-works.com'
results = []
pages = {}
for path in [article['canonicalPath'], '/insights/', '/feed.xml', '/sitemap.xml', article['ogImage'], '/', '/playground/', '/work/nighttime-spectaculars/', '/work/holidays-in-hollywood/']:
    with urllib.request.urlopen(base + path, timeout=45) as response:
        text = response.read().decode('utf-8')
        pages[path] = text
        results.append({'path': path, 'status': response.status, 'finalUrl': response.url})
page = pages[article['canonicalPath']]
visible = ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', page)).split())
paragraphs = [p for section in article['body'] for p in section.get('paragraphs', [])]
missing = [p for p in paragraphs if ' '.join(p.split()) not in visible]
assert not missing, f'Missing {len(missing)} body paragraphs'
assert article['byline'] in visible
assert article['slug'] in pages['/insights/']
assert article['slug'] in pages['/feed.xml']
assert article['slug'] in pages['/sitemap.xml']
assert 'id="contact"' in pages['/']
for source in article['sources']:
    assert html.escape(source['url'], quote=True) in page or source['url'] in page
receipt = {'time': datetime.now(timezone.utc).isoformat(), 'passed': True, 'article': article['title'], 'url': base + article['canonicalPath'], 'bodyParagraphsChecked': len(paragraphs), 'byline': article['byline'], 'sourceLinksChecked': len(article['sources']), 'ctaContactAnchor': True, 'pages': results}
(out / 'production-evidence.json').write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8')
print(json.dumps(receipt, indent=2))
